"use client";

import { useCallback, useEffect, useState } from "react";

import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { lockRootScroll } from "@/lib/utils/scroll-lock";
import type { CardStage, CardStageOptions } from "@/types/card-stage";

/** The three pieces of text leave 0.6s each, staggered 0.1s apart. */
const WELCOME_LEAVE_MS = 900;
/** Reduced motion swaps the whole assembly for a single 0.8s fade. */
const REDUCED_ASSEMBLE_MS = 800;

/**
 * Moves the card from its first page to its second.
 *
 * The second page only starts once the first has emptied *and* every photo has
 * arrived, so nothing is ever caught half-drawn, and the document cannot be
 * scrolled from the moment of the click until the last piece settles — the
 * layers overhang the viewport on their way in.
 */
export function useCardStage({
  preload,
  assembleMs,
}: CardStageOptions): CardStage {
  const [leaving, setLeaving] = useState(false);
  const [textCleared, setTextCleared] = useState(false);
  const [photosReady, setPhotosReady] = useState(preload.length === 0);
  const [assembled, setAssembled] = useState(false);

  const showSecond = leaving && textCleared && photosReady;

  // Fetch every photo while the first page is still being read.
  useEffect(() => {
    if (preload.length === 0) return;

    let live = true;
    let remaining = preload.length;
    const settle = () => {
      if (live && --remaining === 0) setPhotosReady(true);
    };

    for (const src of preload) {
      const image = new window.Image();
      image.onload = settle;
      image.onerror = settle;
      image.src = src;
    }

    return () => {
      live = false;
    };
  }, [preload]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setTextCleared(true), WELCOME_LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!showSecond) return;
    const calm = prefersReducedMotion();
    const timer = window.setTimeout(
      () => setAssembled(true),
      calm ? REDUCED_ASSEMBLE_MS : assembleMs,
    );
    return () => window.clearTimeout(timer);
  }, [showSecond, assembleMs]);

  useEffect(() => {
    if (!leaving || assembled) return;
    // Browsers restore the scroll offset on reload. With a snapping document a
    // restored offset would fling the reader straight past the second page.
    window.scrollTo(0, 0);
    return lockRootScroll();
  }, [leaving, assembled]);

  const open = useCallback(() => setLeaving(true), []);

  return { leaving, showSecond, assembled, open };
}
