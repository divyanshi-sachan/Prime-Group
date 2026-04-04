/**
 * App Router API access policy
 * ---------------------------
 * Middleware does **not** authenticate `/api/*` (member pages like `/discover/<id>`, `/profile`, … are gated separately).
 * Each route handler must enforce access explicitly — never assume “the client only calls this when logged in”.
 *
 * | Method | Path | Tier | Enforcement in code |
 * |--------|------|------|---------------------|
 * | POST | /api/contact | public | Validated body; **service-role** insert (no session cookie) |
 * | GET | /api/settings/payment-method | public | Service role read `app_settings` |
 * | POST | /api/auth/resend-verification | public | Stateless anon Supabase client + rate limits |
 * | POST | /api/payments/verify | public_hmac | Valid Razorpay HMAC + service role (no user session) |
 * | POST | /api/payments/confirm-upi | admin | `requireAdminApiUser()` |
 * | POST | /api/admin/fixed-login | public_secret | Env-fixed credentials → admin session cookie |
 * | * | /api/admin/* (except fixed-login) | admin | Admin cookie session + `users.role` via service role |
 * | GET | /api/admin/plans | admin | `requireAdminService()` |
 * | PATCH | /api/admin/plans/[id] | admin | `requireAdminService()` |
 * | GET | /api/credits/balance | member_onboarded | `requireUserWithBasicProfile()` |
 * | POST | /api/credits/unlock | member_onboarded | `requireUserWithBasicProfile()` |
 * | POST | /api/payments/create-order | member_onboarded | `requireUserWithBasicProfile()` |
 * | GET | /api/payments/status | member_onboarded | `requireUserWithBasicProfile()` |
 * | GET | /api/profile/progress | member_onboarded | `requireUserWithBasicProfile()` |
 */

import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server-admin";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

const ADMIN_ROLES = ["admin", "super_admin"] as const;

export type RequireAdminApiUserResult =
  | { ok: true; userId: string; role: string }
  | { ok: false; response: NextResponse };

/**
 * Admin API routes use the **admin** auth cookie (`createAdminServerClient`), not the member session.
 */
export async function requireAdminApiUser(): Promise<RequireAdminApiUserResult> {
  const supabase = await createAdminServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const service = createServiceRoleClient();
  const { data: row, error: rowError } = await service.from("users").select("role").eq("id", user.id).single();

  if (rowError || !row) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const role = String((row as { role?: string }).role ?? "");
  if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, userId: user.id, role };
}
