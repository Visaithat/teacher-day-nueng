import Link from "next/link";
/* From the App Router's React, which is a canary and has it. `node_modules/react`
   is 19.2.8 stable and does NOT export ViewTransition. */
import { ViewTransition } from "react";

import type { CssVars } from "@/types/css-vars";
import { PAN } from "@/lib/constants/mail-transition";
import { contentView } from "@/lib/utils/mail-routes";
import type { Content, Letter } from "@/types/mails";
import { STANDS } from "@/lib/constants/kept";
import Tape from "./tape";
import Wish from "./wish";

/** Where the thing stands on this page, in the window's own units. */
function standVars(item: Content): CssVars {
  const stand = STANDS[item.slug];
  return {
    "--wide": stand?.wide ?? "min(80vw, 40rem)",
    "--ratio": item.ratio,
    "--level": `${stand?.level ?? 0}deg`,
    "--gap": stand?.gap ?? "0rem",
  } as CssVars;
}

/**
 * One thing out of one envelope, opened.
 *
 * The frame all three share, because all three are the same page with a
 * different object on it: the cloth they were already standing on, the way
 * back, and the thing itself waiting where the camera left it.
 *
 * TWO THINGS ARE WRAPPED AND THE DIFFERENCE MATTERS.
 *
 * The thing itself is named, so it is the one piece of the page that does not
 * arrive with the page — it crossed from the envelope, and the reader watched
 * it. Anything written ON it goes inside that wrapper, or it would travel with
 * the room instead and come loose from the paper halfway over.
 *
 * Everything else is inside the pan, which arrives a beat later. A tape deck is
 * furniture and not the tape: it belongs to the room, and the two hundred
 * milliseconds the camera still has to run after the cassette has landed is
 * exactly when it should turn up.
 *
 * A server component. Only the transport underneath is a client module, so this
 * page goes on being rendered on the server with its `generateStaticParams` and
 * its `generateMetadata` untouched.
 */
export default function Kept({
  letter,
  content,
}: {
  letter: Letter;
  content: Content;
}) {
  return (
    <ViewTransition enter={PAN} exit={PAN} default="none">
      <main
        className="cloth__page kept"
        data-kept={content.slug}
        aria-labelledby="kept-title"
        style={standVars(content)}
      >
        <h1 id="kept-title" className="sr-only">
          {content.label} from {letter.name}
        </h1>

        {/* Back the way the reader came, and reversed rather than repeated:
            the same pan, the other way up. */}
        <Link
          href="/mails"
          className="cloth__back"
          transitionTypes={["pan-down"]}
        >
          Back to the letters
        </Link>

        <ViewTransition
          name={contentView(letter.slug, content.slug)}
          share="morph"
          default="none"
        >
          <div className="kept__hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="kept__art"
              src={content.src}
              alt=""
              draggable={false}
            />
            {content.slug === "letter" ? <Wish letter={letter} /> : null}
          </div>
        </ViewTransition>

        {content.slug === "cassette" ? (
          <Tape song={letter.song} from={letter.name} />
        ) : null}
      </main>
    </ViewTransition>
  );
}
