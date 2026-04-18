import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminServerClient } from "@/lib/supabase/server-admin";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { adminAuthUserRowFromUser } from "@/lib/admin/auth-user-display-fields";

const ADMIN_ROLES = ["admin", "super_admin"];
const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 100;

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

    const { data: listData, error: listError } = await service.auth.admin.listUsers({
      page,
      perPage,
    });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const raw = listData?.users ?? [];
    const users = raw.map((u) => adminAuthUserRowFromUser(u as User));

    return NextResponse.json({
      users,
      page,
      perPage,
      /** True if there may be another page (heuristic when total not returned). */
      hasMore: users.length === perPage,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
