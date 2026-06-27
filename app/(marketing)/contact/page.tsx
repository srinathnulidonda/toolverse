// app/(marketing)/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Contact Toolverse",
    template: "%s · Toolverse",
  },
  description: "Get in touch with the Toolverse team for support, feedback, or business inquiries.",
  keywords: ["contact", "support", "feedback", "toolverse", "help"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolverse.app/contact",
    siteName: "Toolverse",
    title: "Contact Toolverse - Support & Feedback",
    description: "Reach out to the Toolverse team for questions, bug reports, or feature suggestions.",
    images: [
      {
        url: "https://toolverse.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact Toolverse - Get in touch with our team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Toolverse - Support & Feedback",
    description: "Reach out to the Toolverse team for questions, bug reports, or feature suggestions.",
  },
};

export default function ContactPage() {
  return (
    <div className="page-container">
      <header className="mb-12">
        <h1>Contact Us</h1>
        <p className="text-secondary">
          We value your feedback and are here to help. Reach out through any of the channels below.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="mb-6">Get in Touch</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Support & Feedback */}
          <div className="space-y-4">
            <h3 className="font-medium">Support & Feedback</h3>
            <p>
              Have a question about using our tools? Found a bug? Want to suggest a new feature?
              We're here to help.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>GitHub Discussions:</strong>{" "}
                <a href="https://github.com/srinathnulidonda/toolverse/discussions"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-brand hover:underline">
                  Report bugs, request features, or ask questions
                </a>
              </li>
              <li>
                <strong>Email Support:</strong>{" "}
                <a href="mailto:support@toolverse.app"
                   className="text-brand hover:underline">
                  support@toolverse.app
                </a>
              </li>
            </ul>
            <p className="text-sm text-secondary">
              We typically respond within 1-2 business days. For urgent security
              concerns, please use our{" "}
              <a href="https://github.com/srinathnulidonda/toolverse/security/advisories"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-brand hover:underline">
                Security Advisory process
              </a>
            </p>
          </div>

          {/* Business & Partnerships */}
          <div className="space-y-4">
            <h3 className="font-medium">Business & Partnerships</h3>
            <p>
              Interested in collaborating with Toolverse? We welcome partnerships
              that align with our privacy-first mission.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Partnership Inquiries:</strong>{" "}
                <a href="mailto:partnerships@toolverse.app"
                   className="text-brand hover:underline">
                  partnerships@toolverse.app
                </a>
              </li>
              <li>
                <strong>Press/Media:</strong>{" "}
                <a href="mailto:press@toolverse.app"
                   className="text-brand hover:underline">
                  press@toolverse.app
                </a>
              </li>
              <li>
                <strong>Legal Notices:</strong>{" "}
                <a href="mailto:legal@toolverse.app"
                   className="text-brand hover:underline">
                  legal@toolverse.app
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6">Our Commitment to You</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium">Privacy First</h3>
            <p className="text-sm">
              We never collect personal data through our contact channels.
              Any information you share is used solely to respond to your
              inquiry and is not stored for marketing purposes.
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium">Transparency</h3>
            <p className="text-sm">
              We believe in open communication. All interactions with our team
              are handled with honesty and respect for your time.
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium">Security</h3>
            <p className="text-sm">
              We take your security seriously. For vulnerability reports,
              please use our coordinated disclosure process via GitHub.
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium">Accessibility</h3>
            <p className="text-sm">
              We strive to make our tools and communications accessible to
              everyone. If you encounter accessibility issues, please let us know.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6">Company Information</h2>
        <div className="space-y-4">
          <p>
            <strong>Toolverse</strong> is a community-driven project focused on
            providing free, privacy-respecting online tools.
          </p>
          <p>
            <strong>Website:</strong> <a href="https://toolverse.app"
                                        className="text-brand hover:underline">
              toolverse.app
            </a>
          </p>
          <p>
            <strong>GitHub Repository:</strong>{" "}
            <a href="https://github.com/srinathnulidonda/toolverse"
               target="_blank"
               rel="noopener noreferrer"
               className="text-brand hover:underline">
              github.com/srinathnulidonda/toolverse
            </a>
          </p>
        </div>
      </section>

      <Link href="/" className="inline-block px-6 py-3 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors">
        Return to Home
      </Link>
    </div>
  );
}