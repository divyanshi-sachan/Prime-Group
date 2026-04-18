import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export const dynamic = "force-dynamic";

type DashboardPayload = {
  stats: {
    totalUsers: number;
    totalProfiles: number;
    pendingProfiles: number;
    activeProfiles: number;
    newUsersLast7: number;
    newProfilesLast7: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    byPlan: { plan_id: string | null; sum: number }[];
  };
  byGender: { name: string; count: number; pct: number }[];
  byReligion: { name: string; count: number; pct: number }[];
  byStatus: { name: string; count: number; pct: number }[];
  byCity: { name: string; count: number; pct: number }[];
};

function normalizeByPlan(raw: unknown): { plan_id: string | null; sum: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row as { plan_id?: string | null | unknown; sum?: number };
    const rawId = r.plan_id;
    const id = rawId == null || rawId === "" ? null : String(rawId);
    return { plan_id: id, sum: typeof r.sum === "number" ? r.sum : Number(r.sum) || 0 };
  });
}

export async function GET() {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;
  const { service } = gate;

  try {
    const [{ data: payload, error: rpcError }, plansRes] = await Promise.all([
      service.rpc("admin_dashboard_stats_payload"),
      service.from("plans").select("id, name").order("display_order", { ascending: true }),
    ]);

    if (rpcError) {
      const msg = rpcError.message ?? "";
      const missingFn =
        msg.includes("Could not find the function") ||
        msg.includes("does not exist") ||
        msg.includes("schema cache");
      return NextResponse.json(
        {
          error: missingFn
            ? "Database function admin_dashboard_stats_payload is missing. Apply migration 20260418150000_admin_dashboard_stats_payload.sql in the Supabase SQL editor or run supabase db push."
            : msg,
        },
        { status: 500 }
      );
    }

    const body = (payload ?? {}) as Record<string, unknown>;
    const stats = body.stats as DashboardPayload["stats"] | undefined;
    const revenueRaw = body.revenue as Record<string, unknown> | undefined;
    const revenue: DashboardPayload["revenue"] = {
      total: typeof revenueRaw?.total === "number" ? revenueRaw.total : Number(revenueRaw?.total) || 0,
      thisMonth:
        typeof revenueRaw?.thisMonth === "number" ? revenueRaw.thisMonth : Number(revenueRaw?.thisMonth) || 0,
      byPlan: normalizeByPlan(revenueRaw?.byPlan),
    };

    const out: DashboardPayload & { plans: { id: string; name: string }[] } = {
      stats: stats ?? {
        totalUsers: 0,
        totalProfiles: 0,
        pendingProfiles: 0,
        activeProfiles: 0,
        newUsersLast7: 0,
        newProfilesLast7: 0,
      },
      revenue,
      byGender: (body.byGender as DashboardPayload["byGender"]) ?? [],
      byReligion: (body.byReligion as DashboardPayload["byReligion"]) ?? [],
      byStatus: (body.byStatus as DashboardPayload["byStatus"]) ?? [],
      byCity: (body.byCity as DashboardPayload["byCity"]) ?? [],
      plans: (plansRes.data ?? []) as { id: string; name: string }[],
    };

    if (plansRes.error) {
      return NextResponse.json({ error: plansRes.error.message }, { status: 500 });
    }

    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
