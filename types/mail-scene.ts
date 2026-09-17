/** The mail scene's opening, and what drives it. */

import type { RefObject } from "react";

/**
 * Where the opening has got to.
 *
 * `waiting` is what the server renders and what the browser's first frame agrees
 * on, so hydration has nothing to disagree about — and it is also the state the
 * reduced-motion check runs in, which is why that check can never show a frame
 * of an opening it is about to skip.
 *
 * The one exception is a scene that has already played its opening once this
 * visit, which starts on `ready`. That is not a hydration risk and cannot become
 * one: the memory saying so lives in the layout and starts false, so the only
 * render that hydrates is a render where it is still false.
 */
export type Act = "waiting" | "intro" | "ready";

export type MailScene = {
  act: Act;
  /** The letters have left the mouth of the box and may be seen. */
  poured: boolean;
  /** Abandon the opening and put everything where it ends up. */
  skip: () => void;
};

export type MailSceneOptions = {
  /** The deck. The measured mouth is written straight onto this node. */
  stageRef: RefObject<HTMLElement | null>;
  /** A zero-size mark at the box's lip, carried by all the box's transforms. */
  mouthRef: RefObject<HTMLElement | null>;
  /** A zero-size mark at the centre of the deck, where a letter comes to rest. */
  originRef: RefObject<HTMLElement | null>;
};
