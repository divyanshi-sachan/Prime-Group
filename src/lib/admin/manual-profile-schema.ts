import { z } from "zod";
import { dateOfBirthSchema } from "@/lib/auth/age-validation";
import { signupPasswordSchema } from "@/lib/auth/password-policy";

function emptyToNull(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
}

function toOptInt(v: unknown): number | null {
  const x = emptyToNull(v);
  if (x === null) return null;
  const n = typeof x === "number" ? x : parseInt(String(x), 10);
  if (Number.isNaN(n)) return null;
  return Math.trunc(n);
}

function toOptTrimmedStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}

const optStr = (max: number) =>
  z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string().max(max), z.null()]));

const optHeightCm = z.preprocess((v) => {
  const n = toOptInt(v);
  return n;
}, z.union([z.number().int().min(120).max(220), z.null()]));

const optPartnerAge = z.preprocess((v) => {
  const n = toOptInt(v);
  return n;
}, z.union([z.number().int().min(18).max(100), z.null()]));

const optIncome = z.preprocess((v) => {
  const n = toOptInt(v);
  return n;
}, z.union([z.number().int().min(0), z.null()]));

const optSiblingInt = z.preprocess((v) => {
  const n = toOptInt(v);
  return n;
}, z.union([z.number().int().min(0), z.null()]));

/** Shared profile fields (used for finalize + full body with password). */
const manualProfileFieldsSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : ""),
    z.string().min(1, "Email is required").email("Invalid email address")
  ),
  full_name: z.string().min(2).max(100),
    gender: z.enum(["male", "female", "other"]),
    date_of_birth: dateOfBirthSchema,
    birth_time: optStr(20),
    birthplace: optStr(200),
    marital_status: optStr(20),
    religion: optStr(50),
    mother_tongue: optStr(50),
    profile_for: optStr(20),
    height_cm: optHeightCm,
    complexion: optStr(50),
    school: optStr(150),
    college_university: optStr(150),
    field_of_study: optStr(100),
    highest_education: optStr(100),
    employed_in: optStr(50),
    occupation: optStr(100),
    organization: optStr(150),
    annual_income: optIncome,
    gotra: optStr(100),
    father_name: optStr(100),
    father_occupation: optStr(100),
    mother_name: optStr(100),
    mother_occupation: optStr(100),
    has_siblings: z.preprocess((v) => Boolean(v), z.boolean()).default(false),
    siblings_brothers: optSiblingInt,
    siblings_sisters: optSiblingInt,
    siblings_notes: z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string(), z.null()])),
    siblings_count: optSiblingInt,
    permanent_address: z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string(), z.null()])),
    current_address: z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string(), z.null()])),
    contact_number: optStr(20),
    country: optStr(50),
    state: optStr(50),
    city: optStr(50),
    citizenship: optStr(50),
    residing_in: optStr(100),
    willing_to_relocate: optStr(10),
    about_me: z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string().max(5000), z.null()])),
    admin_notes: z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string().max(2000), z.null()])),
    rejection_reason: z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string(), z.null()])),
    profile_status: z.enum(["pending", "active", "rejected", "suspended"]).default("pending"),
    is_visible: z.preprocess((v) => Boolean(v), z.boolean()).default(true),
    verification_status: optStr(20),
    show_education: z.preprocess((v) => v !== false, z.boolean()).default(true),
    show_occupation: z.preprocess((v) => v !== false, z.boolean()).default(true),
    show_family: z.preprocess((v) => v !== false, z.boolean()).default(true),
    show_location: z.preprocess((v) => v !== false, z.boolean()).default(true),
    age_min: optPartnerAge,
    age_max: optPartnerAge,
    additional_notes: z.preprocess((v) => toOptTrimmedStr(v), z.union([z.string().max(500), z.null()])),
});

const manualProfileRefines = <S extends z.ZodTypeAny>(schema: S) =>
  schema
    .refine(
      (d: z.infer<S>) => {
        const min = d.age_min;
        const max = d.age_max;
        if (min == null || max == null) return true;
        return min <= max;
      },
      { message: "Partner minimum age cannot be greater than maximum", path: ["age_max"] }
    );

/** Finalize payload after POST /api/admin/profiles/manual/init (no password). */
export const manualProfileFinalizeSchema = manualProfileRefines(manualProfileFieldsSchema);

/** Full payload including password (e.g. docs / tooling); prefer init + finalize in the app. */
export const manualProfileBodySchema = manualProfileRefines(
  manualProfileFieldsSchema.extend({
    /** Initial password set by admin; share securely with the member. */
    password: signupPasswordSchema,
  })
);

export type ManualProfileBody = z.infer<typeof manualProfileBodySchema>;

export type ManualProfileFinalizeBody = z.infer<typeof manualProfileFinalizeSchema>;

export const manualProfileInitSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : ""),
    z.string().min(1, "Email is required").email("Invalid email address")
  ),
  password: signupPasswordSchema,
});
