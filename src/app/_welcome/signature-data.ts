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

/** Wide enough for the pen to cover every glyph it passes over. */
export const SIGNATURE_STROKE_WIDTH = 22;

export const SIGNATURE_LINES: SignatureLine[] = [
  {
    text: "Greeting,",
    viewBox: "-4 -72 334 120",
    widthEm: 3.34,
    heightEm: 1.2,
    fontSize: 100,
    textLength: 319.91,
    strokes: [
      // G r e e t i n g - one unbroken cursive stroke
      {
        d:
          "M 74.5 -51 C 62 -58, 46 -58, 33 -48 C 22 -40, 10 -28, 9 -17 C 8 -8, 14 -1, 21 -1 "+
          "C 26 -1, 30 -2, 34 -6 C 40 -14, 45 -22, 48 -28 C 50 -20, 40 6, 33 20 "+
          "C 28 30, 26 37, 31 37 C 37 38, 44 28, 50 13 C 54 4, 57 -2, 62 -7 "+
          "C 66 -12, 73 -20, 85 -35 C 86 -30, 84 -20, 83 -13 C 86 -20, 90 -30, 95 -31 "+
          "C 98 -31, 99 -21, 99 -13 C 99 -8, 99 -4, 100 -2 C 106 -8, 117 -22, 126 -29 "+
          "C 130 -32, 128 -36, 123 -34 C 118 -32, 116 -25, 117 -19 C 118 -12, 120 -5, 124 -2 "+
          "C 128 0, 134 -4, 140 -9 C 146 -14, 154 -24, 158 -29 C 162 -32, 160 -36, 155 -34 "+
          "C 150 -32, 148 -25, 149 -19 C 150 -12, 152 -5, 156 -2 C 160 0, 166 -4, 172 -9 "+
          "C 175 -4, 180 -2, 185 -6 C 191 -13, 198 -30, 202 -41 C 203 -45, 205 -44, 204 -39 "+
          "C 201 -29, 198 -16, 196 -9 C 195 -4, 198 -1, 202 -3 C 205 -5, 207 -8, 209 -11 "+
          "C 211 -16, 213 -22, 216 -27 C 217 -30, 219 -29, 218 -25 C 217 -18, 215 -10, 215 -5 "+
          "C 215 -1, 218 -1, 221 -4 C 223 -9, 227 -25, 230 -29 C 232 -32, 235 -31, 235 -26 "+
          "C 235 -19, 233 -10, 233 -3 C 235 -9, 239 -21, 243 -27 C 245 -31, 249 -30, 249 -25 "+
          "C 249 -18, 247 -9, 247 -3 C 249 -7, 253 -11, 258 -13 C 263 -18, 270 -27, 276 -28 "+
          "C 281 -29, 283 -25, 281 -19 C 279 -13, 273 -7, 268 -7 C 263 -7, 262 -13, 266 -18 "+
          "C 271 -24, 280 -28, 286 -25 C 290 -22, 288 -10, 285 0 C 282 12, 272 24, 263 29 "+
          "C 256 33, 257 39, 264 37 C 272 34, 283 24, 291 12 C 297 3, 303 -9, 306 -20",
        from: 0,
        to: 0.79,
      },
      // the comma
      {
        d: "M 313 -16 C 314 -10, 313 -2, 310 5 C 308 9, 306 12, 305 13",
        from: 0.79,
        to: 0.87,
      },
      // back to cross the t
      {
        d: "M 180 -25 C 188 -28, 198 -28, 207 -26",
        from: 0.87,
        to: 0.94,
      },
      // and to dot the i
      {
        d: "M 217 -40 C 220 -42, 222 -39, 220 -36",
        from: 0.94,
        to: 1,
      },
    ],
  },
  {
    text: "Teacher Nueng",
    viewBox: "-10 -72 538 120",
    widthEm: 5.38,
    heightEm: 1.2,
    fontSize: 100,
    textLength: 509.31,
    strokes: [
      // the capital T opens with its long bar
      {
        d:
          "M 4 -30 C 8 -40, 18 -50, 30 -52 C 45 -55, 60 -55, 70 -50 C 77 -47, 80 -44, 79 -40 "+
          "C 77 -35, 70 -32, 64 -30",
        from: 0,
        to: 0.1,
      },
      // stem of the T straight into "eacher", ending on its flourish
      {
        d:
          "M 37 -47 C 34 -38, 26 -18, 21 -6 C 19 -2, 16 0, 15 -1 C 18 -3, 22 -4, 24 -6 "+
          "C 28 -8, 39 -22, 48 -29 C 52 -32, 50 -36, 45 -34 C 40 -32, 38 -25, 39 -19 "+
          "C 40 -12, 42 -5, 46 -2 C 50 0, 56 -4, 62 -9 C 68 -18, 76 -27, 84 -27 "+
          "C 89 -27, 92 -22, 91 -16 C 90 -9, 86 -2, 81 -2 C 75 -2, 72 -9, 74 -15 "+
          "C 77 -22, 85 -26, 90 -24 C 93 -18, 92 -8, 92 -3 C 94 0, 100 -1, 105 -4 "+
          "C 109 -13, 117 -27, 123 -29 C 127 -28, 126 -24, 122 -22 C 117 -20, 115 -12, 117 -7 "+
          "C 120 -1, 128 -2, 133 -6 C 135 -8, 136 -9, 137 -10 C 145 -25, 160 -44, 172 -56 "+
          "C 178 -62, 184 -59, 181 -50 C 177 -38, 160 -20, 152 -8 C 149 -4, 149 -1, 152 -2 "+
          "C 156 -6, 160 -22, 163 -27 C 166 -30, 169 -27, 169 -20 C 169 -12, 168 -5, 169 -1 "+
          "C 176 -8, 192 -22, 202 -29 C 206 -32, 204 -36, 199 -34 C 194 -32, 192 -25, 193 -19 "+
          "C 194 -12, 196 -5, 200 -2 C 204 0, 210 -4, 216 -9 C 219 -14, 222 -24, 225 -35 "+
          "C 226 -30, 224 -20, 223 -13 C 226 -20, 230 -30, 235 -31 C 238 -31, 239 -21, 239 -13 "+
          "C 239 -8, 239 -4, 240 -2 C 245 -6, 252 -8, 258 -4 C 263 0, 267 6, 268 11",
        from: 0.1,
        to: 0.62,
      },
      // straight on into "Nueng"
      {
        d:
          "M 253 12 C 262 8, 275 2, 285 -10 C 292 -20, 297 -34, 300 -44 C 300 -49, 291 -44, 283 -40 "+
          "C 291 -42, 299 -46, 303 -45 C 303 -34, 302 -14, 304 -2 C 306 6, 312 8, 318 4 "+
          "C 326 -2, 334 -30, 341 -52 C 343 -58, 347 -59, 348 -53 C 350 -44, 350 -30, 352 -18 "+
          "C 354 -10, 357 -5, 361 -3 C 364 -1, 368 -4, 370 -9 C 372 -17, 374 -26, 376 -27 "+
          "C 378 -28, 379 -24, 379 -18 C 378 -11, 377 -6, 379 -3 C 381 -1, 385 -3, 388 -8 "+
          "C 390 -8, 401 -22, 410 -29 C 414 -32, 412 -36, 407 -34 C 402 -32, 400 -25, 401 -19 "+
          "C 402 -12, 404 -5, 408 -2 C 412 0, 418 -4, 424 -9 C 427 -9, 431 -25, 434 -29 "+
          "C 436 -32, 439 -31, 439 -26 C 439 -19, 437 -10, 437 -3 C 439 -9, 443 -21, 447 -27 "+
          "C 449 -31, 453 -30, 453 -25 C 453 -18, 451 -9, 451 -3 C 456 -7, 460 -11, 465 -13 "+
          "C 470 -18, 477 -27, 483 -28 C 488 -29, 490 -25, 488 -19 C 486 -13, 480 -7, 475 -7 "+
          "C 470 -7, 469 -13, 473 -18 C 478 -24, 487 -28, 493 -25 C 497 -22, 495 -10, 492 0 "+
          "C 489 12, 479 24, 470 29 C 463 33, 464 39, 471 37 C 479 34, 490 24, 498 12 "+
          "C 504 3, 510 -9, 513 -20",
        from: 0.62,
        to: 1,
      },
    ],
  },
];
