"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { AuthInput } from "@/components/auth/AuthInput";
import { Spinner } from "@/components/ui/spinner";
import type { AuthFormData } from "@/components/types/auth";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Pick<AuthFormData, "email">>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Pick<AuthFormData, "email">) => {
    setMessage(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    if (!res.ok) {
      if (res.status === 429) {
        setMessage({
          type: "error",
          text:
            payload.error ??
            "Too many reset requests. Please wait before trying again.",
        });
        return;
      }
      setMessage({
        type: "error",
        text:
          payload.error ??
          "Could not send the reset link. If this keeps happening, check email settings (Resend / Supabase SMTP) and redirect URLs.",
      });
      return;
    }
    setMessage({
      type: "success",
      text: "If an account exists for that email, we sent a password reset link. Check your inbox and spam folder.",
    });
  };

  return (
    <div className="absolute inset-0 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border-2 bg-white/95 backdrop-blur-sm p-8 shadow-xl" style={{ borderColor: "var(--accent-gold)" }}>
        <h2 className="text-2xl font-playfair-display font-bold text-center mb-2" style={{ color: "var(--primary-blue)" }}>
          Forgot password?
        </h2>
        <p className="text-sm font-general text-center mb-6 text-gray-600">
          Enter your email and we&apos;ll send you a link to reset your password.
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
            type="email"
            name="email"
            placeholder="Email"
            label="Email"
            icon={Mail}
            register={register}
            error={errors.email?.message}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label="Send reset link"
            className="w-full py-2.5 px-4 rounded-lg font-general font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-colors hover:opacity-95"
            style={{ backgroundColor: "var(--primary-blue)" }}
          >
            {isSubmitting ? <Spinner size="sm" /> : "Send reset link"}
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
