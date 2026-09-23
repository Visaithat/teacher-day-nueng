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
  /**
   * How far a drag must travel before it counts as a flick. `em`, like every
   * other distance in this scene.
   *
   * It was 60 raw pixels, which was 60 pixels of a 440px letter on a laptop and
   * 60 pixels of a 290px one on a phone — the same gesture asked for half again
   * as much travel on the screen with the least of it to give. 6 units is that
   * 60px at full size and the same share of the letter at every other.
   *
   * Pixels at the moment of the gesture, not a constant, because the unit is
   * clamped against the window: use-letter-deck.ts reads it off the deck, whose
   * font-size IS the unit, so a phone turned on its side is measured again for
   * free rather than remembered wrongly.
   */
  flickEm: 6,
  /**
   * Past this, the pointer that went down on a letter was dragging, not picking.
   * Pixels, and deliberately still pixels: this is the hand's own wobble and the
   * digitiser's noise floor, which are the same on every screen. It is the one
   * distance in this scene that is not a share of an envelope.
   */
  slop: 6,
};
