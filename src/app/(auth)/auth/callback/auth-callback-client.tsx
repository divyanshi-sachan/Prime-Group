"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { withPostAuthVerificationHint } from "@/lib/auth/post-auth-landing";
import { sanitizeOptionalNextPath } from "@/lib/safe-next-path";
import { Spinner } from "@/components/ui/spinner";

const CALLBACK_SESSION_API = "/api/auth/callback-session";

/**
 * Email links may use PKCE (`?code=`) or implicit (`#access_token=`). Hash never reaches the
 * server, so this client gate runs first: recover hash sessions here, then full-navigate for code.
 */
export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || typeof window === "undefined") return;

    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (code || (token_hash && type)) {
      ran.current = true;
      window.location.replace(`${CALLBACK_SESSION_API}${window.location.search}`);
      return;
    }

    const hash = window.location.hash?.replace(/^#/, "") ?? "";
    if (hash.includes("access_token") && hash.includes("refresh_token")) {
      ran.current = true;
      void (async () => {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (!access_token || !refresh_token) {
          router.replace("/sign-in?error=auth_callback_error");
          return;
        }
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          ran.current = false;
          router.replace("/sign-in?error=auth_callback_error");
          return;
        }
        const nextRaw = searchParams.get("next");
        const next = sanitizeOptionalNextPath(nextRaw) ?? "/hi";
        const destination = withPostAuthVerificationHint(next);
        const cleanUrl = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, "", cleanUrl);
        router.replace(destination);
        router.refresh();
      })();
      return;
    }

    ran.current = true;
    router.replace("/sign-in?error=auth_callback_error");
  }, [router, searchParams]);

  return (
    <div className="relative min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
      <Spinner label="Completing sign-in…" />
    </div>
  );
}
