/**
 * The camera moves, as view-transition types.
 *
 * Not a duration and not on the clock: these are names the stylesheet matches
 * on, and `travel.css` owns how long each one lasts.
 */

/**
 * What a page does when the camera moves past it.
 *
 * The same object on both pages and on both props, because a page has no
 * opinion about which direction it is being left in — the LINK says that, by
 * naming a transition type, and this is only the page agreeing to answer.
 *
 * `default: "none"` is the load-bearing entry. A navigation with no type is a
 * browser Back button, a refresh, or a Suspense boundary filling in, and none
 * of those asked for a camera move. The thing crossing still morphs, because
 * that is a shared name and nothing to do with this.
 *
 * It goes on each `page.tsx` and never on the layout: a layout is kept across a
 * move between its children, so its enter and its exit never fire.
 */
export const PAN = {
  "pan-up": "pan-up",
  "pan-down": "pan-down",
  default: "none",
} as const;
