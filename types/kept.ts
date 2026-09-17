/**
 * Where a thing stands once it is out of the envelope, and what is written on
 * it when it gets there.
 *
 * A DIFFERENT COORDINATE SYSTEM FROM THE SCENE'S, and the difference is the
 * whole reason this file exists rather than more of the mail scene's own. On
 * the cloth
 * every distance is a tenth of the envelope, because the envelope is what sets
 * the size of everything lying on it. Here there is no envelope: a thing out of
 * one is alone on the window, and the window is the only thing left to measure
 * against. So these are viewport units, and the writing over the paper is
 * percentages of the paper.
 */


export type Stand = {
  /**
   * How wide it stands.
   *
   * Bounded twice over, and the second bound is the one that does the work: a
   * thing capped only by the window's WIDTH grows until it runs off the bottom
   * of a short window, and every one of these is wider than it is tall. So the
   * height it is allowed is written first and turned into a width through the
   * artwork's own ratio, which is why the ratios appear in these strings.
   */
  wide: string;
  /**
   * The turn that puts it straight.
   *
   * Every one of these is drawn crooked — they are pictures of objects lying on
   * a table, not diagrams — and the artwork carries the crookedness rather than
   * a transform, so the only way to level one is to turn its box back. Read off
   * the renders: the cassette's top edge falls 103px over the 766 it crosses,
   * the postcard's rises 32 over 998, and the paper is torn rather than
   * straight and has no edge to read at all. Retune against the artwork, the
   * way `FOLD_AT` and `NAME_CARD` were, and not by eye.
   *
   * The scene leaves each of them at a small `tilt` of its own, so this is also
   * what the reader watches happen on the way across.
   */
  level: number;
  /**
   * Room between the thing and whatever stands under it.
   *
   * Zero for the two that have nothing under them. For the cassette it has to
   * clear the turn as well as look right: a box turned 7.66° reaches below the
   * box it is drawn in by half of what it gained, which at the widest this one
   * is allowed is about 2.5rem. A transform does not change the box flex laid
   * out, so nothing else is going to make that room.
   */
  gap: string;
};
