import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";

const ADMIN_STATUSES = ["all", "pending", "active", "rejected", "suspended"] as const;
const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 100;

function escapeIlike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const { searchParams } = new URL(request.url);
    const page = Math.max(DEFAULT_PAGE, parseInt(searchParams.get("page") ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
    const perPage = Math.min(
      MAX_PER_PAGE,
      Math.max(1, parseInt(searchParams.get("perPage") ?? String(DEFAULT_PER_PAGE), 10) || DEFAULT_PER_PAGE)
    );
    const statusRaw = (searchParams.get("status") ?? "all").toLowerCase();
    const status = ADMIN_STATUSES.includes(statusRaw as (typeof ADMIN_STATUSES)[number])
      ? statusRaw
      : "all";
    const search = (searchParams.get("search") ?? "").trim();

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = service
      .from("profiles")
      .select(
        "id, user_id, full_name, gender, city, profile_status, profile_completion_pct, created_at, contact_number",
        { count: "exact" }
      )
      .is("deleted_at", null);

    if (status !== "all") {
      query = query.eq("profile_status", status);
    }

    if (search.length > 0) {
      const pct = `%${escapeIlike(search)}%`;
      query = query.or(`full_name.ilike.${pct},city.ilike.${pct},contact_number.ilike.${pct}`);
    }

    const { data: profiles, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows =
      (profiles as {
        id: string;
        user_id: string;
        full_name: string | null;
        gender: string | null;
        city: string | null;
        profile_status: string | null;
        profile_completion_pct: number | null;
        created_at: string;
        contact_number?: string | null;
      }[]) ?? [];

    const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
    const emailByUserId = new Map<string, string>();
    if (userIds.length) {
      const { data: users, error: usersError } = await service.from("users").select("id, email").in("id", userIds);
      if (usersError) {
        return NextResponse.json({ error: usersError.message }, { status: 500 });
      }
      for (const u of (users ?? []) as { id: string; email: string }[]) {
        emailByUserId.set(u.id, u.email);
      }
    }

    const enriched = rows.map((p) => ({
      ...p,
      users: emailByUserId.has(p.user_id) ? { email: emailByUserId.get(p.user_id)! } : null,
    }));

    return NextResponse.json({
      profiles: enriched,
      total: count ?? 0,
      page,
      perPage,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
