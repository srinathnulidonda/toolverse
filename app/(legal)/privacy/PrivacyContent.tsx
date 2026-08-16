// app/(legal)/privacy/PrivacyContent.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { lastUpdated, sections } from "./data";
import styles from "./Privacy.module.css";

const TOC_TOP_OFFSET = 100;

interface PrivacyContentProps {}

export default function PrivacyContent() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tocStyle, setTocStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

  const layoutRef = useRef<HTMLDivElement>(null);
  const tocPlaceholderRef = useRef<HTMLDivElement>(null);
  const tocBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;

    const update = () => {
      const container = layoutRef.current;
      const placeholder = tocPlaceholderRef.current;
      const box = tocBoxRef.current;
      if (!container || !placeholder || !box) return;

      const containerRect = container.getBoundingClientRect();
      const placeholderRect = placeholder.getBoundingClientRect();
      const tocHeight = box.offsetHeight;
      const width = placeholderRect.width;
      const leftWithinContainer = placeholderRect.left - containerRect.left;

      if (containerRect.top > TOC_TOP_OFFSET) {
        setTocStyle({ position: "absolute", top: 0, left: leftWithinContainer, width });
      } else if (containerRect.bottom < TOC_TOP_OFFSET + tocHeight) {
        setTocStyle({
          position: "absolute",
          top: containerRect.height - tocHeight,
          left: leftWithinContainer,
          width,
        });
      } else {
        setTocStyle({ position: "fixed", top: TOC_TOP_OFFSET, left: placeholderRect.left, width });
      }
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-100px 0px -50% 0px",
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    <div className={styles.privacyPage}>
      <section className={styles.privacyHero}>
        <div className={styles.privacyHeroContainer}>
          <div className={styles.privacyHeroContent}>
            <div className={styles.privacyHeroBadge}>
              <i className="ti ti-shield-check" />
              <span>Legal</span>
            </div>
            <h1 className={styles.privacyHeroTitle}>Privacy Policy</h1>
            <div className={styles.privacyHeroMeta}>
              <div className={styles.metaItem}>
                <i className="ti ti-calendar" />
                Last updated: <strong>{lastUpdated}</strong>
              </div>
              <div className={styles.metaItem}>
                <i className="ti ti-clock" />5 min read
              </div>
            </div>
            <p className={styles.privacyHeroDescription}>
              Your privacy is our priority. All processing happens locally in your browser—we never
              see your files.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.privacyContent}>
        <div className={styles.privacyContentContainer}>
          <div className={styles.privacyLayout} ref={layoutRef}>
            <div className={styles.privacyToc} ref={tocPlaceholderRef} />

            <div ref={tocBoxRef} className={styles.privacyTocFloating} style={tocStyle}>
              <h2 className={styles.privacyTocTitle}>Contents</h2>
              <nav className={styles.privacyTocNav}>
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.id);
                    }}
                    className={`${styles.privacyTocLink} ${
                      activeSection === section.id ? styles.active : ""
                    }`}
                  >
                    <i className={`ti ${section.icon}`} />
                    <span>{section.title}</span>
                  </a>
                ))}
              </nav>

              <div className={styles.privacyTocDivider} />

              <Link href="/terms" className={styles.privacyTocOther}>
                <i className="ti ti-file-text" />
                <span>Terms of Service</span>
                <i className={`ti ti-arrow-right ${styles.tocArrow}`} />
              </Link>
            </div>

            <article className={styles.privacyArticle}>
              <div className={styles.privacySummaryCard}>
                <div className={styles.summaryIcon}>
                  <i className="ti ti-sparkles" />
                </div>
                <div className={styles.summaryContent}>
                  <h3 className={styles.summaryTitle}>TL;DR - The Short Version</h3>
                  <ul className={styles.summaryList}>
                    <li>
                      <i className="ti ti-check" />
                      All processing happens in your browser—we never see your files
                    </li>
                    <li>
                      <i className="ti ti-check" />
                      No tracking, no analytics, no data collection
                    </li>
                    <li>
                      <i className="ti ti-check" />
                      Your data stays on your device, always
                    </li>
                    <li>
                      <i className="ti ti-check" />
                      Open source and fully transparent
                    </li>
                  </ul>
                </div>
              </div>

              {sections.map((section) => (
                <section key={section.id} id={section.id} className={styles.privacySection}>
                  <div className={styles.privacySectionHeader}>
                    <div className={styles.sectionIcon}>
                      <i className={`ti ${section.icon}`} />
                    </div>
                    <h2 className={styles.privacySectionTitle}>{section.title}</h2>
                  </div>
                  <div className={styles.privacySectionContent}>
                    {section.content.split("\n\n").map((para, i) => (
                      <p key={i}>{parseHtmlToElements(para)}</p>
                    ))}
                  </div>
                </section>
              ))}

              <div className={styles.privacyFooterCta}>
                <div className={styles.footerCtaIcon}>
                  <i className="ti ti-help-circle" />
                </div>
                <div className={styles.footerCtaContent}>
                  <h3 className={styles.footerCtaTitle}>Questions about privacy?</h3>
                  <p className={styles.footerCtaText}>
                    We're here to help. Contact us anytime for clarification.
                  </p>
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