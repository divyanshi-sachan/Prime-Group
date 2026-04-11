"use client";

import { useEffect } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * When the session ends in another tab (or storage is cleared), Supabase emits SIGNED_OUT here.
 * Client React trees may still think the user is signed in until we hard-navigate — otherwise
 * protected actions hit the API and fail with 401 with no clear UX.
 */
const SKIP_HARD_NAV_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/auth/",
  "/hi",
  /** Admin login intentionally signs out the member session; do not send users to `/`. */
  "/admin",
] as const;

export function AuthCrossTabSync() {
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event !== "SIGNED_OUT") return;
      if (typeof window === "undefined") return;
      const path = window.location.pathname;
      if (SKIP_HARD_NAV_PREFIXES.some((p) => path.startsWith(p))) return;
      window.location.replace("/");
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
