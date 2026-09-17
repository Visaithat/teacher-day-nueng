/** A point in viewport coordinates. */
export type Point = { x: number; y: number };

/**
 * The centre of a node's box, in viewport coordinates.
 *
 * The card measures marks rather than doing trigonometry: how two elements sit
 * against one another is asked of the layout, not derived from the transforms
 * that put them there. Rects are viewport-bound and go stale, so this is called
 * at the moment the answer is needed.
 *
 * @param node The element to measure, or `null`.
 * @returns The centre point, or `null` if there is no node.
 */
export function centreOf(node: Element | null): Point | null {
  if (!node) return null;
  const box = node.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}
