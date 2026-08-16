// app/(legal)/terms/TermsContent.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { lastUpdated, sections } from "./data";
import styles from "./Terms.module.css";

const TOC_TOP_OFFSET = 100;

interface TermsContentProps {}

export default function TermsContent() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-100px 0px -50% 0px" }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Safely convert HTML string to React elements for supported tags
  function parseHtmlToElements(text: string): React.ReactNode {
    // Handle line breaks
    if (text.includes("<br />")) {
      const parts = text.split("<br />");
      return parts
        .map((part, index) => [
          parseHtmlToElements(part),
          index < parts.length - 1 && <br key={`br-${index}`} />,
        ])
        .flat();
    }

    // Handle strong tags
    if (text.includes("<strong>") && text.includes("</strong>")) {
      const parts = text.split(/(<\/?strong>)/g);
      return parts
        .map((part, index) => {
          if (part === "<strong>") {
            return <strong key={`strong-open-${index}`}></strong>;
          }
          if (part === "</strong>") {
            return null;
          }
          return parseHtmlToElements(part); // Recursively handle nested tags
        })
        .flat();
    }

    // If no special tags, return escaped text
    return escapeHtml(text);
  }

  // Helper function to escape HTML text content
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "&#039;");
  }

  return (
    <div className={styles.termsPage}>
      {/* Hero */}
      <section className={styles.termsHero}>
        <div className={styles.termsHeroContainer}>
          <div className={styles.termsHeroContent}>
            <div className={styles.termsHeroBadge}>
              <i className="ti ti-file-check" />
              <span>Legal</span>
            </div>
            <h1 className={styles.termsHeroTitle}>Terms of Service</h1>
            <div className={styles.termsHeroMeta}>
              <div className={styles.metaItem}>
                <i className="ti ti-calendar" />
                Last updated: <strong>{lastUpdated}</strong>
              </div>
              <div className={styles.metaItem}>
                <i className="ti ti-clock" />7 min read
              </div>
            </div>
            <p className={styles.termsHeroDescription}>
              Please read these terms carefully before using Toolverse. By using our tools, you
              agree to these terms.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className={styles.termsContent}>
        <div className={styles.termsContentContainer}>
          <div className={styles.termsLayout}>
            {/* Table of Contents */}
            <aside className={styles.termsToc}>
              <div className={styles.termsTocSticky}>
                <h2 className={styles.termsTocTitle}>Contents</h2>
                <nav className={styles.termsTocNav}>
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`${styles.termsTocLink} ${
                        activeSection === section.id ? styles.active : ""
                      }`}
                    >
                      <i className={`ti ${section.icon}`} />
                      <span>{section.title}</span>
                    </a>
                  ))}
                </nav>

                <div className={styles.termsTocDivider} />

                <Link href="/privacy" className={styles.termsTocOther}>
                  <i className="ti ti-shield-lock" />
                  <span>Privacy Policy</span>
                  <i className="ti ti-arrow-right tocArrow" />
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <article className={styles.termsArticle}>
              {/* Quick Summary Card */}
              <div className={styles.termsSummaryCard}>
                <div className={styles.summaryIcon}>
                  <i className="ti ti-info-circle" />
                </div>
                <div className={styles.summaryContent}>
                  <h3 className={styles.summaryTitle}>Key Points</h3>
                  <ul className={styles.summaryList}>
                    <li>
                      <i className="ti ti-check" />
                      Free to use, forever—no hidden fees or subscriptions
                    </li>
                    <li>
                      <i className="ti ti-check" />
                      Use responsibly and legally
                    </li>
                    <li>
                      <i className="ti ti-check" />
                      Provided "as is" without warranties
                    </li>
                    <li>
                      <i className="ti ti-check" />
                      You own your data—we never see it
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sections */}
              {sections.map((section) => (
                <section key={section.id} id={section.id} className={styles.termsSection}>
                  <div className={styles.termsSectionHeader}>
                    <div className={styles.sectionIcon}>
                      <i className={`ti ${section.icon}`} />
                    </div>
                    <h2 className={styles.termsSectionTitle}>{section.title}</h2>
                  </div>
                  <div className={styles.termsSectionContent}>
                    {section.content.split("\n\n").map((para, i) => (
                      <p key={i}>{parseHtmlToElements(para)}</p>
                    ))}
                  </div>
                </section>
              ))}

              {/* Footer CTA */}
              <div className={styles.termsFooterCta}>
                <div className={styles.footerCtaIcon}>
                  <i className="ti ti-help-circle" />
                </div>
                <div className={styles.footerCtaContent}>
                  <h3 className={styles.footerCtaTitle}>Questions about these terms?</h3>
                  <p className={styles.footerCtaText}>We're happy to clarify. Reach out anytime.</p>
                </div>
                <Link href="/contact" className={styles.footerCtaButton}>
                  Contact Us
                  <i className="ti ti-arrow-right" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}