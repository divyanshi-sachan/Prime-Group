import type { Metadata } from "next";
import Link from "next/link";

import { BUSINESS_NAME } from "@/lib/business-contact";

export const metadata: Metadata = {
  title: "Terms of Service | Prime Group Matrimony",
  description:
    "Terms of Service for Prime Group Matrimony. Rules for accounts, subscriptions, acceptable use, liability, and governing law in India.",
};

export default function TermsPage() {
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
          Terms of Service
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
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the website, mobile
            experience, and related services (collectively, the &quot;Service&quot;) offered by {BUSINESS_NAME}
            (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating an account, browsing, or using paid features, you
            agree to these Terms and our{" "}
            <Link
              href="/privacy"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Privacy Policy
            </Link>
            ,{" "}
            <Link
              href="/community-guidelines"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Community Guidelines
            </Link>
            ,{" "}
            <Link
              href="/refund"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Refund &amp; Cancellation Policy
            </Link>
            , and{" "}
            <Link
              href="/shipping-delivery"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Shipping &amp; Delivery Policy
            </Link>
            . If you do not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold mt-8">Eligibility</h2>
          <p>
            You must be at least 18 years old and legally able to enter a binding contract under Indian
            law (or the law of your place of residence if you use the Service from outside India). You
            represent that registration information is accurate and that you will update it. One person
            should not maintain multiple accounts to deceive others or circumvent limits, unless we
            explicitly allow it in writing.
          </p>

          <h2 className="text-xl font-semibold mt-8">Account and profile</h2>
          <p>
            You are responsible for safeguarding your password and for all activity under your account.
            Notify us immediately of unauthorised use. You must provide truthful profile information.
            Fake, misleading, offensive, or illegal content; impersonation; or misuse of photos may result
            in removal of content, suspension, or permanent termination. We may review profiles for
            quality and safety and refuse or remove profiles at our discretion where the Terms or
            guidelines are violated.
          </p>

          <h2 className="text-xl font-semibold mt-8">Acceptable use</h2>
          <p>You agree to use the Service only for lawful matrimonial purposes. You must not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Harass, threaten, stalk, defraud, or harm other users.</li>
            <li>Send spam, bulk unsolicited messages, or commercial solicitation unrelated to matrimony.</li>
            <li>Scrape, crawl, harvest, or use automated means to access the Service without permission.</li>
            <li>Reverse engineer, probe, or attack our systems; circumvent paywalls or security.</li>
            <li>Upload malware or content that infringes intellectual property or privacy rights.</li>
            <li>Use the Service in violation of export control, sanctions, or other applicable laws.</li>
          </ul>
          <p>We may investigate violations and cooperate with law enforcement where appropriate.</p>

          <h2 className="text-xl font-semibold mt-8">Subscriptions, payments, and taxes</h2>
          <p>
            Paid plans, credits, and features are offered at the prices and currency shown at checkout.
            You authorise us and our payment partners to charge your selected payment method. You are
            responsible for applicable taxes (such as GST) shown at checkout or invoiced as required by
            law. Features may change over time; we will give notice where we are required to do so.
            Auto-renewal, if offered, will be disclosed before purchase. Cancellation and refunds are
            governed by our{" "}
            <Link
              href="/refund"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Refund &amp; Cancellation Policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8">Delivery of digital services</h2>
          <p>
            The Service is delivered online. See our{" "}
            <Link
              href="/shipping-delivery"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Shipping &amp; Delivery Policy
            </Link>{" "}
            for how access is granted after payment.
          </p>

          <h2 className="text-xl font-semibold mt-8">Intellectual property</h2>
          <p>
            The Service, including software, design, branding, and our content, is owned by us or our
            licensors. You receive a limited, revocable licence to use the Service for personal,
            non-commercial matrimonial use. You retain rights to content you upload but grant us a
            worldwide, non-exclusive licence to host, display, adapt format, and distribute that content
            as needed to operate, promote, and secure the Service, subject to your privacy settings and
            applicable law.
          </p>

          <h2 className="text-xl font-semibold mt-8">Third parties and offline conduct</h2>
          <p>
            We are not responsible for meetings, conversations, or agreements between users outside
            the platform. You are solely responsible for your interactions with others. We do not
            conduct criminal background checks on all users; &quot;verified&quot; or similar badges (if shown)
            mean only what we describe in-product and do not replace your own diligence.
          </p>

          <h2 className="text-xl font-semibold mt-8">Disclaimer</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;. TO THE MAXIMUM EXTENT PERMITTED BY LAW,
            WE DISCLAIM IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION, OR THAT YOU
            WILL FIND A SUITABLE MATCH. USER-GENERATED CONTENT IS PROVIDED BY USERS; WE DO NOT ENDORSE IT.
          </p>

          <h2 className="text-xl font-semibold mt-8">Limitation of liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE AND OUR AFFILIATES, OFFICERS,
            DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR REPUTATION,
            ARISING FROM YOUR USE OF THE SERVICE. OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE
            SERVICE IN ANY TWELVE-MONTH PERIOD IS LIMITED TO THE GREATER OF (A) THE AMOUNT YOU PAID US FOR
            THE SERVICE IN THAT PERIOD OR (B) INR 5,000, EXCEPT WHERE LIABILITY CANNOT BE LIMITED BY LAW
            (SUCH AS DEATH OR PERSONAL INJURY CAUSED BY OUR NEGLIGENCE, OR FRAUD).
          </p>

          <h2 className="text-xl font-semibold mt-8">Indemnity</h2>
          <p>
            You agree to indemnify and hold harmless {BUSINESS_NAME} and its affiliates from claims,
            damages, losses, and expenses (including reasonable legal fees) arising from your use of the
            Service, your content, or your breach of these Terms, except to the extent caused by our
            wilful misconduct.
          </p>

          <h2 className="text-xl font-semibold mt-8">Suspension and termination</h2>
          <p>
            We may suspend or terminate your access at any time for breach of these Terms, risk to
            others, legal requirements, or extended inactivity, with or without notice where permitted.
            You may close your account through account settings or by contacting support. Provisions that
            by nature should survive (e.g. liability limits, intellectual property, governing law) will
            survive termination.
          </p>

          <h2 className="text-xl font-semibold mt-8">Governing law and disputes</h2>
          <p>
            These Terms are governed by the laws of India, without regard to conflict-of-law rules.
            Subject to mandatory consumer protections, the courts at New Delhi, India shall have
            exclusive jurisdiction over disputes arising from or relating to these Terms or the
            Service. Before filing a claim, you agree to try to resolve the dispute informally by
            contacting us via{" "}
            <Link
              href="/contact-us"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact Us
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8">Force majeure</h2>
          <p>
            We are not liable for delay or failure to perform due to events beyond our reasonable
            control, including natural disasters, war, terrorism, riots, fire, epidemic, internet or
            power failure, or government action.
          </p>

          <h2 className="text-xl font-semibold mt-8">Changes</h2>
          <p>
            We may modify these Terms from time to time. We will post the updated Terms and update the
            &quot;Last updated&quot; date. If changes are material, we may provide additional notice. Continued use
            after the effective date constitutes acceptance. If you do not agree, stop using the
            Service and close your account.
          </p>

          <p className="mt-8">
            Questions about these Terms?{" "}
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
