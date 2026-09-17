"use client";

import Link from "next/link";
/* From the App Router's React, which is a canary and has it. `node_modules/react`
   is 19.2.8 stable and does NOT export ViewTransition — this import resolves
   only because Next aliases `react` to its own copy for app code. */
import { type MouseEvent, ViewTransition } from "react";

import type { CssVars } from "@/types/css-vars";
import { jitter } from "@/lib/utils/jitter";
import {
  ARROW,
  CONTENTS,
  ENVELOPE,
  NAME_CARD,
  OPEN_BACK,
  OPEN_FRONT,
  PALETTE,
  SEAL,
  SEALS,
} from "@/lib/constants/mail-art";
import { seamOf } from "@/lib/utils/letter-seam";
import { sinkOf } from "@/lib/utils/mail-geometry";
import { contentHref, contentView } from "@/lib/utils/mail-routes";
import type {
  Content,
  Guide,
  Layer,
  Letter as LetterData,
} from "@/types/mails";

interface LetterProps {
  letter: LetterData;
  /** Its place in the deck, which is also its place in the pour. */
  index: number;
  /** It is the one in front: the only one whose seal can be broken. */
  front: boolean;
  /** Its seal has been broken. */
  open: boolean;
  /**
   * It was already open when this page arrived, so its opening is history rather
   * than motion: the same end state, reached over no time at all.
   */
  settled: boolean;
  /** The slug of the thing on its way out of THIS envelope, or null. */
  leaving: string | null;
  onPick: () => void;
  onOpen: () => void;
  /** Press one of the three things: float it, then go after it. */
  onFollow: (item: Content) => (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Where the thin end of the arrow finishes up once the arrow has been turned.
 *
 * Counted in the guide's own widths, from the middle of its box. The arrow is
 * drawn tail-up and turned by as much as 178 degrees, so the tail can end up on
 * any side of the box; the words follow it rather than sitting under the box the
 * way they would if they were simply the line below.
 *
 * `out` is the way the tail points, which is the way the words are pushed off
 * it — how far is the stylesheet's business, because the distance that clears
 * them is a distance in words and not in arrows.
 */
function tailOf(guide: Guide) {
  const turn = (guide.turn * Math.PI) / 180;
  /** Its height, counted in its own widths. */
  const tall = 1 / ARROW.ratio;
  const outX = ARROW.tail.x - 0.5;
  const outY = (ARROW.tail.y - 0.5) * tall;
  // Clockwise, in a frame whose y runs down the screen — the same turn the
  // stylesheet gives the arrow itself.
  const x = outX * Math.cos(turn) - outY * Math.sin(turn);
  const y = outX * Math.sin(turn) + outY * Math.cos(turn);
  const far = Math.hypot(x, y) || 1;
  return { x, y, tall, out: { x: x / far, y: y / far } };
}

/**
 * How far past its own box the arrow reaches, as a share of the envelope the box
 * is measured in: a box that has been turned is wider than it stands.
 *
 * The words hang off it further still, but by a distance set in their own font
 * size — so the stylesheet adds that part, and this is only the picture.
 */
function spillOf(guide: Guide) {
  const turn = (guide.turn * Math.PI) / 180;
  const tall = 1 / ARROW.ratio;
  const arrow =
    (Math.abs(Math.cos(turn)) + tall * Math.abs(Math.sin(turn))) / 2;
  return guide.width * (Math.max(arrow, Math.abs(tailOf(guide).x)) - 0.5);
}

/** The arrow that points at one of them: where it sits and which way it faces. */
function guideVars(item: Content): CssVars {
  const tail = tailOf(item.guide);
  const percent = (n: number) => `${(n * 100).toFixed(1)}%`;
  return {
    "--left": `${item.guide.left}%`,
    "--top": `${item.guide.top}%`,
    "--w": `${item.guide.width}%`,
    "--turn": `${item.guide.turn}deg`,
    "--spill": `${spillOf(item.guide).toFixed(2)}%`,
    /* The tail, as a share of the box — across it for one, down it for the
       other, so a figure counted in widths has the height divided back out of
       it — and then a push clear of the arrow, in ems, because what has to be
       cleared is the width of a word. Wider than it is tall, so the sideways
       push is the larger of the two. */
    "--note-x": `calc(${percent(tail.x)} + ${(tail.out.x * 2.5).toFixed(2)}em)`,
    "--note-y": `calc(${percent(tail.y / tail.tall)} + ${(
      tail.out.y * 1.15
    ).toFixed(2)}em)`,
  } as CssVars;
}

/** One thing inside the envelope: where it lies, and where it goes. */
function contentVars(item: Content, step: number): CssVars {
  return {
    ...layerVars(item),
    "--rise-step": step,
    /**
     * Its share of the rise, already negative because it goes UP.
     *
     * This only works because `--rise` and this are both registered with
     * `@property` in mails.css. Left as plain custom properties they substitute
     * as token streams, and `calc(var(--rise) * var(--rise-of))` then computes to
     * ZERO — silently, with no error anywhere. Registered, they compute to a real
     * length and a real number and the multiplication is just arithmetic.
     */
    "--rise-of": -item.riseOf,
    /** The same, past its mark, for the overshoot frame. */
    "--rise-over": -item.riseOf * 1.05,
    /** How far aside it fans, and the lean it ends at. */
    "--fan": `${item.fan}em`,
    "--tilt": `${item.tilt}deg`,
    /**
     * How far it still hangs below the envelope's foot before the rise pays for
     * any of it. The float has to beat whatever the rise leaves standing, or
     * the snapshot the cut takes grows a foot the reader was not shown — see
     * `sinkOf`. What the rise has already paid is arithmetic CSS does, because
     * only CSS knows `--rise`.
     */
    "--sink": `${sinkOf(item).toFixed(3)}em`,
  } as CssVars;
}

/** One piece of paper's box, as percentages of the envelope it lies on. */
function layerVars(layer: Layer & { rotate?: number }): CssVars {
  return {
    "--left": `${layer.left}%`,
    "--top": `${layer.top}%`,
    "--w": `${layer.width}%`,
    "--ratio": layer.ratio,
    "--rotate": `${layer.rotate ?? 0}deg`,
  } as CssVars;
}

/**
 * One letter: three pieces of paper stuck on one another, with a name written on
 * the second of them.
 *
 * The three are never animated apart. Everything the letter does — the drop out
 * of the box, the drift across, the flutter, the landing, the growing, the
 * sliding through the deck — happens on one of the nested boxes above them, so
 * the collage cannot come apart in mid-air. Each of those boxes owns exactly one
 * property, because two animations on one property is a fight the later one wins
 * outright. The single exception is the seal answering the landing a beat late,
 * which is the whole point of its being stuck on rather than printed.
 */
export default function Letter({
  letter,
  index,
  front,
  open,
  settled,
  leaving,
  onPick,
  onOpen,
  onFollow,
}: LetterProps) {
  const j = (salt: number) => jitter(index, salt);
  const spin = j(91.7) >= 0 ? 1 : -1;
  const seam = seamOf(index);
  /* Out of the envelope and at the front of the deck: only then is any of this
     something to press, and only then is it worth announcing. */
  const live = front && open;

  return (
    <li
      className="mails__letter"
      data-pos={front ? "front" : "behind"}
      data-open={open || undefined}
      /* Beside `data-open` rather than instead of it: this letter IS open, and
         everything that says what an open letter looks like should go on saying
         it. All this adds is that the opening already happened. */
      data-settled={settled || undefined}
      /* Which of the three is on its way out. The whole leaving beat hangs off
         this one attribute: the pressed thing reads it through `data-go`, and
         everything else on the letter reads it to get out of the way. */
      data-leaving={leaving ?? undefined}
      style={
        {
          // Its own place in the line. The deck holds --active; every letter
          // works out its own distance from it, so bringing a letter forward
          // changes one property on one element and all of them re-resolve.
          "--i": index,
          "--envelope-ratio": ENVELOPE.ratio,
          // Paper does not fall twice the same way. Deterministic, so the server
          // and the browser agree on the first frame.
          "--pour-order": index,
          "--drift": `${j(43.11) * 2.6}em`,
          "--spin": spin,
        } as CssVars
      }
    >
      {/* Its place in the deck. Transitions; never animated. */}
      <div className="letter__slot">
        {/* Across from the box's mouth, overshooting and easing back. */}
        <div className="letter__drift">
          {/* Up over the lip, down under gravity, then the two hops. The flutter
              rides along here on `rotate`, which this box is not otherwise using. */}
          <div className="letter__fall">
            {/* Up to full size, once the box is out of the way. */}
            <div className="letter__grow">
              {/* Front or behind. Transitions, so it can answer the deck. */}
              <div className="letter__rank">
                <span className="letter__cast" aria-hidden="true" />

                <div className="letter__paper">
                  {/* 1 — the envelope's back, with its flap standing open.
                      Half of one drawing; the other half is the front pocket
                      below, and what goes between them is the point. Neutral
                      paper, so it takes the letter's dye like everything else. */}
                  <div
                    className="letter__layer letter__layer--back"
                    style={layerVars(OPEN_BACK)}
                    aria-hidden="true"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="letter__art"
                      src={OPEN_BACK.src}
                      alt=""
                      draggable={false}
                      decoding="async"
                    />
                    <span
                      className="letter__tint"
                      style={
                        {
                          "--tint": PALETTE[letter.colour],
                          "--tint-src": `url("${OPEN_BACK.src}")`,
                        } as CssVars
                      }
                    />
                  </div>

                  {/* 2 — what is inside. Above the flap and below the envelope's
                      front, and that paint order is the whole mechanism: the
                      front is opaque paper across its whole rectangle, so it
                      hides all of this while the seal is whole and none of it
                      above the top edge. Nothing is clipped and nothing masked.

                      Always in the document, never mounted on the click — a
                      decode and three composites on that one frame is the thing
                      this scene can least afford. */}
                  <div
                    className="letter__bundle"
                    aria-hidden={!live}
                    /* While one of them is on its way out, none of the three is
                       anything to reach: the two staying behind are fading and
                       the one going is already gone. `inert` rather than
                       `pointer-events: none` alone, so they leave the tab order
                       and the accessibility tree too rather than sitting there
                       focusable and invisible. */
                    inert={leaving !== null || undefined}
                  >
                    {CONTENTS.map((item, step) => {
                      /* The box the leaving beat moves. It has to be its own:
                         the item's `transform` is spent on the rise, whose
                         `both` fill holds its last frame for ever, and the
                         artwork's is spent on the hover. Three boxes, one
                         property each — the same discipline as the five the
                         letter itself rides on.
                         Rendered whether the letter is live or not, so a letter
                         coming live does not change the shape of the tree. */
                      const art = (
                        <span className="letter__float">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="letter__art"
                            src={item.src}
                            alt=""
                            draggable={false}
                            decoding="async"
                          />
                        </span>
                      );
                      const style = contentVars(item, step);
                      /* A link only once it is out and in front. Behind or still
                         sealed it is a picture: nothing to tab to, nothing to
                         press, and inside an aria-hidden wrapper where a link
                         would not be legal anyway. */
                      if (!live) {
                        return (
                          <span
                            key={item.src}
                            className="letter__item"
                            style={style}
                          >
                            {art}
                          </span>
                        );
                      }

                      /* All three named, and named from the first frame they
                         are live — see the note on the wrapper below.
                         Uniqueness is not in question: only one letter is ever
                         `front && open`, so only one letter's three exist, and
                         the names are built from its slug and theirs.
                         Naming only the one being pressed would be tidier to
                         read and is wrong — the wrapper would appear on the
                         click, React would see a new element in that position,
                         and the item would REMOUNT. The rise it is holding is
                         an animation with a `both` fill, so remounting plays it
                         again from zero: measured, the paper letter dropped the
                         full 143px back into the envelope on the frame it was
                         pressed.
                         The other two go nowhere regardless. `share="morph"`
                         activates the name only when a partner with the same
                         name is arriving, and `default="none"` turns it off for
                         every other condition — so the two nobody pressed stay
                         inside the page's own snapshot and ride the camera down
                         with it, which is what should happen to them. Drop
                         either prop and the pair silently stops morphing. */
                      return (
                        <Link
                          key={item.src}
                          href={contentHref(letter, item)}
                          className="letter__item"
                          style={style}
                          data-go={item.slug === leaving ? "" : undefined}
                          onClick={onFollow(item)}
                          aria-label={`Open the ${item.label} from ${letter.name}`}
                        >
                          {/* The name goes on the FLOAT and not on the link.
                              A view transition positions a captured element by
                              the box it is drawn in, transform and all — and
                              the float's whole job is to be the transform the
                              leaving beat spends. Named one box further out,
                              the snapshot would be taken against the link's
                              box, which does not move, and the paper would
                              set off from a hand's breadth below where the
                              reader is looking at it. */}
                          <ViewTransition
                            name={contentView(letter.slug, item.slug)}
                            share="morph"
                            default="none"
                          >
                            {art}
                          </ViewTransition>
                        </Link>
                      );
                    })}
                  </div>

                  {/* 3 — the envelope's front. It alone is in flow: it sets the
                      size of everything else, and it is what their percentages
                      mean. */}
                  <div className="letter__layer letter__layer--body">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="letter__art"
                      src={ENVELOPE.src}
                      alt=""
                      draggable={false}
                    />
                    <span
                      className="letter__tint"
                      style={
                        {
                          "--tint": PALETTE[letter.colour],
                          "--tint-src": `url("${ENVELOPE.src}")`,
                        } as CssVars
                      }
                      aria-hidden="true"
                    />
                  </div>

                  {/* 3b — the same envelope's front pocket, which takes the
                      closed one's place once the wax is broken. Same box, same
                      1.408, so nothing on its face moves when they trade. */}
                  <div
                    className="letter__layer letter__layer--front"
                    aria-hidden="true"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="letter__art"
                      src={OPEN_FRONT.src}
                      alt=""
                      draggable={false}
                      decoding="async"
                    />
                    <span
                      className="letter__tint"
                      style={
                        {
                          "--tint": PALETTE[letter.colour],
                          "--tint-src": `url("${OPEN_FRONT.src}")`,
                        } as CssVars
                      }
                    />
                  </div>

                  {/* The pocket, for the pointer only.
                      Nothing is drawn here: this is the front's silhouette
                      traced as a clip, so that a click on the envelope's paper
                      stops at the paper. The three things inside are links now,
                      and their boxes run on down behind the pocket — without
                      this, the lower half of the envelope would be the paper
                      letter's hit area, and pressing the envelope would open a
                      page nobody aimed at.
                      It cannot be the front layer itself wearing the clip: that
                      layer's artwork casts a drop-shadow, and a clip-path cuts
                      the shadow off with everything else outside the shape. */}
                  <span className="letter__pocket" aria-hidden="true" />

                  {/* The arrows, once the three things are up and still.
                      Outside the bundle, because the bundle is clipped at the
                      envelope's foot and one of these is drawn below it — and
                      because these do not rise, they arrive where they belong.
                      Hidden from a reader who is not looking at the page: the
                      links say what they are and where they go, and an arrow
                      read aloud says nothing. */}
                  {live ? (
                    <div className="letter__guides" aria-hidden="true">
                      {CONTENTS.map((item) => (
                        <span
                          key={item.src}
                          className="letter__guide"
                          data-ink={item.guide.ink}
                          style={guideVars(item)}
                        >
                          <span className="letter__arrow" />
                          <span className="letter__guide-note">Click here</span>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* 2 — the name card. */}
                  <div
                    className="letter__layer letter__layer--card"
                    style={layerVars(NAME_CARD)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="letter__art"
                      src={NAME_CARD.src}
                      alt=""
                      draggable={false}
                      decoding="async"
                    />
                    {/* Written over the card, never into it: the card is one
                        image for every letter, and only these lines change. */}
                    <span className="letter__written">
                      <span className="letter__prefix">{letter.prefix}</span>
                      <span className="letter__given">{letter.name}</span>
                      <span className="letter__surname">{letter.surname}</span>
                    </span>
                  </div>

                  {/* 3 — the seal. Drawn, not pressed: what a reader presses is
                      the whole envelope below, and the wax is what tells them
                      the envelope is worth pressing. */}
                  <span
                    className="letter__seal"
                    style={layerVars(SEAL)}
                    aria-hidden="true"
                  >
                    {/* The wax twice over, each copy clipped to one side of the
                        seam, so that when it breaks there are two things to move
                        instead of one thing to fade. Drawing it twice costs
                        nothing: it is the same cached image both times. */}
                    {(["left", "right"] as const).map((side) => (
                      <span
                        key={side}
                        className="letter__shard"
                        style={{ "--clip": seam[side] } as CssVars}
                        data-side={side}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="letter__art"
                          src={SEAL.src}
                          alt=""
                          draggable={false}
                          decoding="async"
                        />
                        <span
                          className="letter__tint"
                          style={
                            {
                              "--tint": SEALS[letter.seal],
                              "--tint-src": `url("${SEAL.src}")`,
                            } as CssVars
                          }
                        />
                      </span>
                    ))}
                    <span
                      className="letter__crack"
                      style={{ "--clip": seam.line } as CssVars}
                    />
                  </span>
                </div>

                {/* The letter IS the button — all of it, wax and paper alike.
                    Which button depends only on where the letter is standing: at
                    the front it breaks the seal, behind it comes forward. One
                    element either way, so a letter is one stop on the keyboard
                    and one thing to aim at with a thumb.

                    It rides inside the stack so it is carried by the same
                    transforms as the paper it covers — outside, it would sit
                    where the letter is not. And it is a sibling of the seal,
                    never a parent: one button inside another is not a thing HTML
                    will honour.

                    Gone once the seal is broken. There is nothing left to do to
                    a letter that is open and at the front, and a button that
                    does nothing is still a stop on the way to the ones that do. */}
                {front && open ? null : (
                  <button
                    type="button"
                    className="letter__target"
                    onClick={front ? onOpen : onPick}
                    aria-label={
                      front
                        ? `Open the letter from ${letter.name}`
                        : `Bring the letter from ${letter.name} to the front`
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
