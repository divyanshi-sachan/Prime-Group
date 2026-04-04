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
import {
  IndianRupee,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createAdminBrowserClient } from "@/lib/supabase/client-admin";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
}

interface PaymentRow {
  id: string;
  amount: number;
  plan_id: string | null;
  paid_at: string | null;
  created_at: string;
  status: string;
  payment_method: string | null;
}

interface ByPlanRow {
  planId: string | null;
  planName: string;
  sum: number;
  count: number;
  pct: number;
}

interface MonthRow {
  month: string;
  year: number;
  sum: number;
  count: number;
  sortKey?: string;
}

export default function AdminRevenuePage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [pendingUpi, setPendingUpi] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchData = async () => {
    const supabase = createAdminBrowserClient();
    setLoading(true);
    try {
      const [paymentsRes, plansRes, pendingUpiRes] = await Promise.all([
        supabase
          .from("payments")
          .select("id, amount, plan_id, paid_at, created_at, status, payment_method")
          .eq("status", "success"),
        supabase.from("plans").select("id, name"),
        supabase
          .from("payments")
          .select("id, amount, plan_id, created_at, payment_method")
          .eq("status", "pending")
          .eq("payment_method", "upi_qr"),
      ]);
      if (paymentsRes.error) throw paymentsRes.error;
      setPayments((paymentsRes.data ?? []) as PaymentRow[]);
      setPlans((plansRes.data ?? []) as Plan[]);
      setPendingUpi((pendingUpiRes.data ?? []) as PaymentRow[]);
    } catch {
      setPayments([]);
      setPlans([]);
      setPendingUpi([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const now = new Date();
  const thisMonthPayments = payments.filter((p) => {
    const dateStr = p.paid_at || p.created_at;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const lastMonthPayments = payments.filter((p) => {
    const dateStr = p.paid_at || p.created_at;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
  });
  const lastMonthRevenue = lastMonthPayments.reduce((s, p) => s + (p.amount || 0), 0);

  const planMap = new Map(plans.map((pl) => [pl.id, pl.name]));
  const byPlanMap = new Map<string | null, { sum: number; count: number }>();
  payments.forEach((p) => {
    const key = p.plan_id ?? null;
    const cur = byPlanMap.get(key) ?? { sum: 0, count: 0 };
    byPlanMap.set(key, { sum: cur.sum + (p.amount || 0), count: cur.count + 1 });
  });
  const byPlan: ByPlanRow[] = Array.from(byPlanMap.entries()).map(([planId, { sum, count }]) => ({
    planId,
    planName: planId ? planMap.get(planId) ?? `Plan (${planId.slice(0, 8)}…)` : "Other / No plan",
    sum,
    count,
    pct: totalRevenue ? Math.round((sum / totalRevenue) * 100) : 0,
  })).sort((a, b) => b.sum - a.sum);

  const byMonthMap = new Map<string, { sum: number; count: number }>();
  payments.forEach((p) => {
    const dateStr = p.paid_at || p.created_at;
    if (!dateStr) return;
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = byMonthMap.get(key) ?? { sum: 0, count: 0 };
    byMonthMap.set(key, { sum: cur.sum + (p.amount || 0), count: cur.count + 1 });
  });
  const byMonth: MonthRow[] = Array.from(byMonthMap.entries())
    .map(([key, { sum, count }]) => {
      const [y, m] = key.split("-").map(Number);
      const monthName = new Date(y, m - 1, 1).toLocaleString("default", { month: "short" });
      return { month: monthName, year: y, sum, count, sortKey: key };
    })
    .sort((a, b) => (b.sortKey ?? "").localeCompare(a.sortKey ?? ""));

  const maxPlanSum = Math.max(...byPlan.map((p) => p.sum), 1);
  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <IndianRupee className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
            Revenue
          </h1>
          <p className="font-general text-sm mt-1 text-gray-600">
            Revenue stats, breakdown by plan and monthly trend.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl font-general"
          style={{ borderColor: "var(--accent-gold)" }}
          onClick={() => {
            setRefreshing(true);
            fetchData();
          }}
          disabled={refreshing || loading}
        >
          <RefreshCw className={cn("w-4 h-4", (refreshing || loading) ? "animate-spin" : "")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600">Total revenue</p>
                <p className="text-2xl font-bold font-playfair-display mt-1" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : `₹${totalRevenue.toLocaleString()}`}
                </p>
                <p className="text-xs font-general text-gray-500 mt-1">{payments.length} successful payments</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(0, 51, 102, 0.1)" }}>
                <IndianRupee className="w-6 h-6" style={{ color: "var(--primary-blue)" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> This month
                </p>
                <p className="text-2xl font-bold font-playfair-display mt-1" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : `₹${thisMonthRevenue.toLocaleString()}`}
                </p>
                <p className="text-xs font-general text-gray-500 mt-1">{thisMonthPayments.length} payments</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600">Last month</p>
                <p className="text-2xl font-bold font-playfair-display mt-1" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : `₹${lastMonthRevenue.toLocaleString()}`}
                </p>
                <p className="text-xs font-general text-gray-500 mt-1">{lastMonthPayments.length} payments</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-general text-gray-600">Avg. payment</p>
                <p className="text-2xl font-bold font-playfair-display mt-1" style={{ color: "var(--primary-blue)" }}>
                  {loading ? "..." : payments.length ? `₹${Math.round(totalRevenue / payments.length).toLocaleString()}` : "—"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212, 175, 55, 0.2)" }}>
                <CreditCard className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            <BarChart3 className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            Revenue by plan
          </CardTitle>
          <p className="text-sm font-general text-gray-600">Share of total revenue per plan</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-6">
                <Spinner size="md" label="Loading revenue breakdown…" />
              </div>
            ) : byPlan.length === 0 ? (
              <p className="text-sm text-gray-500">No payment data yet.</p>
            ) : (
              byPlan.map((row) => (
                <div key={row.planId ?? "other"} className="space-y-1">
                  <div className="flex justify-between text-sm font-general">
                    <span className="font-medium">{row.planName}</span>
                    <span className="text-gray-600">
                      ₹{row.sum.toLocaleString()} ({row.count} payments · {row.pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(row.sum / maxPlanSum) * 100}%`,
                        backgroundColor: "var(--primary-blue)",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            <Calendar className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            Monthly trend
          </CardTitle>
          <p className="text-sm font-general text-gray-600">Revenue and payment count by month</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-general">Month</TableHead>
                  <TableHead className="font-general text-right">Revenue</TableHead>
                  <TableHead className="font-general text-right">Payments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Spinner size="md" label="Loading monthly data…" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : byMonth.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-gray-500 font-general">
                      No data yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  byMonth.map((row) => (
                    <TableRow key={`${row.year}-${row.month}`} className="font-general">
                      <TableCell className="font-medium">
                        {row.month} {row.year}
                      </TableCell>
                      <TableCell className="text-right">₹{row.sum.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {pendingUpi.length > 0 && (
        <Card className="rounded-xl border shadow-sm" style={cardStyle}>
          <CardHeader>
            <CardTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
              Pending UPI payments
            </CardTitle>
            <p className="text-sm font-general text-gray-600">
              After the user pays via UPI QR, confirm here to add credits to their account.
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-general">Order ID</TableHead>
                    <TableHead className="font-general text-right">Amount</TableHead>
                    <TableHead className="font-general">Created</TableHead>
                    <TableHead className="font-general w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUpi.map((row) => (
                    <TableRow key={row.id} className="font-general">
                      <TableCell className="font-mono text-sm">{row.id.slice(0, 8)}…</TableCell>
                      <TableCell className="text-right">₹{row.amount?.toLocaleString() ?? 0}</TableCell>
                      <TableCell className="text-gray-600">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="rounded-lg font-general"
                          style={{ backgroundColor: "var(--primary-blue)" }}
                          loading={confirmingId === row.id}
                          onClick={async () => {
                            setConfirmingId(row.id);
                            try {
                              const res = await fetch("/api/payments/confirm-upi", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ order_id: row.id }),
                              });
                              if (res.ok) fetchData();
                            } finally {
                              setConfirmingId(null);
                            }
                          }}
                        >
                          {confirmingId === row.id ? "Confirming…" : "Confirm paid"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
