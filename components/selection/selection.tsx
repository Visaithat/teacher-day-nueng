"use client";

import Parcel from "./parcel";
import Vinyl from "./vinyl";
import { useEnterFocus } from "@/hooks/use-enter-focus";

interface SelectionProps {
  /** Press the parcel: go and read the letters. */
  onOpenMails: () => void;
}

/**
 * The fourth page: what was inside the present.
 *
 * It mounts underneath the white and is never seen arriving, so it has no entry
 * of its own beyond the cloth settling - the light lifting is the entry. The
 * cloth itself lives in `cloth/cloth.css`, because the mail scene stands on it
 * too.
 */
export default function Selection({ onOpenMails }: SelectionProps) {
  // The page this replaces has been taken out of the document, and the deck was
  // made inert before that, which blurred whatever was focused.
  const ref = useEnterFocus<HTMLElement>();

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
        <Parcel onOpen={onOpenMails} />
      </div>
    </main>
  );
}
