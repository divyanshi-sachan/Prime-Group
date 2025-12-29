'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CoolMode } from "../ui/cool-mode"
import MorphingText from "../ui/morphing-text"
import ScratchToReveal from "../ui/scratch-to-reveal"


const texts = [
  "MATRIMONY",
  "CONNECT",
  "UNITE",
  "BOND",
  "LOVE",
];

export default function BeverageLanding() {
  return (
    <div className="container mx-auto min-h-screen max-w-8xl relative overflow-hidden p-4 md:p-8" style={{ backgroundColor: 'var(--pure-white)' }}>
      {/* Background Text */}
      <div className="absolute top-0 left-0 text-[150px] md:text-[300px] font-bold leading-none z-0 opacity-10" style={{ color: 'var(--primary-blue)' }}>
       CONNECT
      </div>
      <div className="absolute bottom-0 right-0 text-[150px] md:text-[300px] font-bold leading-none z-0 opacity-10" style={{ color: 'var(--primary-blue)' }}>
        UNITE
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col gap-4 md:gap-8">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            {/* Polaroid 1 */}
            <div className="invisible md:visible transform -rotate-12 bg-white p-1 shadow-lg border-2" style={{ borderColor: 'var(--accent-gold)' }}>
              <Image
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop"
                alt="Happy couple"
                width={300}
                height={300}
                className="object-cover"
              />
            </div>
            
            {/* Explore Service Button */}
            <Button
              className="px-4 py-2 rounded-full text-sm font-semibold font-montserrat transition-all duration-300 hover:bg-gold-gradient hover:text-[var(--primary-blue)]"
              style={{ 
                backgroundColor: 'var(--primary-blue)',
                color: 'var(--pure-white)'
              }}
            >
              EXPLORE PROFILES
            </Button>
          </div>

          {/* Main Title */}
          <div className="flex flex-col items-center gap-2">
            {/* <h1 className="text-6xl md:text-9xl font-bold text-[#FF7748] text-center leading-none">
              MEMOWRIES
            </h1> */}
            {/* <HyperText
              className="text-6xl md:text-9xl font-bold text-[#FF7748] text-center leading-none"
              text="MEMOWRIES"
            /> */}
            <MorphingText texts={texts} className="text-6xl md:text-9xl font-bold text-center leading-none font-playfair-display" style={{ 
              background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-gold) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}/>
            {/* Polaroid 2 */}
            <div className="md:hidden transform rotate-6 bg-white p-1 shadow-lg border-2" style={{ borderColor: 'var(--accent-gold)' }}>
              <Image
                src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop"
                alt="Wedding couple"
                width={320}
                height={320}
                className="object-cover"
              />
            </div>
          </div>

          {/* Middle Section */}
          <div className="text-center mt-4">
            <h2 className="text-3xl md:text-5xl font-bold font-playfair-display text-gold-gradient">
            YOUR LIFE<br />PARTNER
            </h2>
            
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col items-center mt-4 md:mt-8">
            <p className="text-sm md:text-base text-center max-w-lg font-montserrat" style={{ color: 'var(--primary-blue)' }}>
              Connecting Hearts, Building Families - Your Trusted Partner in Finding Your Perfect Match with Verified Profiles and Personalized Matches
            </p>
            <CoolMode>
            <Button
              className="mt-4 px-6 py-2 rounded-full text-sm font-semibold font-montserrat bg-gold-gradient text-black hover:opacity-90 transition-all duration-300"
            >
              Start Your Journey
            </Button>
            </CoolMode>
          </div>

          {/* Polaroid 3 */}
          <div className="hidden md:block absolute bottom-4 -right-16 transform -rotate-6 bg-white p-1 shadow-lg border-2" style={{ borderColor: 'var(--accent-gold)' }}>
            <Image
              src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop"
              alt="Happy married couple"
              width={350}
              height={350}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

