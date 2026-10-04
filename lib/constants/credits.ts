/**
 * The end credits: a museum the reader walks into, frame by frame, until the
 * lights go out and a thank-you is written in gold.
 *
 * Every figure here was carried over from the reference page this scene was
 * built to match, so retune them here and nowhere else.
 */

import type { CreditPerson, FrameKind, FrameStyle } from "@/types/credits";

/**
 * Who hangs on the wall, in the order the camera passes them.
 *
 * A photo that is not in `public/photos/credits/` hangs a drawn stand-in with
 * its file name on it, so dropping the file in is all a new portrait needs.
 */
export const CREDITS_PEOPLE: readonly CreditPerson[] = [
  { name: "Anida THONGVANH", role: "Musician & Designer", photo: "/photos/credits/photo1.jpg", frame: "gold", size: [40, 47] },
  { name: "Souphonesili KEOMANT", role: "Lead Writer", photo: "/photos/credits/photo2.jpg", frame: "wood", size: [28, 39] },
  { name: "Visaithat PHATHITMYXAY", role: "Lead Web Developer", photo: "/photos/credits/photo3.jpg", frame: "black", size: [34, 34] },
  { name: "Mexay PHAIPHITHOUN", role: "Writer", photo: "/photos/credits/photo4.jpg", frame: "goldthin", size: [32, 35] },
  { name: "Boy SAKONNAVATH", role: "Writer", photo: "/photos/credits/photo5.jpg", frame: "gold", size: [32, 35] },
  { name: "Seankeo XAICHALEUN", role: "Writer", photo: "/photos/credits/photo6.jpg", frame: "walnut", size: [28, 34] },
  { name: "Lalita THONGVANH", role: "Writer", photo: "/photos/credits/photo7.jpg", frame: "wood", size: [30, 35] },
  { name: "Vilaphon MADMANIVONG", role: "Writer", photo: "/photos/credits/photo8.jpg", frame: "goldthin", size: [40, 46] },
];

/** The words: over the door, on the first wall, and written at the end. */
export const CREDITS_WORDS = {
  museumName: "Credit Museum",
  wallTitle: "End Credits",
  wallSubtitle: "A gallery of students",
  /** Two lines, written one after the other. */
  message: ["Thank you teacher", "and Happy Teacher's Day"],
  hint: "Scroll to enter",
  loading: "Opening the museum…",
  skip: "Skip",
  sound: "Tap for sound",
  /** Shown in the dark only if the reader outruns the clip's download. */
  clipLoading: "Loading the clip…",
} as const;

/**
 * How long the walk is.
 *
 * `length` is the scrolled track in `vh`, so a bigger number is a slower walk.
 * `scrub` is how far the camera trails the wheel, in seconds; zero would follow
 * it exactly.
 */
export const CREDITS_SCROLL = {
  /* The walk ends in the dark now - the clip and the message after it play on
     a clock - so the track is cut to keep each frame the same scroll apart. */
  length: 1420,
  scrub: 0.6,
} as const;

/**
 * How much of the scroll each part of the visit takes, as shares of it.
 * Relative numbers: the timeline adds them up and the track is divided out.
 */
export const CREDITS_TIMING = {
  entrance: 1.6,
  pan: 0.85,
  hold: 0.45,
  lightsOff: 1.4,
  darkness: 0.5,
  /** A beat of dark at the foot of the track, before the clip is cued. */
  clipCue: 0.3,
} as const;

/**
 * The clip shown in the dark, once the walk is over. It plays on a clock, not
 * the scroll, with its own sound. Fades are in seconds.
 *
 * `darken` takes the room the rest of the way to black before it starts;
 * `fadeIn` brings the picture up; `fadeOut` takes picture and sound down
 * together, ending `tail` seconds before the file does.
 */
export const CREDITS_CLIP = {
  src: "/video/credits-clip.mp4",
  darken: 1.2,
  fadeIn: 1.5,
  fadeOut: 2,
  tail: 0,
} as const;

/**
 * The song under the walk, out of an unseen YouTube player. It plays from the
 * street to the dark and leaves as the room goes black, so the clip has the
 * sound to itself. It goes down over `CREDITS_CLIP.darken`.
 *
 * `volume` is the loudest it gets, 0 → 1; `fadeIn` is in seconds.
 */
export const CREDITS_SONG = {
  id: "IL-AxBE4nKY",
  volume: 0.8,
  fadeIn: 2,
} as const;

/**
 * The thank-you, written once the clip has gone, in seconds. Played from a
 * clock now, so these are real durations rather than shares of the scroll.
 */
export const CREDITS_FINALE = {
  /** The glow coming back up behind where the words will be. */
  glow: 1,
  pen: 0.1,
  line1: 2.4,
  line2: 2.2,
  sparkles: 1.2,
} as const;

/**
 * The room itself, in metres.
 *
 * The gallery wall stands at `wallZ`; the entrance is at the origin. The wall
 * title hangs at x = 0 and portrait i at `frameSpacing * (i + 1)`.
 */
export const CREDITS_ROOM = {
  frameSpacing: 3.8,
  wallZ: -10,
  height: 4.4,
  frameY: 2.2,
  door: { width: 2.4, height: 3.2, closed: 0.16, open: 1.55 },
  /** 0 holds the camera still, 1 is a hand-held sway, 2 a strong one. */
  cameraSway: 1,
} as const;

/**
 * The light inside.
 *
 * `room` is the general wash once through the door (outside it is
 * `outside`); `spotDim` is the soft light every frame always has, and
 * `spotFocus` the extra the one in the middle of the window gets.
 */
export const CREDITS_LIGHT = {
  outside: 0.3,
  room: 0.025,
  spotDim: 11,
  spotFocus: 38,
  exposure: 0.92,
} as const;

/** The 3D room's own colours, as the hex numbers three.js takes. */
export const CREDITS_COLORS = {
  wall: 0xf4efe6,
  gold: 0xd4af37,
  light: 0xffe4b8,
  sky: 0x1b2238,
} as const;

/** How each moulding is built. */
export const CREDITS_FRAMES: Record<FrameKind, FrameStyle> = {
  gold: { rim: 0.13, depth: 0.09, mat: 0.09, outer: "gold", lip: "goldDark" },
  wood: { rim: 0.11, depth: 0.08, mat: 0.12, outer: "darkWood", lip: "gold" },
  black: { rim: 0.045, depth: 0.05, mat: 0.17, outer: "black", lip: null },
  goldthin: { rim: 0.055, depth: 0.05, mat: 0.12, outer: "gold", lip: null },
  walnut: { rim: 0.09, depth: 0.07, mat: 0, outer: "walnut", lip: null },
};

/**
 * Where the sparkles stand around the message, as percentages of its box,
 * and how long each one's twinkle lasts.
 */
export const CREDITS_SPARKLES = (
  [
    [8, 22],
    [93, 18],
    [16, 76],
    [86, 82],
    [50, 2],
    [70, 50],
    [30, 45],
    [97, 58],
    [3, 55],
  ] as const
).map(([x, y], i) => ({ x, y, twinkleMs: Math.round((1.4 + i * 0.23) * 1000) }));

/**
 * The longest the room waits for its typefaces before lettering its plates
 * anyway, in ms. The plates are painted once, so a face that arrives late is
 * a face that never shows.
 */
export const CREDITS_FONT_WAIT_MS = 3000;

/** How long the plate's shine takes to cross it once, in seconds. */
export const CREDITS_SHINE_S = 1.3;
