import Link from "next/link"
import { Clock, Mail, MapPin, Phone, ShieldCheck, MessageSquare } from "lucide-react"

import {
  BUSINESS_ADDRESS_LINES,
  BUSINESS_EMAIL,
  BUSINESS_EMAIL_MAILTO,
  BUSINESS_HOURS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
} from "@/lib/business-contact"

export default function ContactAside() {
  return (
    <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
      <div>
        <h2 className="font-playfair-display text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--primary-blue)" }}>
          How we can help
        </h2>
        <p className="font-general text-sm leading-relaxed" style={{ color: "var(--primary-blue)", opacity: 0.78 }}>
          Our team supports members with account questions, safety concerns, billing and refunds, and guidance on using
          Prime Group Matrimony. Use the form or reach us directly using the details below.
        </p>
      </div>

      <div
        className="rounded-3xl border p-6"
        style={{
          borderColor: "rgba(226, 194, 133, 0.45)",
          background: "linear-gradient(145deg, rgba(0, 51, 102, 0.04) 0%, rgba(226, 194, 133, 0.06) 100%)",
        }}
      >
        <p className="font-general text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--primary-blue)", opacity: 0.55 }}>
          Registered / operational address (India)
        </p>
        <div className="flex gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(0, 51, 102, 0.06)" }}
          >
            <MapPin className="h-5 w-5" style={{ color: "var(--accent-gold)" }} aria-hidden />
          </div>
          <address className="font-general text-sm leading-relaxed not-italic" style={{ color: "var(--primary-blue)", opacity: 0.9 }}>
            {BUSINESS_ADDRESS_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
      </div>

      <ul className="space-y-5">
        <li className="flex gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(0, 51, 102, 0.06)" }}
          >
            <Phone className="h-5 w-5" style={{ color: "var(--accent-gold)" }} aria-hidden />
          </div>
          <div>
            <p className="font-general text-xs font-black uppercase tracking-widest" style={{ color: "var(--primary-blue)", opacity: 0.55 }}>
              Phone
            </p>
            <a
              href={BUSINESS_PHONE_TEL}
              className="font-general font-semibold mt-0.5 inline-block hover:opacity-80 underline-offset-2 hover:underline"
              style={{ color: "var(--primary-blue)" }}
            >
              {BUSINESS_PHONE_DISPLAY}
            </a>
          </div>
        </li>
        <li className="flex gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(0, 51, 102, 0.06)" }}
          >
            <Mail className="h-5 w-5" style={{ color: "var(--accent-gold)" }} aria-hidden />
          </div>
          <div>
            <p className="font-general text-xs font-black uppercase tracking-widest" style={{ color: "var(--primary-blue)", opacity: 0.55 }}>
              Business email
            </p>
            <a
              href={BUSINESS_EMAIL_MAILTO}
              className="font-general font-semibold mt-0.5 inline-block break-all hover:opacity-80 underline-offset-2 hover:underline"
              style={{ color: "var(--accent-gold)" }}
            >
              {BUSINESS_EMAIL}
            </a>
            <p className="font-general text-xs mt-1 leading-relaxed" style={{ color: "var(--primary-blue)", opacity: 0.65 }}>
              For support, billing, privacy requests, and general enquiries.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(0, 51, 102, 0.06)" }}
          >
            <Clock className="h-5 w-5" style={{ color: "var(--accent-gold)" }} aria-hidden />
          </div>
          <div>
            <p className="font-general text-xs font-black uppercase tracking-widest" style={{ color: "var(--primary-blue)", opacity: 0.55 }}>
              Business hours (IST)
            </p>
            <p className="font-general font-semibold mt-0.5" style={{ color: "var(--primary-blue)" }}>
              {BUSINESS_HOURS}
            </p>
            <p className="font-general text-xs mt-1 leading-relaxed" style={{ color: "var(--primary-blue)", opacity: 0.65 }}>
              We aim to reply to messages within 1–2 business days.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(0, 51, 102, 0.06)" }}
          >
            <ShieldCheck className="h-5 w-5" style={{ color: "var(--accent-gold)" }} aria-hidden />
          </div>
          <div>
            <p className="font-general text-xs font-black uppercase tracking-widest" style={{ color: "var(--primary-blue)", opacity: 0.55 }}>
              Privacy
            </p>
            <p className="font-general text-sm leading-relaxed mt-0.5" style={{ color: "var(--primary-blue)", opacity: 0.85 }}>
              We handle your details carefully and only use them to respond to your enquiry, in line with our{" "}
              <Link href="/privacy" className="font-semibold underline hover:opacity-80" style={{ color: "var(--accent-gold)" }}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </li>
      </ul>

      <div
        className="rounded-3xl border p-6"
        style={{
          borderColor: "rgba(226, 194, 133, 0.35)",
          background: "linear-gradient(145deg, rgba(0, 51, 102, 0.04) 0%, rgba(226, 194, 133, 0.08) 100%)",
        }}
      >
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--accent-gold)" }} aria-hidden />
          <div>
            <p className="font-playfair-display font-bold text-sm" style={{ color: "var(--primary-blue)" }}>
              Quick answers
            </p>
            <p className="font-general text-sm mt-1 leading-relaxed" style={{ color: "var(--primary-blue)", opacity: 0.8 }}>
              Many common topics are covered in our help center.
            </p>
            <Link
              href="/faqs"
              className="inline-block mt-3 text-xs font-black uppercase tracking-widest font-general hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              View FAQs →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
