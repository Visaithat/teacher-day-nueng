import type { CSSProperties } from "react";

import {
  HOME_CARD,
  HOME_PHOTOS,
  type PhotoMotion,
} from "./home-data";

/** How long every layer takes to drift in and settle. They all move together. */
const SLIDE_MS = 3000;

/** From the layers starting to move to the last one coming to rest. */
export const HOME_ASSEMBLE_MS = SLIDE_MS + 120;

/** Deterministic jitter in [-1, 1) from an index, so renders stay stable. */
function jitter(index: number, salt: number) {
  const n = Math.sin((index + 1) * salt) * 10000;
  return (n - Math.floor(n)) * 2 - 1;
}

function enterFrom({ enterX, enterY }: PhotoMotion) {
  return `translate3d(${enterX}vw, ${enterY}vh, 0)`;
}

function motionVars(layer: PhotoMotion): CSSProperties {
  return {
    "--enter-from": enterFrom(layer),
    "--enter-duration": `${SLIDE_MS}ms`,
    "--walk": layer.walk,
  } as CSSProperties;
}

/** The home page: three pictures walking in to make one card. */
export function Home() {
  return (
    <main className="home">
      <div
        className="postcard"
        style={{ "--card-ratio": HOME_CARD.ratio } as CSSProperties}
      >
        {/* The card stays in normal flow: its height is the card's height. */}
        <div className="postcard__enter" style={motionVars(HOME_CARD)}>
          <div className="postcard__walk">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="postcard__base"
              src={HOME_CARD.src}
              alt={HOME_CARD.alt}
              draggable={false}
            />
          </div>
        </div>

        {HOME_PHOTOS.map((piece, index) => (
          <div
            key={piece.src}
            className="postcard__piece"
            style={
              {
                "--x": piece.x,
                "--y": piece.y,
                "--w": `${piece.width}%`,
                "--z": piece.z,
              } as CSSProperties
            }
          >
            <div className="postcard__enter" style={motionVars(piece)}>
              <div className="postcard__walk">
                <div
                  className="postcard__drift"
                  style={
                    {
                      "--drift-x": `${jitter(index, 43.11) * 0.5}%`,
                      "--drift-y": `${jitter(index, 91.7) * 0.5}%`,
                      "--drift-rotate": `${jitter(index, 27.4) * 0.3}deg`,
                      "--drift-duration": `${10 + jitter(index, 55.3) * 1.5}s`,
                      // Offset starts, so the two never breathe in lockstep.
                      "--drift-delay": `${SLIDE_MS + index * 900}ms`,
                    } as CSSProperties
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="postcard__image"
                    src={piece.src}
                    alt={piece.alt}
                    draggable={false}
                    style={
                      { "--rotate": `${piece.rotate}deg` } as CSSProperties
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
