/** The deck of letters on the cloth: which is up, and what may be done to it. */

import type { PointerEvent, RefObject } from "react";

import type { Content, Letter } from "@/types/mails";

export type LetterDeck = {
  /** Which letter is in front. */
  active: number;
  /** The ids of the letters whose seals have been broken. */
  opened: ReadonlySet<number>;
  /**
   * The ids of the letters that were already open when this page arrived — the
   * ones whose opening belongs to a visit that is over. It never grows: a seal
   * broken here and now is not one of these, however long the reader stays.
   */
  settled: ReadonlySet<number>;
  /** What a screen reader is told about the deck, politely. */
  announcement: string;
  /** Bring a letter to the front. */
  pick: (index: number) => void;
  /** Break the front letter's seal. */
  open: (index: number) => void;
  /**
   * The slug of the thing on its way out of the front envelope, or null.
   *
   * One at a time and never two: the whole of the leaving is keyed off this,
   * and two things leaving at once would be two view transitions fighting over
   * one name.
   */
  leaving: string | null;
  /**
   * Put on each of the three things inside the front envelope. Guards the click
   * against a swipe, holds the move back for as long as the thing takes to
   * float, and then makes it.
   */
  follow: (letter: Letter, item: Content) => () => void;
  /** The swipe belongs to the deck: it starts on a letter, not on the furniture. */
  deckHandlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  };
};

export type LetterDeckOptions = {
  letters: Letter[];
  /** The scene. The drag offset is written straight onto this node. */
  stageRef: RefObject<HTMLElement | null>;
  /** The deck answers nothing until the opening is over. */
  live: boolean;
  /** A seal has finished breaking. Nothing listens yet. */
  onOpenLetter?: (id: number) => void;
  /** One of the three things has been followed out of its envelope. */
  onOpenKept: (letter: Letter, content: Content) => void;
};
