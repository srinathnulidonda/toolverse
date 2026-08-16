// app/(marketing)/faq/FAQContent.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, faqs } from "./data";
import styles from "./FAQ.module.css";

export default function FAQContent() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  const activeCategoryLabel =
    categories.find((cat) => cat.id === activeCategory)?.label || "All Questions";

  return (
    <section className={styles.faqMain}>
      <div className={styles.container}>
        <div className={styles.faqGrid}>
          {/* Categories Sidebar — Desktop */}
          <aside className={styles.categoriesSidebar}>
            <h2 className={styles.sidebarTitle}>Categories</h2>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ""
                  }`}
              >
                <i className={`ti ${cat.icon}`} />
                <span className={styles.categoryLabel}>{cat.label}</span>
                <span className={styles.categoryCount}>{cat.count}</span>
              </button>
            ))}
          </aside>

          {/* Content Area */}
          <div className={styles.contentArea}>
            {/* Mobile Category Pills */}
            <div className={styles.mobileCategoryPills}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`${styles.mobilePillBtn} ${activeCategory === cat.id ? styles.active : ""
                    }`}
                >
                  <i className={`ti ${cat.icon}`} />
                  <span>{cat.label}</span>
                  <span className={styles.mobilePillCount}>{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Results Header */}
            {(searchQuery || activeCategory !== "all") && filteredFaqs.length > 0 && (
              <div className={styles.resultsHeader}>
                <div className={styles.resultsCount}>
                  <strong>{filteredFaqs.length}</strong>{" "}
                  {filteredFaqs.length === 1 ? "question" : "questions"} found
                  {searchQuery && ` for "${searchQuery}"`}
                  {activeCategory !== "all" && ` in ${activeCategoryLabel}`}
                </div>
                {(searchQuery || activeCategory !== "all") && (
                  <button onClick={handleClearFilters} className={styles.resultsClearBtn}>
                    <i className="ti ti-x" />
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* FAQ List */}
            {filteredFaqs.length === 0 ? (
              <div className={styles.faqEmpty}>
                <div className={styles.emptyIcon}>
                  <i className="ti ti-search-off" />
                </div>
                <h3 className={styles.emptyTitle}>No results found</h3>
                <p className={styles.emptyDescription}>
                  We couldn't find any questions matching{" "}
                  {searchQuery && <strong>"{searchQuery}"</strong>}
                  {searchQuery && activeCategory !== "all" && " "}
                  {activeCategory !== "all" && (
                    <>
                      in <strong>{activeCategoryLabel}</strong>
                    </>
                  )}
                  . Try different keywords or browse all questions.
                </p>
                <button onClick={handleClearFilters} className={styles.emptyResetBtn}>
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
                        <span className={styles.faqQuestionText}>{faq.question}</span>
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

            {/* Help / CTA */}
            <div className={styles.helpSection}>
              <div className={styles.helpCard}>
                <div className={styles.helpIcon}>
                  <i className="ti ti-message-circle" />
                </div>
                <div className={styles.helpContent}>
                  <h3 className={styles.helpTitle}>Still have questions?</h3>
                  <p className={styles.helpText}>
                    Can't find the answer you're looking for? Our support team is ready to help.
                  </p>
                </div>
                <div className={styles.helpActions}>
                  <Link href="/about" className={styles.helpLinkSecondary}>
                    Learn More
                  </Link>
                  <Link href="/contact" className={styles.helpLinkPrimary}>
                    Contact Support
                    <i className="ti ti-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}