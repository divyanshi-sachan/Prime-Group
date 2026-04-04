import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDiscoverProfiles } from "@/lib/discover";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import FavoritesGrid from "@/components/favorites/favorites-grid";
import { FavoritesPageSkeleton } from "@/components/loading/route-content-skeletons";

async function FavoritesData({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("profile_favorites")
    .select("profile_id")
    .eq("user_id", userId);
  const profileIds = (rows ?? []).map((r) => r.profile_id);
  const profiles = profileIds.length ? await getDiscoverProfiles({ profileIds }) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-8 py-4 rounded-full" style={{ backgroundColor: "var(--primary-blue)" }}>
            <span className="text-lg font-general font-semibold uppercase tracking-wide text-gold-gradient flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 fill-current" />
              My Favorites
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair-display font-bold mb-3 sm:mb-4 text-gold-gradient px-2"
            style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            {profiles.length === 0 ? "No Favorites Yet" : "Your Favorite Profiles"}
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-general max-w-2xl mx-auto px-2" style={{ color: "var(--primary-blue)" }}>
            {profiles.length === 0
              ? "Start exploring profiles and add them to your favorites to see them here."
              : `You have ${profiles.length} ${profiles.length === 1 ? "profile" : "profiles"} in your favorites.`}
          </p>
        </div>

        <FavoritesGrid profiles={profiles} />
      </div>
    </div>
  );
}

async function FavoritesGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--pure-white)" }}>
        <Heart className="h-24 w-24 mb-6 opacity-20" style={{ color: "var(--accent-gold)" }} />
        <h1 className="text-2xl font-playfair-display font-bold mb-2" style={{ color: "var(--primary-blue)" }}>
          Sign in to view favorites
        </h1>
        <p className="text-center font-general mb-6" style={{ color: "var(--primary-blue)" }}>
          Your saved profiles will appear here once you sign in.
        </p>
        <Button asChild style={{ backgroundColor: "var(--primary-blue)" }}>
          <Link href="/sign-in?next=/favorites">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <Suspense fallback={<FavoritesPageSkeleton />}>
      <FavoritesData userId={user.id} />
    </Suspense>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<FavoritesPageSkeleton />}>
      <FavoritesGate />
    </Suspense>
  );
}
