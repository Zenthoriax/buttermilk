import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Outcognito",
    template: "%s · Outcognito",
  },

  description:
    "A social network where your browser becomes the content.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}