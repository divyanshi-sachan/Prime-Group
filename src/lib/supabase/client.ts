import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEMBER_AUTH_STORAGE_KEY } from "@/lib/supabase/member-session";

/**
 * Single browser client avoids overlapping GoTrue refresh requests that abort each other
 * ("signal is aborted without reason" on mobile / React Strict Mode).
 */
let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (typeof window === "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { name: MEMBER_AUTH_STORAGE_KEY },
      }
    );
  }
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { name: MEMBER_AUTH_STORAGE_KEY },
      }
    );
  }
  return browserClient;
}
