import type { Metadata } from "next";
import Link from "next/link";
import AboutHero from "@/components/about/about-hero";
import AboutPillars from "@/components/about/about-pillars";

export const metadata: Metadata = {
  title: "About Us | Prime Group Matrimony",
  description:
    "Learn about Prime Group Matrimony—our mission, values, and commitment to helping you find your perfect life partner through trust and verification.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
      <AboutHero />

      <div className="px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="container mx-auto max-w-5xl">
          <AboutPillars />

          <div className="mt-16 lg:mt-20 max-w-3xl mx-auto space-y-5 sm:space-y-6">
            <p
              className="font-general font-medium text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--primary-blue)", opacity: 0.9 }}
            >
              Prime Group Matrimony is an India-focused online matrimonial platform operated by Prime
              Group Matrimony. We help individuals and families discover compatible matches through
              structured profiles, search and discovery tools, and optional paid features that improve
              visibility and how members connect—always with clear consent and privacy controls.
            </p>

            <h2
              id="what-we-offer"
              className="font-playfair-display text-xl sm:text-2xl font-bold tracking-tight mt-10 scroll-mt-28"
              style={{ color: "var(--primary-blue)" }}
            >
              What we offer
            </h2>
            <p
              className="font-general font-medium text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--primary-blue)", opacity: 0.88 }}
            >
              We sell access to digital matrimony services on our website and app (where available),
              including: creating and managing a matrimonial profile; browsing and filtering compatible
              profiles; expressing interest; favourites and shortlists; and optional paid plans or
              credits for enhanced reach, priority placement, or unlocking contact details where the
              product allows—subject to mutual consent and our{" "}
              <Link
                href="/terms"
                className="underline font-semibold hover:opacity-80 font-general"
                style={{ color: "var(--accent-gold)" }}
              >
                Terms of Service
              </Link>
              . We do not arrange marriages or guarantee outcomes; we provide a technology platform and
              support processes to help you meet people who may be suitable for marriage.
            </p>

            <h2
              id="business-model"
              className="font-playfair-display text-xl sm:text-2xl font-bold tracking-tight mt-10 scroll-mt-28"
              style={{ color: "var(--primary-blue)" }}
            >
              Our business model
            </h2>
            <p
              className="font-general font-medium text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--primary-blue)", opacity: 0.88 }}
            >
              Prime Group Matrimony is a direct-to-consumer (B2C) digital business. Basic registration
              and profile features may be free or limited; we earn revenue when members purchase
              subscriptions, bundles, or one-time paid features (such as credits or contact unlocks)
              shown at checkout. Payments are processed by regulated payment partners; we receive a fee
              for the service delivered on the platform. We may introduce new plans or pricing over
              time, with notice where required by law or contract.
            </p>
            <p
              className="font-general font-medium text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--primary-blue)", opacity: 0.88 }}
            >
              We do not sell your personal data to advertisers. Marketing communications, if any, are
              sent in line with your preferences and our{" "}
              <Link
                href="/privacy"
                className="underline font-semibold hover:opacity-80 font-general"
                style={{ color: "var(--accent-gold)" }}
              >
                Privacy Policy
              </Link>
              .
            </p>

            <h2
              id="mission"
              className="font-playfair-display text-xl sm:text-2xl font-bold tracking-tight mt-10 scroll-mt-28"
              style={{ color: "var(--primary-blue)" }}
            >
              Our Mission
            </h2>
            <p
              className="font-general font-medium text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--primary-blue)", opacity: 0.88 }}
            >
              To become the most trusted and efficient matrimonial platform by enabling meaningful
              connections through verified profiles, clear privacy controls, and a professional
              experience that families and individuals can rely on.
            </p>

            <h2
              id="trust"
              className="font-playfair-display text-xl sm:text-2xl font-bold tracking-tight mt-10 scroll-mt-28"
              style={{ color: "var(--primary-blue)" }}
            >
              Trust &amp; Safety
            </h2>
            <p
              className="font-general font-medium text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--primary-blue)", opacity: 0.88 }}
            >
              We are committed to your safety and privacy. Profiles can be verified, contact details
              are shared only with your consent and within the bounds of our subscription model, and
              we maintain clear community guidelines and support for reporting or blocking
              inappropriate behaviour.
            </p>

            <h2
              id="contact"
              className="font-playfair-display text-xl sm:text-2xl font-bold tracking-tight mt-10 scroll-mt-28"
              style={{ color: "var(--primary-blue)" }}
            >
              Contact
            </h2>
            <p
              className="font-general font-medium text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--primary-blue)", opacity: 0.88 }}
            >
              For any questions about our services or this platform, please visit our{" "}
              <Link
                href="/contact-us"
                className="underline font-semibold hover:opacity-80 font-general"
                style={{ color: "var(--accent-gold)" }}
              >
                Contact Us
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
