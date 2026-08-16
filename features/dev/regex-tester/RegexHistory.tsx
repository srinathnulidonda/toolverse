// features/dev/regex-tester/RegexHistory.tsx
"use client";

import { useMemo, useState } from "react";
import type { HistoryEntry } from "./ts/regexStore";
import styles from "./style/RegexHistory.module.css";

interface RegexHistoryProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

export default function RegexHistory({ history, onRestore, onClear, onDelete }: RegexHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "matches">("recent");

  const filteredHistory = useMemo(() => {
    let result = [...history];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (h) => h.pattern.toLowerCase().includes(query) || h.testString.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "recent") {
      result.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      result.sort((a, b) => b.matchCount - a.matchCount);
    }

    return result;
  }, [history, searchQuery, sortBy]);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(timestamp).toLocaleDateString();
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const stats = useMemo(() => {
    return {
      total: history.length,
      totalMatches: history.reduce((sum, h) => sum + h.matchCount, 0),
      avgMatches:
        history.length > 0
          ? (history.reduce((sum, h) => sum + h.matchCount, 0) / history.length).toFixed(1)
          : 0,
    };
  }, [history]);

  return (
    <>
      <div className={styles.rxhRoot}>
        {/* Header */}
        <div className={styles.rxhHeader}>
          <div className={styles.rxhSearchWrap}>
            <i className="ti ti-search" />
            <input
              type="text"
              className={styles.rxhSearchInput}
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.rxhClearSearch}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className={styles.rxhHeaderActions}>
            <div className={styles.rxhSortGroup}>
              <button
                type="button"
                className={`${styles.rxhSortBtn}${sortBy === "recent" ? ` ${styles.active}` : ""}`}
                onClick={() => setSortBy("recent")}
              >
                <i className="ti ti-clock" />
                Recent
              </button>
              <button
                type="button"
                className={`${styles.rxhSortBtn}${sortBy === "matches" ? ` ${styles.active}` : ""}`}
                onClick={() => setSortBy("matches")}
              >
                <i className="ti ti-trending-up" />
                Matches
              </button>
            </div>

            <button
              type="button"
              className={styles.rxhClearAllBtn}
              onClick={onClear}
              disabled={history.length === 0}
            >
              <i className="ti ti-trash" />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {history.length > 0 && (
          <div className={styles.rxhStatsBar}>
            <div className={styles.rxhStat}>
              <i className="ti ti-history" />
              <span>
                <strong>{stats.total}</strong> {stats.total === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className={styles.rxhStat}>
              <i className="ti ti-check" />
              <span>
                <strong>{stats.totalMatches}</strong> total matches
              </span>
            </div>
            <div className={styles.rxhStat}>
              <i className="ti ti-chart-line" />
              <span>
                <strong>{stats.avgMatches}</strong> avg matches
              </span>
            </div>
          </div>
        )}

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className={styles.rxhEmpty}>
            <div className={styles.rxhEmptyIcon}>
              <i className="ti ti-history-off" />
            </div>
            <p className={styles.rxhEmptyTitle}>{searchQuery ? "No matches found" : "No history yet"}</p>
            <p className={styles.rxhEmptyDesc}>
              {searchQuery
                ? "Try adjusting your search query"
                : "Your regex test history will appear here"}
            </p>
          </div>
        ) : (
          <div className={styles.rxhList}>
            {filteredHistory.map((entry) => (
              <div key={entry.id} className={styles.rxhEntry}>
                <div className={styles.rxhEntryHeader}>
                  <div className={styles.rxhEntryInfo}>
                    <span className={styles.rxhTimestamp}>
                      <i className="ti ti-clock" />
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <span className={styles.rxhMatchCount}>
                      <i className="ti ti-check" />
                      {entry.matchCount} {entry.matchCount === 1 ? "match" : "matches"}
                    </span>
                  </div>
                  <div className={styles.rxhEntryActions}>
                    <button
                      type="button"
                      className={styles.rxhRestoreBtn}
                      onClick={() => onRestore(entry)}
                      title="Restore this pattern"
                      aria-label="Restore this pattern"
                    >
                      <i className="ti ti-arrow-back-up" />
                      Restore
                    </button>
                    <button
                      type="button"
                      className={styles.rxhDeleteBtn}
                      onClick={() => onDelete(entry.id)}
                      title="Delete entry"
                      aria-label="Delete entry"
                    >
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                </div>

                <div className={styles.rxhEntryBody}>
                  <div className={styles.rxhPatternRow}>
                    <span className={styles.rxhLabel}>Pattern:</span>
                    <code className={styles.rxhPattern}>
                      /{entry.pattern}/
                      {Object.entries(entry.flags)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join("")}
                    </code>
                  </div>

                  <div className={styles.rxhTestRow}>
                    <span className={styles.rxhLabel}>Test:</span>
                    <code className={styles.rxhTest}>
                      {entry.testString.length > 120
                        ? entry.testString.substring(0, 120) + "..."
                        : entry.testString}
                    </code>
                  </div>

                  {Object.entries(entry.flags).some(([, v]) => v) && (
                    <div className={styles.rxhFlagsRow}>
                      <span className={styles.rxhLabel}>Flags:</span>
                      <div className={styles.rxhFlags}>
                        {Object.entries(entry.flags)
                          .filter(([, v]) => v)
                          .map(([flag]) => (
                            <span key={flag} className={styles.rxhFlagChip}>
                              {flag}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}