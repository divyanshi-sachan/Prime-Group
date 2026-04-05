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

/**
 * Revenue detail for `/admin/revenue`. Uses service role like `/api/admin/dashboard-stats` so totals
 * match the dashboard; the browser Supabase client often has no JWT when the admin session is
 * cookie-only, which made RLS hide payment rows.
 */
export async function GET() {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;
  const { service } = gate;

  try {
    const [payments, plansRes, pendingUpi] = await Promise.all([
      fetchAllRows<{
        id: string;
        amount: number;
        plan_id: string | null;
        paid_at: string | null;
        created_at: string;
        status: string;
        payment_method: string | null;
      }>(async (from, to) =>
        service
          .from("payments")
          .select("id, amount, plan_id, paid_at, created_at, status, payment_method")
          .eq("status", "success")
          .range(from, to)
      ),
      service.from("plans").select("id, name").order("display_order", { ascending: true }),
      fetchAllRows<{
        id: string;
        amount: number;
        plan_id: string | null;
        created_at: string;
        payment_method: string | null;
      }>(async (from, to) =>
        service
          .from("payments")
          .select("id, amount, plan_id, created_at, payment_method")
          .eq("status", "pending")
          .eq("payment_method", "upi_qr")
          .range(from, to)
      ),
    ]);

    if (plansRes.error) {
      return NextResponse.json({ error: plansRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      payments,
      plans: plansRes.data ?? [],
      pendingUpi,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load revenue data" },
      { status: 500 }
    );
  }
}
