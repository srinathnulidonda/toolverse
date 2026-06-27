// app/(marketing)/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Frequently Asked Questions - Toolverse",
    template: "%s · Toolverse",
  },
  description: "Find answers to common questions about Toolverse tools, privacy, security, and usage.",
  keywords: ["faq", "help", "support", "toolverse", "questions", "privacy", "security"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolverse.app/faq",
    siteName: "Toolverse",
    title: "Toolverse FAQ - Frequently Asked Questions",
    description: "Get answers to common questions about Toolverse's privacy-first browser tools.",
    images: [
      {
        url: "https://toolverse.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Toolverse FAQ - Frequently asked questions about our tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse FAQ - Frequently Asked Questions",
    description: "Get answers to common questions about Toolverse's privacy-first browser tools.",
  },
};

export default function FAQPage() {
  return (
    <div className="page-container">
      <header className="mb-12">
        <h1>Frequently Asked Questions</h1>
        <p className="text-secondary">
          Find answers to common questions about Toolverse tools, privacy, and usage.
        </p>
      </header>

      {/* General Questions */}
      <section className="mb-10">
        <h2 className="mb-4">Getting Started</h2>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">Is Toolverse really free to use?</dt>
            <dd className="ml-4 text-secondary">
              Yes! All tools on Toolverse are 100% free with no hidden costs,
              premium tiers, subscription fees, or usage limits. We believe in
              providing accessible productivity tools without financial barriers.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Do I need to create an account?</dt>
            <dd className="ml-4 text-secondary">
              No account is required. All tools work instantly in your browser
              without any registration, email verification, or sign-up process.
              Just visit the site and start using tools immediately.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Do I need to install any software?</dt>
            <dd className="ml-4 text-secondary">
              No installation required. Toolverse is a web-based platform that
              runs entirely in your browser. There's nothing to download,
              install, or configure - just open your browser and go.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Can I use Toolverse on mobile devices?</dt>
            <dd className="ml-4 text-secondary">
              Absolutely! Toolverse is fully responsive and works seamlessly on
              smartphones and tablets. The interface automatically adapts to
              different screen sizes for optimal usability on mobile devices.
            </dd>
          </div>
        </dl>
      </section>

      {/* Privacy & Security */}
      <section className="mb-10">
        <h2 className="mb-4">Privacy & Security</h2>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">How does Toolverse protect my privacy?</dt>
            <dd className="ml-4 text-secondary">
              Toolverse is designed with privacy as a core principle. All tool
              processing happens 100% locally in your browser - your files and
              data never leave your computer. We don't use servers for any
              processing, storage, or transmission of your data, meaning we
              literally cannot access or collect your information.
            </dd>
          </div>
          <div>
            <dt className="font-medium">What data do you collect from users?</dt>
            <dd className="ml-4 text-secondary">
              We collect <strong>zero personal information</strong>. Unlike most
              online services, we do not require registration, email addresses,
              or any personal details to use our tools. The only data we may
              collect is anonymized, aggregated usage statistics (such as which
              tools are most popular) to help us improve our service - this
              data cannot be tied to any individual user.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Do you use cookies or tracking technologies?</dt>
            <dd className="ml-4 text-secondary">
              We use only essential cookies necessary for basic website
              functionality:
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Theme preference cookies (to remember your light/dark mode choice)</li>
                <li>Session cookies (temporary cookies that enable core functionality)</li>
              </ul>
              We do <strong>not</strong> use: analytics cookies, advertising or tracking
              cookies, third-party tracking scripts, fingerprinting techniques,
              or any other tracking technologies.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Is Toolverse compliant with privacy regulations?</dt>
            <dd className="ml-4 text-secondary">
              Yes. Since we don't collect personal data, we are inherently
              compliant with GDPR, CCPA, and other privacy regulations that
              govern personal data collection and processing. Our architecture
              prevents data collection by design.
            </dd>
          </div>
        </dl>
      </section>

      {/* Technical Questions */}
      <section className="mb-10">
        <h2 className="mb-4">Technical Details</h2>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">What browsers are supported?</dt>
            <dd className="ml-4 text-secondary">
              Toolverse works in all modern browsers including Chrome, Firefox,
              Safari, Edge, and Opera. We recommend using the latest version of
              your preferred browser for the best experience and security.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Are the tools available offline?</dt>
            <dd className="ml-4 text-secondary">
              Once loaded, many tools will continue to work offline since they
              run entirely in your browser. However, for initial loading and
              access to all tools, an internet connection is required. Some
              tools that require external references (like currency conversion
              rates) may need connectivity for full functionality.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Are there any file size or usage limits?</dt>
            <dd className="ml-4 text-secondary">
              Since processing happens locally in your browser, limits depend on
              your device's memory and processing power. Most tools handle
              typical file sizes easily, but extremely large files may be
              constrained by your device's capabilities rather than our
              platform. We impose no artificial limits on tool usage.
            </dd>
          </div>
          <div>
            <dt className="font-medium">How do you make money if everything is free?</dt>
            <dd className="ml-4 text-secondary">
              Toolverse is maintained as a passion project by volunteers who
              believe in accessible, privacy-respecting tools. We cover
              operational costs through minimal, ethical means and may consider
              non-intrusive sponsorships in the future that align with our
              privacy-first principles - never compromising user trust or data
              privacy.
            </dd>
          </div>
        </dl>
      </section>

      {/* Tool-Specific Questions */}
      <section className="mb-10">
        <h2 className="mb-4">Tool-Specific Questions</h2>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">What PDF tools are available?</dt>
            <dd className="ml-4 text-secondary">
              We offer a comprehensive suite of PDF tools including:
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>PDF compression (reduce file size while preserving quality)</li>
                <li>PDF merging (combine multiple PDFs into one document)</li>
                <li>PDF splitting (extract pages or split into separate files)</li>
                <li>PDF to Word conversion (.docx output)</li>
                <li>Word to PDF conversion</li>
                <li>PDF to JPG conversion (high-quality image output)</li>
                <li>JPG to PDF conversion</li>
                <li>PDF rotation (adjust page orientation)</li>
                <li>And more - all processed locally in your browser</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt className="font-medium">What image formats do you support?</dt>
            <dd className="ml-4 text-secondary">
              Our image converter supports transforming between JPG, PNG, WebP,
              AVIF, and GIF formats with quality preservation. We also offer
              specialized tools for image resizing, compression, cropping, and
              background removal.
            </dd>
          </div>
          <div>
            <dt className="font-medium">What developer tools are available?</dt>
            <dd className="ml-4 text-secondary">
              Our developer toolkit includes: JSON formatter/validator/minifier,
              Base64 encoder/decoder, URL encoder/decoder, JWT decoder, hash
              generator (MD5, SHA-1, SHA-256, SHA-512), timestamp converter,
              case converter (camelCase, snake_case, kebab-case, etc.), slug
              generator, diff checker, color converter (HEX, RGB, HSL, HSB),
              random string generator, HTML/CSS/JS minifiers, UUID generator,
              password generator, and regex tester.
            </dd>
          </div>
          <div>
            <dt className="font-medium">What finance tools do you offer?</dt>
            <dd className="ml-4 text-secondary">
              We provide practical financial calculators including: GST
              calculator, EMI loan calculator, SIP mutual fund calculator,
              compound interest calculator, currency converter (170+ currencies),
              salary calculator, discount calculator, and percentage calculator.
            </dd>
          </div>
          <div>
            <dt className="font-medium">What resume and career tools are available?</dt>
            <dd className="ml-4 text-secondary">
              Our resume toolkit helps you create professional application
              materials: ATS-friendly resume builder, resume checker for ATS
              compatibility, cover letter builder, LinkedIn summary generator,
              and related career tools - all designed to help you present your
              best professional self.
            </dd>
          </div>
          <div>
            <dt className="font-medium">What social media tools are available?</dt>
            <dd className="ml-4 text-secondary">
              We offer social media optimization tools including: QR code
              generator (for URLs, text, WiFi, vCards), OG image previewer,
              meta tag generator (SEO, Open Graph, Twitter Card), hashtag
              generator, and tweet card generator for creating shareable
              content.
            </dd>
          </div>
        </dl>
      </section>

      {/* Getting Help */}
      <section className="mb-10">
        <h2 className="mb-4">Need More Help?</h2>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">Where can I report bugs or suggest features?</dt>
            <dd className="ml-4 text-secondary">
              We welcome your feedback! Please visit our{" "}
              <a href="https://github.com/srinathnulidonda/toolverse/discussions"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-brand hover:underline">
                GitHub Discussions
              </a>
              to report bugs, request features, or ask questions. You can also
              open issues directly in our{" "}
              <a href="https://github.com/srinathnulidonda/toolverse/issues"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-brand hover:underline">
                GitHub Issues
              </a>
              for bug reports.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Is there documentation for the tools?</dt>
            <dd className="ml-4 text-secondary">
              Each tool includes contextual help and tooltips to guide you
              through its usage. For more complex operations, we recommend
              experimenting with sample files first to understand the
              functionality before working with important data.
            </dd>
          </div>
          <div>
            <dt className="font-medium">How do I stay updated on new features?</dt>
            <dd className="ml-4 text-secondary">
              Follow our development progress on{" "}
              <a href="https://github.com/srinathnulidonda/toolverse"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-brand hover:underline">
                GitHub
              </a>
              where we regularly post updates, release notes, and announcements
              about new tools and improvements.
            </dd>
          </div>
        </dl>
      </section>

      <Link href="/" className="inline-block px-6 py-3 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors">
        Explore All Tools
      </Link>
    </div>
  );
}