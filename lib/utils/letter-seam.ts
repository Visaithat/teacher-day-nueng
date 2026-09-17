import {
  SEAM_BLEED,
  SEAM_INK,
  SEAM_MARGIN,
  SEAM_STEPS,
  SEAM_WANDER,
} from "@/lib/constants/letter-seam";
import { jitter } from "@/lib/utils/jitter";

/**
 * Where this letter's wax splits.
 *
 * Wax does not break in a straight line, so the seam is a run of points down the
 * middle of the seal, each nudged aside by a little. The nudge comes from the
 * card's own deterministic jitter, which means two things worth having: every
 * letter cracks along its OWN line, and the same letter cracks along the same
 * line every time the page is loaded, so the server and the browser never
 * disagree about it.
 *
 * 9% of wander is not a guess. Measured against the artwork's own alpha, the wax
 * covers 21-74% of its box at the narrowest point and 36-72% at the bottom, so a
 * seam kept between 41% and 59% cuts solid wax at every height — wander further
 * and the crack would run off the edge of the wax and simply vanish for part of
 * its length.
 *
 * Both halves read the seam in the same direction and to the same two decimals,
 * so the numbers along the join are the same characters in both strings and no
 * rounding can prise them apart.
 */
export function seamOf(index: number) {
  const at = (k: number) => 50 + jitter(index, 61.3 + k * 13.7) * SEAM_WANDER;
  const y = (k: number) => (k / SEAM_STEPS) * 100;
  const pt = (x: number, at_y: number) => `${x.toFixed(2)}% ${at_y.toFixed(2)}%`;
  const seam = (shift: number) =>
    Array.from({ length: SEAM_STEPS + 1 }, (_, k) => pt(at(k) + shift, y(k)));
  /* Carried straight up and down past the box, so a half keeps the shadow its
     artwork throws outside it. */
  const edge = (shift: number) => [
    pt(at(0) + shift, -SEAM_MARGIN),
    ...seam(shift),
    pt(at(SEAM_STEPS) + shift, 100 + SEAM_MARGIN),
  ];
  const near = -SEAM_MARGIN;
  const far = 100 + SEAM_MARGIN;
  return {
    left: `polygon(${pt(near, near)}, ${edge(SEAM_BLEED).join(", ")}, ${pt(near, far)})`,
    right: `polygon(${pt(far, near)}, ${edge(0).join(", ")}, ${pt(far, far)})`,
    // Down one side of the seam and back up the other: a zigzag ribbon. Not
    // carried past the box — a crack stops where the wax does.
    line: `polygon(${[...seam(-SEAM_INK), ...seam(SEAM_INK).reverse()].join(", ")})`,
  };
}
