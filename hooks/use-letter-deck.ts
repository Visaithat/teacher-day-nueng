"use client";

import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { DECK } from "@/lib/constants/mail-deck";
import { CALM_SEAL_MS, LEAVE_MS, SEAL_MS } from "@/lib/constants/mail-timing";
import { contentHref } from "@/lib/utils/mail-routes";
import type { Content, Letter } from "@/types/mails";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import type { LetterDeck, LetterDeckOptions } from "@/types/letter-deck";

import { useSceneMemory } from "./use-scene-memory";
import { useTimers } from "./use-timers";

/**
 * The deck of letters: which one is in front, the four ways a reader changes
 * that, and what happens when a seal is pressed.
 *
 * The arrows are on the window rather than on an element, which is the one shape
 * that cannot be broken by focus moving somewhere unexpected. It can: the button
 * covering a letter is taken out of the document the moment that letter is open
 * and at the front, and whatever had focus goes with it — so a handler hanging
 * off the deck would go deaf exactly when a reader was using it.
 *
 * The drag writes one custom property straight to the scene node. React never
 * re-renders while the pointer is moving, and only `transform` answers it.
 */
export function useLetterDeck({
  letters,
  stageRef,
  live,
  onOpenLetter,
}: LetterDeckOptions): LetterDeck {
  /* Which letter is up and which seals are broken belong to the scene's memory
     in the layout, not to this hook: the reader follows a letter out to its own
     page and comes back, and coming back to letter one with the wax whole again
     is coming back to a different cloth than the one they left. Held there, not
     copied there — there is one of each, and this is where it is used.
     What a screen reader was last told does not outlive the page. It is about
     what just happened, and on a return visit nothing just happened. */
  const { seen, active, setActive, opened, setOpened } = useSceneMemory();
  const [announcement, setAnnouncement] = useState("");

  /* Which of the three is on its way out, if any. This one does NOT belong in
     the scene's memory: it is about a navigation that is in flight, and by the
     time the reader comes back it has already happened. A leaving slug that
     outlived the page would hand the deck a thing still floating away from an
     envelope nobody pressed. */
  const [leaving, setLeaving] = useState<string | null>(null);
  const router = useRouter();

  /* What was already open the moment this page mounted, held for as long as it
     lives. The scene's memory outlives the page and the page does not, so coming
     back from a letter hands every broken seal to a brand new element on its very
     first frame — and everything that breaks a seal and opens an envelope is a
     CSS animation, so the whole of it runs again from zero. The reader left an
     envelope open and is shown it being opened.
     State with no setter, which is the shape of the thing: a value read once, at
     the start, and never written again. A ref would say the same and say it
     wrong — refs are for what render must not read, and this is read on every
     render. Either way the point is that `useState` keeps only the value it was
     handed first, so the snapshot cannot drift as seals are broken here. */
  const [settled] = useState(opened);

  const { after, clear } = useTimers();
  /** The pointer travelled: the click that follows it is not a choice. */
  const dragged = useRef(false);
  /** The deck was changed from the keyboard, so the reader's place should follow. */
  const fromKey = useRef(false);
  /** Detaches a drag in progress. Held so an unmount can end one mid-gesture. */
  const release = useRef<(() => void) | null>(null);

  const last = letters.length - 1;

  /**
   * Bring a letter forward.
   *
   * Nothing happens inside the state updater. React runs updaters during render
   * and StrictMode runs them twice, so an announcement raised in there would be
   * raised twice in dev and once in production — a divergence that is harmless
   * only for exactly as long as the announcement stays idempotent.
   */
  const pick = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(last, index));
      if (next === active) return;
      const letter = letters[next];
      setActive(next);
      if (letter) {
        setAnnouncement(
          `Letter ${next + 1} of ${letters.length}, from ${letter.name}.`,
        );
      }
    },
    // The two setters come from the memory now rather than from a `useState`
    // here, so the linter can no longer see for itself that they never change.
    // They are the `useState` setters of the provider, held in a memo, so they
    // do not — listing them is free and keeps the rule honest.
    [active, last, letters, setActive],
  );

  const guardDrag = useCallback((event: { preventDefault: () => void }) => {
    if (dragged.current) event.preventDefault();
  }, []);

  /** A click that came at the end of a drag was the drag stopping, not a choice. */
  const pickClick = useCallback(
    (index: number) => {
      if (dragged.current) return;
      pick(index);
    },
    [pick],
  );

  const open = useCallback(
    (index: number) => {
      // Same guard the picking has, and for the same reason: a swipe that starts
      // on the wax seal and ends on it still raises a click, and opening a letter
      // is not something to do to someone who was only pushing the deck along.
      if (dragged.current) return;
      const letter = letters[index];
      if (!letter || opened.has(letter.id)) return;
      setOpened((current) => new Set(current).add(letter.id));
      setAnnouncement(`The seal is broken on the letter from ${letter.name}.`);
      // Asked now rather than remembered from mount: the reader may have changed
      // their mind about motion since the page loaded, and the stylesheet — which
      // answers a live media query — would already have changed with them.
      const calm = prefersReducedMotion();
      after(calm ? CALM_SEAL_MS : SEAL_MS, () => onOpenLetter?.(letter.id));
    },
    [after, letters, onOpenLetter, opened, setOpened],
  );

  /**
   * Following one of the three things out of the envelope.
   *
   * The element stays a real `<Link>` and only its default is prevented, which
   * is the whole reason this is a handler and not a button: `<Link>` prefetches
   * the six prerendered pages as they come into view, gives a real href to a
   * middle click and to "copy link address", and `router.push` afterwards
   * lands on the prefetch it already made. Without that the destination
   * suspends, the two halves of the thing never meet in one commit, and the
   * morph quietly degrades into a fade.
   *
   * Curried by letter so the component below can hand one item to it and keep
   * its own props simple.
   */
  const follow = useCallback(
    (letter: Letter, item: Content) => (event: MouseEvent<HTMLAnchorElement>) => {
      // The swipe guard first and unchanged: a click that came at the end of a
      // drag was the drag stopping, not a choice.
      guardDrag(event);
      if (event.defaultPrevented) return;

      // Everything that is not a plain left click belongs to the browser. A new
      // tab is not a camera move, and a reader who asked for one should get one
      // — which means leaving the href alone and doing nothing here.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      // Already on its way. A second press would arm a second float and a
      // second push, and the two would arrive as one confused transition.
      if (leaving) return;

      const href = contentHref(letter, item);
      setAnnouncement(`Opening the ${item.label} from ${letter.name}.`);

      // Asked now rather than remembered from mount, the same way `open` does
      // it: the reader may have changed their mind about motion since the page
      // loaded, and the stylesheet — which answers a live media query — would
      // already have changed with them. Nothing floats under reduce, so there
      // is nothing to hold the push back for.
      const calm = prefersReducedMotion();
      if (calm) {
        router.push(href, { transitionTypes: ["pan-up"] });
        return;
      }

      setLeaving(item.slug);
      // Into the same list the seal's timer goes into, which the unmount below
      // drains — so a push that races a reader pressing Back cannot fire into a
      // component that is no longer there.
      after(LEAVE_MS, () =>
        router.push(href, { transitionTypes: ["pan-up"] }),
      );
    },
    [after, guardDrag, leaving, router],
  );

  /* --- the arrows ---------------------------------------------------------- */

  useEffect(() => {
    if (!live) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const step =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      const jump = event.key === "Home" ? 0 : event.key === "End" ? last : null;
      if (!step && jump === null) return;
      const next = Math.max(0, Math.min(last, jump ?? active + step));
      // Nothing to go to. Leave the key alone — the page may want to scroll —
      // and above all do not arm the follow below for a move that never happens,
      // or the next click of a mouse would drag the reader's place with it.
      if (next === active) return;
      event.preventDefault();
      fromKey.current = true;
      pick(next);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, last, live, pick]);

  /**
   * The keyboard moved the deck, so the reader's place moves with it — otherwise
   * focus is left on the letter that has gone behind, and it is the letter now
   * in front that answers Enter.
   *
   * The letter it lands on may have no button at all, if that one is already
   * open. So the scene itself is the fallback: it takes focus rather than
   * letting it fall to the body, and a reader keeps a place inside the thing
   * they are reading. preventScroll, because the deck is wider than the window
   * and focusing would drag it sideways.
   */
  useEffect(() => {
    if (!fromKey.current) return;
    fromKey.current = false;
    const stage = stageRef.current;
    const target = stage?.querySelector<HTMLButtonElement>(
      '.mails__letter[data-pos="front"] .letter__target',
    );
    (target ?? stage)?.focus({ preventScroll: true });
  }, [active, stageRef]);

  /* --- the drag ------------------------------------------------------------ */

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!live || event.button !== 0) return;
      const stage = stageRef.current;
      const startX = event.clientX;
      dragged.current = false;

      const move = (moveEvent: globalThis.PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        if (!dragged.current && Math.abs(dx) > DECK.slop) {
          dragged.current = true;
          stage?.setAttribute("data-drag", "on");
        }
        // Straight to the node: nothing here is worth a render, and the deck must
        // not lag the finger.
        if (dragged.current) stage?.style.setProperty("--drag-x", `${dx}px`);
      };

      const detach = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        stage?.removeAttribute("data-drag");
        stage?.style.removeProperty("--drag-x");
        release.current = null;
      };

      function up(upEvent: globalThis.PointerEvent) {
        const wasDragged = dragged.current;
        detach();
        const dx = upEvent.clientX - startX;
        if (wasDragged && Math.abs(dx) > DECK.flick) {
          pick(active + (dx < 0 ? 1 : -1));
        }
        // Cleared a task later, so the click this pointer-up is about to raise
        // still sees that it came at the end of a drag. Tracked, because an
        // unmount in between would otherwise leave it to fire into nothing.
        after(0, () => {
          dragged.current = false;
        });
      }

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      release.current = detach;
    },
    [active, after, live, pick, stageRef],
  );

  /* --- waking, and going --------------------------------------------------- */

  // The deck comes alive: say what is there and how to work it, once. A task
  // later, so nothing is set synchronously out of an effect — and so a live
  // region that has only just been rendered is given the beat it needs to be
  // noticed changing.
  //
  // Coming back from a letter's own page is not the deck coming alive, it is the
  // reader returning to a deck that never went anywhere — and `live` is true from
  // the first frame there, so the full instructions would be read out again every
  // single time. They get their place back instead, which is the one thing that
  // has changed for them.
  useEffect(() => {
    if (!live) return;
    const letter = letters[seen ? active : 0];
    if (!letter) return;
    const timer = window.setTimeout(() => {
      setAnnouncement(
        seen
          ? `Back on the cloth. Letter ${active + 1} of ${letters.length}, from ` +
              `${letter.name}.`
          : `${letters.length} letters are on the cloth. Letter 1, from ` +
              `${letter.name}. Use the left and right arrow keys to browse them, ` +
              `then press Enter to open the one in front.`,
      );
    }, 0);
    return () => window.clearTimeout(timer);
    // The letter in front is read once, when the deck wakes. It is not a
    // dependency: moving through the deck has its own announcement, and listing
    // it here would have this one talk over that one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, letters, seen]);

  // A drag holds three listeners on the window, and they are removed by the
  // pointer coming up. If the scene goes first — a navigation, or a reload in
  // dev while the pointer is down — nothing else would ever take them off.
  useEffect(
    () => () => {
      release.current?.();
      clear();
    },
    [clear],
  );

  return {
    active,
    opened,
    settled,
    announcement,
    leaving,
    pick: pickClick,
    open,
    follow,
    deckHandlers: { onPointerDown },
  };
}
