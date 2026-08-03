// features/dev/regex-tester/RegexHistory.tsx
"use client";

import { useMemo, useState } from "react";
import type { HistoryEntry } from "./regexStore";

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
      <div className="rxh-root">
        {/* Header */}
        <div className="rxh-header">
          <div className="rxh-search-wrap">
            <i className="ti ti-search" />
            <input
              type="text"
              className="rxh-search-input"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="rxh-clear-search"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className="rxh-header-actions">
            <div className="rxh-sort-group">
              <button
                type="button"
                className={`rxh-sort-btn${sortBy === "recent" ? " active" : ""}`}
                onClick={() => setSortBy("recent")}
              >
                <i className="ti ti-clock" />
                Recent
              </button>
              <button
                type="button"
                className={`rxh-sort-btn${sortBy === "matches" ? " active" : ""}`}
                onClick={() => setSortBy("matches")}
              >
                <i className="ti ti-trending-up" />
                Matches
              </button>
            </div>

            <button
              type="button"
              className="rxh-clear-all-btn"
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
          <div className="rxh-stats-bar">
            <div className="rxh-stat">
              <i className="ti ti-history" />
              <span>
                <strong>{stats.total}</strong> {stats.total === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="rxh-stat">
              <i className="ti ti-check" />
              <span>
                <strong>{stats.totalMatches}</strong> total matches
              </span>
            </div>
            <div className="rxh-stat">
              <i className="ti ti-chart-line" />
              <span>
                <strong>{stats.avgMatches}</strong> avg matches
              </span>
            </div>
          </div>
        )}

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="rxh-empty">
            <div className="rxh-empty-icon">
              <i className="ti ti-history-off" />
            </div>
            <p className="rxh-empty-title">{searchQuery ? "No matches found" : "No history yet"}</p>
            <p className="rxh-empty-desc">
              {searchQuery
                ? "Try adjusting your search query"
                : "Your regex test history will appear here"}
            </p>
          </div>
        ) : (
          <div className="rxh-list">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="rxh-entry">
                <div className="rxh-entry-header">
                  <div className="rxh-entry-info">
                    <span className="rxh-timestamp">
                      <i className="ti ti-clock" />
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <span className="rxh-match-count">
                      <i className="ti ti-check" />
                      {entry.matchCount} {entry.matchCount === 1 ? "match" : "matches"}
                    </span>
                  </div>
                  <div className="rxh-entry-actions">
                    <button
                      type="button"
                      className="rxh-restore-btn"
                      onClick={() => onRestore(entry)}
                      title="Restore this pattern"
                      aria-label="Restore this pattern"
                    >
                      <i className="ti ti-arrow-back-up" />
                      Restore
                    </button>
                    <button
                      type="button"
                      className="rxh-delete-btn"
                      onClick={() => onDelete(entry.id)}
                      title="Delete entry"
                      aria-label="Delete entry"
                    >
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                </div>

                <div className="rxh-entry-body">
                  <div className="rxh-pattern-row">
                    <span className="rxh-label">Pattern:</span>
                    <code className="rxh-pattern">
                      /{entry.pattern}/
                      {Object.entries(entry.flags)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join("")}
                    </code>
                  </div>

                  <div className="rxh-test-row">
                    <span className="rxh-label">Test:</span>
                    <code className="rxh-test">
                      {entry.testString.length > 120
                        ? entry.testString.substring(0, 120) + "..."
                        : entry.testString}
                    </code>
                  </div>

                  {Object.entries(entry.flags).some(([, v]) => v) && (
                    <div className="rxh-flags-row">
                      <span className="rxh-label">Flags:</span>
                      <div className="rxh-flags">
                        {Object.entries(entry.flags)
                          .filter(([, v]) => v)
                          .map(([flag]) => (
                            <span key={flag} className="rxh-flag-chip">
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
