import { describe, expect, it } from "vitest";
import {
  sanitizeNextPath,
  sanitizeOptionalNextPath,
  sanitizeOptionalNextPathForAuthCallback,
} from "./safe-next-path";

describe("sanitizeNextPath", () => {
  it("allows normal internal paths", () => {
    expect(sanitizeNextPath("/discover")).toBe("/discover");
    expect(sanitizeNextPath("/onboarding/thank-you")).toBe("/onboarding/thank-you");
    expect(sanitizeNextPath("/checkout?plan=pro")).toBe("/checkout?plan=pro");
  });

  it("rejects protocol-relative and double slashes", () => {
    expect(sanitizeNextPath("//evil.com")).toBe("/discover");
    expect(sanitizeNextPath("/%2F%2Fevil.com")).toBe("/discover");
    expect(sanitizeNextPath("%2F%2Fevil.com")).toBe("/discover");
    expect(sanitizeNextPath("/foo//bar")).toBe("/discover");
  });

  it("decodes double-encoded attacks", () => {
    expect(sanitizeNextPath("%252F%252Fevil.com")).toBe("/discover");
    expect(sanitizeNextPath("/%252F%252Fevil.com")).toBe("/discover");
  });

  it("rejects backslashes and traversal", () => {
    expect(sanitizeNextPath(String.raw`/\\evil.com`)).toBe("/discover");
    expect(sanitizeNextPath("/%5Cevil")).toBe("/discover");
    expect(sanitizeNextPath("/../../admin")).toBe("/discover");
    expect(sanitizeNextPath("/ok/../admin")).toBe("/discover");
  });

  it("rejects overlong values", () => {
    const long = "/" + "a".repeat(200);
    expect(sanitizeNextPath(long)).toBe("/discover");
    expect(sanitizeOptionalNextPath(long)).toBeUndefined();
  });

  it("optional helper returns undefined for bad input", () => {
    expect(sanitizeOptionalNextPath(undefined)).toBeUndefined();
    expect(sanitizeOptionalNextPath("//x")).toBeUndefined();
  });
});

describe("sanitizeOptionalNextPathForAuthCallback", () => {
  it("allows normal targets", () => {
    expect(sanitizeOptionalNextPathForAuthCallback("/hi")).toBe("/hi");
    expect(sanitizeOptionalNextPathForAuthCallback("/discover")).toBe("/discover");
  });

  it("rejects auth callback paths that break client navigation", () => {
    expect(sanitizeOptionalNextPathForAuthCallback("/auth/callback")).toBeUndefined();
    expect(sanitizeOptionalNextPathForAuthCallback("/auth/callback/hi")).toBeUndefined();
    expect(sanitizeOptionalNextPathForAuthCallback("/auth/callback/hi/next")).toBeUndefined();
  });
});
