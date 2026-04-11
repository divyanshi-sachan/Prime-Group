/** Detect fetch/Supabase errors caused by AbortSignal (Strict Mode, duplicate clients, tab backgrounding). */
export function isAbortLikeError(err: unknown): boolean {
  if (err == null) return false;
  if (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") {
    return true;
  }
  const msg =
    typeof err === "object" && err !== null && "message" in err && typeof (err as Error).message === "string"
      ? (err as Error).message
      : String(err);
  return /aborted|aborterror|signal is aborted/i.test(msg);
}

export function userFacingAbortMessage(): string {
  return "Connection was interrupted. Please check your network and tap Continue again.";
}
