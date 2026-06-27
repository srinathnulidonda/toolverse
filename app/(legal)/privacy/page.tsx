// app/(legal)/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Privacy Policy - Toolverse",
    template: "%s · Toolverse",
  },
  description: "Toolverse Privacy Policy - Understanding our commitment to your data privacy and security.",
  keywords: ["privacy", "data protection", "GDPR", "CCPA", "toolverse", "online tools"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolverse.app/privacy",
    siteName: "Toolverse",
    title: "Toolverse Privacy Policy - Zero Data Collection",
    description: "Learn how Toolverse protects your privacy with zero data collection architecture.",
    images: [
      {
        url: "https://toolverse.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Toolverse Privacy Policy - Your data stays private",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse Privacy Policy - Zero Data Collection",
    description: "Learn how Toolverse protects your privacy with zero data collection architecture.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="page-container">
      <header className="mb-12">
        <h1>Privacy Policy</h1>
        <p className="text-secondary">
          Effective Date: June 24, 2026
        </p>
      </header>

      <section className="mb-14">
        <h2 className="mb-4">Our Privacy Promise</h2>
        <p className="text-lg">
          At Toolverse, we believe your data belongs to you alone. Unlike
          conventional online services that monetize user information, we've
          built our platform on a foundational principle: <strong>zero data
          collection</strong>. This isn't just a policy - it's how our
          technology works by design.
        </p>
        <p className="mt-4">
          When you use Toolverse, all processing happens 100% locally in your
          browser. Your files, data, and personal information never leave your
          computer. We don't have the technical capability to access, store, or
          transmit your information because we don't use servers for any
          processing, storage, or transmission.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">What We Collect (And What We Don't)</h2>
        <div className="space-y-6">
          {/* What We Don't Collect */}
          <div className="border rounded-lg p-6">
            <h3 className="font-medium mb-3 text-negative">
              ❌ We Do NOT Collect:
            </h3>
            <ul className="list-disc list-inside space-y-2 space-y-1">
              <li>
                Personal information (name, email, address, phone number, etc.)
              </li>
                <li>IP addresses or network information</li>
                <li>Browser fingerprinting data</li>
                <li>Usage analytics or behavioral tracking</li>
                <li>Cookies for advertising or tracking purposes</li>
                <li>Any data transferred to or stored on our servers</li>
                <li>File contents, metadata, or any information about your documents</li>
                <li>Tool usage patterns, preferences, or interaction data</li>
              </ul>
            </div>

          {/* What We Do Collect (Minimal & Essential) */}
          <div className="border rounded-lg p-6">
            <h3 className="font-medium mb-3">
              ✅ Essential Technical Data ONLY:
            </h3>
            <p className="mb-2">
              To provide basic website functionality, we may temporarily process:
            </p>
            <ul className="list-disc list-inside space-y-2 space-y-1 text-sm">
              <li>
                Session identifiers (temporary, deleted when browser closes)
              </li>
              <li>
                Theme preferences (light/dark mode) stored in essential cookies
              </li>
              <li>
                HTTP headers necessary for web page delivery (standard browser
                transmission)
              </li>
            </ul>
            <p className="mt-3 text-sm text-secondary">
              <strong>Important:</strong> This data is used solely for technical
              website functionality and is never associated with your identity,
              tool usage, or personal information.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">How We Protect Your Data</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-5 border rounded-lg">
            <h3 className="font-medium mb-3">Client-Side Architecture</h3>
            <p className="text-sm">
              All tool processing occurs 100% in your browser using standard
              web technologies (JavaScript, HTML, CSS). No data is ever sent to
              our servers for processing, storage, or analysis.
            </p>
          </div>
          <div className="p-5 border rounded-lg">
            <h3 className="font-medium mb-3">No Server Storage</h3>
            <p className="text-sm">
              We do not operate databases, file storage systems, or any
              backend infrastructure capable of retaining user data. Our
              servers only serve the static web application files.
            </p>
          </div>
          <div className="p-5 border rounded-lg">
            <h3 className="font-medium mb-3">Encryption in Transit</h3>
            <p className="text-sm">
              All communication between your browser and our servers uses
              industry-standard HTTPS/TLS encryption to protect data during
              transmission (like loading the website or checking for updates).
            </p>
          </div>
          <div className="p-5 border rounded-lg">
            <h3 className="font-medium mb-3">Cookie Minimalism</h3>
            <p className="text-sm">
              We use only essential cookies required for basic website
              functionality (session management, theme preferences). We do not
              use analytics, advertising, or tracking cookies of any kind.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Your Rights and Controls</h2>
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-medium mb-3">Data Access & Portability</h3>
            <p className="mb-2">
              Since we don't collect or store your personal data, there is no
              personal data to access, correct, export, or delete. Your
              information remains exclusively on your device throughout your
              session.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-medium mb-3">Privacy Contacts</h3>
            <p className="mb-2">
              If you have questions about our privacy practices or wish to
              exercise your privacy rights, please contact us at:
            </p>
            <p className="font-medium">
              <a href="mailto:privacy@toolverse.app"
                 className="text-brand hover:underline">
                privacy@toolverse.app
              </a>
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-medium mb-3">Children's Privacy</h3>
            <p className="mb-2">
              Our service is general audience and not directed to children
              under 13. Since we collect no personal information from any
              users, we do not knowingly collect data from children under 13.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time to reflect
          changes in our practices or for legal compliance. When we make
          changes, we will:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Post the updated policy on this page with a revised effective date
          </li>
          <li>
            Provide notice through our website when changes are significant
          </li>
          <li>
            Never apply changes retroactively to data collected prior to the
            effective date (though we collect no data to begin with)
          </li>
        </ol>
        <p className="mt-4">
          Your continued use of Toolverse following any changes constitutes
          acceptance of the updated privacy policy.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4">Contact Us</h2>
        <p className="mb-4">
          For questions about this Privacy Policy or our privacy practices,
          please reach out to our dedicated privacy team:
        </p>
        <p className="font-medium mb-2">
          <a href="mailto:privacy@toolverse.app"
             className="text-brand hover:underline">
            privacy@toolverse.app
          </a>
        </p>
        <p className="text-sm text-secondary">
          We review and respond to all privacy-related inquiries promptly.
        </p>
      </section>

      <Link href="/" className="inline-block px-6 py-3 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors">
        Return to Home
      </Link>
    </div>
  );
}