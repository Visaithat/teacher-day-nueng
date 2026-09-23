"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { CssVars } from "@/types/css-vars";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { lockRootScroll } from "@/lib/utils/scroll-lock";
import type { Reveal, RevealPhase } from "@/types/reveal";

import { useTimers } from "./use-timers";

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
  /* Where the light came from and how far it has been told to go. Kept so the
     reach can be worked out again if the window changes shape under it — see
     the effect below. */
  const flight = useRef({ x: 0, y: 0, seed: 0, reach: 0 });
  const { after } = useTimers();

  /**
   * How far the furthest corner of the window is from wherever the present was
   * sitting, plus a margin.
   *
   * Pixels rather than `vmax`: the disc animates from a fraction of this to
   * exactly 1, so every frame of the growth has to be on screen.
   */
  const reachFrom = useCallback(
    (x: number, y: number) =>
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      ) *
        1.07 +
      24,
    [],
  );

  const begin = useCallback((from: DOMRect) => {
    // A ref, not a check on `phase`: a second click landing in the same tick as
    // the first would read a stale phase and start the whole thing over.
    if (started.current) return;
    started.current = true;

    const x = from.left + from.width / 2;
    const y = from.top + from.height / 2;
    const reach = reachFrom(x, y);
    const seed = Math.max(from.width, from.height) / 2;
    flight.current = { x, y, seed, reach };

    const quiet = prefersReducedMotion();
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
      "--burst-from": `${seed / reach}`,
      "--flood-ms": `${t.flood}ms`,
      "--clear-ms": `${t.clear}ms`,
      "--clear-delay": `${t.delay}ms`,
    } as CssVars);

    setPhase("flooding");
    after(t.flood + t.hold, () => setPhase("clearing"));
    after(t.flood + t.hold + t.delay + t.clear, () => setPhase("after"));
  }, [after, reachFrom]);

  /**
   * The window changing shape while the light is still on its way out.
   *
   * The margin above is a hedge against a URL bar sliding away, and a hedge is
   * all it is: turn the phone on its side mid-flight and the far corner is
   * somewhere else entirely, so the disc stops short and the page it was meant
   * to be covering shows around it — during the one moment of the card where
   * nothing underneath is supposed to be seen.
   *
   * The centre stays frozen, which is what reveal-light.css asks for. Only the
   * reach is worked out again, and only ever upward: the light may need to grow
   * to cover a window that got bigger, and must never shrink away from one.
   * `--burst-from` is recomputed with it, so `reach * from` — the size the light
   * STARTS at, which is the present's own — comes out the same either way.
   */
  useEffect(() => {
    if (phase !== "flooding" && phase !== "clearing") return;

    const grow = () => {
      const { x, y, seed, reach } = flight.current;
      const wanted = reachFrom(x, y);
      if (wanted <= reach) return;
      flight.current = { x, y, seed, reach: wanted };
      setBurst((was) =>
        was
          ? ({
              ...was,
              "--burst-r": `${wanted}px`,
              "--burst-from": `${seed / wanted}`,
            } as CssVars)
          : was,
      );
    };

    window.addEventListener("resize", grow);
    return () => window.removeEventListener("resize", grow);
  }, [phase, reachFrom]);

  // Nothing may move under the white, and the deck is still two screens tall.
  useEffect(() => {
    if (phase !== "flooding" && phase !== "clearing") return;
    return lockRootScroll();
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
