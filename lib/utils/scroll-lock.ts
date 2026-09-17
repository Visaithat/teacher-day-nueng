/**
 * Holds the document still, and hands back the undo.
 *
 * The previous value is captured rather than assumed empty, so nesting two locks
 * unwinds to whatever was there before the outer one rather than to nothing.
 *
 * @returns A function that restores the root's previous `overflow`.
 */
export function lockRootScroll(): () => void {
  const root = document.documentElement;
  const previous = root.style.overflow;
  root.style.overflow = "hidden";
  return () => {
    root.style.overflow = previous;
  };
}
