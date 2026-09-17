/** How a wax seal is drawn breaking. */

/** How many segments the crack is broken into. Six points, five steps. */
export const SEAM_STEPS = 5;
/** How far either side of the middle the crack is allowed to wander, in percent. */
export const SEAM_WANDER = 9;
/** Half the width of the drawn crack, in percent of the seal's box. */
export const SEAM_INK = 1.1;
/**
 * How far the left half is grown past the seam, so the two OVERLAP rather than
 * meet. Two clip edges sharing a line each take about half the coverage of the
 * pixels along it, and a quarter of what is behind shows through the join — a
 * pale hairline down every seal, standing still, looking pre-cracked. The
 * overlap lands in opaque wax well away from the rim, so nothing doubles up.
 */
export const SEAM_BLEED = 0.7;
/**
 * How far outside its box each half keeps.
 *
 * `clip-path` clips the whole subtree AFTER its filters, so a polygon that stops
 * at the box edge shears off the drop-shadow the wax casts onto the envelope —
 * measured, the shadow went from present at one pixel inside the box to nothing
 * at two pixels outside it, a dead straight cut. An oversized path costs
 * nothing; percentages outside 0-100 are perfectly legal here.
 */
export const SEAM_MARGIN = 50;
