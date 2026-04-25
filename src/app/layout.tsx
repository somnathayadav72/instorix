import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://instorix.com";
const APP_NAME = "Instorix";
const TITLE = "Instorix — Free Instagram Downloader | Save Reels, Stories & Posts";
const DESCRIPTION =
  "Download Instagram videos, reels, stories, posts, carousels and IGTV in HD quality for free. No login required. Works on any device. Fast and easy.";
const KEYWORDS = [
  "instagram downloader",
  "instagram video downloader",
  "download instagram reels",
  "instagram reel downloader",
  "instagram story downloader",
  "download instagram stories",
  "save instagram videos",
  "instagram post downloader",
  "download instagram photos",
  "instagram photo downloader",
  "free instagram downloader",
  "instagram to mp4",
  "instagram hd downloader",
  "save reels without watermark",
  "download instagram carousel",
  "instagram igtv downloader",
  "instorix",
].join(", ");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: `%s — ${APP_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME, url: APP_URL }],
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
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: APP_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Instorix — Free Instagram Downloader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },
  alternates: {
    canonical: APP_URL,
  },
  category: "tool",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url: APP_URL,
    description: DESCRIPTION,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Download Instagram Reels",
      "Download Instagram Stories",
      "Download Instagram Posts",
      "Download Instagram Carousels",
      "Download Instagram IGTV",
      "HD Quality Downloads",
      "No Login Required",
      "Free to Use",
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
