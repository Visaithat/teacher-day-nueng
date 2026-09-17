import type { ReactNode } from "react";

import SceneMemoryProvider from "@/providers/scene-memory-provider";

/**
 * /mails and everything under it.
 *
 * Two things live here, and both are here for the same reason: Next keeps a
 * layout across a move between its own child routes, so what is held in one
 * survives a navigation that takes the page down.
 *
 * The first is the scene's memory — the deck is still poured and the seal still
 * broken when the reader comes back from a letter, a postcard or a cassette.
 *
 * The second is THE GROUND. The cloth used to be each page's own `<main>`, which
 * meant every move between these routes threw one gingham away and built
 * another — and a fresh `.cloth` runs `cloth-settle`, scaling 1.06 down to 1
 * over 1100ms. On a cut where the whole point is that the camera moves and the
 * floor does not, the floor was the one thing visibly moving. Held here it is
 * the same element before and after: there is nothing to snapshot, nothing to
 * animate, and nothing to agree about.
 *
 * What a page brings is what is standing on the cloth, and that is its own
 * `<main className="cloth__page">`.
 *
 * A server component, still. Only the provider is a client module, so the item
 * page underneath goes on being rendered on the server with its
 * `generateStaticParams` and its `generateMetadata` untouched.
 */
export default function MailsLayout({ children }: { children: ReactNode }) {
  return (
    <SceneMemoryProvider>
      <div className="cloth">{children}</div>
    </SceneMemoryProvider>
  );
}
