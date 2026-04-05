"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCircle,
  Image,
  Clock,
  BarChart3,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  PieChart,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

interface RevenueRow {
  total: number;
  thisMonth: number;
  byPlan: { plan_id: string | null; sum: number }[];
}

interface CategoryCount {
  name: string;
  count: number;
  pct: number;
}

interface PlanRow {
  id: string;
  name: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfiles: 0,
    pendingProfiles: 0,
    activeProfiles: 0,
    newUsersLast7: 0,
    newProfilesLast7: 0,
  });
  const [revenue, setRevenue] = useState<RevenueRow>({
    total: 0,
    thisMonth: 0,
    byPlan: [],
  });
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [byGender, setByGender] = useState<CategoryCount[]>([]);
  const [byReligion, setByReligion] = useState<CategoryCount[]>([]);
  const [byStatus, setByStatus] = useState<CategoryCount[]>([]);
  const [byCity, setByCity] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchStats = async () => {
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/dashboard-stats", { credentials: "include" });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        stats?: typeof stats;
        revenue?: RevenueRow;
        plans?: PlanRow[];
        byGender?: CategoryCount[];
        byReligion?: CategoryCount[];
        byStatus?: CategoryCount[];
        byCity?: CategoryCount[];
      };
      if (!res.ok) {
        throw new Error(json.error ?? `Failed to load dashboard (${res.status})`);
      }
      if (json.stats) setStats(json.stats);
      if (json.revenue) setRevenue(json.revenue);
      setPlans(json.plans ?? []);
      setByGender(json.byGender ?? []);
      setByReligion(json.byReligion ?? []);
      setByStatus(json.byStatus ?? []);
      setByCity(json.byCity ?? []);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load dashboard data.");
      setStats({ totalUsers: 0, totalProfiles: 0, pendingProfiles: 0, activeProfiles: 0, newUsersLast7: 0, newProfilesLast7: 0 });
      setRevenue({ total: 0, thisMonth: 0, byPlan: [] });
      setPlans([]);
      setByGender([]);
      setByReligion([]);
      setByStatus([]);
      setByCity([]);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchStats();
  };

  const cardStyle = {
    borderColor: "rgba(212, 175, 55, 0.25)",
    backgroundColor: "white",
  };

  const planName = (planId: string | null) => plans.find((p) => p.id === planId)?.name ?? (planId ? "Unknown plan" : "Other");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <BarChart3 className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
            Prime Group — Admin Dashboard
          </h1>
          <p className="font-general text-sm mt-1 text-gray-600">
            Live overview of profiles, revenue, and platform activity.
          </p>
          {lastUpdated && (
            <p className="font-general text-xs mt-1 text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()} — {lastUpdated.toLocaleDateString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl font-general"
          style={{ borderColor: "var(--accent-gold)" }}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {fetchError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-general text-sm text-amber-800">
          {fetchError}
        </div>
      )}

      {/* Recent activity */}
      {!loading && (stats.newUsersLast7 > 0 || stats.newProfilesLast7 > 0) && (
        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="py-4 px-5 flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-general text-sm font-medium">
              <span style={{ color: "var(--primary-blue)" }}>This week</span>
              <span className="text-gray-700">{stats.newUsersLast7} new user{stats.newUsersLast7 !== 1 ? "s" : ""}</span>
              <span className="text-gray-700">{stats.newProfilesLast7} new profile{stats.newProfilesLast7 !== 1 ? "s" : ""}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600">Total Users</p>
                <p className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : stats.totalUsers}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 51, 102, 0.1)" }}>
                <Users className="w-5 h-5" style={{ color: "var(--primary-blue)" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600">Total Profiles</p>
                <p className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : stats.totalProfiles}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(226, 194, 133, 0.3)" }}>
                <UserCircle className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600">Pending</p>
                <p className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : stats.pendingProfiles}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600">Active</p>
                <p className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : stats.activeProfiles}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue stats */}
      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            <IndianRupee className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            Revenue
          </CardTitle>
          <p className="text-sm font-general text-gray-600">Payment totals and breakdown by plan</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg p-4 bg-gray-50 border border-gray-100">
              <p className="text-sm font-general font-medium text-gray-600">Total revenue</p>
              <p className="text-xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
                {loading ? "..." : `₹${revenue.total.toLocaleString()}`}
              </p>
            </div>
            <div className="rounded-lg p-4 bg-gray-50 border border-gray-100">
              <p className="text-sm font-general font-medium text-gray-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> This month
              </p>
              <p className="text-xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
                {loading ? "..." : `₹${revenue.thisMonth.toLocaleString()}`}
              </p>
            </div>
            <div className="rounded-lg p-4 bg-gray-50 border border-gray-100">
              <p className="text-sm font-general font-medium text-gray-600">By plan</p>
              <div className="text-sm font-general mt-1 space-y-0.5">
                {loading ? "..." : revenue.byPlan.length === 0 ? "No payments yet" : revenue.byPlan.map(({ plan_id, sum }) => (
                  <div key={plan_id ?? "none"}>
                    {planName(plan_id)}: ₹{sum.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown: four separate cards with clear tables */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold font-general flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <PieChart className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            Category breakdown
          </h2>
          <p className="text-sm font-general text-gray-600 mt-0.5">Profile counts by different dimensions. Each block is a separate summary.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          <Card className="rounded-xl border shadow-sm overflow-hidden" style={cardStyle}>
            <CardHeader className="py-3 px-4 border-b bg-gray-50/80" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <CardTitle className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
                By gender
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm font-general">
                <thead>
                  <tr className="border-b bg-gray-50/50" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-20">Count</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-14">%</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="py-6 px-4"><div className="flex justify-center py-2"><Spinner size="sm" label="Loading" /></div></td></tr>
                  ) : byGender.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 px-4 text-gray-500">No data</td></tr>
                  ) : (
                    byGender.map((g) => (
                      <tr key={g.name} className="border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                        <td className="py-2 px-4 font-medium text-gray-800 truncate max-w-[160px]" title={g.name}>{g.name}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{g.count}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{g.pct}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm overflow-hidden" style={cardStyle}>
            <CardHeader className="py-3 px-4 border-b bg-gray-50/80" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <CardTitle className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
                By religion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm font-general">
                <thead>
                  <tr className="border-b bg-gray-50/50" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-20">Count</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-14">%</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="py-6 px-4"><div className="flex justify-center py-2"><Spinner size="sm" label="Loading" /></div></td></tr>
                  ) : byReligion.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 px-4 text-gray-500">No data</td></tr>
                  ) : (
                    byReligion.map((r) => (
                      <tr key={r.name} className="border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                        <td className="py-2 px-4 font-medium text-gray-800 truncate max-w-[140px]" title={r.name}>{r.name}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{r.count}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{r.pct}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm overflow-hidden" style={cardStyle}>
            <CardHeader className="py-3 px-4 border-b bg-gray-50/80" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <CardTitle className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
                By status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm font-general">
                <thead>
                  <tr className="border-b bg-gray-50/50" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-20">Count</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-14">%</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="py-6 px-4"><div className="flex justify-center py-2"><Spinner size="sm" label="Loading" /></div></td></tr>
                  ) : byStatus.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 px-4 text-gray-500">No data</td></tr>
                  ) : (
                    byStatus.map((s) => (
                      <tr key={s.name} className="border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                        <td className="py-2 px-4 font-medium text-gray-800">{s.name}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{s.count}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{s.pct}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm overflow-hidden" style={cardStyle}>
            <CardHeader className="py-3 px-4 border-b bg-gray-50/80" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <CardTitle className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
                By city (top 6)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm font-general">
                <thead>
                  <tr className="border-b bg-gray-50/50" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <th className="text-left py-2.5 px-4 font-semibold text-gray-700">City</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-20">Count</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700 w-14">%</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="py-6 px-4"><div className="flex justify-center py-2"><Spinner size="sm" label="Loading" /></div></td></tr>
                  ) : byCity.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 px-4 text-gray-500">No data</td></tr>
                  ) : (
                    byCity.map((c) => (
                      <tr key={c.name} className="border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                        <td className="py-2 px-4 font-medium text-gray-800 truncate max-w-[120px]" title={c.name}>{c.name}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{c.count}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-700">{c.pct}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            <Image className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            Quick Actions
          </CardTitle>
          <p className="text-sm font-general text-gray-600">Shortcuts to main admin sections</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Button
              variant="outline"
              className="h-auto min-h-14 rounded-xl font-general hover:scale-[1.02] transition-transform"
              style={{ borderColor: "var(--accent-gold)" }}
              asChild
            >
              <Link href="/admin/profiles">
                <div className="w-full flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary-blue)" }} />
                    <span className="truncate">Manage Profiles</span>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-14 rounded-xl font-general hover:scale-[1.02] transition-transform"
              style={{ borderColor: "var(--accent-gold)" }}
              asChild
            >
              <Link href="/admin/categories">
                <div className="w-full flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PieChart className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary-blue)" }} />
                    <span className="truncate">Categories</span>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-14 rounded-xl font-general hover:scale-[1.02] transition-transform"
              style={{ borderColor: "var(--accent-gold)" }}
              asChild
            >
              <Link href="/admin/revenue">
                <div className="w-full flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <IndianRupee className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary-blue)" }} />
                    <span className="truncate">Revenue</span>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-14 rounded-xl font-general hover:scale-[1.02] transition-transform"
              style={{ borderColor: "var(--accent-gold)" }}
              asChild
            >
              <Link href="/admin/pricing">
                <div className="w-full flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <IndianRupee className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary-blue)" }} />
                    <span className="truncate">Pricing</span>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-14 rounded-xl font-general hover:scale-[1.02] transition-transform"
              style={{ borderColor: "var(--accent-gold)" }}
              asChild
            >
              <Link href="/admin/settings">
                <div className="w-full flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <BarChart3 className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary-blue)" }} />
                    <span className="truncate">Settings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
