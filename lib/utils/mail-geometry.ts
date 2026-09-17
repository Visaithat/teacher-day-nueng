import { ENVELOPE, ENVELOPE_EM } from "@/lib/constants/mail-art";
import type { Content } from "@/types/mails";

/**
 * How far a thing still hangs below the envelope's foot once it has risen, in
 * `em`, before any of it has been clipped away.
 *
 * `.letter__bundle` is cut off flush at that foot, and the cut is load-bearing:
 * the paper letter is half again as tall as the envelope it comes out of, and
 * nothing else hides the part that overhangs. So at rest, on any window short
 * enough that `--rise` bottoms out at its 11em floor, the sheet a reader is
 * looking at is a sheet with its foot taken off.
 *
 * That is invisible and always has been — until the thing is pressed. A view
 * transition captures a named element on its own, hoisted out of its ancestors,
 * and an ancestor's `clip-path` is NOT applied to the snapshot (measured, not
 * assumed: a clipped element was captured whole). So the instant the cut begins
 * the sheet would grow its foot back in one frame, and the reader would see it.
 *
 * This is the distance the float has to beat for that frame not to exist. It is
 * counted against the element's TURNED box rather than its upright one, because
 * paper leaning three degrees reaches lower at one corner than paper lying
 * square — which is most of the number on the sheet, and all of it on the other
 * two.
 *
 * What comes back is the standing part of it, in `em`; how much of it the rise
 * has already paid for is arithmetic CSS does, because only CSS knows `--rise`.
 * Zero for anything that never reaches the foot at all, which is both the
 * postcard and the cassette at every size.
 */
export function sinkOf(item: Content) {
  const tall = ENVELOPE_EM / ENVELOPE.ratio;
  const wide = (item.width / 100) * ENVELOPE_EM;
  const high = wide / item.ratio;
  const turn = (Math.abs(item.tilt) * Math.PI) / 180;
  /* A turned box is taller than it stands, and it is turned about its middle —
     so half of what it gained is below where it used to end. */
  const turned = wide * Math.sin(turn) + high * Math.cos(turn);
  const foot = (item.top / 100) * tall + high / 2 + turned / 2;
  return Math.max(0, foot - tall);
}
