"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const HeroGsap = () => {
  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-black">
      {/* Background Image with Premium Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Image
          src="/img/discover1.png"
          alt="Hero Section"
          fill
          priority
          className="object-cover md:object-[center_35%] object-[right_center]"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-5 sm:px-10 lg:px-16">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-3">
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-playfair-display font-bold leading-tight tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, var(--gold-light) 80%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Find Your Perfect Match
              </h1>
              <div className="w-12 h-1 bg-gradient-to-r from-gold-light to-transparent rounded-full"></div>
            </div>

            <p className="text-base sm:text-lg md:text-xl font-montserrat leading-relaxed text-white/90 max-w-lg">
              Prime Group brings together natural souls creating beautiful relationships.
            </p>

            <Link href="/discover" className="inline-block">
              <Button
                size="lg"
                className="px-8 py-6 text-base font-montserrat font-semibold rounded-lg transition-all duration-500 hover:shadow-2xl bg-gold-gradient text-black border-none hover:scale-105 active:scale-95"
              >
                Learn More <span className="ml-2">&gt;</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroGsap
