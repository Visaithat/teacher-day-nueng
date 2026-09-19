import type { Dispatch, SetStateAction } from "react";

/**
 * What the mail scene remembers about itself while the reader is away.
 *
 * Following one of the three things out of an envelope takes the whole scene
 * down with it — it is swapped for the thing that was pressed, and it unmounts.
 * Coming back used to rebuild it from nothing: the box came in again, tipped
 * again, poured the letters again over seven seconds, and set the reader down in
 * front of letter one with every seal whole. Including the envelope they had
 * just walked out of.
 *
 * So the few facts that have to outlive the scene live one level up, in
 * `stage/card-place.tsx` — which swaps every scene behind the light and is never
 * itself swapped. That is what makes this memory rather than storage: nothing is
 * saved on the way out and nothing is restored on the way in, the state simply
 * never dies.
 *
 * ABOVE THE SELECTION PAGE TOO, and not only above the letters. There are two
 * ways out of the deck and both are one press: into an envelope, or back to the
 * present. Held any lower, the second of them would forget everything, and a
 * reader who pressed the way back by mistake would pay seven seconds of pouring
 * to undo it.
 *
 * It dies on a reload, and that is the one right lifetime — a reader who asks
 * for the card again is arriving, not returning, and should get the opening.
 *
 * It also keeps the scene out of a hydration argument. Every value below starts
 * the same on the server and in the browser, and the scene is only ever built
 * after a click, so the first paint of a fresh load is still the `waiting` frame
 * the mail scene was built around. Reading a remembered value straight into a
 * `useState` down in the scene would not be: see the note at the top of
 * `use-mail-scene.ts`.
 */
export type SceneMemory = {
  /** The opening has played all the way through. Once true, it never plays again. */
  seen: boolean;
  /** Said at the end of the opening, never at the start of it. */
  markSeen: () => void;
  /** Which letter is at the front of the deck. */
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
  /** The ids of the letters whose seals have been broken. */
  opened: ReadonlySet<number>;
  setOpened: Dispatch<SetStateAction<ReadonlySet<number>>>;
};
