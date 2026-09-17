"use client";

import { useCallback, useEffect, useRef } from "react";

export type Timers = {
  /**
   * Run something later, and remember it so it can be called off.
   *
   * Every scheduled callback is drained on unmount, so a timer that outlives the
   * component it was started from cannot fire into nothing.
   */
  after: (ms: number, run: () => void) => void;
  /** Call off everything scheduled so far. Safe to call more than once. */
  clear: () => void;
};

/**
 * A bag of timers that empties itself when the component goes.
 *
 * Four of the card's hooks schedule work against a clock they also have to be
 * able to abandon — a reader who skips the opening, presses Back mid-flight, or
 * simply navigates away. Each of them used to keep its own `useRef<number[]>`
 * and its own cleanup loop; this is that pattern, once.
 *
 * {@link Timers.clear} is stable, so it can be returned straight from an effect
 * as its cleanup and listed in that effect's dependencies.
 */
export function useTimers(): Timers {
  const ids = useRef<number[]>([]);

  const clear = useCallback(() => {
    for (const id of ids.current) window.clearTimeout(id);
    ids.current = [];
  }, []);

  const after = useCallback((ms: number, run: () => void) => {
    ids.current.push(window.setTimeout(run, ms));
  }, []);

  useEffect(() => clear, [clear]);

  return { after, clear };
}
