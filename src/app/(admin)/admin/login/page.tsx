"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /** Drop member-site session so admin auth stays isolated (separate cookie prefix + no dual session). */
  useEffect(() => {
    void createClient().auth.signOut();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fixed-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Invalid login credentials");
        setLoading(false);
        return;
      }

      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle at 30% 30%, var(--accent-gold), transparent 60%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle at 40% 40%, var(--primary-blue), transparent 60%)" }}
        />
      </div>

      <div className="bg-white/90 backdrop-blur p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md border relative">
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center p-2"
            style={{ backgroundColor: "var(--primary-blue)" }}
          >
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-playfair-display font-bold mb-2 text-center" style={{ color: "var(--primary-blue)" }}>
          Admin Login
        </h1>
        <p className="text-sm font-general font-medium text-center mb-8 opacity-90" style={{ color: "var(--primary-blue)" }}>
          Prime Group Admin Panel
        </p>

        {error && (
          <div
            className="rounded-xl mb-6 p-4 text-sm font-general font-medium flex items-center gap-2 border border-red-200 bg-red-50 text-red-700"
          >
            <span aria-hidden>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-semibold font-general mb-2" style={{ color: "var(--primary-blue)" }}>
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@primegroupmatrimony.com"
              required
              disabled={loading}
              className="rounded-lg border-gray-200"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold font-general mb-2" style={{ color: "var(--primary-blue)" }}>
              Password
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
                className="rounded-lg pr-10 border-gray-200"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl h-11 font-general font-medium text-white"
            style={{ backgroundColor: "var(--primary-blue)" }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-center font-general text-gray-600 mb-4">
            Can&apos;t log in? Contact the administrator
          </p>
          <a
            href="mailto:support@primegroupmatrimony.com"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:opacity-80"
          >
            <Mail className="w-4 h-4" />
            support@primegroupmatrimony.com
          </a>
        </div>
      </div>
    </div>
  );
}
