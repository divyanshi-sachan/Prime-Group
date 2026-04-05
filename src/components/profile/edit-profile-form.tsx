"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfilePhotoManager } from "./profile-photo-manager";
import type { ProfileRecord } from "./profile-view";
import { MAX_PROFILE_AGE, MIN_PROFILE_AGE } from "@/lib/auth/age-validation";
import {
  adminEditProfileSchema,
  type AdminEditProfileFormData,
} from "@/lib/profile/admin-edit-profile-schema";

type AdminEditFormData = AdminEditProfileFormData;

function formatSaveError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Failed to save";
}

interface EditProfileFormProps {
  profile: ProfileRecord;
  photos: { id: string; photo_url: string; thumbnail_url: string | null; display_order: number; is_primary: boolean; status: string }[];
  preferences: { age_min: number | null; age_max: number | null; additional_notes: string | null } | null;
  userId: string;
  onClose?: () => void;
  /** Admin panel: use admin Supabase session + extra profile fields. Requires DB policies (see migration admin partner_prefs_and_photos). */
  variant?: "user" | "admin";
  /** After successful save (e.g. refetch profile in parent). */
  onSaved?: () => void;
}

function buildDefaultValues(
  profile: ProfileRecord,
  preferences: EditProfileFormProps["preferences"]
): AdminEditFormData {
  const base: AdminEditFormData = {
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
    annual_income: profile.annual_income ?? undefined,
    about_me: profile.about_me ?? "",
    father_name: profile.father_name ?? "",
    father_occupation: profile.father_occupation ?? "",
    mother_name: profile.mother_name ?? "",
    mother_occupation: profile.mother_occupation ?? "",
    siblings_count: profile.siblings_count ?? undefined,
    age_min: preferences?.age_min ?? undefined,
    age_max: preferences?.age_max ?? undefined,
    additional_notes: preferences?.additional_notes ?? "",
    profile_status: (profile.profile_status as AdminEditFormData["profile_status"]) ?? "pending",
    is_visible: profile.is_visible ?? true,
    admin_notes: profile.admin_notes ?? "",
    contact_number: profile.contact_number ?? "",
    permanent_address: profile.permanent_address ?? "",
    current_address: profile.current_address ?? "",
    verification_status: profile.verification_status ?? "unverified",
    gotra: profile.gotra ?? "",
    birthplace: profile.birthplace ?? "",
    birth_time: profile.birth_time ?? "",
    complexion: profile.complexion ?? "",
    school: profile.school ?? "",
    show_education: profile.show_education ?? true,
    show_occupation: profile.show_occupation ?? true,
    show_family: profile.show_family ?? true,
    show_location: profile.show_location ?? true,
  };
  return base;
}

export function EditProfileForm({
  profile,
  photos,
  preferences,
  userId,
  onClose,
  variant = "user",
  onSaved,
}: EditProfileFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlePhotoUpdate = (_newCount: number) => {};
  const isAdmin = variant === "admin";

  const form = useForm<AdminEditFormData>({
    resolver: zodResolver(adminEditProfileSchema),
    defaultValues: buildDefaultValues(profile, preferences),
  });

  const onSubmit = async (data: AdminEditFormData) => {
    setError(null);
    setSaving(true);
    const supabase = createClient();
    try {
      if (isAdmin) {
        const res = await fetch(`/api/admin/profiles/${profile.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string; details?: unknown };
        if (!res.ok) {
          throw new Error(json.error ?? `Save failed (${res.status})`);
        }
        onSaved?.();
        if (onClose) onClose();
        return;
      }

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
        annual_income: data.annual_income ?? null,
        about_me: data.about_me || null,
        father_name: data.father_name || null,
        father_occupation: data.father_occupation || null,
        mother_name: data.mother_name || null,
        mother_occupation: data.mother_occupation || null,
        siblings_count: data.siblings_count ?? null,
        permanent_address: data.permanent_address || null,
        current_address: data.current_address || null,
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
      const { data: existingPref } = await supabase
        .from("partner_preferences")
        .select("id")
        .eq("profile_id", profile.id)
        .maybeSingle();
      if (existingPref) {
        const { error: pe } = await supabase.from("partner_preferences").update(prefPayload).eq("id", existingPref.id);
        if (pe) throw pe;
      } else {
        const { error: ie } = await supabase.from("partner_preferences").insert({
          profile_id: profile.id,
          user_id: userId,
          ...prefPayload,
        });
        if (ie) throw ie;
      }

      router.refresh();
      onSaved?.();
      if (onClose) onClose();
      else router.push("/profile");
    } catch (err) {
      setError(formatSaveError(err));
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
            {isAdmin ? "Edit member profile" : "Edit Profile"}
          </h1>
          <p className="font-general text-sm mt-2 opacity-80" style={{ color: "var(--primary-blue)" }}>
            {isAdmin
              ? "Update all profile fields, visibility, and photos for this member."
              : "Update your details, photos, and preferences inline."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onClose) onClose();
              else router.push("/profile");
            }}
            className="rounded-xl border-[var(--primary-blue)]/20 text-[var(--primary-blue)] hover:bg-[var(--accent-gold)]/10"
          >
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

      {isAdmin && (
        <div className="rounded-2xl p-6 space-y-4 border-2 border-amber-200/60 bg-amber-50/30" style={cardStyle}>
          <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
            Admin & visibility
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Profile status</Label>
              <Select
                onValueChange={(v) => form.setValue("profile_status", v as AdminEditFormData["profile_status"])}
                value={form.watch("profile_status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification_status">Verification</Label>
              <Input id="verification_status" {...form.register("verification_status")} placeholder="unverified" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="admin_notes">Admin notes (internal)</Label>
              <textarea
                id="admin_notes"
                {...form.register("admin_notes")}
                className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact phone</Label>
              <Input id="contact_number" {...form.register("contact_number")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="permanent_address">Permanent address</Label>
              <Input id="permanent_address" {...form.register("permanent_address")} placeholder="Native / permanent address" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="current_address">Current address</Label>
              <Input id="current_address" {...form.register("current_address")} placeholder="If different from permanent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gotra">Gotra</Label>
              <Input id="gotra" {...form.register("gotra")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthplace">Birthplace</Label>
              <Input id="birthplace" {...form.register("birthplace")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_time">Birth time</Label>
              <Input id="birth_time" {...form.register("birth_time")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complexion">Complexion</Label>
              <Input id="complexion" {...form.register("complexion")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="school">School</Label>
              <Input id="school" {...form.register("school")} />
            </div>
            <div className="flex flex-wrap gap-4 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={form.watch("is_visible")}
                  onChange={(e) => form.setValue("is_visible", e.target.checked, { shouldDirty: true })}
                />
                Visible on site
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={form.watch("show_education")}
                  onChange={(e) => form.setValue("show_education", e.target.checked, { shouldDirty: true })}
                />
                Show education
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={form.watch("show_occupation")}
                  onChange={(e) => form.setValue("show_occupation", e.target.checked, { shouldDirty: true })}
                />
                Show occupation
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={form.watch("show_family")}
                  onChange={(e) => form.setValue("show_family", e.target.checked, { shouldDirty: true })}
                />
                Show family
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={form.watch("show_location")}
                  onChange={(e) => form.setValue("show_location", e.target.checked, { shouldDirty: true })}
                />
                Show location
              </label>
            </div>
          </div>
        </div>
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
            <Select onValueChange={(v) => form.setValue("gender", v as AdminEditFormData["gender"])} value={form.watch("gender")}>
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
          {!isAdmin && (
            <>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="user_permanent_address">Permanent address</Label>
                <Input
                  id="user_permanent_address"
                  {...form.register("permanent_address")}
                  placeholder="Native / permanent address"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="user_current_address">Current address</Label>
                <Input
                  id="user_current_address"
                  {...form.register("current_address")}
                  placeholder="If different from permanent"
                />
              </div>
            </>
          )}
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
          <div className="space-y-2">
            <Label htmlFor="annual_income">Annual income (INR)</Label>
            <Input id="annual_income" type="number" min={0} step={1} {...form.register("annual_income")} placeholder="Optional" />
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
          useAdminClient={isAdmin}
        />
      </div>
    </form>
  );
}
