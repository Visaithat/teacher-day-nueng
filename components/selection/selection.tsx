"use client";

import { useState } from "react";

import Parcel from "./parcel";
import Player from "./player";
import Vinyl from "./vinyl";
import { useEnterFocus } from "@/hooks/use-enter-focus";
import { useSong } from "@/hooks/use-song";
import { RECORD_SONG } from "@/lib/constants/selection";

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
 *
 * The song is played from here rather than from `Vinyl` or `Player` — pressing
 * the record hands off to the full player without a beat lost, and that is only
 * possible if the one `<audio>` element outlives both views.
 */
export default function Selection({ onOpenMails }: SelectionProps) {
  // The page this replaces has been taken out of the document, and the deck was
  // made inert before that, which blurred whatever was focused.
  const ref = useEnterFocus<HTMLElement>();

  const [showPlayer, setShowPlayer] = useState(false);
  const { state, played, toggle, seek, skip, setVolume, audio, fileEvents } =
    useSong(RECORD_SONG);

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

      {showPlayer ? (
        <Player
          state={state}
          played={played}
          toggle={toggle}
          seek={seek}
          skip={skip}
          setVolume={setVolume}
          onBack={() => setShowPlayer(false)}
        />
      ) : (
        <div className="selection__display">
          <Vinyl
            state={state}
            toggle={toggle}
            onOpenPlayer={() => setShowPlayer(true)}
          />
          <Parcel onOpen={onOpenMails} />
        </div>
      )}

      <audio ref={audio} src={RECORD_SONG.src} preload="none" {...fileEvents} />
    </main>
  );
}
