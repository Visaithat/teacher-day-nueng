/** Building the home page's layers: where each starts, and how it sways in. */

import { SLIDE_MS } from "@/lib/constants/home";
import type { CssVars } from "@/types/css-vars";
import type { PhotoMotion } from "@/types/home";

export function enterFrom({ enterX, enterY }: PhotoMotion) {
  return `translate3d(${enterX}vw, ${enterY}vh, 0)`;
}

export function motionVars(layer: PhotoMotion): CssVars {
  return {
    "--enter-from": enterFrom(layer),
    "--enter-duration": `${SLIDE_MS}ms`,
    "--walk": layer.walk,
  } as CssVars;
}
