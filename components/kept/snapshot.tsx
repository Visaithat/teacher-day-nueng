import { POSTCARD } from "@/lib/constants/kept";
import type { CssVars } from "@/types/css-vars";

/** The picture, and the shape of its box, so CSS can hold it before it loads. */
const SNAPSHOT = { src: "/art/letter/snapshot.webp", ratio: 1.4472 };

interface SnapshotProps {
  /**
   * The card's width over its height.
   *
   * Passed in rather than read off the artwork a second time: the photograph
   * starts hidden behind the card, so it has to know how tall the card is, and
   * there should be one place that says so.
   */
  cardRatio: number;
}

/**
 * The photograph taped under the postcard, and the way it comes out.
 *
 * OUTSIDE the hero, and that is the whole of why it is its own component. The
 * hero carries the shared view-transition name, so everything in it crossed
 * from the envelope and the reader watched it cross. This did not: it is
 * already lying on the cloth when the card arrives, the way the tape deck is
 * already under the cassette. Put it inside the hero and it would grow out of
 * the envelope with the postcard, which is a thing that never happened.
 *
 * Placed against the card rather than laid out beside it - it belongs on the
 * card's bottom right corner, and a flex sibling can only be centred. Both are
 * absolutely placed inside `.kept__group`, in shares of the card's own width,
 * so the two can only move and scale together. See `POSTCARD.photo`.
 */
export default function Snapshot({ cardRatio }: SnapshotProps) {
  const { wide, x, y, level } = POSTCARD.photo;
  const { at, ms, scale, back } = POSTCARD.reveal;

  /* Where it starts from, worked out rather than written down - move the
     photograph and its hiding place moves with it.

     Both boxes are shares of the card's width, so the card's centre is at half
     of 100 across and half its own height down, and the photograph's is
     wherever `photo` put it. The difference is then restated in the
     PHOTOGRAPH's own box, because that is what a percentage in `translate` is
     a share of. */
  const tall = wide / SNAPSHOT.ratio;
  const cardTall = 100 / cardRatio;
  const fromX = ((50 - (x + wide / 2)) / wide) * 100;
  const fromY = ((cardTall / 2 - (y + tall / 2)) / tall) * 100;

  return (
    <div
      className="snapshot"
      style={
        {
          "--snap-wide": `calc(var(--wide) * ${(wide / 100).toFixed(4)})`,
          "--snap-ratio": SNAPSHOT.ratio,
          "--snap-x": `calc(var(--wide) * ${(x / 100).toFixed(4)})`,
          "--snap-y": `calc(var(--wide) * ${(y / 100).toFixed(4)})`,
          "--snap-level": `${level}deg`,
          "--snap-from-x": `${fromX.toFixed(2)}%`,
          "--snap-from-y": `${fromY.toFixed(2)}%`,
          "--snap-from-scale": scale,
          "--snap-at": `${at}ms`,
          "--snap-ms": `${ms}ms`,
          "--snap-back-ms": `${back}ms`,
        } as CssVars
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="snapshot__art"
        src={SNAPSHOT.src}
        alt="A photograph taped beneath the postcard"
        draggable={false}
        decoding="async"
      />
    </div>
  );
}
