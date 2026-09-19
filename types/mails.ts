/**
 * The shapes the mail scene is described in.
 *
 * Two coordinate systems run through these and mixing them up is the only way
 * to get lost:
 *
 *   - Where a piece of paper LIES on the envelope is a percentage of the
 *     envelope's own box, because the envelope is what sets the letter's size.
 *   - How far anything MOVES is in `em`, off the one font-size set on the deck.
 *     Every distance the design quotes was measured against a 440px envelope, so
 *     all of them are tenths of that.
 *
 * The measurements themselves live in `@/lib/constants/mail-art`.
 */

// Type-only, and so erased: `Letter` names two of the palettes by key, which
// needs the value's shape but never the value.
import type { PALETTE, SEALS } from "@/lib/constants/mail-art";

export type Layer = {
  src: string;
  /** Width / height of the artwork, so CSS can hold the box before it loads. */
  ratio: number;
  /** Percentages of the envelope's box. Width is of its width. */
  left: number;
  top: number;
  width: number;
  /** Degrees. Hand-placed paper is never square to the page — except the seal,
      which is pressed straight down and has no grain to be crooked against. */
  rotate?: number;
};

/**
 * One thing that comes out of an envelope.
 *
 * Both coordinate systems this file keeps apart meet on this type, and the split
 * is the one used everywhere else: where a thing LIES inside the envelope is a
 * percentage of the envelope, and how far it TRAVELS when the envelope opens is
 * `em`. The envelope is 31.25em tall (44 / 1.408), so the mock's rise of 82% of
 * its height is 25.6em.
 *
 * Coloured artwork, like the flowers and unlike the paper a letter is made of:
 * these go on the page as they are and take no dye.
 */
export type Content = Layer & {
  /**
   * The key everything else keys off: half of the name this thing wears on both
   * sides of the cut, and half of the mark left in the history.
   *
   * It was a segment in a URL once, and the constraint it picked up there has
   * outlived the URL — a `view-transition-name` is a custom-ident, so this may
   * not begin with a digit and may not contain a dot. See `mail-slugs.ts`.
   *
   * Written out rather than derived from the file name: the artwork can be
   * recut and renamed, and none of that should reach this.
   */
  slug: string;
  /** What it is, for a reader who cannot see it. */
  label: string;
  /** The arrow that says it can be pressed. */
  guide: Guide;
  /** Its share of the bundle's rise. The paper goes furthest, the tape least. */
  riseOf: number;
  /** How far it fans aside on the way. `em`, signed. */
  fan: number;
  /** The lean it ends at. Degrees — and written into the transform, never onto
      `rotate`, because the rise spends this element's transform and Lightning
      CSS folds the two together and drops one. */
  tilt: number;
};

/**
 * An arrow, and the words under it.
 *
 * Nothing about the three things says they are pressable — they are pictures of
 * paper, and paper is not a button. This is the whole of what says so, so it is
 * pointed at each of them by hand rather than placed by a rule: the three come
 * out of the envelope in a fan, and the free space around each one is a
 * different shape.
 */
export type Guide = {
  /** Where it sits and how big it is — percentages of the envelope's box, the
      same frame the layers and the bundle are all written in, so the arrows
      travel and scale with the letter they belong to. */
  left: number;
  top: number;
  width: number;
  /** Which way it points. Zero is straight down, the way it is drawn. */
  turn: number;
  /** What it is drawn in. On the cloth the page's red reads; on the envelope's
      own paper nothing but the paper's cream does. */
  ink: "ink" | "paper";
};

/**
 * The flower that stands over the greeting while its letter is in front.
 *
 * Given on the letter rather than picked out of a map, which is what the colours
 * do. A palette is a shared vocabulary — two letters can both be red — but a
 * flower belongs to one person and is never chosen from a set, so a lookup would
 * be a layer of indirection with nothing inside it.
 *
 * Coloured artwork, unlike the three pieces of paper a letter is made of: these go
 * on the page as they are and take no dye.
 */
export type Flower = {
  src: string;
  /** Width / height, so CSS can hold the box before the image arrives. */
  ratio: number;
};

export type Letter = {
  id: number;
  /**
   * Its half of the name a thing wears while it crosses out of this envelope,
   * and of the mark the history keeps. Not the person's name: the names here are
   * stand-ins and will be changed, and a slug that moved with them would take
   * the morph and the Back button out with it.
   */
  slug: string;
  /** The three lines on the name card. Real text, never baked into the image. */
  prefix: string;
  name: string;
  surname: string;
  colour: keyof typeof PALETTE;
  seal: keyof typeof SEALS;
  /** Theirs, and the only thing over the greeting that says whose letter is up. */
  flower: Flower;
  /**
   * What she wrote, line by line, and how she signed it.
   *
   * An array and not a paragraph. A hand-written letter's line breaks are part
   * of the drawing of it, and a box that reflows them has thrown away half of
   * what makes it look hand-written — so the breaks are chosen here and kept.
   * The page only decides how much room each line is allowed, because the
   * paper has a crease down it and the lines near the top have less.
   *
   * Nothing writes the greeting: "Dear Teacher Nueng" is already in the
   * artwork, in a brush hand no web font here is going to match. Same division
   * as the name cards — one picture for everyone, and only the lines change.
   */
  wish: readonly string[];
  signed: string;
  /**
   * Hers to play on the cassette's own page. See `_kept/tape.tsx` for what the
   * two kinds mean and how a real file replaces a link.
   */
  song: Song;
  /** Hers to send on the postcard's own page. */
  postcard: Postcard;
};

/**
 * What one person wrote on the postcard.
 *
 * Three fields because the card is printed with three places to write, and the
 * artwork is what decided that - see `POSTCARD` in `@/lib/constants/kept` for
 * where each one lands.
 *
 * Lines and not paragraphs, for the same reason {@link Letter.wish} is: a hand
 * chooses where to break, and a box that reflows them has thrown away the half
 * of it that looks hand-written. On a card with printed rules it is stricter
 * still - a reflowed line would fall between two of them.
 */
export type Postcard = {
  /** One name, onto the short rule beside `From :`. */
  from: string;
  /**
   * Onto the five printed rules under `For :`, one line each.
   *
   * At most five, and nothing checks that: a sixth would be written below the
   * last rule, on blank card, which reads as a mistake rather than as a line.
   */
  address: readonly string[];
  /** The left half of the card. An empty string is a blank line. */
  note: readonly string[];
};

/**
 * A song, and where it is coming from.
 *
 * Two kinds, because the right answer changed halfway through and will change
 * again. A `youtube` song is a video id played out of a hidden player — it
 * costs a third-party script and it can be refused by whoever uploaded it. A
 * `file` song is an audio file in `public/` and costs neither. The transport
 * on the page cannot tell the difference, which is the point: dropping an mp3
 * in and changing one field here swaps the whole mechanism under it.
 */
export type Song =
  | { kind: "youtube"; id: string; title: string; by: string }
  | { kind: "file"; src: string; title: string; by: string };
