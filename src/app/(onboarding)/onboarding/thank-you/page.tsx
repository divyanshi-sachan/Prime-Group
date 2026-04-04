import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedBasicProfile } from "@/lib/profile-basic-gate";
import { ClearProfileDraftOnMount } from "@/components/auth/clear-profile-draft-on-mount";

export default async function OnboardingThankYouPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/onboarding/thank-you");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, profile_status, profile_completion_pct, is_visible, full_name, date_of_birth, gender, contact_number, country, city"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.profile_status === "active") {
    redirect("/discover");
  }

  const pct = profile?.profile_completion_pct ?? 0;
  if (!hasCompletedBasicProfile(profile) || pct < 80) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 py-10">
      <ClearProfileDraftOnMount />
      <div
        className="w-full max-w-xl rounded-3xl bg-white border shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-8 sm:p-10"
        style={{ borderColor: "rgba(198,167,94,0.35)" }}
      >
        <p className="text-xs font-bold tracking-wider uppercase" style={{ color: "var(--accent-gold)" }}>
          Prime Group
        </p>
        <h1 className="mt-2 font-playfair-display text-3xl sm:text-4xl font-bold" style={{ color: "var(--primary-blue)" }}>
          Thank you for completing your profile
        </h1>
        <p className="mt-3 text-gray-600 font-general leading-relaxed">
          Our team will review and approve your profile in a few days. Once approved, your profile will be visible on our platform and you can start discovering matches.
        </p>

        <div className="mt-6 rounded-2xl border bg-[#F8FAFC] p-4" style={{ borderColor: "rgba(0, 51, 102, 0.12)" }}>
          <p className="text-sm font-semibold font-general" style={{ color: "var(--primary-blue)" }}>
            Visibility preference
          </p>
          <p className="mt-1 text-sm text-gray-700 font-general">
            Discover visibility:{" "}
            <span className="font-semibold" style={{ color: "var(--primary-blue)" }}>
              {profile?.is_visible ? "Public" : "Private"}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-600">
            You can change this anytime from Settings.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/settings"
            className="rounded-2xl px-5 py-3 text-center font-general font-semibold border-2 hover:bg-[var(--accent-gold)]/10 transition-colors"
            style={{ borderColor: "rgba(198,167,94,0.6)", color: "var(--primary-blue)" }}
          >
            Privacy settings
          </Link>
          <Link
            href="/"
            className="rounded-2xl px-5 py-3 text-center font-general font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--primary-blue)" }}
          >
            Back to home
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          If you have any questions, contact support at{" "}
          <a href="mailto:support@primegroupmatrimony.com" className="underline underline-offset-2">
            support@primegroupmatrimony.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

