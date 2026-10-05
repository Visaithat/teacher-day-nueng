"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import { CREDITS_SONG } from "@/lib/constants/credits";
import { loadYouTubeApi, YOUTUBE_NOCOOKIE } from "@/lib/utils/youtube-api";
import type { YouTubeApi, YouTubePlayer } from "@/types/youtube";

export type MuseumSong = {
  /** Where the unseen player is built. It replaces this element with its iframe. */
  slot: RefObject<HTMLDivElement | null>;
  /**
   * How loud the song is, 0 → 1, of `CREDITS_SONG.volume`. Called from the
   * museum's frame loop with whatever the timeline has reached. It reaches 0
   * and the song pauses; it rises again and the song resumes where it stopped.
   */
  level: (value: number) => void;
  /** The player answered: there is a song, and so something to mute. */
  ready: boolean;
  /** The reader has turned the song off. It stays off until they turn it on. */
  muted: boolean;
  toggle: () => void;
};

/**
 * The song under the museum walk, out of an unseen YouTube player.
 *
 * Built only while `on`, which is the 3D room. The plain gallery stays silent
 * and never fetches YouTube's script.
 *
 * This hook owns the player and nothing about timing. The fades are the
 * museum timeline's, so the song cannot drift from the dark it is leaving for.
 *
 * A browser that refuses to start it with sound (iOS, Safari) gets asked again
 * on the reader's next press or key. Scrolling is not a gesture a browser
 * honours for sound, so the walk alone cannot unlock it.
 *
 * It starts on its own, so the reader is given the means to stop it: `toggle`
 * silences it whatever the timeline asks for, and nothing here starts it again
 * behind their back. An upload that refuses
 * to be embedded, or a script that never arrives, leaves the museum silent and
 * otherwise as it was.
 */
export function useMuseumSong(on: boolean): MuseumSong {
  const slot = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const yt = useRef<YouTubeApi | null>(null);
  /** The level last asked for, kept for the player to catch up to once ready. */
  const want = useRef(0);
  /** The volume last handed to the player, so a still level sends nothing. */
  const sent = useRef(-1);
  /** Whether the song is meant to be playing, as last told to the player. */
  const going = useRef(false);
  /** The reader's own off switch, as a ref for the frame loop and as state for
      the button that shows it. */
  const quiet = useRef(false);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  /** Bring the player in line with `want`. A no-op until it is ready. */
  const apply = useCallback(() => {
    const p = player.current;
    if (!p) return;
    const asked = quiet.current ? 0 : Math.max(0, Math.min(1, want.current));
    const volume = Math.round(asked * CREDITS_SONG.volume * 100);
    if (volume !== sent.current) {
      p.setVolume(volume);
      sent.current = volume;
    }
    const audible = volume > 0;
    if (audible === going.current) return;
    going.current = audible;
    if (audible) p.playVideo();
    else p.pauseVideo();
  }, []);

  useEffect(() => {
    if (!on) return;
    let alive = true;
    /* Held here as well as in the ref, so a page left before the player is
       ready still takes it down. */
    let built: YouTubePlayer | null = null;

    void loadYouTubeApi()
      .then((YT) => {
        if (!alive || !slot.current) return;
        yt.current = YT;
        const made = new YT.Player(slot.current, {
          videoId: CREDITS_SONG.id,
          host: YOUTUBE_NOCOOKIE,
          playerVars: {
            playsinline: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            /* One video loops only when it is also its own playlist. */
            loop: 1,
            playlist: CREDITS_SONG.id,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!alive) return;
              player.current = made;
              sent.current = -1;
              going.current = false;
              setReady(true);
              apply();
            },
          },
        });
        built = made;
      })
      .catch(() => undefined);

    /* A refused start, asked again from a press - which is what allows it.
       On the way UP, and on the click: a finger going down is not a gesture a
       browser will start sound for, only one coming off the glass is. */
    const retry = () => {
      const p = player.current;
      const PLAYING = yt.current?.PlayerState.PLAYING;
      if (p && going.current && p.getPlayerState() !== PLAYING) p.playVideo();
    };
    const presses = ["pointerup", "click", "keydown"] as const;
    for (const press of presses) document.addEventListener(press, retry, true);

    return () => {
      alive = false;
      for (const press of presses) document.removeEventListener(press, retry, true);
      setReady(false);
      built?.destroy();
      player.current = null;
      going.current = false;
      sent.current = -1;
    };
  }, [on, apply]);

  const level = useCallback(
    (value: number) => {
      want.current = value;
      apply();
    },
    [apply],
  );

  /* Called from the press itself, so turning it back on is a gesture the
     browser will honour. */
  const toggle = useCallback(() => {
    quiet.current = !quiet.current;
    setMuted(quiet.current);
    apply();
  }, [apply]);

  return { slot, level, ready, muted, toggle };
}
