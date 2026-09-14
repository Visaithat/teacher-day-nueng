import type { Metadata } from "next";
import {
  Allura,
  Architects_Daughter,
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
      className={`${geistSans.variable} ${geistMono.variable} ${allura.variable} ${architectsDaughter.variable} ${gloriaHallelujah.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
