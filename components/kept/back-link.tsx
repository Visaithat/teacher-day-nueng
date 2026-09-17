"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";

import { useTimers } from "@/hooks/use-timers";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";

interface BackLinkProps {
  /**
   * How long to spend putting the page away before the camera moves, in ms.
   *
   * Zero for the two pages with nothing standing beside the thing itself - they
   * have nothing to put away, so the link stays an ordinary link and the browser
   * does the navigating.
   */
  retract?: number;
}

/**
 * The way back to the letters.
 *
 * A client component only because of `retract`. The postcard has a photograph
 * lying beside it that did NOT come out of the envelope, so it cannot simply
 * leave with the camera: it has to go back behind the card first, the same way
 * it came out from behind it. That means holding the navigation open for a beat,
 * which is what the letter deck already does on the way in - see the `follow`
 * callback in `use-letter-deck.ts`.
 *
 * While it is holding, `data-going` is on the link itself rather than on some
 * ancestor, so the state stays inside this component's own render and the
 * stylesheet reaches the photograph as a sibling.
 */
export default function BackLink({ retract = 0 }: BackLinkProps) {
  const router = useRouter();
  const { after } = useTimers();
  const [going, setGoing] = useState(false);

  function leave(event: MouseEvent<HTMLAnchorElement>) {
    // Nothing to put away, or a reader who has asked for less motion - in both
    // cases the link does what a link does. Asked now rather than remembered
    // from mount, the way every other decision about motion here is.
    if (!retract || prefersReducedMotion()) return;
    event.preventDefault();
    if (going) return;
    setGoing(true);
    after(retract, () =>
      router.push("/mails", { transitionTypes: ["pan-down"] }),
    );
  }

  return (
    <Link
      href="/mails"
      className="cloth__back"
      transitionTypes={["pan-down"]}
      data-going={going ? "" : undefined}
      onClick={leave}
    >
      Back to the letters
    </Link>
  );
}
