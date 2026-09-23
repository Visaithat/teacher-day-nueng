"use client";

/* From the App Router's React, which is a canary and has it. `node_modules/react`
   is 19.2.8 stable and does NOT export ViewTransition. */
import { ViewTransition } from "react";

import Parcel from "./parcel";
import Vinyl from "./vinyl";
import { PAN } from "@/lib/constants/mail-transition";
import { useEnterFocus } from "@/hooks/use-enter-focus";

interface SelectionProps {
  /** Press the parcel: go and read the letters. */
  onOpenMails: () => void;
  /** Press the record: go to the song. */
  onOpenSong: () => void;
}

/**
 * The fourth page: what was inside the present.
 *
 * It mounts underneath the white and is never seen arriving, so it has no entry
 * of its own beyond the cloth settling - the light lifting is the entry. The
 * cloth itself lives in `cloth/cloth.css`, because the mail scene stands on it
 * too.
 *
 * The wrapper is what lets the camera leave this page for the record's, and it
 * costs the way into the letters nothing: that move names no transition type,
 * so `PAN` resolves to `none` and it cuts exactly as it always did.
 */
export default function Selection({
  onOpenMails,
  onOpenSong,
}: SelectionProps) {
  // The page this replaces has been taken out of the document, and the deck was
  // made inert before that, which blurred whatever was focused.
  const ref = useEnterFocus<HTMLElement>();

  return (
    <ViewTransition enter={PAN} exit={PAN} default="none">
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
          <Vinyl onOpen={onOpenSong} />
          <Parcel onOpen={onOpenMails} />
        </div>
      </main>
    </ViewTransition>
  );
}
