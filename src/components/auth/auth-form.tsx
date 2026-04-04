"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "./AuthInput";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { getPostLoginRedirect } from "@/lib/post-login-redirect";
import { getSiteUrl } from "@/lib/site";
import type { AuthFormData } from "../types/auth";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = signInSchema.extend({
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms and Privacy Policy" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const linkClass =
  "font-medium underline hover:opacity-90 transition-colors";
const inputErrorClass = "text-red-500 text-sm";

const RESEND_VERIFICATION_COOLDOWN_MS = 60_000;

function verificationResendStorageKey(email: string): string {
  return `pg_verify_resend_until_${email.trim().toLowerCase()}`;
}

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  hideTitle?: boolean;
  submitLabel?: string;
  className?: string;
  /** After sign-in, redirect here if safe (e.g. from /sign-in?next=/favorites) */
  next?: string;
}

export function AuthForm({ mode, hideTitle = false, submitLabel, className, next: nextParam }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  /** Unix ms; until then resend is disabled (client + server-aligned cooldown). */
  const [resendNotBefore, setResendNotBefore] = useState<number | null>(null);
  const [resendCountdownTick, setResendCountdownTick] = useState(0);

  const isSignUp = mode === "sign-up";

  useEffect(() => {
    if (!pendingVerificationEmail || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(verificationResendStorageKey(pendingVerificationEmail));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { until?: number };
      if (typeof parsed.until === "number" && parsed.until > Date.now()) {
        setResendNotBefore(parsed.until);
      }
    } catch {
      // ignore
    }
  }, [pendingVerificationEmail]);

  useEffect(() => {
    if (!resendNotBefore || resendNotBefore <= Date.now()) return;
    const ms = resendNotBefore - Date.now();
    const id = window.setTimeout(() => setResendNotBefore(null), ms);
    return () => window.clearTimeout(id);
  }, [resendNotBefore]);

  useEffect(() => {
    if (!resendNotBefore || resendNotBefore <= Date.now()) return;
    const id = window.setInterval(() => setResendCountdownTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [resendNotBefore]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      rememberMe: false,
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: AuthFormData & { confirmPassword?: string; acceptTerms?: boolean }) => {
    setMessage(null);
    setPendingVerificationEmail(null);
    const supabase = createClient();

    if (isSignUp) {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/hi`,
        },
      });
      if (error) {
        const code = "code" in error ? String((error as { code?: string }).code ?? "") : "";
        const rateLimited =
          code === "over_email_send_rate_limit" ||
          (error.message ?? "").toLowerCase().includes("rate limit");
        setMessage({
          type: "error",
          text: rateLimited
            ? "We’ve temporarily limited sending verification emails — please try again in about an hour. If you’re testing, wait before signing up again; for production, add custom SMTP in Supabase (Authentication) for higher limits."
            : error.message,
        });
        return;
      }

      if (signUpData?.user?.identities?.length === 0) {
        setMessage({ type: "error", text: "An account with this email already exists. Please log in." });
        return;
      }
      setMessage({
        type: "success",
        text: "Check your email for the confirmation link to complete sign up.",
      });
      setPendingVerificationEmail(data.email);
      return;
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      if ((error.message || "").toLowerCase().includes("email not confirmed")) {
        setPendingVerificationEmail(data.email);
      }
      return;
    }
    const user = signInData.user;
    if (!user?.id) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, date_of_birth, gender, contact_number, country, city")
      .eq("user_id", user.id)
      .maybeSingle();
    router.refresh();
    const destination = getPostLoginRedirect(user, { next: nextParam, basicProfile: profile });
    router.push(destination);
  };

  return (
    <div className={cn("w-full", className)}>
      {!hideTitle && (
        <h2 className="text-2xl font-playfair-display font-bold text-center mb-6" style={{ color: "var(--primary-blue)" }}>
          {isSignUp ? "Create your account" : "Sign in"}
        </h2>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`p-3 rounded-lg text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {pendingVerificationEmail && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <span className="text-gray-600">
              Didn&apos;t get the verification email?
            </span>
            <button
              type="button"
              disabled={
                resending ||
                (resendNotBefore !== null && Date.now() < resendNotBefore)
              }
              onClick={async () => {
                if (!pendingVerificationEmail) return;
                setResending(true);
                try {
                  const res = await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: pendingVerificationEmail }),
                  });
                  const data = (await res.json().catch(() => ({}))) as { error?: string };
                  if (!res.ok) {
                    let cooldownMs = 15_000;
                    if (res.status === 429) {
                      const ra = parseInt(res.headers.get("Retry-After") ?? "", 10);
                      if (Number.isFinite(ra)) {
                        cooldownMs = Math.min(3_600_000, Math.max(1_000, ra * 1000));
                      }
                    }
                    const until = Date.now() + cooldownMs;
                    setResendNotBefore(until);
                    try {
                      localStorage.setItem(
                        verificationResendStorageKey(pendingVerificationEmail),
                        JSON.stringify({ until })
                      );
                    } catch {
                      // ignore
                    }
                    setMessage({
                      type: "error",
                      text:
                        data.error ||
                        (res.status === 429
                          ? "We’ve limited how often we can resend. Please try again in about 1 hour."
                          : "Could not resend the email. Try again in a moment."),
                    });
                    return;
                  }
                  const until = Date.now() + RESEND_VERIFICATION_COOLDOWN_MS;
                  setResendNotBefore(until);
                  try {
                    localStorage.setItem(
                      verificationResendStorageKey(pendingVerificationEmail),
                      JSON.stringify({ until })
                    );
                  } catch {
                    // ignore
                  }
                  setMessage({
                    type: "success",
                    text: "Verification email sent again. Please check your inbox/spam.",
                  });
                } finally {
                  setResending(false);
                }
              }}
              className="font-semibold underline underline-offset-2 disabled:opacity-60 disabled:no-underline"
              style={{ color: "var(--accent-gold)" }}
            >
              {resending
                ? "Sending…"
                : (() => {
                    void resendCountdownTick;
                    return resendNotBefore !== null && Date.now() < resendNotBefore
                      ? `Wait ${Math.max(1, Math.ceil((resendNotBefore - Date.now()) / 1000))}s`
                      : "Resend";
                  })()}
            </button>
          </div>
        )}

        <AuthInput
          type="email"
          name="email"
          placeholder="Email"
          label="Email"
          icon={Mail}
          register={register as any}
          error={errors.email?.message as string | undefined}
        />
        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          label="Password"
          icon={Lock}
          register={register as any}
          error={errors.password?.message as string | undefined}
        />

        {isSignUp && (
          <>
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="block w-full pl-10 pr-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent"
                  placeholder="Confirm password"
                />
              </div>
              {(errors as any).confirmPassword && (
                <p className={inputErrorClass}>{(errors as any).confirmPassword.message}</p>
              )}
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                {...register("acceptTerms")}
                className="rounded border-gray-300 mt-1 text-[var(--primary-blue)] focus:ring-[var(--primary-blue)]"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="/terms" className={linkClass} style={{ color: "var(--accent-gold)" }}>Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className={linkClass} style={{ color: "var(--accent-gold)" }}>Privacy Policy</Link>
              </label>
            </div>
            {(errors as any).acceptTerms && (
              <p className={inputErrorClass}>{(errors as any).acceptTerms.message}</p>
            )}
          </>
        )}

        {!isSignUp && (
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="rounded border-gray-300 text-[var(--primary-blue)] focus:ring-[var(--primary-blue)]"
              />
              <span style={{ color: "var(--primary-blue)" }}>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className={linkClass}
              style={{ color: "var(--accent-gold)" }}
            >
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={submitLabel ?? (isSignUp ? "Sign up" : "Sign in")}
          className="w-full py-3 px-4 rounded-lg text-base font-general font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--primary-blue)" }}
        >
          {isSubmitting ? (
            <Spinner size="sm" />
          ) : (
            submitLabel ?? (isSignUp ? "Sign up" : "Sign in")
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "var(--primary-blue)" }}>
        {isSignUp ? "Already have an account? " : "New here? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className={linkClass}
          style={{ color: "var(--accent-gold)" }}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
