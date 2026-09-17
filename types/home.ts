/**
 * The home page: three pictures composed into one card.
 *
 * The card is the coordinate system. Every piece laid on it is placed by its
 * centre and sized by its width, both as a percentage of the card, so the
 * composition holds its shape at any screen size.
 *
 * All three layers travel, and they travel together: each starts offset toward
 * one edge of the screen and walks inward - rocking gently side to side - until
 * the composition closes up.
 *
 * Add, remove or reorder a piece here and nothing else needs to change.
 */

/** Shared by the card and everything laid on it. */
export type PhotoMotion = {
  /**
   * Where the layer starts, offset from its resting place, in vw / vh.
   * Kept deliberately small: part of every layer is on screen from the first
   * frame, so the page never opens on an empty background.
   */
  enterX: number;
  enterY: number;
  /**
   * How much the layer sways side to side on its way in, as a multiplier on
   * the shared walk keyframes. The sign picks which way it leans off first, so
   * the three are never swaying in unison. Bigger pictures want a smaller
   * number: the sway is a percentage of the layer's own width, and the point is
   * for all three to rock by roughly the same number of pixels.
   */
  walk: number;
};

export type PhotoLayer = PhotoMotion & {
  src: string;
  /** What the picture shows. Required: it is read in place of the image. */
  alt: string;
  /** Centre of the piece, as a percentage of the card. */
  x: number;
  y: number;
  /** Width, as a percentage of the card's width. */
  width: number;
  /** Resting tilt, in degrees. */
  rotate: number;
  /** Stacking order above the card. */
  z: number;
};
