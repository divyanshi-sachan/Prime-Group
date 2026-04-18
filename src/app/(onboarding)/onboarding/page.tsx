import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/auth/onboarding-wizard";
import { OnboardingStepBackground } from "@/components/auth/onboarding-step-background";
import { hasCompletedBasicProfile } from "@/lib/profile-basic-gate";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, profile_status, profile_completion_pct, full_name, date_of_birth, gender, contact_number, country, city")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.profile_status === "active") {
    redirect("/discover");
  }

  const pct = profile?.profile_completion_pct ?? 0;
  if (hasCompletedBasicProfile(profile) && pct >= 80) {
    redirect("/onboarding/thank-you");
  }

  if (hasCompletedBasicProfile(profile)) {
    redirect("/discover");
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const metaName = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  const metaPhone = typeof meta?.phone === "string" ? meta.phone.trim() : "";
  const profileName = profile?.full_name?.trim() ?? "";
  const profilePhone = profile?.contact_number != null ? String(profile.contact_number).trim() : "";
  const signupPrefillName = profileName || metaName || undefined;
  const signupPrefillPhone = profilePhone || metaPhone || undefined;

  return (
    <div className="relative min-h-screen bg-[#FDFBF7]">
      <section className="relative z-0 mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <OnboardingWizard
          userId={user.id}
          existingProfileId={profile?.id}
          email={user.email}
          signupPrefillName={signupPrefillName}
          signupPrefillPhone={signupPrefillPhone}
        />
      </section>
    </div>
  );
}
