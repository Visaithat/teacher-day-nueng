"use client";

import { type ReactNode, useState } from "react";

import { useTimers } from "@/hooks/use-timers";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";

interface BackButtonProps {
  /**
   * How long to spend putting the page away before the camera moves, in ms.
   *
   * Zero for the two pages with nothing standing beside the thing itself - they
   * have nothing to put away, so the press goes straight through.
   */
  retract?: number;
  /** Where pressing it goes. */
  onBack: () => void;
  /** What it says. The only thing the two scenes that use this disagree about. */
  children: ReactNode;
}

/**
 * The way off a scene standing on the cloth.
 *
 * Two of them use it and it says something different on each: the letters point
 * back at the present, and a thing out of an envelope points back at the letters.
 * That is the whole of the difference, so it is the whole of what is passed in.
 *
 * A button rather than a link, because the letters are a place in this page and
 * not a page of their own any more. That is not only a change of element: a link
 * had a default to fall back on, and every branch below that used to end by
 * simply letting it happen now has to say `onBack()` out loud. A button that
 * returns early does nothing at all.
 *
 * `retract` is the postcard's, and the reason this holds the move open at all.
 * The photograph lying beside it did NOT come out of the envelope, so it cannot
 * leave with the camera: it has to go back behind the card first, the same way
 * it came out from behind it. Everywhere else has nothing to put away and takes
 * the zero.
 *
 * While it is holding, `data-going` is on the button itself rather than on some
 * ancestor, so the state stays inside this component's own render and the
 * stylesheet reaches the photograph as a sibling.
 */
export default function BackButton({
  retract = 0,
  onBack,
  children,
}: BackButtonProps) {
  const { after } = useTimers();
  const [going, setGoing] = useState(false);

  function leave() {
    // Already on its way. First now, and not below the branch under it: that
    // branch used to hand off to the browser, which made the order harmless.
    if (going) return;

    // Nothing to put away, or a reader who has asked for less motion - in both
    // cases go at once. Asked now rather than remembered from mount, the way
    // every other decision about motion here is.
    if (!retract || prefersReducedMotion()) {
      onBack();
      return;
    }

    setGoing(true);
    after(retract, onBack);
  }

  return (
    <button
      type="button"
      className="cloth__back"
      data-going={going ? "" : undefined}
      onClick={leave}
    >
      {children}
    </button>
  );
}
