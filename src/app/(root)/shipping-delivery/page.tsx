import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Prime Group Matrimony",
  description:
    "How Prime Group Matrimony delivers digital matrimony services, timelines for access after payment, and confirmation that we do not ship physical goods.",
};

export default function ShippingDeliveryPage() {
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
          Shipping &amp; Delivery Policy
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
            This policy describes how &quot;delivery&quot; works for Prime Group Matrimony. Our service is
            delivered online; we do not sell or ship physical products through this website unless we
            explicitly state otherwise on a product page in the future.
          </p>

          <h2 className="text-xl font-semibold mt-8">Digital services only</h2>
          <p>
            All memberships, credits, contact unlocks, and other paid features are digital goods and
            services. There is no parcel dispatch, courier tracking, or physical shipping address
            required for these purchases.
          </p>

          <h2 className="text-xl font-semibold mt-8">When access is delivered</h2>
          <p>
            After your payment is successfully authorised by our payment provider, your account is
            usually updated automatically within a few minutes. In rare cases (for example, bank or
            network delays, or additional fraud checks), activation may take up to 24 hours. If your
            purchase is not reflected after 24 hours, please{" "}
            <Link
              href="/contact-us"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              contact us
            </Link>{" "}
            with your registered email and transaction reference.
          </p>

          <h2 className="text-xl font-semibold mt-8">Delivery &quot;costs&quot;</h2>
          <p>
            There are no separate shipping or handling charges for digital services. The total price
            shown at checkout is what you pay for the selected plan or feature (plus applicable
            government taxes as shown), unless we notify you otherwise before you confirm payment.
          </p>

          <h2 className="text-xl font-semibold mt-8">If we ever sell physical goods</h2>
          <p>
            Should we offer physical merchandise or documents in the future, we will publish
            applicable shipping regions, estimated delivery timelines, and any shipping fees on the
            relevant product or checkout page, and update this policy accordingly.
          </p>

          <p className="mt-8">
            Related:{" "}
            <Link
              href="/refund"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Refund &amp; Cancellation Policy
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="underline font-medium hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
