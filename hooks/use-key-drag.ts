"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HIT_RATIO, MAILBOX_TIMING } from "@/lib/constants/mailbox";
import type { KeyState } from "@/types/mailbox";
import { centreOf } from "@/lib/utils/geometry";

import { useTimers } from "./use-timers";

/**
 * Dragging the key into the lock.
 *
 * The hit test never does trigonometry. Two zero-size marker elements — one at
 * the key's tip, inside every rotation that has been applied to it, and one at
 * the keyhole — are measured with getBoundingClientRect(), which hands back
 * their true position on screen with all the ancestor transforms already
 * applied. That stays exact at any viewport, and there is nothing to retune
 * when the layout changes.
 *
 * The drag itself writes two custom properties straight to the DOM node: React
 * never re-renders while the pointer is moving, and only `transform` animates.
 */
export function useKeyDrag() {
  const keyRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const holeRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<KeyState>("idle");
  const [announcement, setAnnouncement] = useState("");

  /** Measured once per drag: rects are viewport-relative and go stale. */
  const grab = useRef({ x: 0, y: 0, tipX: 0, tipY: 0, holeX: 0, holeY: 0, hit: 0 });
  const { after } = useTimers();

  const setOffset = (x: number, y: number) => {
    const node = keyRef.current;
    if (!node) return;
    node.style.setProperty("--drag-x", `${x}px`);
    node.style.setProperty("--drag-y", `${y}px`);
  };

  /** Run the key home, turn it, and let the CSS take over from there. */
  const unlock = useCallback((offsetX: number, offsetY: number) => {
    setOffset(offsetX, offsetY);
    setState("seating");
    after(MAILBOX_TIMING.seat, () => setState("turning"));
    after(MAILBOX_TIMING.seat + MAILBOX_TIMING.turn, () => {
      setState("open");
      setAnnouncement(
        "The mail box is open. There is a present inside, ready to open.",
      );
    });
  }, [after]);

  /** Aim the tip at the hole from wherever the key currently sits. */
  const unlockFromRest = useCallback(() => {
    const tip = centreOf(tipRef.current);
    const hole = centreOf(holeRef.current);
    if (!tip || !hole) return;
    unlock(hole.x - tip.x, hole.y - tip.y);
  }, [unlock]);

  const springBack = useCallback(() => {
    setOffset(0, 0);
    setState("returning");
    after(MAILBOX_TIMING.springBack, () => setState("idle"));
  }, [after]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (state === "open" || state === "seating" || state === "turning") return;
      if (!event.isPrimary) return;

      const tip = centreOf(tipRef.current);
      const hole = centreOf(holeRef.current);
      const box = boxRef.current?.getBoundingClientRect();
      if (!tip || !hole || !box) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      grab.current = {
        x: event.clientX,
        y: event.clientY,
        tipX: tip.x,
        tipY: tip.y,
        holeX: hole.x,
        holeY: hole.y,
        hit: Math.max(40, box.width * HIT_RATIO),
      };
      setState("dragging");
    },
    [state],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (state !== "dragging") return;
      const g = grab.current;
      const dx = event.clientX - g.x;
      const dy = event.clientY - g.y;
      setOffset(dx, dy);

      const node = keyRef.current;
      if (!node) return;
      const near =
        Math.hypot(g.tipX + dx - g.holeX, g.tipY + dy - g.holeY) < g.hit * 1.7;
      const flag = near ? "true" : "false";
      if (node.dataset.near !== flag) node.dataset.near = flag;
    },
    [state],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (state !== "dragging") return;
      const g = grab.current;
      const dx = event.clientX - g.x;
      const dy = event.clientY - g.y;
      if (keyRef.current) keyRef.current.dataset.near = "false";

      if (Math.hypot(g.tipX + dx - g.holeX, g.tipY + dy - g.holeY) <= g.hit) {
        // Land the tip exactly on the hole rather than wherever it was let go.
        unlock(dx + (g.holeX - (g.tipX + dx)), dy + (g.holeY - (g.tipY + dy)));
      } else {
        springBack();
      }
    },
    [state, unlock, springBack],
  );

  const onPointerCancel = useCallback(() => {
    if (state === "dragging") springBack();
  }, [state, springBack]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (state === "open" || state === "seating" || state === "turning") return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        unlockFromRest();
        return;
      }

      // Arrows nudge. Without preventDefault they would scroll the deck instead,
      // and on a snapping document that throws you onto another page.
      const step = event.shiftKey ? 32 : 16;
      const nudge: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = nudge[event.key];
      if (!move) return;
      event.preventDefault();

      const node = keyRef.current;
      if (!node) return;
      const x = Number.parseFloat(node.style.getPropertyValue("--drag-x")) || 0;
      const y = Number.parseFloat(node.style.getPropertyValue("--drag-y")) || 0;
      setOffset(x + move[0], y + move[1]);

      const tip = centreOf(tipRef.current);
      const hole = centreOf(holeRef.current);
      const box = boxRef.current?.getBoundingClientRect();
      if (!tip || !hole || !box) return;
      if (Math.hypot(tip.x - hole.x, tip.y - hole.y) <= Math.max(40, box.width * HIT_RATIO)) {
        unlockFromRest();
      }
    },
    [state, unlockFromRest],
  );

  // The cached rects are viewport-relative, so a scroll invalidates the drag.
  useEffect(() => {
    if (state !== "dragging") return;
    const cancel = () => springBack();
    window.addEventListener("scroll", cancel, { passive: true });
    return () => window.removeEventListener("scroll", cancel);
  }, [state, springBack]);

  return {
    state,
    announcement,
    keyRef,
    tipRef,
    holeRef,
    boxRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
    },
  };
}
