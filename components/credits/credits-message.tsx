import type { RefObject } from "react";

import type { CssVars } from "@/types/css-vars";
import type { MessageLine } from "@/types/credits";
import { CREDITS_SPARKLES, CREDITS_WORDS } from "@/lib/constants/credits";

interface CreditsMessageProps {
  /** Where each line runs, once measured; until then the masks cover all. */
  lines: MessageLine[] | null;
  fills: [RefObject<SVGTextElement | null>, RefObject<SVGTextElement | null>];
  sparkles: RefObject<HTMLDivElement | null>;
}

/** The two lines and their mask, as drawn in the message's own 1200x420 box. */
const LINES = [
  { y: 170, size: 130, band: { y: 0, height: 235 } },
  { y: 335, size: 96, band: { y: 235, height: 185 } },
] as const;

/**
 * The thank-you, written in gold once the lights are out.
 *
 * Each line is there twice: a stroke the pen draws, and a gold fill that
 * settles into it after. A mask slides open from the left in step with the pen,
 * so neither copy is ever ahead of the nib. How far along each line is arrives
 * as a custom property from the scroll, never as a style on these elements.
 */
export default function CreditsMessage({ lines, fills, sparkles }: CreditsMessageProps) {
  return (
    <div className="credits-message" aria-hidden="true">
      <div className="credits-message__box">
        <svg className="credits-message__svg" viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="credits-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F6E3A1" />
              <stop offset=".45" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#F1D57F" />
            </linearGradient>
            <radialGradient id="credits-pen-glow">
              <stop offset="0" stopColor="#fffbe8" />
              <stop offset=".4" stopColor="#F4DE8E" stopOpacity=".9" />
              <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
            </radialGradient>
            {LINES.map((line, i) => (
              <mask
                key={i}
                id={`credits-mask-${i + 1}`}
                maskUnits="userSpaceOnUse"
                x="-100"
                y="-100"
                width="1400"
                height="620"
              >
                <rect
                  className={`credits-message__reveal credits-message__reveal--${i + 1}`}
                  x={lines ? lines[i].x0 : 0}
                  y={line.band.y}
                  width={lines ? lines[i].x1 - lines[i].x0 : 1200}
                  height={line.band.height}
                  fill="#fff"
                />
              </mask>
            ))}
          </defs>

          {LINES.map((line, i) => (
            <g key={i} mask={`url(#credits-mask-${i + 1})`}>
              <text
                ref={fills[i]}
                className={`credits-message__text credits-message__fill credits-message__fill--${i + 1}`}
                x="600"
                y={line.y}
                textAnchor="middle"
                fontSize={line.size}
                fill="url(#credits-gold)"
              >
                {CREDITS_WORDS.message[i]}
              </text>
              <text
                className={`credits-message__text credits-message__ink credits-message__ink--${i + 1}`}
                x="600"
                y={line.y}
                textAnchor="middle"
                fontSize={line.size}
              >
                {CREDITS_WORDS.message[i]}
              </text>
            </g>
          ))}

          <circle className="credits-message__pen" cx="0" cy="0" r="16" fill="url(#credits-pen-glow)" />
        </svg>

        <div className="credits-message__sparkles" ref={sparkles}>
          {CREDITS_SPARKLES.map((s, i) => (
            <div
              key={i}
              className="credits-message__sparkle"
              style={
                {
                  "--x": `${s.x}%`,
                  "--y": `${s.y}%`,
                  "--twinkle": `${s.twinkleMs}ms`,
                } as CssVars
              }
            >
              <svg viewBox="0 0 20 20">
                <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#F4DE8E" />
                <circle cx="10" cy="10" r="2" fill="#fff" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
