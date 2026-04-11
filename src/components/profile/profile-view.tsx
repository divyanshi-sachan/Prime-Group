"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  Heart,
  Users,
  User,
  Phone,
  Home,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/context/credits-context";
import Link from "next/link";
import { Coins, Loader2, Mail, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface ProfilePhoto {
  id: string;
  photo_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_primary: boolean;
  status: string;
}

export interface PartnerPreferences {
  age_min: number | null;
  age_max: number | null;
  gotra?: string | null;
  additional_notes: string | null;
}

export interface ProfileRecord {
  id: string;
  user_id?: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  marital_status: string | null;
  height_cm: number | null;
  religion: string | null;
  mother_tongue: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  highest_education: string | null;
  college_university?: string | null;
  school?: string | null;
  field_of_study?: string | null;
  occupation: string | null;
  organization: string | null;
  annual_income?: number | null;
  profile_status: string;
  verification_status: string;
  profile_completion_pct: number | null;
  about_me?: string | null;
  show_education?: boolean | null;
  show_occupation?: boolean | null;
  show_family?: boolean | null;
  show_location?: boolean | null;
  father_name?: string | null;
  father_occupation?: string | null;
  mother_name?: string | null;
  mother_occupation?: string | null;
  siblings_count?: number | null;
  has_siblings?: boolean | null;
  siblings_brothers?: number | null;
  siblings_sisters?: number | null;
  siblings_notes?: string | null;
  birthplace?: string | null;
  birth_time?: string | null;
  complexion?: string | null;
  gotra?: string | null;
  permanent_address?: string | null;
  current_address?: string | null;
  contact_number?: string | null;
  email?: string | null;
  willing_to_relocate?: string | null;
  is_visible?: boolean | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  approved_at?: string | null;
  [key: string]: unknown;
}

export interface ProfileViewProps {
  profile: ProfileRecord;
  photos: ProfilePhoto[];
  preferences: PartnerPreferences | null;
  isOwnProfile?: boolean;
  /** When true (e.g. admin view), always show contact details without credits/unlock gating. */
  forceShowContact?: boolean;
  /** Tighter typography and spacing for use inside admin modal / narrow layouts. */
  layoutVariant?: "default" | "compact";
  userId?: string;
  currentUserId?: string;
  unlockedProfileIds?: string[];
}

function formatAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatAnnualIncomeInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const cardStyle = {
  boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
  border: "1px solid rgba(212, 175, 55, 0.15)",
};

function Section({
  title,
  icon: Icon,
  children,
  visible = true,
  compact = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  visible?: boolean;
  compact?: boolean;
}) {
  if (!visible) return null;
  return (
    <div
      className={`rounded-2xl transition-shadow bg-white ${compact ? "p-4 sm:p-5 shadow-sm" : "p-6 sm:p-8 hover:shadow-xl"}`}
      style={cardStyle}
    >
      <h3
        className={`font-playfair-display font-bold mb-1 flex items-center gap-2 ${compact ? "text-lg" : "text-xl"}`}
        style={{ color: "var(--primary-blue)" }}
      >
        <Icon className={`flex-shrink-0 ${compact ? "h-4 w-4" : "h-5 w-5"}`} style={{ color: "var(--accent-gold)" }} />
        {title}
      </h3>
      <div className={`rounded-full mb-3 ${compact ? "w-10 h-0.5" : "w-12 h-0.5"}`} style={{ backgroundColor: "var(--accent-gold)" }} />
      <div className={`font-general leading-relaxed ${compact ? "text-sm" : "text-base"}`} style={{ color: "var(--primary-blue)" }}>
        {children}
      </div>
    </div>
  );
}

export function ProfileView({
  profile,
  photos,
  preferences,
  isOwnProfile,
  forceShowContact = false,
  layoutVariant = "default",
  userId,
  currentUserId,
  unlockedProfileIds = [],
}: ProfileViewProps) {
  const compact = layoutVariant === "compact";
  /** Contact chips: tighter in admin modal */
  const contactPillOwn = compact
    ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--primary-blue)]/12 bg-slate-50 text-xs font-medium text-[var(--primary-blue)]"
    : "flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--primary-blue)]/15 bg-blue-50/40 text-sm font-semibold text-[var(--primary-blue)]";
  const router = useRouter();
  const age = formatAge(profile.date_of_birth);
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
  const sortedPhotos = [...photos].sort((a, b) => a.display_order - b.display_order);
  const primaryPhoto = sortedPhotos.find((p) => p.is_primary) ?? sortedPhotos[0];
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [enlargedPhotoIndex, setEnlargedPhotoIndex] = useState<number | null>(null);
  const displayPhoto = sortedPhotos[selectedPhotoIndex] ?? primaryPhoto ?? sortedPhotos[0];
  const [liveCompletionPct, setLiveCompletionPct] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>((profile.is_visible ?? true) === true);
  const [visibilitySaving, setVisibilitySaving] = useState(false);

  // Credit unlock state
  const { credits, spendCredits, refreshCredits, loading: creditsLoading } = useCredits();

  useEffect(() => {
    if (!isOwnProfile) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/profile/progress", { method: "GET" });
        if (!res.ok) return;
        const data = (await res.json()) as { percent?: number };
        if (!cancelled && typeof data.percent === "number") {
          setLiveCompletionPct(data.percent);
        }
      } catch {
        // ignore
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile]);

  useEffect(() => {
    if (!isOwnProfile) return;
    setIsVisible((profile.is_visible ?? true) === true);
  }, [isOwnProfile, profile.is_visible]);

  const toggleVisibility = useCallback(async () => {
    if (!isOwnProfile || !userId || visibilitySaving) return;
    const next = !isVisible;
    setVisibilitySaving(true);
    setIsVisible(next);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_visible: next, updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .eq("user_id", userId);
      if (error) throw error;
      router.refresh();
    } catch {
      // Revert if save fails
      setIsVisible(!next);
    } finally {
      setVisibilitySaving(false);
    }
  }, [isOwnProfile, userId, visibilitySaving, isVisible, profile.id, router]);

  useEffect(() => {
    if (isOwnProfile) void refreshCredits();
  }, [isOwnProfile, refreshCredits]);
  const [isUnlocked, setIsUnlocked] = useState(unlockedProfileIds.includes(profile.id));
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockedContact, setUnlockedContact] = useState<{
    contact_number?: string | null;
    permanent_address?: string | null;
    current_address?: string | null;
    email?: string | null;
  } | null>(null);

  useEffect(() => {
    if (enlargedPhotoIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [enlargedPhotoIndex]);

  useEffect(() => {
    if (enlargedPhotoIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnlargedPhotoIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enlargedPhotoIndex]);

  // Show all sections (education, occupation, family, partner preference) when viewing a profile
  const showEducation = true;
  const showOccupation = true;
  const showFamily = true;
  const showLocation = true;

  // Handle unlock
  const handleUnlock = useCallback(async () => {
    if (isUnlocked || unlocking) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      const res = await fetch("/api/credits/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profile.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setUnlockError("Not enough credits. Please buy more credits.");
        } else {
          setUnlockError(data.error || "Failed to unlock");
        }
        return;
      }
      setIsUnlocked(true);
      setUnlockedContact({
        contact_number: data.contact_number,
        permanent_address: data.permanent_address,
        current_address: data.current_address,
        email: data.email,
      });
      if (!data.already_unlocked) {
        spendCredits(1);
      }
      refreshCredits();
    } catch {
      setUnlockError("Something went wrong");
    } finally {
      setUnlocking(false);
    }
  }, [isUnlocked, unlocking, profile.id, spendCredits, refreshCredits]);

  if (isEditing && userId) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
        <EditProfileForm
          profile={profile}
          photos={photos}
          preferences={preferences}
          userId={userId}
          onClose={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto ${compact ? "space-y-4 sm:space-y-5" : "space-y-6 sm:space-y-8"}`}>
      {/* 1. HERO SECTION */}
      <div
        className={`bg-white flex flex-col md:flex-row items-stretch md:items-start border border-[rgba(212,175,55,0.12)] shadow-sm ${compact ? "rounded-2xl p-4 sm:p-5 gap-4 sm:gap-6" : "rounded-3xl p-6 sm:p-10 gap-6 sm:gap-10"}`}
        style={compact ? undefined : cardStyle}
      >
        {/* Avatar / Main Photo — fixed aspect box so portrait/landscape always fill frame */}
        <div
          className={`flex-shrink-0 relative mx-auto md:mx-0 rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-black/[0.06] shadow-inner cursor-pointer group aspect-square ${compact ? "w-[min(100%,11rem)] sm:w-44 md:w-48" : "w-[min(100%,14rem)] sm:w-48 md:w-56"}`}
          onClick={() => {
            if (displayPhoto?.id) {
              const idx = sortedPhotos.findIndex((p) => p.id === displayPhoto.id);
              setEnlargedPhotoIndex(idx >= 0 ? idx : 0);
            }
          }}
        >
          {displayPhoto?.photo_url ? (
            <>
              <Image
                src={displayPhoto.photo_url}
                alt={profile.full_name}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                unoptimized
                sizes={compact ? "(max-width: 768px) 176px, 192px" : "(max-width: 768px) 176px, 224px"}
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <User className={`text-gray-300 ${compact ? "h-14 w-14" : "h-16 w-16"}`} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center md:text-left flex flex-col justify-center pt-0 md:pt-1">
          <h1
            className={`font-playfair-display font-bold text-[var(--primary-blue)] tracking-tight ${compact ? "text-2xl sm:text-3xl mb-2" : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4"}`}
          >
            <span className="inline-flex items-center gap-3">
              {profile.full_name}
              {isOwnProfile && !isVisible && (
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-general font-semibold"
                  style={{ borderColor: "rgba(0, 51, 102, 0.18)", color: "var(--primary-blue)", backgroundColor: "rgba(0, 51, 102, 0.03)" }}
                  title="Your profile is private and won’t appear in Discover"
                >
                  <Lock className="h-3.5 w-3.5" style={{ color: "var(--accent-gold)" }} />
                  Private
                </span>
              )}
            </span>
          </h1>
          
          <div
            className={`flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 font-general text-[var(--primary-blue)]/90 ${compact ? "text-sm sm:text-base mb-4" : "text-base sm:text-lg gap-4 sm:gap-6 mb-6"}`}
          >
            <span className="flex items-center gap-2 shrink-0">
              <Calendar className="w-5 h-5 text-[var(--accent-gold)]" />
              {age} years
            </span>
            {showLocation && location && (
              <span className="flex items-center gap-2 shrink-0">
                <MapPin className="w-5 h-5 text-[var(--accent-gold)]" />
                {location}
              </span>
            )}
            {(profile.occupation || profile.organization) && (
              <span className="flex items-center gap-2 shrink-0">
                <Briefcase className="w-5 h-5 text-[var(--accent-gold)]" />
                {profile.occupation && profile.organization
                  ? `${profile.occupation} at ${profile.organization}`
                  : profile.organization || profile.occupation}
              </span>
            )}
            {typeof profile.annual_income === "number" && profile.annual_income > 0 && (
              <span className="flex items-center gap-2 shrink-0" title="Annual income">
                <IndianRupee className="w-5 h-5 text-[var(--accent-gold)]" aria-hidden />
                {formatAnnualIncomeInr(profile.annual_income)} / yr
              </span>
            )}
          </div>

          {isOwnProfile && (
            <div className="mb-6 flex justify-center md:justify-start">
              <div
                className="inline-flex flex-wrap items-center gap-3 rounded-2xl border-2 px-5 py-3 shadow-sm"
                style={{
                  borderColor: "rgba(212, 175, 55, 0.45)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
              >
                <Coins className="w-6 h-6 shrink-0" style={{ color: "var(--accent-gold)" }} aria-hidden />
                {creditsLoading ? (
                  <span className="text-sm font-general text-[var(--primary-blue)]/60">Loading credits…</span>
                ) : (
                  <>
                    <span className="font-general font-bold text-2xl tabular-nums" style={{ color: "var(--primary-blue)" }}>
                      {credits.toLocaleString()}
                    </span>
                    <span className="font-general font-medium text-[var(--primary-blue)]/75">credits available</span>
                    <Link
                      href="/checkout"
                      className="text-xs font-black uppercase tracking-widest font-general hover:opacity-80"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      Buy more
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Quick Contact & Photos Toggle */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-4 mt-auto">
            {/* Contact Info Section */}
          {isOwnProfile || forceShowContact ? (
              /* Own profile: show contact info directly */
              <div className={`flex flex-wrap justify-center sm:justify-start ${compact ? "gap-2" : "gap-3"}`}>
                {profile.contact_number && (
                  <div className={contactPillOwn}>
                    <Phone className={`shrink-0 text-[var(--accent-gold)] ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                    {profile.contact_number}
                  </div>
                )}
                {profile.permanent_address && (
                  <div className={`${contactPillOwn} max-w-full`}>
                    <Home className={`shrink-0 text-[var(--accent-gold)] ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                    <span className="truncate" title={profile.permanent_address}>
                      Permanent: {profile.permanent_address}
                    </span>
                  </div>
                )}
                {profile.current_address && (
                  <div className={`${contactPillOwn} max-w-full`}>
                    <Home className={`shrink-0 text-[var(--accent-gold)] ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                    <span className="truncate" title={profile.current_address}>
                      Current: {profile.current_address}
                    </span>
                  </div>
                )}
                {profile.email && (
                  <div className={`${contactPillOwn} break-all`}>
                    <Mail className={`shrink-0 text-[var(--accent-gold)] ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                    {profile.email}
                  </div>
                )}
              </div>
            ) : isUnlocked ? (
              /* Unlocked: show revealed contact info */
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                {(unlockedContact?.contact_number || profile.contact_number) && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50/60 text-sm font-semibold text-green-800">
                    <Phone className="w-4 h-4 text-green-600" />
                    {unlockedContact?.contact_number || profile.contact_number}
                  </div>
                )}
                {(unlockedContact?.permanent_address ?? profile.permanent_address) && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50/60 text-sm font-semibold text-green-800 max-w-full">
                    <Home className="w-4 h-4 shrink-0 text-green-600" />
                    <span className="truncate" title={unlockedContact?.permanent_address ?? profile.permanent_address ?? ""}>
                      Permanent: {unlockedContact?.permanent_address ?? profile.permanent_address}
                    </span>
                  </div>
                )}
                {(unlockedContact?.current_address ?? profile.current_address) && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50/60 text-sm font-semibold text-green-800 max-w-full">
                    <Home className="w-4 h-4 shrink-0 text-green-600" />
                    <span className="truncate" title={unlockedContact?.current_address ?? profile.current_address ?? ""}>
                      Current: {unlockedContact?.current_address ?? profile.current_address}
                    </span>
                  </div>
                )}
                {unlockedContact?.email && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50/60 text-sm font-semibold text-green-800">
                    <Mail className="w-4 h-4 text-green-600" />
                    {unlockedContact.email}
                  </div>
                )}
              </div>
            ) : currentUserId ? (
              /* Not unlocked yet: show unlock button */
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="rounded-full px-6 py-2.5 font-general font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border-none gap-2"
                  style={{ backgroundColor: 'var(--accent-gold)', color: 'var(--primary-blue)' }}
                >
                  {unlocking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Unlocking…</>
                  ) : (
                    <><Unlock className="w-4 h-4" /> Unlock Contact · 1 Credit</>
                  )}
                </Button>
                <div className="flex items-center gap-2 text-sm font-general" style={{ color: 'var(--primary-blue)', opacity: 0.7 }}>
                  <Coins className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                  {credits} credits available
                  {credits === 0 && (
                    <Link href="/checkout" className="ml-1 font-semibold underline" style={{ color: 'var(--accent-gold)' }}>
                      Buy Credits
                    </Link>
                  )}
                </div>
                {unlockError && (
                  <p className="text-sm text-red-600 font-general">{unlockError}</p>
                )}
              </div>
            ) : (
              /* Not logged in */
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                <Lock className="w-4 h-4 text-gray-400" />
                <Link href="/sign-in" className="underline">Sign in</Link> to unlock contact details
              </div>
            )}
            
            {/* Gallery Thumbnails */}
            {sortedPhotos.length > 1 && (
              <div className="flex gap-2 ml-0 sm:ml-auto mt-2 sm:mt-0">
                {sortedPhotos.slice(0, 5).map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-[3px] transition-all shadow-sm ${
                      selectedPhotoIndex === idx
                        ? "border-[var(--accent-gold)]"
                        : "border-white hover:border-gray-200"
                    }`}
                  >
                    <Image src={p.thumbnail_url || p.photo_url} alt="" fill className="object-cover" unoptimized sizes="48px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-5 bg-white shadow-sm"
          style={{ border: "1px solid rgba(212, 175, 55, 0.4)" }}
        >
          <div className="flex flex-wrap items-center gap-6 font-general text-sm" style={{ color: "var(--primary-blue)" }}>
            <span className="flex items-center gap-3">
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-gold)]"
                  style={{ width: `${liveCompletionPct ?? profile.profile_completion_pct ?? 0}%` }}
                />
              </div>
              <strong>{liveCompletionPct ?? profile.profile_completion_pct ?? 0}%</strong> Complete
            </span>
            <span>Status: <strong className="capitalize">{profile.profile_status.replace('_', ' ')}</strong></span>
            <span className="flex items-center gap-2 border-l border-[var(--primary-blue)]/15 pl-6">
              <Coins className="w-5 h-5 shrink-0" style={{ color: "var(--accent-gold)" }} aria-hidden />
              {creditsLoading ? (
                <span className="opacity-60">…</span>
              ) : (
                <>
                  <strong className="font-general text-lg font-bold tabular-nums">{credits.toLocaleString()}</strong>
                  <span className="opacity-80">credits</span>
                  <Link href="/checkout" className="ml-1 text-xs font-bold uppercase tracking-wide underline-offset-2 hover:underline" style={{ color: "var(--accent-gold)" }}>
                    Add
                  </Link>
                </>
              )}
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="rounded-xl border-[var(--primary-blue)]/20 text-[var(--primary-blue)] hover:bg-[var(--accent-gold)]/10 hover:text-[var(--primary-blue)] font-semibold px-6">
              Edit Profile
            </Button>
            <Button
              onClick={toggleVisibility}
              variant="outline"
              size="sm"
              disabled={visibilitySaving}
              className="rounded-xl border-[var(--primary-blue)]/20 text-[var(--primary-blue)] hover:bg-[var(--accent-gold)]/10 hover:text-[var(--primary-blue)] font-semibold px-6"
              title="Toggle whether you appear in Discover (requires admin approval too)"
            >
              {visibilitySaving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : isVisible ? (
                "Public"
              ) : (
                "Private"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 2. GRID DETAILS */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? "gap-4" : "gap-6 sm:gap-8"}`}>
        {/* Left Column */}
        <div className="space-y-6 sm:space-y-8">
          {profile.about_me && (
            <Section title="About Me" icon={User} visible compact={compact}>
              <p className="whitespace-pre-wrap leading-relaxed opacity-95">{profile.about_me}</p>
            </Section>
          )}

          {(profile.school || profile.highest_education || profile.college_university || profile.field_of_study) && (
            <Section title="Education" icon={GraduationCap} visible compact={compact}>
              <div className="space-y-5">
                {profile.school && <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">School</span><span className="font-medium text-[15px]">{profile.school}</span></p>}
                {profile.college_university && <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">College / University</span><span className="font-medium text-[15px]">{profile.college_university}</span></p>}
                {(profile.highest_education || profile.field_of_study) && (
                  <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Degree</span><span className="font-medium text-[15px]">{[profile.highest_education, profile.field_of_study].filter(Boolean).join(" · ")}</span></p>
                )}
              </div>
            </Section>
          )}

          {(profile.height_cm || profile.marital_status || profile.complexion || profile.birthplace || profile.gotra || profile.willing_to_relocate || profile.religion || profile.mother_tongue) && (
            <Section title="Basic Details" icon={Ruler} visible compact={compact}>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {profile.height_cm && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Height</span><span className="font-medium text-[15px]">{profile.height_cm} cm</span></div>}
                {profile.marital_status && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Status</span><span className="capitalize font-medium text-[15px]">{profile.marital_status.replace('_', ' ')}</span></div>}
                {profile.complexion && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Complexion</span><span className="font-medium text-[15px]">{profile.complexion}</span></div>}
                {profile.birthplace && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Birthplace</span><span className="font-medium text-[15px]">{profile.birthplace}</span></div>}
                {profile.gotra && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Gotra</span><span className="font-medium text-[15px]">{profile.gotra}</span></div>}
                {profile.religion && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Religion</span><span className="font-medium text-[15px]">{profile.religion}</span></div>}
                {profile.mother_tongue && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Mother Tongue</span><span className="font-medium text-[15px]">{profile.mother_tongue}</span></div>}
                {profile.willing_to_relocate && <div><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Relocate?</span><span className="capitalize font-medium text-[15px]">{profile.willing_to_relocate}</span></div>}
              </div>
            </Section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6 sm:space-y-8">
          {(profile.father_name || profile.mother_name || profile.has_siblings || profile.siblings_brothers != null || profile.siblings_sisters != null || profile.siblings_count != null) && (
              <Section title="Family Background" icon={Users} visible compact={compact}>
                <div className="space-y-5">
                  {profile.father_name && (
                    <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Father</span><span className="font-medium text-[15px]">{profile.father_name}{profile.father_occupation ? ` · ${profile.father_occupation}` : ""}</span></p>
                  )}
                  {profile.mother_name && (
                    <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Mother</span><span className="font-medium text-[15px]">{profile.mother_name}{profile.mother_occupation ? ` · ${profile.mother_occupation}` : ""}</span></p>
                  )}
                  {(profile.has_siblings || profile.siblings_brothers != null || profile.siblings_sisters != null || profile.siblings_count != null) && (
                    <p>
                      <span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Siblings</span>
                      <span className="font-medium text-[15px]">{profile.siblings_brothers != null || profile.siblings_sisters != null
                        ? [profile.siblings_brothers != null && ` ${profile.siblings_brothers} brother(s)`, profile.siblings_sisters != null && ` ${profile.siblings_sisters} sister(s)`].filter(Boolean).join(",")
                        : profile.siblings_count != null
                          ? ` ${profile.siblings_count}`
                          : "Yes"}</span>
                    </p>
                  )}
                  {profile.siblings_notes && <p className="opacity-90">{profile.siblings_notes}</p>}
                </div>
              </Section>
            )}

          {preferences && (preferences.age_min != null || preferences.age_max != null || preferences.additional_notes || preferences.gotra) && (
            <Section title="Partner Preferences" icon={Heart} visible compact={compact}>
              <div className="space-y-5">
                {preferences.age_min != null && preferences.age_max != null && (
                  <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Age Range</span><span className="font-medium text-[15px]">{preferences.age_min} to {preferences.age_max} years</span></p>
                )}
                {preferences.gotra && <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Preferred Gotra</span><span className="font-medium text-[15px]">{preferences.gotra}</span></p>}
                {preferences.additional_notes && (
                  <p><span className="font-semibold opacity-70 block text-xs uppercase tracking-wider mb-1">Additional Notes</span><span className="opacity-95 leading-relaxed font-medium text-[15px]">{preferences.additional_notes}</span></p>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* Lightbox: portaled to document.body so it isn’t clipped or wrongly sized inside transformed parents (e.g. Radix Dialog). */}
      {enlargedPhotoIndex !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 sm:p-8 backdrop-blur-sm cursor-zoom-out"
            role="dialog"
            aria-modal="true"
            aria-label="Profile photo viewer"
            onClick={() => setEnlargedPhotoIndex(null)}
          >
            {sortedPhotos.length > 1 && (
              <button
                type="button"
                className="fixed left-2 sm:left-5 top-1/2 z-[201] -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white p-3 shadow-lg backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedPhotoIndex((prev) => {
                    const i = prev ?? 0;
                    return i === 0 ? sortedPhotos.length - 1 : i - 1;
                  });
                }}
              >
                <ChevronLeft className="w-6 h-6 shrink-0" />
              </button>
            )}

            <div
              className="relative max-h-[min(88vh,920px)] max-w-[min(96vw,1200px)] cursor-default select-none flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- needs natural sizing with object-contain in lightbox */}
              <img
                src={sortedPhotos[enlargedPhotoIndex]?.photo_url}
                alt={`${profile.full_name} — photo ${(enlargedPhotoIndex ?? 0) + 1} of ${sortedPhotos.length}`}
                className="max-h-[min(88vh,920px)] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl ring-1 ring-white/20 bg-black/20"
                draggable={false}
              />
            </div>

            {sortedPhotos.length > 1 && (
              <button
                type="button"
                className="fixed right-2 sm:right-5 top-1/2 z-[201] -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white p-3 shadow-lg backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedPhotoIndex((prev) => {
                    const i = prev ?? 0;
                    return i === sortedPhotos.length - 1 ? 0 : i + 1;
                  });
                }}
              >
                <ChevronRight className="w-6 h-6 shrink-0" />
              </button>
            )}

            <button
              type="button"
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[201] rounded-full bg-white/15 hover:bg-white/25 text-white p-2.5 shadow-lg backdrop-blur-md border border-white/25 transition-colors cursor-pointer"
              aria-label="Close photo"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedPhotoIndex(null);
              }}
            >
              <X className="w-5 h-5 shrink-0" />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
