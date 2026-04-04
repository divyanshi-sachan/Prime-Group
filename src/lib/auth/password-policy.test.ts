import { describe, it, expect } from "vitest";
import { PASSWORD_MIN_LENGTH, passwordMeetsPolicy, signupPasswordSchema } from "./password-policy";

describe("passwordMeetsPolicy", () => {
  it("accepts 8+ chars with letter and digit", () => {
    expect(passwordMeetsPolicy("abcdefgh1")).toBe(true);
  });

  it("accepts letter + simple symbol without digit", () => {
    expect(passwordMeetsPolicy("abcdefgh!")).toBe(true);
  });

  it("rejects too short", () => {
    expect(passwordMeetsPolicy("abc12")).toBe(false);
  });

  it("rejects letters only", () => {
    expect(passwordMeetsPolicy("abcdefgh")).toBe(false);
  });

  it("rejects digits only", () => {
    expect(passwordMeetsPolicy("12345678")).toBe(false);
  });
});

describe("signupPasswordSchema", () => {
  it("parses valid passwords", () => {
    expect(() => signupPasswordSchema.parse("mysecure1")).not.toThrow();
    expect(() => signupPasswordSchema.parse("mysecure!")).not.toThrow();
  });

  it("rejects short password with clear min length message", () => {
    const r = signupPasswordSchema.safeParse("a1");
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toContain(String(PASSWORD_MIN_LENGTH));
    }
  });
});
