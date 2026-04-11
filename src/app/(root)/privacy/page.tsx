import type { Metadata } from "next";
import Link from "next/link";

import { BUSINESS_EMAIL, BUSINESS_NAME } from "@/lib/business-contact";

export const metadata: Metadata = {
  title: "Privacy Policy | Prime Group Matrimony",
  description:
    "Prime Group Matrimony Privacy Policy. How we collect, use, store, and protect your personal data in India and for our matrimonial platform.",
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--pure-white)" }}
    >
      <div className="container mx-auto max-w-3xl">
        <p className="font-general text-sm mb-4" style={{ color: "var(--primary-blue)" }}>
          Last updated: April 2026
        </p>
        <h1
          className="font-playfair-display text-4xl font-bold mb-4"
          style={{ color: "var(--primary-blue)" }}
        >
          Privacy Policy
        </h1>
        <div
          className="w-16 h-1 rounded-full mb-8"
          style={{ backgroundColor: "var(--accent-gold)" }}
        />
        <div
          className="font-general space-y-6 text-base leading-relaxed"
          style={{ color: "var(--primary-blue)" }}
        >
          <p>
            {BUSINESS_NAME} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the Prime Group Matrimony
            website and related services. This Privacy Policy explains what personal data we collect,
            why we collect it, how we use and share it, how long we keep it, and the choices and rights
            you have. By using our services, you acknowledge this Policy. If you do not agree, please
            do not use the platform.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="controller">
            Who is responsible for your data?
          </h2>
          <p>
            The data controller for personal data processed through this platform is {BUSINESS_NAME},
            operating from India. For operational contact details (address, phone, email), see our{" "}
            <Link
              href="/contact-us"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact Us
            </Link>{" "}
            page.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="information-we-collect">
            Information we collect
          </h2>
          <p>We collect data in the following broad categories:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account and identity data:</strong> name, email address, mobile number, date of
              birth or age band, gender, login identifiers, password hashes, and verification codes.
            </li>
            <li>
              <strong>Profile and preference data:</strong> photographs, bio, education, profession,
              location (city/state/country as you choose), community or religion fields if you provide
              them, partner preferences, and similar matrimonial profile fields.
            </li>
            <li>
              <strong>Usage and technical data:</strong> IP address, device type, browser, approximate
              location derived from IP, pages viewed, actions taken on the site (e.g. interest sent),
              timestamps, and diagnostic logs needed to run and secure the service.
            </li>
            <li>
              <strong>Payment-related data:</strong> when you pay, our payment partners process card,
              UPI, or wallet details. We typically receive limited information (e.g. transaction ID,
              amount, last four digits of card where applicable)—not your full card number.
            </li>
            <li>
              <strong>Communications:</strong> messages you send to us (support tickets, contact form,
              email), and content you submit for moderation or safety review.
            </li>
            <li>
              <strong>Cookies and similar technologies:</strong> as described in the Cookies section
              below.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8" id="how-we-use">
            How we use your information (purposes)
          </h2>
          <p>We use personal data to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create, authenticate, and secure your account.</li>
            <li>Display your profile to other members according to your visibility settings and product rules.</li>
            <li>Operate matching, search, interest, favourites, and paid features (e.g. credits or contact unlocks).</li>
            <li>Process payments, prevent fraud, and comply with tax or accounting obligations.</li>
            <li>Send service messages (e.g. verification, receipts, security alerts) and, where permitted, marketing you can opt out of.</li>
            <li>Enforce our Terms, Community Guidelines, and investigate abuse or illegal activity.</li>
            <li>Improve the platform, analyse aggregated usage, and fix bugs.</li>
            <li>Comply with court orders, lawful requests from authorities, or applicable law.</li>
          </ul>
          <p>
            We do not sell your personal data to third parties for their independent marketing. We may
            use processors (subcontractors) who help us host, analyse, email, or process payments under
            strict confidentiality and security terms.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="legal-bases">
            Legal bases (including India)
          </h2>
          <p>
            Depending on the context, we rely on: your consent (e.g. optional marketing, certain cookies
            where required); performance of a contract (providing the service you signed up for); our
            legitimate interests (e.g. fraud prevention, service improvement, security), balanced
            against your rights; and legal obligation. If you are in India, we also process personal
            data in line with applicable Indian law, including the Digital Personal Data Protection Act,
            2023 and rules thereunder, where they apply to our processing.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="data-sharing">
            Sharing and disclosure
          </h2>
          <p>
            Contact details (such as phone or email) are shared with other users only when our product
            design and your actions allow it—for example, after a paid contact unlock, mutual
            acceptance, or as clearly described in the app at the time of use. We may disclose data to:
            hosting and infrastructure providers; payment gateways; email and customer-support tools;
            analytics providers (often with aggregated or pseudonymous data); professional advisers; or
            authorities when required by law. If we reorganise or sell our business, data may transfer
            as part of that transaction with appropriate safeguards and notice where required.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="retention">
            How long we keep data
          </h2>
          <p>
            We retain data only as long as needed for the purposes above. Active account data is kept
            while your account exists. After you delete your account or ask us to delete your data, we
            delete or anonymise personal data within a reasonable period, subject to limited retention
            where the law requires (e.g. invoices, dispute records) or where necessary to prevent fraud
            or enforce our terms (typically up to a few years for security logs and legal holds, unless a
            longer period is required). Backup copies may persist for a short technical window before
            automatic rotation.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="cookies">
            Cookies and similar technologies
          </h2>
          <p>
            We use cookies and similar technologies for session management, authentication, security,
            preferences, and analytics. You can control cookies through your browser settings. Where we
            offer a cookie preference centre, you can use it to adjust non-essential cookies. Essential
            cookies may be required for login and security.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="your-rights">
            Your rights and choices
          </h2>
          <p>
            You may have the right to access, correct, update, or delete your personal data; to export
            certain data; to withdraw consent where processing is consent-based; and to object to or
            restrict certain processing, subject to law. To exercise these rights, email us at{" "}
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              {BUSINESS_EMAIL}
            </a>{" "}
            or use{" "}
            <Link
              href="/contact-us"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact Us
            </Link>
            . We will verify your request where appropriate and respond within the timelines required by
            applicable law. If you are unhappy with our response, you may have the right to complain to
            your local data protection authority where one exists.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="security">
            How we protect your data
          </h2>
          <p>
            We use administrative, technical, and organisational measures appropriate to the risk,
            including encryption in transit (HTTPS), access controls for staff and systems, monitoring
            for abuse, and vendor due diligence. No online service can guarantee absolute security; if
            we become aware of a breach that affects you and the law requires notification, we will
            inform you as required.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="children">
            Children
          </h2>
          <p>
            Our services are intended for adults aged 18 and above. We do not knowingly collect
            personal data from children. If you believe a minor has provided us data, contact us and we
            will take steps to delete it.
          </p>

          <h2 className="text-xl font-semibold mt-8" id="international">
            International transfers
          </h2>
          <p>
            Our primary operations are in India. If we use service providers in other countries, we
            implement appropriate safeguards (such as contractual clauses) where required by law so that
            your data remains protected.
          </p>

          <h2 className="text-xl font-semibold mt-8">Changes</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the revised version on
            this page and change the &quot;Last updated&quot; date. For material changes, we may also notify
            you by email or an in-product notice where appropriate. Continued use after the effective
            date means you accept the updated Policy, except where your consent is required for new
            processing.
          </p>

          <p className="mt-8">
            Questions about this Privacy Policy?{" "}
            <Link
              href="/contact-us"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
