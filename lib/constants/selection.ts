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

export const PARCEL_ART = {
  src: "/art/selection/parcel.webp",
  alt: "An open cardboard box with a striped airmail envelope standing inside it",
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

/** Every image this page needs, for preloading before it is shown. */
export const SELECTION_SOURCES: readonly string[] = [
  POSTCARD_ART.src,
  VINYL_ART.src,
  PARCEL_ART.src,
  HINT_ARROW_ART.src,
];

/**
 * Hers to play here, off the record.
 *
 * A placeholder until a real file is dropped into `public/audio/` — swap `src`,
 * `title` and `by` together, the same way a letter's own `song` does in
 * `mail-letters.ts`.
 */
export const RECORD_SONG = {
  kind: "file",
  src: "/audio/selection-song.mp3",
  title: "TODO: song title",
  by: "TODO: artist",
} as const;

/** How long one full turn of the record takes while it is playing. */
export const SPIN_MS = 2600;

/** How long the record's slide-out takes, as `vinyl.css`'s own `--slide-duration`. */
export const SLIDE_MS = 700;

/** What is printed under the Lyrics heading on the full player. */
export const LYRICS = `TODO: paste the lyrics here`;

/** Who made it, printed on the full player beside the lyrics. */
export const CREDITS = {
  artists: "TODO: artist credits",
  lyrics: "TODO: lyrics credit",
  mixMaster: "TODO: mix & master credit",
} as const;
