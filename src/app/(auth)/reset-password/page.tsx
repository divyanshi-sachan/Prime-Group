"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { updatePasswordErrorUserMessage } from "@/lib/auth/auth-callback-errors";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/auth/AuthInput";
import { Spinner } from "@/components/ui/spinner";
import { PASSWORD_REQUIREMENT_HINT, signupPasswordSchema } from "@/lib/auth/password-policy";

const schema = z
  .object({
    password: signupPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function normalizeEmail(e: string | null | undefined): string {
  return (e ?? "").trim().toLowerCase();
}

function decodeRecoveryEmailParam(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recoveryEmailParam = searchParams.get("recovery_email");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const recoveryEmail = decodeRecoveryEmailParam(recoveryEmailParam);

    (async () => {
      let {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        await supabase.auth.refreshSession();
        await new Promise((r) => setTimeout(r, 400));
        if (cancelled) return;
        ({
          data: { user },
        } = await supabase.auth.getUser());
      }

      if (cancelled) return;

      if (!user) {
        setCheckingSession(false);
        router.replace("/sign-in?next=/reset-password");
        return;
      }

      if (recoveryEmail) {
        if (normalizeEmail(user.email) !== normalizeEmail(recoveryEmail)) {
          await supabase.auth.signOut();
          router.replace("/sign-in?error=recovery_wrong_account");
          return;
        }
      }

      setHasSession(true);
      setCheckingSession(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, recoveryEmailParam]);

  const onSubmit = async (data: FormData) => {
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setMessage({ type: "error", text: updatePasswordErrorUserMessage(error) });
      return;
    }
    setMessage({ type: "success", text: "Password updated. Redirecting to sign in..." });
    await supabase.auth.signOut();
    router.push("/sign-in?message=password_reset");
  };

  const loadingView = (
    <div className="absolute inset-0 min-h-screen flex items-center justify-center p-4">
      <Spinner label="Loading..." />
    </div>
  );

  if (checkingSession) {
    return loadingView;
  }

  if (!hasSession) {
    return loadingView;
  }

  return (
    <div className="absolute inset-0 min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl border-2 bg-white/95 backdrop-blur-sm p-8 shadow-xl"
        style={{ borderColor: "var(--accent-gold)" }}
      >
        <h2 className="text-2xl font-playfair-display font-bold text-center mb-2" style={{ color: "var(--primary-blue)" }}>
          Set new password
        </h2>
        <p className="text-sm font-general text-center mb-6 text-gray-600">
          Enter your new password below. You&apos;ll be signed out and can sign in with it.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`p-3 rounded-lg text-sm font-general ${
                message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
              }`}
            >
              {message.text}
            </div>
          )}
          <AuthInput
            type="password"
            name="password"
            placeholder="New password"
            label="New password"
            icon={Lock}
            register={register}
            error={errors.password?.message}
          />
          <p className="text-xs font-general text-gray-600 -mt-2 leading-relaxed">{PASSWORD_REQUIREMENT_HINT}</p>
          <AuthInput
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            label="Confirm new password"
            icon={Lock}
            register={register}
            error={errors.confirmPassword?.message}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label="Update password"
            className="w-full py-2.5 px-4 rounded-lg font-general font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-colors hover:opacity-95"
            style={{ backgroundColor: "var(--primary-blue)" }}
          >
            {isSubmitting ? <Spinner size="sm" /> : "Update password"}
          </button>
        </form>
        <p className="text-center text-sm mt-6 font-general" style={{ color: "var(--primary-blue)" }}>
          <Link href="/sign-in" className="font-medium underline hover:opacity-90" style={{ color: "var(--accent-gold)" }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 min-h-screen flex items-center justify-center p-4">
          <Spinner label="Loading..." />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
