/**
 * The home page's composition: the card, the three pictures laid on it, and the
 * manifest of everything that must be fetched before the page may move.
 *
 * The card is the coordinate system - see {@link PhotoLayer} for what each
 * measurement is a percentage of.
 */

import type { PhotoLayer, PhotoMotion } from "@/types/home";

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

/** How long every layer takes to drift in and settle. They all move together. */
export const SLIDE_MS = 3000;

/** From the layers starting to move to the last one coming to rest. */
export const HOME_ASSEMBLE_MS = SLIDE_MS + 120;
