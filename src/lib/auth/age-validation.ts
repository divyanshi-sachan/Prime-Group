import { z } from "zod";

/** Minimum age to register / appear on the platform (matrimony). */
export const MIN_PROFILE_AGE = 18;
/** Upper bound to block obvious typos (e.g. year 1920 vs 2020). */
export const MAX_PROFILE_AGE = 100;

/**
 * Age in full years from an HTML date value `YYYY-MM-DD`.
 * Uses the viewer's local calendar so birthday matches what they picked in the date input.
 */
export function ageFromIsoDateString(dob: string): number | null {
  const trimmed = dob?.trim();
  if (!trimmed || trimmed.length < 10) return null;
  const parts = trimmed.slice(0, 10).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, day] = parts;
  const birth = new Date(y, m - 1, day);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== day) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export const dateOfBirthSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine((s) => {
    const age = ageFromIsoDateString(s);
    if (age === null) return false;
    return age >= MIN_PROFILE_AGE && age <= MAX_PROFILE_AGE;
  }, {
    message: `You must be between ${MIN_PROFILE_AGE} and ${MAX_PROFILE_AGE} years old (check the year if this looks wrong).`,
  });
