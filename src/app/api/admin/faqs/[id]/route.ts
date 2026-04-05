import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export const dynamic = "force-dynamic";

const uuidSchema = z.string().uuid();

const patchBodySchema = z
  .object({
    question: z.string().min(1).max(5000).optional(),
    answer: z.string().min(1).max(20000).optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((b) => b.question !== undefined || b.answer !== undefined || b.sort_order !== undefined, {
    message: "At least one field required",
  });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;

  const { id: idRaw } = await context.params;
  const idParsed = uuidSchema.safeParse(idRaw);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid FAQ id" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);
  const parsed = patchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.question !== undefined) row.question = body.question.trim();
  if (body.answer !== undefined) row.answer = body.answer.trim();
  if (body.sort_order !== undefined) row.sort_order = body.sort_order;

  const { data, error } = await gate.service.from("faqs").update(row).eq("id", idParsed.data).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  return NextResponse.json({ faq: data });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;

  const { id: idRaw } = await context.params;
  const idParsed = uuidSchema.safeParse(idRaw);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid FAQ id" }, { status: 400 });
  }

  const { error } = await gate.service.from("faqs").delete().eq("id", idParsed.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
