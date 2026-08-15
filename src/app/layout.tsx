import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from "@/lib/site";
import SiteCursor from "@/components/SiteCursor";
import MetaPixel from "@/components/MetaPixel";

const drukWide = localFont({
  src: [
    { path: "../fonts/DrukWide-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/DrukWide-Heavy.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const jslBlackletter = localFont({
  src: "../fonts/JBLACK.ttf",
  variable: "--font-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${drukWide.variable} ${jslBlackletter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-lt-yellow font-body">
        {children}
        <SiteCursor />
        <MetaPixel />
      </body>
    </html>
  );
}
