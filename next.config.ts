import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The card used to be three URLs. It is one now, and these are the old ones.
   *
   * A redirect rather than a 404: these links have been handed to people, and
   * what is at the end of one should be the card rather than an error page. One
   * rule and not two, because `:path*` is zero-or-more - so a half-remembered
   * `/mails/one` lands on the card as surely as the whole of `/mails/one/letter`
   * does.
   *
   * Not permanent. A 308 is cached by a browser for good, and this is a card
   * that may yet grow pages again.
   */
  async redirects() {
    return [{ source: "/mails/:path*", destination: "/", permanent: false }];
  },

  /**
   * The pictures, tapes and clip in `public/`, kept by the browser for a day.
   *
   * Left alone they are revalidated on every visit - some eighty requests to
   * be told nothing changed. A day and not a year, and not `immutable`: these
   * names carry no hash, and a photograph replaced under its own name has to
   * be able to reach a reader who has seen the old one. Past the day a stale
   * copy is still shown at once while the fresh one is fetched behind it.
   */
  async headers() {
    return [
      {
        source: "/:folder(art|audio|video|photos)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
