// features/social/hashtag-generator/HashtagCategories.tsx
"use client";

import { useState } from "react";
import type { Hashtag } from "./types";
import { CATEGORIES } from "./data";
import { getSizeColor, formatReach } from "./utils";

type HashtagCategoriesProps = {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

export default function HashtagCategories({
  selectedTags,
  onToggleTag,
}: HashtagCategoriesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("fashion");
  const [search, setSearch] = useState("");

  const filteredCategories = search.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        hashtags: cat.hashtags.filter((h) =>
          h.tag.includes(search.toLowerCase().trim())
        ),
      })).filter((cat) => cat.hashtags.length > 0)
    : CATEGORIES;

  return (
    <>
      <div className="hc-root">
        <div className="hc-header">
          <i className="ti ti-layout-grid" aria-hidden="true" />
          <span>Browse Categories</span>
        </div>

        <div className="hc-search">
          <i className="ti ti-search" aria-hidden="true" />
          <input
            type="text"
            className="hc-search-input"
            placeholder="Search hashtags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="hc-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="hc-categories">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategory === category.id || !!search.trim();
            const selectedInCategory = category.hashtags.filter((h) =>
              selectedTags.includes(h.tag)
            ).length;

            return (
              <div key={category.id} className="hc-category">
                <button
                  className="hc-category-header"
                  onClick={() =>
                    setExpandedCategory(
                      isExpanded && !search.trim() ? null : category.id
                    )
                  }
                >
                  <div className="hc-category-left">
                    <i className={`ti ${category.icon}`} aria-hidden="true" />
                    <span className="hc-category-name">{category.name}</span>
                    {selectedInCategory > 0 && (
                      <span className="hc-selected-badge">{selectedInCategory}</span>
                    )}
                  </div>
                  <div className="hc-category-right">
                    <span className="hc-category-count">
                      {category.hashtags.length} tags
                    </span>
                    {!search.trim() && (
                      <i
                        className={`ti ti-chevron-down hc-chevron ${isExpanded ? "expanded" : ""}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="hc-category-tags">
                    {category.hashtags.map((hashtag) => {
                      const isSelected = selectedTags.includes(hashtag.tag);
                      return (
                        <button
                          key={hashtag.tag}
                          className={`hc-tag ${isSelected ? "selected" : ""}`}
                          onClick={() => onToggleTag(hashtag.tag)}
                          style={{ "--size-color": getSizeColor(hashtag.size) } as any}
                        >
                          <span className="hc-tag-text">#{hashtag.tag}</span>
                          <div className="hc-tag-info">
                            <span
                              className="hc-tag-size"
                              style={{ color: getSizeColor(hashtag.size) }}
                            >
                              {hashtag.size}
                            </span>
                            <span className="hc-tag-reach">
                              {formatReach(hashtag.estimatedReach)}
                            </span>
                          </div>
                          {isSelected && (
                            <i className="ti ti-check hc-check" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="hc-no-results">
              <i className="ti ti-search-off" aria-hidden="true" />
              <p>No hashtags found for "{search}"</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hc-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hc-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .hc-header i { font-size: 16px; color: var(--text-secondary); }

        .hc-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          transition: border-color 0.15s;
        }
        .hc-search:focus-within {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .hc-search > i {
          font-size: 15px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }
        .hc-search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
        }
        .hc-search-input::placeholder { color: var(--text-disabled); }
        .hc-search-clear {
          background: none;
          border: none;
          font-size: 13px;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }
        .hc-search-clear:hover { color: var(--text); }

        .hc-categories {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hc-category {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .hc-category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: var(--bg-surface);
          border: none;
          cursor: pointer;
          transition: background 0.12s;
          width: 100%;
        }
        .hc-category-header:hover { background: var(--border-faint); }

        .hc-category-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hc-category-left > i {
          font-size: 16px;
          color: var(--text-secondary);
        }
        .hc-category-name {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text);
        }
        .hc-selected-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background: var(--brand);
          color: white;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 700;
        }

        .hc-category-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hc-category-count {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }
        .hc-chevron {
          font-size: 14px;
          color: var(--text-tertiary);
          transition: transform 0.2s;
        }
        .hc-chevron.expanded {
          transform: rotate(180deg);
        }

        .hc-category-tags {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 6px;
          padding: 12px;
          border-top: 0.5px solid var(--border);
        }

        .hc-tag {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 8px 10px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          transition: all 0.12s;
          position: relative;
        }
        .hc-tag:hover {
          background: var(--border-faint);
          border-color: var(--size-color, var(--border));
        }
        .hc-tag.selected {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .hc-tag-text {
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-mono);
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 18px;
        }
        .hc-tag.selected .hc-tag-text { color: var(--brand-text); }

        .hc-tag-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .hc-tag-size {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .hc-tag-reach {
          font-size: 9.5px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .hc-check {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 11px;
          color: var(--brand);
        }

        .hc-no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 20px;
          text-align: center;
        }
        .hc-no-results i {
          font-size: 28px;
          color: var(--text-disabled);
        }
        .hc-no-results p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }
      `}</style>
    </>
  );
}