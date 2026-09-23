/** A song on the cassette's page, and the transport that plays it. */

/**
 * Playing whatever the cassette has on it.
 *
 * ONE SHAPE FOR TWO MECHANISMS. A song is either a file in `public/`, which is
 * an `<audio>` element and nothing else, or a YouTube video, which is a hidden
 * player and a third-party script. The transport above cannot tell which it
 * got, and that is deliberate: the two links were a stopgap — for now, was how
 * it was put — and the day a real recording turns up, one field in
 * `@/types/mails` changes and nothing here or above it does.
 *
 * WHAT THE BARS CANNOT BE. A real waveform needs the samples, and for a YouTube
 * song the samples are inside a cross-origin iframe that Web Audio cannot
 * reach. So the row is not a picture of this song's sound — it is a settled
 * profile, drawn from `jitter` so the server and the browser agree on it, and
 * used as a scrubber. That is also what the mock actually shows. The part of it
 * that is true is where the needle has got to.
 */
export type SongState =
  | "idle"
  | "waking"
  | "playing"
  | "paused"
  /** The upload will not play here. See `onError` below. */
  | "refused";
