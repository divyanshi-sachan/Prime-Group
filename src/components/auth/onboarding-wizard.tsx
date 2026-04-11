"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setStepIndex,
  updateStep1,
  updateStep2,
  updateStep3,
  setIsVisible,
  selectStepIndex,
  selectStep1,
  selectStep2,
  selectStep3,
  selectIsVisible,
  type Step1Data as ReduxStep1,
  type Step2Data as ReduxStep2,
  type Step3Data as ReduxStep3,
} from "@/store/slices/profileDraftSlice";
import { cn } from "@/lib/utils";
import {
  ProfilePhotoUpload,
  getProfilePhotoFiles,
  clearProfilePhotoFiles,
} from "./profile-photo-upload";
import { OnboardingChecklist } from "./onboarding-checklist";
import { dateOfBirthSchema, MAX_PROFILE_AGE, MIN_PROFILE_AGE } from "@/lib/auth/age-validation";
import {
  isAbortLikeError,
  userFacingAbortMessage,
} from "@/lib/network-errors";
import type { User } from "@supabase/supabase-js";

// Step 0: name, DOB, time, birthplace, gender, marital
const step0Schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  date_of_birth: dateOfBirthSchema,
  gender: z.enum(["male", "female", "other"]),
  birth_time: z.string().optional(),
  birthplace: z.string().optional(),
  marital_status: z.string().optional(),
});
// Step 1: physical + education + job
const step1Schema = z.object({
  height_cm: z.string().optional(),
  complexion: z.string().optional(),
  school: z.string().optional(),
  college_university: z.string().optional(),
  highest_education: z.string().optional(),
  field_of_study: z.string().optional(),
  employed_in: z.string().optional(),
  occupation: z.string().optional(),
  organization: z.string().optional(),
  annual_income: z.string().optional(),
});
// Step 2: your gotra (on profile)
const step2GotraSchema = z.object({
  gotra: z.string().optional(),
});
// Step 3: family
const step3FamilySchema = z.object({
  father_name: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_name: z.string().optional(),
  mother_occupation: z.string().optional(),
  has_siblings: z.boolean().optional(),
  siblings_brothers: z.string().optional(),
  siblings_sisters: z.string().optional(),
  siblings_notes: z.string().optional(),
});
// Step 4: contact + location
const step4ContactSchema = z.object({
  permanent_address: z.string().optional(),
  current_address: z.string().optional(),
  contact_number: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().min(1, "City is required"),
  willing_to_relocate: z.string().optional(),
});
// Step 5: partner preference = what you're looking for (age + notes)
const step5PreferenceSchema = z
  .object({
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

type Step0Data = z.infer<typeof step0Schema>;
type Step1Data = z.infer<typeof step1Schema>;
type Step2GotraData = z.infer<typeof step2GotraSchema>;
type Step3FamilyData = z.infer<typeof step3FamilySchema>;
type Step4ContactData = z.infer<typeof step4ContactSchema>;
type Step5PreferenceData = z.infer<typeof step5PreferenceSchema>;

type AllFormData = Step0Data & Step1Data & Step2GotraData & Step3FamilyData & Step4ContactData & Step5PreferenceData;

const STEP_SCHEMAS = [
  step0Schema,
  step1Schema,
  step2GotraSchema,
  step3FamilySchema,
  step4ContactSchema,
  step5PreferenceSchema,
  null, // photos
] as const;

const STEP_LABELS = [
  "Basic Information",
  "Education & Work",
  "Your Gotra",
  "Family Details",
  "Contact & Location",
  "Partner Preference",
  "Photos",
];
const PHOTOS_STEP_INDEX = 6;
const ROYAL_GOLD = "rgba(198,167,94,0.5)";

interface OnboardingWizardProps {
  userId: string;
  existingProfileId?: string;
  email?: string;
}

export function OnboardingWizard({ userId, existingProfileId, email }: OnboardingWizardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxStepIndex = useAppSelector(selectStepIndex);
  const reduxStep1 = useAppSelector(selectStep1);
  const reduxStep2 = useAppSelector(selectStep2);
  const reduxStep3 = useAppSelector(selectStep3);
  const isVisible = useAppSelector(selectIsVisible);

  const [step, setStep] = useState(reduxStepIndex);
  const [saving, setSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDbError = (context: string, err: unknown) => {
    if (isAbortLikeError(err)) {
      console.warn("[onboarding-db-error] abort-like", { context });
      return userFacingAbortMessage();
    }
    const e = err as { message?: string; code?: string; details?: string; hint?: string };
    const payload = {
      context,
      code: e?.code,
      message: e?.message,
      details: e?.details,
      hint: e?.hint,
    };
    console.error("[onboarding-db-error]", payload);
    return e?.message || "Something went wrong";
  };

  async function getSessionUserWithRetry(
    supabase: ReturnType<typeof createClient>
  ): Promise<{ user: User | null; error: { message?: string } | null }> {
    let lastError: { message?: string } | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      lastError = error;
      if (user) return { user, error: null };
      if (error && isAbortLikeError(error) && attempt === 0) {
        await new Promise((r) => setTimeout(r, 350));
        continue;
      }
      break;
    }
    return { user: null, error: lastError };
  }

  useEffect(() => {
    if (isFinalizing) return;
    setStep(reduxStepIndex);
  }, [reduxStepIndex, isFinalizing]);

  const currentSchema = step === PHOTOS_STEP_INDEX ? null : STEP_SCHEMAS[step];
  const defaultVals: AllFormData = {
    full_name: reduxStep1.full_name ?? "",
    gender: reduxStep1.gender ?? "male",
    date_of_birth: reduxStep1.date_of_birth ?? "",
    birth_time: reduxStep1.birth_time ?? "",
    birthplace: reduxStep1.birthplace ?? "",
    marital_status: reduxStep1.marital_status ?? "",
    height_cm: reduxStep1.height_cm ?? "",
    complexion: reduxStep1.complexion ?? "",
    school: reduxStep1.school ?? "",
    college_university: reduxStep1.college_university ?? "",
    highest_education: reduxStep1.highest_education ?? "",
    field_of_study: reduxStep1.field_of_study ?? "",
    employed_in: reduxStep1.employed_in ?? "",
    occupation: reduxStep1.occupation ?? "",
    organization: reduxStep1.organization ?? "",
    annual_income: reduxStep1.annual_income ?? "",
    gotra: reduxStep1.gotra ?? "",
    father_name: reduxStep2.father_name ?? "",
    father_occupation: reduxStep2.father_occupation ?? "",
    mother_name: reduxStep2.mother_name ?? "",
    mother_occupation: reduxStep2.mother_occupation ?? "",
    has_siblings: reduxStep2.has_siblings ?? false,
    siblings_brothers: reduxStep2.siblings_brothers ?? "",
    siblings_sisters: reduxStep2.siblings_sisters ?? "",
    siblings_notes: reduxStep2.siblings_notes ?? "",
    permanent_address: reduxStep2.permanent_address ?? "",
    current_address: reduxStep2.current_address ?? "",
    contact_number: reduxStep2.contact_number ?? "",
    country: reduxStep2.country ?? "India",
    state: reduxStep2.state ?? "",
    city: reduxStep2.city ?? "",
    willing_to_relocate: reduxStep2.willing_to_relocate ?? "",
    age_min: reduxStep3.age_min ?? 25,
    age_max: reduxStep3.age_max ?? 35,
    additional_notes: reduxStep3.additional_notes ?? "",
  };
  const form = useForm<AllFormData>({
    resolver: currentSchema ? zodResolver(currentSchema) : undefined,
    defaultValues: defaultVals,
  });

  useEffect(() => {
    form.reset({
      full_name: reduxStep1.full_name ?? "",
      gender: reduxStep1.gender ?? "male",
      date_of_birth: reduxStep1.date_of_birth ?? "",
      birth_time: reduxStep1.birth_time ?? "",
      birthplace: reduxStep1.birthplace ?? "",
      marital_status: reduxStep1.marital_status ?? "",
      height_cm: reduxStep1.height_cm ?? "",
      complexion: reduxStep1.complexion ?? "",
      school: reduxStep1.school ?? "",
      college_university: reduxStep1.college_university ?? "",
      highest_education: reduxStep1.highest_education ?? "",
      field_of_study: reduxStep1.field_of_study ?? "",
      employed_in: reduxStep1.employed_in ?? "",
      occupation: reduxStep1.occupation ?? "",
      organization: reduxStep1.organization ?? "",
      annual_income: reduxStep1.annual_income ?? "",
      gotra: reduxStep1.gotra ?? "",
      father_name: reduxStep2.father_name ?? "",
      father_occupation: reduxStep2.father_occupation ?? "",
      mother_name: reduxStep2.mother_name ?? "",
      mother_occupation: reduxStep2.mother_occupation ?? "",
      has_siblings: reduxStep2.has_siblings ?? false,
      siblings_brothers: reduxStep2.siblings_brothers ?? "",
      siblings_sisters: reduxStep2.siblings_sisters ?? "",
      siblings_notes: reduxStep2.siblings_notes ?? "",
      permanent_address: reduxStep2.permanent_address ?? "",
      current_address: reduxStep2.current_address ?? "",
      contact_number: reduxStep2.contact_number ?? "",
      country: reduxStep2.country ?? "India",
      state: reduxStep2.state ?? "",
      city: reduxStep2.city ?? "",
      willing_to_relocate: reduxStep2.willing_to_relocate ?? "",
      age_min: reduxStep3.age_min ?? 25,
      age_max: reduxStep3.age_max ?? 35,
      additional_notes: reduxStep3.additional_notes ?? "",
    });
  }, [reduxStep1, reduxStep2, reduxStep3, form]);

  const persistStepToRedux = (stepIndex: number, data: AllFormData) => {
    if (stepIndex <= 2) {
      const payload: Partial<ReduxStep1> = {
        full_name: data.full_name,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        birth_time: data.birth_time,
        marital_status: data.marital_status,
        birthplace: data.birthplace,
        height_cm: data.height_cm,
        complexion: data.complexion,
        school: data.school,
        college_university: data.college_university,
        highest_education: data.highest_education,
        field_of_study: data.field_of_study,
        employed_in: data.employed_in,
        occupation: data.occupation,
        organization: data.organization,
        annual_income: data.annual_income,
        gotra: data.gotra,
      };
      dispatch(updateStep1(payload));
    } else if (stepIndex <= 4) {
      const payload: Partial<ReduxStep2> = {
        father_name: data.father_name,
        father_occupation: data.father_occupation,
        mother_name: data.mother_name,
        mother_occupation: data.mother_occupation,
        has_siblings: data.has_siblings,
        siblings_brothers: data.siblings_brothers,
        siblings_sisters: data.siblings_sisters,
        siblings_notes: data.siblings_notes,
        permanent_address: data.permanent_address,
        current_address: data.current_address,
        contact_number: data.contact_number,
        country: data.country,
        state: data.state,
        city: data.city,
        willing_to_relocate: data.willing_to_relocate,
      };
      dispatch(updateStep2(payload));
    } else if (stepIndex === 5) {
      dispatch(updateStep3({
        age_min: data.age_min ?? 25,
        age_max: data.age_max ?? 35,
        additional_notes: data.additional_notes ?? "",
      }));
    }
  };

  const onSubmit = async (data: AllFormData) => {
    setError(null);
    setSaving(true);
    if (step === PHOTOS_STEP_INDEX) {
      setIsFinalizing(true);
    }
    const merged = { ...form.getValues(), ...data } as AllFormData;
    persistStepToRedux(step, merged);

    const supabase = createClient();

    let photosFlowNavigatedAway = false;

    try {
      const { user: currentUser, error: authErr } = await getSessionUserWithRetry(supabase);
      if (!currentUser) {
        if (authErr && isAbortLikeError(authErr)) {
          setError(userFacingAbortMessage());
        } else {
          setError("Session expired. Please sign in again.");
        }
        return;
      }
      const effectiveUserId = currentUser.id;

      if (step === PHOTOS_STEP_INDEX) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", effectiveUserId)
          .maybeSingle();
        if (!profile) throw new Error("Profile not found");

        // Save visibility preference + finalize completion.
        const { error: finalizeErr } = await supabase
          .from("profiles")
          .update({
            is_visible: isVisible,
            profile_completion_pct: 100,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id)
          .eq("user_id", effectiveUserId);
        if (finalizeErr) throw new Error(formatDbError("profile-finalize", finalizeErr));

        const files = getProfilePhotoFiles();
        const bucket = "profile-photos";
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const ext = file.name.split(".").pop() || "jpg";
          const path = `${effectiveUserId}/${profile.id}-${i}-${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });
          if (uploadErr) throw new Error(formatDbError("photo-upload", uploadErr));
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
          const { error: insertErr } = await supabase.from("profile_photos").insert({
            profile_id: profile.id,
            user_id: effectiveUserId,
            photo_url: urlData.publicUrl,
            display_order: i,
            is_primary: i === 0,
            status: "pending",
          });
          if (insertErr) throw new Error(formatDbError("profile-photos-insert", insertErr));
        }
        clearProfilePhotoFiles();
        router.refresh();
        router.push("/onboarding/thank-you");
        photosFlowNavigatedAway = true;
        return;
      }

      const getProfileId = async () => {
        const { data: p, error: fetchErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", effectiveUserId)
          .maybeSingle();
        if (fetchErr) throw new Error(formatDbError("profile-fetch", fetchErr));
        if (!p?.id) throw new Error("Profile not found. Please complete the earlier steps.");
        return p.id;
      };

      if (step === 0) {
        const payload = {
          user_id: effectiveUserId,
          full_name: merged.full_name,
          gender: merged.gender,
          date_of_birth: merged.date_of_birth,
          birth_time: merged.birth_time || null,
          marital_status: merged.marital_status || null,
          birthplace: merged.birthplace || null,
          profile_status: "pending",
          profile_completion_pct: Math.round((1 / 7) * 100),
        };
        if (existingProfileId) {
          const { error: e } = await supabase.from("profiles").update(payload).eq("id", existingProfileId);
          if (e) throw new Error(formatDbError("profile-update-step0", e));
        } else {
          const { error: e } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
          if (e) throw new Error(formatDbError("profile-upsert-step0", e));
        }
      } else if (step === 1) {
        const profileId = await getProfileId();
        const incomeRaw = merged.annual_income?.trim();
        const incomeParsed = incomeRaw ? parseInt(incomeRaw, 10) : null;
        const payload = {
          height_cm: merged.height_cm ? parseInt(merged.height_cm, 10) : null,
          complexion: merged.complexion || null,
          school: merged.school || null,
          college_university: merged.college_university || null,
          highest_education: merged.highest_education || null,
          field_of_study: merged.field_of_study || null,
          employed_in: merged.employed_in || null,
          occupation: merged.occupation || null,
          organization: merged.organization || null,
          annual_income:
            incomeParsed !== null && !Number.isNaN(incomeParsed) && incomeParsed >= 0 ? incomeParsed : null,
          profile_completion_pct: Math.round((2 / 7) * 100),
          updated_at: new Date().toISOString(),
        };
        const { error: e } = await supabase.from("profiles").update(payload).eq("id", profileId);
        if (e) throw new Error(formatDbError("profile-update-step1", e));
      } else if (step === 2) {
        const profileId = await getProfileId();
        const { error: e } = await supabase
          .from("profiles")
          .update({
            gotra: merged.gotra || null,
            profile_completion_pct: Math.round((3 / 7) * 100),
            updated_at: new Date().toISOString(),
          })
          .eq("id", profileId);
        if (e) throw new Error(formatDbError("profile-update-gotra", e));
      } else if (step === 3) {
        const profileId = await getProfileId();
        const parseSiblingCount = (v: string | undefined): number | null => {
          if (!v?.trim()) return null;
          const n = parseInt(v.trim(), 10);
          return Number.isNaN(n) ? null : n;
        };
        const payload = {
          father_name: merged.father_name || null,
          father_occupation: merged.father_occupation || null,
          mother_name: merged.mother_name || null,
          mother_occupation: merged.mother_occupation || null,
          has_siblings: merged.has_siblings ?? false,
          siblings_brothers: parseSiblingCount(merged.siblings_brothers),
          siblings_sisters: parseSiblingCount(merged.siblings_sisters),
          siblings_notes: merged.siblings_notes || null,
          profile_completion_pct: Math.round((4 / 7) * 100),
          updated_at: new Date().toISOString(),
        };
        const { error: e } = await supabase.from("profiles").update(payload).eq("id", profileId);
        if (e) throw new Error(formatDbError("profile-update-family", e));
      } else if (step === 4) {
        const profileId = await getProfileId();
        const payload = {
          permanent_address: merged.permanent_address || null,
          current_address: merged.current_address || null,
          contact_number: merged.contact_number || null,
          country: merged.country,
          state: merged.state || null,
          city: merged.city,
          willing_to_relocate: merged.willing_to_relocate || null,
          profile_completion_pct: Math.round((5 / 7) * 100),
          updated_at: new Date().toISOString(),
        };
        const { error: e } = await supabase.from("profiles").update(payload).eq("id", profileId);
        if (e) throw new Error(formatDbError("profile-update-contact", e));
      } else if (step === 5) {
        const profileId = await getProfileId();
        await supabase
          .from("profiles")
          .update({
            profile_completion_pct: Math.round((6 / 7) * 100),
            updated_at: new Date().toISOString(),
          })
          .eq("id", profileId);

        const { data: existingPref, error: prefFetchErr } = await supabase
          .from("partner_preferences")
          .select("id")
          .eq("profile_id", profileId)
          .maybeSingle();
        if (prefFetchErr) throw new Error(formatDbError("partner-pref-fetch", prefFetchErr));
        const prefPayload = {
          profile_id: profileId,
          user_id: effectiveUserId,
          age_min: merged.age_min ?? null,
          age_max: merged.age_max ?? null,
          additional_notes: merged.additional_notes || null,
        };
        if (existingPref) {
          const { error: prefUpdateErr } = await supabase
            .from("partner_preferences")
            .update(prefPayload)
            .eq("id", existingPref.id);
          if (prefUpdateErr) throw new Error(formatDbError("partner-pref-update", prefUpdateErr));
        } else {
          const { error: prefInsertErr } = await supabase.from("partner_preferences").insert(prefPayload);
          if (prefInsertErr) throw new Error(formatDbError("partner-pref-insert", prefInsertErr));
        }
      }

      if (step < PHOTOS_STEP_INDEX) {
        dispatch(setStepIndex(step + 1));
        setStep(step + 1);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("[onboarding-submit-error]", {
          step,
          message: err.message,
          userIdProp: userId,
        });
      } else {
        console.error("[onboarding-submit-error]", { step, err });
      }
      if (isAbortLikeError(err)) {
        setError(userFacingAbortMessage());
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSaving(false);
      if (step === PHOTOS_STEP_INDEX && !photosFlowNavigatedAway) {
        setIsFinalizing(false);
      }
    }
  };

  const handleBack = () => {
    if (step === PHOTOS_STEP_INDEX) {
      dispatch(setStepIndex(5));
      setStep(5);
      return;
    }
    const d = form.getValues();
    persistStepToRedux(step, d);
    dispatch(setStepIndex(step - 1));
    setStep(step - 1);
  };

  const handleFormSubmit = form.handleSubmit((d) => onSubmit(d));

  const inputClass =
    "border-[var(--primary-blue)]/25 bg-white/80 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary-blue)]/40 focus-visible:border-[var(--primary-blue)]/50";
  const selectTriggerClass =
    "border-[var(--primary-blue)]/25 bg-white/80 transition-colors focus:ring-2 focus:ring-[var(--primary-blue)]/40 focus:border-[var(--primary-blue)]/50 data-[placeholder]:text-muted-foreground";

  const err = (field: string) => (form.formState.errors as Record<string, { message?: string }>)[field]?.message;

  return (
    <div className="relative flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start w-full">
      {isFinalizing && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 px-6 bg-[#FDFBF7]/95 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="onboarding-finalize-title"
          aria-busy="true"
        >
          <Spinner size="md" />
          <div className="max-w-md text-center space-y-2">
            <h2
              id="onboarding-finalize-title"
              className="font-playfair-display text-xl sm:text-2xl font-bold"
              style={{ color: "var(--primary-blue)" }}
            >
              Saving your profile…
            </h2>
            <p className="text-sm font-general text-gray-600 leading-relaxed">
              Please wait while we upload your photos and register your details. This may take a moment on slower connections.
            </p>
          </div>
        </div>
      )}
      <div className="order-1 lg:order-2 lg:col-span-4 w-full lg:sticky lg:top-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <OnboardingChecklist currentStep={step} email={email} />
      </div>

      <div className="order-2 lg:order-1 lg:col-span-8 w-full">
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Ultra-subtle royal watermark — centered behind form, barely visible */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]"
        aria-hidden
      >
        <svg viewBox="0 0 120 120" className="w-64 h-64" fill="none" stroke="#8B7A5A" strokeWidth="0.5">
          <circle cx="60" cy="60" r="50" />
          <circle cx="60" cy="60" r="38" />
          <circle cx="60" cy="60" r="26" />
          {[...Array(12)].map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line key={i} x1={60 + 26 * Math.cos(a)} y1={60 + 26 * Math.sin(a)} x2={60 + 50 * Math.cos(a)} y2={60 + 50 * Math.sin(a)} />
            );
          })}
        </svg>
      </div>

      {/* Heading block — ceremonial divider then step (regal, not technical) */}
      <h1
        className="font-playfair-display text-5xl font-bold tracking-tight text-center"
        style={{ color: "var(--primary-blue)" }}
      >
        Create Your Profile
      </h1>
      <div className="flex justify-center my-6">
        <div className="h-[2px] w-24 bg-[#D4AF37]" />
      </div>
      <p className="text-center text-[10px] uppercase tracking-[0.4em] text-[#8B7A5A]">
        STEP {step + 1} OF {STEP_LABELS.length} · {STEP_LABELS[step].toUpperCase()}
      </p>
      <p className="text-center text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
        Your journey to meaningful companionship begins here.
      </p>

      {step === PHOTOS_STEP_INDEX ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(form.getValues());
          }}
          className="mt-14 space-y-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="rounded-2xl bg-white/70 border border-[var(--primary-blue)]/10 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
                  Show my profile in Discovery
                </p>
                <p className="text-xs text-gray-600">
                  If turned off, your profile stays private and won’t appear in Discover even after approval.
                </p>
              </div>
              <Switch
                checked={isVisible}
                onCheckedChange={(v) => dispatch(setIsVisible(v))}
                className="data-[state=checked]:bg-[var(--primary-blue)] data-[state=unchecked]:bg-gray-200"
              />
            </div>
          </div>

          <ProfilePhotoUpload />
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 py-3 rounded-2xl border-2 transition-all duration-300 hover:bg-[var(--accent-gold)]/10 focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/50 focus-visible:ring-offset-2"
              style={{ borderColor: ROYAL_GOLD, color: "var(--primary-blue)" }}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(212,175,55,0.25)] focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/60 focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--primary-blue)", color: "var(--pure-white)" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleFormSubmit} className="mt-14 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="full_name" className="font-medium" style={{ color: "var(--primary-blue)" }}>Full name *</Label>
                <Input id="full_name" {...form.register("full_name")} className={cn("w-full", inputClass)} placeholder="Your full name" />
                {err("full_name") && <p className="text-sm text-red-500">{err("full_name")}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="font-medium" style={{ color: "var(--primary-blue)" }}>Date of birth *</Label>
                  <Input id="date_of_birth" type="date" {...form.register("date_of_birth")} className={cn("w-full", inputClass)} />
                  <p className="text-xs text-gray-600 font-general leading-relaxed">
                    You must be between {MIN_PROFILE_AGE} and {MAX_PROFILE_AGE} years old.
                  </p>
                  {err("date_of_birth") && <p className="text-sm text-red-500">{err("date_of_birth")}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_time" className="font-medium" style={{ color: "var(--primary-blue)" }}>Time of birth</Label>
                  <Input id="birth_time" type="time" {...form.register("birth_time")} className={cn("w-full", inputClass)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthplace" className="font-medium" style={{ color: "var(--primary-blue)" }}>Birthplace (city or town of birth)</Label>
                <Input id="birthplace" {...form.register("birthplace")} className={cn("w-full", inputClass)} placeholder="Where you were born" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Gender *</Label>
                  <Select onValueChange={(v) => form.setValue("gender", v as AllFormData["gender"])} value={form.watch("gender")}>
                    <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Marital status</Label>
                  <Select onValueChange={(v) => form.setValue("marital_status", v)} value={form.watch("marital_status")}>
                    <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never_married">Never Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height_cm" className="font-medium" style={{ color: "var(--primary-blue)" }}>Height (cm)</Label>
                  <Input id="height_cm" type="text" inputMode="numeric" {...form.register("height_cm")} className={cn("w-full", inputClass)} placeholder="e.g. 170" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexion" className="font-medium" style={{ color: "var(--primary-blue)" }}>Complexion</Label>
                  <Input id="complexion" {...form.register("complexion")} className={cn("w-full", inputClass)} placeholder="e.g. Fair, Wheatish" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school" className="font-medium" style={{ color: "var(--primary-blue)" }}>School</Label>
                <Input id="school" {...form.register("school")} className={cn("w-full", inputClass)} placeholder="School name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college_university" className="font-medium" style={{ color: "var(--primary-blue)" }}>College / University</Label>
                <Input id="college_university" {...form.register("college_university")} className={cn("w-full", inputClass)} placeholder="College or university" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highest_education" className="font-medium" style={{ color: "var(--primary-blue)" }}>Degree / highest qualification</Label>
                <Input id="highest_education" {...form.register("highest_education")} className={cn("w-full", inputClass)} placeholder="e.g. B.Tech, MBA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_of_study" className="font-medium" style={{ color: "var(--primary-blue)" }}>Field of study</Label>
                <Input id="field_of_study" {...form.register("field_of_study")} className={cn("w-full", inputClass)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employed_in" className="font-medium" style={{ color: "var(--primary-blue)" }}>Employed in</Label>
                <Input id="employed_in" {...form.register("employed_in")} className={cn("w-full", inputClass)} placeholder="e.g. Private sector (optional)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation" className="font-medium" style={{ color: "var(--primary-blue)" }}>Occupation / role</Label>
                <Input id="occupation" {...form.register("occupation")} className={cn("w-full", inputClass)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization" className="font-medium" style={{ color: "var(--primary-blue)" }}>Working at (job / company)</Label>
                <Input id="organization" {...form.register("organization")} className={cn("w-full", inputClass)} placeholder="Company or profession" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annual_income" className="font-medium" style={{ color: "var(--primary-blue)" }}>Annual income (INR, optional)</Label>
                <Input id="annual_income" type="text" inputMode="numeric" {...form.register("annual_income")} className={cn("w-full", inputClass)} placeholder="e.g. 1200000" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="gotra" className="font-medium" style={{ color: "var(--primary-blue)" }}>Your gotra (optional)</Label>
                <Input id="gotra" {...form.register("gotra")} className={cn("w-full", inputClass)} placeholder="Your gotra" />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="father_name" className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Father&apos;s name</Label>
                  <Input id="father_name" {...form.register("father_name")} className={cn("w-full", inputClass)} placeholder="Father's name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_occupation" className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Father&apos;s occupation</Label>
                  <Input id="father_occupation" {...form.register("father_occupation")} className={cn("w-full", inputClass)} placeholder="Occupation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_name" className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Mother&apos;s name</Label>
                  <Input id="mother_name" {...form.register("mother_name")} className={cn("w-full", inputClass)} placeholder="Mother's name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_occupation" className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Mother&apos;s occupation</Label>
                  <Input id="mother_occupation" {...form.register("mother_occupation")} className={cn("w-full", inputClass)} placeholder="Occupation" />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="has_siblings" checked={form.watch("has_siblings")} onChange={(e) => form.setValue("has_siblings", e.target.checked)} className="rounded border-[var(--primary-blue)]/40" />
                  <Label htmlFor="has_siblings" className="font-medium text-sm cursor-pointer" style={{ color: "var(--primary-blue)" }}>I have siblings</Label>
                </div>
                {form.watch("has_siblings") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-[var(--primary-blue)]/20">
                    <div className="space-y-2">
                      <Label htmlFor="siblings_brothers" className="font-medium text-sm">Brothers (count or details)</Label>
                      <Input id="siblings_brothers" {...form.register("siblings_brothers")} className={cn("w-full", inputClass)} placeholder="e.g. 2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siblings_sisters" className="font-medium text-sm">Sisters (count or details)</Label>
                      <Input id="siblings_sisters" {...form.register("siblings_sisters")} className={cn("w-full", inputClass)} placeholder="e.g. 1" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="siblings_notes" className="font-medium text-sm">Siblings notes (optional)</Label>
                      <Input id="siblings_notes" {...form.register("siblings_notes")} className={cn("w-full", inputClass)} placeholder="Any additional details" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="permanent_address" className="font-medium" style={{ color: "var(--primary-blue)" }}>Permanent address</Label>
                <Input
                  id="permanent_address"
                  {...form.register("permanent_address")}
                  className={cn("w-full", inputClass)}
                  placeholder="Native / permanent address"
                />
                <Label htmlFor="current_address" className="font-medium mt-3 block" style={{ color: "var(--primary-blue)" }}>Current address</Label>
                <Input
                  id="current_address"
                  {...form.register("current_address")}
                  className={cn("w-full", inputClass)}
                  placeholder="If same as permanent, you can leave blank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number" className="font-medium" style={{ color: "var(--primary-blue)" }}>Contact number</Label>
                <Input id="contact_number" type="tel" {...form.register("contact_number")} className={cn("w-full", inputClass)} placeholder="Phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="font-medium" style={{ color: "var(--primary-blue)" }}>Country *</Label>
                <Input id="country" {...form.register("country")} className={cn("w-full", inputClass)} placeholder="e.g. India" />
                {err("country") && <p className="text-sm text-red-500">{err("country")}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="font-medium" style={{ color: "var(--primary-blue)" }}>State</Label>
                  <Input id="state" {...form.register("state")} className={cn("w-full", inputClass)} placeholder="State" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-medium" style={{ color: "var(--primary-blue)" }}>City *</Label>
                  <Input id="city" {...form.register("city")} className={cn("w-full", inputClass)} placeholder="City" />
                  {err("city") && <p className="text-sm text-red-500">{err("city")}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Willing to relocate?</Label>
                <Select onValueChange={(v) => form.setValue("willing_to_relocate", v)} value={form.watch("willing_to_relocate")}>
                  <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-sm text-[#8B7A5A] mb-3">What are you looking for in a partner?</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_min" className="font-medium" style={{ color: "var(--primary-blue)" }}>Partner age (min)</Label>
                  <Input id="age_min" type="number" min={18} max={100} {...form.register("age_min")} className={cn("w-full", inputClass)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_max" className="font-medium" style={{ color: "var(--primary-blue)" }}>Partner age (max)</Label>
                  <Input id="age_max" type="number" min={18} max={100} {...form.register("age_max")} className={cn("w-full", inputClass)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_notes" className="font-medium" style={{ color: "var(--primary-blue)" }}>Your preference (optional)</Label>
                <textarea
                  id="additional_notes"
                  {...form.register("additional_notes")}
                  className={cn(
                    "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "border-[var(--primary-blue)]/25 bg-white/80 focus-visible:ring-[var(--primary-blue)]/40 focus-visible:border-[var(--primary-blue)]/50"
                  )}
                  placeholder="What kind of partner are you looking for?"
                  maxLength={500}
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-8">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 py-3 rounded-2xl border-2 transition-all duration-300 hover:bg-[var(--accent-gold)]/10 focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/50 focus-visible:ring-offset-2"
                style={{ borderColor: ROYAL_GOLD, color: "var(--primary-blue)" }}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(212,175,55,0.25)] focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/60 focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--primary-blue)", color: "var(--pure-white)" }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                step < PHOTOS_STEP_INDEX ? "Continue" : "Finish"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Mobile-only: move help box under the form */}
      <div className="sm:hidden mt-8">
        <div className="rounded-2xl bg-white p-4 border border-[var(--primary-blue)]/10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-[var(--primary-blue)] mb-1">Need Help?</p>
          <p className="text-xs text-gray-600 mb-2">
            Contact Prime Group if you face any issues while filling the form.
          </p>
          <a href="tel:+919876543210" className="inline-block text-sm font-bold text-[var(--accent-gold)] tracking-wide">
            +91 98765 43210
          </a>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
