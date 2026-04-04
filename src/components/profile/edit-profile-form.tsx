"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfilePhotoManager } from "./profile-photo-manager";
import type { ProfileRecord } from "./profile-view";
import { dateOfBirthSchema, MAX_PROFILE_AGE, MIN_PROFILE_AGE } from "@/lib/auth/age-validation";

const editSchema = z
  .object({
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
})
  .refine(
    (d) => {
      const min = d.age_min;
      const max = d.age_max;
      if (min == null || max == null || Number.isNaN(min) || Number.isNaN(max)) return true;
      return min <= max;
    },
    { message: "Minimum partner age cannot be greater than maximum", path: ["age_max"] }
  );

type EditFormData = z.infer<typeof editSchema>;

interface EditProfileFormProps {
  profile: ProfileRecord;
  photos: { id: string; photo_url: string; thumbnail_url: string | null; display_order: number; is_primary: boolean; status: string }[];
  preferences: { age_min: number | null; age_max: number | null; additional_notes: string | null } | null;
  userId: string;
  onClose?: () => void;
}

export function EditProfileForm({ profile, photos, preferences, userId, onClose }: EditProfileFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(photos.length);
  const handlePhotoUpdate = (newCount: number) => setPhotoCount(newCount);

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      gender: (profile.gender as "male" | "female" | "other") ?? "male",
      date_of_birth: profile.date_of_birth?.slice(0, 10) ?? "",
      marital_status: profile.marital_status ?? "",
      height_cm: profile.height_cm ?? undefined,
      religion: profile.religion ?? "",
      mother_tongue: profile.mother_tongue ?? "",
      country: profile.country ?? "",
      state: profile.state ?? "",
      city: profile.city ?? "",
      willing_to_relocate: profile.willing_to_relocate ?? "",
      highest_education: profile.highest_education ?? "",
      college_university: profile.college_university ?? "",
      field_of_study: profile.field_of_study ?? "",
      occupation: profile.occupation ?? "",
      organization: profile.organization ?? "",
      about_me: profile.about_me ?? "",
      father_name: profile.father_name ?? "",
      father_occupation: profile.father_occupation ?? "",
      mother_name: profile.mother_name ?? "",
      mother_occupation: profile.mother_occupation ?? "",
      siblings_count: profile.siblings_count ?? undefined,
      family_type: profile.family_type ?? "",
      family_values: profile.family_values ?? "",
      family_status: profile.family_status ?? "",
      age_min: preferences?.age_min ?? undefined,
      age_max: preferences?.age_max ?? undefined,
      additional_notes: preferences?.additional_notes ?? "",
    },
  });


  const onSubmit = async (data: EditFormData) => {
    setError(null);
    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
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
      };
      const { error: e } = await supabase.from("profiles").update(payload).eq("id", profile.id).eq("user_id", userId);
      if (e) throw e;

      const prefPayload = {
        age_min: data.age_min ?? null,
        age_max: data.age_max ?? null,
        additional_notes: data.additional_notes || null,
        updated_at: new Date().toISOString(),
      };
      const { data: existingPref } = await supabase.from("partner_preferences").select("id").eq("profile_id", profile.id).single();
      if (existingPref) {
        await supabase.from("partner_preferences").update(prefPayload).eq("id", existingPref.id);
      } else {
        await supabase.from("partner_preferences").insert({
          profile_id: profile.id,
          user_id: userId,
          ...prefPayload,
        });
      }
      router.refresh();
      if (onClose) onClose();
      else router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const cardStyle = { boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08)", border: "1px solid rgba(212, 175, 55, 0.15)" };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-8" style={cardStyle}>
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b pb-6 gap-4" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
        <div>
          <h1 className="font-playfair-display text-3xl font-bold" style={{ color: "var(--primary-blue)" }}>
            Edit Profile
          </h1>
          <p className="font-general text-sm mt-2 opacity-80" style={{ color: "var(--primary-blue)" }}>
            Update your details, photos, and preferences inline.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => { if(onClose) onClose(); else router.push("/profile"); }} className="rounded-xl border-[var(--primary-blue)]/20 text-[var(--primary-blue)] hover:bg-[var(--accent-gold)]/10">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={saving}
            disabled={!form.formState.isDirty}
            className="rounded-xl shadow-md transition-all px-6"
            style={{ backgroundColor: "var(--primary-blue)", color: "white" }}
          >
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
          Basic info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name *</Label>
            <Input id="full_name" {...form.register("full_name")} />
            {form.formState.errors.full_name && (
              <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Gender *</Label>
            <Select onValueChange={(v) => form.setValue("gender", v as EditFormData["gender"])} value={form.watch("gender")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of birth *</Label>
            <Input id="date_of_birth" type="date" {...form.register("date_of_birth")} />
            <p className="text-xs text-gray-600 font-general">
              Age must be between {MIN_PROFILE_AGE} and {MAX_PROFILE_AGE} years.
            </p>
            {form.formState.errors.date_of_birth && (
              <p className="text-sm text-red-500">{form.formState.errors.date_of_birth.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Marital status</Label>
            <Select onValueChange={(v) => form.setValue("marital_status", v)} value={form.watch("marital_status")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never_married">Never Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height_cm">Height (cm)</Label>
            <Input id="height_cm" type="number" {...form.register("height_cm")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="religion">Religion</Label>
            <Input id="religion" {...form.register("religion")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="mother_tongue">Mother tongue</Label>
            <Input id="mother_tongue" {...form.register("mother_tongue")} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
          Location
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register("country")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...form.register("state")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <Label>Willing to relocate?</Label>
            <Select onValueChange={(v) => form.setValue("willing_to_relocate", v)} value={form.watch("willing_to_relocate")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
          Education & career
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="highest_education">Highest education</Label>
            <Input id="highest_education" {...form.register("highest_education")} placeholder="e.g. B.Tech" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college_university">College / University</Label>
            <Input id="college_university" {...form.register("college_university")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field_of_study">Field of study</Label>
            <Input id="field_of_study" {...form.register("field_of_study")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input id="occupation" {...form.register("occupation")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="organization">Organization</Label>
            <Input id="organization" {...form.register("organization")} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
          About me
        </h2>
        <div className="space-y-2">
          <Label htmlFor="about_me">Short bio / introduction</Label>
          <textarea
            id="about_me"
            {...form.register("about_me")}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="A few lines about yourself..."
            maxLength={2000}
          />
          <p className="text-xs opacity-70">{(form.watch("about_me")?.length ?? 0)} / 2000</p>
        </div>
      </div>

      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
          Family (optional)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="father_name">Father&apos;s name</Label>
            <Input id="father_name" {...form.register("father_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_occupation">Father&apos;s occupation</Label>
            <Input id="father_occupation" {...form.register("father_occupation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_name">Mother&apos;s name</Label>
            <Input id="mother_name" {...form.register("mother_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_occupation">Mother&apos;s occupation</Label>
            <Input id="mother_occupation" {...form.register("mother_occupation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siblings_count">Number of siblings</Label>
            <Input id="siblings_count" type="number" min={0} {...form.register("siblings_count")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="family_type">Family type</Label>
            <Input id="family_type" {...form.register("family_type")} placeholder="e.g. Joint" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
          Partner preferences
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age_min">Partner age (min)</Label>
            <Input id="age_min" type="number" min={18} max={100} {...form.register("age_min")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age_max">Partner age (max)</Label>
            <Input id="age_max" type="number" min={18} max={100} {...form.register("age_max")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="additional_notes">Additional notes</Label>
            <textarea
              id="additional_notes"
              {...form.register("additional_notes")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              maxLength={500}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 border bg-white shadow-sm" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
        <ProfilePhotoManager
          profileId={profile.id}
          userId={userId}
          initialPhotos={photos}
          onUpdate={handlePhotoUpdate}
        />
      </div>
    </form>
  );
}
