"use client";

import { HOME_ASSEMBLE_MS, Home } from "./_home/home";
import { HOME_SOURCES } from "./_home/home-data";
import { useCardStage } from "./_stage/use-card-stage";
import { Welcome } from "./_welcome/welcome";

/**
 * The card has two pages. This is the only place that knows about both: the
 * welcome page is clicked away, and the home page assembles in its place.
 */
export default function Page() {
  const { leaving, showSecond, open } = useCardStage({
    preload: HOME_SOURCES,
    assembleMs: HOME_ASSEMBLE_MS,
  });

  return showSecond ? <Home /> : <Welcome leaving={leaving} onOpen={open} />;
}
