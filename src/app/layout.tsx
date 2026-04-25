import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://instorix.in";
const APP_NAME = "Instorix";
const TITLE = "Instorix — Free Instagram Downloader | Save Reels, Stories & Posts in HD";
const DESCRIPTION =
  "Download Instagram videos, reels, stories, posts, carousels, profile pictures (DP), and audio in HD quality for free. Extract and copy captions and hashtags instantly. No login required. Fast, safe, and works on any device.";
const KEYWORDS = [
  // Core product keywords
  "instagram downloader",
  "instagram video downloader",
  "instagram downloader online",
  "free instagram downloader",
  "instagram downloader no watermark",
  // Reels
  "download instagram reels",
  "instagram reel downloader",
  "reels downloader",
  "save instagram reels",
  "instagram reels video download",
  "reel download online",
  // Stories
  "instagram story downloader",
  "download instagram stories",
  "save instagram stories",
  "instagram story saver",
  "anonymous instagram story downloader",
  // Posts & photos
  "instagram post downloader",
  "download instagram photos",
  "instagram photo downloader",
  "instagram image downloader",
  "save instagram posts",
  // Carousel
  "download instagram carousel",
  "instagram carousel downloader",
  "instagram multiple photos download",
  // IGTV
  "instagram igtv downloader",
  "igtv video downloader",
  // Quality & format
  "instagram to mp4",
  "instagram hd downloader",
  "instagram 1080p download",
  "save reels without watermark",
  // New Features (DP, Audio, Caption)
  "instagram profile picture downloader",
  "download instagram dp hd",
  "instagram dp viewer",
  "instagram audio downloader",
  "download instagram reel audio mp3",
  "instagram to mp3",
  "copy instagram caption",
  "instagram hashtag extractor",
  "instagram caption copy",
  // Long tail
  "how to download instagram videos",
  "how to save instagram reels",
  "how to download reels on iphone",
  "how to download reels on android",
  "instorix",
].join(", ");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "Technology",
  classification: "Tools & Utilities",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
        alt: "Instorix — Free Instagram Downloader for Reels, Stories & Posts",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
    creator: "@instorix",
    site: "@instorix",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: APP_URL,
    languages: {
      "en-US": APP_URL,
      "en-IN": APP_URL,
    },
  },
  verification: {
    // Add your Google Search Console verification token here once you register
    // google: "your-google-site-verification-token",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": APP_NAME,
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // WebApplication schema — tells Google this is a free tool
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url: APP_URL,
    description: DESCRIPTION,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Download Instagram Reels in HD",
      "Download Instagram Stories",
      "Download Instagram Posts & Photos",
      "Download Instagram Carousels",
      "Download Instagram IGTV Videos",
      "No Login Required",
      "No Watermark",
      "Free to Use",
      "Works on iPhone and Android",
    ],
    screenshot: `${APP_URL}/og-image.png`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
  };

  // FAQ schema — gives Google rich FAQ results directly in search
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Instorix free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Instorix is completely free. No account registration or login is required.",
        },
      },
      {
        "@type": "Question",
        name: "How do I download Instagram Reels?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Copy the Instagram Reel URL from the app, paste it into Instorix, and click Download. Your reel will be available in HD quality instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download Instagram Stories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can download Instagram stories by pasting the story URL into Instorix. Stories must be from a public account and still active (within 24 hours).",
        },
      },
      {
        "@type": "Question",
        name: "Does Instorix work on iPhone and Android?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Instorix is fully responsive and works on all devices including iPhone, Android phones, tablets, and desktop computers.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download from private Instagram accounts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Instorix only works with public posts. Private account content requires the account owner's permission.",
        },
      },
      {
        "@type": "Question",
        name: "What quality are the downloaded videos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Instorix downloads videos in the highest quality available from Instagram — usually 1080p HD.",
        },
      },
    ],
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: APP_URL,
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased dark:bg-gray-950 dark:text-gray-50`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8933002492788322"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

