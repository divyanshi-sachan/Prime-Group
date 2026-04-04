import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export const dynamic = "force-dynamic";

/** List all plans (admin) — service role so inactive rows are visible regardless of RLS. */
export async function GET() {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;

  const { data, error } = await gate.service
    .from("plans")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plans: data ?? [] });
}
