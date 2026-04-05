"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { withPostAuthVerificationHint } from "@/lib/auth/post-auth-landing";
import { sanitizeOptionalNextPathForAuthCallback } from "@/lib/safe-next-path";

/**
 * Supabase email links must redirect to `/auth/callback` with `?code=` (PKCE). If the dashboard
 * "Redirect URL" is wrong, users land on `/sign-in?code=` or with `#access_token` in the hash
 * (implicit). The callback route only sees query params, so hash-based sessions never exchange.
 * This client pass applies tokens from the hash and sends users to a safe `next` path.
 */
export function RecoverSessionFromUrl({ serverNext }: { serverNext?: string }) {
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || typeof window === "undefined") return;

    const hash = window.location.hash?.replace(/^#/, "") ?? "";
    if (!hash.includes("access_token") || !hash.includes("refresh_token")) return;

    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    ran.current = true;

    const supabase = createClient();
    void (async () => {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) {
        ran.current = false;
        return;
      }

      const fromQuery = searchParams.get("next") ?? undefined;
      const next =
        sanitizeOptionalNextPathForAuthCallback(serverNext) ??
        sanitizeOptionalNextPathForAuthCallback(fromQuery) ??
        "/hi";
      const destination = withPostAuthVerificationHint(next);

      const url = new URL(window.location.href);
      url.hash = "";
      const qp = new URLSearchParams(url.search);
      qp.delete("error");
      qp.delete("next");
      const qs = qp.toString();
      window.history.replaceState(null, "", `${url.pathname}${qs ? `?${qs}` : ""}`);

      window.location.assign(new URL(destination, window.location.origin).href);
    })();
  }, [searchParams, serverNext]);

  return null;
}
