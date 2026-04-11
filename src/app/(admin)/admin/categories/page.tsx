"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  RefreshCw,
  Users,
  MapPin,
  Heart,
  BookOpen,
  Flag,
  Activity,
  Building2,
  LayoutGrid,
} from "lucide-react";
import { createAdminBrowserClient } from "@/lib/supabase/client-admin";
import { cn } from "@/lib/utils";

interface CategoryItem {
  name: string;
  count: number;
  pct: number;
}

const BAR_COLORS = [
  "var(--primary-blue)",
  "var(--accent-gold)",
  "#059669",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#0891b2",
  "#4f46e5",
];

function ShareBarRow({
  item,
  colorIndex,
}: {
  item: CategoryItem;
  colorIndex: number;
}) {
  const barW = item.count > 0 ? Math.min(100, Math.max(item.pct, 1)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-3 text-sm font-general">
        <span className="font-medium text-gray-900 truncate min-w-0" title={item.name}>
          {item.name}
        </span>
        <span className="text-gray-600 shrink-0 tabular-nums">
          <span className="font-semibold text-gray-800">{item.count}</span>
          <span className="text-gray-400 mx-1">·</span>
          {item.pct}%
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden" role="presentation" aria-hidden>
        <div
          className="h-full rounded-full transition-all duration-500 min-w-px"
          style={{
            width: `${barW}%`,
            backgroundColor: BAR_COLORS[colorIndex % BAR_COLORS.length],
          }}
        />
      </div>
    </div>
  );
}

function CategoryTable({ labelColumn, data }: { labelColumn: string; data: CategoryItem[] }) {
  if (data.length === 0) {
    return <p className="text-sm font-general text-gray-500 py-4">No rows for this dimension.</p>;
  }
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-general">{labelColumn}</TableHead>
            <TableHead className="font-general text-right w-24">Profiles</TableHead>
            <TableHead className="font-general text-right w-24">Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.name} className="font-general">
              <TableCell className="font-medium max-w-[220px] truncate" title={row.name}>
                {row.name}
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.count}</TableCell>
              <TableCell className="text-right">
                <span className="text-gray-600 tabular-nums">{row.pct}%</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type DimensionId =
  | "gender"
  | "status"
  | "religion"
  | "city"
  | "state"
  | "marital"
  | "mother_tongue";

const DIMENSIONS: {
  id: DimensionId;
  tabLabel: string;
  title: string;
  icon: React.ElementType;
  tableColumn: string;
  description: string;
  slice?: number;
}[] = [
  {
    id: "gender",
    tabLabel: "Gender",
    title: "Gender",
    icon: Heart,
    tableColumn: "Gender",
    description: "How profiles are distributed by gender. “Other” groups empty or non-standard values.",
  },
  {
    id: "status",
    tabLabel: "Status",
    title: "Profile status",
    icon: Activity,
    tableColumn: "Status",
    description: "Moderation pipeline: pending, active (visible), rejected, or suspended.",
  },
  {
    id: "religion",
    tabLabel: "Religion",
    title: "Religion",
    icon: BookOpen,
    tableColumn: "Religion",
    description: "Religious background as saved on the profile. “Not specified” if left blank.",
  },
  {
    id: "city",
    tabLabel: "City",
    title: "City",
    icon: Building2,
    tableColumn: "City",
    description: "City field on the profile. Long tails are normal—sort is by count, highest first.",
    slice: 15,
  },
  {
    id: "state",
    tabLabel: "State",
    title: "State / region",
    icon: MapPin,
    tableColumn: "State",
    description: "State or region. Useful for geographic campaigns and support planning.",
    slice: 15,
  },
  {
    id: "marital",
    tabLabel: "Marital",
    title: "Marital status",
    icon: Heart,
    tableColumn: "Marital status",
    description: "Marital status as entered by members.",
  },
  {
    id: "mother_tongue",
    tabLabel: "Language",
    title: "Mother tongue",
    icon: Flag,
    tableColumn: "Mother tongue",
    description: "First language. Top values shown in the chart; the table lists everyone in the dataset.",
    slice: 12,
  },
];

export default function AdminCategoriesPage() {
  const [profiles, setProfiles] = useState<
    {
      gender: string;
      religion: string | null;
      city: string | null;
      state: string | null;
      profile_status: string;
      marital_status: string | null;
      mother_tongue: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const supabase = createAdminBrowserClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("gender, religion, city, state, profile_status, marital_status, mother_tongue");
      if (error) throw error;
      setProfiles((data ?? []) as typeof profiles);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = profiles.length;
  const toPct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  const byGender = (() => {
    const map = profiles.reduce<Record<string, number>>((acc, p) => {
      const g = p.gender || "other";
      acc[g] = (acc[g] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count, pct: toPct(count) }))
      .sort((a, b) => b.count - a.count);
  })();

  const byReligion = (() => {
    const map = profiles.reduce<Record<string, number>>((acc, p) => {
      const r = p.religion?.trim() || "Not specified";
      acc[r] = (acc[r] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: toPct(count) }))
      .sort((a, b) => b.count - a.count);
  })();

  const byStatus = (() => {
    const statuses = ["pending", "active", "rejected", "suspended"] as const;
    return statuses
      .map((s) => {
        const count = profiles.filter((p) => p.profile_status === s).length;
        return { name: s.charAt(0).toUpperCase() + s.slice(1), count, pct: toPct(count) };
      })
      .filter((s) => s.count > 0);
  })();

  const byCity = (() => {
    const map = profiles.reduce<Record<string, number>>((acc, p) => {
      const c = p.city?.trim() || "Not specified";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: toPct(count) }))
      .sort((a, b) => b.count - a.count);
  })();

  const byState = (() => {
    const map = profiles.reduce<Record<string, number>>((acc, p) => {
      const s = p.state?.trim() || "Not specified";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: toPct(count) }))
      .sort((a, b) => b.count - a.count);
  })();

  const byMarital = (() => {
    const map = profiles.reduce<Record<string, number>>((acc, p) => {
      const m = p.marital_status?.trim() || "Not specified";
      acc[m] = (acc[m] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: toPct(count) }))
      .sort((a, b) => b.count - a.count);
  })();

  const byMotherTongue = (() => {
    const map = profiles.reduce<Record<string, number>>((acc, p) => {
      const m = p.mother_tongue?.trim() || "Not specified";
      acc[m] = (acc[m] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: toPct(count) }))
      .sort((a, b) => b.count - a.count);
  })();

  const dataById: Record<DimensionId, CategoryItem[]> = {
    gender: byGender,
    status: byStatus,
    religion: byReligion,
    city: byCity,
    state: byState,
    marital: byMarital,
    mother_tongue: byMotherTongue,
  };

  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <PieChart className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
            Category breakdown
          </h1>
          <p className="font-general text-sm mt-1 text-gray-600 max-w-2xl leading-relaxed">
            Explore how profiles are distributed. Pick a dimension below; bars show{" "}
            <strong className="font-semibold text-gray-800">true share</strong> of all profiles (not relative to the top row).
            The table underneath matches the same numbers for copying or auditing.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl font-general shrink-0"
          style={{ borderColor: "var(--accent-gold)" }}
          onClick={() => {
            setRefreshing(true);
            fetchData();
          }}
          disabled={refreshing || loading}
        >
          <RefreshCw className={cn("w-4 h-4", refreshing || loading ? "animate-spin" : "")} />
          Refresh
        </Button>
      </div>

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0, 51, 102, 0.1)" }}>
            <Users className="w-6 h-6" style={{ color: "var(--primary-blue)" }} />
          </div>
          <div>
            <p className="text-sm font-general text-gray-600">Total profiles in this report</p>
            <p className="text-2xl font-bold font-playfair-display tabular-nums" style={{ color: "var(--primary-blue)" }}>
              {loading ? "…" : total.toLocaleString()}
            </p>
          </div>
          <div className="w-full sm:w-auto sm:ml-auto sm:text-right">
            <p className="text-xs font-general text-gray-500 flex items-center gap-1.5 sm:justify-end">
              <LayoutGrid className="w-3.5 h-3.5 opacity-60" aria-hidden />
              Share column = percent of total above
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-sm overflow-hidden" style={cardStyle}>
        <Tabs defaultValue="gender" className="w-full">
          <div className="border-b px-3 pt-3 sm:px-5 sm:pt-4 bg-gray-50/70" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
            <p className="text-xs font-general text-gray-500 mb-3 sm:hidden">Swipe tabs horizontally if needed</p>
            <TabsList
              className="h-auto w-full flex flex-wrap justify-start gap-1.5 bg-transparent p-0 pb-3"
              aria-label="Breakdown dimension"
            >
              {DIMENSIONS.map((d) => {
                const Icon = d.icon;
                return (
                  <TabsTrigger
                    key={d.id}
                    value={d.id}
                    className="font-general text-xs sm:text-sm rounded-lg border border-transparent px-2.5 sm:px-3 py-2 data-[state=active]:border-[rgba(212,175,55,0.45)] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600"
                  >
                    <Icon className="w-3.5 h-3.5 mr-1 sm:mr-1.5 opacity-70 hidden sm:inline" />
                    {d.tabLabel}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {DIMENSIONS.map((d) => {
            const full = dataById[d.id];
            const chartRows = d.slice != null ? full.slice(0, d.slice) : full;
            const Icon = d.icon;

            return (
              <TabsContent key={d.id} value={d.id} className="mt-0 focus-visible:ring-0">
                <CardHeader className="pb-2 pt-5 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 font-playfair-display text-xl" style={{ color: "var(--primary-blue)" }}>
                    <Icon className="w-5 h-5 shrink-0" style={{ color: "var(--accent-gold)" }} />
                    {d.title}
                  </CardTitle>
                  <p className="text-sm font-general text-gray-600 mt-2 leading-relaxed">{d.description}</p>
                  {d.slice != null && full.length > d.slice ? (
                    <p className="text-xs font-general text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                      Chart shows top {d.slice} values by count. The table lists all {full.length} distinct values.
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-8 px-4 sm:px-6 pb-6">
                  <div>
                    <h3 className="text-sm font-semibold font-general text-gray-800 mb-3">At a glance</h3>
                    {loading ? (
                      <p className="text-sm font-general text-gray-500 py-8 text-center">Loading…</p>
                    ) : chartRows.length === 0 ? (
                      <p className="text-sm font-general text-gray-500">No data for this dimension.</p>
                    ) : (
                      <div className="space-y-4 max-w-3xl">
                        {chartRows.map((item, i) => (
                          <ShareBarRow key={item.name} item={item} colorIndex={i} />
                        ))}
                      </div>
                    )}
                    {!loading && chartRows.length > 0 ? (
                      <p className="text-xs font-general text-gray-500 mt-4">
                        Bar length = share of all {total.toLocaleString()} profiles (rounded to whole percent).
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold font-general text-gray-800 mb-3">Full table</h3>
                    {loading ? (
                      <p className="text-sm font-general text-gray-500 py-4">Loading…</p>
                    ) : (
                      <CategoryTable labelColumn={d.tableColumn} data={full} />
                    )}
                  </div>
                </CardContent>
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>
    </div>
  );
}
