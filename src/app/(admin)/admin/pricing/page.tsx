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
import { createAdminBrowserClient } from "@/lib/supabase/client-admin";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_inr: number;
  price_usd: number | null;
  duration_days: number | null;
  credits: number | null;
  is_active: boolean;
  display_order: number | null;
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price_inr: 0,
    price_usd: 0,
    duration_days: 30,
    credits: 10,
    is_active: true,
  });

  const fetchPlans = async () => {
    const supabase = createAdminBrowserClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setPlans((data as Plan[]) ?? []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      price_inr: plan.price_inr ?? 0,
      price_usd: plan.price_usd ?? 0,
      duration_days: plan.duration_days ?? 30,
      credits: plan.credits ?? 0,
      is_active: plan.is_active,
    });
  };

  const savePlan = async () => {
    if (!editing) return;
    const supabase = createAdminBrowserClient();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("plans")
        .update({
          name: form.name,
          description: form.description || null,
          price_inr: form.price_inr,
          price_usd: form.price_usd || null,
          duration_days: form.duration_days || null,
          credits: form.credits ?? null,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editing.id);
      if (error) throw error;
      setEditing(null);
      fetchPlans();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
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
            Edit plan prices and visibility.
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
                  <TableHead className="font-general">Price ($)</TableHead>
                  <TableHead className="font-general">Duration</TableHead>
                  <TableHead className="font-general">Credits</TableHead>
                  <TableHead className="font-general">Active</TableHead>
                  <TableHead className="font-general w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Spinner size="md" label="Loading plans…" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 font-general">
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
                      <TableCell>{p.price_usd != null ? `$${p.price_usd}` : "—"}</TableCell>
                      <TableCell>{p.duration_days != null ? `${p.duration_days} days` : "—"}</TableCell>
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
              Edit plan
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="font-general">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-general">Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_inr}
                  onChange={(e) => setForm((f) => ({ ...f, price_inr: Number(e.target.value) || 0 }))}
                  className="rounded-lg"
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-general">Price ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_usd}
                  onChange={(e) => setForm((f) => ({ ...f, price_usd: Number(e.target.value) || 0 }))}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-general">Duration (days)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.duration_days}
                  onChange={(e) => setForm((f) => ({ ...f, duration_days: Number(e.target.value) || 0 }))}
                  className="rounded-lg"
                />
              </div>
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
