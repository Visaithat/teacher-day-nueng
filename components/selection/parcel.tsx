import Link from "next/link";

import { HINT_ARROW_ART, PARCEL_ART } from "@/lib/constants/selection";

/**
 * The box the letters are waiting in, and the way into `/mails`.
 *
 * The whole box is the link — nothing on this page says so more plainly than a
 * box standing with its flaps already open.
 */
export default function Parcel() {
  return (
    <Link
      href="/mails"
      className="parcel"
      aria-label="Read the letters waiting for you"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="parcel__art"
        src={PARCEL_ART.src}
        alt=""
        draggable={false}
      />

      <p className="parcel__hint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="parcel__hint-arrow"
          src={HINT_ARROW_ART.src}
          alt={HINT_ARROW_ART.alt}
          aria-hidden="true"
          draggable={false}
        />
        <span className="parcel__hint-label">Read these mails</span>
      </p>
    </Link>
  );
}
