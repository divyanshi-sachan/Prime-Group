import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = "contact-leadership";

function extFromType(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** POST multipart form: file → public URL in contact-leadership bucket */
export async function POST(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Use JPEG, PNG, or WebP" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = extFromType(file.type);
    const path = `heads/${crypto.randomUUID()}-${Date.now()}.${ext}`;

    const { error: upErr } = await service.storage.from(BUCKET).upload(path, buf, {
      contentType: file.type,
      cacheControl: "86400",
      upsert: false,
    });
    if (upErr) {
      return NextResponse.json(
        { error: upErr.message || "Upload failed. Ensure bucket contact-leadership exists." },
        { status: 500 }
      );
    }

    const { data: urlData } = service.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
