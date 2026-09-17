import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Kept from "@/components/kept/kept";
import { CONTENTS } from "@/lib/constants/mail-art";
import { LETTERS } from "@/lib/constants/mail-letters";

type Params = { person: string; item: string };

/**
 * The six of them, prerendered at build time like every other page on this card.
 * Two people times the three things in an envelope — and if either list grows,
 * the routes grow with it and nothing here has to be told.
 */
export function generateStaticParams(): Params[] {
  return LETTERS.flatMap((letter) =>
    CONTENTS.map((item) => ({ person: letter.slug, item: item.slug })),
  );
}

function look({ person, item }: Params) {
  return {
    letter: LETTERS.find((one) => one.slug === person),
    content: CONTENTS.find((one) => one.slug === item),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { letter, content } = look(await params);
  if (!letter || !content) return {};
  return {
    title: `${content.label} from ${letter.name}`,
    description: `What was inside ${letter.name}'s envelope`,
  };
}

/**
 * One thing out of one envelope, opened.
 *
 * It stands on the same `.cloth` the mail scene does rather than on a
 * background of its own, so arriving here is a page turn and not a change of
 * place — and the cloth is literally the same element, held in the layout both
 * routes share, so it does not so much as flicker on the way.
 *
 * A person and a thing that do not exist together is a 404 rather than an empty
 * room — the six real combinations are the only ones this page will answer to,
 * and a typed URL should say so.
 *
 * The way back is a Link and not a `router.back()`. Back is wherever the reader
 * came from, which for anyone who was handed this URL is not the cloth at all;
 * this always goes to the letters. And it is the same client-side move the
 * browser's own Back makes, so it lands the reader in the scene they left —
 * still poured, still on the letter they opened — rather than starting the
 * whole opening over. That memory is in `mails/layout.tsx`, which this page
 * shares with the deck.
 *
 * What is actually drawn is in `_kept/`, and all three slugs share it: this
 * file is the route, the six names it answers to, and nothing else.
 */
export default async function ContentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { letter, content } = look(await params);
  if (!letter || !content) notFound();

  return <Kept letter={letter} content={content} />;
}
