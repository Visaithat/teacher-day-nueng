/** YouTube's IFrame API: the unseen player, and the script that builds it. */

/** The few calls the card makes on a built player. */
export type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allow: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  /** 0 to 100, in whole steps. */
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
};

export type YouTubeApi = {
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
  ) => YouTubePlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}
