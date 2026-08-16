// features/social/hashtag-generator/HashtagCategories.tsx
"use client";

import { useState } from "react";
import type { Hashtag } from "./ts/types";
import { CATEGORIES } from "./ts/data";
import { getSizeColor, formatReach } from "./ts/utils";
import styles from "./style/HashtagCategories.module.css";

type HashtagCategoriesProps = {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

export default function HashtagCategories({ selectedTags, onToggleTag }: HashtagCategoriesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("fashion");
  const [search, setSearch] = useState("");

  const filteredCategories = search.trim()
    ? CATEGORIES.map((cat) => ({
      ...cat,
      hashtags: cat.hashtags.filter((h) => h.tag.includes(search.toLowerCase().trim())),
    })).filter((cat) => cat.hashtags.length > 0)
    : CATEGORIES;

  return (
    <div className={styles.hcRoot}>
      <div className={styles.hcHeader}>
        <i className="ti ti-layout-grid" aria-hidden="true" />
        <span>Browse Categories</span>
      </div>

      <div className={styles.hcSearch}>
        <i className="ti ti-search" aria-hidden="true" />
        <input
          type="text"
          className={styles.hcSearchInput}
          placeholder="Search hashtags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className={styles.hcSearchClear}
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.hcCategories}>
        {filteredCategories.map((category) => {
          const isExpanded = expandedCategory === category.id || !!search.trim();
          const selectedInCategory = category.hashtags.filter((h) =>
            selectedTags.includes(h.tag)
          ).length;

          return (
            <div key={category.id} className={styles.hcCategory}>
              <button
                className={styles.hcCategoryHeader}
                onClick={() =>
                  setExpandedCategory(isExpanded && !search.trim() ? null : category.id)
                }
              >
                <div className={styles.hcCategoryLeft}>
                  <i className={`ti ${category.icon}`} aria-hidden="true" />
                  <span className={styles.hcCategoryName}>{category.name}</span>
                  {selectedInCategory > 0 && (
                    <span className={styles.hcSelectedBadge}>{selectedInCategory}</span>
                  )}
                </div>
                <div className={styles.hcCategoryRight}>
                  <span className={styles.hcCategoryCount}>{category.hashtags.length} tags</span>
                  {!search.trim() && (
                    <i
                      className={`ti ti-chevron-down ${styles.hcChevron}${isExpanded ? ` ${styles.expanded}` : ""}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className={styles.hcCategoryTags}>
                  {category.hashtags.map((hashtag) => {
                    const isSelected = selectedTags.includes(hashtag.tag);
                    return (
                      <button
                        key={hashtag.tag}
                        className={`${styles.hcTag}${isSelected ? ` ${styles.selected}` : ""}`}
                        onClick={() => onToggleTag(hashtag.tag)}
                        style={{ "--size-color": getSizeColor(hashtag.size) } as any}
                      >
                        <span className={styles.hcTagText}>#{hashtag.tag}</span>
                        <div className={styles.hcTagInfo}>
                          <span
                            className={styles.hcTagSize}
                            style={{ color: getSizeColor(hashtag.size) }}
                          >
                            {hashtag.size}
                          </span>
                          <span className={styles.hcTagReach}>
                            {formatReach(hashtag.estimatedReach)}
                          </span>
                        </div>
                        {isSelected && <i className={`ti ti-check ${styles.hcCheck}`} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className={styles.hcNoResults}>
            <i className="ti ti-search-off" aria-hidden="true" />
            <p>No hashtags found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}