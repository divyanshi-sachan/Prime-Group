import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { adminAuthUserRowFromUser } from "@/lib/admin/auth-user-display-fields";

const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 100;

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
