import { z } from "zod";

/** Extra fields collected at registration; stored on `auth.users.user_metadata`. */
export const signupProfileFieldsSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, { message: "Enter a valid phone number (10–15 digits)" }),
});

export type SignupProfileFields = z.infer<typeof signupProfileFieldsSchema>;

export function normalizeSignupPhone(raw: string): string {
  return raw.trim();
}

export function signupMetadataFromFields(fields: SignupProfileFields): Record<string, string> {
  return {
    full_name: fields.full_name.trim(),
    phone: normalizeSignupPhone(fields.phone),
  };
}
