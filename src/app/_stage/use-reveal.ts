"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/** The light grows out of the present until it has swallowed the screen. */
const FLOOD_MS = 520;
/** Solid white, holding, while one page is taken down and the next is built. */
const HOLD_MS = 140;
/** Painted frames of solid white after the new page exists, before it shows. */
const CLEAR_DELAY_MS = 80;
/** The light thins out and the page underneath is there. */
const CLEAR_MS = 520;

/** Motion is unwelcome: the light does not travel, it only arrives and goes. */
const CALM = { flood: 240, hold: 120, delay: 60, clear: 300 };

export type RevealPhase = "before" | "flooding" | "clearing" | "after";

export type Reveal = {
  phase: RevealPhase;
  /** Where the light starts, how far it reaches, and how long it takes. */
  burst: CSSProperties | null;
  /** The light stands still and only its opacity moves. */
  calm: boolean;
  /** Swallow the screen, starting from this box. One way, and only once. */
  begin: (from: DOMRect) => void;
};

/**
 * The hand-over from the mail box to the page the present opens onto.
 *
 * The light is a sibling of both pages and a child of neither: it has to keep
 * animating straight through the commit that unmounts one and mounts the other.
 * Every duration below is handed to the CSS as a custom property, so the timers
 * that drive the swap and the curves that drive the pixels cannot drift apart.
 */
export function useReveal(): Reveal {
  const [phase, setPhase] = useState<RevealPhase>("before");
  const [burst, setBurst] = useState<CSSProperties | null>(null);
  const [calm, setCalm] = useState(false);

  const started = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const id of timers.current) window.clearTimeout(id);
    },
    [],
  );

  const begin = useCallback((from: DOMRect) => {
    // A ref, not a check on `phase`: a second click landing in the same tick as
    // the first would read a stale phase and start the whole thing over.
    if (started.current) return;
    started.current = true;

    const x = from.left + from.width / 2;
    const y = from.top + from.height / 2;
    // How far the furthest corner of the viewport is from wherever the present
    // happens to be sitting, plus a margin — a phone's URL bar can slide away
    // and grow the viewport while the light is still on its way out. Measured
    // in pixels here rather than guessed at in vmax: the disc animates from a
    // fraction of this to exactly 1, so every frame of the growth is on screen.
    const reach =
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      ) *
        1.07 +
      24;

    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = quiet
      ? CALM
      : {
          flood: FLOOD_MS,
          hold: HOLD_MS,
          delay: CLEAR_DELAY_MS,
          clear: CLEAR_MS,
        };

    setCalm(quiet);
    setBurst({
      "--burst-x": `${x}px`,
      "--burst-y": `${y}px`,
      "--burst-r": `${reach}px`,
      // The light starts at the present's own size, so the box becomes the
      // light rather than a spark appearing on top of it. Never zero: a layer
      // with no area is one the compositor has not rasterised yet.
      "--burst-from": `${Math.max(from.width, from.height) / 2 / reach}`,
      "--flood-ms": `${t.flood}ms`,
      "--clear-ms": `${t.clear}ms`,
      "--clear-delay": `${t.delay}ms`,
    } as CSSProperties);

    setPhase("flooding");
    timers.current.push(
      window.setTimeout(() => setPhase("clearing"), t.flood + t.hold),
      window.setTimeout(
        () => setPhase("after"),
        t.flood + t.hold + t.delay + t.clear,
      ),
    );
  }, []);

  // Nothing may move under the white, and the deck is still two screens tall.
  useEffect(() => {
    if (phase !== "flooding" && phase !== "clearing") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "clearing") return;
    // Only now, with the screen solid white. Reset the offset any earlier — at
    // the click, the way useCardStage does — and the deck would visibly fly back
    // up to the home page while the light was still the size of a fist.
    // "instant", because html carries scroll-behavior: smooth and a smooth
    // scroll started here would still be running when the white lifts.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [phase]);

  return { phase, burst, calm, begin };
}
