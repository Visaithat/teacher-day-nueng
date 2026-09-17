"use client";

import { useEffect, useRef } from "react";

import Parcel from "./parcel";
import Vinyl from "./vinyl";

/**
 * The fourth page: what was inside the present.
 *
 * It mounts underneath the white and is never seen arriving, so it has no entry
 * of its own beyond the cloth settling — the light lifting is the entry. The
 * cloth itself lives in `_cloth/cloth.css`, because /mails stands on it too.
 */
export default function Selection() {
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
      className="cloth"
      ref={ref}
      tabIndex={-1}
      aria-labelledby="selection-title"
    >
      <h1 id="selection-title" className="sr-only">
        Your present
      </h1>

      <div className="selection__display">
        <Vinyl />
        <Parcel />
      </div>
    </main>
  );
}
