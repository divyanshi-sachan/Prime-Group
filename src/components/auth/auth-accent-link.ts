/**
 * Accent CTAs on white backgrounds (Register free, Sign in, Forgot password, etc.).
 * Navy text + gold underline for contrast — no background box.
 */
export const authFormAccentLinkClass =
  "font-semibold " +
  "text-[var(--primary-blue)] " +
  "underline underline-offset-[3px] decoration-2 decoration-[#b8892a] hover:decoration-[#7d6224] " +
  "transition-[text-decoration-color] duration-200";

/** Gold links on dark hero imagery — keep hue, add legibility. */
export const authHeroAccentLinkClass =
  "font-semibold underline underline-offset-2 " +
  "text-[var(--accent-gold)] " +
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] " +
  "hover:brightness-110 transition-[filter] duration-200";

/** Inline legal links on white. */
export const authFormLegalLinkClass =
  "font-medium text-[var(--primary-blue)] underline underline-offset-[3px] decoration-2 decoration-[#b8892a] " +
  "hover:decoration-[#7d6224]";
