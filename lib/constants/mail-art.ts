/**
 * The mail scene: a box tips over, letters pour out onto the cloth, and each one
 * waits with its wax seal unbroken.
 *
 * A letter is three pieces of paper stacked on one another, not a drawing of an
 * envelope. Two coordinate systems run through this file and mixing them up is
 * the only way to get lost in it:
 *
 *   - Where a piece of paper LIES on the envelope is a percentage of the
 *     envelope's own box, because the envelope is what sets the letter's size.
 *   - How far anything MOVES is in `em`, off the one font-size set on the deck.
 *     Every distance the design quotes was measured against a 440px envelope, so
 *     all of them are tenths of that: 10px of prefix is 1em, 26px of name is
 *     2.6em, 580px of carousel spacing is 58em. One clamp on `--unit` in
 *     mails.css scales the whole scene, and nothing else has to know.
 *
 * Retune these, not the CSS.
 */

import type { Content, Flower, Layer } from "@/types/mails";

/* --- the paper ----------------------------------------------------------- */

/**
 * The base. It alone is in flow, and it is what every `left`/`top`/`width` below
 * is measured against.
 */
export const ENVELOPE = {
  src: "/art/letter/envelope.webp",
  ratio: 1.408,
};

/** The envelope at full size, in units of `--unit`. 440px at ten to the unit. */
export const ENVELOPE_EM = 44;

/**
 * The name card and the seal, both measured off the reference render rather than
 * guessed: at that render's 350px width the card lands on x 9-159 / y 152-246
 * against its 9-160 / 152-244, and the seal on 147-210 / 158-220 against exactly
 * the same.
 */
export const NAME_CARD: Layer = {
  src: "/art/letter/name-card.webp",
  ratio: 1.615,
  left: 2.5,
  top: 61.2,
  width: 43,
  rotate: -2,
};

export const SEAL: Layer = {
  src: "/art/letter/seal.webp",
  ratio: 1.022,
  left: 42,
  top: 55,
  width: 18,
};

/* --- the dye ------------------------------------------------------------- */

/**
 * The artwork is undyed. All three images are neutral paper texture: the envelope
 * averages (196,195,194) and the seal (211,211,210) — R, G and B within two of
 * each other. So one set of images dyes to any colour, by multiplying a flat tint
 * through the image's own alpha.
 *
 * These are not the design's colours. Multiply is linear in the paper's own
 * lightness, and the design's #B03A3A was picked against a flat #F2E9D6
 * placeholder a fifth lighter than this paper; laid on this, it comes out muddy.
 * Solving `tint = reference / paper * 255` at five points of the reference render
 * agrees on #D64137 to within a few units at every one of them, and that
 * agreement is itself the proof that multiply is the right model — a wrong model
 * would drift from point to point. Rendered and differenced against the
 * reference, #D64137 lands 7/255 out where #B03A3A lands 16/255.
 *
 * Multiply can only darken, so a tint lighter than the paper is unreachable: pink
 * clips at 255 in red, which costs it 13/255 at the seal's brightest highlight
 * and nothing anywhere else. Blue and silver have no reference render, so they
 * are the design's colours lifted by the same ratio red needed. Retune against a
 * render, never by eye.
 */
export const PALETTE = {
  red: "#D64137",
  blue: "#3684CF",
};

export const SEALS = {
  pink: "#FFA4AB",
  silver: "#E1E5EA",
};

/* --- what is inside ------------------------------------------------------ */

/**
 * Back to front, which is also the order they leave in.
 *
 * Every box lies wholly inside the envelope while the seal is whole, and every
 * one of them still has its foot inside the pocket once risen — those two facts
 * are what make the bundle look like it came out of something rather than like
 * three pictures that faded in. Retune these, not the CSS.
 */
/**
 * The arrow itself: one drawing, used by all three and inked by each.
 *
 * A flat white silhouette, so it is carried as a MASK rather than as a picture —
 * the colour comes from whatever the arrow is drawn on, and one file covers red
 * ink on the cloth and cream on the envelope's own paper.
 */
export const ARROW = {
  src: "/art/letter/arrow.webp",
  /** 23 by 44, as drawn. */
  ratio: 23 / 44,
  /**
   * Where the thin end of it starts, as a fraction of the drawing's own box.
   * Read off the artwork's alpha rather than guessed, because the words go here
   * and the arrow turns: at 72 degrees the tail is nowhere near the top of the
   * box it is drawn in.
   */
  tail: { x: 0.065, y: 0.086 },
};

export const CONTENTS: Content[] = [
  {
    src: "/art/letter/note.webp",
    slug: "letter",
    guide: { left: 103, top: -48, width: 7, turn: 50, ink: "ink" },
    label: "handwritten letter",
    ratio: 0.82,
    left: 12,
    top: 0,
    width: 85,
    riseOf: 0.99,
    fan: -0.3,
    tilt: -3,
  },
  {
    src: "/art/letter/postcard.webp",
    slug: "postcard",
    guide: { left: -12, top: -13, width: 7, turn: -72, ink: "ink" },
    label: "postcard",
    ratio: 1.506,
    left: 2,
    top: 35,
    width: 65,
    riseOf: 1.04,
    fan: -0.2,
    tilt: -1,
  },
  {
    src: "/art/letter/cassette.webp",
    slug: "cassette",
    guide: { left: 63, top: 44, width: 6.5, turn: 178, ink: "paper" },
    label: "cassette tape",
    ratio: 1.455,
    left: 45,
    top: 50,
    width: 55,
    riseOf: 0.95,
    fan: -2.2,
    tilt: 2,
  },
];

/**
 * The same envelope, opened: its back with the flap standing, and its front
 * pocket. Two pieces of one drawing, and the front's 1.409 is the closed
 * envelope's 1.408 — the same face, so it drops into the same box and the name
 * card and the wax do not move a pixel when one replaces the other.
 *
 * Neutral paper like the closed one, so both take the letter's dye.
 *
 * The back's numbers are percentages of the FRONT's box, read straight out of
 * the artwork's own transforms rather than measured off a render.
 */
export const OPEN_BACK: Layer = {
  src: "/art/letter/open-back.webp",
  ratio: 0.815,
  left: 0.74,
  top: -75.84,
  width: 98.6,
};

export const OPEN_FRONT = {
  src: "/art/letter/open-front.webp",
  ratio: 1.409,
};


/** The fold the envelope is already printed with, as a share of its height.
    Found by scoring candidate creases along their length rather than by taking
    the strongest edge per row, which the paper's own texture wins: the score
    peaks cleanly at 76.8% and falls away either side. The flap is cut a shade
    proud of it, which costs nothing — every pixel it claims is one the front of
    the envelope is drawing anyway. */
export const FOLD_AT = 78;

/* --- the flowers --------------------------------------------------------- */

/**
 * The two are differently proportioned — the rose is taller than it is wide, the
 * sunflower wider than it is tall — so the greeting sizes them by HEIGHT. Match
 * their widths instead and the sunflower reads as the smaller flower.
 */
export const ROSE: Flower = { src: "/art/letter/flower-rose.webp", ratio: 0.968 };

export const SUNFLOWER: Flower = {
  src: "/art/letter/flower-sunflower.webp",
  ratio: 1.117,
};
