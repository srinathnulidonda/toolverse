// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
        "online tools",
        "free tools",
        "productivity tools"
    ],
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL ?? "https://toolverse.app"
    ),
    openGraph: {
        type: "website",
        siteName: "Toolverse",
        title: "Toolverse — Free Utility Hub for Everyone",
        description:
            "Every tool you need daily. PDF · Images · Finance · Dev · Resume — no sign-up ever. All tools run 100% in your browser - your files never leave your device.",
        url: "/",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Toolverse - Free online utilities for PDF, images, finance, development and resume tasks"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Toolverse — Free Utility Hub for Everyone",
        description:
            "Every tool you need daily. PDF · Images · Finance · Dev · Resume — no sign-up ever. All tools run 100% in your browser.",
        images: ["/twitter-image.png"]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    // Additional SEO enhancements
    alternates: {
        canonical: "/",
        languages: {
            en: "/",
            "en-US": "/",
        }
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler-icons-webfont@1.118.0/tabler-icons.min.css" />

                {/* Favicon - using favicon.png */}
                <link rel="icon" href="/favicon.png" type="image/png" />
                <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
                <link rel="icon" href="/favicon.png" sizes="16x16" type="image/png" />
                <link rel="apple-touch-icon" href="/favicon.png" />

                <link rel="manifest" href="/manifest.json" />

                {/* Theme color for mobile browsers */}
                <meta name="theme-color" content="#145C3C" />
            </head>
            <body>
                {/* Skip navigation link */}
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                {/* Navbar */}
                <Navbar />

                {/* ── Page content pushed below navbar height (52px) ── */}
                <div className="layout-content">
                    <main id="main-content" className="layout-main">{children}</main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}