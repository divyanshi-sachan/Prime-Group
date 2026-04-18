"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import type { SignupProfileFields } from "@/lib/auth/sign-up-fields";
import { signupMetadataFromFields } from "@/lib/auth/sign-up-fields";

/** Supabase built-in mailer often returns this when SMTP is not set or fails. */
export function mapSignUpEmailError(raw: string): string {
  const m = raw.toLowerCase();
  const cooldownMatch = m.match(/after\s+(\d+)\s+seconds?/);
  if (m.includes("for security purposes") && cooldownMatch) {
    return `Please wait ${cooldownMatch[1]} seconds before requesting another verification email.`;
  }
  if (
    m.includes("error sending confirmation email") ||
    m.includes("sending confirmation email") ||
    m.includes("mailer error")
  ) {
    const callback = `${getSiteUrl()}/auth/callback`;
    return `We could not send the confirmation email. When the server has a service role key, we try Resend first, then Supabase SMTP. Fix: (1) Set RESEND_API_KEY and AUTH_EMAIL_FROM for Resend; (2) In Supabase → Authentication → SMTP, configure mail (fallback); (3) Add "${callback}" under Authentication → URL Configuration → Redirect URLs.`;
  }
  return raw;
}

export type MemberSignUpResult =
  | { ok: true; identitiesEmpty: boolean }
  | { ok: false; error: string };

/**
 * Tries server-side sign-up (Resend + Admin generateLink) when configured; otherwise uses Supabase client signUp.
 */
export async function memberSignUp(
  email: string,
  password: string,
  profile: SignupProfileFields
): Promise<MemberSignUpResult> {
  const redirectTarget = `${getSiteUrl()}/auth/callback?next=/hi`;
  const userMeta = signupMetadataFromFields(profile);

  const tryServer = await fetch("/api/auth/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: profile.full_name, phone: profile.phone }),
  });
  const serverPayload = (await tryServer.json().catch(() => ({}))) as {
    ok?: boolean;
    fallback?: boolean;
    error?: string;
  };

  if (tryServer.ok && serverPayload.ok) {
    return { ok: true, identitiesEmpty: false };
  }

  if (tryServer.status !== 501 || !serverPayload.fallback) {
    if (tryServer.status === 409) {
      return {
        ok: false,
        error:
          serverPayload.error ?? "An account with this email already exists. Please log in.",
      };
    }
    if (tryServer.status === 429) {
      return {
        ok: false,
        error:
          serverPayload.error ?? "Too many sign-up attempts. Please wait before trying again.",
      };
    }
    if (serverPayload.error) {
      return { ok: false, error: serverPayload.error };
    }
  }

  const supabase = createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTarget, data: userMeta },
  });

  if (error) {
    const code = "code" in error ? String((error as { code?: string }).code ?? "") : "";
    const rateLimited =
      code === "over_email_send_rate_limit" ||
      (error.message ?? "").toLowerCase().includes("rate limit");
    return {
      ok: false,
      error: rateLimited
        ? "We’ve temporarily limited sending verification emails — please try again in about an hour. If you’re testing, wait before signing up again; for production, add custom SMTP in Supabase (Authentication) for higher limits."
        : mapSignUpEmailError(error.message ?? "Sign up failed"),
    };
  }

  const identitiesEmpty = (signUpData?.user?.identities?.length ?? 0) === 0;
  return { ok: true, identitiesEmpty };
}
