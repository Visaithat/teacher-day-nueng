"use client";

import type { CssVars } from "@/types/css-vars";
import { POSTCARD_ART, VINYL_ART } from "@/lib/constants/selection";
import {
  SONG_ART,
  SONG_DECK,
  SONG_PULL,
  SONG_RINGS,
  SONG_SLEEVE,
  SPIN_MS,
} from "@/lib/constants/song";
import type { SongState } from "@/types/song";

interface RecordDeckProps {
  /** What the transport says is happening, so the turn and the rings agree with it. */
  state: SongState;
  /**
   * Whether the opening has got as far as putting the arm down.
   *
   * It cannot be worked out from `state` alone: for the second between the
   * record landing and the first sound, nothing is playing and the arm should
   * already be on its way over. After that the two agree, and pausing lifts it.
   */
  cued: boolean;
}

/**
 * The turntable, and the record arriving on it.
 *
 * The page opens with the deck already standing and its arm parked. The sleeve
 * comes in from the left, the record slides out of it, lifts onto the platter,
 * the sleeve settles underneath, and only then does the arm swing over and the
 * record begin to turn.
 *
 * The deck and the arm are two pictures on one canvas - the arm was cut out of
 * the deck's own artwork, and both kept the full 1024 square it was drawn in, so
 * they line up with nothing but `inset: 0` and no arithmetic to get wrong.
 *
 * Nothing here is a control. The transport beside it is what is pressed; a
 * record you can click is a nice idea exactly once, and then it is a second play
 * button where nobody looks for one.
 */
export default function RecordDeck({ state, cued }: RecordDeckProps) {
  const { at, run, play, lean } = SONG_DECK;

  /* Down on the record, or parked. A song that has been stopped - by the
     reader or by running out - lifts the arm; one that never started because
     the browser refused it never puts the arm down in the first place. */
  const down = cued && state !== "paused" && state !== "refused";

  return (
    <div
      className="record-deck"
      data-state={state}
      data-arm={down ? "down" : undefined}
      style={
        {
          "--sleeve-at": `${at.sleeveIn}ms`,
          "--sleeve-run": `${run.sleeve}ms`,
          /* The cover moves twice across one timeline that runs to the moment
             the needle lands - see the keyframes in record-deck.css. */
          "--cover-run": `${at.going}ms`,
          "--record-at": `${at.recordOut}ms`,
          "--record-run": `${run.record}ms`,
          "--arm-at": `${at.arm}ms`,
          "--arm-run": `${run.arm}ms`,
          "--pivot-x": `${SONG_ART.pivotX}%`,
          "--pivot-y": `${SONG_ART.pivotY}%`,
          "--play": `${play}deg`,
          /* The record's box on the deck. Across is of the artwork's width and
             down is of its height - see SONG_ART. */
          "--disc-left": `${SONG_ART.discLeft}%`,
          "--disc-top": `${SONG_ART.discTop}%`,
          "--disc-size": `${SONG_ART.discSize}%`,
          /* The sleeve's box, on the same square, and how far it lies over. */
          "--sleeve-left": `${SONG_SLEEVE.left}%`,
          "--sleeve-top": `${SONG_SLEEVE.top}%`,
          "--sleeve-size": `${SONG_SLEEVE.size}%`,
          "--lean": `${lean.rest}deg`,
          "--lean-in": `${lean.in}deg`,
          "--lean-set": `${lean.set}deg`,
          "--tuck-x": `${SONG_SLEEVE.tuckX}%`,
          "--tuck-y": `${SONG_SLEEVE.tuckY}%`,
          /* Where the record starts, inside the cover, and the cover's own
             edge at each end of the journey - what uncovers it. */
          "--pull-x": `${SONG_PULL.x}%`,
          "--pull-y": `${SONG_PULL.y}%`,
          "--mouth-from": `polygon(${SONG_PULL.mouthFrom})`,
          "--mouth-to": `polygon(${SONG_PULL.mouthTo})`,
          "--spin-duration": `${SPIN_MS}ms`,
          "--ring-period": `${SONG_RINGS.period}ms`,
          "--card-ratio": `${POSTCARD_ART.ratio}`,
        } as CssVars
      }
    >
      <span className="record-deck__body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="record-deck__base"
          src="/art/song/deck.webp"
          alt="A wooden turntable"
          draggable={false}
        />

        {/* Behind the disc, so they read as leaving it rather than sitting on
            it. Same measurements and same keyframes as the record page's own
            rings - only what starts them has moved. */}
        <span className="record-deck__rings" aria-hidden="true">
          {Array.from({ length: SONG_RINGS.count }, (unused, n) => (
            <span
              key={n}
              className="record-deck__ring"
              style={
                {
                  "--at": `${(n * SONG_RINGS.period) / SONG_RINGS.count}ms`,
                } as CssVars
              }
            />
          ))}
        </span>

        {/* Two elements for two jobs: the box travels from the sleeve onto the
            platter, and the picture inside it turns. One element doing both
            would make the landing and the spin share `animation-play-state`,
            and pausing the song would stop the record in mid-flight. */}
        <span className="record-deck__disc">
          {/* The record and its label are one picture, so they cannot come
              apart while it turns. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="record-deck__record"
            src={VINYL_ART.src}
            alt=""
            draggable={false}
          />
        </span>

        {/* The arm, on the deck's own canvas and already parked, so turning
            it by `--play` about the hinge is the whole of putting it down. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="record-deck__arm"
          src="/art/song/deck-arm.webp"
          alt=""
          draggable={false}
        />

        {/* Inside the deck's square, and last, so source order reads in paint
            order: the sleeve is in front of everything, including the record
            once it has landed, which is where a cover you have just put down
            actually is. It has to be on this square rather than on the stage
            so that its middle and the platter's can be subtracted from one
            another - that difference is the whole of the record's journey. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="record-deck__sleeve"
          src={POSTCARD_ART.src}
          alt={POSTCARD_ART.alt}
          draggable={false}
        />
      </span>
    </div>
  );
}
