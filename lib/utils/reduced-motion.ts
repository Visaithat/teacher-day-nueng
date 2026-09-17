/**
 * Whether the reader has asked the system for less motion.
 *
 * Always asked at the moment a decision is made, never remembered from mount:
 * the stylesheets answer the same question with a live media query, and a second
 * copy of the answer held in JS could only ever go stale against them. A reader
 * who changes their mind mid-page gets the new answer from both sides at once.
 *
 * @returns `true` when `(prefers-reduced-motion: reduce)` matches.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
