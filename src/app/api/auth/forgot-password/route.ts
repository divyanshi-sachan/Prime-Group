import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteUrl } from "@/lib/site";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import {
  isResendConfigured,
  sendTransactionalEmailResend,
  buildPasswordRecoveryEmail,
  sendPasswordRecoveryViaSupabaseSmtp,
} from "@/lib/auth/resend-outbound";

export const dynamic = "force-dynamic";

/** Public: rate-limited. Resend (Admin recovery link) first, then Supabase `resetPasswordForEmail`. */

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
});

const MIN_REQUEST_GAP_MS = 15_000;
const EMAIL_COOLDOWN_MS = 2 * 60 * 1000;
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_MAX_PER_WINDOW = 40;

const emailNextAllowedAt = new Map<string, number>();
const emailLastRequestAt = new Map<string, number>();
const ipTimestamps = new Map<string, number[]>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function pruneTimestamps(ts: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return ts.filter((t) => t > cutoff);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 128);
  return "unknown";
}

function countIpInWindow(ip: string): number {
  const arr = pruneTimestamps(ipTimestamps.get(ip) ?? [], IP_WINDOW_MS);
  ipTimestamps.set(ip, arr);
  return arr.length;
}

function recordSuccess(emailNorm: string, ip: string): void {
  emailNextAllowedAt.set(emailNorm, Date.now() + EMAIL_COOLDOWN_MS);
  const arr = pruneTimestamps(ipTimestamps.get(ip) ?? [], IP_WINDOW_MS);
  arr.push(Date.now());
  ipTimestamps.set(ip, arr);
}

function retryAfterSec(emailNorm: string): number {
  const until = emailNextAllowedAt.get(emailNorm) ?? 0;
  return Math.max(1, Math.ceil((until - Date.now()) / 1000));
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const emailNorm = normalizeEmail(parsed.data.email);
  const ip = getClientIp(request);
  const now = Date.now();

  const nextOk = emailNextAllowedAt.get(emailNorm) ?? 0;
  if (now < nextOk) {
    const sec = retryAfterSec(emailNorm);
    return NextResponse.json(
      {
        error: `Please wait ${sec} seconds before requesting another reset email for this address.`,
        code: "rate_limited",
      },
      { status: 429, headers: { "Retry-After": String(sec) } }
    );
  }

  const lastReq = emailLastRequestAt.get(emailNorm) ?? 0;
  if (now - lastReq < MIN_REQUEST_GAP_MS) {
    const waitSec = Math.max(1, Math.ceil((MIN_REQUEST_GAP_MS - (now - lastReq)) / 1000));
    return NextResponse.json(
      { error: `Please wait ${waitSec} seconds before trying again.`, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(waitSec) } }
    );
  }
  emailLastRequestAt.set(emailNorm, now);

  if (countIpInWindow(ip) >= IP_MAX_PER_WINDOW) {
    return NextResponse.json(
      {
        error: "Too many reset requests from this network. Please try again in about an hour.",
        code: "rate_limited_ip",
      },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const redirectTo = `${getSiteUrl()}/auth/callback?next=/reset-password`;

  let resendPrimaryError: string | null = null;

  if (isResendConfigured()) {
    try {
      const admin = createServiceRoleClient();
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: emailNorm,
        options: { redirectTo },
      });
      if (!error && data?.properties?.action_link) {
        const { subject, text, html } = buildPasswordRecoveryEmail(data.properties.action_link);
        const sent = await sendTransactionalEmailResend({
          to: emailNorm,
          subject,
          text,
          html,
        });
        if (sent.ok) {
          recordSuccess(emailNorm, ip);
          return NextResponse.json({ ok: true });
        }
        resendPrimaryError = sent.error;
      } else {
        resendPrimaryError = error?.message ?? "Could not generate recovery link";
      }
    } catch {
      resendPrimaryError = "Resend path unavailable (check SUPABASE_SERVICE_ROLE_KEY).";
    }
  }

  const viaSupabase = await sendPasswordRecoveryViaSupabaseSmtp(emailNorm, redirectTo);
  if (viaSupabase.ok) {
    recordSuccess(emailNorm, ip);
    return NextResponse.json({ ok: true });
  }

  if (viaSupabase.cooldownSec) {
    return NextResponse.json(
      { error: viaSupabase.error, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(viaSupabase.cooldownSec) } }
    );
  }

  const raw = viaSupabase.error.toLowerCase();
  if (raw.includes("error sending recovery email") || raw.includes("sending recovery")) {
    const cb = `${getSiteUrl()}/auth/callback`;
    return NextResponse.json(
      {
        error: `Could not send the recovery email. Configure mail: set RESEND_API_KEY + AUTH_EMAIL_FROM, or Supabase → Authentication → SMTP. Add "${cb}" (with query if needed) to Redirect URLs.`,
        code: "mail_misconfigured",
      },
      { status: 502 }
    );
  }

  const detail = resendPrimaryError
    ? `${resendPrimaryError} Supabase: ${viaSupabase.error}`
    : viaSupabase.error;

  return NextResponse.json({ error: detail }, { status: 502 });
}
