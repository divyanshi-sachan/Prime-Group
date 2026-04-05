"use client";

import Link from "next/link";
import { HardHat, Sparkles } from "lucide-react";
import CheckoutHero from "@/components/checkout/checkout-hero";
import { Button } from "@/components/ui/button";

export function PaymentsComingSoonScreen() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
      <CheckoutHero
        heroTitle="Payments opening soon"
        subtitle="We’re under active development. Secure payments will be accepted here very soon — thank you for your patience."
      />
      <section className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="container max-w-lg mx-auto">
          <div
            className="rounded-[2rem] border-2 p-8 sm:p-10 text-center shadow-[0_24px_60px_rgba(0,51,102,0.1)]"
            style={{ borderColor: "rgba(226, 194, 133, 0.4)", backgroundColor: "var(--pure-white)" }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003366]/[0.06]">
              <HardHat className="h-8 w-8 text-[#003366]" aria-hidden />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#003366]/50 font-general mb-2">
              Under construction
            </p>
            <h2 className="font-playfair-display text-xl sm:text-2xl font-black text-[#003366] tracking-tight mb-4">
              Checkout is paused for launch
            </h2>
            <p className="font-general text-sm sm:text-base text-[#003366]/75 leading-relaxed mb-6">
              Our team is finalizing payment integration. You can still browse profiles and use the rest of the platform.
              Check back soon to purchase credits.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-general text-[#003366]/55 mb-8">
              <Sparkles className="h-4 w-4 text-[#E2C285]" aria-hidden />
              Prime Group — built with care
            </div>
            <Button
              asChild
              className="w-full h-12 rounded-2xl bg-gold-gradient text-[#001a33] font-bold border-none hover:scale-[1.02] transition-transform font-general"
            >
              <Link href="/discover">Continue browsing</Link>
            </Button>
            <p className="mt-6">
              <Link
                href="/"
                className="font-general text-sm font-medium text-[#003366]/65 hover:text-[#E2C285] transition-colors underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
