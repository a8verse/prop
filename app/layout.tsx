import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "Property Portal - Luxury Real Estate",
    template: "%s | Property Portal",
  },
  description: "B2B Real Estate Portal for viewing projects, price trends, and inventory. Find luxury properties, track price trends, and connect with channel partners.",
  keywords: ["real estate", "property", "luxury homes", "property portal", "B2B real estate", "property listings"],
  authors: [{ name: "Oliofly" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Property Portal",
    title: "Property Portal - Luxury Real Estate",
    description: "B2B Real Estate Portal for viewing projects, price trends, and inventory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Portal - Luxury Real Estate",
    description: "B2B Real Estate Portal for viewing projects, price trends, and inventory",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

