"use client";

/* From the App Router's React, which is a canary and has it. `node_modules/react`
   is 19.2.8 stable and does NOT export ViewTransition. */
import { ViewTransition } from "react";

import BackButton from "@/components/cloth/back-button";
import CreditsMessage from "./credits-message";
import CreditsPlain from "./credits-plain";
import type { CssVars } from "@/types/css-vars";
import { CREDITS_PEOPLE, CREDITS_SCROLL, CREDITS_WORDS } from "@/lib/constants/credits";
import { PAN } from "@/lib/constants/mail-transition";
import { useMuseum } from "@/hooks/use-museum";

interface CreditsProps {
  /** Back to the present. The camera pans down. */
  onBack: () => void;
}

/**
 * The last page: the end credits, as a museum.
 *
 * The reader stands in the street at dusk in front of an art museum. Scrolling
 * opens the doors and walks them in, along one gallery wall where every person
 * the card thanks hangs in a frame of their own under a spotlight. Past the
 * last one the lights go out one by one, the room falls dark, and a thank-you
 * is written in gold - after a clip has played in the dark, with its sound.
 *
 * One window tall, like every other page, because the camera pans between
 * pages by exactly one window. The walk scrolls INSIDE this page, on its own
 * landmark, and never moves the document.
 */
export default function Credits({ onBack }: CreditsProps) {
  const {
    view,
    ready,
    lines,
    playing,
    needsSound,
    clipWaiting,
    skip,
    unmute,
    songControl,
    scroller,
    track,
    stage,
    canvas,
    video,
    songSlot,
    fills,
    sparkles,
  } = useMuseum();
  const back = <BackButton onBack={onBack}>Back to the present</BackButton>;

  return (
    <ViewTransition enter={PAN} exit={PAN} default="none">
      <main
        className="credits"
        ref={scroller}
        tabIndex={-1}
        aria-labelledby="credits-title"
        data-playing={playing ? "" : undefined}
      >
        {/* What the room shows, for a reader who cannot see it. */}
        <div className="sr-only">
          <h1 id="credits-title">{CREDITS_WORDS.museumName}</h1>
          <ul>
            {CREDITS_PEOPLE.map((p) => (
              <li key={p.photo}>
                {p.name} – {p.role}
              </li>
            ))}
          </ul>
          <p>{CREDITS_WORDS.message.join(" ")}</p>
        </div>

        {view === "room" ? (
          <div
            className="credits__track"
            ref={track}
            style={{ "--length": `${CREDITS_SCROLL.length}vh` } as CssVars}
          >
            <div
              className="credits__stage"
              ref={stage}
              data-ready={ready ? "" : undefined}
            >
              <canvas className="credits__scene" ref={canvas} aria-hidden="true" />
              <div className="credits__night" aria-hidden="true" />
              <div className="credits__glow" aria-hidden="true" />
              {/* Shown in the dark once the walk is over. Its picture and its
                  volume are both driven from the finale, never by the reader;
                  the two presses below are the only controls it has. */}
              <video
                className="credits__clip"
                ref={video}
                playsInline
                preload="auto"
                aria-hidden="true"
              />
              {/* The song under the walk: an unseen player, parked rather than
                  one pixel square - YouTube will not reliably start a player
                  smaller than 200 by 200. */}
              <div className="credits__song" aria-hidden="true">
                <div ref={songSlot} />
              </div>
              <CreditsMessage lines={lines} fills={fills} sparkles={sparkles} />
              <p className="credits__hint" aria-hidden="true">
                {CREDITS_WORDS.hint}
                <i className="credits__hint-line" />
              </p>
              <p className="credits__loading" aria-hidden="true">
                {CREDITS_WORDS.loading}
              </p>
              {back}

              {clipWaiting ? (
                <p className="credits__waiting" role="status">
                  {CREDITS_WORDS.clipLoading}
                </p>
              ) : null}

              {playing || needsSound || songControl ? (
                <div className="credits__controls">
                  {/* The song starts on its own, so it can be stopped. Gone
                      for the finale, when the song has already left. */}
                  {songControl ? (
                    <button type="button" className="credits__pill" onClick={songControl.toggle}>
                      {songControl.muted ? CREDITS_WORDS.songOn : CREDITS_WORDS.songOff}
                    </button>
                  ) : null}
                  {needsSound ? (
                    <button type="button" className="credits__pill" onClick={unmute}>
                      {CREDITS_WORDS.sound}
                    </button>
                  ) : null}
                  {playing ? (
                    <button type="button" className="credits__pill" onClick={skip}>
                      {CREDITS_WORDS.skip}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {back}
            <CreditsPlain />
          </>
        )}
      </main>
    </ViewTransition>
  );
}
