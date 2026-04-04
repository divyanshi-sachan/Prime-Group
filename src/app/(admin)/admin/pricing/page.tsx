"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IndianRupee, Pencil, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_inr: number;
  duration_days: number | null;
  credits: number | null;
  is_active: boolean;
  display_order: number | null;
}

type DurationMode = "lifetime" | "limited";

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price_inr: 0,
    duration_mode: "limited" as DurationMode,
    duration_days: 30,
    credits: 10,
    is_active: true,
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as { plans?: Plan[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Failed to load plans (${res.status})`);
      }
      setPlans(data.plans ?? []);
    } catch (e) {
      setPlans([]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEdit = (plan: Plan) => {
    setSaveError(null);
    setEditing(plan);
    const days = plan.duration_days;
    const isLifetime = days == null || days <= 0;
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      price_inr: plan.price_inr ?? 0,
      duration_mode: isLifetime ? "lifetime" : "limited",
      duration_days: !isLifetime && days != null ? days : 30,
      credits: plan.credits ?? 0,
      is_active: plan.is_active,
    });
  };

  const savePlan = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const priceInr = Math.max(0, Math.round(Number(form.price_inr)) || 0);
      const creditsVal = Math.max(0, Math.round(Number(form.credits)) || 0);
      const durationDays =
        form.duration_mode === "lifetime"
          ? null
          : Math.max(1, Math.round(Number(form.duration_days)) || 1);

      const res = await fetch(`/api/admin/plans/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price_inr: priceInr,
          price_usd: null,
          duration_days: durationDays,
          credits: creditsVal,
          is_active: form.is_active,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; plan?: Plan };
      if (!res.ok) {
        setSaveError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      setEditing(null);
      await fetchPlans();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (days: number | null) => {
    if (days == null || days <= 0) return "Lifetime";
    return `${days} days`;
  };

  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <IndianRupee className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
            Pricing & Plans
          </h1>
          <p className="font-general text-sm mt-1 text-gray-600">
            All amounts are in Indian Rupees (₹). Choose a fixed term in days or lifetime access per plan.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl font-general"
          style={{ borderColor: "var(--accent-gold)" }}
          onClick={fetchPlans}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-general">Name</TableHead>
                  <TableHead className="font-general">Price (₹)</TableHead>
                  <TableHead className="font-general">Validity</TableHead>
                  <TableHead className="font-general">Credits</TableHead>
                  <TableHead className="font-general">Active</TableHead>
                  <TableHead className="font-general w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Spinner size="md" label="Loading plans…" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-general">
                      No plans. Run the plans migration (20250212000000_plans_and_payments.sql) to seed default plans.
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((p) => (
                    <TableRow key={p.id} className="font-general">
                      <TableCell className="font-medium" style={{ color: "var(--primary-blue)" }}>
                        {p.name}
                      </TableCell>
                      <TableCell>₹{p.price_inr}</TableCell>
                      <TableCell>{formatDuration(p.duration_days)}</TableCell>
                      <TableCell>{p.credits ?? "—"}</TableCell>
                      <TableCell>
                        <span className={p.is_active ? "text-green-600" : "text-gray-400"}>
                          {p.is_active ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEdit(p)}>
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setSaveError(null);
          }
        }}
      >
        <DialogContent className="rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
              Edit plan
            </DialogTitle>
          </DialogHeader>
          {saveError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-general" role="alert">
              {saveError}
            </div>
          ) : null}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="font-general">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-general">Price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.price_inr}
                onChange={(e) => setForm((f) => ({ ...f, price_inr: Number(e.target.value) || 0 }))}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground font-general">India only — no other currency is stored.</p>
            </div>

            <fieldset className="grid gap-3 rounded-lg border border-[var(--primary-blue)]/15 p-3">
              <legend className="px-1 text-sm font-medium font-general" style={{ color: "var(--primary-blue)" }}>
                Plan validity
              </legend>
              <label className="flex cursor-pointer items-start gap-2 font-general text-sm">
                <input
                  type="radio"
                  name="duration_mode"
                  className="mt-1"
                  checked={form.duration_mode === "lifetime"}
                  onChange={() => setForm((f) => ({ ...f, duration_mode: "lifetime" }))}
                />
                <span>
                  <span className="font-medium">Lifetime</span>
                  <span className="block text-muted-foreground text-xs">No expiry — access does not end after a fixed number of days.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 font-general text-sm">
                <input
                  type="radio"
                  name="duration_mode"
                  className="mt-1"
                  checked={form.duration_mode === "limited"}
                  onChange={() => setForm((f) => ({ ...f, duration_mode: "limited" }))}
                />
                <span className="flex-1 min-w-0">
                  <span className="font-medium">Limited period</span>
                  <span className="block text-muted-foreground text-xs mb-2">Ends after this many days from purchase (or your product rules).</span>
                  <Input
                    type="number"
                    min={1}
                    disabled={form.duration_mode !== "limited"}
                    value={form.duration_days}
                    onChange={(e) => setForm((f) => ({ ...f, duration_days: Math.max(1, Number(e.target.value) || 1) }))}
                    className={cn("rounded-lg max-w-[140px]", form.duration_mode !== "limited" && "opacity-50")}
                  />
                  <span className="text-xs text-muted-foreground ml-2">days</span>
                </span>
              </label>
            </fieldset>

            <div className="grid gap-2">
              <Label className="font-general">Credits</Label>
              <Input
                type="number"
                min={0}
                value={form.credits}
                onChange={(e) => setForm((f) => ({ ...f, credits: Number(e.target.value) || 0 }))}
                className="rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_active" className="font-general">Active (visible on site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={savePlan}
              loading={saving}
              className="rounded-xl"
              style={{ backgroundColor: "var(--primary-blue)" }}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
