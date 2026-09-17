/**
 * Hand-traced pen paths for the greeting signature.
 *
 * Each `d` is the centre line a pen would travel while writing the line in
 * Allura, traced against the rendered glyphs at `fontSize` with the baseline
 * at y = 0 and the text origin at x = 0. The paths are not drawn directly:
 * they are stroked inside an SVG mask so the ink of the real typeface is
 * revealed along the true path of the pen, loops and back-tracks included.
 *
 * `from`/`to` are fractions of the line's `--sign-duration`, so each stroke's
 * timing is tunable from CSS without touching the path data. The strokes run
 * back to back: the pen jumps to the next one without ever resting.
 */

export type SignatureStroke = {
  /** Pen path, in the line's own user units. */
  d: string;
  /** Start, as a fraction of --sign-duration. */
  from: number;
  /** End, as a fraction of --sign-duration. */
  to: number;
};

export type SignatureLine = {
  text: string;
  viewBox: string;
  /** Rendered size, in multiples of the signature's font size. */
  widthEm: number;
  heightEm: number;
  fontSize: number;
  /** Measured advance of `text` at `fontSize`; pins the glyphs to the paths. */
  textLength: number;
  strokes: SignatureStroke[];
};
