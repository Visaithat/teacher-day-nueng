"use client";

import { HINT_ARROW_ART, PARCEL_ART } from "@/lib/constants/selection";

interface ParcelProps {
  /** Open the letters. */
  onOpen: () => void;
}

/**
 * The box the letters are waiting in, and the way into the mail scene.
 *
 * The whole box is the button - nothing on this page says so more plainly than a
 * box standing with its flaps already open.
 *
 * A button and not a link, because there is nowhere to link to: the letters are
 * a place in this page rather than a page of their own. The hint below the art
 * is a `span` for the same reason - a button may only contain phrasing content,
 * and the paragraph it used to be is not legal inside one.
 */
export default function Parcel({ onOpen }: ParcelProps) {
  return (
    <button
      type="button"
      className="parcel"
      onClick={onOpen}
      aria-label="Read the letters waiting for you"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="parcel__art"
        src={PARCEL_ART.src}
        alt=""
        draggable={false}
      />

      <span className="parcel__hint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="parcel__hint-arrow"
          src={HINT_ARROW_ART.src}
          alt={HINT_ARROW_ART.alt}
          aria-hidden="true"
          draggable={false}
        />
        <span className="parcel__hint-label">Read these mails</span>
      </span>
    </button>
  );
}
