"use client";

import type { PointerEvent } from "react";

import type { CssVars } from "@/types/css-vars";
import { RECORD_SONG, SONG_TRANSPORT } from "@/lib/constants/song";
import { clockOf } from "@/lib/utils/song-time";
import { jitter } from "@/lib/utils/jitter";
import type { SongState } from "@/types/song";

interface PlayerProps {
  state: SongState;
  /** How far through, 0 to 1. */
  played: number;
  /** Where the needle is and how long the whole thing is, in seconds. */
  at: number;
  span: number;
  onToggle: () => void;
  /** Somewhere else entirely, as a fraction. */
  onSeek: (to: number) => void;
  volume: number;
  onVolume: (level: number) => void;
}

/**
 * The transport: what the song is called, and how far through it is.
 *
 * One pill, shaped like the cassette's, because it is the same control doing
 * the same job on the same cloth: a round button at the left and the row of
 * marks filling the rest. The two skips that used to flank the button are
 * gone - a record has no ten-second buttons - so play and pause is the whole
 * of what is pressed, and dragging the marks is the whole of what scrubs.
 *
 * The waveform is the cassette's trick at this page's size - a row of marks,
 * each as tall as a deterministic wobble makes it, darkened up to wherever the
 * needle is. It is drawn rather than measured: reading the real envelope of the
 * file would mean decoding six megabytes before the first mark could be put on
 * the screen, and what it buys is a shape nobody can check against anything.
 */
export default function Player({
  state,
  played,
  at,
  span,
  onToggle,
  onSeek,
  volume,
  onVolume,
}: PlayerProps) {
  const playing = state === "playing";
  /* Until the file has said how long it is, the clock has nothing to read. */
  const ready = span > 0;

  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    onSeek((event.clientX - box.left) / box.width);
  };

  /**
   * Three pieces, not one box.
   *
   * The pill used to hold all of this: the song's name, the buttons, the row
   * of marks and the volume. The name has gone to the top of the page and the
   * volume to the right-hand edge; what is left is the pill proper, and it
   * keeps its shape because that shape is the cassette's and the two are the
   * same control. They are a fragment rather than a wrapper because each is
   * placed against the STAGE - a wrapper round them would either have no size
   * for their percentages to resolve against or become their containing block
   * and move them, which is the same trap song.css warns about.
   *
   * They must stay inside `.song__stage` all the same: `--step` below is spent
   * against the `--appear` and `--beat` it declares.
   */
  return (
    <>
      <p className="song__name">{RECORD_SONG.title}</p>

      <div className="player" data-state={state}>
        <button
          type="button"
          className="player__play"
          onClick={onToggle}
          aria-pressed={playing}
          aria-label={playing ? "Pause the song" : "Play the song"}
        >
          <span className="player__glyph" aria-hidden="true" />
        </button>

        {/* Pointer-only, like the cassette's own scrubber: the button beside
            it is the whole of what a keyboard operates. */}
        <div
          className="player__wave"
          style={
            {
              "--played": played,
              "--breath": `${SONG_TRANSPORT.beat}ms`,
            } as CssVars
          }
          onPointerDown={scrub}
          role="img"
          aria-label={
            ready ? `${clockOf(at)} of ${clockOf(span)}` : "Loading the song"
          }
        >
          {Array.from({ length: SONG_TRANSPORT.bars }, (unused, n) => (
            <span
              key={n}
              className="player__tick"
              data-past={n / SONG_TRANSPORT.bars < played ? "" : undefined}
              /* Two wobbles at different salts, so the row has both a long swell
               and a mark-to-mark rattle rather than one regular comb. */
              style={
                {
                  "--tall": `${34 + jitter(n, 12.9898) * 22 + jitter(n, 4.1414) * 30}%`,
                  /* Negative, so the row is already alive on its first frame
                   rather than every mark rising together. */
                  "--at": `${-n * SONG_TRANSPORT.stagger}ms`,
                } as CssVars
              }
            />
          ))}
        </div>
      </div>

      {/* Upright, and the speaker under it rather than beside it. Still a real
          range input, turned by `writing-mode` rather than by a transform, so
          arrow keys, Home and End all still reach it. */}
      <div className="player__level">
        <input
          className="player__dial"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(event) => onVolume(Number(event.target.value))}
          style={{ "--level": volume } as CssVars}
          aria-label="Volume"
        />
        <Speaker />
      </div>
    </>
  );
}

function Speaker() {
  return (
    <svg className="player__speaker" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" fill="currentColor" />
      <path
        d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.4a8 8 0 0 1 0 11.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
