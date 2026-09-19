"use client";

import { useEffect, useRef } from "react";

/**
 * Moves the reading position onto a scene that has just been swapped in.
 *
 * The card is one page now, so nothing moves focus when one scene replaces
 * another - and the button the reader pressed goes out of the document with the
 * scene it belonged to, which drops focus on the body with nothing announced.
 * A screen reader would never learn that the card had moved on.
 *
 * Put the ref on the landmark that carries the scene's accessible name, not on
 * the first thing inside it: what should be read out is where the reader has
 * arrived, not the way back out of it.
 *
 * preventScroll, because these landmarks fill the window and the deck inside one
 * of them is deliberately wider than it - focusing without it drags the scene
 * sideways. The container also wants no focus ring; `.cloth` and `.cloth__page`
 * turn theirs off in cloth.css, and `.mails` in mails.css.
 */
export function useEnterFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return ref;
}
