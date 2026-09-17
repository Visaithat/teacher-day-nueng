import type { Ref } from "react";

interface CardboardBoxProps {
  /**
   * A zero-size mark at the lip of the open mouth. It is carried by every one of
   * the box's transforms, so measuring it gives the letters somewhere real to
   * fall from without anyone having to do the trigonometry.
   */
  mouthRef: Ref<HTMLSpanElement>;
}

/**
 * The cardboard box the letters arrive in.
 *
 * Pure vector, and lifted whole from the design: every polygon below was placed
 * there rather than here, so this file is a transcription and nothing more. The
 * three boxes above it each own one movement — coming in, tipping over, and the
 * mirror that decides which way it faces.
 *
 * The mirror is on the artwork itself and nothing else, which keeps the two
 * transforms above it in plain screen terms: the box tips clockwise about the
 * corner it stands on, and that corner is at 87% because the mirror has already
 * swapped left for right underneath.
 */
export default function CardboardBox({ mouthRef }: CardboardBoxProps) {
  return (
    <div className="mails__box" aria-hidden="true">
      <div className="mails__box-tip">
        {/* Measured, never computed. 40% across the mouth's opening and a third
            down it — the point a letter would actually slide over. */}
        <span ref={mouthRef} className="mails__mouth" />
        <svg
          className="mails__box-art"
          viewBox="0 0 520 500"
          role="img"
          aria-label="A cardboard box of letters"
        >
          <defs>
            <linearGradient id="mail-box-inner" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#2E1A15" />
              <stop offset="1" stopColor="#6B4132" />
            </linearGradient>
            <linearGradient id="mail-box-front" x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0" stopColor="#E08F5C" />
              <stop offset="1" stopColor="#D0793F" />
            </linearGradient>
            <filter id="mail-box-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1.6"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <filter
              id="mail-box-soft"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <filter
              id="mail-box-contact"
              x="-30%"
              y="-40%"
              width="160%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="11" />
            </filter>
            <pattern
              id="mail-box-hatch"
              width="11"
              height="11"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(28)"
            >
              <path
                d="M0 0 L0 11"
                stroke="#3A2418"
                strokeWidth="1.6"
                opacity="0.5"
              />
            </pattern>
            <clipPath id="mail-box-clip">
              <polygon points="15,180 108,130 265,45 465,148 510,233 455,358 270,470 70,370" />
            </clipPath>
          </defs>

          <g className="mails__box-shadow">
            <polygon
              points="56,219 241,319 441,222 441,372 256,469 56,369"
              fill="#8A5A2E"
              opacity="0.3"
              filter="url(#mail-box-soft)"
            />
            <ellipse
              className="mails__box-contact"
              cx="250"
              cy="468"
              rx="196"
              ry="24"
              fill="#7A4E26"
              opacity="0.28"
              filter="url(#mail-box-contact)"
            />
          </g>

          <g>
            <polygon
              points="255,105 356,157 455,208 465,148 364,97 265,45"
              fill="#E09A6A"
              stroke="#3A2418"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points="70,205 162,155 255,105 200,80 108,130 15,180"
              fill="#DE9364"
              stroke="#3A2418"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points="455,208 363,257 270,305 325,330 417,282 510,233"
              fill="#D68B5C"
              stroke="#3A2418"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <polygon
              points="70,205 170,255 270,305 363,257 455,208 356,157 255,105 162,155"
              fill="url(#mail-box-inner)"
              stroke="#3A2418"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points="108,213 268,293 418,216 258,139"
              fill="#4A2B23"
              opacity="0.85"
            />
            <polygon
              points="108,213 268,293 418,216 258,139"
              fill="url(#mail-box-hatch)"
              opacity="0.12"
            />

            <polygon
              points="70,205 171,254 270,305 272,380 269,455 169,407 70,355 68,281"
              fill="url(#mail-box-front)"
              stroke="#3A2418"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points="270,305 363,258 455,208 457,283 455,358 362,407 270,455 268,380"
              fill="#B5613A"
              stroke="#3A2418"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <polygon
              points="252,300 288,318 284,452 256,452"
              fill="url(#mail-box-hatch)"
              opacity="0.16"
            />
            <polygon
              points="72,208 268,306 266,330 70,232"
              fill="#3A2418"
              opacity="0.08"
            />

            <polygon
              points="236,330 306,357 300,380 230,353"
              fill="#FBF3E2"
              fillOpacity="0.55"
              stroke="#3A2418"
              strokeWidth="1"
              strokeOpacity="0.5"
            />

            <g>
              <polygon
                points="92,300 168,338 166,392 90,354"
                fill="#FBF3E2"
                stroke="#3A2418"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M100,320 L156,348"
                stroke="#3A2418"
                strokeWidth="2"
                opacity="0.6"
              />
              <path
                d="M100,334 L148,358"
                stroke="#3A2418"
                strokeWidth="2"
                opacity="0.45"
              />
              <path
                d="M100,348 L138,367"
                stroke="#3A2418"
                strokeWidth="2"
                opacity="0.3"
              />
            </g>

            <g>
              <polygon
                points="198,352 244,375 242,412 196,389"
                fill="#FBF3E2"
                stroke="#3A2418"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <polygon
                points="205,363 237,379 236,402 204,386"
                fill="none"
                stroke="#B03A3A"
                strokeWidth="2"
              />
              <path
                d="M205,363 L221,388 L237,379"
                fill="none"
                stroke="#B03A3A"
                strokeWidth="2"
              />
            </g>

            <g stroke="#3A2418" strokeWidth="2" opacity="0.25" fill="none">
              <path d="M120,262 L146,275" />
              <path d="M196,300 L214,310" />
              <path d="M390,300 L404,292" />
              <path d="M330,380 L352,368" />
            </g>

            <g
              fill="none"
              stroke="#F6D6B4"
              strokeWidth="1.6"
              opacity="0.6"
              strokeDasharray="9 13"
            >
              <polygon points="70,205 171,254 270,305 272,380 269,455 169,407 70,355 68,281" />
              <polygon points="270,305 363,258 455,208 457,283 455,358 362,407 270,455 268,380" />
              <polygon points="255,105 356,157 455,208 465,148 364,97 265,45" />
              <polygon points="70,205 162,155 255,105 200,80 108,130 15,180" />
              <polygon points="455,208 363,257 270,305 325,330 417,282 510,233" />
            </g>

            {/* The grain is the one expensive thing here: a turbulence filter
                re-run every frame would cost more than the rest of the scene put
                together. It sits on a child that never moves, so the filtered
                raster is made once and the transforms above merely push it
                around. */}
            <g
              clipPath="url(#mail-box-clip)"
              opacity="0.15"
              style={{ mixBlendMode: "multiply" }}
            >
              <rect
                x="0"
                y="0"
                width="520"
                height="500"
                filter="url(#mail-box-grain)"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
