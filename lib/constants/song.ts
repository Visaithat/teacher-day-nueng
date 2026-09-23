/**
 * The song page: the record, and everything printed around it.
 *
 * The words are separated from the page on purpose. Everything a reader can
 * actually read on this page is in this one file, so the Lao lyrics can be
 * pasted in without opening a component or touching a line of markup.
 */

/**
 * The record itself.
 *
 * `src` is the encoded copy, not the master: the original is a 49MB WAV, which
 * is four and a half minutes of silence on a phone before the first note. The
 * mp3 beside it is the same recording at 160kbps.
 */
export const RECORD_SONG = {
  kind: "file",
  src: "/audio/day-0-hrz.mp3",
  /** As the reference prints it: the Lao name, then the artist's mark. */
  title: "ເພງວັນຄູ | Hrz.",
  by: "Daniii Hrz.",
} as const;

/** How long one full turn of the record takes while it is playing. */
export const SPIN_MS = 2600;

/** One sung line, and the second of the song it lands on. */
export type Line = { at: number; text: string };

/**
 * The words, by stanza, each with the moment it is sung.
 *
 * The seconds came with the words and they earn their place: the card marks
 * whichever line the record is on and carries the page to it, so the lyrics
 * follow the song rather than sitting still beside it. Retime a line by
 * changing one number here; nothing else knows about it.
 */
export const SONG_LYRICS: readonly (readonly Line[])[] = [
  [
    { at: 14, text: "ມີຄົນກ່າວ" },
    { at: 21, text: "ໃຫ້ລອງໄປຄວ້າດວງດາວຢູ່ທີ່ແຫ່ງນັ້ນ" },
    { at: 31, text: "ໜົນທາງບໍ່ໄດ້ຫ່າງໄກ" },
    { at: 40, text: "ຖ້າດອກໄມ້ໃນມື" },
    { at: 43, text: "ຫັກສະຫຼາຍ ຈະຫັກສາໄດ້" },
    { at: 50, text: "ຫຼືບໍ່" },
    { at: 54, text: "ໂອ້ ຫົວໃຈເອີຍ" },
    { at: 61, text: "ຕ້ອງການສິ່ງໃດ" },
  ],
  [
    { at: 86, text: "ໂອ້ ຟ້າ" },
    { at: 90, text: "ຖ້າກ້າວໄປ" },
    { at: 93, text: "ອີກຄັ້ງ" },
    { at: 95, text: "ໃນຄວາມເປັນຈິງ ອາດມີບາດແຜ ກະທົບນ້ຳຕາ" },
    { at: 106, text: "ທີ່ໄຫຼລິນ" },
    { at: 110, text: "ວັນໃດທີ່" },
    { at: 113, text: "ຫັນມາກອດຕົວເອງ" },
    { at: 117, text: "ຫວັງໃຫ້ບໍ່" },
    { at: 120, text: "ເຈັບປວດຫົວໃຈ" },
  ],
  [
    { at: 154, text: "ອາດຍັງບໍ່ຮູ້" },
    { at: 161, text: "ການເລີ່ມຕົ້ນໃນຕອນນີ້" },
    { at: 168, text: "ແຕ່ກໍອາດຈະດີ" },
    { at: 175, text: "ຫາກເປັນດັ່ງທີ່ຜູ້ຄົນ" },
    { at: 182, text: "ຖືດອກໄມ້ໃນມື" },
    { at: 185, text: "ບໍ່ສະຫຼາຍ ຈະຮັກສາໄດ້" },
    { at: 193, text: "ດົນເທົ່າໃດ" },
    { at: 196, text: "ໂອ້ ຫົວໃຈ" },
    { at: 199, text: "ຄົງ" },
    { at: 201, text: "ຮູ້ວ່າຕ້ອງການສິ່ງໃດ" },
  ],
  [
    { at: 210, text: "ໂອ້" },
    { at: 211, text: "ຟ້າ" },
    { at: 214, text: "ຖ້າກ້າວໄປ" },
    { at: 218, text: "ອີກຄັ້ງ" },
    { at: 220, text: "ໃນຄວາມເປັນຈິງ ອາດມີບາດແຜ" },
    { at: 227, text: "ກະທົບນ້ຳຕາ" },
    { at: 231, text: "ທີ່ໄຫຼລິນ" },
    { at: 234, text: "ວັນໃດທີ່" },
    { at: 237, text: "ຫັນມາກອດຕົວເອງ" },
  ],
  [
    { at: 242, text: "ຟ້າ ຖ້າກ້າວໄປ" },
    { at: 245, text: "ອີກຄັ້ງ ໃນຄວາມເປັນຈິງ" },
    { at: 251, text: "ອາດມີບາດແຜ" },
    { at: 254, text: "ກະທົບນ້ຳຕາ" },
    { at: 258, text: "ທີ່ໄຫຼລິນ" },
    { at: 262, text: "ວັນໃດທີ່" },
    { at: 265, text: "ຫັນມາກອດຕົວເອງ" },
    { at: 269, text: "ຫວັງໃຫ້ບໍ່" },
    { at: 272, text: "ເຈັບປວດຫົວໃຈ" },
  ],
];

/** Who made it. Read off the reference, which prints these in Latin script. */
export const SONG_CREDITS: readonly { role: string; name: string }[] = [
  { role: "Artists", name: "Daniii Hrz." },
  { role: "", name: "(Anida Thongvanh)" },
  { role: "Lyrics", name: "BUTNER" },
  { role: "Mix & Master", name: "BUTNER" },
];

/**
 * The line on the brown card.
 *
 * Written for this card rather than borrowed from anyone, so it belongs to the
 * page the way the rest of the handwriting does.
 */
export const SONG_QUOTE = {
  lines: [
    "A teacher is the only person who",
    "hands you something and keeps it too.",
  ],
  by: "",
};

/**
 * The page arriving.
 *
 * The record lands first and the rest follows it in, one beat apart. Two things
 * less than about 100ms apart read as one thing; 120 is the least that reads as
 * a row of things arriving in order, and five of them at that spacing is still
 * under half a second of waiting for the last.
 */
export const SONG_ENTRY = {
  /** One piece's own arrival. */
  appear: 520,
  /** How far apart two neighbours start. */
  beat: 120,
};

/**
 * The transport.
 *
 * `bars` is the waveform's own resolution, and the number is chosen the way the
 * cassette's forty were: a mark is as wide as the room it gets, so too few and
 * the quiet parts of the song are drawn as dots. This row is far wider than the
 * cassette's pill and takes proportionally more.
 */
export const SONG_TRANSPORT = {
  bars: 64,
  /** What the two round buttons either side of play jump, in seconds. */
  skip: 10,
  /** Where the volume sits before anyone touches it. */
  volume: 0.85,
  /**
   * One mark's whole breath while the song is going, and how far apart two
   * neighbours are in it - spent as a NEGATIVE delay, so the row is already
   * alive on the first frame rather than rising into life together. Both
   * borrowed from the cassette's own row, which this one is a sibling of.
   */
  beat: 900,
  stagger: 26,
};

/**
 * How the words keep up with the song.
 *
 * `lead` is where the newest line is carried to, as a fraction down the card:
 * two thirds leaves sung lines above it and the waiting mark below, which is
 * what makes the card read as filling up rather than as a window scrolling.
 */
export const SONG_WORDS = {
  lead: 0.66,
  /** The mark standing in for what has not been sung yet. */
  waiting: "…",
};

/**
 * The turntable, and the record arriving on it.
 *
 * Every figure in `at` is a millisecond offset from the moment the page opens,
 * and every beat ends exactly where the next one starts: sleeveIn + sleeve =
 * recordOut, recordOut + record = arm, arm + arm = going. The whole sequence
 * reads down the list as one timeline rather than four animations each
 * guessing where the one before it ended, and because the chain closes there
 * is no keyframe stop to keep in step with it either.
 *
 * The deck is not in that list. It is simply there from the first frame - the
 * cover coming in is the first thing on this page that moves.
 *
 * EVERYTHING BELOW `canvas` IS IN ARTWORK PIXELS, not percentages. The deck
 * and the tonearm are two pictures on one 1024x860 canvas - they line up with
 * nothing but `inset: 0` - so the honest way to write down where the spindle
 * and the hinge are is to say where they are ON THAT CANVAS, measured once,
 * and let the percentages the stylesheet needs be arithmetic. The canvas is no
 * longer square, so a percentage is ambiguous anyway: across is a fraction of
 * 1024 and down is a fraction of 860, and mixing them up is invisible until
 * the record lands off the spindle.
 */
export const SONG_DECK = {
  /** Where each beat starts, and how long it runs. */
  at: {
    sleeveIn: 0,
    recordOut: 800,
    arm: 2200,
    going: 3200,
  },
  run: {
    sleeve: 800,
    record: 1400,
    arm: 1000,
  },
  /** The square both pictures are drawn on. */
  canvas: { w: 1024, h: 860 },
  /** The platter: where the record lands, and how big it is there. */
  platter: { x: 497, y: 405.6, r: 391 },
  /**
   * The tonearm's hinge - the middle of the bearing drawn into the deck, which
   * the arm's own base plate sits exactly on top of.
   */
  pivot: { x: 893, y: 194 },
  /**
   * How far it swings to bring the stylus down on the outer groove.
   *
   * The arm layer is exported already parked, so this is the whole of the
   * move rather than a bearing measured from the page: at rest the stylus is on
   * the wood right of the platter, and this brings it down on the record.
   *
   * 30 and not the 18 that puts the stylus exactly on the outer groove. At 18
   * the needle is on the record and the headshell is still hanging over the
   * edge of it, which is what a real arm does and what a reader reads as the
   * arm having missed. Further in costs nothing and is legible at the size
   * this is actually looked at; 30 puts the stylus at about four fifths of
   * the way out, which still reads as the start of a side.
   */
  play: 30,
  /**
   * The cover, on the same canvas.
   *
   * `of` is a multiple of the RECORD, since a cover is as big as the thing in
   * it - retune the platter and the cover still fits.
   *
   * `gap` is the air between the cover's right edge and the cabinet's left
   * one, which is what makes the two read as two objects standing beside each
   * other rather than one shape. It is in canvas pixels like everything else
   * here, so it scales with the deck instead of drifting against it.
   *
   * `y` puts the cover's middle half a cover down, which lands its top edge
   * flush with the cabinet's - they are two things set down on the same shelf.
   *
   * `tuck` is where the cover ends up once it is empty: its right edge that
   * far PAST the cabinet's left one, so it slides behind the deck. It is the
   * mirror of `gap` - the cover stands clear while the record is being drawn
   * out of it, because that is the thing worth watching, and only afterwards
   * is it pushed aside.
   */
  sleeve: { y: 407, of: 1.04, gap: 136, tuck: 132 },
  /**
   * How far it lies over, at rest and on the way in.
   *
   * Three angles for three moments. It arrives with a slight lean (`in`) and
   * straightens to square (`rest`) as it lands, which is the whole of it
   * looking set down rather than slotted in; it holds square while the record
   * is drawn out of it; and once it is empty it lies over to `set` on its way
   * behind the deck.
   *
   * `rest` is the one that matters twice: it is also the angle of the line
   * the record is uncovered along, so the cover's edge and the clip cannot
   * disagree - see SONG_PULL. That the cover leans afterwards is free, because
   * by then the record is out.
   */
  lean: { rest: 0, in: -6, set: -12 },
};

const { canvas, platter, pivot, sleeve, lean } = SONG_DECK;

const SIZE = 2 * platter.r * sleeve.of;

/**
 * The cover's mouth: its right edge, a gap short of the cabinet's left one.
 *
 * The record is uncovered along this line, so it has to be the cover's real
 * edge and nothing else - a line inside the cabinet would have the record
 * appearing from under the TURNTABLE, and a line outside the cover would show
 * a crescent of record before the pull had begun. Here it is exactly where
 * the drawn edge is, so the record comes out of the cover in the open, across
 * the gap, in full view. That is the part of this that is worth seeing.
 */
const MOUTH = -sleeve.gap;

/** Its middle, which is where the record starts. */
const CX = MOUTH - SIZE / 2;

/**
 * The deck's pieces, as the percentages the stylesheet wants.
 *
 * Across is of 1024 and down is of 860, which is exactly what `left`, `top`,
 * `width` and `transform-origin` resolve against once the body carries the
 * canvas's own aspect ratio. The record is square and sized by its width, so
 * its diameter is a fraction of 1024 in both directions.
 */
export const SONG_ART = {
  discLeft: ((platter.x - platter.r) / canvas.w) * 100,
  discTop: ((platter.y - platter.r) / canvas.h) * 100,
  discSize: ((2 * platter.r) / canvas.w) * 100,
  pivotX: (pivot.x / canvas.w) * 100,
  pivotY: (pivot.y / canvas.h) * 100,
};

/**
 * Everything about the cover that is arithmetic rather than choice.
 *
 * None of it is a free number: each is wherever `platter`, the canvas and
 * `sleeve` happen to put it. Written down by hand they would be second copies
 * of numbers that already exist, and they would go quietly wrong the first
 * time any of them moved.
 */
export const SONG_SLEEVE = {
  size: (SIZE / canvas.w) * 100,
  left: ((MOUTH - SIZE) / canvas.w) * 100,
  top: ((sleeve.y - SIZE / 2) / canvas.h) * 100,
  /**
   * Where it goes once it is empty, as a percentage of its OWN box - which is
   * what `translate` resolves against.
   *
   * It has to cross the gap it was given and then some, so the distance is
   * `gap + tuck` and neither of those is written down twice. The small drop
   * is the difference between a cover pushed aside and one that slid.
   */
  tuckX: ((sleeve.gap + sleeve.tuck) / SIZE) * 100,
  tuckY: 3,
};

/**
 * The record's journey, and the cover it is drawn out of.
 *
 * `x` and `y` are percentages of the RECORD'S OWN box, which is what the
 * `translate` property resolves against: they put the record's middle on the
 * cover's middle to begin with, and `translate: 0 0` brings it home. The
 * record is square, so both are fractions of its diameter.
 *
 * `mouthFrom` and `mouthTo` are the same edge of the cover seen twice, at each
 * end of that journey, written across the record's box. The record is clipped
 * to whatever lies right of it, so as the record travels the line retreats
 * across it and uncovers it exactly as the cover would.
 *
 * WHY A CLIP AND NOT A STACKING ORDER. Hiding the record behind the cover is
 * the obvious way, and the gap looks like it should make it work now that the
 * two no longer overlap. It does not. The record is wider than the gap by
 * about six to one, so it is over the cabinet long before its trailing edge
 * has left the cover: there is no instant when it is clear of one and not yet
 * on the other. The cover's layer is below the cabinet's and the record has to
 * end up above it, so hiding the record behind the cover asks for
 * record < cover < cabinet < record, and any `z-index` flip pops a band of
 * record into being wherever it lands. Clipping owes nothing to paint order.
 *
 * The line is drawn from above the box to below it and leaned by `lean.rest`,
 * so it lies along the cover's own edge rather than cutting across it. That is
 * zero today - the cover stands square - and the arithmetic needs no special
 * case for it: a lean of nothing gives a plain vertical line.
 */
const OVER = 10;
const SPAN = 100 + OVER * 2;
const TILT = (Math.tan((lean.rest * Math.PI) / 180) * SPAN) / 2;

function mouthAt(recordLeft: number): string {
  const at = ((MOUTH - recordLeft) / (2 * platter.r)) * 100;
  return [
    `${at + TILT}% ${-OVER}%`,
    `160% ${-OVER}%`,
    `160% ${100 + OVER}%`,
    `${at - TILT}% ${100 + OVER}%`,
  ].join(", ");
}

export const SONG_PULL = {
  x: ((CX - platter.x) / (2 * platter.r)) * 100,
  y: ((sleeve.y - platter.y) / (2 * platter.r)) * 100,
  mouthFrom: mouthAt(CX - platter.r),
  mouthTo: mouthAt(platter.x - platter.r),
};

/**
 * The rings that go out from the record while it turns.
 *
 * Three, and staggered across one period so there is always one leaving and one
 * fading rather than a pulse with a gap in it.
 */
export const SONG_RINGS = {
  count: 3,
  period: 2400,
};
