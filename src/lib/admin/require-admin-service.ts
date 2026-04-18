import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server-admin";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

const ADMIN_ROLES = ["admin", "super_admin"] as const;

export type AdminServiceGate =
  | { ok: true; service: ReturnType<typeof createServiceRoleClient>; userId: string }
  | { ok: false; response: NextResponse };

/** Verifies admin session and returns a service-role client (bypasses RLS / storage policies). */
export async function requireAdminService(): Promise<AdminServiceGate> {
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const service = createServiceRoleClient();
  const { data: caller, error: callerError } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerError) {
    return { ok: false, response: NextResponse.json({ error: callerError.message }, { status: 500 }) };
  }

  if (!caller || !ADMIN_ROLES.includes(caller.role as (typeof ADMIN_ROLES)[number])) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden: not an admin" }, { status: 403 }) };
  }

  return { ok: true, service, userId: user.id };
}
