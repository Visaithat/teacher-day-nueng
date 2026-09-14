import type { CSSProperties } from "react";

export type RevealLightProps = {
  /** "flooding" while the light grows, "clearing" while it lifts. */
  phase: "flooding" | "clearing";
  /** The light stands still: only its opacity moves. */
  calm: boolean;
  /** Where it starts, how far it reaches, how long it takes. */
  style: CSSProperties | null;
};

/** The white light that carries the card from the mail box to the next page. */
export function RevealLight({ phase, calm, style }: RevealLightProps) {
  return (
    <div
      className="reveal"
      data-phase={phase}
      data-calm={calm || undefined}
      style={style ?? undefined}
      aria-hidden="true"
    >
      <span className="reveal__light" />
    </div>
  );
}
