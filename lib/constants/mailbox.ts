/**
 * The mailbox page: a key you drag into the lock, a flap that pops off, and a
 * present glowing inside.
 *
 * The mail box is pure vector, so the numbers below were read straight out of
 * its path data rather than measured off a render. Everything is a percentage
 * of the artwork's own box, so the lock, the flap, the present and the flowers
 * all track the illustration at any size. Retune these, not the CSS.
 */

export const MAILBOX_ART = {
  src: "/art/mailbox.svg",
  alt: "A tall red mail box",
  /** Width / height of the artwork. */
  ratio: 0.57,
};

export const KEY_ART = {
  src: "/art/key.webp",
  width: 690,
  height: 635,
};

export const ARROW_ART = {
  src: "/art/arrow.svg",
};

/** The present waiting inside, and the flowers at the box's feet. */
export const GIFT_ART = {
  src: "/art/gift.webp",
  width: 560,
  height: 590,
};

export const FLOWERS = [
  {
    src: "/art/flower-left.svg",
    className: "mailbox__flower--left",
  },
  {
    src: "/art/flower-right.webp",
    className: "mailbox__flower--right",
  },
] as const;

/**
 * The front panel of the mail box, which becomes the flap. Read from the
 * artwork: a flat #bd1622 rectangle across the box's lower half.
 */
export const DOOR = {
  left: 12.71,
  top: 43.52,
  width: 74.58,
  height: 42.19,
  colour: "#bd1622",
  /** Corner rounding, as a percentage of the flap's width. */
  radius: 4.8,
};

/** Centre of the keyhole, in the same coordinates. */
export const KEYHOLE = { x: 49.83, y: 49.57 };

/**
 * How close the key's tip must come to the keyhole to count, as a fraction of
 * the artwork's width. The box is a slim pillar, so this is a larger share of
 * it than it looks: this is a greeting card, not a dexterity test.
 */
export const HIT_RATIO = 0.26;

/**
 * The smallest that radius is ever allowed to be, in pixels.
 *
 * `HIT_RATIO` is a share of the artwork, and on a phone the artwork is small
 * enough that a quarter of its width is a smaller target than a fingertip. This
 * is the floor a thumb needs whatever the box has shrunk to. It was written
 * twice inside use-key-drag.ts, once for the pointer and once for the arrow
 * keys, which is two places for one number to be changed in.
 */
export const HIT_FLOOR = 44;

/**
 * How far an arrow key moves the key, in pixels, plain and with Shift.
 *
 * Pixels rather than a share of the box: this is a keyboard, and a keyboard is
 * on a machine with a pointer and a window that does not shrink to a phone.
 */
export const KEY_NUDGE = { step: 16, stride: 32 };

/** Where the key rests before it is picked up. */
export const KEY_REST_ROTATE = -4;

/**
 * The present. Percentages of the CAVITY it sits in (`.mailbox__interior`),
 * not of the whole box — the cavity clips the glow so the light cannot leak
 * through the box's solid front.
 */
export const GIFT = {
  left: 23,
  bottom: 10,
  width: 54,
  ratio: 0.9492,
};

/** Milliseconds, from the key seating in the lock. */
export const MAILBOX_TIMING = {
  /**
   * A key let go short of the hole runs back to where it started. Its twin is
   * the `returning` transition at the bottom of mailbox.css — the CSS moves the
   * key, this only says when it has finished.
   */
  springBack: 340,
  seat: 220,
  turn: 300,
  /** The flap leaves the moment the key finishes turning. */
  doorDelay: 60,
  door: 450,
  /** The present lights up as the flap clears the box. */
  giftDelay: 320,
  gift: 600,
};
