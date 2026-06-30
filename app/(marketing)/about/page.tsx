// app/(marketing)/about/page.tsx
"use client";

import Link from "next/link";
import { stats, values } from "./data";
import styles from "./About.module.css";

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.aboutHero}>
        <div className={styles.aboutHeroContainer}>
          <div className={styles.aboutHeroContent}>
            <div className={styles.aboutHeroBadge}>
              <div className={styles.badgeDot} />
              <span>About Toolverse</span>
            </div>
            <h1 className={styles.aboutHeroTitle}>
              Privacy-first tools
              <br />
              <span className={styles.heroGradientText}>for everyone</span>
            </h1>
            <p className={styles.aboutHeroDescription}>
              We believe powerful productivity tools shouldn't require creating accounts, uploading files, or compromising privacy. Toolverse processes everything locally in your browser—fast, secure, and free forever.
            </p>
            <div className={styles.aboutHeroActions}>
              <Link href="/tools" className={styles.heroBtnPrimary}>
                <i className="ti ti-apps" />
                Explore Tools
              </Link>
              <a
                href="https://github.com/srinathnulidonda/toolverse"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroBtnSecondary}
              >
                <i className="ti ti-brand-github" />
                View on GitHub
                <i className="ti ti-external-link" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Updated to match SocialProof style */}
      <section className={styles.aboutStats}>
        <div className={styles.aboutStatsContainer}>
          <div className={styles.statsRow}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.statCard}>
                <i className={`ti ${stat.icon}`} aria-hidden="true" />
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.sublabel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.aboutValues}>
        <div className={styles.aboutValuesContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Our Principles</div>
            <h2 className={styles.sectionTitle}>Six core values that guide every decision</h2>
            <p className={styles.sectionDescription}>
              Built on a foundation of privacy, performance, and accessibility
            </p>
          </div>

          <div className={styles.valuesGrid}>
            {values.map((value, i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueHeader}>
                  <i className={`ti ${value.icon} ${styles.valueIcon}`} />
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                </div>
                <p className={styles.valueDescription}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.aboutCTA}>
        <div className={styles.aboutCTAContainer}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaLeft}>
              <div className={styles.ctaEyebrow}>
                <i className="ti ti-sparkles" />
                Get Started
              </div>
              <h2 className={styles.ctaTitle}>
                Ready to work smarter?
              </h2>
              <p className={styles.ctaDescription}>
                No sign-up required. No file uploads. Just powerful tools that work instantly in your browser, completely free.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/tools" className={styles.ctaPrimaryButton}>
                  Browse All Tools
                  <i className="ti ti-arrow-right" />
                </Link>
                <Link href="/contact" className={styles.ctaSecondaryButton}>
                  Get in Touch
                </Link>
              </div>
            </div>

            <div className={styles.ctaRight}>
              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-shield-lock" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>100% Private</h3>
                  <p className={styles.ctaFeatureText}>Files never leave your device</p>
                </div>
              </div>

              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-bolt" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Instant Processing</h3>
                  <p className={styles.ctaFeatureText}>No uploads, no waiting</p>
                </div>
              </div>

              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-infinity" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Free Forever</h3>
                  <p className={styles.ctaFeatureText}>No hidden fees or limits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}