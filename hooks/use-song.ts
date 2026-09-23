"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Song } from "@/types/mails";
import type { SongState } from "@/types/song";

/* --- the script ----------------------------------------------------------- */

type Player = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allow: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type Api = {
  Player: new (
    el: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => Player;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: Api;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * The IFrame API, fetched once and never on load.
 *
 * Module-level rather than per-component, because the script is global and two
 * players asking for it at the same moment must not append two copies of it.
 * Asked for on the first press and not before: nothing third-party has any
 * business on this page until a reader has said they want music.
 */
let arriving: Promise<Api> | null = null;

function api(): Promise<Api> {
  if (arriving) return arriving;
  arriving = new Promise<Api>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    /* The API calls exactly one global when it is ready, so whatever was there
       before is called too rather than dropped on the floor. */
    const before = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      before?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("the player arrived without a Player"));
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => reject(new Error("the player did not load"));
    document.head.append(tag);
  });
  /* One failed load must not poison every later press: the reader may simply
     have been offline for a moment. */
  void arriving.catch(() => {
    arriving = null;
  });
  return arriving;
}

/**
 * The cookieless host, for the PLAYER only. A reader came here for a card, not
 * to be counted.
 *
 * The script above still comes from `www.youtube.com`, and it has to: there is
 * no `iframe_api` on the cookieless host, and pointing at one gets a 404, a
 * rejected promise, and a cassette that says it was refused when it was not.
 * Measured, not assumed — that is exactly what happened when it was tried.
 *
 * The cost of the mismatch is one warning, once, when the API first talks to
 * an iframe on an origin it was not served from. Counted over a play, a pause
 * and a second play: one line, and no errors. Worth a cookie not set.
 */
const NOCOOKIE = "https://www.youtube-nocookie.com";

/** Past this and the upload is not going to play here. */
const PATIENCE = 8000;

export function useSong(song: Song, level = 1) {
  const [state, setState] = useState<SongState>("idle");
  const [played, setPlayed] = useState(0);
  const [at, setAt] = useState(0);
  const [span, setSpan] = useState(0);
  /* Seeded rather than set afterwards, so a page that opens playing does not
     spend its first moment at a volume nobody asked for. */
  const [volume, setLevel] = useState(level);

  const slot = useRef<HTMLDivElement | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const player = useRef<Player | null>(null);
  const alive = useRef(true);

  /**
   * Read the needle once, from whichever of the two is playing.
   *
   * Everything that moves the needle calls this rather than setting `played`
   * on its own, so the fraction, the seconds and the length can never disagree
   * about where the song is.
   */
  const mark = useCallback(() => {
    const now = player.current?.getCurrentTime() ?? audio.current?.currentTime;
    const all = player.current?.getDuration() ?? audio.current?.duration;
    if (all && Number.isFinite(all)) setSpan(all);
    if (now !== undefined) {
      setAt(now);
      if (all) setPlayed(Math.min(1, now / all));
    }
  }, []);

  /* --- the needle --------------------------------------------------------- */

  /**
   * Polled rather than pushed, and only while something is playing.
   *
   * The `<audio>` element does have a `timeupdate`, but it fires about four
   * times a second and the needle would step rather than travel; the hidden
   * player has nothing of the kind at all. One rAF covers both, and it is not
   * running when nothing is.
   */
  useEffect(() => {
    if (state !== "playing") return;
    let frame = 0;
    const read = () => {
      mark();
      frame = requestAnimationFrame(read);
    };
    frame = requestAnimationFrame(read);
    return () => cancelAnimationFrame(frame);
  }, [state, mark]);

  /** The level the reader set, kept on the element through every reload of it. */
  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  /* --- going, and stopping ------------------------------------------------ */

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      player.current?.destroy();
      player.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    /* A file. Nothing to fetch and nothing to wait for — and the state follows
       the element's own events rather than this click, so a stall or a refused
       autoplay cannot leave the button lying about what is happening. */
    if (song.kind === "file") {
      const el = audio.current;
      if (!el) return;
      if (el.paused) void el.play();
      else el.pause();
      return;
    }

    if (player.current) {
      if (state === "playing") player.current.pauseVideo();
      else player.current.playVideo();
      return;
    }
    if (state === "waking") return;

    setState("waking");
    const giveUp = window.setTimeout(() => {
      if (alive.current && !player.current) setState("refused");
    }, PATIENCE);

    void api()
      .then((YT) => {
        window.clearTimeout(giveUp);
        if (!alive.current || !slot.current) return;
        player.current = new YT.Player(slot.current, {
          videoId: song.id,
          host: NOCOOKIE,
          playerVars: {
            playsinline: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            /* The press that got here IS the gesture that autoplay-with-sound
               wants, so this is allowed to start on its own. */
            onReady: () => player.current?.playVideo(),
            onStateChange: ({ data }) => {
              if (!alive.current) return;
              if (data === YT.PlayerState.PLAYING) setState("playing");
              else if (data === YT.PlayerState.PAUSED) setState("paused");
              else if (data === YT.PlayerState.ENDED) {
                setState("paused");
                setPlayed(1);
              }
            },
            /**
             * Refused. Whoever uploaded a video can switch embedding off, and
             * one of these two is a label's own upload — the kind most likely
             * to have. There is no way to know without asking, so the page
             * asks, and hands the reader the link rather than a dead button.
             */
            onError: () => {
              if (alive.current) setState("refused");
            },
          },
        });
      })
      .catch(() => {
        window.clearTimeout(giveUp);
        if (alive.current) setState("refused");
      });
  }, [song, state]);

  /**
   * Start it without being asked, and say whether that was allowed.
   *
   * For the one page that opens already playing. {@link toggle} is no use
   * there: its file branch throws the rejected `play()` away, and a refusal is
   * the whole reason this returns anything - a page that believes it is playing
   * when it is not shows a pause button over silence.
   *
   * It lives in the hook rather than in the page because the element belongs to
   * the hook; a caller reaching into the ref to start it is reaching past the
   * thing that owns it.
   */
  const start = useCallback(async () => {
    const el = audio.current;
    if (!el) return false;
    try {
      await el.play();
      return true;
    } catch {
      return false;
    }
  }, []);

  const seek = useCallback(
    (to: number) => {
      const where = Math.min(1, Math.max(0, to));
      setPlayed(where);
      if (player.current) {
        const all = player.current.getDuration();
        if (all) {
          player.current.seekTo(where * all, true);
          setAt(where * all);
        }
        return;
      }
      const el = audio.current;
      if (el?.duration) {
        el.currentTime = where * el.duration;
        mark();
      }
    },
    [mark],
  );

  /**
   * Forward or back by a handful of seconds.
   *
   * {@link seek} speaks only in fractions, which is all a scrubber ever needs
   * and no use at all to a button that means "ten seconds". This is the same
   * move in the units the button is labelled in.
   *
   * It marks afterwards rather than waiting for the needle: the rAF above runs
   * only while something is playing, so a skip on a paused song would otherwise
   * move the audio and leave the bar standing where it was.
   */
  const nudge = useCallback(
    (seconds: number) => {
      if (player.current) {
        const all = player.current.getDuration();
        const to = Math.min(all, Math.max(0, player.current.getCurrentTime() + seconds));
        player.current.seekTo(to, true);
        setAt(to);
        if (all) setPlayed(Math.min(1, to / all));
        return;
      }
      const el = audio.current;
      if (!el || !Number.isFinite(el.duration)) return;
      el.currentTime = Math.min(el.duration, Math.max(0, el.currentTime + seconds));
      mark();
    },
    [mark],
  );

  /** What an `<audio>` reports, wired to the same state the hidden player sets. */
  const fileEvents = {
    onPlay: () => setState("playing"),
    onPause: () => setState("paused"),
    onEnded: () => setState("paused"),
    /* Both of these are for the times the rAF is not running: the length as
       soon as it is known, and a coarse tick while paused so a skip lands
       somewhere the page can see. */
    onLoadedMetadata: mark,
    onTimeUpdate: mark,
  };

  return {
    state,
    played,
    /** Where the needle is, in seconds. */
    at,
    /** How long the whole thing is, in seconds. Zero until it is known. */
    span,
    toggle,
    start,
    seek,
    nudge,
    volume,
    /** Only an `<audio>` answers this; the hidden player has no volume to set. */
    setVolume: setLevel,
    slot,
    audio,
    fileEvents,
  };
}
