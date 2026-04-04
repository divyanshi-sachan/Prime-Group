import { describe, it, expect } from "vitest";
import { ageFromIsoDateString, dateOfBirthSchema, MAX_PROFILE_AGE, MIN_PROFILE_AGE } from "./age-validation";

describe("ageFromIsoDateString", () => {
  it("returns null for empty", () => {
    expect(ageFromIsoDateString("")).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(ageFromIsoDateString("not-a-date")).toBeNull();
  });

  it("returns a number for a valid ISO date", () => {
    const y = new Date().getFullYear() - 40;
    const age = ageFromIsoDateString(`${y}-06-15`);
    expect(age).not.toBeNull();
    expect(age!).toBeGreaterThanOrEqual(39);
    expect(age!).toBeLessThanOrEqual(41);
  });
});

describe("dateOfBirthSchema", () => {
  it("rejects invalid range", () => {
    const y = new Date().getFullYear() - (MIN_PROFILE_AGE - 1);
    const r = dateOfBirthSchema.safeParse(`${y}-06-15`);
    expect(r.success).toBe(false);
  });

  it("accepts typical adult", () => {
    const y = new Date().getFullYear() - 30;
    const r = dateOfBirthSchema.safeParse(`${y}-06-15`);
    expect(r.success).toBe(true);
  });

  it("mentions bounds in error message", () => {
    const r = dateOfBirthSchema.safeParse(`${new Date().getFullYear()}-01-01`);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toContain(String(MIN_PROFILE_AGE));
      expect(r.error.issues[0]?.message).toContain(String(MAX_PROFILE_AGE));
    }
  });
});
