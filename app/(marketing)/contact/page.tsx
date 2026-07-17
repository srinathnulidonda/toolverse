// app/(marketing)/contact/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { contactMethods, quickLinks } from "./data";
import styles from "./Contact.module.css";
import ContactForm from "./ContactForm";
import { logger } from "@/lib/logger";

export const metadata = {
  title: "Contact Toolverse",
  description: "Get in touch with the Toolverse team – we’re here to help.",
};

export default function ContactPage() {
  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.contactHero}>
        <div className={styles.contactHeroContainer}>
          <div className={styles.contactHeroContent}>
            <div className={styles.contactHeroBadge}>
              <i className="ti ti-message-circle" />
              <span>Get in Touch</span>
            </div>
            <h1 className={styles.contactHeroTitle}>Let's start a conversation</h1>
            <p className={styles.contactHeroDescription}>
              Whether you have a question, feedback, or just want to say hello—we're here and happy
              to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.contactMain}>
        <div className={styles.contactMainContainer}>
          {/* Contact Methods Grid */}
          <div className={styles.contactMethodsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Choose your channel</h2>
              <p className={styles.sectionSubtitle}>Pick the way that works best for you</p>
            </div>

            <div className={styles.contactMethodsGrid}>
              {contactMethods.map((method, i) => (
                <a
                  key={i}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={styles.contactMethodCard}
                >
                  <div className={styles.methodCardHeader}>
                    <div className={styles.methodIcon}>
                      <i className={`ti ${method.icon}`} />
                    </div>
                    <div className={styles.methodContent}>
                      <h3 className={styles.methodTitle}>{method.title}</h3>
                      <p className={styles.methodDescription}>{method.description}</p>
                    </div>
                  </div>
                  <div className={styles.methodCardBody}>
                    <div className={styles.methodValue}>{method.value}</div>
                    <div className={styles.methodAvailability}>
                      <i className="ti ti-clock" />
                      {method.availability}
                    </div>
                  </div>
                  <div className={styles.methodCardFooter}>
                    <span className={styles.methodCta}>
                      Get started
                      <i className="ti ti-arrow-right" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <ContactForm />

          {/* Quick Links */}
          <div className={styles.quickLinksSection}>
            <h3 className={styles.quickLinksTitle}>Quick Links</h3>
            <div className={styles.quickLinksGrid}>
              {quickLinks.map((link, i) => (
                <Link key={i} href={link.href} className={styles.quickLinkCard}>
                  <i className={`ti ${link.icon}`} />
                  <span>{link.label}</span>
                  <i className="ti ti-arrow-right" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compact Elite CTA */}
      <section className={styles.contactFooterCta}>
        <div className={styles.footerCtaContainer}>
          <div className={styles.footerCtaContent}>
            <div className={styles.ctaMainContent}>
              <div className={styles.ctaHeader}>
                <div className={styles.ctaEyebrow}>
                  <i className="ti ti-help-circle" />
                  Help Center
                </div>
                <h2 className={styles.footerCtaTitle}>Find answers instantly in our FAQ</h2>
                <p className={styles.footerCtaDescription}>
                  Browse our comprehensive knowledge base with detailed solutions to common
                  questions. Most issues resolved in under 2 minutes.
                </p>
              </div>

              <div className={styles.ctaMainActions}>
                <Link href="/faq" className={styles.ctaPrimaryButton}>
                  Browse FAQ
                  <i className="ti ti-arrow-right" />
                </Link>
                <Link href="/about" className={styles.ctaSecondaryButton}>
                  Learn More
                </Link>
              </div>
            </div>

            <div className={styles.ctaVisualPanel}>
              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-search" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Smart Search</h3>
                  <p className={styles.ctaFeatureText}>Find what you need instantly</p>
                </div>
              </div>

              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-category" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Organized Topics</h3>
                  <p className={styles.ctaFeatureText}>Browse by category</p>
                </div>
              </div>

              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-clock-check" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Always Updated</h3>
                  <p className={styles.ctaFeatureText}>Fresh content daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}