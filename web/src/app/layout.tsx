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
  title: "Mobile Penrose Tiler",
  description:
    "Generate customizable Penrose tilings in the browser with mobile-friendly controls and instant PNG export.",
  keywords: ["Penrose", "tiling", "aperiodic", "Next.js", "generator", "vercel"],
  authors: [{ name: "Mobile Penrose Tiler" }],
  openGraph: {
    title: "Mobile Penrose Tiler",
    description:
      "Create infinite, non-repeating Penrose tilings directly in your browser and export them as high-resolution PNGs.",
    siteName: "Mobile Penrose Tiler",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Penrose Tiler",
    description:
      "Generate customizable Penrose tilings in seconds and download high-resolution PNGs.",
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
