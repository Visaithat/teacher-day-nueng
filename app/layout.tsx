import type { Metadata, Viewport } from "next";
import {
  Allura,
  Architects_Daughter,
  Caveat,
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Gloria_Hallelujah,
  Noto_Sans_Lao,
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

/**
 * The lyrics on the record's page.
 *
 * Every other face here is Latin-only, and a Lao line set in one of them falls
 * back to whatever the machine happens to have - which is a different font per
 * reader and, on some, boxes. This is the one thing on the card written in a
 * script the rest of it does not cover.
 */
const notoLao = Noto_Sans_Lao({
  variable: "--font-lao",
  subsets: ["lao"],
  weight: ["400", "600"],
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

/**
 * The window the card is drawn on.
 *
 * `viewportFit: "cover"` is the reason this export exists at all: without it
 * `env(safe-area-inset-*)` is zero on every device, and the two controls that
 * live in the corners of the cloth — the way back and the Skip — have nothing
 * to keep them out from under a notch or a rounded corner. Next's default
 * covers the other two fields; they are written out because a viewport whose
 * scale is left to a default is a viewport somebody will change by accident.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /* The card scrolls smoothly on purpose — the home page's hint is an
         anchor down to the mailbox, and it is the only thing left that scrolls.
         Saying so here tells Next that the `scroll-behavior` in globals.css is
         wanted, so it stops warning that a route change might be smooth-scrolled
         as well. The card has one route now and never changes it, so that half
         of the bargain costs nothing and the anchor keeps its smoothness. */
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${allura.variable} ${architectsDaughter.variable} ${gloriaHallelujah.variable} ${cormorant.variable} ${caveat.variable} ${notoLao.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
