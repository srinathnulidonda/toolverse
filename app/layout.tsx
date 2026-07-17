// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FooterConditional from "@/components/layout/FooterConditional";
import FloatingWidget from "@/components/widgets/FloatingWidget";

export const metadata: Metadata = {
  title: {
    default: "Toolverse — Free Utility Hub for Everyone",
    template: "%s · Toolverse",
  },
  description:
    "PDF, image, finance, dev, and resume tools — processed in your browser. No sign-up. No upload limits. Free forever.",
  keywords: [
    "compress pdf",
    "merge pdf",
    "image compressor",
    "qr code generator",
    "json formatter",
    "resume builder",
    "gst calculator",
    "free online tools",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://toolverses.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "Toolverse",
    title: "Toolverse — Free Utility Hub for Everyone",
    description:
      "Every tool you need daily. PDF · Images · Finance · Dev · Resume — no sign-up ever.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse — Free Utility Hub for Everyone",
    description:
      "Every tool you need daily. PDF · Images · Finance · Dev · Resume — no sign-up ever.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
        />

        {/* Favicon - using favicon.png */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Navbar */}
        <Navbar />

        {/* ── Page content pushed below navbar height (52px) ── */}
        <div className="layout-content">
          <main id="main-content" className="layout-main">
            {children}
          </main>
          <footer>
            <FooterConditional />
          </footer>
        </div>

        {/* 🚀 Floating Widget - Tasks & Notes available on all pages */}
        <FloatingWidget />
      </body>
    </html>
  );
}
