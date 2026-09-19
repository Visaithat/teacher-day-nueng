"use client";

import Kept from "@/components/kept/kept";
import Mails from "@/components/mails/mails";
import Selection from "@/components/selection/selection";
import { useCardPlace } from "@/hooks/use-card-place";
import SceneMemoryProvider from "@/providers/scene-memory-provider";

/**
 * Everything behind the light, and the camera moves between the three of them.
 *
 * These used to be a page and two routes. They are one branch of one component
 * now, and this file is the whole of what the router was doing for them: which
 * one is standing, what carries the reader from one to the next, and what is
 * held still underneath while that happens.
 *
 * It is mounted only once the light has lifted, and that is not tidiness. The
 * place is kept in the browser's history so that Back still works, and a
 * listener for that must not exist while the reader is still on the welcome
 * page - see the note in `use-card-place.ts`.
 *
 * THE MEMORY IS OUTSIDE ALL THREE. Both ways out of the letters are one press -
 * the way back to the present as much as the way into an envelope - so the scene
 * is torn down and rebuilt often, and a deck that had to be poured again each
 * time would make a seven-second animation the price of a mistaken click. Held
 * here, above even the selection page, it simply never dies until the reader
 * reloads. See `types/scene-memory.ts` for why that is the right lifetime.
 *
 * THE GROUND IS NOT IN THE CUT. The cloth under the letters and under a thing
 * out of an envelope is one element held across the swap, so that a move where
 * the whole point is that the camera travels and the floor does not cannot run
 * `cloth-settle` underneath it. The selection page keeps a cloth of its own, so
 * arriving at the letters from it builds a fresh one and the settle IS the
 * entry - which is exactly what a navigation to the old `/mails` did.
 *
 * Each scene carries its own `<ViewTransition>`; neither is on the cloth they
 * share, because a wrapper that is kept never fires enter or exit. And they are
 * two conditional slots with keys rather than one slot with two branches: given
 * the same position and no key, React would reconcile the two wrappers as one
 * element and call it an update, which falls through to `default: "none"` and
 * cuts hard with no error anywhere.
 */
export default function CardPlace() {
  const { place, toMails, toPresent, openKept, toLetters } = useCardPlace();

  return (
    <SceneMemoryProvider>
      {place.at === "selection" ? (
        <Selection key="selection" onOpenMails={toMails} />
      ) : (
        <div className="cloth">
          {place.at === "mails" ? (
            <Mails key="mails" onOpenKept={openKept} onBack={toPresent} />
          ) : null}

          {place.at === "kept" ? (
            <Kept
              key="kept"
              letter={place.letter}
              content={place.content}
              onBack={toLetters}
            />
          ) : null}
        </div>
      )}
    </SceneMemoryProvider>
  );
}
