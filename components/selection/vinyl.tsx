"use client";

import type { CssVars } from "@/types/css-vars";
import {
  HINT_ARROW_ART,
  POSTCARD_ART,
  VINYL_ART,
} from "@/lib/constants/selection";

interface VinylProps {
  /** Press the record: go to its own page, where it is played. */
  onOpen: () => void;
}

/**
 * The postcard, the record tucked behind it, and the note asking for the song.
 *
 * A single control, and it is the cover: the record hides behind it until a
 * cursor arrives and slides out while one is there. Pressing it does not play
 * anything here - it opens the page the record has of its own, and the song
 * starts as that page arrives.
 *
 * Four siblings rather than a column. Each one is a measured place on the
 * scene's canvas, so none of them is laid out against another; they are handed
 * over in reading order — card, record, arrow, note — which is also the order
 * the keyboard meets them in and the order the note is asking for.
 *
 * The two `ratio` figures go down as variables because the art is taken out of
 * the flow here: an image that has not loaded holds no box of its own, and the
 * stylesheet needs its shape before then.
 */
export default function Vinyl({ onOpen }: VinylProps) {
  return (
    <div
      className="vinyl"
      style={
        {
          "--card-ratio": `${POSTCARD_ART.ratio}`,
          "--arrow-ratio": `${HINT_ARROW_ART.ratio}`,
        } as CssVars
      }
    >
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
        onClick={onOpen}
        aria-label="Play the song"
        aria-describedby="vinyl-hint"
      >
        {/* The record and the mark on it travel together, and the button they
            sit in stays where it is. See the note on `.vinyl__record`. */}
        <span className="vinyl__slide">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="vinyl__disc"
            src={VINYL_ART.src}
            alt=""
            draggable={false}
          />
          <span className="vinyl__glyph" aria-hidden="true" />
        </span>
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="vinyl__hint-arrow"
        src={HINT_ARROW_ART.src}
        alt={HINT_ARROW_ART.alt}
        aria-hidden="true"
        draggable={false}
      />

      {/* Two lines, broken where the card breaks them. */}
      <p className="vinyl__hint" id="vinyl-hint">
        Play this song
        <br />
        before you scroll
      </p>
    </div>
  );
}
