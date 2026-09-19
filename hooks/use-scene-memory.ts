"use client";

import { useContext } from "react";

import { SceneMemoryContext } from "@/providers/scene-memory-provider";
import type { SceneMemory } from "@/types/scene-memory";

/**
 * Reads the mail scene's memory.
 *
 * Throwing rather than falling back to a fresh set of defaults: a scene that
 * silently forgot everything because it was mounted outside the provider would
 * look exactly like the bug this file exists to fix, and would be found the same
 * slow way.
 *
 * @throws If called outside {@link SceneMemoryProvider}.
 */
export function useSceneMemory(): SceneMemory {
  const memory = useContext(SceneMemoryContext);
  if (!memory) {
    throw new Error(
      "The mail scene must be rendered inside <CardPlace>, which holds its memory.",
    );
  }
  return memory;
}
