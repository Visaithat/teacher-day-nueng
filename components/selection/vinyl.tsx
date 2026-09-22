"use client";

import type { CssVars } from "@/types/css-vars";
import type { SongState } from "@/types/song";
import {
  HINT_ARROW_ART,
  POSTCARD_ART,
  SLIDE_MS,
  SPIN_MS,
  VINYL_ART,
} from "@/lib/constants/selection";

interface VinylProps {
  state: SongState;
  toggle: () => void;
  /** Where a press goes once the record is already out. */
  onOpenPlayer: () => void;
}

/**
 * The postcard, and the record leaning against it.
 *
 * A single control: the whole disc is the button, because a record has nothing
 * printed on its own face to press — pressing the thing itself is the only
 * interaction there has ever been to learn.
 *
 * The first press only starts it playing here, slid out from behind the
 * postcard. It is the press after that — on a record already out and
 * turning — that hands off to the full player, so a reader gets to see the
 * record start before the page takes them anywhere.
 *
 * The song itself belongs to `Selection`, not here — the same `<audio>` has to
 * keep playing once a later press hands off to the full player, and an
 * element only keeps playing across that swap if it was never unmounted with
 * this one.
 */
export default function Vinyl({ state, toggle, onOpenPlayer }: VinylProps) {
  const press = () => {
    if (state === "idle") toggle();
    else onOpenPlayer();
  };

  return (
    <div
      className="vinyl"
      style={
        {
          "--spin-duration": `${SPIN_MS}ms`,
          "--slide-duration": `${SLIDE_MS}ms`,
        } as CssVars
      }
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
          onClick={press}
          aria-label={state === "idle" ? "Play the song" : "Open the player"}
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
    </div>
  );
}
