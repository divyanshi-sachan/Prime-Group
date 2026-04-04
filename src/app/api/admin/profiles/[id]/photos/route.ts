import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { MAX_PROFILE_PHOTOS } from "@/lib/image-compression";

const uuidSchema = z.string().uuid();

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB after client compression; safety cap

function extFromType(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function POST(
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

    const { data: profile, error: profErr } = await service
      .from("profiles")
      .select("user_id")
      .eq("id", profileId)
      .is("deleted_at", null)
      .maybeSingle();

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
    if (!profile?.user_id) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const memberUserId = profile.user_id as string;

    const { count, error: countErr } = await service
      .from("profile_photos")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId);

    if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });
    if ((count ?? 0) >= MAX_PROFILE_PHOTOS) {
      return NextResponse.json({ error: `Maximum ${MAX_PROFILE_PHOTOS} photos` }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Use JPEG, PNG, or WebP" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = extFromType(file.type);
    const path = `${memberUserId}/${profileId}-${Date.now()}.${ext}`;
    const bucket = "profile-photos";

    const { error: upErr } = await service.storage.from(bucket).upload(path, buf, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: urlData } = service.storage.from(bucket).getPublicUrl(path);
    const displayOrder = count ?? 0;
    const isPrimary = displayOrder === 0;

    const { data: inserted, error: insErr } = await service
      .from("profile_photos")
      .insert({
        profile_id: profileId,
        user_id: memberUserId,
        photo_url: urlData.publicUrl,
        display_order: displayOrder,
        is_primary: isPrimary,
        status: "pending",
      })
      .select("id, photo_url, thumbnail_url, display_order, is_primary, status")
      .single();

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ photo: inserted });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

const patchBodySchema = z.object({
  photoId: z.string().uuid(),
  action: z.literal("set_primary"),
});

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
    const parsed = patchBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { photoId } = parsed.data;

    const { data: photo, error: findErr } = await service
      .from("profile_photos")
      .select("id")
      .eq("id", photoId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    const { error: clearErr } = await service
      .from("profile_photos")
      .update({ is_primary: false })
      .eq("profile_id", profileId);
    if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });

    const { error: setErr } = await service
      .from("profile_photos")
      .update({ is_primary: true })
      .eq("id", photoId)
      .eq("profile_id", profileId);
    if (setErr) return NextResponse.json({ error: setErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const photoIdParsed = uuidSchema.safeParse(searchParams.get("photoId") ?? "");
    if (!photoIdParsed.success) {
      return NextResponse.json({ error: "Invalid or missing photoId" }, { status: 400 });
    }
    const photoId = photoIdParsed.data;

    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const { data: row, error: findErr } = await service
      .from("profile_photos")
      .select("id, is_primary")
      .eq("id", photoId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
    if (!row) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    const { error: delErr } = await service.from("profile_photos").delete().eq("id", photoId).eq("profile_id", profileId);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    const { data: remaining, error: listErr } = await service
      .from("profile_photos")
      .select("id, is_primary")
      .eq("profile_id", profileId)
      .order("display_order", { ascending: true });

    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

    if (remaining?.length && !remaining.some((p) => p.is_primary)) {
      const { error: promoteErr } = await service
        .from("profile_photos")
        .update({ is_primary: true })
        .eq("id", remaining[0]!.id);
      if (promoteErr) return NextResponse.json({ error: promoteErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
