import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import {
  isResendConfigured,
  sendTransactionalEmailResend,
  buildAuthContinueEmail,
  sendSignupConfirmationViaSupabaseSmtp,
} from "@/lib/auth/resend-outbound";

/**
 * Rate limits resend verification (in-memory). Mitigates email bombing; best-effort per server instance.
 * For strict global limits across replicas, persist counts (e.g. Supabase + service role).
 */
export const dynamic = "force-dynamic";

/** Access: **public** — Resend first (magic link from Admin API), then Supabase `auth.resend` (SMTP). */

/** Minimum gap between any resend requests for the same email (ms) — limits failed-call spam too. */
const MIN_REQUEST_GAP_MS = 15_000;
/** Minimum gap between successful resends for the same email (ms). */
const EMAIL_COOLDOWN_MS = 2 * 60 * 1000;
/** Sliding window for IP-based cap (ms). */
const IP_WINDOW_MS = 60 * 60 * 1000;
/** Max successful resends per IP per window (many distinct emails still capped). */
const IP_MAX_RESENDS_PER_WINDOW = 30;

const emailNextAllowedAt = new Map<string, number>();
const emailLastRequestAt = new Map<string, number>();
const ipResendTimestamps = new Map<string, number[]>();

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
  const arr = pruneTimestamps(ipResendTimestamps.get(ip) ?? [], IP_WINDOW_MS);
  ipResendTimestamps.set(ip, arr);
  return arr.length;
}

function recordSuccessfulResend(emailNorm: string, ip: string): void {
  emailNextAllowedAt.set(emailNorm, Date.now() + EMAIL_COOLDOWN_MS);
  const arr = pruneTimestamps(ipResendTimestamps.get(ip) ?? [], IP_WINDOW_MS);
  arr.push(Date.now());
  ipResendTimestamps.set(ip, arr);
}

function retryAfterSec(emailNorm: string): number {
  const until = emailNextAllowedAt.get(emailNorm) ?? 0;
  return Math.max(1, Math.ceil((until - Date.now()) / 1000));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw =
    typeof body === "object" && body !== null && "email" in body ? (body as { email?: unknown }).email : undefined;
  const email = typeof emailRaw === "string" ? emailRaw : "";
  const emailNorm = normalizeEmail(email);
  if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const now = Date.now();

  const nextOk = emailNextAllowedAt.get(emailNorm) ?? 0;
  if (now < nextOk) {
    const sec = retryAfterSec(emailNorm);
    const waitPhrase =
      sec >= 3600 ? "about 1 hour" : sec >= 60 ? `about ${Math.ceil(sec / 60)} minutes` : `${sec} seconds`;
    return NextResponse.json(
      {
        error: `We’ve limited how often we can resend to this address. Please try again in ${waitPhrase}.`,
        code: "rate_limited",
      },
      {
        status: 429,
        headers: { "Retry-After": String(sec) },
      }
    );
  }

  const lastReq = emailLastRequestAt.get(emailNorm) ?? 0;
  if (now - lastReq < MIN_REQUEST_GAP_MS) {
    const waitSec = Math.max(1, Math.ceil((MIN_REQUEST_GAP_MS - (now - lastReq)) / 1000));
    return NextResponse.json(
      {
        error: `Please wait ${waitSec} seconds before requesting another email.`,
        code: "rate_limited",
      },
      { status: 429, headers: { "Retry-After": String(waitSec) } }
    );
  }
  emailLastRequestAt.set(emailNorm, now);

  if (countIpInWindow(ip) >= IP_MAX_RESENDS_PER_WINDOW) {
    return NextResponse.json(
      {
        error:
          "We’ve temporarily limited verification emails from your network. Please try again in about 1 hour.",
        code: "rate_limited_ip",
      },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const emailRedirectTo = `${getSiteUrl()}/auth/callback?next=/hi`;

  let resendPrimaryError: string | null = null;

  if (isResendConfigured()) {
    try {
      const admin = createServiceRoleClient();
      const { data, error } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: emailNorm,
        options: { redirectTo: emailRedirectTo },
      });
      if (!error && data?.properties?.action_link) {
        const { subject, text, html } = buildAuthContinueEmail(data.properties.action_link);
        const sent = await sendTransactionalEmailResend({
          to: emailNorm,
          subject,
          text,
          html,
        });
        if (sent.ok) {
          recordSuccessfulResend(emailNorm, ip);
          return NextResponse.json({ ok: true });
        }
        resendPrimaryError = sent.error;
      } else {
        resendPrimaryError = error?.message ?? "Could not generate verification link";
      }
    } catch {
      resendPrimaryError = "Could not use Resend path (check SUPABASE_SERVICE_ROLE_KEY).";
    }
  }

  const viaSupabase = await sendSignupConfirmationViaSupabaseSmtp(emailNorm, emailRedirectTo);
  if (viaSupabase.ok) {
    recordSuccessfulResend(emailNorm, ip);
    return NextResponse.json({ ok: true });
  }
  if (viaSupabase.cooldownSec) {
    return NextResponse.json(
      { error: viaSupabase.error, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(viaSupabase.cooldownSec) } }
    );
  }

  const message = resendPrimaryError
    ? `${resendPrimaryError} Supabase SMTP: ${viaSupabase.error}`
    : viaSupabase.error;

  return NextResponse.json({ error: message }, { status: 400 });
}
