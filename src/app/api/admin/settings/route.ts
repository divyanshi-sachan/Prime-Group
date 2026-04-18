import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import {
  parseContactLeadershipJson,
  validateContactLeadershipInput,
} from "@/lib/contact-leadership";

export const dynamic = "force-dynamic";

/** GET: Admin reads settings (payment + contact leadership team) */
export async function GET() {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;
  const { service } = gate;

  const { data: rows, error } = await service.from("app_settings").select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  (rows ?? []).forEach((r: { key: string; value: string }) => {
    settings[r.key] = r.value;
  });

  const rawLeadership = settings.contact_leadership ?? "[]";
  const contact_leadership = parseContactLeadershipJson(rawLeadership);

  return NextResponse.json({
    payment_method: settings.payment_method ?? "razorpay",
    contact_leadership,
  });
}

/** PATCH: Admin updates payment_method and/or contact_leadership */
export async function PATCH(req: Request) {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;
  const { service } = gate;

  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();

  if (body.payment_method !== undefined) {
    const method = String(body.payment_method).toLowerCase();
    const value = method === "upi_qr" ? "upi_qr" : "razorpay";

    const { error: upsertError } = await service
      .from("app_settings")
      .upsert({ key: "payment_method", value, updated_at: now }, { onConflict: "key" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  if (body.contact_leadership !== undefined) {
    const validated = validateContactLeadershipInput(body.contact_leadership);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const json = JSON.stringify(validated.members);

    const { error: upsertLeadErr } = await service
      .from("app_settings")
      .upsert({ key: "contact_leadership", value: json, updated_at: now }, { onConflict: "key" });

    if (upsertLeadErr) {
      return NextResponse.json({ error: upsertLeadErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
