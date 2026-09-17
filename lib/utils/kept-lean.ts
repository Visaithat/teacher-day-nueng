import { WISH } from "@/lib/constants/kept";
import { jitter } from "@/lib/utils/jitter";

/**
 * How far line `n` of the wish leans, in degrees.
 *
 * Deterministic, so the server and the browser agree on it and the writing does
 * not jump on hydration.
 *
 * @param n The line's index.
 * @returns A lean within {@link WISH.lean} either way.
 */
export function leanAt(n: number) {
  return jitter(n, 23.7) * WISH.lean;
}
