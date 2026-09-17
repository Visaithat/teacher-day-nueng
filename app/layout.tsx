import type { Metadata } from "next";
import {
  Allura,
  Architects_Daughter,
  Caveat,
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Gloria_Hallelujah,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const architectsDaughter = Architects_Daughter({
  variable: "--font-postmark",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const gloriaHallelujah = Gloria_Hallelujah({
  variable: "--font-note",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** The type on the letters' name cards, and the scene's own serif. */
const cormorant = Cormorant_Garamond({
  variable: "--font-letter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/** The greeting over the letters. */
const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const allura = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
  display: "block",
});

export const metadata: Metadata = {
  title: "Greeting, Teacher Nueng",
  description: "It's been such a long time no talk",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /* The card scrolls smoothly on purpose — the home page's hint is an
         anchor down to the mailbox. Saying so here tells Next that the
         `scroll-behavior` in globals.css is wanted, so it stops warning that a
         route change might be smooth-scrolled as well: it turns the smoothness
         off for its own navigations and leaves the anchors alone. Which is
         exactly right now that /mails leads somewhere. */
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${allura.variable} ${architectsDaughter.variable} ${gloriaHallelujah.variable} ${cormorant.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
