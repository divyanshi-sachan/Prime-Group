/**
 * Validates `next` / post-login redirect targets. Blocks open redirects, traversal,
 * double-encoded `//`, backslashes, and oversized values (header / abuse).
 */

import { pathnameOnly } from "@/lib/auth/post-auth-landing";

const MAX_SAFE_NEXT_LENGTH = 200;
/** Encoded payloads can be longer than the decoded path; cap work and size. */
const MAX_RAW_INPUT_LENGTH = 600;

function fullyDecodeNextParam(raw: string): string | null {
  let s = raw.trim();
  if (s.length > MAX_RAW_INPUT_LENGTH) return null;
  for (let i = 0; i < 8; i++) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(s);
    } catch {
      return null;
    }
    if (decoded === s) break;
    if (decoded.length > MAX_RAW_INPUT_LENGTH * 2) return null;
    s = decoded.trim();
  }
  if (s.length > MAX_SAFE_NEXT_LENGTH) return null;
  return s;
}

function isSafeRelativeAppPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("//")) return false;
  if (path.includes("\\")) return false;
  if (/[\x00-\x1f\x7f]/.test(path)) return false;
  for (const segment of path.split("/")) {
    if (segment === "..") return false;
  }
  return true;
}

function trySanitizeNextPath(next: string | null | undefined): string | undefined {
  if (next == null || typeof next !== "string") return undefined;
  const decoded = fullyDecodeNextParam(next);
  if (decoded == null) return undefined;
  if (!isSafeRelativeAppPath(decoded)) return undefined;
  return decoded;
}

const DEFAULT_FALLBACK = "/discover";

/** Always returns a safe path (for server redirects after auth). */
export function sanitizeNextPath(next: string | null | undefined): string {
  return trySanitizeNextPath(next) ?? DEFAULT_FALLBACK;
}

/** For optional `next` query props — invalid values become `undefined`. */
export function sanitizeOptionalNextPath(next: string | null | undefined): string | undefined {
  return trySanitizeNextPath(next);
}

/**
 * Same as {@link sanitizeOptionalNextPath}, but rejects `/auth/callback` targets so email-link
 * `next` cannot resolve to nested paths like `/auth/callback/hi` (App Router relative navigation bug).
 */
export function sanitizeOptionalNextPathForAuthCallback(
  next: string | null | undefined
): string | undefined {
  const s = trySanitizeNextPath(next);
  if (!s) return undefined;
  const base = pathnameOnly(s);
  if (base === "/auth/callback" || base.startsWith("/auth/callback/")) {
    return undefined;
  }
  return s;
}
