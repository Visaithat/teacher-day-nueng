"use client";

/* From the App Router's React, which is a canary and has it. `node_modules/react`
   is 19.2.8 stable and does NOT export ViewTransition. */
import { ViewTransition, useEffect, useMemo, useRef, useState } from "react";

import BackButton from "@/components/cloth/back-button";
import Player from "./player";
import RecordDeck from "./record-deck";
import type { CssVars } from "@/types/css-vars";
import { PAN } from "@/lib/constants/mail-transition";
import {
  RECORD_SONG,
  SONG_CREDITS,
  SONG_DECK,
  SONG_ENTRY,
  SONG_LYRICS,
  SONG_QUOTE,
  SONG_TRANSPORT,
  SONG_WORDS,
} from "@/lib/constants/song";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useEnterFocus } from "@/hooks/use-enter-focus";
import { useSong } from "@/hooks/use-song";
import { useTimers } from "@/hooks/use-timers";

interface SongProps {
  /** Back to the present. The camera pans down. */
  onBack: () => void;
}

/**
 * The fifth page: the record, and everything printed around it.
 *
 * It is reached by pressing the record on the selection page, so it opens
 * already playing - the press that got here is the gesture a browser wants
 * before it will let sound start on its own.
 *
 * The page arrives in order rather than all at once: the record first, because
 * that is the thing the reader pressed and the thing they are looking for, and
 * the printed matter after it, a beat apart each. The stagger lives in one
 * constant and is spent in CSS as a delay per piece.
 */
export default function Song({ onBack }: SongProps) {
  const ref = useEnterFocus<HTMLElement>();
  const {
    state,
    played,
    at,
    span,
    toggle,
    start,
    seek,
    volume,
    setVolume,
    audio,
    fileEvents,
  } = useSong(RECORD_SONG, SONG_TRANSPORT.volume);

  /**
   * Start it when the needle comes down, and survive being told no.
   *
   * `at.going` is the moment the tonearm finishes its swing, so the first
   * sound and the stylus touching the record are the same event. Three
   * seconds of silence is the price, and it buys the only thing on this page
   * that a reader can check: the record is not heard while it is still in its
   * cover.
   *
   * The press that opened this page is the gesture a browser wants before it
   * will let sound begin on its own, and it is still good three seconds
   * later. When it is not, nothing is faked: the transport is simply showing
   * play, and the page works as it would have if the reader had arrived in
   * silence.
   *
   * `useTimers` and not a bare timeout, so a reader who presses Back
   * mid-sequence is not played at by a page that has already gone. And the
   * question about motion is asked here, at the moment it is answered, rather
   * than kept in state: with reduce on there is no swing to wait for, because
   * the deck is drawn finished.
   */
  const { after } = useTimers();

  /* Whether the opening has reached the beat where the arm comes over. The
     deck cannot tell from the song's own state: for the second between the
     record landing and the first sound nothing is playing yet. */
  const [cued, setCued] = useState(false);

  useEffect(() => {
    /* Both beats through the same clock, so there is one place that says when
       the arm comes over and when the first sound is. With motion unwelcome
       the deck is drawn finished, so both of them are now. */
    const beat = prefersReducedMotion() ? { arm: 0, going: 0 } : SONG_DECK.at;
    after(beat.arm, () => setCued(true));
    after(beat.going, () => void start());
  }, [after, start]);

  /* --- the words, keeping up ---------------------------------------------- */

  /* Flattened once: the stanzas are how the words are printed, but "which line
     is being sung" is a question about the song and the song has no stanzas.
     Each stanza keeps the index its first line has in that flat list, which is
     what the printing below counts from. */
  const stanzas = useMemo(
    () =>
      SONG_LYRICS.map((lines, n) => ({
        from: SONG_LYRICS.slice(0, n).reduce((sum, s) => sum + s.length, 0),
        lines,
      })),
    [],
  );

  /**
   * The last line the record has reached.
   *
   * A walk rather than a search, because the list is forty-odd long and this
   * runs on every animation frame - and -1 until the first line is sung, which
   * is a real state: the song opens with fourteen seconds of nothing.
   */
  const now = useMemo(() => {
    let found = -1;
    let from = 0;
    for (const stanza of SONG_LYRICS) {
      for (const line of stanza) {
        if (line.at > at) return found;
        found = from;
        from += 1;
      }
    }
    return found;
  }, [at]);

  const words = useRef<HTMLElement>(null);

  /**
   * Carry the card to the line being sung, and only ever downward.
   *
   * The whole song is printed from the start - a reader can look ahead, and
   * look back - so this is following the words rather than uncovering them. It
   * refuses to travel back up: the record can be sent back ten seconds at a
   * time and the page holding still through that is what was asked for.
   *
   * Asked live whether the reader wants motion, the way every other decision
   * about it in this card is. With reduce on the page still follows the song,
   * it just arrives rather than travelling.
   */
  useEffect(() => {
    const box = words.current;
    const line = box?.querySelector<HTMLElement>(`[data-line="${now}"]`);
    if (!box || !line) return;
    const top =
      line.offsetTop - box.clientHeight / 2 + line.offsetHeight / 2;
    if (top <= box.scrollTop) return;
    box.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [now]);

  return (
    <ViewTransition enter={PAN} exit={PAN} default="none">
      <main
        className="cloth song"
        ref={ref}
        tabIndex={-1}
        aria-labelledby="song-title"
      >
        <BackButton onBack={onBack}>Back to the present</BackButton>

        <h1 id="song-title" className="sr-only">
          {RECORD_SONG.title}, by {RECORD_SONG.by}
        </h1>

        <div
          className="song__stage"
          style={
            {
              "--appear": `${SONG_ENTRY.appear}ms`,
              "--beat": `${SONG_ENTRY.beat}ms`,
            } as CssVars
          }
        >
          <RecordDeck state={state} cued={cued} />

          <Player
            state={state}
            played={played}
            at={at}
            span={span}
            onToggle={toggle}
            onSeek={seek}
            volume={volume}
            onVolume={setVolume}
          />

          <section
            className="song__card song__lyrics"
            ref={words}
            aria-labelledby="song-lyrics-title"
          >
            <h2 className="song__heading" id="song-lyrics-title">
              Lyrics
            </h2>
            {/* The words carry their own air above and below, so the line
                being sung can be brought to the middle of the card even when it
                is the first or the last. */}
            <div className="song__words">
              {stanzas.map((stanza, n) => (
                <p className="song__stanza" key={n}>
                  {stanza.lines.map((line, m) => {
                    /* Its place in the song, not in its stanza - that is what
                       the needle is compared against and what the scroll looks
                       up. */
                    const nth = stanza.from + m;
                    return (
                      <span
                        className="song__line"
                        key={line.at}
                        data-line={nth}
                        data-now={nth === now ? "" : undefined}
                        data-sung={nth < now ? "" : undefined}
                      >
                        {line.text}
                      </span>
                    );
                  })}
                </p>
              ))}

              {/* The song trailing off, as the reference card ends. */}
              <p className="song__waiting" aria-hidden="true">
                {SONG_WORDS.waiting}
              </p>
            </div>
          </section>

          <section
            className="song__card song__credits"
            aria-label="Credits"
          >
            {SONG_CREDITS.map((credit, n) => (
              <p className="song__credit" key={n}>
                {credit.role ? (
                  <span className="song__role">{credit.role}:</span>
                ) : null}{" "}
                {credit.name}
              </p>
            ))}
          </section>

          <section
            className="song__card song__quote"
          >
            <p className="song__saying">
              {SONG_QUOTE.lines.map((line, n) => (
                <span className="song__line" key={n}>
                  {line}
                </span>
              ))}
            </p>
          </section>
        </div>

        <audio ref={audio} src={RECORD_SONG.src} preload="auto" {...fileEvents} />
      </main>
    </ViewTransition>
  );
}
