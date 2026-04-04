"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { POST_AUTH_COOKIE_HINT_PARAM } from "@/lib/auth/post-auth-landing";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@supabase/supabase-js";

type HiMode =
  | "loading"
  | "cleared_password"
  | "session_continue"
  | "no_session"
  | "verified_no_cookie";

/**
 * After email confirmation, password signups get a short-lived session; we sign them out so they
 * sign in explicitly with email + password. OAuth (or providers without email_verified) must not
 * follow that path — keep the session and offer Continue instead.
 */
function shouldClearSessionForPasswordSignIn(user: User): boolean {
  const providers = user.identities?.map((i) => i.provider) ?? [];
  const onlyEmailProvider =
    providers.length === 0 || providers.every((p) => p === "email");
  if (!onlyEmailProvider) return false;
  return Boolean(user.email_confirmed_at);
}

export function HiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hinted = searchParams.get(POST_AUTH_COOKIE_HINT_PARAM) === "1";
  const [mode, setMode] = useState<HiMode>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user) {
        if (hinted) {
          setMode("verified_no_cookie");
          const u = new URL(window.location.href);
          u.searchParams.delete(POST_AUTH_COOKIE_HINT_PARAM);
          router.replace(u.pathname + u.search + u.hash);
        } else {
          setMode("no_session");
        }
        return;
      }

      if (shouldClearSessionForPasswordSignIn(user)) {
        await supabase.auth.signOut();
        if (!cancelled) setMode("cleared_password");
        return;
      }

      if (!cancelled) setMode("session_continue");
    })();
    return () => {
      cancelled = true;
    };
  }, [hinted, router]);

  const title =
    mode === "verified_no_cookie"
      ? "Verification succeeded"
      : mode === "session_continue"
        ? "You're all set"
        : mode === "no_session"
          ? "Session expired"
          : "You're verified";

  const lead =
    mode === "verified_no_cookie"
      ? "Please sign in with your email and password. If you expected to stay signed in, this browser may have blocked cookies (for example Safari private mode or strict tracking protection)—try signing in here or use another browser."
      : mode === "cleared_password"
        ? "Your email is confirmed. You can sign in with the same email and password you used to register."
        : mode === "session_continue"
          ? "Your account is ready. Continue to the app — if you still need to finish your profile, we'll take you there next."
          : mode === "no_session"
            ? "We couldn't restore a sign-in session from this page. Use sign in if you already have an account, or register to create one."
            : "Checking your session…";

  const footnote =
    mode === "loading"
      ? "Preparing…"
      : mode === "verified_no_cookie"
        ? "Your email is verified — signing in completes the process."
        : mode === "cleared_password"
          ? "Use the button below to continue."
          : mode === "session_continue"
            ? "You can explore the site while signed in."
            : "Choose an option below.";

  if (mode === "loading") {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-12">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  const primaryCta =
    mode === "cleared_password" || mode === "verified_no_cookie" ? (
      <Link
        href="/sign-in?message=email_verified"
        className="inline-flex w-full sm:w-auto min-w-[220px] items-center justify-center rounded-2xl px-8 py-3.5 text-base font-general font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: "var(--primary-blue)", outlineColor: "var(--accent-gold)" }}
      >
        Sign in
      </Link>
    ) : mode === "session_continue" ? (
      <Link
        href="/discover"
        className="inline-flex w-full sm:w-auto min-w-[220px] items-center justify-center rounded-2xl px-8 py-3.5 text-base font-general font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: "var(--primary-blue)", outlineColor: "var(--accent-gold)" }}
      >
        Continue
      </Link>
    ) : mode === "no_session" ? (
      <Link
        href="/sign-in"
        className="inline-flex w-full sm:w-auto min-w-[220px] items-center justify-center rounded-2xl px-8 py-3.5 text-base font-general font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: "var(--primary-blue)", outlineColor: "var(--accent-gold)" }}
      >
        Sign in
      </Link>
    ) : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 sm:py-16">
      <div className="fixed inset-0 -z-10 bg-[#faf9f6]" />
      <div
        className="fixed inset-0 -z-[9] opacity-[0.45]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(198, 167, 94, 0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 75%, rgba(13, 46, 92, 0.12), transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.9), transparent 70%)",
        }}
      />
      <div
        className="fixed inset-0 -z-[8] opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mb-8 inline-flex items-center justify-center rounded-full border-2 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm" style={{ borderColor: "rgba(198, 167, 94, 0.45)" }}>
          <Sparkles className="h-4 w-4 mr-2" style={{ color: "var(--accent-gold)" }} aria-hidden />
          <span className="text-xs font-bold tracking-[0.2em] uppercase font-general" style={{ color: "var(--primary-blue)" }}>
            Prime Group
          </span>
        </div>

        <div
          className="rounded-[2rem] border-2 bg-white/95 p-8 sm:p-12 shadow-[0_24px_70px_rgba(13,46,92,0.12),0_0_0_1px_rgba(198,167,94,0.15)_inset] backdrop-blur-md"
          style={{ borderColor: "rgba(198, 167, 94, 0.35)" }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "linear-gradient(145deg, rgba(198,167,94,0.18), rgba(13,46,92,0.08))" }}>
            <CheckCircle2 className="h-10 w-10" style={{ color: "var(--accent-gold)" }} strokeWidth={1.75} aria-hidden />
          </div>

          <p className="font-general text-sm font-medium tracking-wide text-[#8B7A5A] uppercase mb-2">
            {mode === "no_session" || mode === "verified_no_cookie"
              ? mode === "verified_no_cookie"
                ? "Email verified"
                : "Almost there"
              : "Thank you for verifying your email"}
          </p>
          <h1 className="font-playfair-display text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--primary-blue)" }}>
            {title}
          </h1>
          <p className="font-general text-base sm:text-lg text-gray-600 leading-relaxed mb-2">{lead}</p>
          <p className="font-general text-sm text-gray-500 mb-10">{footnote}</p>

          <div className="flex flex-col items-center gap-3">
            {primaryCta}
            {(mode === "no_session" || mode === "verified_no_cookie") && (
              <Link
                href="/sign-up"
                className="font-general text-sm font-semibold underline underline-offset-2"
                style={{ color: "var(--primary-blue)" }}
              >
                Create an account
              </Link>
            )}
          </div>

          <p className="mt-8 font-general text-sm text-gray-500">
            <Link href="/" className="underline underline-offset-2 hover:text-[var(--primary-blue)] transition-colors">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
