// features/social/hashtag-generator/GeneratedHashtags.tsx
"use client";

import { useState } from "react";
import type { Hashtag, HashtagSize } from "./ts/types";
import { getSizeColor, getSizeLabel, formatReach, calculateReachEstimate } from "./ts/utils";
import styles from "./style/GeneratedHashtags.module.css";

type GeneratedHashtagsProps = {
  hashtags: Hashtag[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

export default function GeneratedHashtags({
  hashtags,
  selectedTags,
  onToggleTag,
}: GeneratedHashtagsProps) {
  const [sizeFilter, setSizeFilter] = useState<HashtagSize | "all">("all");
  const [showRisky, setShowRisky] = useState(true);

  const filteredHashtags = hashtags.filter((h) => {
    if (sizeFilter !== "all" && h.size !== sizeFilter) return false;
    if (!showRisky && h.risky) return false;
    return true;
  });

  const reachEstimate = calculateReachEstimate(hashtags);
  const selectedHashtagsData = hashtags.filter((h) => selectedTags.includes(h.tag));
  const selectedReach = calculateReachEstimate(selectedHashtagsData);

  if (hashtags.length === 0) {
    return (
      <div className={styles.ghEmpty}>
        <i className="ti ti-hash-off" aria-hidden="true" />
        <p>No hashtags generated yet</p>
        <span>Enter a keyword or caption above to get started</span>
      </div>
    );
  }

  return (
    <div className={styles.ghRoot}>
      <div className={styles.ghHeader}>
        <div className={styles.ghTitle}>
          <i className="ti ti-hash" aria-hidden="true" />
          <span>Generated Hashtags</span>
          <span className={styles.ghCount}>
            {filteredHashtags.length} of {hashtags.length}
          </span>
        </div>
        <div className={styles.ghReachInfo}>
          <span className={styles.ghReach}>Total reach: {formatReach(reachEstimate.totalReach)}</span>
          <span className={`${styles.ghCompetition} ${styles[`ghCompetition${reachEstimate.competitionLevel.charAt(0).toUpperCase() + reachEstimate.competitionLevel.slice(1).replace(/-(.)/g, (_, c) => c.toUpperCase())}`]}`}>
            {reachEstimate.competitionLevel} competition
          </span>
        </div>
      </div>

      <div className={styles.ghFilters}>
        <div className={styles.ghSizeFilters}>
          <button
            className={`${styles.ghFilterBtn}${sizeFilter === "all" ? ` ${styles.active}` : ""}`}
            onClick={() => setSizeFilter("all")}
          >
            All
          </button>
          {(["mega", "large", "medium", "small", "niche"] as HashtagSize[]).map((size) => (
            <button
              key={size}
              className={`${styles.ghFilterBtn}${sizeFilter === size ? ` ${styles.active}` : ""}`}
              onClick={() => setSizeFilter(size)}
              style={{ "--filter-color": getSizeColor(size) } as any}
            >
              {size}
            </button>
          ))}
        </div>
        <label className={styles.ghRiskyToggle}>
          <input
            type="checkbox"
            checked={showRisky}
            onChange={(e) => setShowRisky(e.target.checked)}
          />
          <span>Show risky</span>
        </label>
      </div>

      <div className={styles.ghGrid}>
        {filteredHashtags.map((hashtag) => {
          const isSelected = selectedTags.includes(hashtag.tag);
          return (
            <button
              key={hashtag.tag}
              className={`${styles.ghTag}${isSelected ? ` ${styles.selected}` : ""}${hashtag.risky ? ` ${styles.risky}` : ""}`}
              onClick={() => onToggleTag(hashtag.tag)}
              style={{ "--size-color": getSizeColor(hashtag.size) } as any}
            >
              <div className={styles.ghTagContent}>
                <span className={styles.ghTagText}>#{hashtag.tag}</span>
                {hashtag.risky && (
                  <i className={`ti ti-alert-triangle ${styles.ghRiskyIcon}`} aria-hidden="true" />
                )}
              </div>
              <div className={styles.ghTagMeta}>
                <span className={styles.ghTagSize} style={{ color: getSizeColor(hashtag.size) }}>
                  {hashtag.size}
                </span>
                <span className={styles.ghTagReach}>{formatReach(hashtag.estimatedReach)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredHashtags.length === 0 && (
        <div className={styles.ghNoResults}>
          <i className="ti ti-filter-off" aria-hidden="true" />
          <p>No hashtags match current filters</p>
          <button
            className={styles.ghClearFilters}
            onClick={() => {
              setSizeFilter("all");
              setShowRisky(true);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className={styles.ghSelectionSummary}>
          <div className={styles.ghSummaryHeader}>
            <i className="ti ti-check" aria-hidden="true" />
            <span>Selected: {selectedTags.length} hashtags</span>
          </div>
          <div className={styles.ghSummaryReach}>
            Total reach: {formatReach(selectedReach.totalReach)} •{" "}
            <span className={styles[`ghCompetition${selectedReach.competitionLevel.charAt(0).toUpperCase() + selectedReach.competitionLevel.slice(1).replace(/-(.)/g, (_, c) => c.toUpperCase())}`]}>
              {selectedReach.competitionLevel} competition
            </span>
          </div>
        </div>
      )}
    </div>
  );
}