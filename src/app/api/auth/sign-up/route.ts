import { NextResponse } from "next/server";
import { z } from "zod";
import { signupPasswordSchema } from "@/lib/auth/password-policy";
import { getSiteUrl } from "@/lib/site";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import {
  isResendConfigured,
  sendTransactionalEmailResend,
  buildSignupConfirmationEmail,
  sendSignupConfirmationViaSupabaseSmtp,
} from "@/lib/auth/resend-outbound";

export const dynamic = "force-dynamic";

/**
 * Public: rate-limited. Creates the user via Admin `generateLink`, then:
 * 1) Sends confirmation via **Resend** when configured
 * 2) Falls back to **Supabase Auth** (`auth.resend` → project SMTP / default mailer)
 * If the service role key is missing, returns 501 so the client uses `signUp` directly.
 */

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: signupPasswordSchema,
});

const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_MAX_SIGNUPS_PER_WINDOW = 25;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_MAX_PER_WINDOW = 5;
/** Per-email cooldown after a successful mail send. */
const EMAIL_COOLDOWN_MS = 2 * 60 * 1000;

const ipSignupTimestamps = new Map<string, number[]>();
const emailSignupTimestamps = new Map<string, number[]>();
const emailNextAllowedAt = new Map<string, number>();

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

function recordSignup(emailNorm: string, ip: string): void {
  const eArr = pruneTimestamps(emailSignupTimestamps.get(emailNorm) ?? [], EMAIL_WINDOW_MS);
  eArr.push(Date.now());
  emailSignupTimestamps.set(emailNorm, eArr);
  const iArr = pruneTimestamps(ipSignupTimestamps.get(ip) ?? [], IP_WINDOW_MS);
  iArr.push(Date.now());
  ipSignupTimestamps.set(ip, iArr);
  emailNextAllowedAt.set(emailNorm, Date.now() + EMAIL_COOLDOWN_MS);
}

function countInWindow(map: Map<string, number[]>, key: string, windowMs: number): number {
  const arr = pruneTimestamps(map.get(key) ?? [], windowMs);
  map.set(key, arr);
  return arr.length;
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
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      (first.email?.[0] as string | undefined) ||
      (first.password?.[0] as string | undefined) ||
      "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const emailNorm = normalizeEmail(parsed.data.email);
  const { password } = parsed.data;
  const ip = getClientIp(request);
  const now = Date.now();

  const nextOk = emailNextAllowedAt.get(emailNorm) ?? 0;
  if (now < nextOk) {
    const sec = retryAfterSec(emailNorm);
    return NextResponse.json(
      {
        error: `Please wait ${sec} seconds before requesting another verification email for this address.`,
        code: "rate_limited",
      },
      { status: 429, headers: { "Retry-After": String(sec) } }
    );
  }

  if (countInWindow(ipSignupTimestamps, ip, IP_WINDOW_MS) >= IP_MAX_SIGNUPS_PER_WINDOW) {
    return NextResponse.json(
      {
        error:
          "Too many sign-up attempts from this network. Please try again in about an hour or contact support.",
      },
      { status: 429 }
    );
  }

  if (countInWindow(emailSignupTimestamps, emailNorm, EMAIL_WINDOW_MS) >= EMAIL_MAX_PER_WINDOW) {
    return NextResponse.json(
      {
        error: "Too many sign-up attempts for this email. Please try again later.",
      },
      { status: 429 }
    );
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json(
      { fallback: true, message: "Use client Supabase sign-up (no service role on server)." },
      { status: 501 }
    );
  }

  const redirectTo = `${getSiteUrl()}/auth/callback?next=/hi`;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email: emailNorm,
    password,
    options: { redirectTo },
  });

  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    if (
      msg.includes("already") ||
      msg.includes("registered") ||
      msg.includes("exists") ||
      msg.includes("duplicate")
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message ?? "Could not start sign-up" }, { status: 400 });
  }

  const actionLink = data?.properties?.action_link;
  const userId = data?.user?.id;
  if (!actionLink || !userId) {
    return NextResponse.json({ error: "Could not create confirmation link." }, { status: 500 });
  }

  let resendError: string | null = null;
  if (isResendConfigured()) {
    const { subject, text, html } = buildSignupConfirmationEmail(actionLink);
    const viaResend = await sendTransactionalEmailResend({
      to: emailNorm,
      subject,
      text,
      html,
    });
    if (viaResend.ok) {
      recordSignup(emailNorm, ip);
      return NextResponse.json({ ok: true });
    }
    resendError = viaResend.error;
  }

  const viaSupabase = await sendSignupConfirmationViaSupabaseSmtp(emailNorm, redirectTo);
  if (viaSupabase.ok) {
    recordSignup(emailNorm, ip);
    return NextResponse.json({ ok: true });
  }
  if (viaSupabase.cooldownSec) {
    await admin.auth.admin.deleteUser(userId).catch(() => {
      /* best-effort rollback */
    });
    return NextResponse.json(
      { error: viaSupabase.error, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(viaSupabase.cooldownSec) } }
    );
  }

  await admin.auth.admin.deleteUser(userId).catch(() => {
    /* best-effort rollback */
  });

  const detail = resendError
    ? `Resend: ${resendError}. Supabase SMTP: ${viaSupabase.error}`
    : `Supabase SMTP: ${viaSupabase.error}`;

  return NextResponse.json(
    {
      error: `Could not send the confirmation email. ${detail}`,
    },
    { status: 502 }
  );
}
