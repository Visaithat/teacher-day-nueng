/** How the letters are dealt out on the cloth, and what it takes to move them. */

export const DECK = {
  /**
   * Between one letter's centre and the next. `em`, capped against the viewport.
   * The design's 58 leaves the letter behind hanging off the right edge of a
   * 1280 screen; 46 brings it fully back on at the 0.74 it is drawn at, which is
   * the point — a letter cut off by the window reads as a mistake, where one
   * standing whole but smaller reads as waiting its turn.
   */
  spacingEm: 46,
  /** How far back a letter sits for each step away from the front. `em`. */
  liftEm: 1.2,
  /** A letter sliding to a new place in the deck. Milliseconds. */
  slide: 550,
  /** How far a drag must travel before it counts as a flick. Pixels. */
  flick: 60,
  /** Past this, the pointer that went down on a letter was dragging, not picking. */
  slop: 6,
};
