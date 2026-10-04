/** The end credits: a small museum of the people the card thanks. */

/** The five mouldings a portrait can hang in. */
export type FrameKind = "gold" | "wood" | "black" | "goldthin" | "walnut";

/** One portrait on the gallery wall, and the gold plate under it. */
export type CreditPerson = {
  /** The big line on the plate. */
  name: string;
  /** The small capitals under it. */
  role: string;
  /** From `public/`. A file that is not there hangs a drawn stand-in instead. */
  photo: string;
  frame: FrameKind;
  /** Width and height of the frame, where 20 is one metre of wall. */
  size: readonly [number, number];
};

/** How a frame is built: the moulding, its depth, the paper inside it. */
export type FrameStyle = {
  /** How wide the moulding is, in metres. */
  rim: number;
  depth: number;
  mat: number;
  outer: "gold" | "darkWood" | "black" | "walnut";
  lip: "gold" | "goldDark" | null;
};

/**
 * Where the scroll has carried the visit, as numbers the frame loop reads.
 *
 * The timeline writes these and nothing else does; the room and the overlay
 * both draw from them on every frame, so the two can never disagree.
 */
export type MuseumState = {
  /** 0 closed → 1 open. */
  door: number;
  /** 0 outside → 1 inside, in front of the wall title. */
  enter: number;
  /** -1 the wall title, 0 the first frame, 1 the second… */
  cam: number;
  lightsOff: number;
  night: number;
  glow: number;
  /** The "scroll to enter" hint, 1 shown → 0 gone. */
  hint: number;
  /** The song under the walk, 0 silent → 1 at its full volume. */
  song: number;
  /** The clip in the dark, 0 hidden → 1 fully up. Its volume follows it. */
  clip: number;
  /**
   * The finale's own dark, laid over the scroll's: 1 is full black with the
   * glow gone. Kept apart from `night` and `glow` so a scroll refresh mid-clip
   * cannot bring the room's glow back over the picture.
   */
  blackout: number;
  /** The glowing nib that writes the message. */
  pen: number;
  /** How far each handwritten line has been written, 0 → 1. */
  line1: number;
  line2: number;
  /** The gold fill that settles into each line once its ink is down. */
  fill1: number;
  fill2: number;
  /** One per sparkle around the message, 0 → 1 with overshoot. Objects, so
      the timeline can tween them as a staggered list of targets. */
  sparkles: { p: number }[];
};

/** Where a written line starts and ends, in the message's own units. */
export type MessageLine = { x0: number; x1: number; y: number };

/** The two faces the canvas textures are lettered in, as `font` families. */
export type MuseumFonts = { serif: string; script: string };

/** The room, once built: drawn each frame, fitted to the window, put away. */
export type MuseumRoom = {
  draw: (state: MuseumState) => void;
  fit: (width: number, height: number) => void;
  dispose: () => void;
};
