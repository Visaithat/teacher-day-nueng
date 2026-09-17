/**
 * Where each thing stands once it is out of the envelope, and the words written
 * over the one that is a wish.
 *
 * See {@link Stand} for the coordinate system these measurements belong to - it
 * is not the scene's.
 */

import type { Stand } from "@/types/kept";

export const STANDS: Record<string, Stand> = {
  /** Most of the window's height, with cloth showing top and bottom so the
      torn edges are never touching the glass. */
  letter: { wide: "min(92vw, calc(82dvh * 0.82))", level: 0, gap: "0rem" },
  /** Room enough below it for the deck and the song's name. */
  cassette: {
    wide: "min(88vw, calc(52dvh * 1.455))",
    level: -7.66,
    gap: "3.6rem",
  },
  /** Nothing is written on it yet, so it simply lies in the middle. */
  postcard: { wide: "min(88vw, calc(64dvh * 1.506))", level: 1.84, gap: "0rem" },
};

/* --- the writing on the paper -------------------------------------------- */

/**
 * The block the wish is written in, as percentages of the sheet's own box.
 *
 * The artwork already carries "Dear Teacher Nueng" in a brush hand across the
 * top, so only the body and the name are real text — the same division the name
 * cards make, where one picture serves every letter and only the lines change.
 *
 * Every one of these reaches the stylesheet as a custom property on the block
 * itself — nothing below is written out twice.
 *
 * THE CREASE IS NOT A MARGIN. The sheet is printed with a fold running down the
 * right of it, and an earlier version of this cut every line short of it, so
 * the block came out as a wedge that opened as it fell. It was wrong twice
 * over: the fold is a highlight and not a tear, so words cross it exactly the
 * way ink crosses a fold on real paper — and the lines nearest the top were
 * left so narrow that the ones somebody had chosen wrapped anyway, which is the
 * one thing storing the wish as lines was meant to prevent. A straight right
 * edge, and the fold is something the writing goes over.
 */
export const WISH = {
  /** Clear of the torn left edge, which reaches 7% of the width at its widest. */
  left: 12,
  right: 12,
  /** Under the greeting the artwork is printed with: its ink ends at 14% down. */
  top: 20,
  /**
   * The pen, as a share of the sheet's WIDTH and not its height.
   *
   * A hand does not write taller on a taller page; it writes the same letters,
   * and it is the page that changes size. 4.2% is what fits eleven lines and a
   * name between the greeting and the torn foot with room to spare — measured
   * against the rendered page rather than estimated from the font's metrics,
   * which is a calculation that has been wrong here once already.
   */
  size: 4.2,
  /** How far a line is allowed to lean, either way. Nobody rules a line. */
  lean: 0.5,
};
