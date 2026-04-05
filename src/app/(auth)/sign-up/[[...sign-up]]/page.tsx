import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/auth/auth-form";
import { authFormAccentLinkClass, authHeroAccentLinkClass } from "@/components/auth/auth-accent-link";

export default function SignUpPage() {
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
                Create your account
              </p>
              <p className="text-base text-white/85 font-general leading-relaxed max-w-md">
                Build your profile and start discovering compatible matches.
              </p>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <p className="text-sm text-white/85 font-general">
              Already registered?{" "}
              <Link href="/sign-in" className={authHeroAccentLinkClass}>
                Sign in
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
                Create your account
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                India&apos;s trusted matrimony service for meaningful connections.
              </p>
              <p className="text-sm text-gray-500 font-general">
                Already registered?{" "}
                <Link href="/sign-in" className={authFormAccentLinkClass}>
                  Sign in
                </Link>
              </p>
            </div>

            <AuthForm mode="sign-up" hideTitle submitLabel="Register free" className="max-w-none" />

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
