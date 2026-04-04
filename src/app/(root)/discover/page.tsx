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
  h-[55vh] sm:h-[45vh]
  min-h-[420px] sm:min-h-[380px]
  max-h-[560px] sm:max-h-[480px]
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

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-xl">
              <h1
                className="font-playfair-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl
                font-bold leading-tight text-gold-gradient mb-3 sm:mb-4 mt-16 sm:mt-20"
              >
                Discover Your Forever
              </h1>
              <p className="font-general text-base sm:text-lg text-white/85 mb-6">
                Handpicked profiles of accomplished individuals, curated for meaningful and lasting relationships.
              </p>
            </div>
          </div>
        </div>
      </div>
      <section className="py-20 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div
              className="inline-block mb-4 px-6 py-2 rounded-full"
              style={{ backgroundColor: "var(--primary-blue)" }}
            >
              <span className="text-sm font-general font-semibold uppercase tracking-wide text-gold-gradient">
                Discover Profiles
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair-display font-bold mb-3 sm:mb-4 text-gold-gradient px-2"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.15)" }}
            >
              Find Your Perfect Match
            </h2>
            <p
              className="text-base sm:text-lg md:text-xl font-general max-w-2xl mx-auto px-2"
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
