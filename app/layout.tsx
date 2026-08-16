// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FooterConditional from "@/components/layout/FooterConditional";
import FloatingWidget from "@/components/widgets/FloatingWidget";
import CookieBanner from "@/components/widgets/CookieBanner";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toolverses.vercel.app";
const SITE_NAME = "Toolverse";
const TABLER_ICONS_CSS =
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css";

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const BING_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: {
    default: "Toolverse — Free Utility Hub for Everyone",
    template: "%s · Toolverse",
  },
  description:
    "PDF, image, finance, dev, and resume tools — processed in your browser. No sign-up. No upload limits. Free forever.",
  applicationName: SITE_NAME,
  keywords: [
    "compress pdf",
    "merge pdf",
    "image compressor",
    "qr code generator",
    "json formatter",
    "resume builder",
    "gst calculator",
    "free online tools",
    "online utility tools",
    "browser based tools",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "any", type: "image/png" }],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.png"],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Toolverse — Free Utility Hub for Everyone",
    description:
      "Every tool you need daily. PDF · Images · Finance · Dev · Resume — no sign-up ever.",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Toolverse — Free Utility Hub for Everyone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse — Free Utility Hub for Everyone",
    description:
      "Every tool you need daily. PDF · Images · Finance · Dev · Resume — no sign-up ever.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  ...(GOOGLE_SITE_VERIFICATION || BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
          ...(BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  description:
    "PDF, image, finance, dev, and resume tools — processed in your browser. No sign-up. No upload limits. Free forever.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-US",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preload" href={TABLER_ICONS_CSS} as="style" />
        <link rel="stylesheet" href={TABLER_ICONS_CSS} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Navbar />

        <div className="layout-content">
          <main id="main-content" className="layout-main">
            {children}
          </main>
          <footer>
            <FooterConditional />
          </footer>
        </div>

        <FloatingWidget />
        <CookieBanner />
      </body>
    </html>
  );
}