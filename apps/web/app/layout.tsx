import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Outcognito — Your browser has opinions.",
  description:
    "A privacy-first browser-behavior social platform. Your browsing habits become AI-generated social moments — without exposing sensitive data.",
  keywords: [
    "Outcognito",
    "browser extension",
    "privacy",
    "AI social",
    "behavioral analytics",
  ],
  openGraph: {
    title: "Outcognito",
    description: "Your browser has opinions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
