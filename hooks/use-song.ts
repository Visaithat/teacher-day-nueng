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

export function useSong(song: Song) {
  const [state, setState] = useState<SongState>("idle");
  const [played, setPlayed] = useState(0);

  const slot = useRef<HTMLDivElement | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const player = useRef<Player | null>(null);
  const alive = useRef(true);

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
      const now = player.current?.getCurrentTime() ?? audio.current?.currentTime;
      const all = player.current?.getDuration() ?? audio.current?.duration;
      if (now !== undefined && all) setPlayed(Math.min(1, now / all));
      frame = requestAnimationFrame(read);
    };
    frame = requestAnimationFrame(read);
    return () => cancelAnimationFrame(frame);
  }, [state]);

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

  const seek = useCallback((at: number) => {
    const where = Math.min(1, Math.max(0, at));
    setPlayed(where);
    if (player.current) {
      const all = player.current.getDuration();
      if (all) player.current.seekTo(where * all, true);
      return;
    }
    const el = audio.current;
    if (el?.duration) el.currentTime = where * el.duration;
  }, []);

  /** Nudge the needle by a number of seconds rather than a fraction of the whole. */
  const skip = useCallback(
    (seconds: number) => {
      const all = player.current?.getDuration() ?? audio.current?.duration;
      if (!all) return;
      seek(played + seconds / all);
    },
    [played, seek],
  );

  /**
   * Only the file plays at a level anyone can change — a hidden YouTube player
   * has its own volume control inside an iframe this page does not draw.
   */
  const setVolume = useCallback((at: number) => {
    const el = audio.current;
    if (el) el.volume = Math.min(1, Math.max(0, at));
  }, []);

  /** What an `<audio>` reports, wired to the same state the hidden player sets. */
  const fileEvents = {
    onPlay: () => setState("playing"),
    onPause: () => setState("paused"),
    onEnded: () => setState("paused"),
  };

  return { state, played, toggle, seek, skip, setVolume, slot, audio, fileEvents };
}
