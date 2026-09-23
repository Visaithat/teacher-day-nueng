"use client";

/* `addTransitionType` comes from the App Router's React, which is a canary and
   has it - the same copy `ViewTransition` is imported from. It is what a
   `<Link transitionTypes>` used to call on this hook's behalf. */
import {
  addTransitionType,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";

import { markOf, placeOf } from "@/lib/utils/card-place";
import type { CardPlace, Place } from "@/types/card-place";
import type { Content, Letter } from "@/types/mails";

/**
 * Where the reader is standing, and the two camera moves between those places.
 *
 * The card has one URL. What used to be a navigation is a state change here, and
 * the only thing lost with the router is the thing that made the camera move:
 * a `<Link transitionTypes>` named a view-transition type on its way past. So
 * this names one by hand, inside the Transition, and `travel.css` cannot tell
 * the difference - a `<ViewTransition>` answers any Transition and not only a
 * routed one.
 *
 * Back still works and the address bar still does not move: every forward step
 * pushes an entry at the SAME url, so the only thing that changes is the state
 * hanging off it, and a `popstate` reads that state back.
 *
 * MOUNT THIS ONLY ONCE THE LIGHT HAS LIFTED, never at the top of the card. The
 * listener below answers any `popstate`, and the welcome page has no business
 * answering one: a reader who reloads mid-card is put back on the welcome page
 * while the entries in front of them survive, and a Forward press would then
 * drop a cassette onto a card that has not been opened yet.
 */
export function useCardPlace(): CardPlace {
  /* Seeded from nothing, and NEVER from `history.state`. That is the invariant
     the paragraph above rests on: a mark left in the history belongs to a visit
     that is over, and this hook only ever reads one in answer to a live press
     of the Back button. */
  const [place, setPlace] = useState<Place>({ at: "selection" });

  /* The floor, laid on the entry the reader is actually standing on - which is
     this one, because nothing mounts this hook until the light has lifted.
     Stamping it does two jobs: it gives Back out of the letters a real mark to
     resolve rather than a fallback, and it scrubs whatever a previous visit may
     have left in this entry before any `popstate` can read it.

     Two arguments and no url, deliberately. Next patches `history.pushState`
     and `replaceState` to copy its own routing state into whatever is passed,
     and to dispatch an extra update if a url comes with it. Passing neither a
     url nor a spread of `history.state` is what keeps the entry carrying Next's
     `__NA` flag - and an entry without it makes Next answer the Back button
     with a full page reload instead of a traversal. */
  useEffect(() => {
    window.history.replaceState({ card: markOf({ at: "selection" }) }, "");
  }, []);

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const next = placeOf((event.state as { card?: unknown } | null)?.card);
      /* A Transition, so that a `<ViewTransition>` could answer it, and no
         transition type, so that `PAN` resolves to `none` if one ever does:
         a Back button did not ask for a camera move.

         IT DOES NOT ANIMATE TODAY, and that is measured rather than assumed.
         Next listens for `popstate` as well and traverses its own router for
         the same url, and nothing scheduled around that tick - inside it, or a
         task after it - opens a view transition of ours: `startViewTransition`
         is never reached, with or without a type. So Back and Forward cut
         rather than morph. Both scenes are correct on the other side of the
         cut, which is why this is a blemish and not a bug, and the way back a
         reader is actually offered - the button on the cloth - pans and morphs
         properly because it is an ordinary press. Worth another look whenever
         React's view transitions and the App Router's history handling settle. */
      startTransition(() => setPlace(next));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /**
   * Somewhere else, and how the camera gets there.
   *
   * The entry is pushed first and the move made second, which is the order a
   * router uses: the history is a fact about where the reader is, and the
   * transition is only how long it takes to look like it.
   */
  const go = useCallback((next: Place, camera?: "pan-up" | "pan-down") => {
    window.history.pushState({ card: markOf(next) }, "");
    startTransition(() => {
      if (camera) addTransitionType(camera);
      setPlace(next);
    });
  }, []);

  const toMails = useCallback(() => go({ at: "mails" }), [go]);

  /* The record has a page of its own, and the camera treats it the way it
     treats a thing out of an envelope: the reader picked something up, so the
     card follows it up rather than cutting to it. */
  const toSong = useCallback(() => go({ at: "song" }, "pan-up"), [go]);

  /* A push and not a `history.back()`, for the reason `toLetters` gives below:
     a `back()` arrives as a `popstate`, which carries no type on purpose, and
     the pan down would be lost with it. */
  const fromSong = useCallback(() => go({ at: "selection" }, "pan-down"), [go]);

  const toPresent = useCallback(() => go({ at: "selection" }), [go]);

  const openKept = useCallback(
    (letter: Letter, content: Content) =>
      go({ at: "kept", letter, content }, "pan-up"),
    [go],
  );

  /* A push and not a `history.back()`, which is the same choice the way back
     made when it was a link: back is wherever the reader came from, and this
     always goes to the letters. A `back()` would arrive as a `popstate` as well,
     which carries no type on purpose - and the pan down would be lost with it. */
  const toLetters = useCallback(() => go({ at: "mails" }, "pan-down"), [go]);

  return { place, toMails, toSong, fromSong, toPresent, openKept, toLetters };
}
