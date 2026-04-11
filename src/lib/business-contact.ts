/**
 * Official business contact for Contact Us, footer, and legal pages.
 * Update all fields to match your GST-registered / operational premises and the phone number
 * you publish for customers (payment gateways and ads often require consistency).
 */
export const BUSINESS_NAME = "Prime Group Matrimony";

/** Lines shown on Contact Us, footer, and policies (complete Indian postal address). */
export const BUSINESS_ADDRESS_LINES = [
  `${BUSINESS_NAME}`,
  "Commercial office: Hauz Khas",
  "Near IIT Delhi Research & Innovation Park",
  "New Delhi — 110016",
  "Delhi, India",
] as const;

/** E.164-style display; primary business support line. */
export const BUSINESS_PHONE_DISPLAY = "+91 98765 43210";

export const BUSINESS_PHONE_TEL = "tel:+919876543210";

export const BUSINESS_EMAIL = "primegroupmatrimony@gmail.com";

export const BUSINESS_EMAIL_MAILTO = `mailto:${BUSINESS_EMAIL}`;

export const BUSINESS_HOURS =
  "Monday to Saturday, 10:00 AM – 6:00 PM IST (closed on Sundays and public holidays in India).";
