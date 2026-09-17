/** The white light that carries the card from its second page to its last. */

import type { CSSProperties } from "react";

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
