import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export const dynamic = "force-dynamic";

const PAGE = 1000;

async function fetchAllRows<T extends Record<string, unknown>>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  for (;;) {
    const to = from + PAGE - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw new Error(error.message);
    const chunk = data ?? [];
    out.push(...chunk);
    if (chunk.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

export async function GET() {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;
  const { service } = gate;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [
      usersCountRes,
      profilesTotalRes,
      profilesPendingRes,
      profilesActiveRes,
      usersLast7Res,
      profilesLast7Res,
      plansRes,
    ] = await Promise.all([
      service.from("users").select("*", { count: "exact", head: true }),
      service.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null),
      service
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("profile_status", "pending"),
      service
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("profile_status", "active"),
      service.from("users").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      service
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("created_at", sevenDaysAgo),
      service.from("plans").select("id, name").order("display_order", { ascending: true }),
    ]);

    const countErr =
      usersCountRes.error ||
      profilesTotalRes.error ||
      profilesPendingRes.error ||
      profilesActiveRes.error ||
      usersLast7Res.error ||
      profilesLast7Res.error ||
      plansRes.error;
    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    const profiles = await fetchAllRows<{
      profile_status: string;
      gender: string | null;
      religion: string | null;
      city: string | null;
    }>(async (from, to) =>
      service
        .from("profiles")
        .select("profile_status, gender, religion, city")
        .is("deleted_at", null)
        .range(from, to)
    );

    const totalProfiles = profilesTotalRes.count ?? profiles.length;
    const pendingProfiles = profilesPendingRes.count ?? 0;
    const activeProfiles = profilesActiveRes.count ?? 0;

    const payments = await fetchAllRows<{
      amount: number;
      paid_at: string | null;
      plan_id: string | null;
      created_at: string;
    }>(async (from, to) =>
      service
        .from("payments")
        .select("amount, paid_at, plan_id, created_at")
        .eq("status", "success")
        .range(from, to)
    );

    const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const now = new Date();
    const thisMonth = payments
      .filter((p) => {
        const dateStr = p.paid_at || p.created_at;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + (p.amount || 0), 0);

    const byPlanMap = new Map<string | null, number>();
    payments.forEach((p) => {
      const key = p.plan_id ?? null;
      byPlanMap.set(key, (byPlanMap.get(key) ?? 0) + (p.amount || 0));
    });

    const toPct = (n: number) => (totalProfiles ? Math.round((n / totalProfiles) * 100) : 0);

    const genderCounts = Object.entries(
      profiles.reduce<Record<string, number>>((acc, p) => {
        const g = p.gender || "other";
        acc[g] = (acc[g] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      pct: toPct(count),
    }));

    const religionCounts = Object.entries(
      profiles.reduce<Record<string, number>>((acc, p) => {
        const r = p.religion || "Not specified";
        acc[r] = (acc[r] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, pct: toPct(count) }));

    const rejected = profiles.filter((p) => p.profile_status === "rejected").length;
    const suspended = profiles.filter((p) => p.profile_status === "suspended").length;

    const byStatus = [
      { name: "Pending", count: pendingProfiles, pct: toPct(pendingProfiles) },
      { name: "Active", count: activeProfiles, pct: toPct(activeProfiles) },
      { name: "Rejected", count: rejected, pct: toPct(rejected) },
      { name: "Suspended", count: suspended, pct: toPct(suspended) },
    ].filter((s) => s.count > 0);

    const cityCounts = Object.entries(
      profiles.reduce<Record<string, number>>((acc, p) => {
        const c = p.city?.trim() || "Not specified";
        acc[c] = (acc[c] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, pct: toPct(count) }));

    return NextResponse.json({
      stats: {
        totalUsers: usersCountRes.count ?? 0,
        totalProfiles,
        pendingProfiles,
        activeProfiles,
        newUsersLast7: usersLast7Res.count ?? 0,
        newProfilesLast7: profilesLast7Res.count ?? 0,
      },
      revenue: {
        total: totalRevenue,
        thisMonth,
        byPlan: Array.from(byPlanMap.entries()).map(([plan_id, sum]) => ({ plan_id, sum })),
      },
      plans: plansRes.data ?? [],
      byGender: genderCounts.sort((a, b) => b.count - a.count),
      byReligion: religionCounts.sort((a, b) => b.count - a.count).slice(0, 8),
      byStatus,
      byCity: cityCounts.sort((a, b) => b.count - a.count).slice(0, 6),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
