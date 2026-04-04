import dynamic from "next/dynamic";
import HeadSection from "@/components/home/head-section";
import GuidedHero from "@/components/home/guided-hero";
import { FeaturedProfilesFromBackend } from "@/components/home/featured-profiles-server";
import { LANDING_FEATURED_PROFILES } from "@/data/landing-featured-profiles";
import { Suspense } from "react";
import { FeaturedProfilesSkeleton } from "@/components/loading/route-content-skeletons";

const BeverageLanding = dynamic(() => import("@/components/home/products-section"), {
  loading: () => (
    <div
      className="w-full min-h-[280px] py-20 motion-reduce:animate-none animate-pulse bg-[#fafafa]"
      aria-hidden
    />
  ),
});

const SubscriptionPlan = dynamic(() => import("@/components/home/subscription-plan"), {
  loading: () => (
    <div
      className="w-full min-h-[320px] py-16 motion-reduce:animate-none animate-pulse bg-white"
      aria-hidden
    />
  ),
});

export default function Home() {
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <GuidedHero featuredProfiles={LANDING_FEATURED_PROFILES} />
      <div className="relative">
        <div className="relative z-20 mt-20">
          <Suspense fallback={<FeaturedProfilesSkeleton />}>
            <FeaturedProfilesFromBackend />
          </Suspense>
          <BeverageLanding />
          {/* <FeaturesSection /> */}
          {/* <HeroVideoDialogDemoTopInBottomOut /> */}
          <HeadSection />
          <SubscriptionPlan />
        </div>
      </div>
    </main>
  );
}
