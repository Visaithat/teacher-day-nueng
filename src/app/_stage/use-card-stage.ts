"use client";

import { useCallback, useEffect, useState } from "react";

/** The three pieces of text leave 0.6s each, staggered 0.1s apart. */
const LEAVE_MS = 900;
/** Reduced motion swaps the whole assembly for a single 0.8s fade. */
const REDUCED_ASSEMBLE_MS = 800;

export type CardStageOptions = {
  /** Images to fetch before the second page is allowed to start moving. */
  preload: readonly string[];
  /** How long the second page takes to assemble, in ms. */
  assembleMs: number;
};

export type CardStage = {
  /** The first page has been dismissed and its text is drifting away. */
  leaving: boolean;
  /** The text has cleared and every photo has loaded: show the second page. */
  showSecond: boolean;
  /** Every layer of the second page has come to rest. */
  assembled: boolean;
  /** Dismiss the first page. */
  open: () => void;
};

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
    const timer = window.setTimeout(() => setTextCleared(true), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!showSecond) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [leaving, assembled]);

  const open = useCallback(() => setLeaving(true), []);

  return { leaving, showSecond, assembled, open };
}
