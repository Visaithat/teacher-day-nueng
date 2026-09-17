
import {
  SIGNATURE_LINES,
  SIGNATURE_STROKE_WIDTH,
} from "@/lib/constants/signature";

import type { CssVars } from "@/types/css-vars";

/** Timing of each line, in the custom properties the stylesheet reads. */
const LINE_TIMING: CssVars[] = [
  { "--sign-delay": "0.4s", "--sign-duration": "1.8s" } as CssVars,
  // Picks up the instant the first line lands, so the hand never stops.
  { "--sign-delay": "2.2s", "--sign-duration": "2.5s" } as CssVars,
];

export default function Signature() {
  return (
    <h1 className="signature">
      <span className="sr-only">Greeting, Teacher Nueng</span>

      {SIGNATURE_LINES.map((line, index) => {
        const [vbX, vbY, vbW, vbH] = line.viewBox.split(" ").map(Number);

        return (
          <svg
            key={line.text}
            aria-hidden="true"
            focusable="false"
            className={`signature__line signature__line--${index + 1}`}
            viewBox={line.viewBox}
            style={
              {
                ...LINE_TIMING[index],
                "--line-width": `${line.widthEm}em`,
                "--line-height": `${line.heightEm}em`,
              } as CssVars
            }
          >
            <defs>
              {/* The pen: what it has covered so far is what has been inked. */}
              <mask
                id={`sig-reveal-${index}`}
                maskUnits="userSpaceOnUse"
                x={vbX}
                y={vbY}
                width={vbW}
                height={vbH}
              >
                {line.strokes.map((stroke, strokeIndex) => (
                  <path
                    key={strokeIndex}
                    className="signature__ink"
                    d={stroke.d}
                    pathLength={1}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={SIGNATURE_STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={
                      {
                        "--stroke-from": stroke.from,
                        "--stroke-to": stroke.to,
                      } as CssVars
                    }
                  />
                ))}
              </mask>

              {/* Ragged edges and uneven ink, so it is not a flat vector fill. */}
              <filter
                id={`sig-texture-${index}`}
                x="-6%"
                y="-12%"
                width="112%"
                height="124%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.09 0.13"
                  numOctaves={3}
                  seed={index === 0 ? 7 : 19}
                  result="grain"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="grain"
                  scale={1.5}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="bled"
                />
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.012 0.02"
                  numOctaves={2}
                  seed={index === 0 ? 3 : 11}
                  result="blotch"
                />
                <feColorMatrix
                  in="blotch"
                  type="matrix"
                  values="0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0.22 0.82"
                  result="wash"
                />
                <feComposite in="bled" in2="wash" operator="in" />
              </filter>
            </defs>

            <g mask={`url(#sig-reveal-${index})`}>
              <text
                className="signature__glyphs"
                x={0}
                y={0}
                fontSize={line.fontSize}
                textLength={line.textLength}
                lengthAdjust="spacingAndGlyphs"
                fill="currentColor"
                filter={`url(#sig-texture-${index})`}
              >
                {line.text}
              </text>
            </g>

            {/* The nib, a touch ahead of the ink it is laying down. */}
            {line.strokes.map((stroke, strokeIndex) => (
              <circle
                key={strokeIndex}
                className="signature__nib"
                r={3.2}
                cx={0}
                cy={0}
                fill="currentColor"
                style={
                  {
                    "--stroke-path": `path("${stroke.d}")`,
                    "--stroke-from": stroke.from,
                    "--stroke-to": stroke.to,
                  } as CssVars
                }
              />
            ))}
          </svg>
        );
      })}
    </h1>
  );
}
