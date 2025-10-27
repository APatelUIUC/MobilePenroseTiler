import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mobile Tiling Studio",
  description:
    "Design Penrose, triangular, square, and hexagonal tilings in the browser with responsive controls and instant PNG export.",
  keywords: [
    "Penrose",
    "tiling",
    "triangular",
    "hexagonal",
    "Next.js",
    "generator",
    "vercel",
  ],
  authors: [{ name: "Mobile Tiling Studio" }],
  openGraph: {
    title: "Mobile Tiling Studio",
    description:
      "Create Penrose, checkerboard, triangular, and honeycomb tilings directly in your browser and export high-resolution PNGs.",
    siteName: "Mobile Tiling Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Tiling Studio",
    description:
      "Generate customizable geometric tilings in seconds and download high-resolution PNGs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
