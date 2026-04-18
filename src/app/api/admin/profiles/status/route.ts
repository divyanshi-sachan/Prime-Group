import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminService } from "@/lib/admin/require-admin-service";

const bodySchema = z.object({
  profileId: z.string().uuid(),
  profile_status: z.enum(["pending", "active", "rejected", "suspended"]),
});

/**
 * Updates profile status using the service role after verifying the caller is an admin.
 * Browser-side Supabase updates can fail under RLS; this matches GET /api/admin/profiles.
 */
export async function PATCH(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { profileId, profile_status } = parsed.data;
    const approved_at = profile_status === "active" ? new Date().toISOString() : null;

    const { data: updated, error: updateError } = await service
      .from("profiles")
      .update({
        profile_status,
        approved_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .is("deleted_at", null)
      .select("id, profile_status")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updated?.id) {
      return NextResponse.json({ error: "Profile not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, profile_status: updated.profile_status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
