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
};

export default nextConfig;
