import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/profile/profile-view";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { ProfileDetailSkeleton } from "@/components/loading/route-content-skeletons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, city, state, country")
    .eq("id", id)
    .eq("profile_status", "active")
    .eq("is_visible", true)
    .is("deleted_at", null)
    .single();

  if (!profile) return { title: "Profile | Prime Group" };

  const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");

  return {
    title: `${profile.full_name}${location ? ` · ${location}` : ""} | Prime Group`,
    description: `View ${profile.full_name}'s profile${age ? `, ${age} years` : ""}${location ? ` from ${location}` : ""}. Premium matrimonial profiles.`,
    openGraph: {
      title: `${profile.full_name} | Prime Group`,
      description: `View profile of ${profile.full_name}${location ? ` from ${location}` : ""}.`,
    },
  };
}

async function PublicProfileBody({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("profile_status", "active")
    .eq("is_visible", true)
    .is("deleted_at", null)
    .single();

  if (profileError || !profile) notFound();

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

  const isOwn = authUser?.id === profile.user_id;

  let unlockedProfileIds: string[] = [];
  if (authUser && !isOwn) {
    const { data: unlocks } = await supabase
      .from("contact_unlocks")
      .select("profile_id")
      .eq("user_id", authUser.id);
    unlockedProfileIds = (unlocks ?? []).map((u: { profile_id: string }) => u.profile_id);
  }

  return (
    <ProfileView
      profile={profile}
      photos={photos ?? []}
      preferences={preferences ?? null}
      isOwnProfile={isOwn}
      userId={isOwn ? authUser?.id : undefined}
      currentUserId={authUser?.id}
      unlockedProfileIds={unlockedProfileIds}
    />
  );
}

export default function PublicProfilePage({ params }: PageProps) {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--pure-white)" }}>
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/discover">
              <ArrowLeft className="h-4 w-4" />
              Back to Discover
            </Link>
          </Button>
        </div>
        <Suspense fallback={<ProfileDetailSkeleton />}>
          <PublicProfileBody params={params} />
        </Suspense>
      </div>
    </div>
  );
}
