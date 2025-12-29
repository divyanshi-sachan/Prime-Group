import FeaturedProfiles from "@/components/home/featured-profiles";
import FeaturesSection from "@/components/home/features-section";
import HeadSection from "@/components/home/head-section";
import Hero from "@/components/home/hero";
import HeroMeq from "@/components/home/hero-meq";
import BeverageLanding from "@/components/home/products-section";
import ShopSection from "@/components/home/shop-section";
import AnimatedTestimonialsDemo from "@/components/home/testimonials";
import Faq3Demo from "@/components/faqs/FaqsSection";
import { Feature6 } from "@/components/home/features";
import { HeroVideoDialogDemoTopInBottomOut } from "@/components/home/video";
import HeroPage from "@/components/home/heropage";
import LoadingOverlay from "@/components/home/loading-overlay";
import HeroGsap from "@/components/home/hero-gsap";
import SubscriptionPlan from "@/components/home/subscription-plan";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      {/* <LoadingOverlay /> */}
      <HeroGsap />
      
      {/* Content wrapper */}
      <div className="relative">
        {/* Main content */}
        <div className="relative z-20 mt-20">
          <FeaturedProfiles />
        <BeverageLanding />
        {/* <FeaturesSection /> */}
        {/* <HeroVideoDialogDemoTopInBottomOut /> */}
        <Feature6 />
        <HeadSection />
          <SubscriptionPlan />
          {/* <AnimatedTestimonialsDemo /> */}
          <Faq3Demo /> 
        </div>
      </div>
    </main>
  );
}
