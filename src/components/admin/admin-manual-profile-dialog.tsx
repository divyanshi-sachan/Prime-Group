"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserPlus, Copy, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { manualProfileFinalizeSchema } from "@/lib/admin/manual-profile-schema";
import { MAX_PROFILE_AGE, MIN_PROFILE_AGE } from "@/lib/auth/age-validation";
import { PASSWORD_MIN_LENGTH, signupPasswordSchema } from "@/lib/auth/password-policy";
import { ProfilePhotoManager } from "@/components/profile/profile-photo-manager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROYAL_GOLD = "rgba(198,167,94,0.5)";

const STEP_LABELS = [
  "Account & login",
  "Basic information",
  "Education & work",
  "Your gotra",
  "Family details",
  "Contact & location",
  "Partner preference",
  "Bio, visibility & admin",
  "Photos",
] as const;

/** Step index for photo upload (after profile row exists). */
const PHOTOS_STEP_INDEX = 8;
const LAST_STEP = STEP_LABELS.length - 1;

type ManualWizardFormValues = {
  email: string;
  /** Initial login password (admin-chosen); not echoed after submit. */
  temp_password: string;
  temp_password_confirm: string;
  full_name: string;
  gender: "male" | "female" | "other";
  date_of_birth: string;
  birth_time: string;
  birthplace: string;
  marital_status: string;
  religion: string;
  mother_tongue: string;
  profile_for: string;
  height_cm: string;
  complexion: string;
  school: string;
  college_university: string;
  field_of_study: string;
  highest_education: string;
  employed_in: string;
  occupation: string;
  organization: string;
  annual_income: string;
  gotra: string;
  father_name: string;
  father_occupation: string;
  mother_name: string;
  mother_occupation: string;
  has_siblings: boolean;
  siblings_brothers: string;
  siblings_sisters: string;
  siblings_notes: string;
  siblings_count: string;
  permanent_address: string;
  current_address: string;
  contact_number: string;
  country: string;
  state: string;
  city: string;
  citizenship: string;
  residing_in: string;
  willing_to_relocate: string;
  about_me: string;
  admin_notes: string;
  rejection_reason: string;
  profile_status: "pending" | "active" | "rejected" | "suspended";
  is_visible: boolean;
  verification_status: string;
  show_education: boolean;
  show_occupation: boolean;
  show_family: boolean;
  show_location: boolean;
  age_min: string;
  age_max: string;
  additional_notes: string;
};

const defaultFormValues: ManualWizardFormValues = {
  email: "",
  temp_password: "",
  temp_password_confirm: "",
  full_name: "",
  gender: "female",
  date_of_birth: "",
  birth_time: "",
  birthplace: "",
  marital_status: "",
  religion: "",
  mother_tongue: "",
  profile_for: "",
  height_cm: "",
  complexion: "",
  school: "",
  college_university: "",
  field_of_study: "",
  highest_education: "",
  employed_in: "",
  occupation: "",
  organization: "",
  annual_income: "",
  gotra: "",
  father_name: "",
  father_occupation: "",
  mother_name: "",
  mother_occupation: "",
  has_siblings: false,
  siblings_brothers: "",
  siblings_sisters: "",
  siblings_notes: "",
  siblings_count: "",
  permanent_address: "",
  current_address: "",
  contact_number: "",
  country: "India",
  state: "",
  city: "",
  citizenship: "",
  residing_in: "",
  willing_to_relocate: "",
  about_me: "",
  admin_notes: "",
  rejection_reason: "",
  profile_status: "pending",
  is_visible: true,
  verification_status: "unverified",
  show_education: true,
  show_occupation: true,
  show_family: true,
  show_location: true,
  age_min: "25",
  age_max: "35",
  additional_notes: "",
};

function formToApiPayload(v: ManualWizardFormValues): Record<string, unknown> {
  return {
    email: v.email.trim().toLowerCase(),
    password: v.temp_password,
    full_name: v.full_name.trim(),
    gender: v.gender,
    date_of_birth: v.date_of_birth,
    birth_time: v.birth_time || null,
    birthplace: v.birthplace || null,
    marital_status: v.marital_status || null,
    religion: v.religion || null,
    mother_tongue: v.mother_tongue || null,
    profile_for: v.profile_for || null,
    height_cm: v.height_cm.trim() === "" ? null : v.height_cm.trim(),
    complexion: v.complexion || null,
    school: v.school || null,
    college_university: v.college_university || null,
    field_of_study: v.field_of_study || null,
    highest_education: v.highest_education || null,
    employed_in: v.employed_in || null,
    occupation: v.occupation || null,
    organization: v.organization || null,
    annual_income: v.annual_income.trim() === "" ? null : v.annual_income.trim(),
    gotra: v.gotra || null,
    father_name: v.father_name || null,
    father_occupation: v.father_occupation || null,
    mother_name: v.mother_name || null,
    mother_occupation: v.mother_occupation || null,
    has_siblings: v.has_siblings,
    siblings_brothers: v.siblings_brothers.trim() === "" ? null : v.siblings_brothers.trim(),
    siblings_sisters: v.siblings_sisters.trim() === "" ? null : v.siblings_sisters.trim(),
    siblings_notes: v.siblings_notes || null,
    siblings_count: v.siblings_count.trim() === "" ? null : v.siblings_count.trim(),
    permanent_address: v.permanent_address || null,
    current_address: v.current_address || null,
    contact_number: v.contact_number || null,
    country: v.country || null,
    state: v.state || null,
    city: v.city || null,
    citizenship: v.citizenship || null,
    residing_in: v.residing_in || null,
    willing_to_relocate: v.willing_to_relocate || null,
    about_me: v.about_me || null,
    admin_notes: v.admin_notes || null,
    rejection_reason: v.rejection_reason || null,
    profile_status: v.profile_status,
    is_visible: v.is_visible,
    verification_status: v.verification_status || null,
    show_education: v.show_education,
    show_occupation: v.show_occupation,
    show_family: v.show_family,
    show_location: v.show_location,
    age_min: v.age_min.trim() === "" ? null : v.age_min.trim(),
    age_max: v.age_max.trim() === "" ? null : v.age_max.trim(),
    additional_notes: v.additional_notes || null,
  };
}

function formToFinalizePayload(v: ManualWizardFormValues): Record<string, unknown> {
  const raw = formToApiPayload(v) as Record<string, unknown> & { password: string };
  const { password: _p, ...rest } = raw;
  return rest;
}

function validateStep(step: number, v: ManualWizardFormValues): string | null {
  if (step === 0) {
    const em = v.email.trim();
    if (!em) return "Member email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return "Enter a valid email address.";
    if (!v.temp_password) return "Temporary password is required.";
    if (v.temp_password !== v.temp_password_confirm) return "Password and confirmation do not match.";
    const pwCheck = signupPasswordSchema.safeParse(v.temp_password);
    if (!pwCheck.success) {
      return pwCheck.error.issues[0]?.message ?? `Password must meet requirements (min ${PASSWORD_MIN_LENGTH} characters).`;
    }
  }
  if (step === 1) {
    if (!v.full_name.trim() || v.full_name.trim().length < 2) return "Please enter a full name (at least 2 characters).";
    if (!v.date_of_birth) return "Date of birth is required.";
    if (!v.gender) return "Gender is required.";
  }
  return null;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function AdminManualProfileDialog({ open, onOpenChange, onCreated }: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPayload, setSuccessPayload] = useState<{
    message: string;
    accountEmail: string;
    attachedToExistingAccount: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  /** After step 1 succeeds: whether Supabase sent the account email and any warning. */
  const [accountEmailStatus, setAccountEmailStatus] = useState<{
    sent: boolean;
    warning?: string;
  } | null>(null);
  /** Profile created at step 7; photos uploaded against this id. */
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [pendingSuccess, setPendingSuccess] = useState<{
    message: string;
    accountEmail: string;
    attachedToExistingAccount: boolean;
  } | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const form = useForm<ManualWizardFormValues>({
    defaultValues: defaultFormValues,
  });

  const resetAll = () => {
    setError(null);
    setSuccessPayload(null);
    setCopied(false);
    setAccountEmailStatus(null);
    setStep(0);
    setCreatedProfileId(null);
    setCreatedUserId(null);
    setPendingSuccess(null);
    setExitConfirmOpen(false);
    form.reset(defaultFormValues);
  };

  const closeDialogFully = () => {
    resetAll();
    onOpenChange(false);
  };

  const requestCloseDialog = () => {
    if (successPayload) {
      closeDialogFully();
      return;
    }
    if (step > 0) {
      setExitConfirmOpen(true);
      return;
    }
    closeDialogFully();
  };

  const confirmDiscardAndClose = () => {
    setExitConfirmOpen(false);
    closeDialogFully();
  };

  useEffect(() => {
    if (open && !successPayload) {
      form.reset(defaultFormValues);
      setStep(0);
      setError(null);
      setAccountEmailStatus(null);
    }
  }, [open, successPayload, form.reset]);

  const inputClass =
    "border-[var(--primary-blue)]/25 bg-white/80 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary-blue)]/40 focus-visible:border-[var(--primary-blue)]/50";
  const selectTriggerClass =
    "border-[var(--primary-blue)]/25 bg-white/80 transition-colors focus:ring-2 focus:ring-[var(--primary-blue)]/40 focus:border-[var(--primary-blue)]/50 data-[placeholder]:text-muted-foreground";

  async function createProfileAndGoToPhotos() {
    setError(null);
    const raw = formToFinalizePayload(form.getValues());
    const parsed = manualProfileFinalizeSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first).flat()[0] ?? parsed.error.message;
      setError(typeof msg === "string" ? msg : "Please check the form for errors.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/profiles/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        accountEmail?: string;
        attachedToExistingAccount?: boolean;
        profileId?: string;
        userId?: string;
        details?: unknown;
      };

      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }

      const pid = data.profileId;
      const uid = data.userId;
      if (!pid || !uid) {
        setError("Profile was created but the server did not return ids. Add photos from the profile list.");
        setSuccessPayload({
          message: data.message ?? "Profile created.",
          accountEmail: data.accountEmail ?? "",
          attachedToExistingAccount: Boolean(data.attachedToExistingAccount),
        });
        form.reset(defaultFormValues);
        setStep(0);
        onCreated?.();
        return;
      }

      setPendingSuccess({
        message: data.message ?? "Profile created.",
        accountEmail: data.accountEmail ?? "",
        attachedToExistingAccount: Boolean(data.attachedToExistingAccount),
      });
      setCreatedProfileId(pid);
      setCreatedUserId(uid);
      setStep(PHOTOS_STEP_INDEX);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function completeWizardAfterPhotos() {
    if (pendingSuccess) {
      setSuccessPayload(pendingSuccess);
    }
    setPendingSuccess(null);
    setCreatedProfileId(null);
    setCreatedUserId(null);
    form.reset(defaultFormValues);
    setStep(0);
    onCreated?.();
  }

  const goNext = async () => {
    const v = form.getValues();
    const stepErr = validateStep(step, v);
    if (stepErr) {
      setError(stepErr);
      return;
    }
    setError(null);

    if (step === 0) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/admin/profiles/manual/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: v.email.trim().toLowerCase(),
            password: v.temp_password,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          emailSent?: boolean;
          emailWarning?: string;
          details?: unknown;
        };
        if (!res.ok) {
          setError(data.error ?? `Request failed (${res.status})`);
          return;
        }
        setAccountEmailStatus({
          sent: Boolean(data.emailSent),
          warning: typeof data.emailWarning === "string" ? data.emailWarning : undefined,
        });
        setStep(1);
      } catch {
        setError("Network error. Try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step === 7) {
      void createProfileAndGoToPhotos();
      return;
    }

    if (step < LAST_STEP) setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    if (step === PHOTOS_STEP_INDEX) return;
    if (step > 0) setStep((s) => s - 1);
  };

  const { register, watch, setValue } = form;

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        requestCloseDialog();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[var(--primary-blue)]/15 bg-[#FDFBF7] shadow-xl sm:max-w-3xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle
              className="font-playfair-display flex items-center gap-2 text-2xl pr-2"
              style={{ color: "var(--primary-blue)" }}
            >
              <UserPlus className="h-6 w-6 shrink-0" style={{ color: "var(--accent-gold)" }} aria-hidden />
              Add offline profile
            </DialogTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full border-[var(--primary-blue)]/25"
                  aria-label="How offline profiles and login work"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[min(100vw-2rem,22rem)] max-h-80 overflow-y-auto text-sm font-general leading-relaxed"
              >
                <p className="font-semibold text-foreground mb-2" style={{ color: "var(--primary-blue)" }}>
                  How this works
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">Step 1</strong> collects email and a temporary password. When you
                  continue, we create or update their account and <strong className="text-foreground">send them an email</strong>{" "}
                  (verification for new accounts, or a magic sign-in link if they already had a confirmed account).
                </p>
                <p className="text-muted-foreground mb-2">
                  Share the temporary password with them securely as well — it is not included in the automated email.
                </p>
                <p className="text-xs text-muted-foreground">
                  The password is never shown again after you leave step 1 — note it if you need it later.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <DialogDescription className="font-general text-left text-muted-foreground sr-only">
            Multi-step offline profile intake aligned with member onboarding.
          </DialogDescription>
          {!successPayload && (
            <>
              <div className="flex justify-center">
                <div className="h-0.5 w-16 bg-[#D4AF37]" />
              </div>
              <p className="text-center text-[10px] uppercase tracking-[0.35em] text-[#8B7A5A] font-general">
                Step {step + 1} of {STEP_LABELS.length} · {STEP_LABELS[step].toUpperCase()}
              </p>
              <p className="text-center text-sm text-gray-500 font-general max-w-md mx-auto">
                Same flow as member onboarding — fill what you have; optional fields can stay blank.
              </p>
              {step >= 1 && accountEmailStatus ? (
                <div
                  className={cn(
                    "mx-auto max-w-lg rounded-lg border px-3 py-2 text-center text-xs font-general",
                    accountEmailStatus.sent
                      ? "border-green-200 bg-green-50 text-green-900"
                      : "border-amber-200 bg-amber-50 text-amber-950"
                  )}
                  role="status"
                >
                  {accountEmailStatus.sent ? (
                    <>
                      We sent an account email to <span className="font-mono">{watch("email").trim()}</span>.
                    </>
                  ) : (
                    <>
                      We could not send the automated email
                      {accountEmailStatus.warning ? `: ${accountEmailStatus.warning}` : "."} The account was still
                      created — share the sign-in details manually or check Supabase Auth email settings.
                    </>
                  )}
                </div>
              ) : null}
            </>
          )}
        </DialogHeader>

        {successPayload ? (
          <div className="space-y-4 py-2">
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 font-general"
              role="status"
            >
              {successPayload.message}
            </div>

            <div className="space-y-2">
              <Label className="font-general text-xs uppercase tracking-wide text-gray-600">Member login email</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={successPayload.accountEmail}
                  className="font-mono text-xs sm:text-sm bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={async () => {
                    await navigator.clipboard.writeText(successPayload.accountEmail);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy email</span>
                </Button>
              </div>
              <p className="text-xs text-gray-600 font-general">
                Share the <strong>temporary password you entered</strong> with the member securely. It is not stored in
                this message. If they forget it, use Forgot password or reset the user in Supabase Authentication.
              </p>
              {successPayload.attachedToExistingAccount ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 font-general">
                  This email already had an account — their password was updated to your temporary password.
                </p>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                onClick={() => closeDialogFully()}
                style={{ backgroundColor: "var(--primary-blue)" }}
                className="text-white"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : step === PHOTOS_STEP_INDEX && createdProfileId && createdUserId ? (
          <div className="mt-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800 font-general" role="alert">
                {error}
              </div>
            )}
            <p className="text-sm text-gray-600 font-general">
              The profile is saved. Add photos now (optional) — same square crop and limits as member onboarding. You can
              also add or edit them later from the profile list.
            </p>
            <ProfilePhotoManager
              profileId={createdProfileId}
              userId={createdUserId}
              initialPhotos={[]}
              onUpdate={() => {}}
              useAdminClient
            />
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => requestCloseDialog()}
                className="w-full sm:w-auto rounded-2xl border-2"
                style={{ borderColor: ROYAL_GOLD, color: "var(--primary-blue)" }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => completeWizardAfterPhotos()}
                className="w-full sm:w-auto rounded-2xl px-8 text-white"
                style={{ backgroundColor: "var(--primary-blue)" }}
              >
                Finish
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="mt-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void goNext();
            }}
          >
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800 font-general" role="alert">
                {error}
              </div>
            )}

            {step === 0 && (
              <div className="space-y-5">
                <p className="text-sm text-gray-600 font-general">
                  We will create or update their login and <strong className="text-foreground">send an email</strong> to
                  this address when you continue (verification link for new members, or a magic link for existing
                  confirmed accounts).
                </p>
                <div className="space-y-2">
                  <Label htmlFor="manual-email" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Member email <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="manual-email"
                    type="email"
                    autoComplete="off"
                    placeholder="member@example.com"
                    className={cn("w-full", inputClass)}
                    {...register("email")}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="manual-temp-pw" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Temporary password <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="manual-temp-pw"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Share this with the member"
                      className={cn("w-full", inputClass)}
                      {...register("temp_password")}
                    />
                    <p className="text-xs text-gray-600 font-general">
                      At least {PASSWORD_MIN_LENGTH} characters, one letter, and a number or symbol (! @ # * - . ,).
                    </p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="manual-temp-pw2" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Confirm password <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="manual-temp-pw2"
                      type="password"
                      autoComplete="new-password"
                      className={cn("w-full", inputClass)}
                      {...register("temp_password_confirm")}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="manual-full_name" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Full name *
                  </Label>
                  <Input
                    id="manual-full_name"
                    placeholder="As it should appear on the profile"
                    className={cn("w-full", inputClass)}
                    {...register("full_name")}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-dob" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Date of birth *
                    </Label>
                    <Input id="manual-dob" type="date" className={cn("w-full", inputClass)} {...register("date_of_birth")} />
                    <p className="text-xs text-gray-600 font-general">
                      Member must be between {MIN_PROFILE_AGE} and {MAX_PROFILE_AGE} years old.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-birth_time" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Time of birth
                    </Label>
                    <Input id="manual-birth_time" type="time" className={cn("w-full", inputClass)} {...register("birth_time")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-birthplace" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Birthplace (city or town of birth)
                  </Label>
                  <Input
                    id="manual-birthplace"
                    placeholder="Where you were born"
                    className={cn("w-full", inputClass)}
                    {...register("birthplace")}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Gender *</Label>
                    <Select
                      value={watch("gender")}
                      onValueChange={(val) => setValue("gender", val as ManualWizardFormValues["gender"])}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Marital status</Label>
                    <Select value={watch("marital_status")} onValueChange={(val) => setValue("marital_status", val)}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never_married">Never married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-height" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Height (cm)
                    </Label>
                    <Input
                      id="manual-height"
                      inputMode="numeric"
                      placeholder="e.g. 170"
                      className={cn("w-full", inputClass)}
                      {...register("height_cm")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-complexion" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Complexion
                    </Label>
                    <Input
                      id="manual-complexion"
                      placeholder="e.g. Fair, wheatish"
                      className={cn("w-full", inputClass)}
                      {...register("complexion")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-school" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    School
                  </Label>
                  <Input id="manual-school" className={cn("w-full", inputClass)} {...register("school")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-college" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    College / university
                  </Label>
                  <Input id="manual-college" className={cn("w-full", inputClass)} {...register("college_university")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-field" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Field of study
                  </Label>
                  <Input id="manual-field" className={cn("w-full", inputClass)} {...register("field_of_study")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-edu" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Degree / highest qualification
                  </Label>
                  <Input id="manual-edu" placeholder="e.g. B.Tech, MBA" className={cn("w-full", inputClass)} {...register("highest_education")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-employed" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Employed in
                  </Label>
                  <Input id="manual-employed" placeholder="e.g. Private sector" className={cn("w-full", inputClass)} {...register("employed_in")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-occupation" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Occupation / role
                  </Label>
                  <Input id="manual-occupation" className={cn("w-full", inputClass)} {...register("occupation")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-org" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Working at (job / company)
                  </Label>
                  <Input id="manual-org" className={cn("w-full", inputClass)} {...register("organization")} placeholder="Company or profession" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-annual-income" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Annual income
                  </Label>
                  <Input
                    id="manual-annual-income"
                    inputMode="numeric"
                    placeholder="e.g. annual amount in INR"
                    className={cn("w-full", inputClass)}
                    {...register("annual_income")}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <Label htmlFor="manual-gotra" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                  Gotra (optional)
                </Label>
                <Input id="manual-gotra" className={cn("w-full", inputClass)} {...register("gotra")} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Father&apos;s name</Label>
                    <Input className={cn("w-full", inputClass)} {...register("father_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Father&apos;s occupation</Label>
                    <Input className={cn("w-full", inputClass)} {...register("father_occupation")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Mother&apos;s name</Label>
                    <Input className={cn("w-full", inputClass)} {...register("mother_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-sm" style={{ color: "var(--primary-blue)" }}>Mother&apos;s occupation</Label>
                    <Input className={cn("w-full", inputClass)} {...register("mother_occupation")} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manual-has_siblings"
                    className="rounded border-[var(--primary-blue)]/40"
                    checked={watch("has_siblings")}
                    onChange={(e) => setValue("has_siblings", e.target.checked)}
                  />
                  <Label htmlFor="manual-has_siblings" className="font-medium text-sm cursor-pointer" style={{ color: "var(--primary-blue)" }}>
                    Has siblings
                  </Label>
                </div>
                {watch("has_siblings") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-[var(--primary-blue)]/20">
                    <div className="space-y-2">
                      <Label className="text-sm">Brothers (count)</Label>
                      <Input inputMode="numeric" className={cn("w-full", inputClass)} {...register("siblings_brothers")} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Sisters (count)</Label>
                      <Input inputMode="numeric" className={cn("w-full", inputClass)} {...register("siblings_sisters")} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-sm">Siblings notes</Label>
                      <Input className={cn("w-full", inputClass)} {...register("siblings_notes")} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="manual-permanent-addr" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Permanent address
                  </Label>
                  <Input
                    id="manual-permanent-addr"
                    className={cn("w-full", inputClass)}
                    placeholder="Native / permanent address"
                    {...register("permanent_address")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-current-addr" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Current address
                  </Label>
                  <Input
                    id="manual-current-addr"
                    className={cn("w-full", inputClass)}
                    placeholder="If different from permanent"
                    {...register("current_address")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-phone" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Contact number
                  </Label>
                  <Input id="manual-phone" type="tel" className={cn("w-full", inputClass)} {...register("contact_number")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-country" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Country
                  </Label>
                  <Input id="manual-country" className={cn("w-full", inputClass)} {...register("country")} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-state" className="font-medium" style={{ color: "var(--primary-blue)" }}>State</Label>
                    <Input id="manual-state" className={cn("w-full", inputClass)} {...register("state")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-city" className="font-medium" style={{ color: "var(--primary-blue)" }}>City</Label>
                    <Input id="manual-city" className={cn("w-full", inputClass)} {...register("city")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Willing to relocate?</Label>
                  <Select
                    value={watch("willing_to_relocate") || undefined}
                    onValueChange={(val) => setValue("willing_to_relocate", val)}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <p className="text-sm text-[#8B7A5A] font-general">What they are looking for in a partner</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-age-min" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Partner age (min)
                    </Label>
                    <Input id="manual-age-min" type="number" min={18} max={100} className={cn("w-full", inputClass)} {...register("age_min")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-age-max" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                      Partner age (max)
                    </Label>
                    <Input id="manual-age-max" type="number" min={18} max={100} className={cn("w-full", inputClass)} {...register("age_max")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-pref-notes" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Preference notes
                  </Label>
                  <Textarea
                    id="manual-pref-notes"
                    rows={4}
                    maxLength={500}
                    placeholder="What kind of partner are they looking for?"
                    className={cn(
                      "min-h-[88px] border-[var(--primary-blue)]/25 bg-white/80 focus-visible:ring-[var(--primary-blue)]/40",
                      inputClass
                    )}
                    {...register("additional_notes")}
                  />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-5">
                <p className="text-sm text-[#8B7A5A] font-general">
                  Extra fields for offline records (optional). Member onboarding collects these on the profile editor if needed.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Religion</Label>
                    <Input className={cn("w-full", inputClass)} {...register("religion")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Mother tongue</Label>
                    <Input className={cn("w-full", inputClass)} {...register("mother_tongue")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Profile for</Label>
                  <Input className={cn("w-full", inputClass)} {...register("profile_for")} placeholder="e.g. Self, Son, Daughter" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Citizenship</Label>
                    <Input className={cn("w-full", inputClass)} {...register("citizenship")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Residing in</Label>
                    <Input className={cn("w-full", inputClass)} {...register("residing_in")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-about" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    About / bio
                  </Label>
                  <Textarea id="manual-about" rows={4} className={cn("min-h-[100px]", inputClass)} {...register("about_me")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-verification" className="font-medium" style={{ color: "var(--primary-blue)" }}>
                    Verification status
                  </Label>
                  <Input id="manual-verification" className={cn("w-full", inputClass)} {...register("verification_status")} placeholder="unverified" />
                </div>
                <div className="rounded-2xl bg-white/70 border border-[var(--primary-blue)]/10 p-4 space-y-4">
                  <p className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
                    Section visibility (Discover / public profile)
                  </p>
                  {(
                    [
                      ["show_education", "Show education"],
                      ["show_occupation", "Show occupation"],
                      ["show_family", "Show family"],
                      ["show_location", "Show location"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <span className="text-sm font-general text-gray-700">{label}</span>
                      <Switch
                        checked={watch(key)}
                        onCheckedChange={(c) => setValue(key, c)}
                        className="data-[state=checked]:bg-[var(--primary-blue)]"
                      />
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-white/70 border border-[var(--primary-blue)]/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
                        Visible on site when active
                      </p>
                      <p className="text-xs text-gray-600 font-general">If off, profile stays out of Discover.</p>
                    </div>
                    <Switch
                      checked={watch("is_visible")}
                      onCheckedChange={(c) => setValue("is_visible", c)}
                      className="data-[state=checked]:bg-[var(--primary-blue)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Profile status</Label>
                    <Select
                      value={watch("profile_status")}
                      onValueChange={(val) => setValue("profile_status", val as ManualWizardFormValues["profile_status"])}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending review</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Admin notes (offline intake)</Label>
                  <Textarea rows={2} className={inputClass} {...register("admin_notes")} placeholder="Internal: referral source, meeting notes…" />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium" style={{ color: "var(--primary-blue)" }}>Rejection reason</Label>
                  <Textarea rows={2} className={inputClass} {...register("rejection_reason")} placeholder="Only if status is rejected" />
                </div>
                <p className="text-xs text-gray-600 font-general border-t border-[var(--primary-blue)]/10 pt-3">
                  Next step: upload profile photos (optional). You can skip and add them later from the profile list.
                </p>
              </div>
            )}

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-4 sm:gap-0">
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => requestCloseDialog()}
                  disabled={submitting}
                  className="flex-1 sm:flex-none rounded-2xl border-2"
                  style={{ borderColor: ROYAL_GOLD, color: "var(--primary-blue)" }}
                >
                  Cancel
                </Button>
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={submitting}
                    className="flex-1 sm:flex-none rounded-2xl border-2"
                    style={{ borderColor: ROYAL_GOLD, color: "var(--primary-blue)" }}
                  >
                    Back
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto rounded-2xl px-8 text-white inline-flex items-center gap-2"
                style={{ backgroundColor: "var(--primary-blue)" }}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" />
                    {step === 0 ? "Sending…" : step === 7 ? "Creating…" : "Please wait…"}
                  </>
                ) : step === 0 ? (
                  "Continue & send email"
                ) : step === 7 ? (
                  "Save & continue to photos"
                ) : (
                  "Continue"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>

    <AlertDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
      <AlertDialogContent className="rounded-2xl border border-[var(--primary-blue)]/15">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-playfair-display text-xl" style={{ color: "var(--primary-blue)" }}>
            Exit offline profile setup?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left font-general text-base text-gray-600">
            You are in the middle of creating a profile. If you leave now, unsaved answers on this screen will be lost.
            {step === PHOTOS_STEP_INDEX && createdProfileId
              ? " The member account and profile are already saved; you can add photos later from the admin profile list."
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Keep editing</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => confirmDiscardAndClose()}
          >
            Exit anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
