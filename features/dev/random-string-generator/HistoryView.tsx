// features/dev/random-string-generator/HistoryView.tsx

"use client";

import { useState, useMemo } from "react";
import type { GeneratedString } from "./ts/utils";
import { formatNumber } from "./ts/utils";
import styles from "./style/HistoryView.module.css";

interface HistoryViewProps {
  history: GeneratedString[];
  favorites: string[];
  onClear: () => void;
  onRemove: (id: string) => void;
  onRestore: (entry: GeneratedString) => void;
  onToggleFavorite: (value: string) => void;
  onClearFavorites: () => void;
}

type FilterType = "all" | "favorites";
type SortBy = "newest" | "oldest" | "length" | "strength";

export default function HistoryView({
  history,
  favorites,
  onClear,
  onRemove,
  onRestore,
  onToggleFavorite,
  onClearFavorites,
}: HistoryViewProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAndSorted = useMemo(() => {
    let items = [...history];

    // Apply filter
    if (filter === "favorites") {
      items = items.filter((item) => favorites.includes(item.value));
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.value.toLowerCase().includes(query));
    }

    // Apply sort
    items.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp - a.timestamp;
        case "oldest":
          return a.timestamp - b.timestamp;
        case "length":
          return b.value.length - a.value.length;
        case "strength":
          return b.entropy - a.entropy;
        default:
          return 0;
      }
    });

    return items;
  }, [history, favorites, filter, sortBy, searchQuery]);

  const handleCopy = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Silent fail
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const strengthColor = (strength: string) =>
    ({
      weak: "#dc2626",
      fair: "#f59e0b",
      good: "#10b981",
      strong: "#059669",
      excellent: "#047857",
    })[strength] || "#6B6A62";

  const stats = useMemo(() => {
    const totalChars = history.reduce((sum, item) => {
      // Safe access to item.value with fallback
      return sum + (item?.value?.length || 0);
    }, 0);

    const avgEntropy =
      history.length > 0
        ? history.reduce((sum, item) => sum + (item?.entropy || 0), 0) / history.length
        : 0;

    const strengthCounts = history.reduce(
      (acc, item) => {
        const strength = item?.strength || "weak";
        acc[strength] = (acc[strength] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: history.length,
      totalChars,
      avgEntropy,
      strengthCounts,
      favoriteCount: favorites.length,
    };
  }, [history, favorites]);

  return (
    <>
      <div className={styles.hvRoot}>
        {/*  Header  */}
        <div className={styles.hvHeader}>
          <div className={styles.hvHeaderLeft}>
            <div className={styles.hvTitle}>
              <i className="ti ti-history" />
              <span>Generation History</span>
              {history.length > 0 && (
                <span className={styles.hvCountBadge}>{formatNumber(history.length)}</span>
              )}
            </div>
          </div>
          <div className={styles.hvHeaderActions}>
            {favorites.length > 0 && (
              <button type="button" className={styles.hvActionBtn} onClick={onClearFavorites}>
                <i className="ti ti-star-off" />
                Clear Favorites
              </button>
            )}
            <button
              type="button"
              className={`${styles.hvActionBtn} ${styles.hvClearBtn}`}
              onClick={onClear}
              disabled={history.length === 0}
            >
              <i className="ti ti-trash" />
              Clear All
            </button>
          </div>
        </div>

        {/*  Stats Bar  */}
        {history.length > 0 && (
          <div className={styles.hvStatsBar}>
            <div className={styles.hvStat}>
              <i className="ti ti-hash" />
              <div className={styles.hvStatContent}>
                <span className={styles.hvStatValue}>{formatNumber(stats.total)}</span>
                <span className={styles.hvStatLabel}>Total</span>
              </div>
            </div>
            <div className={styles.hvStat}>
              <i className="ti ti-star" />
              <div className={styles.hvStatContent}>
                <span className={styles.hvStatValue}>{formatNumber(stats.favoriteCount)}</span>
                <span className={styles.hvStatLabel}>Favorites</span>
              </div>
            </div>
            <div className={styles.hvStat}>
              <i className="ti ti-shield-check" />
              <div className={styles.hvStatContent}>
                <span className={styles.hvStatValue}>{stats.avgEntropy.toFixed(1)}</span>
                <span className={styles.hvStatLabel}>Avg Entropy</span>
              </div>
            </div>
            <div className={styles.hvStat}>
              <i className="ti ti-text-size" />
              <div className={styles.hvStatContent}>
                <span className={styles.hvStatValue}>{formatNumber(stats.totalChars)}</span>
                <span className={styles.hvStatLabel}>Total Chars</span>
              </div>
            </div>
          </div>
        )}

        {/*  Controls  */}
        {history.length > 0 && (
          <div className={styles.hvControls}>
            <div className={styles.hvSearch}>
              <i className="ti ti-search" />
              <input
                type="text"
                className={styles.hvSearchInput}
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.hvSearchClear}
                  onClick={() => setSearchQuery("")}
                >
                  <i className="ti ti-x" />
                </button>
              )}
            </div>

            <div className={styles.hvFilters}>
              <div className={styles.hvFilterGroup}>
                <button
                  type="button"
                  className={`${styles.hvFilterBtn}${filter === "all" ? ` ${styles.active}` : ""}`}
                  onClick={() => setFilter("all")}
                >
                  <i className="ti ti-list" />
                  All
                </button>
                <button
                  type="button"
                  className={`${styles.hvFilterBtn}${filter === "favorites" ? ` ${styles.active}` : ""}`}
                  onClick={() => setFilter("favorites")}
                >
                  <i className="ti ti-star" />
                  Favorites
                  {favorites.length > 0 && (
                    <span className={styles.hvFilterCount}>{favorites.length}</span>
                  )}
                </button>
              </div>

              <select
                className={styles.hvSortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="length">Longest First</option>
                <option value="strength">Strongest First</option>
              </select>
            </div>
          </div>
        )}

        {/*  Content  */}
        {history.length === 0 ? (
          <div className={styles.hvEmpty}>
            <div className={styles.hvEmptyIcon}>
              <i className="ti ti-history-off" />
            </div>
            <p className={styles.hvEmptyTitle}>No History Yet</p>
            <p className={styles.hvEmptyDesc}>
              Your generated strings will appear here. History is stored locally in your browser and
              never leaves your device.
            </p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className={styles.hvEmpty}>
            <div className={styles.hvEmptyIcon}>
              <i className="ti ti-search-off" />
            </div>
            <p className={styles.hvEmptyTitle}>No Results</p>
            <p className={styles.hvEmptyDesc}>
              {searchQuery
                ? `No strings matching "${searchQuery}"`
                : "No favorites yet. Click the star icon to save your favorite strings."}
            </p>
          </div>
        ) : (
          <div className={styles.hvList}>
            <div className={styles.hvListHeader}>
              <span className={styles.hvListCount}>
                {formatNumber(filteredAndSorted.length)} result
                {filteredAndSorted.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className={styles.hvItems}>
              {filteredAndSorted.map((item) => {
                const isFavorite = favorites.includes(item.value);
                return (
                  <div key={item.id} className={styles.hvItem}>
                    <div className={styles.hvItemHeader}>
                      <div className={styles.hvItemMeta}>
                        <span className={styles.hvItemTime}>{formatTimestamp(item.timestamp)}</span>
                        <span className={styles.hvItemSeparator}>·</span>
                        <span className={styles.hvItemLength}>{item.value.length} chars</span>
                      </div>
                      <div className={styles.hvItemActions}>
                        <button
                          type="button"
                          className={`${styles.hvIconBtn} ${styles.hvFavoriteBtn}${isFavorite ? ` ${styles.active}` : ""}`}
                          onClick={() => onToggleFavorite(item.value)}
                          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <i className={`ti ${isFavorite ? "ti-star-filled" : "ti-star"}`} />
                        </button>
                        <button
                          type="button"
                          className={styles.hvIconBtn}
                          onClick={() => onRestore(item)}
                          title="Restore settings"
                        >
                          <i className="ti ti-restore" />
                        </button>
                        <button
                          type="button"
                          className={`${styles.hvIconBtn} ${styles.hvDeleteBtn}`}
                          onClick={() => onRemove(item.id)}
                          title="Remove from history"
                        >
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </div>

                    <div className={styles.hvItemValueRow}>
                      <code className={styles.hvItemValue}>{item.value}</code>
                      <button
                        type="button"
                        className={`${styles.hvCopyBtn}${copiedId === item.id ? ` ${styles.copied}` : ""}`}
                        onClick={() => handleCopy(item.value, item.id)}
                      >
                        <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                        {copiedId === item.id ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className={styles.hvItemFooter}>
                      <div className={styles.hvItemStrength}>
                        <span
                          className={styles.hvStrengthDot}
                          style={{ background: strengthColor(item.strength) }}
                        />
                        <span className={styles.hvStrengthLabel}>{item.strength}</span>
                      </div>
                      <div className={styles.hvItemEntropy}>
                        <i className="ti ti-lock" />
                        {item.entropy.toFixed(1)} bits
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}