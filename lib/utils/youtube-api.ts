import type { YouTubeApi } from "@/types/youtube";

/**
 * The IFrame API, fetched once and never on load.
 *
 * Module-level rather than per-component, because the script is global and two
 * players asking for it at the same moment must not append two copies of it.
 * Asked for when a cassette is first pressed, or when the museum opens with
 * its song, and not before: nothing third-party has any business on this page
 * until there is music to play.
 */
let arriving: Promise<YouTubeApi> | null = null;

export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (arriving) return arriving;
  arriving = new Promise<YouTubeApi>((resolve, reject) => {
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
export const YOUTUBE_NOCOOKIE = "https://www.youtube-nocookie.com";
