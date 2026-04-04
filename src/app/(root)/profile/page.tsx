import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/profile/profile-view";
import { ProfileDetailSkeleton } from "@/components/loading/route-content-skeletons";

async function ProfilePageBody({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    return (
      <div className="min-h-screen py-16 px-4 bg-[#FDFBF7]">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="font-playfair-display text-2xl font-bold mb-4" style={{ color: "var(--primary-blue)" }}>
            No profile yet
          </h1>
          <p className="font-general mb-6" style={{ color: "var(--primary-blue)" }}>
            Complete your profile to appear in search and get matches.
          </p>
          <Button asChild style={{ backgroundColor: "var(--primary-blue)" }}>
            <Link href="/onboarding">Complete profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { data: photos } = await supabase
    .from("profile_photos")
    .select("id, photo_url, thumbnail_url, display_order, is_primary, status")
    .eq("profile_id", profile.id)
    .order("display_order", { ascending: true });

  const { data: preferences } = await supabase
    .from("partner_preferences")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return (
    <div className="min-h-screen py-12 px-4 bg-[#FDFBF7]">
      <div className="container mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-playfair-display text-3xl font-bold" style={{ color: "var(--primary-blue)" }}>
            My profile
          </h1>
        </div>
        <ProfileView
          profile={profile}
          photos={photos ?? []}
          preferences={preferences ?? null}
          isOwnProfile
          userId={userId}
        />
      </div>
    </div>
  );
}

async function ProfileGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/profile");

  return (
    <Suspense fallback={<ProfileDetailSkeleton />}>
      <ProfilePageBody userId={user.id} />
    </Suspense>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileDetailSkeleton />}>
      <ProfileGate />
    </Suspense>
  );
}
