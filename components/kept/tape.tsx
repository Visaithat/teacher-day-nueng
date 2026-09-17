"use client";

import { type PointerEvent, useRef } from "react";

import type { CssVars } from "@/types/css-vars";
import { jitter } from "@/lib/utils/jitter";
import { TAPE } from "@/lib/constants/tape";
import type { Song } from "@/types/mails";
import { useSong } from "@/hooks/use-song";

/**
 * How tall mark `n` stands, as a share of the row.
 *
 * From `jitter` and not `Math.random`: a waveform the server and the browser
 * disagree about is a hydration error React will say out loud, and it would
 * also mean the shape of the sound changed every time the page was opened.
 * Floored at 24%, so the quietest mark is still a mark.
 */
function tallAt(n: number) {
  return 24 + ((jitter(n, 37.9) + 1) / 2) * 76;
}

interface TapeProps {
  song: Song;
  /** The page the cassette was opened from, to go back to. */
  from: string;
}

export default function Tape({ song, from }: TapeProps) {
  const { state, played, toggle, seek, slot, audio, fileEvents } =
    useSong(song);
  const wave = useRef<HTMLDivElement>(null);

  const playing = state === "playing";
  const refused = state === "refused";
  const label = `the tape from ${from}`;

  /* Where along the row the pointer went down, as a fraction of it. A scrubber
     shaped like a waveform is still a scrubber. */
  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const box = wave.current?.getBoundingClientRect();
    if (!box) return;
    seek((event.clientX - box.left) / box.width);
  };

  return (
    <div
      className="tape"
      data-state={state}
      style={
        {
          "--played": played,
          /* The one timing this page owns, pushed into CSS the way every other
             timing in this card is, rather than written twice. */
          "--beat": `${TAPE.beat}ms`,
        } as CssVars
      }
    >
      {refused ? (
        /**
         * It would not play here. Not a dead button and not an apology — the
         * song is still the point, and this is the shortest way to it.
         */
        <a
          className="tape__away"
          href={`https://www.youtube.com/watch?v=${song.kind === "youtube" ? song.id : ""}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          Listen on YouTube
        </a>
      ) : (
        <div className="tape__bar">
          <button
            type="button"
            className="tape__play"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          >
            <span className="tape__glyph" aria-hidden="true" />
          </button>

          {/* Not a slider for the keyboard: the button beside it is the whole
              control, and a scrubber over a song nobody can see the length of
              is a convenience for a mouse rather than a way to operate this. */}
          <div
            className="tape__wave"
            ref={wave}
            onPointerDown={scrub}
            aria-hidden="true"
          >
            {Array.from({ length: TAPE.bars }, (unused, n) => (
              <span
                key={n}
                className="tape__tick"
                data-past={n / TAPE.bars < played ? "" : undefined}
                style={
                  {
                    "--tall": `${tallAt(n).toFixed(1)}%`,
                    /* Worked out here rather than as `calc(var(--n) * ...)` in
                       CSS, which would be two unregistered custom properties
                       inside a calc — the trap at the top of mails.css, where
                       the whole thing quietly computes to zero and every mark
                       breathes in unison. */
                    "--at": `${-n * TAPE.stagger}ms`,
                  } as CssVars
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Whose song it is. Quiet, in the scene's own serif, because a reader
          who likes it should be able to go and find it. */}
      <p className="tape__name">
        {song.title} <span className="tape__by">{song.by}</span>
      </p>

      {song.kind === "file" ? (
        <audio ref={audio} src={song.src} preload="none" {...fileEvents} />
      ) : (
        /* The hidden player. 200 by 200 and parked, rather than one pixel
           square: YouTube's own API is unreliable below that size, and a
           player that will not start is indistinguishable from an upload that
           refused. */
        <div className="tape__frame" aria-hidden="true">
          <div ref={slot} />
        </div>
      )}
    </div>
  );
}
