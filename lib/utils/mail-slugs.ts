import { CONTENTS } from "@/lib/constants/mail-art";
import { LETTERS } from "@/lib/constants/mail-letters";
import type { Content, Letter } from "@/types/mails";

/**
 * The one name a thing wears on both sides of the cut.
 *
 * Off the two slugs and nothing else, so the scene being arrived at can work it
 * out without knowing the first thing about the deck the reader came from.
 *
 * A `view-transition-name` is a custom-ident: it may not begin with a digit and
 * it may not contain a dot. That is a constraint on the SLUGS, which is why
 * this lives down here beside them rather than in whichever component happened
 * to need it first.
 */
export function contentView(person: string, item: string) {
  return `mail-${person}-${item}`;
}

/**
 * The pair of things a person's slug and a thing's slug stand for, if they name
 * a real one of each.
 *
 * The card has one URL now, so this is not a route being resolved: it is the
 * history entry being read back. `history.state` survives a reload, and a reader
 * who reloads is arriving rather than returning - so the mark left there may
 * name a letter this page has never built. Everything is checked, and a pair
 * that does not resolve is simply not one the card will answer to.
 */
export function keptOf(person: string, item: string) {
  const letter = LETTERS.find((one) => one.slug === person);
  const content = CONTENTS.find((one) => one.slug === item);
  if (!letter || !content) return null;
  return { letter, content } satisfies { letter: Letter; content: Content };
}
