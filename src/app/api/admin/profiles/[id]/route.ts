import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import {
  adminEditProfileSchema,
  buildAdminProfileUpdatePayload,
  buildPartnerPreferencesPayload,
} from "@/lib/profile/admin-edit-profile-schema";

const uuidSchema = z.string().uuid();

/**
 * Full profile payload for the admin modal (service role; same trust model as GET /api/admin/profiles).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileIdRaw } = await context.params;
    const profileIdParsed = uuidSchema.safeParse(profileIdRaw);
    if (!profileIdParsed.success) {
      return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
    }
    const profileId = profileIdParsed.data;

    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const { data: profile, error: profileError } = await service
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .is("deleted_at", null)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let email: string | null = null;
    if (profile.user_id) {
      const { data: userRow } = await service
        .from("users")
        .select("email")
        .eq("id", profile.user_id)
        .maybeSingle();
      email = (userRow as { email?: string | null } | null)?.email ?? null;
    }

    const { data: photos, error: photosError } = await service
      .from("profile_photos")
      .select("id, photo_url, thumbnail_url, display_order, is_primary, status")
      .eq("profile_id", profileId)
      .order("display_order", { ascending: true });

    if (photosError) {
      return NextResponse.json({ error: photosError.message }, { status: 500 });
    }

    const { data: preferences, error: prefError } = await service
      .from("partner_preferences")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (prefError) {
      return NextResponse.json({ error: prefError.message }, { status: 500 });
    }

    return NextResponse.json({
      profile: { ...profile, email },
      photos: photos ?? [],
      preferences: preferences ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

/**
 * Save admin edits to profile + partner_preferences (service role).
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileIdRaw } = await context.params;
    const profileIdParsed = uuidSchema.safeParse(profileIdRaw);
    if (!profileIdParsed.success) {
      return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
    }
    const profileId = profileIdParsed.data;

    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const json = await request.json().catch(() => null);
    const parsed = adminEditProfileSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await service
      .from("profiles")
      .select("id, user_id, approved_at, deleted_at")
      .eq("id", profileId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (!existing || existing.deleted_at) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existingApprovedAt =
      (existing as { approved_at?: string | null }).approved_at ?? null;
    const memberUserId = (existing as { user_id: string }).user_id;

    const profilePayload = buildAdminProfileUpdatePayload(parsed.data, existingApprovedAt);

    const { data: updated, error: updateError } = await service
      .from("profiles")
      .update(profilePayload)
      .eq("id", profileId)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updated?.id) {
      return NextResponse.json({ error: "Update did not apply" }, { status: 500 });
    }

    const prefPayload = buildPartnerPreferencesPayload(parsed.data);
    const { data: existingPref, error: prefSelectError } = await service
      .from("partner_preferences")
      .select("id")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (prefSelectError) {
      return NextResponse.json({ error: prefSelectError.message }, { status: 500 });
    }

    if (existingPref?.id) {
      const { error: prefErr } = await service
        .from("partner_preferences")
        .update(prefPayload)
        .eq("id", existingPref.id);
      if (prefErr) {
        return NextResponse.json({ error: prefErr.message }, { status: 500 });
      }
    } else {
      const { error: insErr } = await service.from("partner_preferences").insert({
        profile_id: profileId,
        user_id: memberUserId,
        ...prefPayload,
      });
      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

/** Soft-delete profile (sets `deleted_at`). */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileIdRaw } = await context.params;
    const profileIdParsed = uuidSchema.safeParse(profileIdRaw);
    if (!profileIdParsed.success) {
      return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
    }
    const profileId = profileIdParsed.data;

    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await service
      .from("profiles")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", profileId)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updated?.id) {
      return NextResponse.json({ error: "Profile not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
