import Image from "next/image";
import { Suspense } from "react";
import { getDiscoverProfiles } from "@/lib/discover";
import DiscoverGrid from "@/components/discover/discover-grid";
import { DiscoverGridSkeleton } from "@/components/loading/route-content-skeletons";

type DiscoverSearchParams = {
  city?: string;
  religion?: string;
  intent?: string;
};

async function DiscoverProfilesSection({
  searchParams,
}: {
  searchParams: Promise<DiscoverSearchParams>;
}) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : undefined;
  const religion = typeof params.religion === "string" ? params.religion : undefined;
  const intent = typeof params.intent === "string" ? params.intent : undefined;

  const profiles = await getDiscoverProfiles();

  return (
    <DiscoverGrid
      profiles={profiles}
      initialCity={city}
      initialReligion={religion}
      initialIntent={intent}
    />
  );
}

export default function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<DiscoverSearchParams>;
}) {
  return (
    <>
      <div
        className="relative w-screen
  h-[min(46dvh,360px)] sm:h-[45vh]
  min-h-[260px] sm:min-h-[380px]
  max-h-[400px] sm:max-h-[480px] md:max-h-[560px]
  overflow-hidden"
      >
        <Image
          src="/img/banner1.webp"
          alt="Discover Your Perfect Match"
          fill
          priority
          className="
    object-cover
    scale-105 sm:scale-100
  "
          sizes="100vw"
        />
        <div
          className="absolute inset-0 z-[1]
  bg-gradient-to-r
  from-[#0a1930]/45 sm:from-[#0a1930]/55
  via-[#0a1930]/20 sm:via-[#0a1930]/25
  to-transparent"
        />

        <div className="relative z-10 h-full flex flex-col justify-end sm:justify-center pb-6 pt-14 sm:pb-0 sm:pt-0">
          <div className="container mx-auto px-5 sm:px-10 lg:px-16 w-full">
            <div className="max-w-xl sm:mx-0 mx-auto text-center sm:text-left">
              <h1
                className="font-playfair-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl
                font-bold leading-tight text-gold-gradient mb-2 sm:mb-4"
              >
                Discover Your Forever
              </h1>
              <p className="font-general text-sm sm:text-base md:text-lg text-white/90 sm:text-white/85 mb-0 max-w-md sm:max-w-none mx-auto sm:mx-0 leading-snug sm:leading-normal">
                Handpicked profiles of accomplished individuals, curated for meaningful and lasting relationships.
              </p>
            </div>
          </div>
        </div>
      </div>
      <section
        className="relative z-[2] -mt-5 sm:mt-0 rounded-t-[1.25rem] sm:rounded-none px-4 sm:px-6 lg:px-8 pt-7 pb-12 sm:py-20 shadow-[0_-8px_30px_rgba(10,25,48,0.08)] sm:shadow-lg"
        style={{ backgroundColor: "var(--pure-white)" }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-16">
            <div
              className="inline-block mb-3 sm:mb-4 px-5 py-1.5 sm:px-6 sm:py-2 rounded-full"
              style={{ backgroundColor: "var(--primary-blue)" }}
            >
              <span className="text-xs sm:text-sm font-general font-semibold uppercase tracking-wide text-gold-gradient">
                Discover Profiles
              </span>
            </div>
            <h2
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair-display font-bold mb-2 sm:mb-4 text-gold-gradient px-2"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.15)" }}
            >
              Find Your Perfect Match
            </h2>
            <p
              className="text-sm sm:text-lg md:text-xl font-general max-w-2xl mx-auto px-1 sm:px-2 leading-relaxed"
              style={{ color: "var(--primary-blue)" }}
            >
              Discover our handpicked profiles of accomplished individuals looking for their life partner.
            </p>
          </div>

          <Suspense fallback={<DiscoverGridSkeleton />}>
            <DiscoverProfilesSection searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
