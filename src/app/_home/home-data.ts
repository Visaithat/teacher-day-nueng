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

/** The card everything else is laid on. Comes in from the top-right. */
export const HOME_CARD: PhotoMotion & {
  src: string;
  alt: string;
  ratio: number;
} = {
  src: "/photos/happy-teacher-day-card.webp",
  alt: "A pale blue card hand-lettered with the words Happy Teacher Day",
  /** Width / height of the card image. */
  ratio: 1.581,
  enterX: 36,
  enterY: -30,
  walk: 0.5,
};

export const HOME_PHOTOS: PhotoLayer[] = [
  {
    src: "/photos/graduation-portrait.webp",
    alt: "A graduation portrait: a young woman in a black cap and gown with a maroon and gold hood, smiling at the camera",
    x: 51.6,
    y: 52.7,
    width: 51.9,
    rotate: 0,
    z: 2,
    // Rises straight up from the bottom of the screen.
    enterX: 0,
    enterY: 44,
    walk: -1,
  },
  {
    src: "/photos/wedding-announcement.webp",
    alt: "A wedding announcement on torn notebook paper reading: Announcing the marriage of Phonesavanh Souliyaseng, Brandon, Missouri",
    x: 18.3,
    y: 57.5,
    width: 35.4,
    rotate: 0,
    z: 3,
    // In from the top-left corner.
    enterX: -30,
    enterY: -34,
    walk: 1.5,
  },
];

/** Every file the home page needs, for preloading before it is shown. */
export const HOME_SOURCES: readonly string[] = [
  HOME_CARD.src,
  ...HOME_PHOTOS.map((piece) => piece.src),
];
