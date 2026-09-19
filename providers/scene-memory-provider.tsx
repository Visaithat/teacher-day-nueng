"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import type { SceneMemory } from "@/types/scene-memory";

/**
 * Read through {@link useSceneMemory} rather than directly — the hook is what
 * turns "mounted outside the layout" into a loud error instead of a scene that
 * quietly forgets everything.
 */
export const SceneMemoryContext = createContext<SceneMemory | null>(null);

/**
 * Holds the handful of facts the mail scene must keep while the reader is away
 * from it — at one of the things inside an envelope, or back at the present it
 * came in. See {@link SceneMemory} for why this is memory rather than storage,
 * and why it sits above all three of those places rather than around the deck.
 */
export default function SceneMemoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [seen, setSeen] = useState(false);
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState<ReadonlySet<number>>(() => new Set());

  // Idempotent on purpose: the opening has three ways to end — it runs out, the
  // reader skips it, or reduced motion means it never started — and all three
  // say this.
  const markSeen = useCallback(() => setSeen(true), []);

  const value = useMemo(
    () => ({ seen, markSeen, active, setActive, opened, setOpened }),
    [seen, markSeen, active, opened],
  );

  return (
    <SceneMemoryContext.Provider value={value}>
      {children}
    </SceneMemoryContext.Provider>
  );
}
