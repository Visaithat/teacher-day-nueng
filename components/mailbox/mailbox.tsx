"use client";

import { useEffect, useState } from "react";

import {
  ARROW_ART,
  DOOR,
  FLOWERS,
  GIFT,
  GIFT_ART,
  KEY_ART,
  KEY_REST_ROTATE,
  KEYHOLE,
  MAILBOX_ART,
  MAILBOX_TIMING,
} from "@/lib/constants/mailbox";
import type { CssVars } from "@/types/css-vars";
import { useKeyDrag } from "@/hooks/use-key-drag";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";

/** The present's entry: from the flap clearing the box to the box at rest. */
const GIFT_SETTLE_MS = MAILBOX_TIMING.giftDelay + MAILBOX_TIMING.gift;
/** Its reduced-motion twin, from the bottom of mailbox.css. */
const CALM_GIFT_SETTLE_MS = 360;

interface MailboxProps {
  /** The present has been opened. The box handed over is where the light starts. */
  onOpenPresent: (from: DOMRect) => void;
}

/** The third page: a locked mail box, and a key to open it with. */
export default function Mailbox({ onOpenPresent }: MailboxProps) {
  const { state, announcement, keyRef, tipRef, holeRef, boxRef, handlers } =
    useKeyDrag();

  const opened = state === "open";

  // Not `opened` itself: the present spends the better part of a second on its
  // way up out of the box, invisible for most of it, and a button nobody can
  // see is a button nobody should be able to press — or tab to.
  const [giftReady, setGiftReady] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const calm = prefersReducedMotion();
    const timer = window.setTimeout(
      () => setGiftReady(true),
      calm ? CALM_GIFT_SETTLE_MS : GIFT_SETTLE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [opened]);

  return (
    <section
      id="mailbox"
      className="mailbox"
      data-state={state}
      data-gift={giftReady ? "ready" : undefined}
      tabIndex={-1}
      style={
        {
          "--art-ratio": MAILBOX_ART.ratio,
          "--door-left": `${DOOR.left}%`,
          "--door-top": `${DOOR.top}%`,
          "--door-width": `${DOOR.width}%`,
          "--door-height": `${DOOR.height}%`,
          "--door-colour": DOOR.colour,
          "--door-radius": `${DOOR.radius}%`,
          "--hole-x": `${KEYHOLE.x}%`,
          "--hole-y": `${KEYHOLE.y}%`,
          "--gift-left": `${GIFT.left}%`,
          "--gift-bottom": `${GIFT.bottom}%`,
          "--gift-width": `${GIFT.width}%`,
          "--gift-ratio": GIFT.ratio,
          "--seat-ms": `${MAILBOX_TIMING.seat}ms`,
          "--turn-ms": `${MAILBOX_TIMING.turn}ms`,
          "--door-ms": `${MAILBOX_TIMING.door}ms`,
          "--door-delay": `${MAILBOX_TIMING.doorDelay}ms`,
          "--gift-ms": `${MAILBOX_TIMING.gift}ms`,
          "--gift-delay": `${MAILBOX_TIMING.giftDelay}ms`,
          "--key-rest": `${KEY_REST_ROTATE}deg`,
        } as CssVars
      }
    >
      {/* The first line is stale the moment the box is open, and this is the
          only place on the page with room to say what to do next. */}
      <h1 className="mailbox__title">
        {giftReady
          ? "There\u2019s a present inside. Open it!"
          : "You\u2019ve received mails in your post!"}
      </h1>

      <div className="mailbox__stage">
        <div className="mailbox__box" ref={boxRef}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mailbox__art"
            src={MAILBOX_ART.src}
            alt={MAILBOX_ART.alt}
            draggable={false}
          />

          {/* The cavity clips its contents, so the present's glow fills the
              mouth of the box instead of leaking through its front. It is no
              longer aria-hidden: the one thing inside it is now the whole point
              of the page. */}
          <span className="mailbox__interior">
            <button
              type="button"
              className="mailbox__gift"
              /* `disabled`, not the `aria-disabled` the key uses, and the two
                 are not inconsistent. The key lies on the table in plain sight
                 and has to be able to say that it is spent. The present is
                 behind a shut flap: until that flap is off it should not be in
                 the tab order and should not be announced at all, or a reader's
                 screen reader gives the surprise away. A disabled button is not
                 focusable, which is what makes aria-hidden legal here. */
              disabled={!giftReady}
              aria-hidden={giftReady ? undefined : true}
              aria-label="Open the present"
              onClick={(event) =>
                onOpenPresent(event.currentTarget.getBoundingClientRect())
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={GIFT_ART.src}
                alt=""
                width={GIFT_ART.width}
                height={GIFT_ART.height}
                draggable={false}
                decoding="async"
              />
            </button>
          </span>

          <span className="mailbox__door" aria-hidden="true">
            <span className="mailbox__door-hole" />
          </span>

          {/* Last, so they stand in front of the box's feet and the flap sails
              away behind them. */}
          {FLOWERS.map((flower) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={flower.src}
              className={`mailbox__flower ${flower.className}`}
              src={flower.src}
              alt=""
              aria-hidden="true"
              draggable={false}
              decoding="async"
            />
          ))}

          {/* A zero-size marker the drag measures against. */}
          <span className="mailbox__hole-point" ref={holeRef} aria-hidden="true" />
        </div>

        <div className="mailbox__aside">
          <p className="mailbox__instruction">
            Drag the key to
            <br />
            open the mail box.
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mailbox__arrow"
            src={ARROW_ART.src}
            alt=""
            aria-hidden="true"
            draggable={false}
          />

          <button
            type="button"
            className="mailbox__key"
            ref={keyRef}
            aria-label={
              opened
                ? "The mail box is open."
                : "Key. Drag it to the keyhole, or press Enter to unlock the mail box."
            }
            aria-disabled={opened || undefined}
            {...handlers}
          >
            <span className="key__travel">
              <span className="key__lie">
                <span className="key__turn">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={KEY_ART.src}
                    alt=""
                    width={KEY_ART.width}
                    height={KEY_ART.height}
                    draggable={false}
                    decoding="async"
                  />
                  <span className="key__tip" ref={tipRef} aria-hidden="true" />
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
