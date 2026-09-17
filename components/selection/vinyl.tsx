"use client";

import type { CssVars } from "@/types/css-vars";
import { useSong } from "@/hooks/use-song";
import {
  HINT_ARROW_ART,
  POSTCARD_ART,
  RECORD_SONG,
  SPIN_MS,
  VINYL_ART,
} from "@/lib/constants/selection";

/**
 * The postcard, and the record leaning against it.
 *
 * A single control: the whole disc is the button, because a record has nothing
 * printed on its own face to press — pressing the thing itself is the only
 * interaction there has ever been to learn.
 */
export default function Vinyl() {
  const { state, toggle, audio, fileEvents } = useSong(RECORD_SONG);
  const playing = state === "playing";

  return (
    <div
      className="vinyl"
      style={{ "--spin-duration": `${SPIN_MS}ms` } as CssVars}
    >
      <div className="vinyl__group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="vinyl__postcard"
          src={POSTCARD_ART.src}
          alt={POSTCARD_ART.alt}
          draggable={false}
        />

        <button
          type="button"
          className="vinyl__record"
          data-state={state}
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? "Pause the song" : "Play the song"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="vinyl__disc"
            src={VINYL_ART.src}
            alt=""
            draggable={false}
          />
          <span className="vinyl__glyph" aria-hidden="true" />
        </button>
      </div>

      <p className="vinyl__hint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="vinyl__hint-arrow"
          src={HINT_ARROW_ART.src}
          alt={HINT_ARROW_ART.alt}
          aria-hidden="true"
          draggable={false}
        />
        <span className="vinyl__hint-label">
          Play this song before you scroll
        </span>
      </p>

      <audio ref={audio} src={RECORD_SONG.src} preload="none" {...fileEvents} />
    </div>
  );
}
