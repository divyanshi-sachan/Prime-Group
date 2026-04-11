import { z } from "zod";

export const MAX_CONTACT_LEADERSHIP_MEMBERS = 12;

const optionalEmail = z
  .string()
  .max(120)
  .trim()
  .refine((s) => s === "" || z.string().email().safeParse(s).success, "Invalid email");

const memberSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(120).trim(),
  designation: z.string().max(160).trim(),
  phone: z.string().max(40).trim(),
  email: optionalEmail,
  photo_url: z
    .string()
    .max(2000)
    .optional()
    .transform((s) => (s ?? "").trim()),
  sort_order: z.number().int().min(0).max(999),
});

export type ContactLeadershipMember = z.infer<typeof memberSchema>;

export function parseContactLeadershipJson(raw: string | null | undefined): ContactLeadershipMember[] {
  if (!raw || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: ContactLeadershipMember[] = [];
    for (let i = 0; i < parsed.length && out.length < MAX_CONTACT_LEADERSHIP_MEMBERS; i++) {
      const item = parsed[i];
      if (typeof item !== "object" || item === null) continue;
      const o = item as Record<string, unknown>;
      const row = memberSchema.safeParse({
        id: typeof o.id === "string" && o.id.trim() ? o.id.slice(0, 80) : `legacy-${i}`,
        name: typeof o.name === "string" ? o.name : "",
        designation: typeof o.designation === "string" ? o.designation : "",
        phone: typeof o.phone === "string" ? o.phone : "",
        email: typeof o.email === "string" ? o.email : "",
        photo_url: typeof o.photo_url === "string" ? o.photo_url : "",
        sort_order: out.length,
      });
      if (!row.success || !row.data.name.trim()) continue;
      const photo = row.data.photo_url;
      if (photo !== "" && !/^https:\/\//i.test(photo)) continue;
      out.push({ ...row.data, sort_order: out.length });
    }
    return out;
  } catch {
    return [];
  }
}

function randomId(): string {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function validateContactLeadershipInput(
  input: unknown
): { ok: true; members: ContactLeadershipMember[] } | { ok: false; error: string } {
  const arr = z.array(z.unknown()).max(MAX_CONTACT_LEADERSHIP_MEMBERS).safeParse(input);
  if (!arr.success) {
    return { ok: false, error: "Invalid team payload" };
  }
  const members: ContactLeadershipMember[] = [];
  for (let i = 0; i < arr.data.length; i++) {
    const raw = arr.data[i];
    if (typeof raw !== "object" || raw === null) {
      return { ok: false, error: "Each team member must be an object" };
    }
    const o = raw as Record<string, unknown>;
    const row = memberSchema.safeParse({
      id: typeof o.id === "string" && o.id.trim() ? String(o.id).slice(0, 80) : randomId(),
      name: typeof o.name === "string" ? o.name : "",
      designation: typeof o.designation === "string" ? o.designation : "",
      phone: typeof o.phone === "string" ? o.phone : "",
      email: typeof o.email === "string" ? o.email : "",
      photo_url: typeof o.photo_url === "string" ? o.photo_url : "",
      sort_order: i,
    });
    if (!row.success) {
      return {
        ok: false,
        error: row.error.flatten().formErrors.join("; ") || row.error.message || "Invalid member row",
      };
    }
    const photo = row.data.photo_url;
    if (photo !== "" && !/^https:\/\//i.test(photo)) {
      return { ok: false, error: "Photo URLs must be HTTPS" };
    }
    members.push({ ...row.data, sort_order: i });
  }
  return { ok: true, members };
}
