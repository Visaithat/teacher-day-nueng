/**
 * The letters themselves - who each is from, what she wrote, and the song that
 * goes with it - and the manifest of every picture the scene needs.
 *
 * Kept apart from `mail-art.ts` because this is content and that is geometry:
 * the words change often and the measurements almost never.
 */

import {
  ARROW,
  CONTENTS,
  ENVELOPE,
  NAME_CARD,
  OPEN_BACK,
  OPEN_FRONT,
  ROSE,
  SEAL,
  SUNFLOWER,
} from "@/lib/constants/mail-art";
import type { Letter } from "@/types/mails";

export const LETTERS: Letter[] = [
  {
    id: 1,
    slug: "one",
    prefix: "NAMPHEUNG",
    name: "Souphonesili",
    surname: "KEOMANT",
    colour: "red",
    seal: "pink",
    flower: ROSE,
    wish: [
      "It has been such a long time. Every",
      "time someone says the word teacher,",
      "it is still your face I see first.",
      "",
      "Thank you for the patience you spent",
      "on me before I had earned it, and for",
      "making a classroom feel like a safe",
      "place to be wrong in.",
      "",
      "Happy Teacher's Day. I hope this year",
      "is gentle with you, and that someone",
      "looks after you the way you looked",
      "after all of us.",
    ],
    signed: "With love, Nampheung",
    song: {
      kind: "youtube",
      id: "BssOsrPgxWg",
      title: "About You",
      by: "The 1975",
    },
    postcard: {
      from: "Nampheung",
      address: ["Teacher Nueng", "wherever this finds you"],
      note: [
        "I took the long way round",
        "to say this, and then the",
        "card took longer still.",
        "",
        "Every room I have been",
        "taught in since has been",
        "measured against yours.",
        "",
        "Still your student.",
      ],
    },
  },
  {
    id: 2,
    slug: "two",
    prefix: "ANNE",
    name: "Anida",
    surname: "THONGVANH",
    colour: "blue",
    seal: "silver",
    flower: SUNFLOWER,
    wish: [
      "I do not think you ever knew how much",
      "you did. You were never only teaching",
      "the lesson on the board — you were",
      "teaching us that someone believed we",
      "would get there.",
      "",
      "Thank you for the second chances, and",
      "for never once making any of us feel",
      "small.",
      "",
      "Happy Teacher's Day, Teacher Nueng.",
      "Wherever we end up, a piece of you",
      "comes with us.",
    ],
    signed: "Always yours, Anne",
    song: {
      kind: "youtube",
      id: "cL4uhaQ58Rk",
      title: "Lost Stars",
      by: "Adam Levine",
    },
    postcard: {
      from: "Anne",
      address: ["Teacher Nueng", "with love, still"],
      note: [
        "I kept putting this off",
        "waiting for better words.",
        "There are none, so here",
        "are the ordinary ones -",
        "",
        "thank you. I remember",
        "all of it, even the parts",
        "you have surely forgotten.",
        "",
        "See you soon, I hope.",
      ],
    },
  },
];

/** Every image the scene needs before it can play its opening. */
export const MAIL_SOURCES: readonly string[] = [
  ENVELOPE.src,
  OPEN_BACK.src,
  OPEN_FRONT.src,
  ...CONTENTS.map((item) => item.src),
  NAME_CARD.src,
  SEAL.src,
  ...LETTERS.map((letter) => letter.flower.src),
  /* Not shown until the envelope is open, but fetched with the rest: it arrives
     as a mask, and a mask that has not loaded is not a blank arrow — it is no
     mask at all, which paints the whole box in ink. */
  ARROW.src,
];
