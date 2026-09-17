import type { Content, Letter } from "@/types/mails";

/** Where pressing one of the things inside an envelope goes. */
export function contentHref(letter: Letter, item: Content) {
  return `/mails/${letter.slug}/${item.slug}`;
}

/**
 * The one name a thing wears on both sides of the cut.
 *
 * Off the two slugs and nothing else, so the page being arrived at can work it
 * out from its own params without knowing the first thing about the deck the
 * reader came from.
 *
 * A `view-transition-name` is a custom-ident: it may not begin with a digit and
 * it may not contain a dot. That is a constraint on the SLUGS, which is why
 * this lives down here beside them rather than in whichever component happened
 * to need it first.
 */
export function contentView(person: string, item: string) {
  return `mail-${person}-${item}`;
}
