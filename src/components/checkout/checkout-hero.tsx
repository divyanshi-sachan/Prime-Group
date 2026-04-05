"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ShieldCheck, Coins, Loader2 } from "lucide-react"
import { useCredits } from "@/context/credits-context"

const PARTICLE_LAYOUT = Array.from({ length: 10 }, (_, i) => ({
  left: ((i * 47) % 88) + 6,
  top: ((i * 29) % 80) + 10,
  scale: 0.45 + (i % 5) * 0.08,
  duration: 14 + (i % 5),
  delay: (i % 4) * 0.85,
}))

function HeroParticles({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {PARTICLE_LAYOUT.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-[#E2C285] opacity-20 shadow-[0_0_6px_#E2C285]"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          initial={{ scale: p.scale }}
          animate={{
            y: ["0%", "-100%", "100%"],
            opacity: [0, 0.28, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

interface CheckoutHeroProps {
  subtitle?: string
  /** When set, replaces the default “Buy credits” headline. */
  heroTitle?: string
}

export default function CheckoutHero({ subtitle, heroTitle }: CheckoutHeroProps) {
  const reduceMotion = useReducedMotion()
  const [particlesOn, setParticlesOn] = useState(false)
  const { credits, loading: creditsLoading, refreshCredits } = useCredits()

  useEffect(() => {
    setParticlesOn(true)
  }, [])

  useEffect(() => {
    void refreshCredits()
  }, [refreshCredits])

  const showParticles = particlesOn && !reduceMotion
  const instant = { duration: 0 }

  return (
    <section
      className="relative w-full overflow-hidden bg-[#003366] pt-24 pb-12 md:pt-28 md:pb-14 lg:pt-32 lg:pb-16"
      aria-labelledby="checkout-hero-heading"
    >
      <HeroParticles visible={showParticles} />
      <div className="absolute top-0 right-0 w-[min(100%,380px)] h-[380px] bg-[#E2C285]/5 rounded-full blur-[90px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[min(100%,280px)] h-[280px] bg-blue-900/20 rounded-full blur-[64px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? instant : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center lg:text-left"
        >
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-[#E2C285] transition-colors mb-5 font-general uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Discover
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E2C285]/90 font-general mb-3">
            Credits
          </p>
          <h1
            id="checkout-hero-heading"
            className="font-playfair-display font-black text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] sm:leading-[1.08] tracking-tight"
          >
            {heroTitle ? (
              heroTitle
            ) : (
              <>
                Buy{" "}
                <span className="text-gold-gradient bg-clip-text text-transparent">credits</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/75 font-general font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            {subtitle ??
              "Unlock verified contact details when you find the right profile. Pay securely—your balance updates automatically after payment."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-4">
            <div
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#E2C285]/45 bg-[#E2C285]/12 px-5 py-3.5 text-white shadow-[0_0_24px_rgba(226,194,133,0.12)]"
              role="status"
              aria-live="polite"
              aria-label="Current credit balance"
            >
              <Coins className="h-6 w-6 shrink-0 text-[#F5D78A]" aria-hidden />
              {creditsLoading ? (
                <span className="inline-flex items-center gap-2 text-sm font-general text-white/80">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Loading balance…
                </span>
              ) : (
                <span className="font-general text-sm sm:text-base">
                  <span className="text-white/75">Your balance:</span>{" "}
                  <strong className="text-xl font-general font-bold tabular-nums text-white">{credits.toLocaleString()}</strong>{" "}
                  <span className="text-white/80">credits</span>
                </span>
              )}
            </div>
            <span className="inline-flex items-center justify-center gap-2 text-white/65 text-sm font-general">
              <ShieldCheck className="h-5 w-5 text-[#E2C285] shrink-0" aria-hidden />
              Secure checkout
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
