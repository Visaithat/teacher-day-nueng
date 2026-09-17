"use client";

import Home from "@/components/home/home";
import { HOME_ASSEMBLE_MS, HOME_SOURCES } from "@/lib/constants/home";
import Mailbox from "@/components/mailbox/mailbox";
import Selection from "@/components/selection/selection";
import RevealLight from "@/components/stage/reveal-light";
import { useCardStage } from "@/hooks/use-card-stage";
import { useReveal } from "@/hooks/use-reveal";
import Welcome from "@/components/welcome/welcome";

/**
 * The card has four pages. This is the only place that knows about all of them:
 * the welcome page is clicked away, the home page assembles in its place, the
 * mail box waits one scroll below it, and opening the present inside turns the
 * screen to light and leaves the first three behind for good.
 */
export default function Page() {
  const { leaving, showSecond, assembled, open } = useCardStage({
    preload: HOME_SOURCES,
    assembleMs: HOME_ASSEMBLE_MS,
  });
  const { phase, burst, calm, begin } = useReveal();

  if (!showSecond) return <Welcome leaving={leaving} onOpen={open} />;

  const deckShown = phase === "before" || phase === "flooding";
  const selectionShown = phase === "clearing" || phase === "after";
  const lightShown = phase === "flooding" || phase === "clearing";

  // The light is a sibling of both pages and keyed, so React keeps it mounted —
  // and mid-animation — across the one commit where the pages under it are
  // swapped. Move it inside either of them and it restarts, or gets clipped.
  return (
    <>
      {deckShown ? (
        <main className="deck" key="deck" inert={phase === "flooding"}>
          <Home settled={assembled} />
          <Mailbox onOpenPresent={begin} />
        </main>
      ) : null}

      {selectionShown ? <Selection key="selection" /> : null}

      {lightShown ? (
        <RevealLight key="light" phase={phase} calm={calm} style={burst} />
      ) : null}
    </>
  );
}
