import type { Metadata } from "next";
import Link from "next/link";

import { BUSINESS_EMAIL } from "@/lib/business-contact";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Prime Group Matrimony",
  description:
    "Prime Group Matrimony refund and cancellation rules, eligibility, timelines, and how approved refunds are processed within 5–7 business days.",
};

export default function RefundPage() {
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
          Refund &amp; Cancellation Policy
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
            This policy explains how you can cancel certain purchases or your use of paid features,
            when you may qualify for a refund, and how long refunds take. It applies to subscriptions,
            credits, contact unlocks, and other paid digital services on Prime Group Matrimony unless a
            different policy is stated at checkout for a specific promotion.
          </p>

          <h2 className="text-xl font-semibold mt-8">Cancellation by you</h2>
          <p>
            <strong>Auto-renewing subscriptions (if offered):</strong> You may turn off auto-renewal in
            your account billing settings before the next renewal date. Cancellation stops future
            charges; it does not automatically refund the current billing period unless required by law
            or expressly stated at purchase.
          </p>
          <p>
            <strong>One-time purchases (credits, unlocks, add-ons):</strong> These are generally
            non-cancellable once delivery of the digital benefit has started (e.g. credits added to
            your account or a contact unlock completed), except where you have a legal right of
            withdrawal that applies or we approve a goodwill refund as described below.
          </p>
          <p>
            <strong>Account closure:</strong> You may close your account at any time via account
            settings or by contacting support. Closing your account does not by itself entitle you to a
            refund for unused paid time or unused credits unless this policy or applicable law says
            otherwise.
          </p>

          <h2 className="text-xl font-semibold mt-8">When you may request a refund</h2>
          <p>We may approve a refund or partial credit where, in our reasonable assessment:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You contact us within <strong>7 calendar days</strong> of the original purchase date for
              subscriptions or bundles, and you have <strong>not materially used</strong> paid benefits
              (for example, no contact unlocks used and no substantial consumption of credits as
              defined in our records).
            </li>
            <li>
              There was a <strong>duplicate charge</strong> or a <strong>technical failure</strong> on
              our side that prevented you from receiving the purchased feature after payment succeeded.
            </li>
            <li>
              A <strong>mandatory legal right</strong> applies (for example, certain consumer rules for
              digital content in your jurisdiction, if applicable).
            </li>
          </ul>
          <p>
            We may ask for your registered email, order or transaction ID, payment method (last four
            digits / UPI reference where available), and a short explanation. Decisions are made in
            good faith and may take up to <strong>5 business days</strong> from receipt of complete
            information.
          </p>

          <h2 className="text-xl font-semibold mt-8">Refund processing timeline</h2>
          <p>
            Once a refund is <strong>approved</strong>,{" "}
            <strong>
              refunds will be processed within 5–7 business days
            </strong>{" "}
            to the original payment method (or, if that is not possible, by bank transfer or another
            method we agree on). Banks, card networks, or UPI providers may take additional time to post
            the amount to your account; that delay is outside our control.
          </p>

          <h2 className="text-xl font-semibold mt-8">Non-refundable and discretionary cases</h2>
          <p>
            Refunds are typically <strong>not</strong> granted where: the request is made after the
            eligibility window; paid features or credits have been fully or substantially used; we
            detect abuse, chargeback fraud, or breach of our{" "}
            <Link
              href="/terms"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Terms of Service
            </Link>
            ; or promotional or discounted purchases were marked as non-refundable at checkout.
            Pro-rata or partial refunds for partially used periods are entirely at our discretion unless
            required by law.
          </p>

          <h2 className="text-xl font-semibold mt-8">Chargebacks</h2>
          <p>
            Please contact us before disputing a charge with your bank so we can help. Unjustified
            chargebacks may result in account suspension and recovery of fees.
          </p>

          <h2 className="text-xl font-semibold mt-8">How to contact us</h2>
          <p>
            Submit a request through{" "}
            <Link
              href="/contact-us"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact Us
            </Link>{" "}
            or email{" "}
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              {BUSINESS_EMAIL}
            </a>
            . Include your registered email and transaction details so we can locate your payment quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
