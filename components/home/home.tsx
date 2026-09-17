
import type { CssVars } from "@/types/css-vars";
import { jitter } from "@/lib/utils/jitter";
import {
  HOME_CARD,
  HOME_PHOTOS,
  SLIDE_MS,
} from "@/lib/constants/home";
import { motionVars } from "@/lib/utils/home-vars";

interface HomeProps {
  /** Every layer has settled: the scroll hint may appear. */
  settled: boolean;
}

/** The home page: three pictures walking in to make one card. */
export default function Home({ settled }: HomeProps) {
  return (
    <section className="home">
      <div
        className="postcard"
        style={{ "--card-ratio": HOME_CARD.ratio } as CssVars}
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
              } as CssVars
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
                    } as CssVars
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="postcard__image"
                    src={piece.src}
                    alt={piece.alt}
                    draggable={false}
                    style={
                      { "--rotate": `${piece.rotate}deg` } as CssVars
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wait for the card to settle before inviting a scroll. */}
      <a
        className={`home__hint${settled ? " home__hint--shown" : ""}`}
        href="#mailbox"
      >
        <span className="home__hint-label">There is mail for you</span>
        <span className="home__hint-chevron" aria-hidden="true" />
      </a>
    </section>
  );
}
