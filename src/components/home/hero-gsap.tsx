'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HeroGsap = () => {
  return (
    <div className="relative h-dvh w-screen overflow-hidden" style={{ position: 'relative', isolation: 'isolate' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'auto',
          pointerEvents: 'none'
        }}
      >
        <Image
          src="/img/herosection.png"
          alt="Hero Section"
          fill
          priority
          className="object-cover"
          style={{ 
            objectPosition: 'center 35%',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'translateZ(0)',
            willChange: 'auto',
            backfaceVisibility: 'hidden'
          }}
          sizes="100vw"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-5 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair-display font-bold mb-6 leading-tight text-gold-gradient">
              Find Your Perfect Match
            </h1>

            {/* Description Text */}
            <p className="text-base sm:text-lg md:text-xl font-montserrat mb-8 leading-relaxed" style={{ color: 'var(--pure-white)' }}>
              The Golden Bonds Matrimony brings together natural souls that connect with cherished moments, creating beautiful and lasting relationships.
            </p>

            {/* CTA Button */}
            <Link href="/discover">
              <Button 
                size="lg"
                className="px-8 py-6 text-base font-montserrat font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gold-gradient text-black border-none"
              >
                Learn More <span className="ml-2">&gt;</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroGsap;
