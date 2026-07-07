// features/social/hashtag-generator/GeneratedHashtags.tsx
"use client";

import { useState } from "react";
import type { Hashtag, HashtagSize } from "./types";
import { getSizeColor, getSizeLabel, formatReach, calculateReachEstimate } from "./utils";

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
      <>
        <div className="gh-empty">
          <i className="ti ti-hash-off" aria-hidden="true" />
          <p>No hashtags generated yet</p>
          <span>Enter a keyword or caption above to get started</span>
        </div>
        <style>{`
          .gh-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 40px 20px;
            text-align: center;
            color: var(--text-disabled);
          }
          .gh-empty i { font-size: 32px; }
          .gh-empty p {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
            margin: 0;
          }
          .gh-empty span {
            font-size: 12px;
            color: var(--text-tertiary);
            max-width: 200px;
            line-height: 1.4;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="gh-root">
        <div className="gh-header">
          <div className="gh-title">
            <i className="ti ti-hash" aria-hidden="true" />
            <span>Generated Hashtags</span>
            <span className="gh-count">
              {filteredHashtags.length} of {hashtags.length}
            </span>
          </div>
          <div className="gh-reach-info">
            <span className="gh-reach">
              Total reach: {formatReach(reachEstimate.totalReach)}
            </span>
            <span className={`gh-competition gh-competition-${reachEstimate.competitionLevel}`}>
              {reachEstimate.competitionLevel} competition
            </span>
          </div>
        </div>

        <div className="gh-filters">
          <div className="gh-size-filters">
            <button
              className={`gh-filter-btn ${sizeFilter === "all" ? "active" : ""}`}
              onClick={() => setSizeFilter("all")}
            >
              All
            </button>
            {(["mega", "large", "medium", "small", "niche"] as HashtagSize[]).map((size) => (
              <button
                key={size}
                className={`gh-filter-btn ${sizeFilter === size ? "active" : ""}`}
                onClick={() => setSizeFilter(size)}
                style={{ "--filter-color": getSizeColor(size) } as any}
              >
                {size}
              </button>
            ))}
          </div>
          <label className="gh-risky-toggle">
            <input
              type="checkbox"
              checked={showRisky}
              onChange={(e) => setShowRisky(e.target.checked)}
            />
            <span>Show risky</span>
          </label>
        </div>

        <div className="gh-grid">
          {filteredHashtags.map((hashtag) => {
            const isSelected = selectedTags.includes(hashtag.tag);
            return (
              <button
                key={hashtag.tag}
                className={`gh-tag ${isSelected ? "selected" : ""} ${hashtag.risky ? "risky" : ""}`}
                onClick={() => onToggleTag(hashtag.tag)}
                style={{ "--size-color": getSizeColor(hashtag.size) } as any}
              >
                <div className="gh-tag-content">
                  <span className="gh-tag-text">#{hashtag.tag}</span>
                  {hashtag.risky && (
                    <i className="ti ti-alert-triangle gh-risky-icon" aria-hidden="true" />
                  )}
                </div>
                <div className="gh-tag-meta">
                  <span
                    className="gh-tag-size"
                    style={{ color: getSizeColor(hashtag.size) }}
                  >
                    {hashtag.size}
                  </span>
                  <span className="gh-tag-reach">{formatReach(hashtag.estimatedReach)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredHashtags.length === 0 && (
          <div className="gh-no-results">
            <i className="ti ti-filter-off" aria-hidden="true" />
            <p>No hashtags match current filters</p>
            <button
              className="gh-clear-filters"
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
          <div className="gh-selection-summary">
            <div className="gh-summary-header">
              <i className="ti ti-check" aria-hidden="true" />
              <span>Selected: {selectedTags.length} hashtags</span>
            </div>
            <div className="gh-summary-reach">
              Total reach: {formatReach(selectedReach.totalReach)} •{" "}
              <span className={`gh-competition-${selectedReach.competitionLevel}`}>
                {selectedReach.competitionLevel} competition
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gh-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .gh-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .gh-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .gh-title i { font-size: 16px; color: var(--text-secondary); }
        .gh-count {
          padding: 2px 6px;
          background: var(--bg-surface);
          border-radius: 4px;
          font-size: 10px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .gh-reach-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }
        .gh-reach {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .gh-competition {
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .gh-competition-low { background: var(--brand-light); color: var(--brand-text); }
        .gh-competition-medium { background: #FEF3C7; color: #D97706; }
        .gh-competition-high { background: #FECACA; color: #B91C1C; }
        .gh-competition-very-high { background: #FECACA; color: #991B1B; }

        .gh-filters {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .gh-size-filters {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .gh-filter-btn {
          padding: 4px 10px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          text-transform: capitalize;
        }
        .gh-filter-btn:hover { background: var(--border-faint); }
        .gh-filter-btn.active {
          background: var(--filter-color, var(--brand-light));
          border-color: var(--filter-color, var(--brand-border));
          color: var(--filter-color, var(--brand-text));
        }

        .gh-risky-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-tertiary);
          cursor: pointer;
        }
        .gh-risky-toggle input {
          accent-color: var(--brand);
        }

        .gh-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
        }

        .gh-tag {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .gh-tag:hover {
          background: var(--border-faint);
          border-color: var(--size-color);
        }
        .gh-tag.selected {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }
        .gh-tag.risky {
          background: #FEF2F2;
          border-color: #FECACA;
        }

        .gh-tag-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .gh-tag-text {
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-mono);
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .gh-tag.selected .gh-tag-text { color: var(--brand-text); }
        .gh-tag.risky .gh-tag-text { color: #991B1B; }

        .gh-risky-icon {
          font-size: 12px;
          color: #F59E0B;
          flex-shrink: 0;
        }

        .gh-tag-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .gh-tag-size {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .gh-tag-reach {
          font-size: 10px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .gh-no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 20px;
          text-align: center;
        }
        .gh-no-results i {
          font-size: 28px;
          color: var(--text-disabled);
        }
        .gh-no-results p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }
        .gh-clear-filters {
          padding: 6px 12px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 6px;
          color: var(--brand-text);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
        }

        .gh-selection-summary {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 8px;
        }
        .gh-summary-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--brand-text);
        }
        .gh-summary-header i { font-size: 14px; }
        .gh-summary-reach {
          font-size: 11px;
          color: var(--brand-text);
          opacity: 0.85;
        }

        @media (max-width: 600px) {
          .gh-grid {
            grid-template-columns: 1fr;
          }
          .gh-filters {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }

        @media (prefers-color-scheme: dark) {
          .gh-tag.risky {
            background: #450A0A;
            border-color: #7F1D1D;
          }
          .gh-tag.risky .gh-tag-text { color: #F87171; }
          .gh-competition-medium { background: #451A03; color: #FCD34D; }
          .gh-competition-high,
          .gh-competition-very-high { background: #450A0A; color: #F87171; }
        }
      `}</style>
    </>
  );
}