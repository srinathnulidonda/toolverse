// app/(legal)/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Terms of Service - Toolverse",
    template: "%s · Toolverse",
  },
  description: "Toolverse Terms of Service governing use of our online tools and website.",
  keywords: ["terms", "terms of service", "legal", "toolverse", "usage terms"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolverse.app/terms",
    siteName: "Toolverse",
    title: "Toolverse Terms of Service - Usage Terms",
    description: "Understand the terms governing your use of Toolverse's privacy-first browser tools.",
    images: [
      {
        url: "https://toolverse.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Toolverse Terms of Service - Clear usage guidelines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse Terms of Service - Usage Terms",
    description: "Understand the terms governing your use of Toolverse's privacy-first browser tools.",
  },
};

export default function TermsPage() {
  return (
    <div className="page-container">
      <header className="mb-12">
        <h1>Terms of Service</h1>
        <p className="text-secondary">
          Effective Date: June 24, 2026
        </p>
      </header>

      <section className="mb-14">
        <h2 className="mb-4">Acceptance of Terms</h2>
        <p>
          By accessing and using the Toolventure website (https://toolverse.app)
          and associated online tools (collectively, the "Service"), you agree
          to be bound by these Terms of Service and our Privacy Policy. If you
          do not agree to these terms, please do not use the Service.
        </p>
        <p>
          These terms govern your use of all Toolventure services, including
          but not limited to our PDF tools, image editors, developer
          utilities, finance calculators, resume builders, and social media
          tools.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Description of Service</h2>
        <p>
          Toolventure provides a collection of free online tools for PDF
          manipulation, image editing, development tasks, finance calculations,
          resume building, and social media utilities. All tools operate
          entirely in your browser - no uploads, no server processing, and no
          data collection.
        </p>
        <p className="mt-4">
          The Service is provided "as is" and "as available" without warranty
          of any kind, either express or implied. We do not guarantee that the
          Service will be uninterrupted, error-free, or free from harmful
          components.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Use License and Permissions</h2>
        <p className="mb-4">
          Subject to your compliance with these Terms, Toolventure grants you a
          limited, non-exclusive, non-transferable, revocable license to:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Access and use the tools on the Toolventure website for personal,
            non-commercial purposes only.
          </li>
          <li>
            Make temporary copies of the tool interfaces as necessary for
            viewing and interaction during your session.
          </li>
        </ol>
        <p className="mt-4">
          This license does not include:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            The right to resell or commercially use any tool or output
          </li>
          <li>
            The right to modify, decompile, disassemble, or reverse engineer
            any tool functionality
          </li>
          <li>
            The right to remove, alter, or circumvent any proprietary notices
            or technologies
          </li>
          <li>
            The right to frame or utilize framing techniques to enclose any
            Toolventure trademark, logo, or other proprietary information
          </li>
          <li>
            The right to use any meta tags or other "hidden text" utilizing
            Toolventure's name or trademarks without express written consent
          </li>
        </ul>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">User Responsibilities</h2>
        <p className="mb-4">
          As a condition of using the Service, you agree not to:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Use the Service for any unlawful purpose or in violation of any
            local, state, national, or international law
          </li>
          <li>
            Attempt to gain unauthorized access to Toolventure systems or
            networks
          </li>
          <li>
            Interfere with or disrupt the Service or servers connected to the
            Service
          </li>
          <li>
            Use the Service to transmit any viruses, worms, defects, Trojan
            horses, or other harmful items
          </li>
          <li>
            Use the Service to collect, harvest, or gather information about
            other users without their consent
          </li>
          <li>
            Remove any copyright, trademark, or other proprietary notices from
            the Service
          </li>
        </ol>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Intellectual Property</h2>
        <p className="mb-4">
          The Toolventure website, tools, and all associated content (including
          but not limited to text, graphics, logos, icons, images, audio clips,
          and software) are the property of Toolventure or its licensors and are
          protected by copyright, trademark, and other intellectual property
          laws.
        </p>
        <p className="mb-4">
          You acknowledge that you do not acquire any ownership rights by
          using the Service. All rights not expressly granted herein are
          reserved by Toolventure.
        </p>
        <p className="mt-4">
          You agree not to challenge Toolventure's ownership of the Service or
          any associated intellectual property rights.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Disclaimer of Warranties</h2>
        <p className="mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS
          PROVIDED "AS IS" AND "AS AVAILABLE" WITH ALL FAULTS AND WITHOUT
          WARRANTY OF ANY KIND. TOOLVENTURE DISCLAIMS ALL WARRANTIES, WHETHER
          EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT
          LIMITED TO:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Warranties of merchantability</li>
          <li>Warranties of fitness for a particular purpose</li>
          <li>Warranties of title or non-infringement</li>
          <li>Warranties arising from course of dealing or usage of trade</li>
        </ul>
        <p className="mt-4">
          Toolventure does not warrant that the Service will be uninterrupted,
          error-free, completely secure, or free from harmful components.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Limitation of Liability</h2>
        <p className="mb-4">
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
          SHALL TOOLVENTURE, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE
          LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
          INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
          GOOD-WILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
        </p>
        <ol className="decimal decimal">
          <li>
            Your access to or use of or inability to access or use the Service
          </li>
          <li>
            Any conduct or content of any third party on the Service
          </li>
          <li>
            Unauthorized access, use, or alteration of your transmissions or
            content
          </li>
          <li>
            Statements or conduct of any third party on the Service
          </li>
          <li>
            Any other matter relating to the Service
          </li>
        </ol>
        <p className="mt-4">
          IN NO EVENT SHALL TOOLVENTURE'S TOTAL LIABILITY TO YOU FOR ALL
          DAMAGES, LOSSES, AND CAUSES OF ACTION (WHETHER IN CONTRACT, TORT,
          INCLUDING NEGLIGENCE, OR OTHERWISE) EXCEED THE GREATER OF ONE
          HUNDRED DOLLARS ($100.00) OR THE AMOUNT YOU HAVE PAID TOOLVENTURE IN
          THE SIX (6) MONTHS PRECEDING THE INCIDENT.
        </p>
        <p className="mt-4">
          SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF
          INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR
          EXCLUSION MAY NOT APPLY TO YOU.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Indemnification</h2>
        <p className="mb-4">
          You agree to defend, indemnify, and hold harmless Toolventure and its
          officers, directors, employees, and agents from and against any
          claims, liabilities, damages, losses, and expenses, including
          reasonable attorneys' fees and costs, arising out of or in any way
          connected with your access to or use of the Service, or your
          violation of these Terms.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Govering Law and Jurisdiction</h2>
        <p className="mb-4">
          These Terms of Service shall be governed by and construed in
          accordance with the laws of [Your Jurisdiction], without regard to
          its conflict of law principles.
        </p>
        <p className="mb-4">
          Any dispute arising under these Terms shall be subject to the
          exclusive jurisdiction of the state or federal courts located in
          [Your Jurisdiction], and you hereby consent to and waive all
          defenses of lack of personal jurisdiction and forum non conveniens
          with respect to such proceedings.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4">Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace
          these Terms of Service at any time. If a revision is material we
          will provide at least 30 days' notice prior to any new terms taking
          effect. What constitutes a material change will be determined at our
          sole discretion.
        </p>
        <p className="mb-4">
          By continuing to access or use our Service after any revisions
          become effective, you agree to be bound by the revised terms. If you
          do not agree to the new terms, please discontinue using the Service.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms of Service, please
          contact us at:
        </p>
        <p className="font-medium mb-2">
          <a href="mailto:legal@toolventure.app"
             className="text-brand hover:underline">
            legal@toolventure.app
          </a>
        </p>
        <p className="text-sm text-secondary">
          For notices permitted under these Terms, please contact us via the
          email address above.
        </p>
      </section>

      <Link href="/" className="inline-block px-6 py-3 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors">
        Explore All Tools
      </Link>
    </div>
  );
}