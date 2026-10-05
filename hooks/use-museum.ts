"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import {
  CREDITS_CLIP,
  CREDITS_FINALE,
  CREDITS_FONT_WAIT_MS,
  CREDITS_PEOPLE,
  CREDITS_SCROLL,
  CREDITS_SONG,
  CREDITS_SPARKLES,
  CREDITS_TIMING,
} from "@/lib/constants/credits";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useEnterFocus } from "@/hooks/use-enter-focus";
import { useMuseumSong } from "@/hooks/use-museum-song";
import type { MessageLine, MuseumFonts, MuseumState } from "@/types/credits";

/** The walk through the 3D room, or the plain gallery that stands in for it. */
export type MuseumView = "room" | "plain";

export type Museum = {
  view: MuseumView;
  /** Whether the room is built and the "opening" card can lift. */
  ready: boolean;
  /** Where each written line runs, once the message has been measured. */
  lines: MessageLine[] | null;
  /** The finale is running: the walk is held still until it is over. */
  playing: boolean;
  /** The browser would only play the clip muted; offer the sound by hand. */
  needsSound: boolean;
  /** The walk is over but the clip is still downloading: hold in the dark. */
  clipWaiting: boolean;
  /** Straight to the writing, past whatever is left of the clip. */
  skip: () => void;
  /** Turn the clip's sound on, from a press - which is what allows it. */
  unmute: () => void;
  /** The song's one control, or null while there is no song to control. */
  songControl: { muted: boolean; toggle: () => void } | null;
  /** The page's landmark: it scrolls the walk, and takes focus on arrival. */
  scroller: RefObject<HTMLElement | null>;
  track: RefObject<HTMLDivElement | null>;
  stage: RefObject<HTMLDivElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  video: RefObject<HTMLVideoElement | null>;
  /** Where the unseen player for the song under the walk is built. */
  songSlot: RefObject<HTMLDivElement | null>;
  fills: [RefObject<SVGTextElement | null>, RefObject<SVGTextElement | null>];
  sparkles: RefObject<HTMLDivElement | null>;
};

const wait = (ms: number) => new Promise<void>((done) => window.setTimeout(done, ms));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** How fast the clip leaves when it is cut short rather than ending, in s. */
const CUT_FADE_S = 0.6;

/**
 * A `font` family list for a face next/font has loaded, read off the root.
 * The hashed family name is only known at run time, and the canvas has to
 * letter the plates in it.
 */
function familyOf(variable: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
}

/**
 * Hand the parts of the state that live in the page rather than the room to
 * the stylesheet, as custom properties: the dark, the glow, the hint, the
 * clip, the pen and the two written lines, and each sparkle's own reveal.
 */
function paintOverlay(stage: HTMLElement, S: MuseumState, lines: MessageLine[], sparkles: HTMLCollection) {
  const set = (name: string, v: number) => stage.style.setProperty(name, v.toFixed(4));
  /* The finale's blackout lies over whatever dark the scroll has reached. */
  set("--night", lerp(S.night, 1, S.blackout));
  set("--glow", S.glow * (1 - S.blackout));
  set("--hint", S.hint);
  set("--clip", S.clip);
  set("--pen", S.pen);
  set("--line-1", S.line1);
  set("--line-2", S.line2);
  set("--fill-1", S.fill1);
  set("--fill-2", S.fill2);
  /* The nib is on whichever line is being written. */
  const [l1, l2] = lines;
  const onSecond = S.line2 > 0;
  set("--pen-x", onSecond ? lerp(l2.x0, l2.x1, S.line2) : lerp(l1.x0, l1.x1, S.line1));
  set("--pen-y", onSecond ? l2.y : l1.y);
  for (let i = 0; i < sparkles.length; i++) {
    (sparkles[i] as HTMLElement).style.setProperty("--spark", S.sparkles[i].p.toFixed(4));
  }
}

/**
 * The end credits' museum: built when the page opens, walked by scrolling.
 *
 * A song plays under the walk from the moment the room is up, and leaves as
 * the room goes dark, so the clip has the sound to itself.
 *
 * The walk ends in the dark. Reaching the foot of the track starts the finale,
 * which runs on a clock rather than the scroll: the room goes to black, the
 * clip fades up and plays with its sound, fades away as it ends, and the
 * thank-you writes itself. The walk is held still while that plays, and a
 * reader who scrolls back up afterwards finds it reset, ready to play again.
 *
 * Reduced motion is asked once, at the moment the page decides which museum to
 * show - a reader who wants less motion gets the plain gallery, everything on
 * it at once. So does a browser with no WebGL, or one that cannot fetch the
 * room's code: anything that throws on the way in lands there too.
 *
 * three.js and GSAP are imported here, on demand, and nowhere at the top of a
 * file. They are most of the weight of this scene and nothing else on the card
 * needs them.
 *
 * The walk scrolls the page's own landmark, never the document, so the rest of
 * the card does not move under it. That landmark is also where focus lands.
 */
export function useMuseum(): Museum {
  const scroller = useEnterFocus<HTMLElement>();
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fill1 = useRef<SVGTextElement>(null);
  const fill2 = useRef<SVGTextElement>(null);
  const sparkles = useRef<HTMLDivElement>(null);
  /* What the two presses reach into: the finale lives inside the effect. */
  const controls = useRef<{ skip: () => void; unmute: () => void } | null>(null);

  /* Decided as the page mounts, which is the moment it is decided: this is
     which museum is built, not a copy of the preference. */
  const [view, setView] = useState<MuseumView>(() => (prefersReducedMotion() ? "plain" : "room"));
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<MessageLine[] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);
  const [clipWaiting, setClipWaiting] = useState(false);
  /* Whether the walk is somewhere the song plays: from the room being ready
     to the foot of the track, and again once the reader has scrolled back. */
  const [songDue, setSongDue] = useState(false);
  const song = useMuseumSong(view === "room");
  const songLevel = song.level;

  useEffect(() => {
    if (view !== "room") return;
    const scrollEl = scroller.current;
    const trackEl = track.current;
    const stageEl = stage.current;
    const canvasEl = canvas.current;
    const videoEl = video.current;
    const fillEls = [fill1.current, fill2.current];
    const sparkEls = sparkles.current;
    if (!scrollEl || !trackEl || !stageEl || !canvasEl || !videoEl || !fillEls[0] || !fillEls[1] || !sparkEls) return;

    let cancelled = false;
    let stop = () => {};
    const clipAbort = new AbortController();
    let clipUrl: string | null = null;
    /* Whether the clip is in hand yet, so the finale knows to wait. */
    let clipIn = false;

    (async () => {
      try {
        /* The clip is fetched whole, into memory, the moment the museum opens -
           alongside the room's own code, not after it. Streamed from the
           server instead, a browser buffers only a little ahead and the clip
           stuttered or stalled whenever the connection fell behind; played
           from memory it cannot. The walk gives the download a minute or so
           of head start, and the finale waits in the dark if it needs more. */
        /* Asked for quietly, though: the portraits and the room's code are
           wanted in seconds and this in a minute, and at the same urgency it
           took the line from both. */
        const clipReady = fetch(CREDITS_CLIP.src, { signal: clipAbort.signal, priority: "low" })
          .then((response) => {
            if (!response.ok) throw new Error(`clip ${response.status}`);
            return response.blob();
          })
          .then((blob) => {
            clipUrl = URL.createObjectURL(blob);
            videoEl.src = clipUrl;
          })
          .catch(() => {
            /* Torn down, or the fetch failed: stream it after all, which is
               still better than no clip. */
            if (!clipAbort.signal.aborted) videoEl.src = CREDITS_CLIP.src;
          })
          .then(() => {
            if (clipAbort.signal.aborted) return;
            videoEl.load();
            clipIn = true;
          });

        const fonts: MuseumFonts = {
          serif: familyOf("--font-letter", '"Cormorant Garamond"'),
          script: familyOf("--font-vibes", '"Great Vibes"'),
        };
        /* The plates are painted once, so the faces have to be here first -
           but not at any price. */
        const faces = Promise.all([
          document.fonts.load(`700 88px ${fonts.serif}`),
          document.fonts.load(`italic 500 88px ${fonts.serif}`),
          document.fonts.load(`96px ${fonts.script}`),
        ]).catch(() => undefined);
        const [{ gsap }, { ScrollTrigger }, { buildMuseum }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("@/lib/utils/museum-scene"),
          Promise.race([faces, wait(CREDITS_FONT_WAIT_MS)]),
        ]);
        if (cancelled) return;

        const room = buildMuseum(canvasEl, fonts, stageEl.clientWidth, stageEl.clientHeight);

        /* Where each line of the message runs, measured in the script face. */
        const measured = fillEls.map((el) => {
          const b = el!.getBBox();
          return { x0: b.x - 10, x1: b.x + b.width + 10, y: b.y + b.height * 0.62 };
        });
        setLines(measured);

        const S: MuseumState = {
          door: 0,
          enter: 0,
          cam: -1,
          lightsOff: 0,
          night: 0,
          glow: 0,
          hint: 1,
          song: 0,
          clip: 0,
          blackout: 0,
          pen: 0,
          line1: 0,
          line2: 0,
          fill1: 0,
          fill2: 0,
          sparkles: CREDITS_SPARKLES.map(() => ({ p: 0 })),
        };

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });

        /* --- the finale ----------------------------------------------------- */

        /* idle → dark (going to black, clip starting) → clip (playing) →
           write (clip gone, words coming) → done. */
        let phase: "idle" | "dark" | "clip" | "write" | "done" = "idle";
        let finale: gsap.core.Timeline | null = null;
        /* The song has its own tween, apart from the finale, so killing one
           never strands the other halfway. */
        let songFade: gsap.core.Tween | null = null;
        const fadeSong = (to: number, duration: number) => {
          songFade?.kill();
          songFade = gsap.to(S, { song: to, duration, ease: "power1.inOut" });
        };

        /** The clip down and away, then the thank-you written. */
        const write = (fade: number) => {
          if (phase !== "dark" && phase !== "clip") return;
          phase = "write";
          finale?.kill();
          const F = CREDITS_FINALE;
          const w = gsap.timeline({
            defaults: { ease: "none" },
            onComplete: () => {
              phase = "done";
              setPlaying(false);
            },
          });
          w.to(S, { clip: 0, duration: fade, ease: "power1.in" }, 0);
          w.call(() => videoEl.pause(), [], fade);
          let t = fade;
          /* The black lifts back to the scroll's own dark, and the glow with it. */
          w.to(S, { blackout: 0, duration: F.glow, ease: "power1.inOut" }, t);
          t += F.glow * 0.6;
          ([1, 2] as const).forEach((n) => {
            const d = n === 1 ? F.line1 : F.line2;
            w.to(S, { pen: 1, duration: F.pen }, t);
            w.to(S, { [`line${n}`]: 1, duration: d, ease: "sine.inOut" }, t);
            w.to(S, { [`fill${n}`]: 1, duration: d * 0.5 }, t + d * 0.6);
            t += d;
          });
          w.to(S, { pen: 0, duration: F.pen * 3 }, t);
          w.to(S.sparkles, { p: 1, duration: F.sparkles * 0.6, stagger: F.sparkles * 0.05, ease: "back.out(2)" }, t);
          finale = w;
        };

        /* Start the clip from the top, with sound if the browser allows it and
           muted with an offer of sound if it does not. A clip that cannot play
           at all goes straight to the words. */
        const playClip = () => {
          videoEl.currentTime = 0;
          videoEl.volume = 0;
          videoEl.muted = false;
          videoEl.play().catch((error: unknown) => {
            if (phase !== "clip") return;
            if (error instanceof DOMException && error.name === "NotAllowedError") {
              videoEl.muted = true;
              setNeedsSound(true);
              videoEl.play().catch(() => write(CUT_FADE_S));
            } else {
              write(CUT_FADE_S);
            }
          });
        };

        /** Up from black, once the clip is in memory. */
        const reveal = () => {
          if (phase !== "clip") return;
          setClipWaiting(false);
          playClip();
          finale = gsap.timeline().to(S, { clip: 1, duration: CREDITS_CLIP.fadeIn, ease: "power1.out" });
        };

        const start = () => {
          if (phase !== "idle") return;
          phase = "dark";
          setPlaying(true);
          const C = CREDITS_CLIP;
          /* The song leaves with the light: silent before the clip starts. */
          fadeSong(0, C.darken);
          setSongDue(false);
          const d = gsap.timeline();
          d.to(S, { blackout: 1, duration: C.darken, ease: "power1.inOut" }, 0);
          d.call(
            () => {
              phase = "clip";
              /* Nearly always already here. If the reader walked faster than
                 it downloaded, the room holds in the black until it is. */
              if (!clipIn) setClipWaiting(true);
              void clipReady.then(reveal);
            },
            [],
            C.darken,
          );
          finale = d;
        };

        /** Back to before the finale: the reader has scrolled up again. */
        const reset = () => {
          finale?.kill();
          finale = null;
          phase = "idle";
          videoEl.pause();
          videoEl.currentTime = 0;
          Object.assign(S, { clip: 0, blackout: 0, pen: 0, line1: 0, line2: 0, fill1: 0, fill2: 0 });
          for (const s of S.sparkles) s.p = 0;
          setPlaying(false);
          setNeedsSound(false);
          setClipWaiting(false);
          fadeSong(1, CREDITS_SONG.fadeIn);
          setSongDue(true);
        };

        /* The clip ending is the clip's business, not the clock's: a file this
           size can pause to buffer, and a fade timed from the start would cut
           it short. So the fade begins from the clip's own time (in the frame
           loop below), and `ended` and `error` are there for a clip that never
           reports one. */
        const onEnded = () => {
          if (phase === "clip" || phase === "dark") write(CUT_FADE_S);
        };
        videoEl.addEventListener("ended", onEnded);
        videoEl.addEventListener("error", onEnded);


        controls.current = {
          skip: () => {
            setClipWaiting(false);
            write(CUT_FADE_S);
          },
          unmute: () => {
            videoEl.muted = false;
            setNeedsSound(false);
          },
        };

        /* --- the walk ------------------------------------------------------- */

        const ctx = gsap.context(() => {
          const T = CREDITS_TIMING;
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: trackEl,
              scroller: scrollEl,
              start: "top top",
              end: "bottom bottom",
              scrub: CREDITS_SCROLL.scrub,
            },
          });

          /* One: the doors open and the camera walks through. */
          tl.to(S, { hint: 0, duration: 0.15 }, 0);
          tl.to(S, { door: 1, duration: 0.6, ease: "power1.inOut" }, 0);
          tl.to(S, { enter: 1, duration: T.entrance - 0.2, ease: "power1.inOut" }, 0.2);

          /* Two: frame to frame. */
          let t = T.entrance + 0.15;
          for (let i = 0; i < CREDITS_PEOPLE.length; i++) {
            tl.to(S, { cam: i, duration: T.pan, ease: "sine.inOut" }, t);
            t += T.pan + T.hold;
          }

          /* Three: the lights go out and the dark comes in. The rest plays on
             its own from the foot of the track. */
          tl.to(S, { lightsOff: 1, night: 0.55, duration: T.lightsOff }, t);
          t += T.lightsOff;
          tl.to(S, { night: 0.9, glow: 1, duration: T.darkness }, t);
          t += T.darkness;
          tl.to({}, { duration: T.clipCue }, t);

          /* The foot of the track, give or take a pixel or two of rounding. */
          ScrollTrigger.create({
            trigger: trackEl,
            scroller: scrollEl,
            start: "bottom bottom+=2",
            onEnter: start,
            onLeaveBack: reset,
          });
        });

        const fit = new ResizeObserver(() => room.fit(stageEl.clientWidth, stageEl.clientHeight));
        fit.observe(stageEl);

        let raf = 0;
        const frame = () => {
          /* While the clip has the whole screen the room is under solid black,
             so it is not drawn at all - the decoder gets the machine to itself
             rather than sharing it with a 3D render no one can see. */
          if (!(phase === "clip" && S.blackout >= 1)) room.draw(S);
          songLevel(S.song);
          paintOverlay(stageEl, S, measured, sparkEls.children);
          if (phase === "clip" || phase === "write") {
            /* The sound rises and falls with the picture. */
            videoEl.volume = clamp01(S.clip);
            const end = videoEl.duration - CREDITS_CLIP.tail;
            if (phase === "clip" && Number.isFinite(end) && videoEl.currentTime >= end - CREDITS_CLIP.fadeOut) {
              write(CREDITS_CLIP.fadeOut);
            }
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        /* Before the refresh, not after it. A reader already at the foot of
           the track when the room is ready has the finale started from inside
           `refresh()`, and a fade-in asked for afterwards would cancel the
           fade-out that began there and play the song over the clip. */
        fadeSong(1, CREDITS_SONG.fadeIn);
        setSongDue(true);
        ScrollTrigger.refresh();
        setReady(true);

        stop = () => {
          cancelAnimationFrame(raf);
          fit.disconnect();
          finale?.kill();
          songFade?.kill();
          videoEl.pause();
          videoEl.removeEventListener("ended", onEnded);
          videoEl.removeEventListener("error", onEnded);
          controls.current = null;
          ctx.revert();
          room.dispose();
        };
      } catch {
        if (!cancelled) setView("plain");
      }
    })();

    return () => {
      cancelled = true;
      clipAbort.abort();
      stop();
      if (clipUrl) URL.revokeObjectURL(clipUrl);
    };
  }, [view, scroller, songLevel]);

  const skip = useCallback(() => controls.current?.skip(), []);
  /* Only while there is a song to speak of: the player answered, and the walk
     is somewhere it plays. */
  const songControl = song.ready && songDue ? { muted: song.muted, toggle: song.toggle } : null;
  const unmute = useCallback(() => controls.current?.unmute(), []);

  return {
    view,
    ready,
    lines,
    playing,
    needsSound,
    clipWaiting,
    skip,
    unmute,
    songControl,
    scroller,
    track,
    stage,
    canvas,
    video,
    songSlot: song.slot,
    fills: [fill1, fill2],
    sparkles,
  };
}
