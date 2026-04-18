import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import type { AdminAuthUserListRow } from "@/lib/admin/auth-user-display-fields";

const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 100;

type RpcUserRow = {
  id: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
};

function rowToListShape(r: RpcUserRow): AdminAuthUserListRow {
  return {
    id: r.id,
    email: r.email,
    full_name: null,
    phone: null,
    created_at: r.created_at,
    email_confirmed_at: null,
    last_sign_in_at: r.last_login_at,
    is_anonymous: false,
  };
}

export async function GET(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

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
    const users = pageRows.map(rowToListShape);

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
