/**
 * When true (e.g. on production at launch), checkout shows a “payments soon” screen and payment
 * APIs return 503. Set `NEXT_PUBLIC_PAYMENTS_COMING_SOON=true` on the host only when needed.
 */
export function isPaymentsComingSoon(): boolean {
  const v = process.env.NEXT_PUBLIC_PAYMENTS_COMING_SOON?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}
