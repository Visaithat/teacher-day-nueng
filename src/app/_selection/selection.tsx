"use client";

import { useEffect, useRef } from "react";

/**
 * The fourth page: what was inside the present.
 *
 * It mounts underneath the white and is never seen arriving, so it has no entry
 * of its own beyond the cloth settling — the light lifting is the entry.
 */
export function Selection() {
  const ref = useRef<HTMLElement>(null);

  // The page this replaces has been taken out of the document, and the deck was
  // made inert before that, which blurred whatever was focused. Without this the
  // reading position falls back to the top of the body with nothing said, and a
  // screen reader never learns that the card has moved on. preventScroll,
  // because focusing a container would otherwise scroll to it.
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main
      className="selection"
      ref={ref}
      tabIndex={-1}
      aria-labelledby="selection-title"
    >
      {/* Nothing is here yet, which is exactly why it needs a name: a landmark
          with no heading is a room with no sign on the door. Swap this for the
          real heading the moment there is one. */}
      <h1 id="selection-title" className="sr-only">
        Your present
      </h1>
    </main>
  );
}
