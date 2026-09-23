/**
 * The selection page: what was inside the present.
 *
 * A postcard and the record leaning against it, and the box of letters waiting
 * one press away. Every `ratio` here was read off the trimmed artwork itself,
 * not eyeballed, so each image can hold its box before it has loaded.
 */

export const POSTCARD_ART = {
  src: "/art/selection/postcard.webp",
  alt: "A hand-drawn card: an alarm clock over three graduates in caps and gowns hugging in front of a red heart, reading Happy Teacher's Day",
  /** Width / height of the trimmed artwork. */
  ratio: 1,
};

export const VINYL_ART = {
  src: "/art/selection/vinyl.webp",
  alt: "A black vinyl record with a red label",
  ratio: 1,
};

/**
 * The box, and what is inside it, drawn as two files rather than one.
 *
 * They were one: the envelopes were part of the box's own artwork. They were
 * cut apart so the box can stand empty until a reader points at it — the
 * interior behind them was grown back over the hole they left, and laying the
 * letters over the box in their old place reproduces the drawing exactly.
 * Same canvas, same size, so the two stack without either being positioned.
 */
export const PARCEL_ART = {
  src: "/art/selection/parcel.webp",
  alt: "An open cardboard box, empty, with its flaps turned back",
  ratio: 1000 / 851,
};

export const PARCEL_LETTERS_ART = {
  src: "/art/selection/parcel-letters.webp",
  alt: "",
  ratio: 1000 / 851,
};

/**
 * The curled hand-drawn arrow both hints point with — the same file
 * `mailbox.ts`'s own `ARROW_ART` uses, kept as a second constant here rather
 * than imported across the domain boundary. Drawn pointing down-left; the
 * parcel's hint flips it upright in CSS rather than tracing a second path.
 */
export const HINT_ARROW_ART = {
  src: "/art/arrow.svg",
  alt: "",
  ratio: 142.5 / 175.499993,
};

/* The record's own song and how fast it turns used to live here. Both are the
   song page's business now: pressing the record opens that page rather than
   playing anything on this one. See `lib/constants/song.ts`. */

/** Every image this page needs, for preloading before it is shown. */
export const SELECTION_SOURCES: readonly string[] = [
  POSTCARD_ART.src,
  VINYL_ART.src,
  PARCEL_ART.src,
  PARCEL_LETTERS_ART.src,
  HINT_ARROW_ART.src,
];
