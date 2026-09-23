"use client";

import { useCallback, useEffect, useState } from "react";

import { MAIL_SOURCES } from "@/lib/constants/mail-letters";
import { INTRO_MS, MAIL_TIMING } from "@/lib/constants/mail-timing";
import { centreOf } from "@/lib/utils/geometry";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import type { Act, MailScene, MailSceneOptions } from "@/types/mail-scene";

import { useSceneMemory } from "./use-scene-memory";
import { useTimers } from "./use-timers";

/**
 * The scene's clock.
 *
 * The opening is one timeline and it lives in the stylesheet: every part of it is
 * a CSS animation with its own delay. JS keeps only the two moments a stylesheet
 * cannot keep for itself — the one where the box's mouth has to be measured
 * before the letters can be told where to fall from, and the one where the scene
 * starts answering the pointer.
 */
export function useMailScene({
  stageRef,
  mouthRef,
  originRef,
}: MailSceneOptions): MailScene {
  const { seen, markSeen } = useSceneMemory();
  // Both, not just the act: the letters are `visibility: hidden` until the scene
  // says it has poured, and a deck that has already been poured once should not
  // have to be poured again to be seen.
  const [act, setAct] = useState<Act>(seen ? "ready" : "waiting");
  const [poured, setPoured] = useState(seen);
  const { after, clear } = useTimers();

  /**
   * Where the letters fall from, as an offset from where they land.
   *
   * Never computed: the lip's place on screen is the product of the box's
   * position, a mirror and a rotation about a corner, and the card has already
   * ruled on this once — the key's hit test measures two marks rather than doing
   * the trigonometry. Written straight to the node, because a number that only
   * CSS reads has no business causing a render.
   */
  const measureMouth = useCallback(() => {
    const mouth = centreOf(mouthRef.current);
    const origin = centreOf(originRef.current);
    const stage = stageRef.current;
    if (!mouth || !origin || !stage) return;
    stage.style.setProperty("--mouth-x", `${Math.round(mouth.x - origin.x)}px`);
    stage.style.setProperty("--mouth-y", `${Math.round(mouth.y - origin.y)}px`);
  }, [mouthRef, originRef, stageRef]);

  const skip = useCallback(() => {
    clear();
    setPoured(true);
    setAct("ready");
    markSeen();
  }, [clear, markSeen]);

  /**
   * The opening, scheduled.
   *
   * The effect that starts the clock is the effect that stops it. That symmetry
   * is the whole point and it was missing before: a one-shot ref used to guard
   * this, with the cancelling done by a separate effect, and StrictMode's
   * mount → cleanup → mount took the pair apart — the cleanup killed the timers
   * and the second mount saw the spent ref and scheduled nothing. The scene sat
   * on `waiting` for ever, and only in `next dev`, where StrictMode runs.
   *
   * A latch is right in `use-reveal.ts`, which guards a *click* against a second
   * click. An effect that must survive being re-run is the opposite problem.
   *
   * The same trap is why `markSeen` is called at every place the opening ENDS
   * and at none of the places it begins. Marked on mount, StrictMode's
   * mount → cleanup → mount would have the second mount find the scene already
   * seen and skip the opening on the reader's very first visit — and only in
   * `next dev`, which is the slowest possible way to find out.
   */
  useEffect(() => {
    // Already played, so there is nothing to schedule and nothing to preload:
    // the pictures are in the browser's cache from the first time round, and the
    // scene rendered its finished state on the very first frame. Everything the
    // opening does is gated on `[data-act="intro"]`, and every one of those
    // elements already rests in the shape its animation would have left it in.
    if (seen) return;

    // A head start on decoding, nothing more — the pour is seconds away and
    // nothing here waits on it.
    for (const src of MAIL_SOURCES) {
      const image = new window.Image();
      image.src = src;
    }

    // A task later, never in the effect itself. Two reasons and both hold: state
    // set synchronously here cascades a second render before the browser has
    // painted the first, and `waiting` is the state the reduced-motion question
    // gets asked in — so the answer arrives before a single frame of an opening
    // it may be about to skip. Nothing shows in the meantime: the box's resting
    // place is off-stage and the letters are not visible yet.
    after(0, () => {
      // Asked once, and only to decide whether to schedule an opening at all.
      // It is not remembered: the stylesheet answers the same question with a
      // live media query, and a second copy of the answer in JS could only ever
      // go stale against it.
      if (prefersReducedMotion()) {
        setPoured(true);
        setAct("ready");
        markSeen();
        return;
      }

      setAct("intro");
      // The mouth is measured in the same task that reveals the letters, so
      // no frame of the fall is ever run against a mouth not yet found.
      after(MAIL_TIMING.pour, () => {
        measureMouth();
        setPoured(true);
      });
      after(INTRO_MS, () => {
        setAct("ready");
        markSeen();
      });
    });

    return clear;
  }, [measureMouth, after, clear, seen, markSeen]);

  /**
   * The lip, found again when the window moves under it.
   *
   * `--mouth-x/-y` are absolute pixels, which is what makes them right: the
   * offset is the product of the box's place, a mirror and a rotation about a
   * corner, and no percentage of anything says it. What absolute pixels are
   * not is durable. Measured once at the pour and left, they were the answer
   * for the window that was there at 2000ms — turn the phone over while the
   * letters are still coming out and every one after the turn falls from a lip
   * that has moved, or from off the screen entirely.
   *
   * Only while they are actually falling. Before the pour there is nothing on
   * screen the number could be wrong for, and MAIL_TIMING.pour's own note says
   * a reading taken then is tens of pixels out by the time it is used; after
   * the deck has settled nothing reads it again.
   */
  useEffect(() => {
    if (act !== "intro" || !poured) return;
    window.addEventListener("resize", measureMouth);
    return () => window.removeEventListener("resize", measureMouth);
  }, [act, poured, measureMouth]);

  return { act, poured, skip };
}
