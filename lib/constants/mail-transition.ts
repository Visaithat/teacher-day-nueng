/**
 * The camera moves, as view-transition types.
 *
 * Not a duration and not on the clock: these are names the stylesheet matches
 * on, and `travel.css` owns how long each one lasts.
 */

/**
 * What a page does when the camera moves past it.
 *
 * The same object on both scenes and on both props, because a scene has no
 * opinion about which direction it is being left in — whoever MOVES says that,
 * by naming a transition type, and this is only the scene agreeing to answer.
 *
 * `default: "none"` is the load-bearing entry, and it carries MORE now than it
 * did. A move with no type is the browser's Back button arriving as a
 * `popstate`, a refresh, or a Suspense boundary filling in, and none of those
 * asked for a camera move. The thing crossing still morphs, because that is a
 * shared name and nothing to do with this.
 *
 * It goes on each scene and never on the cloth the two of them share: a wrapper
 * that is kept across the cut never fires enter or exit.
 */
export const PAN = {
  "pan-up": "pan-up",
  "pan-down": "pan-down",
  default: "none",
} as const;
