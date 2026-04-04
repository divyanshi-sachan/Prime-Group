import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export const dynamic = "force-dynamic";

const uuidSchema = z.string().uuid();

const patchBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.union([z.string().max(2000), z.null()]).optional(),
  price_inr: z.coerce.number().int().min(0).optional(),
  /** India-only catalog; omit USD on save from admin UI. */
  price_usd: z.union([z.coerce.number().int().min(0), z.null()]).optional(),
  /** `null` = lifetime access; positive int = fixed term in days. */
  duration_days: z.union([z.coerce.number().int().min(1), z.null()]).optional(),
  credits: z.union([z.coerce.number().int().min(0), z.null()]).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;

  const { id: idRaw } = await context.params;
  const idParsed = uuidSchema.safeParse(idRaw);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);
  const parsed = patchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.name !== undefined) row.name = body.name;
  if (body.description !== undefined) {
    row.description = body.description === "" ? null : body.description;
  }
  if (body.price_inr !== undefined) row.price_inr = body.price_inr;
  if (body.price_usd !== undefined) row.price_usd = body.price_usd;
  if (body.duration_days !== undefined) row.duration_days = body.duration_days;
  if (body.credits !== undefined) row.credits = body.credits;
  if (body.is_active !== undefined) row.is_active = body.is_active;

  const keys = Object.keys(row).filter((k) => k !== "updated_at");
  if (keys.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await gate.service.from("plans").update(row).eq("id", idParsed.data).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({ plan: data });
}
