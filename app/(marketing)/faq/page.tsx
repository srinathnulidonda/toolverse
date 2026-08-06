// app/(marketing)/faq/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./FAQ.module.css";
import FAQContent from "./FAQContent";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className={styles.faqPage}>
      {/* Hero with Search */}
      <section className={styles.faqHero}>
        <div className={styles.container}>
          <div className={styles.faqHeroContent}>
            <div className={styles.faqHeroBadge}>
              <i className="ti ti-help-circle" />
              <span>Help Center</span>
            </div>
            <h1 className={styles.faqHeroTitle}>How can we help you?</h1>
            <p className={styles.faqHeroDescription}>
              Find answers to common questions about Toolverse. Can't find what you need?{" "}
              <Link href="/contact">Contact support</Link>
            </p>

            {/* Search in Hero */}
            <div className={styles.heroSearchWrapper}>
              <span className={styles.heroSearchIcon}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.heroSearchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={styles.heroSearchClear}
                  aria-label="Clear search"
                >
                  <i className="ti ti-x" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <FAQContent />
    </div>
  );
}