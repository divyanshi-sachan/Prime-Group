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
  Heart,
  BookOpen,
  Activity,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const BREAKDOWN_BAR_COLORS = [
  "var(--primary-blue)",
  "var(--accent-gold)",
  "#059669",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#0891b2",
  "#4f46e5",
];

function CategoryBreakdownPanel({
  rows,
  footnote,
  loading,
}: {
  rows: CategoryCount[];
  footnote?: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="md" label="Loading breakdown…" />
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className="text-sm font-general text-gray-500 py-6 text-center">No profile data yet.</p>;
  }
  return (
    <div className="space-y-4 p-4 sm:p-5">
      {footnote ? (
        <p className="text-sm font-general text-gray-600 leading-relaxed">{footnote}</p>
      ) : null}
      <ul className="space-y-3.5 list-none m-0 p-0">
        {rows.map((row, i) => {
          const barW = row.count > 0 ? Math.max(row.pct, 1) : 0;
          return (
            <li key={row.name} className="space-y-1.5">
              <div className="flex justify-between gap-3 text-sm font-general">
                <span className="font-medium text-gray-900 truncate min-w-0" title={row.name}>
                  {row.name}
                </span>
                <span className="text-gray-600 shrink-0 tabular-nums">
                  <span className="font-semibold text-gray-800">{row.count}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  {row.pct}%
                </span>
              </div>
              <div
                className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden"
                role="presentation"
                aria-hidden
              >
                <div
                  className="h-full rounded-full transition-all duration-500 min-w-px"
                  style={{
                    width: `${Math.min(100, barW)}%`,
                    backgroundColor: BREAKDOWN_BAR_COLORS[i % BREAKDOWN_BAR_COLORS.length],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs font-general text-gray-500 pt-1 border-t border-gray-100">
        Bar length matches share of all profiles (percentages rounded).
      </p>
    </div>
  );
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

      {/* Profile mix: one dimension at a time + share-based bars */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold font-general flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
              <PieChart className="w-5 h-5 shrink-0" style={{ color: "var(--accent-gold)" }} />
              Profile mix
            </h2>
            <p className="text-sm font-general text-gray-600 mt-1 max-w-2xl leading-relaxed">
              See how member profiles split by gender, religion, moderation status, and city. Each percentage is{" "}
              <strong className="font-semibold text-gray-800">share of all profiles</strong> (excluding deleted). Use the tabs
              to switch views—easier than scanning four tables at once.
            </p>
            {!loading && (
              <p className="text-xs font-general text-gray-500 mt-2">
                Base: <span className="font-medium text-gray-700">{stats.totalProfiles.toLocaleString()}</span> profiles
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" className="rounded-lg font-general shrink-0" style={{ borderColor: "var(--accent-gold)" }} asChild>
            <Link href="/admin/categories" className="inline-flex items-center gap-2">
              Full demographics
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <Card className="rounded-xl border shadow-sm overflow-hidden" style={cardStyle}>
          <Tabs defaultValue="gender" className="w-full">
            <div className="border-b px-3 pt-3 sm:px-4 sm:pt-4 bg-gray-50/60" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <TabsList
                className="h-auto w-full flex flex-wrap justify-start gap-1 bg-transparent p-0 pb-3"
                aria-label="Profile breakdown dimension"
              >
                <TabsTrigger
                  value="gender"
                  className="font-general text-xs sm:text-sm rounded-lg border border-transparent px-3 py-2 data-[state=active]:border-[rgba(212,175,55,0.45)] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600"
                >
                  <Heart className="w-3.5 h-3.5 mr-1.5 hidden sm:inline opacity-70" />
                  Gender
                </TabsTrigger>
                <TabsTrigger
                  value="religion"
                  className="font-general text-xs sm:text-sm rounded-lg border border-transparent px-3 py-2 data-[state=active]:border-[rgba(212,175,55,0.45)] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 hidden sm:inline opacity-70" />
                  Religion
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  className="font-general text-xs sm:text-sm rounded-lg border border-transparent px-3 py-2 data-[state=active]:border-[rgba(212,175,55,0.45)] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600"
                >
                  <Activity className="w-3.5 h-3.5 mr-1.5 hidden sm:inline opacity-70" />
                  Status
                </TabsTrigger>
                <TabsTrigger
                  value="city"
                  className="font-general text-xs sm:text-sm rounded-lg border border-transparent px-3 py-2 data-[state=active]:border-[rgba(212,175,55,0.45)] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600"
                >
                  <Building2 className="w-3.5 h-3.5 mr-1.5 hidden sm:inline opacity-70" />
                  Top cities
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="gender" className="mt-0 focus-visible:ring-0">
              <CategoryBreakdownPanel
                loading={loading}
                rows={byGender}
                footnote="Self-reported gender on each profile. “Other” includes blanks or custom values."
              />
            </TabsContent>
            <TabsContent value="religion" className="mt-0 focus-visible:ring-0">
              <CategoryBreakdownPanel
                loading={loading}
                rows={byReligion}
                footnote="Dashboard shows the top 8 religions by count. Open Full demographics for the complete list."
              />
            </TabsContent>
            <TabsContent value="status" className="mt-0 focus-visible:ring-0">
              <CategoryBreakdownPanel
                loading={loading}
                rows={byStatus}
                footnote="Moderation state: pending review, live on the platform, rejected, or suspended."
              />
            </TabsContent>
            <TabsContent value="city" className="mt-0 focus-visible:ring-0">
              <CategoryBreakdownPanel
                loading={loading}
                rows={byCity}
                footnote="Top 6 cities by profile count. “Not specified” means no city was saved."
              />
            </TabsContent>
          </Tabs>
        </Card>
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
