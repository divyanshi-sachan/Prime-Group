'use client'

import Image from "next/image";
import ProfileCard from "@/components/discover/profile-card";
import profilesData from "@/data/profiles.json";
import { motion } from "framer-motion";

export default function DiscoverPage() {
  return (
    <>
      <div className="relative w-screen 
  h-[55vh] sm:h-[45vh] 
  min-h-[420px] sm:min-h-[380px] 
  max-h-[560px] sm:max-h-[480px] 
  overflow-hidden">

        {/* Background Image */}
        <Image
  src="/img/discover1.png"
  alt="Discover Your Perfect Match"
  fill
  priority
  className="
    object-cover
    scale-105 sm:scale-100
    object-[right_20%] sm:object-[right_top]
  "
  sizes="100vw"
/>

        {/* Gradient overlay ONLY on left */}
          <div className="absolute inset-0 z-[1] 
  bg-gradient-to-r 
  from-[#0a1930]/45 sm:from-[#0a1930]/55
  via-[#0a1930]/20 sm:via-[#0a1930]/25
  to-transparent" />


        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-xl">

              <h1 className="font-playfair-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                font-bold leading-tight text-gold-gradient mb-4 mt-20">
                Discover Your Forever
              </h1>

              <p className="font-montserrat text-base sm:text-lg text-white/85 mb-6">
                Handpicked profiles of accomplished individuals,
                curated for meaningful and lasting relationships.
              </p>

              <button className="inline-flex items-center gap-2 
                rounded-full bg-[#0a3a6b] px-6 py-3 
                text-sm font-semibold uppercase tracking-wide text-white
                hover:bg-[#0b4a8a] transition">
                Discover Profiles
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ================= PROFILES SECTION ================= */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 shadow-lg"
        style={{ backgroundColor: 'var(--pure-white)' }}
      >
        <div className="container mx-auto max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div
              className="inline-block mb-4 px-6 py-2 rounded-full"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              <span className="text-sm font-montserrat font-semibold uppercase tracking-wide text-gold-gradient">
                Discover Profiles
              </span>
            </div>

            <h2
              className="text-4xl sm:text-5xl md:text-6xl 
              font-playfair-display font-bold mb-4 text-gold-gradient"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}
            >
              Find Your Perfect Match
            </h2>

            <p
              className="text-lg sm:text-xl font-montserrat max-w-2xl mx-auto"
              style={{ color: 'var(--primary-blue)' }}
            >
              Discover our handpicked profiles of accomplished individuals
              looking for their life partner.
            </p>
          </motion.div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {profilesData.profiles.map((profile, index) => (
              <ProfileCard key={profile.id} data={profile} index={index} />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
