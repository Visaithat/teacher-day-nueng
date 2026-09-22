"use client";

import { type PointerEvent, useRef } from "react";

import BackButton from "@/components/cloth/back-button";
import type { CssVars } from "@/types/css-vars";
import type { SongState } from "@/types/song";
import { jitter } from "@/lib/utils/jitter";
import { TAPE } from "@/lib/constants/tape";
import {
  CREDITS,
  LYRICS,
  POSTCARD_ART,
  RECORD_SONG,
  VINYL_ART,
} from "@/lib/constants/selection";

interface PlayerProps {
  state: SongState;
  played: number;
  toggle: () => void;
  seek: (at: number) => void;
  skip: (seconds: number) => void;
  setVolume: (at: number) => void;
  /** Back to the postcard and the parcel. */
  onBack: () => void;
}

/**
 * How tall mark `n` stands, as a share of the row.
 *
 * Its own salt and not `kept/tape.tsx`'s `tallAt` — a page importing across a
 * folder the project keeps out of the routing tree would tie this one's shape
 * to whatever that file does or stops doing, for no reason either page needs.
 */
function tallAt(n: number) {
  return 24 + ((jitter(n, 61.3) + 1) / 2) * 76;
}

/**
 * The record, once it has come out from behind its postcard: a page of its
 * own to play it from, with a transport a hand-drawn card has never needed
 * before now.
 *
 * The song itself is `Selection`'s, not this component's — the one `<audio>`
 * element started there keeps playing across the hand-off from `Vinyl`, and
 * going back to it here would restart it instead.
 *
 * The waveform is the same drawn technique `kept/tape.tsx`'s own transport
 * uses — marks from `jitter` so the server and the browser agree on their
 * heights, staggered so the row ripples rather than pumps — reused here as a
 * pattern rather than a shared component, because the two rows are styled for
 * different ground: a cream pill there, the gingham itself here.
 */
export default function Player({
  state,
  played,
  toggle,
  seek,
  skip,
  setVolume,
  onBack,
}: PlayerProps) {
  const playing = state === "playing";
  const wave = useRef<HTMLDivElement>(null);

  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const box = wave.current?.getBoundingClientRect();
    if (!box) return;
    seek((event.clientX - box.left) / box.width);
  };

  return (
    <div className="player">
      <BackButton onBack={onBack}>Back</BackButton>

      <div className="player__media">
        <div className="player__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="player__postcard"
            src={POSTCARD_ART.src}
            alt={POSTCARD_ART.alt}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="player__disc"
            src={VINYL_ART.src}
            alt=""
            draggable={false}
          />
        </div>

        <div className="player__info">
          <p className="player__title">
            {RECORD_SONG.title}
            <span className="player__by"> | {RECORD_SONG.by}</span>
          </p>

          {/* Not a slider for the keyboard: the button beside it is the whole
              control, and a scrubber over a song nobody can see the length of
              is a convenience for a mouse rather than a way to operate this —
              same reasoning `kept/tape.tsx`'s own wave was built on. */}
          <div
            className="player__wave"
            data-state={state}
            ref={wave}
            onPointerDown={scrub}
            style={{ "--beat": `${TAPE.beat}ms` } as CssVars}
            aria-hidden="true"
          >
            {Array.from({ length: TAPE.bars }, (unused, n) => (
              <span
                key={n}
                className="player__tick"
                data-past={n / TAPE.bars < played ? "" : undefined}
                style={
                  {
                    "--tall": `${tallAt(n).toFixed(1)}%`,
                    "--at": `${-n * TAPE.stagger}ms`,
                  } as CssVars
                }
              />
            ))}
          </div>

          <div className="player__transport">
            <button
              type="button"
              className="player__skip"
              onClick={() => skip(-10)}
              aria-label="Back 10 seconds"
            >
              <svg
                className="player__skip-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 5V1L6 6l6 5V7a6 6 0 1 1 -6 6H4a8 8 0 1 0 8 -8z" />
              </svg>
              <span className="player__skip-label" aria-hidden="true">
                10
              </span>
            </button>

            <button
              type="button"
              className="player__toggle"
              onClick={toggle}
              aria-pressed={playing}
              aria-label={playing ? "Pause the song" : "Play the song"}
            >
              <span className="player__toggle-glyph" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="player__skip"
              onClick={() => skip(10)}
              aria-label="Forward 10 seconds"
            >
              <svg
                className="player__skip-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 5V1L18 6l-6 5V7a6 6 0 1 0 6 6h2a8 8 0 1 1 -8 -8z" />
              </svg>
              <span className="player__skip-label" aria-hidden="true">
                10
              </span>
            </button>
          </div>

          <div className="player__volume">
            <svg
              className="player__volume-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 9v6h4l5 5V4L8 9H4z" />
              <path d="M16.5 8.5a5 5 0 0 1 0 7" />
            </svg>
            <input
              type="range"
              className="player__range player__volume-slider"
              min={0}
              max={1}
              step={0.01}
              defaultValue={1}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      <div className="player__panels">
        <div className="player__lyrics">
          <h2 className="player__panel-title">Lyrics</h2>
          <p className="player__lyrics-body">{LYRICS}</p>
        </div>

        <div className="player__side">
          <div className="player__credits">
            <p>Artists: {CREDITS.artists}</p>
            <p>Lyrics: {CREDITS.lyrics}</p>
            <p>Mix &amp; Master: {CREDITS.mixMaster}</p>
          </div>
          <div className="player__note" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
