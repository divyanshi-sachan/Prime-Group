import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  AUTH_CALLBACK_RETRY_DELAY_MS,
  authCallbackFailureIsTimingLikely,
  authCallbackFailureMayBeDuplicateHit,
  authExchangeErrorShouldRetry,
  isStaleOrInvalidAuthLinkError,
} from "@/lib/auth/auth-callback-errors";
import { pathnameOnly, withPostAuthVerificationHint } from "@/lib/auth/post-auth-landing";
import { getPostLoginRedirect } from "@/lib/post-login-redirect";
import {
  sanitizeNextPath,
  sanitizeOptionalNextPathForAuthCallback,
} from "@/lib/safe-next-path";
import { MEMBER_AUTH_STORAGE_KEY } from "@/lib/supabase/member-session";
import type { SupabaseClient } from "@supabase/supabase-js";

/** After recovery exchange, tag redirect so /reset-password can verify session matches the reset target. */
async function finalizeAuthSuccessRedirect(
  redirectResponse: NextResponse,
  next: string,
  origin: string,
  supabase: SupabaseClient
): Promise<NextResponse> {
  if (pathnameOnly(next) !== "/reset-password") return redirectResponse;
  const {
    data: { user: recoveryUser },
  } = await supabase.auth.getUser();
  if (recoveryUser?.email) {
    const loc = new URL(next, origin);
    loc.searchParams.set("recovery_email", recoveryUser.email);
    redirectResponse.headers.set("Location", loc.toString());
  }
  return redirectResponse;
}

function isPasswordResetCallback(next: string, type: EmailOtpType | null): boolean {
  return pathnameOnly(next) === "/reset-password" || type === "recovery";
}

/** Sign-up confirmation emails use `next=/hi` (see AuthForm / useAuth). */
function isSignupEmailVerificationCallback(next: string): boolean {
  return pathnameOnly(next) === "/hi";
}

function redirectAuthCallbackFailure(
  origin: string,
  next: string,
  type: EmailOtpType | null,
  err: { code?: string; message?: string } | null
) {
  if (!err) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
  }
  if (authCallbackFailureIsTimingLikely(err)) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_timing`);
  }
  if (!isStaleOrInvalidAuthLinkError(err)) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
  }
  if (isPasswordResetCallback(next, type)) {
    const url = new URL("/sign-in", origin);
    url.searchParams.set("error", "reset_link_expired");
    return NextResponse.redirect(url);
  }
  if (isSignupEmailVerificationCallback(next)) {
    const url = new URL("/sign-in", origin);
    url.searchParams.set("message", "email_verified");
    return NextResponse.redirect(url);
  }
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
}

/**
 * Server-side PKCE / OTP exchange. Invoked via full navigation from `/auth/callback` so implicit
 * flows can use the page (hash is never sent to the server).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextRaw = searchParams.get("next");
  const nextForFailure = sanitizeNextPath(sanitizeOptionalNextPathForAuthCallback(nextRaw));

  const redirectSuccess = NextResponse.redirect(new URL(nextForFailure, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: MEMBER_AUTH_STORAGE_KEY },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectSuccess.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let authError: { code?: string; message?: string; status?: number } | null = null;

  if (code) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return await completeAuthCallbackRedirect(
          redirectSuccess,
          nextRaw,
          origin,
          supabase
        );
      }
      authError = error;
      if (!authExchangeErrorShouldRetry(error, attempt)) break;
      await new Promise((r) => setTimeout(r, AUTH_CALLBACK_RETRY_DELAY_MS));
    }
  } else if (token_hash && type) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      if (!error) {
        return await completeAuthCallbackRedirect(
          redirectSuccess,
          nextRaw,
          origin,
          supabase
        );
      }
      authError = error;
      if (!authExchangeErrorShouldRetry(error, attempt)) break;
      await new Promise((r) => setTimeout(r, AUTH_CALLBACK_RETRY_DELAY_MS));
    }
  } else {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
  }

  if (authError && authCallbackFailureMayBeDuplicateHit(authError)) {
    const {
      data: { user: existingUser },
    } = await supabase.auth.getUser();
    if (existingUser) {
      return await completeAuthCallbackRedirect(
        redirectSuccess,
        nextRaw,
        origin,
        supabase
      );
    }
  }

  return redirectAuthCallbackFailure(origin, nextForFailure, type, authError);
}

async function completeAuthCallbackRedirect(
  redirectResponse: NextResponse,
  nextRaw: string | null,
  origin: string,
  supabase: SupabaseClient
): Promise<NextResponse> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirectResponse.headers.set("Location", `${origin}/sign-in?error=auth_callback_error`);
    return redirectResponse;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, gender, contact_number, country, city")
    .eq("user_id", user.id)
    .maybeSingle();

  const safeNext = sanitizeOptionalNextPathForAuthCallback(nextRaw);
  const destination = withPostAuthVerificationHint(
    getPostLoginRedirect(user, { next: safeNext ?? null, basicProfile: profile })
  );
  redirectResponse.headers.set("Location", new URL(destination, origin).toString());
  return finalizeAuthSuccessRedirect(redirectResponse, destination, origin, supabase);
}
