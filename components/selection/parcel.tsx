"use client";

import type { CssVars } from "@/types/css-vars";
import {
  HINT_ARROW_ART,
  PARCEL_ART,
  PARCEL_LETTERS_ART,
} from "@/lib/constants/selection";

interface ParcelProps {
  /** Open the letters. */
  onOpen: () => void;
}

/**
 * The box the letters are waiting in, and the way into the mail scene.
 *
 * The box is the button - nothing on this page says so more plainly than a box
 * standing with its flaps already open. A button and not a link, because there
 * is nowhere to link to: the letters are a place in this page rather than a
 * page of their own.
 *
 * The button is around the artwork alone. The words naming it sit up and to the
 * right with a hand's width of cloth between, and one control around both would
 * carry a box over a third of the scene — a press on the bare gingham in the
 * middle of it would open the letters. So the words are a sibling, and being
 * outside the button they are a real paragraph again rather than the `span` a
 * button's phrasing-content-only rule forced them to be. `aria-describedby`
 * ties them back to the control, which is the one thing being a descendant
 * used to give for free.
 */
export default function Parcel({ onOpen }: ParcelProps) {
  return (
    <div
      className="parcel"
      style={
        {
          "--box-ratio": `${PARCEL_ART.ratio}`,
          "--arrow-ratio": `${HINT_ARROW_ART.ratio}`,
        } as CssVars
      }
    >
      <button
        type="button"
        className="parcel__press"
        onClick={onOpen}
        aria-label="Read the letters waiting for you"
        aria-describedby="parcel-hint"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="parcel__art"
          src={PARCEL_ART.src}
          alt=""
          draggable={false}
        />

        {/* The letters, waiting below the rim until someone leans in. Laid over
            the box on the same canvas, so nothing has to be lined up by hand -
            they were cut out of this very drawing.

            The slot around them is what hides them, and it has to be a separate
            element: a transform carries an element's clipping region along with
            it, so letters that held their own window would take it down with
            them and never go behind anything. The slot stays put; they move. */}
        <span className="parcel__slot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="parcel__letters"
            src={PARCEL_LETTERS_ART.src}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </span>
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="parcel__hint-arrow"
        src={HINT_ARROW_ART.src}
        alt={HINT_ARROW_ART.alt}
        aria-hidden="true"
        draggable={false}
      />

      {/* Two lines, broken where the card breaks them. */}
      <p className="parcel__hint" id="parcel-hint">
        Read these
        <br />
        mails
      </p>
    </div>
  );
}
