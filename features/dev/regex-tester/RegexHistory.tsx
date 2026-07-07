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

export default function RegexHistory({
    history,
    onRestore,
    onClear,
    onDelete,
}: RegexHistoryProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"recent" | "matches">("recent");

    const filteredHistory = useMemo(() => {
        let result = [...history];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (h) =>
                    h.pattern.toLowerCase().includes(query) ||
                    h.testString.toLowerCase().includes(query)
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
            avgMatches: history.length > 0
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
                        <p className="rxh-empty-title">
                            {searchQuery ? "No matches found" : "No history yet"}
                        </p>
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
                                        >
                                            <i className="ti ti-arrow-back-up" />
                                            Restore
                                        </button>
                                        <button
                                            type="button"
                                            className="rxh-delete-btn"
                                            onClick={() => onDelete(entry.id)}
                                            title="Delete entry"
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

            <style jsx>{`
                .rxh-root {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                .rxh-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .rxh-search-wrap {
                    flex: 1;
                    min-width: 280px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 14px;
                    height: 40px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    transition: border-color 0.12s;
                }

                .rxh-search-wrap:focus-within {
                    border-color: var(--brand);
                    box-shadow: 0 0 0 3px var(--brand-light);
                }

                .rxh-search-wrap i {
                    font-size: 16px;
                    color: var(--text-tertiary);
                    flex-shrink: 0;
                }

                .rxh-search-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    font-size: 14px;
                    color: var(--text);
                    outline: none;
                }

                .rxh-search-input::placeholder {
                    color: var(--text-disabled);
                }

                .rxh-clear-search {
                    width: 20px;
                    height: 20px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.12s;
                }

                .rxh-clear-search:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxh-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .rxh-sort-group {
                    display: flex;
                    gap: 2px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: 2px;
                }

                .rxh-sort-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 32px;
                    padding: 0 12px;
                    border: none;
                    border-radius: calc(var(--radius-md) - 2px);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxh-sort-btn i {
                    font-size: 13px;
                }

                .rxh-sort-btn:hover {
                    color: var(--text);
                }

                .rxh-sort-btn.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                }

                .rxh-clear-all-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 36px;
                    padding: 0 14px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxh-clear-all-btn:hover:not(:disabled) {
                    color: #DC2626;
                    background: var(--error-bg);
                    border-color: #FECACA;
                }

                @media (prefers-color-scheme: dark) {
                    .rxh-clear-all-btn:hover:not(:disabled) {
                        color: #F87171;
                        border-color: #7F1D1D;
                    }
                }

                .rxh-clear-all-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .rxh-clear-all-btn i {
                    font-size: 15px;
                }

                .rxh-stats-bar {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 14px 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    flex-wrap: wrap;
                }

                .rxh-stat {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .rxh-stat i {
                    font-size: 15px;
                    color: var(--text-tertiary);
                }

                .rxh-stat strong {
                    color: var(--text);
                    font-weight: 700;
                }

                .rxh-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 80px 24px;
                    text-align: center;
                }

                .rxh-empty-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                    color: var(--text-disabled);
                    margin-bottom: 8px;
                }

                .rxh-empty-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .rxh-empty-desc {
                    font-size: 14px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 380px;
                    line-height: 1.6;
                }

                .rxh-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .rxh-entry {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: border-color 0.12s;
                }

                .rxh-entry:hover {
                    border-color: var(--brand-border);
                }

                .rxh-entry-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                    flex-wrap: wrap;
                }

                .rxh-entry-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .rxh-timestamp,
                .rxh-match-count {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    color: var(--text-tertiary);
                }

                .rxh-timestamp i,
                .rxh-match-count i {
                    font-size: 13px;
                }

                .rxh-entry-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .rxh-restore-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 11.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxh-restore-btn:hover {
                    background: var(--brand);
                    color: white;
                }

                .rxh-restore-btn i {
                    font-size: 13px;
                }

                .rxh-delete-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxh-delete-btn:hover {
                    color: #DC2626;
                    background: var(--error-bg);
                    border-color: #FECACA;
                }

                @media (prefers-color-scheme: dark) {
                    .rxh-delete-btn:hover {
                        color: #F87171;
                        border-color: #7F1D1D;
                    }
                }

                .rxh-entry-body {
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .rxh-pattern-row,
                .rxh-test-row,
                .rxh-flags-row {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                }

                .rxh-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    min-width: 60px;
                    flex-shrink: 0;
                    padding-top: 2px;
                }

                .rxh-pattern,
                .rxh-test {
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    line-height: 1.6;
                    flex: 1;
                    word-break: break-all;
                }

                .rxh-pattern {
                    color: var(--brand);
                    font-weight: 600;
                    background: var(--brand-light);
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: 0.5px solid var(--brand-border);
                }

                .rxh-test {
                    color: var(--text);
                    background: var(--bg-surface);
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                }

                .rxh-flags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .rxh-flag-chip {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 22px;
                    padding: 0 8px;
                    border-radius: 4px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                }

                @media (max-width: 768px) {
                    .rxh-root {
                        padding: 12px;
                    }

                    .rxh-entry-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .rxh-entry-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .rxh-search-wrap,
                    .rxh-clear-search,
                    .rxh-sort-btn,
                    .rxh-clear-all-btn,
                    .rxh-entry,
                    .rxh-restore-btn,
                    .rxh-delete-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}