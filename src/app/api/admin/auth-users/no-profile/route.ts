import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminServerClient } from "@/lib/supabase/server-admin";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import {
  adminAuthUserRowFromUser,
  type AdminAuthUserListRow,
} from "@/lib/admin/auth-user-display-fields";

const ADMIN_ROLES = ["admin", "super_admin"];
const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 100;
const AUTH_ENRICH_CONCURRENCY = 8;

type RpcUserRow = {
  id: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
};

async function enrichRowsWithAuth(
  service: SupabaseClient,
  rows: RpcUserRow[]
): Promise<AdminAuthUserListRow[]> {
  const out: AdminAuthUserListRow[] = [];
  for (let i = 0; i < rows.length; i += AUTH_ENRICH_CONCURRENCY) {
    const chunk = rows.slice(i, i + AUTH_ENRICH_CONCURRENCY);
    const batch = await Promise.all(
      chunk.map(async (r) => {
        const { data, error } = await service.auth.admin.getUserById(r.id);
        if (error || !data?.user) {
          return {
            id: r.id,
            email: r.email,
            full_name: null,
            phone: null,
            created_at: r.created_at,
            email_confirmed_at: null,
            last_sign_in_at: r.last_login_at,
            is_anonymous: false,
          } satisfies AdminAuthUserListRow;
        }
        const authRow = adminAuthUserRowFromUser(data.user as User);
        return {
          ...authRow,
          last_sign_in_at: authRow.last_sign_in_at ?? r.last_login_at ?? null,
        };
      })
    );
    out.push(...batch);
  }
  return out;
}

export async function GET(request: Request) {
  try {
    const supabase = await createAdminServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceRoleClient();

    const { data: caller, error: callerError } = await service
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (callerError) {
      return NextResponse.json({ error: callerError.message }, { status: 500 });
    }

    if (!caller || !ADMIN_ROLES.includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden: not an admin" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const perPage = Math.min(
      MAX_PER_PAGE,
      Math.max(1, parseInt(searchParams.get("perPage") ?? String(DEFAULT_PER_PAGE), 10) || DEFAULT_PER_PAGE)
    );

    const offset = (page - 1) * perPage;
    const fetchLimit = perPage + 1;

    const { data: rpcRows, error: rpcError } = await service.rpc("admin_users_without_active_profile", {
      p_limit: fetchLimit,
      p_offset: offset,
    });

    if (rpcError) {
      const msg = rpcError.message ?? "";
      const missingFn =
        msg.includes("Could not find the function") ||
        msg.includes("does not exist") ||
        msg.includes("schema cache");
      return NextResponse.json(
        {
          error: missingFn
            ? "Database function admin_users_without_active_profile is missing. Apply migration 20260418130000_admin_users_without_active_profile_fn.sql in the Supabase SQL editor or run supabase db push."
            : msg || "Could not list users without an active profile",
        },
        { status: 500 }
      );
    }

    const rows = (rpcRows ?? []) as RpcUserRow[];
    const hasMore = rows.length > perPage;
    const pageRows = rows.slice(0, perPage);
    const users = await enrichRowsWithAuth(service, pageRows);

    return NextResponse.json({
      users,
      page,
      perPage,
      hasMore,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
