import type { Metadata } from "next";
/* From the App Router's React, which is a canary and has it. */
import { ViewTransition } from "react";

import Mails from "@/components/mails/mails";
import { PAN } from "@/lib/constants/mail-transition";

export const metadata: Metadata = {
  title: "Mails, Teacher Nueng",
  description: "Letters laid out on the cloth",
};

/**
 * /mails — a page of its own, off the card's four-page run.
 *
 * Nothing carries the reader here: no light lifts off it, so the cloth settling
 * is the whole entry. It stands on the same gingham the selection page does,
 * from `_cloth/cloth.css` — one cloth, so the two can never drift apart. The
 * cloth itself belongs to the layout rather than to this page, so that opening
 * one of the things inside an envelope does not take the ground down with the
 * scene; see the note there.
 *
 * The scene itself is a client component sitting beside this file: Next only ever
 * serves `page.tsx` out of a route folder, so the rest of the scene is free to
 * live here with it rather than off in a private folder of its own.
 */
export default function MailsPage() {
  return (
    /* The scene's half of the cut. Pressing one of the things inside an
       envelope pans the camera up, and this is the page that travels down out
       from under it. */
    <ViewTransition enter={PAN} exit={PAN} default="none">
      <main className="cloth__page" aria-labelledby="mails-title">
        <Mails />
      </main>
    </ViewTransition>
  );
}
