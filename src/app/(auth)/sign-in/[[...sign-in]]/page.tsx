import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { RecoverSessionFromUrl } from "@/components/auth/recover-session-from-url";
import { authFormAccentLinkClass, authHeroAccentLinkClass } from "@/components/auth/auth-accent-link";
import { sanitizeOptionalNextPath } from "@/lib/safe-next-path";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const showPasswordResetSuccess = params.message === "password_reset";
  const showEmailVerified = params.message === "email_verified";
  const showResetLinkExpired = params.error === "reset_link_expired";
  const showAuthCallbackError = params.error === "auth_callback_error";
  const showAuthTimingHint = params.error === "auth_timing";
  const showRecoveryWrongAccount = params.error === "recovery_wrong_account";
  const showAccountRemoved = params.message === "account_removed";
  const next = sanitizeOptionalNextPath(params.next);

  return (
    <div className="min-h-screen w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left: image panel */}
        <div
          className="relative hidden md:flex flex-col justify-between p-10 overflow-hidden"
        >
          <Image
            src="/img/signin.avif"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(13, 46, 92, 0.72), rgba(13, 46, 92, 0.35) 45%, rgba(198, 167, 94, 0.25))",
            }}
          />
          <div className="absolute inset-0 z-[1] bg-black/50" aria-hidden />
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center rounded-xl bg-white/95 px-5 py-3 sm:px-6 sm:py-3.5 shadow-md border border-white/50 backdrop-blur-sm">
              <p
                className="font-harvey-serif text-sm sm:text-base md:text-lg font-semibold uppercase tracking-[0.14em] leading-none"
                style={{ color: "var(--primary-blue)" }}
              >
                Prime Group
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-playfair-display font-bold tracking-tight text-white">
                Welcome back
              </p>
              <p className="text-base text-white/85 font-general leading-relaxed max-w-md">
                Sign in to continue your matchmaking journey.
              </p>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <p className="text-sm text-white/85 font-general">
              New to Prime Group?{" "}
              <Link href="/sign-up" className={authHeroAccentLinkClass}>
                Register free
              </Link>
            </p>
            <div className="h-1 w-40 bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent" />
          </div>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 bg-white">
          <div className="w-full max-w-md">
            <div className="md:hidden mb-6 pb-4 border-b border-gray-200/80 text-center">
              <p
                className="font-harvey-serif text-lg font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--primary-blue)" }}
              >
                Prime Group
              </p>
            </div>

            <div className="mb-7 space-y-2 text-center md:text-left">
              <p className="text-3xl sm:text-4xl font-playfair-display font-bold tracking-tight" style={{ color: "var(--primary-blue)" }}>
                Welcome back
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                Sign in to continue your matchmaking journey.
              </p>
              <p className="text-sm text-gray-500 font-general">
                New to Prime Group?{" "}
                <Link href="/sign-up" className={authFormAccentLinkClass}>
                  Register free
                </Link>
              </p>
            </div>

            {showPasswordResetSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm font-general">
                Password reset successfully. Sign in with your new password.
              </div>
            )}

            {showEmailVerified && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm font-general border border-green-200/80">
                Email verified. Sign in with your email and password to continue.
              </div>
            )}

            {showResetLinkExpired && (
              <div
                className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-950 text-sm font-general border border-amber-200/80"
                role="alert"
              >
                This reset link has expired or was already used.{" "}
                <Link
                  href="/forgot-password"
                  className="font-semibold underline underline-offset-2"
                  style={{ color: "var(--primary-blue)" }}
                >
                  Request a new one
                </Link>
                .
              </div>
            )}

            {showAuthCallbackError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm font-general border border-red-200/80" role="alert">
                We couldn&apos;t finish sign-in from that link (it may be expired or already used). Try again from a
                new email, or sign in with your password. If you still see tokens in the address bar (
                <span className="font-mono text-[11px]">#access_token=</span>), this page will attempt to complete
                sign-in automatically.
              </div>
            )}

            {showAuthTimingHint && (
              <div
                className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-950 text-sm font-general border border-amber-200/80"
                role="alert"
              >
                Sign-in could not be completed—sometimes this is caused by your device date or time being wrong. Check
                that automatic time is enabled, try the link again, or request a new one from your email.
              </div>
            )}

            {showRecoveryWrongAccount && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm font-general border border-red-200/80" role="alert">
                That reset link is for a different account than the one you were signed in with. We signed you out—open
                the reset link again, or{" "}
                <Link href="/forgot-password" className="font-semibold underline underline-offset-2">
                  request a new reset email
                </Link>
                .
              </div>
            )}

            {showAccountRemoved && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-950 text-sm font-general border border-amber-200/80" role="alert">
                Your session didn&apos;t match an active profile (the account may have been removed). Please sign in
                again or create a new account.
              </div>
            )}

            <Suspense fallback={null}>
              <RecoverSessionFromUrl serverNext={next} />
            </Suspense>

            <AuthForm mode="sign-in" hideTitle submitLabel="Sign in" className="max-w-none" next={next} />

            <p className="text-center text-sm mt-8 text-gray-500">
              <Link
                href="/"
                className="hover:text-[var(--primary-blue)] transition-colors duration-200 underline underline-offset-2"
              >
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
