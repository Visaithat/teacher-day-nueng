/** Where the reader is standing in the second half of the card. */

import type { Content, Letter } from "@/types/mails";

/**
 * The four places that used to be three URLs.
 *
 * `selection` is what the light opens onto and the entry to the others. The
 * kept place carries the whole letter and the whole thing out of it rather than
 * their slugs: this is state in a live tree, and the lookup has already been
 * done by whoever pressed the paper. Only the history mark is written in slugs,
 * because only the history mark has to survive being structured-cloned.
 */
export type Place =
  | { at: "selection" }
  | { at: "song" }
  | { at: "mails" }
  | { at: "kept"; letter: Letter; content: Content };

export type CardPlace = {
  place: Place;
  /** Into the letters. No camera move: the way in never had one. */
  toMails: () => void;
  /** To the record's own page. The camera pans up, as it does into an envelope. */
  toSong: () => void;
  /** Back from the record. The same pan, the other way up. */
  fromSong: () => void;
  /** Back out of the letters, to the present. No camera move either - the way
      out of a place is the way in, reversed, and this one was never a move. */
  toPresent: () => void;
  /** Follow one of the three things out of its envelope. The camera pans up. */
  openKept: (letter: Letter, content: Content) => void;
  /** Back to the letters. The same pan, the other way up. */
  toLetters: () => void;
};

/**
 * A place, written small enough to leave in the history.
 *
 * `history.state` is structured-cloned and it outlives a reload, so what goes
 * in it has to be plain data the card can check on the way back rather than a
 * letter it once held. Slugs, and nothing that cannot survive being read by a
 * card that has never built the thing it names.
 */
export type Mark =
  | { at: "selection" }
  | { at: "song" }
  | { at: "mails" }
  | { at: "kept"; person: string; item: string };
