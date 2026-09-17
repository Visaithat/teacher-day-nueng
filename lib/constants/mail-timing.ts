/**
 * The mail scene's clock.
 *
 * Every number here has a twin in a stylesheet, and the pairing is the point:
 * the CSS moves the pixels and these say when the move is over, so a timer and
 * a keyframe cannot drift apart. The `CALM_*` values are the reduced-motion
 * twins, read from the bottom of the same stylesheets.
 */

/**
 * Milliseconds from the moment the scene starts moving. The whole opening is one
 * timeline: every part of it is a CSS animation with its own delay counted off
 * this same zero, so the order can only ever be read in one place. JS keeps just
 * two of these, and only because a stylesheet cannot measure a box or take away
 * a button.
 */
export const MAIL_TIMING = {
  /** The box comes in from off-stage right and lands. */
  boxIn: 200,
  boxInFor: 1050,
  /** It rocks back, swings over, and hangs there while it empties. */
  tip: 1250,
  tipFor: 1390,
  /**
   * The first letter clears the lip.
   *
   * Not earlier, and the reason is the measurement rather than the look: the
   * mouth's place on screen is read ONCE, in the task this number names, and
   * every letter falls from that one reading. The box is still swinging until
   * about 1970ms — 52% through its tip, where the settle first comes inside a
   * degree of its resting 30° — so a reading taken before then is several tens
   * of pixels out by the time the second letter leaves, and that one appears to
   * start beside the lip rather than out of it.
   */
  pour: 2000,
  /** Between one letter leaving and the next. */
  pourGap: 280,
  /** One letter, from the lip to lying still. */
  fallFor: 720,
  /** The two hops that follow the landing. */
  bounceFor: 580,
  /** The seal is stuck on, so it answers the landing late. */
  layerLag: 30,
  /** The box stands up and goes, once the last letter is done bouncing. */
  boxOut: 3700,
  boxOutFor: 1350,
  /** Only once the box is gone do the letters take their full size. */
  grow: 5050,
  growFor: 520,
  growGap: 90,
  /** The flower, the greeting, then the hint and the dots. */
  flower: 5800,
  title: 6050,
  hint: 6250,
  dressFor: 750,
};

/** From the first move to the scene answering the pointer. */
export const INTRO_MS = MAIL_TIMING.hint + MAIL_TIMING.dressFor;

/**
 * Its reduced-motion twin, from the bottom of mails.css. Nothing travels — the
 * box never comes at all, and the letters are simply already on the cloth.
 */
export const CALM_INTRO_MS = 420;

/** Breaking a seal: the press, the crack, the wobble, and the going. */
export const SEAL_TIMING = {
  /** The wax takes the press and swells a little. */
  press: 160,
  /** The crack draws itself down the seal, crooked, before anything moves. */
  crack: 200,
  /** The two halves lean apart and go. */
  split: 520,
};

/** From the click to the seal being gone. */
export const SEAL_MS =
  SEAL_TIMING.press + SEAL_TIMING.crack + SEAL_TIMING.split;

/**
 * Its reduced-motion twin, from the bottom of mails.css. The seal still answers
 * the click — silence reads as a broken button — it just goes straight.
 */
export const CALM_SEAL_MS = 180;

/**
 * The envelope opening, counted off the same click that broke the seal — so this
 * and SEAL_TIMING are one timeline with one zero, the way the scene's opening is.
 */
export const OPEN_TIMING = {
  /** The fold gives a beat before the last of the wax has gone. */
  flapAt: SEAL_MS - 120,
  /** It swings past upright, leans back, and settles. */
  flapFor: 620,
  /** The bundle starts up once the flap is past vertical and out of its way. */
  riseAt: 1080,
  riseFor: 760,
  /** Between one piece leaving and the next. */
  riseGap: 70,
  /** The greeting goes as the fold gives, and is gone before the paper is in
      the space it was standing in. */
  dressOutAt: SEAL_MS - 120,
  dressOutFor: 320,
};

/** From the click to the envelope being open and still. */
export const OPEN_MS =
  OPEN_TIMING.riseAt + 2 * OPEN_TIMING.riseGap + OPEN_TIMING.riseFor;

/* --- leaving ------------------------------------------------------------- */

/**
 * Following one of the three things out of the envelope, which is two beats.
 *
 * ONLY THE FIRST OF THEM IS HERE. The thing floats up on its own, and that beat
 * has a JS side, because the push has to wait for it.
 *
 * The second — the camera panning up after it, and the thing crossing to the
 * next page as itself — is entirely the browser's, on pseudo-elements hanging
 * off the document root that no component styles and nothing can push a custom
 * property into. Its numbers live in `_stage/travel.css` and ONLY there. A copy
 * of them here would read nicely and be wrong within a month: nothing in JS
 * waits on any of them, so nothing would ever catch the two drifting apart.
 */
export const LEAVE_TIMING = {
  /** The pressed thing floats clear of the paper, alone. */
  lift: 420,
  /**
   * How far. `em`, a share of the envelope like every other distance here.
   *
   * 4em is 40px at full size, an eighth of the envelope's height — a hand's
   * breadth of daylight under the thing. Far enough to read as a second,
   * separate move after the rise it has already made, near enough that nothing
   * leaves the window on the short screens where the rise is already spent.
   *
   * A floor rather than the distance: a thing still hanging below the
   * envelope's foot has to beat that as well, and `sinkOf` says by how much.
   */
  liftEm: 4,
  /** And a little past the foot, so the clip is not being cleared by a hair. */
  clearEm: 0.6,
  /** The other two and the arrows step back out of its way while it goes. */
  recede: 260,
};

/** From the press to the push. */
export const LEAVE_MS = LEAVE_TIMING.lift;

/**
 * Its reduced-motion twin. Nothing floats, so there is nothing to wait for and
 * the push happens on the click itself.
 */
export const CALM_LEAVE_MS = 0;

/**
 * The arrows come last, counted off the end of the opening rather than written
 * out again: an arrow pointing at something still on its way is pointing at
 * nothing, and a beat after everything has stopped is when a reader starts
 * looking for what to do next.
 */
export const GUIDE_TIMING = {
  at: OPEN_MS + 260,
  lasts: 460,
};
