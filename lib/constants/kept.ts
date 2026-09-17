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
  /**
   * Written on, addressed, and with a photograph taped under it - so it takes
   * the smaller half of the window and the snapshot hangs off its corner.
   *
   * The only `level` here that is not a correction. This artwork is deskewed,
   * so the card arrives square and this is the lean it is *given*: a card
   * somebody put down on a table, not a diagram of one.
   */
  postcard: {
    /**
     * Bounded by the GROUP and not by the card.
     *
     * The snapshot hangs off the card's corner, so the pair are 1.314 card
     * widths across and 1.412 down (POSTCARD.group). Both bounds are that box
     * solved back into a card width - divide the room by the group, not by the
     * card - because `.cloth` clips rather than scrolls and anything that does
     * not fit is simply gone. The subtractions are the page's own padding plus
     * a little air.
     *
     * It does leave the card smaller than a mock-up without a back link would
     * suggest. That link is real and sits over the top left corner, which is
     * where this card keeps the word POSTCARD.
     */
    wide:
      "min(calc((100vw - 2.5rem) / 1.314), calc((100dvh - 8.5rem) / 1.412))",
    /**
     * The lean the card is DRAWN with, given back to it.
     *
     * The artwork was deskewed so that percentages of the box would land on the
     * printed rules, which cost it the +8.59 degrees it was drawn at. This is
     * that lean returned as a transform - the card looks exactly as it was
     * drawn, and the writing still has square coordinates to sit in.
     */
    level: 8.5,
    gap: "0rem",
  },
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

/* --- the writing on the card ---------------------------------------------- */

/**
 * The three places a postcard can be written, as percentages of the card's box.
 *
 * Three and not one, because the artwork already says where writing goes and it
 * says it in three different places: a rule beside `From :` at the top left, a
 * wide blank down the left half, and five printed address rules under `For :`
 * on the right. One block the shape of {@link WISH} would run straight through
 * the middle of the address column.
 *
 * Every number was read off the deskewed artwork rather than guessed - the card
 * is drawn square, so a percentage of this box is a percentage of the card, and
 * the address rules really do sit 5.99% apart.
 */
export const POSTCARD = {
  /** On the rule beside `From :`, which runs 17.5% to 43.5%, its ink at 27.5%. */
  from: { left: 17.6, rule: 27.5, size: 3.4 },
  /**
   * The blank left half. Stops short of 50.4%, where the address rules begin -
   * the card has no divider printed to argue the point, so the box has to keep
   * off them itself. The longer of the two notes ends around 88% down, clear of
   * the gold frame, whose inner edge is at 97%.
   */
  note: { left: 8.5, right: 49, top: 33.5, size: 3, lean: 0.45 },
  /**
   * Onto the five printed rules.
   *
   * `rule` is the first one and `step` the measured spacing, both read off the
   * artwork - so these are facts about the picture and not somewhere the words
   * were nudged until they looked right.
   */
  address: { left: 51, rule: 62.17, step: 5.99, size: 3.2 },
  /**
   * How far above its rule a line of writing starts, in the PEN's own em.
   *
   * The one number that positions writing against a printed line, and it is in
   * em on purpose.
   *
   * A line box with `line-height: 1` is SHORTER than the type in it, so the
   * baseline is not at its foot: with an ascent of A and a descent of D, half
   * the shortfall is taken off the top and the baseline lands `(1-(A+D))/2 + A`
   * below it. For Caveat that is 0.82em, which is why lifting the box by 0.82
   * puts the baseline exactly on the rule and leaves the descenders hanging
   * under it, the way handwriting on a ruled line does.
   *
   * In em rather than in percent of the card because it is a property of the
   * type and not of the picture: change the card's size or its aspect and this
   * still holds, where a percentage would quietly slide off the rules.
   *
   * IF THE WRITING SITS HIGH OR LOW ON THE RULES, THIS IS THE ONE NUMBER TO
   * TURN - the ascent above is read off the face's published metrics rather
   * than measured against a render, which is the sort of arithmetic that has
   * been wrong in this project once already (see WISH.size).
   */
  sit: 0.82,
  /**
   * The photograph, and the box it and the card stand in together.
   *
   * Every number is a share of the CARD'S WIDTH, so the pair can only scale
   * together - a photograph that grew while the card it lies on did not would
   * come off it. `x`/`y` are its top left corner measured from the card's, and
   * they are why the two are wrapped in a group at all: laid out as plain
   * siblings the photograph could only be centred and nudged, which is not
   * where it goes. It goes on the card's bottom right corner.
   *
   * `level: 0` because the snapshot is drawn square - the tilt in it is the
   * tape and the white edge, not the picture, and turning the box would turn
   * those too.
   */
  photo: { wide: 105.9, x: 25.5, y: 68, level: 0 },
  /**
   * The photograph coming out from behind the card.
   *
   * It is already stacked under the card, so this only has to put it back where
   * the card can hide it and then let it slide out to where it belongs. Where
   * that is is NOT written here - it is worked out from `photo` above, so the
   * two cannot drift apart when the photograph is moved.
   *
   * `at` is after the camera has stopped. The pan runs 140ms + 620ms = 760ms
   * (see `travel.css`), and a photograph sliding out while the room is still
   * arriving reads as the page settling rather than as a thing being pulled
   * out from under another thing. Sixty milliseconds of stillness first, and
   * then it moves.
   *
   * `scale` is what it takes to fit behind the card at all: the photograph is
   * 1.059 card-widths across and so cannot hide behind it at full size. At 0.8,
   * centred on the card, every corner is inside the card's turned quad - I
   * checked the far one, which clears by 0.003 of a card width.
   */
  reveal: {
    at: 820,
    ms: 520,
    scale: 0.8,
    /**
     * And putting it away again, before the camera goes back down.
     *
     * The reader presses the way back and nothing moves for this long while the
     * photograph tucks itself behind the card - then the room leaves with the
     * two of them together, which is how they arrived.
     *
     * Shorter than the way out. Coming out is the page introducing itself and
     * can afford to be looked at; going away is a thing being put back, and a
     * reader who has already pressed the link is waiting on it.
     */
    back: 380,
  },
  /**
   * The box the two of them occupy, again in card widths.
   *
   * Wider and taller than the card because the photograph hangs off it on two
   * sides. The card is laid at the group's top left and the turn above spills a
   * little past that, which nothing clips.
   */
  group: { wide: 131.4, tall: 141.2 },
};
