import type { Metadata } from "next";
import ContactHero from "@/components/contact/contact-hero";
import ContactAside from "@/components/contact/contact-aside";
import ContactForm from "@/components/contact/contact-form";
import { ContactLeadershipCarousel } from "@/components/contact/contact-leadership-carousel";

export const metadata: Metadata = {
  title: "Contact Us | Prime Group Matrimony",
  description:
    "Get in touch with Prime Group Matrimony for support, questions about profiles, privacy, or your account.",
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
      <ContactHero />

      <section className="px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <ContactAside />
            </div>
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <ContactLeadershipCarousel />
    </div>
  );
}
