import { z } from "zod";
import { dateOfBirthSchema } from "@/lib/auth/age-validation";

const editObjectSchema = z.object({
  full_name: z.string().min(2),
  gender: z.enum(["male", "female", "other"]),
  date_of_birth: dateOfBirthSchema,
  marital_status: z.string().optional(),
  height_cm: z.coerce.number().min(0).max(250).optional(),
  religion: z.string().optional(),
  mother_tongue: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  willing_to_relocate: z.string().optional(),
  highest_education: z.string().optional(),
  college_university: z.string().optional(),
  field_of_study: z.string().optional(),
  occupation: z.string().optional(),
  organization: z.string().optional(),
  about_me: z.string().max(2000).optional(),
  father_name: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_name: z.string().optional(),
  mother_occupation: z.string().optional(),
  siblings_count: z.coerce.number().min(0).optional(),
  family_type: z.string().optional(),
  family_values: z.string().optional(),
  family_status: z.string().optional(),
  age_min: z.coerce.number().min(18).max(100).optional(),
  age_max: z.coerce.number().min(18).max(100).optional(),
  additional_notes: z.string().max(500).optional(),
});

const adminExtraSchema = z.object({
  profile_status: z.enum(["pending", "active", "rejected", "suspended"]),
  is_visible: z.boolean(),
  admin_notes: z.string().optional(),
  contact_number: z.string().optional(),
  contact_address: z.string().optional(),
  verification_status: z.string().optional(),
  gotra: z.string().optional(),
  birthplace: z.string().optional(),
  birth_time: z.string().optional(),
  complexion: z.string().optional(),
  school: z.string().optional(),
  show_education: z.boolean(),
  show_occupation: z.boolean(),
  show_family: z.boolean(),
  show_location: z.boolean(),
});

export const adminEditProfileSchema = editObjectSchema.merge(adminExtraSchema).refine(
  (d) => {
    const min = d.age_min;
    const max = d.age_max;
    if (min == null || max == null || Number.isNaN(min) || Number.isNaN(max)) return true;
    return min <= max;
  },
  { message: "Minimum partner age cannot be greater than maximum", path: ["age_max"] }
);

export type AdminEditProfileFormData = z.infer<typeof adminEditProfileSchema>;

export function buildAdminProfileUpdatePayload(
  data: AdminEditProfileFormData,
  existingApprovedAt: string | null
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    full_name: data.full_name,
    gender: data.gender,
    date_of_birth: data.date_of_birth,
    marital_status: data.marital_status || null,
    height_cm: data.height_cm ?? null,
    religion: data.religion || null,
    mother_tongue: data.mother_tongue || null,
    country: data.country || null,
    state: data.state || null,
    city: data.city || null,
    willing_to_relocate: data.willing_to_relocate || null,
    highest_education: data.highest_education || null,
    college_university: data.college_university || null,
    field_of_study: data.field_of_study || null,
    occupation: data.occupation || null,
    organization: data.organization || null,
    about_me: data.about_me || null,
    father_name: data.father_name || null,
    father_occupation: data.father_occupation || null,
    mother_name: data.mother_name || null,
    mother_occupation: data.mother_occupation || null,
    siblings_count: data.siblings_count ?? null,
    family_type: data.family_type || null,
    family_values: data.family_values || null,
    family_status: data.family_status || null,
    updated_at: new Date().toISOString(),
    profile_status: data.profile_status,
    is_visible: data.is_visible,
    admin_notes: data.admin_notes || null,
    contact_number: data.contact_number || null,
    contact_address: data.contact_address || null,
    verification_status: data.verification_status || "unverified",
    gotra: data.gotra || null,
    birthplace: data.birthplace || null,
    birth_time: data.birth_time || null,
    complexion: data.complexion || null,
    school: data.school || null,
    show_education: data.show_education,
    show_occupation: data.show_occupation,
    show_family: data.show_family,
    show_location: data.show_location,
    approved_at:
      data.profile_status === "active" ? existingApprovedAt ?? new Date().toISOString() : null,
  };
  return payload;
}

export function buildPartnerPreferencesPayload(data: AdminEditProfileFormData): Record<string, unknown> {
  return {
    age_min: data.age_min ?? null,
    age_max: data.age_max ?? null,
    additional_notes: data.additional_notes || null,
    updated_at: new Date().toISOString(),
  };
}
