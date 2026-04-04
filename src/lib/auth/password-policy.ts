import { z } from "zod";

/** Minimum length for new passwords (sign-up / reset). Sign-in allows any length Supabase accepts. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Short hint for form helper text — avoids overly strict rules (no mixed case + digit + symbol all at once).
 */
export const PASSWORD_REQUIREMENT_HINT = "";

const HAS_LETTER = /[a-zA-Z]/;
/** Digit or a small set of symbols that are easy to type and read. */
const HAS_DIGIT_OR_SIMPLE_SYMBOL = /[\d!@#$%&*.,\-]/;

export function passwordMeetsPolicy(password: string): boolean {
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  if (!HAS_LETTER.test(password)) return false;
  if (!HAS_DIGIT_OR_SIMPLE_SYMBOL.test(password)) return false;
  return true;
}

/** Use for sign-up and password reset only (not sign-in — existing accounts may use older rules). */
export const signupPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .refine((p) => HAS_LETTER.test(p), {
    message: "Include at least one letter",
  })
  .refine((p) => HAS_DIGIT_OR_SIMPLE_SYMBOL.test(p), {
    message: "Add a number or a simple symbol (! @ # * - . ,)",
  });
