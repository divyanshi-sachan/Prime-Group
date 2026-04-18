import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";

const ADMIN_ROLES = ["admin", "super_admin"];
const ALLOWED_ROLES = ["admin", "super_admin"] as const;
const ALLOWED_PERMISSIONS = [
  "manage_profiles",
  "manage_blogs",
  "manage_faqs",
  "manage_contact",
  "manage_categories",
  "view_revenue",
  "manage_pricing",
  "manage_settings",
  "manage_admins",
] as const;

type PermissionKey = (typeof ALLOWED_PERMISSIONS)[number];

function isPermissionKey(s: string): s is PermissionKey {
  return (ALLOWED_PERMISSIONS as readonly string[]).includes(s);
}

/** List all admin users (admin + super_admin) with profile info */
export async function GET() {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const { data: admins, error } = await service
      .from("users")
      .select(`
        id,
        email,
        role,
        status,
        permissions,
        created_at,
        profiles!profiles_user_id_fkey ( full_name, city, profile_status )
      `)
      .in("role", ADMIN_ROLES)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ admins: admins ?? [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

/** Create or update an admin: set role and permissions for a user. Only admins can call. */
export async function POST(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const body = await request.json().catch(() => ({}));
    const { userId, role, permissions } = body as {
      userId?: string;
      role?: string;
      permissions?: string[];
    };
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    if (!role || !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json({ error: "role must be admin or super_admin" }, { status: 400 });
    }
    const perms =
      Array.isArray(permissions) && permissions.length > 0
        ? permissions.filter(isPermissionKey)
        : [];
    const { error: updateError } = await service
      .from("users")
      .update({
        role,
        permissions: perms,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
