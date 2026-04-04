import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasCompletedBasicProfile } from "@/lib/profile-basic-gate";
import { isProtectedMemberPath } from "@/lib/post-login-redirect";
import { sanitizeOptionalNextPath } from "@/lib/safe-next-path";
import { supabaseNoStoreFetch } from "@/lib/supabase/no-store-fetch";
import { MEMBER_AUTH_STORAGE_KEY } from "@/lib/supabase/member-session";

function redirectPreservingCookies(from: NextResponse, url: URL): NextResponse {
  const res = NextResponse.redirect(url);
  for (const c of from.cookies.getAll()) {
    res.cookies.set(c.name, c.value);
  }
  return res;
}

/**
 * Only run Supabase auth in middleware where we enforce server-side rules.
 * Calling getUser() on every navigation (including RSC/prefetch) adds a round-trip
 * and makes in-app clicks feel slow; the browser client refreshes the session too.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Callback exchanges code / verifies OTP and sets cookies on the redirect response; this request
  // still has the old cookie state. Never treat it as unauthenticated (avoids loops / auth_callback_error).
  if (pathname === "/auth/callback" || pathname.startsWith("/auth/callback/")) {
    return NextResponse.next();
  }

  // If Supabase "Site URL" or redirect allowlist only lists the origin, email links use
  // redirect_to=https://host (no path) and the user lands on /?code=... — exchange never runs.
  // Forward the full query string to /auth/callback (PKCE `code`, optional `state`, etc.).
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && request.nextUrl.searchParams.has("token_hash")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Page routes only: `/api/*` is not gated here — each handler enforces access (see @/lib/api-route-access).
  const isProtected = isProtectedMemberPath(pathname);

  if (!pathname.startsWith("/onboarding") && !isProtected) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: MEMBER_AUTH_STORAGE_KEY },
      global: { fetch: supabaseNoStoreFetch },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    if (isProtected) {
      const safeNext = sanitizeOptionalNextPath(request.nextUrl.pathname);
      if (safeNext) url.searchParams.set("next", safeNext);
    }
    return NextResponse.redirect(url);
  }

  if (isProtected) {
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (userRowError) {
      return supabaseResponse;
    }

    if (!userRow) {
      await supabase.auth.signOut();
      const url = new URL("/sign-in", request.url);
      url.searchParams.set("message", "account_removed");
      const safeNext = sanitizeOptionalNextPath(request.nextUrl.pathname);
      if (safeNext) url.searchParams.set("next", safeNext);
      return redirectPreservingCookies(supabaseResponse, url);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, date_of_birth, gender, contact_number, country, city")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return supabaseResponse;
    }

    if (!profile || !hasCompletedBasicProfile(profile)) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return supabaseResponse;
}
