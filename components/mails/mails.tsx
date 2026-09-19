"use client";

/* From the App Router's React, which is a canary and has it. */
import { useRef, ViewTransition } from "react";

import BackButton from "@/components/cloth/back-button";
import CardboardBox from "./cardboard-box";
import Letter from "./letter";
import type { CssVars } from "@/types/css-vars";
import { useEnterFocus } from "@/hooks/use-enter-focus";
import { useLetterDeck } from "@/hooks/use-letter-deck";
import { useMailScene } from "@/hooks/use-mail-scene";
import { PAN } from "@/lib/constants/mail-transition";
import type { Content, Letter as LetterData } from "@/types/mails";
import { ARROW, FOLD_AT } from "@/lib/constants/mail-art";
import { DECK } from "@/lib/constants/mail-deck";
import { LETTERS } from "@/lib/constants/mail-letters";
import {
  GUIDE_TIMING,
  LEAVE_TIMING,
  MAIL_TIMING,
  OPEN_TIMING,
  SEAL_MS,
  SEAL_TIMING,
} from "@/lib/constants/mail-timing";

interface MailsProps {
  /** A seal has finished breaking. Nothing listens yet. */
  onOpenLetter?: (id: number) => void;
  /** One of the three things has been followed out of its envelope. */
  onOpenKept: (letter: LetterData, content: Content) => void;
  /** Out of the letters altogether, back to the present they came in. */
  onBack: () => void;
}

/**
 * The mail scene.
 *
 * A box comes in from the left, tips onto its corner, empties a deck of letters
 * onto the cloth, stands up and leaves. The whole of that is one timeline and it
 * lives in mails.css — every part of it is an animation with a delay counted off
 * the same zero, so the order can be read in one place rather than reconstructed
 * from a chain of callbacks.
 *
 * Two attributes drive it. `data-act` starts the box and ends at the moment the
 * scene answers the pointer; `data-poured` starts the letters, and is a second
 * attribute rather than a phase of the first because the letters cannot be told
 * where to fall from until the box's mouth has been measured, and that can only
 * happen once the box is actually there.
 */
export default function Mails({
  onOpenLetter,
  onOpenKept,
  onBack,
}: MailsProps) {
  /* The landmark, not the deck inside it: what a reader arriving should be told
     is where they are, and the name is on this. The scene keeps its own
     `tabIndex` for a different job - catching focus when the deck moves under
     the keyboard and the letter it lands on has no seal left to take it. */
  const pageRef = useEnterFocus<HTMLElement>();
  const stageRef = useRef<HTMLElement>(null);
  const mouthRef = useRef<HTMLSpanElement>(null);
  const originRef = useRef<HTMLSpanElement>(null);

  const { act, poured, skip } = useMailScene({
    stageRef,
    mouthRef,
    originRef,
  });

  const live = act === "ready";
  const {
    active,
    opened,
    settled,
    announcement,
    leaving,
    pick,
    open,
    follow,
    deckHandlers,
  } = useLetterDeck({
    letters: LETTERS,
    stageRef,
    live,
    onOpenLetter,
    onOpenKept,
  });

  // Whose letter is up. The flower over the greeting is the only thing on the
  // page that says so.
  const front = LETTERS[active];

  // The letter in FRONT has been read — not `opened.size > 0`. The greeting is an
  // invitation and the hint an instruction, and both are still true of a letter
  // still sealed, so this follows the front of the deck rather than latching on
  // the first seal anybody breaks.
  const read = front ? opened.has(front.id) : false;

  // And whether it was already read when the reader came back, in which case the
  // greeting has nothing to take its leave of: it was answered on a page that is
  // gone, and this one should simply open without it.
  const kept = front ? settled.has(front.id) : false;

  return (
    /* The scene's half of the cut, and the landmark it stands in — both lifted
       out of the route file this scene used to be served from. Pressing one of
       the things inside an envelope pans the camera up, and this is what travels
       down out from under it.

       The pan goes here and never on the cloth outside: the cloth is held across
       the cut on purpose, and a wrapper that is kept never fires enter or exit. */
    <ViewTransition enter={PAN} exit={PAN} default="none">
      <main
        className="cloth__page"
        ref={pageRef}
        tabIndex={-1}
        aria-labelledby="mails-title"
      >
        {/* First in the landmark, so a reader on the keyboard meets the way out
            before the thing they might want out of - the same order the Skip
            below is placed in, and for the same reason. Above the scene without
            being inside it: `.mails` is z-index 1 and this is 5, and both are
            positioned against this same box. */}
        <BackButton onBack={onBack}>Back to the present</BackButton>

        <section
          className="mails"
          ref={stageRef}
          data-act={act}
          data-poured={poured || undefined}
          /* `data-read`, not `data-open`: that one already means something on a
             letter, and the same name at two levels of one subtree reads fine right
             up until somebody refactors it.
             Two values rather than one, because the greeting leaves differently
             depending on when the seal broke: `now` fades it out, `kept` means it
             was already gone before this page existed and there is nothing to fade. */
          data-read={read ? (kept ? "kept" : "now") : undefined}
          /* Focusable, but only ever on purpose: when the keyboard moves the deck and
             the letter it lands on has no seal left to take focus, this catches it
             instead of letting it fall to the body. */
          tabIndex={-1}
          style={
            {
              "--active": active,
              "--spacing": `min(${DECK.spacingEm}em, 42vw)`,
              "--lift": `${DECK.liftEm}em`,
              "--slide-ms": `${DECK.slide}ms`,
              "--fall-ms": `${MAIL_TIMING.fallFor}ms`,
              "--bounce-ms": `${MAIL_TIMING.bounceFor}ms`,
              "--pour-gap": `${MAIL_TIMING.pourGap}ms`,
              "--layer-lag": `${MAIL_TIMING.layerLag}ms`,
              "--grow-at": `${MAIL_TIMING.grow - MAIL_TIMING.pour}ms`,
              "--grow-ms": `${MAIL_TIMING.growFor}ms`,
              "--grow-gap": `${MAIL_TIMING.growGap}ms`,
              "--box-in": `${MAIL_TIMING.boxIn}ms`,
              "--box-in-ms": `${MAIL_TIMING.boxInFor}ms`,
              "--tip-at": `${MAIL_TIMING.tip}ms`,
              "--tip-ms": `${MAIL_TIMING.tipFor}ms`,
              "--box-out": `${MAIL_TIMING.boxOut}ms`,
              "--box-out-ms": `${MAIL_TIMING.boxOutFor}ms`,
              "--flower-at": `${MAIL_TIMING.flower}ms`,
              "--title-at": `${MAIL_TIMING.title}ms`,
              "--hint-at": `${MAIL_TIMING.hint}ms`,
              "--dress-ms": `${MAIL_TIMING.dressFor}ms`,
              // Breaking a seal. The stylesheet counts the crack and the split off
              // these, so the moment the deck hands `onOpenLetter` on cannot drift
              // away from the moment the wax has finished going.
              "--press-ms": `${SEAL_TIMING.press}ms`,
              "--crack-ms": `${SEAL_TIMING.crack}ms`,
              "--split-ms": `${SEAL_TIMING.split}ms`,
              "--seal-ms": `${SEAL_MS}ms`,
              // The envelope opening, counted off the same click as the wax.
              "--fold": FOLD_AT,
              "--flap-at": `${OPEN_TIMING.flapAt}ms`,
              "--flap-ms": `${OPEN_TIMING.flapFor}ms`,
              "--rise-at": `${OPEN_TIMING.riseAt}ms`,
              "--rise-ms": `${OPEN_TIMING.riseFor}ms`,
              "--rise-gap": `${OPEN_TIMING.riseGap}ms`,
              "--dress-out-at": `${OPEN_TIMING.dressOutAt}ms`,
              "--dress-out-ms": `${OPEN_TIMING.dressOutFor}ms`,
              // And the arrows that come after all of it.
              "--guide-at": `${GUIDE_TIMING.at}ms`,
              "--guide-ms": `${GUIDE_TIMING.lasts}ms`,
              // And leaving, which is the only beat of the two that has a clock
              // here at all — the camera's is the browser's, in travel.css.
              "--leave-ms": `${LEAVE_TIMING.lift}ms`,
              "--leave-by": `${LEAVE_TIMING.liftEm}em`,
              "--leave-clear": `${LEAVE_TIMING.clearEm}em`,
              "--recede-ms": `${LEAVE_TIMING.recede}ms`,
              "--arrow-src": `url("${ARROW.src}")`,
              "--arrow-ratio": ARROW.ratio,
            } as CssVars
          }
        >
          {/* First in the section, so a reader on the keyboard meets the way out
              before they meet the thing they might want out of.
              `hidden` once the opening is over rather than unmounted: a reader who
              tabbed here and then waited would have had the focused node pulled out
              from under them, and focus would have landed on the body. Hidden, it
              leaves the tab order and the accessibility tree just the same, and the
              browser moves focus on rather than dropping it.
              While the opening and only while it: there is nothing to skip before it
              starts, and on a scene that has already played it once there is nothing
              to skip at all. */}
          <button
            type="button"
            className="mails__skip"
            onClick={skip}
            hidden={act !== "intro"}
          >
            Skip
          </button>

          <div className="mails__stage">
            {/* The box is only ever in the way after it has gone: 60 polygons and a
                turbulence filter, dropped the moment the scene is done with them. */}
            {live ? null : <CardboardBox mouthRef={mouthRef} />}

            {/* Where a letter at the front of the deck comes to rest. Measured
                against the mouth to work out how far the letters have to fall. */}
            <span ref={originRef} className="mails__origin" />

            {/* The greeting, pinned to the top edge of where the front letter
                comes to rest rather than to the top of the window. In the stage and
                absolute for the same reason the hint below it is: laid out in the
                column instead, it is the STAGE that takes up the slack, so the
                greeting and the paper it is greeting drift apart on a tall window
                and there is no distance to set between them. */}
            <div className="mails__dress">
              {/* The flower belongs to whoever is in front. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                /* Keyed, so swapping letters remounts it and the fade runs again
                   rather than the picture changing under the reader mid-blink. */
                key={front?.id}
                className="mails__flower"
                src={front?.flower.src}
                style={{ "--flower-ratio": front?.flower.ratio } as CssVars}
                alt=""
                aria-hidden="true"
                draggable={false}
                decoding="async"
              />
              {/* In the document from the first render, faded rather than absent: an
                  opacity does not take an element out of the accessibility tree, so
                  the landmark this names is never briefly nameless. */}
              <h1 id="mails-title" className="mails__title">
                You got a mail!
              </h1>
            </div>

            {/* The drag is on the list rather than on each letter: it is a gesture
                across the deck, not on any one letter in it. */}
            <ul className="mails__letters" aria-label="Your letters" {...deckHandlers}>
              {LETTERS.map((letter, index) => (
                <Letter
                  key={letter.id}
                  letter={letter}
                  index={index}
                  front={index === active}
                  open={opened.has(letter.id)}
                  settled={settled.has(letter.id)}
                  /* Only the letter in front can be leaving. Scoped here rather
                     than in the hook because the hook holds one slug for the whole
                     deck, and a letter behind should not read it as its own. */
                  leaving={index === active ? leaving : null}
                  onPick={() => pick(index)}
                  onOpen={() => open(index)}
                  onFollow={(item) => follow(letter, item)}
                />
              ))}
            </ul>

            {/* Under the envelope, not over it: the greeting above says what has
                arrived and this says what to do about it, which is an instruction
                and belongs beside the thing it is about. Inside the stage rather
                than after it, because it hangs off where the front letter comes to
                rest — `--deck-y` — and not off the bottom of the scene, which on a
                tall window is a long way further down. */}
            <p className="mails__hint">(Click on the wax seal to open)</p>
          </div>

          <ul className="mails__dots" aria-label="Choose a letter">
            {LETTERS.map((letter, index) => (
              <li key={letter.id}>
                <button
                  type="button"
                  className="mails__dot"
                  onClick={() => pick(index)}
                  aria-current={index === active ? "true" : undefined}
                  aria-label={`Show letter ${index + 1} of ${LETTERS.length}, from ${letter.name}`}
                />
              </li>
            ))}
          </ul>

          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
        </section>
      </main>
    </ViewTransition>
  );
}
