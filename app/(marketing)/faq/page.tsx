// app/(marketing)/faq/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { categories, faqs } from "./data";
import styles from "./FAQ.module.css";

export default function FAQPage() {
  // Initial state values
  const initialActiveCategory = "all";
  const initialSearchQuery = "";
  const initialOpenItems: number[] = [];

  const [activeCategory, setActiveCategory] = useState<string>(initialActiveCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [openItems, setOpenItems] = useState<number[]>(initialOpenItems);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className={styles.faqPage}>
      {/* Hero */}
      <section className={styles.faqHero}>
        <div className={styles.faqHeroContainer}>
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

            {/* Search */}
            <div className={styles.faqSearchWrapper}>
              <span className={styles.faqSearchIcon}>
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
                className={styles.faqSearchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={styles.faqSearchClear}
                  aria-label="Clear search"
                >
                  <i className="ti ti-x" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className={styles.faqMain}>
        <div className={styles.faqMainContainer}>
          {/* Categories */}
          <div className={styles.faqCategories}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${styles.faqCategoryBtn} ${activeCategory === cat.id ? styles.active : ""
                  }`}
              >
                <i className={`ti ${cat.icon}`} />
                <span className={styles.categoryLabel}>{cat.label}</span>
                <span className={styles.categoryCount}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* FAQ List */}
          {filteredFaqs.length === 0 ? (
            <div className={styles.faqEmpty}>
              <div className={styles.emptyIcon}>
                <i className="ti ti-search-off" />
              </div>
              <h3 className={styles.emptyTitle}>No results found</h3>
              <p className={styles.emptyDescription}>
                We couldn't find any questions matching{" "}
                <strong>"{searchQuery}"</strong>. Try different keywords or
                browse all questions.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className={styles.emptyResetBtn}
              >
                <i className="ti ti-refresh" />
                Clear filters
              </button>
            </div>
          ) : (
            <div className={styles.faqItemsWrapper}>
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`${styles.faqItem} ${openItems.includes(index) ? styles.open : ""
                    }`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className={styles.faqQuestionBtn}
                    aria-expanded={openItems.includes(index)}
                  >
                    <div className={styles.faqQuestionContent}>
                      <div className={styles.faqQuestionIcon}>
                        <i className="ti ti-help" />
                      </div>
                      <span className={styles.faqQuestionText}>
                        {faq.question}
                      </span>
                    </div>
                    <i
                      className={`ti ti-chevron-down ${styles.faqChevron} ${openItems.includes(index) ? styles.rotate : ""
                        }`}
                    />
                  </button>
                  <div
                    className={styles.faqAnswerWrapper}
                    style={{
                      maxHeight: openItems.includes(index) ? "500px" : "0",
                    }}
                  >
                    <div className={styles.faqAnswer}>{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className={styles.faqCTA}>
            <div className={styles.faqCTAIcon}>
              <i className="ti ti-message-circle" />
            </div>
            <h3 className={styles.faqCTATitle}>Still have questions?</h3>
            <p className={styles.faqCTADescription}>
              Can't find the answer you're looking for? Our support team is
              ready to help.
            </p>
            <Link href="/contact" className={styles.faqCTAButton}>
              Contact Support
              <i className="ti ti-arrow-right" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}