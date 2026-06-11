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
    ],
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL ?? "https://toolverse.com"
    ),
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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body>
                {/* Navbar */}
                <Navbar />

                {/* ── Page content pushed below navbar height (52px) ── */}
                <div className="layout-content">
                    <main className="layout-main">{children}</main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}