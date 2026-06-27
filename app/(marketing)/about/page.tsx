// app/(marketing)/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "About Toolverse",
    template: "%s · Toolverse",
  },
  description: "Discover how Toolverse empowers productivity with privacy-first browser tools that require no sign-ups or data collection.",
  keywords: ["online tools", "privacy tools", "browser tools", "free utilities", "productivity"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolverse.app/about",
    siteName: "Toolverse",
    title: "About Toolverse - Privacy-First Browser Tools",
    description: "Learn how Toolverse provides free online tools that run entirely in your browser with zero data collection.",
    images: [
      {
        url: "https://toolverse.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Toolverse - Privacy-first online tools suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Toolverse - Privacy-First Browser Tools",
    description: "Learn how Toolverse provides free online tools that run entirely in your browser with zero data collection.",
  },
};

export default function AboutPage() {
  return (
    <div className="page-container">
      <header className="mb-12">
        <h1>About Toolverse</h1>
        <p className="text-secondary">
          Free, privacy-focused online tools that run entirely in your browser
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4">Our Mission</h2>
        <p>
          To democratize access to essential digital tools by eliminating barriers
          like registration, payments, and privacy concerns. We believe powerful
          productivity tools should be accessible to everyone without compromising
          personal data.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">How We Work</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Zero Data Collection:</strong> We don't collect, store, or
            transmit any personal information or file data.
          </li>
          <li>
            <strong>Client-Side Processing:</strong> All tool functionality runs
            100% in your browser using standard web technologies.
          </li>
          <li>
            <strong>No Sign-Ups Required:</strong> Instant access to all tools
            without creating an account or providing email addresses.
          </li>
          <li>
            <strong>Completely Free:</strong> No hidden costs, premium tiers,
            or usage limits - forever.
          </li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">Our Commitment to Privacy</h2>
        <p>
          Unlike conventional online services that monetize user data, Toolverse
          operates on a different principle: your data is yours alone. We
          architecturally prevent data collection by ensuring all processing
          happens locally in your browser - there are no servers involved in
          tool operations.
        </p>
        <p>
          This approach provides:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Complete confidentiality of your files and data
          </li>
          <li>
            Protection against data breaches (since we store nothing)
          </li>
          <li>
            Freedom from tracking, profiling, and targeted advertising
          </li>
          <li>
            Compliance with GDPR, CCPA, and other privacy regulations by design
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">Tool Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">PDF Tools</h3>
            <p className="text-sm text-secondary">
              Compress, merge, split, convert, and rotate PDFs
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Image Tools</h3>
            <p className="text-sm text-secondary">
              Resize, convert, compress, and edit images
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Developer Tools</h3>
            <p className="text-sm text-secondary">
              JSON formatter, Base64 encoder, URL encoder, hash generator, and more
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Finance Tools</h3>
            <p className="text-sm text-secondary">
              GST, EMI, SIP, and compound interest calculators
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Resume Tools</h3>
            <p className="text-sm text-secondary">
              Resume builder, ATS checker, cover letter generator
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Social Tools</h3>
            <p className="text-sm text-secondary">
              QR code generator, OG preview, meta tag generator
            </p>
          </div>
        </div>
      </section>

      <Link href="/" className="inline-block px-6 py-3 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors">
        Explore All Tools
      </Link>
    </div>
  );
}