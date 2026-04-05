import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export const dynamic = "force-dynamic";

const postBodySchema = z.object({
  question: z.string().min(1).max(5000),
  answer: z.string().min(1).max(20000),
  sort_order: z.coerce.number().int().optional(),
});

export async function GET() {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;

  const { data, error } = await gate.service
    .from("faqs")
    .select("id, question, answer, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ faqs: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireAdminService();
  if (!gate.ok) return gate.response;

  const json = await request.json().catch(() => null);
  const parsed = postBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { question, answer, sort_order } = parsed.data;
  let order = sort_order;
  if (order === undefined) {
    const { data: rows } = await gate.service.from("faqs").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const max = rows?.[0]?.sort_order;
    order = typeof max === "number" ? max + 1 : 0;
  }

  const { data, error } = await gate.service
    .from("faqs")
    .insert({
      question: question.trim(),
      answer: answer.trim(),
      sort_order: order,
      updated_at: new Date().toISOString(),
    })
    .select("id, question, answer, sort_order")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ faq: data });
}
