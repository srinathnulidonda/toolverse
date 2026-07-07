// features/dev/random-string-generator/HistoryView.tsx
"use client";

import { useState, useMemo } from "react";
import type { GeneratedString } from "./utils";
import { formatNumber } from "./utils";

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
            items = items.filter(item => favorites.includes(item.value));
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.value.toLowerCase().includes(query)
            );
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

    const strengthColor = (strength: string) => ({
        weak: "#dc2626",
        fair: "#f59e0b",
        good: "#10b981",
        strong: "#059669",
        excellent: "#047857",
    }[strength] || "#6B6A62");

    const stats = useMemo(() => {
        const totalChars = history.reduce((sum, item) => {
            // Safe access to item.value with fallback
            return sum + (item?.value?.length || 0);
        }, 0);
        
        const avgEntropy = history.length > 0
            ? history.reduce((sum, item) => sum + (item?.entropy || 0), 0) / history.length
            : 0;
            
        const strengthCounts = history.reduce((acc, item) => {
            const strength = item?.strength || "weak";
            acc[strength] = (acc[strength] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

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
            <div className="hv-root">
                {/*  Header  */}
                <div className="hv-header">
                    <div className="hv-header-left">
                        <div className="hv-title">
                            <i className="ti ti-history" />
                            <span>Generation History</span>
                            {history.length > 0 && (
                                <span className="hv-count-badge">{formatNumber(history.length)}</span>
                            )}
                        </div>
                    </div>
                    <div className="hv-header-actions">
                        {favorites.length > 0 && (
                            <button
                                type="button"
                                className="hv-action-btn"
                                onClick={onClearFavorites}
                            >
                                <i className="ti ti-star-off" />
                                Clear Favorites
                            </button>
                        )}
                        <button
                            type="button"
                            className="hv-action-btn hv-clear-btn"
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
                    <div className="hv-stats-bar">
                        <div className="hv-stat">
                            <i className="ti ti-hash" />
                            <div className="hv-stat-content">
                                <span className="hv-stat-value">{formatNumber(stats.total)}</span>
                                <span className="hv-stat-label">Total</span>
                            </div>
                        </div>
                        <div className="hv-stat">
                            <i className="ti ti-star" />
                            <div className="hv-stat-content">
                                <span className="hv-stat-value">{formatNumber(stats.favoriteCount)}</span>
                                <span className="hv-stat-label">Favorites</span>
                            </div>
                        </div>
                        <div className="hv-stat">
                            <i className="ti ti-shield-check" />
                            <div className="hv-stat-content">
                                <span className="hv-stat-value">{stats.avgEntropy.toFixed(1)}</span>
                                <span className="hv-stat-label">Avg Entropy</span>
                            </div>
                        </div>
                        <div className="hv-stat">
                            <i className="ti ti-text-size" />
                            <div className="hv-stat-content">
                                <span className="hv-stat-value">{formatNumber(stats.totalChars)}</span>
                                <span className="hv-stat-label">Total Chars</span>
                            </div>
                        </div>
                    </div>
                )}

                {/*  Controls  */}
                {history.length > 0 && (
                    <div className="hv-controls">
                        <div className="hv-search">
                            <i className="ti ti-search" />
                            <input
                                type="text"
                                className="hv-search-input"
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="hv-search-clear"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <i className="ti ti-x" />
                                </button>
                            )}
                        </div>

                        <div className="hv-filters">
                            <div className="hv-filter-group">
                                <button
                                    type="button"
                                    className={`hv-filter-btn${filter === "all" ? " active" : ""}`}
                                    onClick={() => setFilter("all")}
                                >
                                    <i className="ti ti-list" />
                                    All
                                </button>
                                <button
                                    type="button"
                                    className={`hv-filter-btn${filter === "favorites" ? " active" : ""}`}
                                    onClick={() => setFilter("favorites")}
                                >
                                    <i className="ti ti-star" />
                                    Favorites
                                    {favorites.length > 0 && (
                                        <span className="hv-filter-count">{favorites.length}</span>
                                    )}
                                </button>
                            </div>

                            <select
                                className="hv-sort-select"
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
                    <div className="hv-empty">
                        <div className="hv-empty-icon">
                            <i className="ti ti-history-off" />
                        </div>
                        <p className="hv-empty-title">No History Yet</p>
                        <p className="hv-empty-desc">
                            Your generated strings will appear here. History is stored locally in your browser and never leaves your device.
                        </p>
                    </div>
                ) : filteredAndSorted.length === 0 ? (
                    <div className="hv-empty">
                        <div className="hv-empty-icon">
                            <i className="ti ti-search-off" />
                        </div>
                        <p className="hv-empty-title">No Results</p>
                        <p className="hv-empty-desc">
                            {searchQuery
                                ? `No strings matching "${searchQuery}"`
                                : "No favorites yet. Click the star icon to save your favorite strings."}
                        </p>
                    </div>
                ) : (
                    <div className="hv-list">
                        <div className="hv-list-header">
                            <span className="hv-list-count">
                                {formatNumber(filteredAndSorted.length)} result{filteredAndSorted.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="hv-items">
                            {filteredAndSorted.map((item) => {
                                const isFavorite = favorites.includes(item.value);
                                return (
                                    <div key={item.id} className="hv-item">
                                        <div className="hv-item-header">
                                            <div className="hv-item-meta">
                                                <span className="hv-item-time">{formatTimestamp(item.timestamp)}</span>
                                                <span className="hv-item-separator">·</span>
                                                <span className="hv-item-length">{item.value.length} chars</span>
                                            </div>
                                            <div className="hv-item-actions">
                                                <button
                                                    type="button"
                                                    className={`hv-icon-btn hv-favorite-btn${isFavorite ? " active" : ""}`}
                                                    onClick={() => onToggleFavorite(item.value)}
                                                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                >
                                                    <i className={`ti ${isFavorite ? "ti-star-filled" : "ti-star"}`} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="hv-icon-btn"
                                                    onClick={() => onRestore(item)}
                                                    title="Restore settings"
                                                >
                                                    <i className="ti ti-restore" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="hv-icon-btn hv-delete-btn"
                                                    onClick={() => onRemove(item.id)}
                                                    title="Remove from history"
                                                >
                                                    <i className="ti ti-trash" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="hv-item-value-row">
                                            <code className="hv-item-value">{item.value}</code>
                                            <button
                                                type="button"
                                                className={`hv-copy-btn${copiedId === item.id ? " copied" : ""}`}
                                                onClick={() => handleCopy(item.value, item.id)}
                                            >
                                                <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                                                {copiedId === item.id ? "Copied" : "Copy"}
                                            </button>
                                        </div>

                                        <div className="hv-item-footer">
                                            <div className="hv-item-strength">
                                                <span
                                                    className="hv-strength-dot"
                                                    style={{ background: strengthColor(item.strength) }}
                                                />
                                                <span className="hv-strength-label">{item.strength}</span>
                                            </div>
                                            <div className="hv-item-entropy">
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

            <style jsx>{`
                .hv-root {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Header  */
                .hv-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 14px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .hv-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .hv-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .hv-title i {
                    font-size: 16px;
                    color: var(--brand);
                }

                .hv-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    height: 20px;
                    padding: 0 7px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                }

                .hv-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .hv-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 12px;
                    border-radius: 7px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hv-action-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hv-action-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .hv-action-btn i {
                    font-size: 13px;
                }

                .hv-clear-btn:hover:not(:disabled) {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .hv-clear-btn:hover:not(:disabled) {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                /*  Stats Bar  */
                .hv-stats-bar {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1px;
                    background: var(--border);
                }

                .hv-stat {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 16px;
                    background: var(--bg-card);
                }

                .hv-stat > i {
                    font-size: 20px;
                    color: var(--text-tertiary);
                    flex-shrink: 0;
                }

                .hv-stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .hv-stat-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                    line-height: 1;
                }

                .hv-stat-label {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    font-weight: 600;
                }

                /*  Controls  */
                .hv-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hv-search {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .hv-search > i {
                    position: absolute;
                    left: 12px;
                    font-size: 14px;
                    color: var(--text-disabled);
                    pointer-events: none;
                }

                .hv-search-input {
                    width: 100%;
                    height: 36px;
                    padding: 0 36px 0 36px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    font-size: 13px;
                    color: var(--text);
                }

                .hv-search-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .hv-search-input::placeholder {
                    color: var(--text-disabled);
                }

                .hv-search-clear {
                    position: absolute;
                    right: 8px;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    border: none;
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hv-search-clear:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .hv-filters {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .hv-filter-group {
                    display: flex;
                    gap: 4px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 7px;
                    padding: 2px;
                }

                .hv-filter-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 12px;
                    border: none;
                    border-radius: 5px;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hv-filter-btn:hover {
                    color: var(--text);
                }

                .hv-filter-btn.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                }

                .hv-filter-btn i {
                    font-size: 13px;
                }

                .hv-filter-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 16px;
                    height: 16px;
                    padding: 0 4px;
                    border-radius: 99px;
                    background: var(--brand);
                    color: white;
                    font-size: 9px;
                    font-weight: 700;
                }

                .hv-sort-select {
                    height: 32px;
                    padding: 0 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 7px;
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .hv-sort-select:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                /*  Empty State  */
                .hv-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .hv-empty-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    color: var(--text-disabled);
                    margin-bottom: 8px;
                }

                .hv-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .hv-empty-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 380px;
                    line-height: 1.6;
                }

                /*  List  */
                .hv-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .hv-list-header {
                    padding: 10px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hv-list-count {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                }

                .hv-items {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                /*  Item  */
                .hv-item {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.12s;
                }

                .hv-item:hover {
                    border-color: var(--brand-border);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                }

                .hv-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                    gap: 10px;
                }

                .hv-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .hv-item-time {
                    font-family: var(--font-mono);
                }

                .hv-item-separator {
                    opacity: 0.5;
                }

                .hv-item-length {
                    font-family: var(--font-mono);
                    font-weight: 600;
                }

                .hv-item-actions {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .hv-icon-btn {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hv-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hv-favorite-btn.active {
                    background: #FEF3E7;
                    color: #f59e0b;
                    border-color: #FDBA74;
                }

                @media (prefers-color-scheme: dark) {
                    .hv-favorite-btn.active {
                        background: #2A1F08;
                        border-color: #3A2F18;
                    }
                }

                .hv-delete-btn:hover {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .hv-delete-btn:hover {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                .hv-item-value-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 12px;
                }

                .hv-item-value {
                    flex: 1;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.6;
                    background: var(--bg-surface);
                    padding: 8px 10px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border-faint);
                }

                .hv-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .hv-copy-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .hv-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .hv-copy-btn i {
                    font-size: 11px;
                }

                .hv-item-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border-faint);
                }

                .hv-item-strength {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hv-strength-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .hv-strength-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: capitalize;
                }

                .hv-item-entropy {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .hv-item-entropy i {
                    font-size: 12px;
                }

                @media (max-width: 768px) {
                    .hv-stats-bar {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .hv-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .hv-item-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .hv-action-btn,
                    .hv-search-clear,
                    .hv-filter-btn,
                    .hv-icon-btn,
                    .hv-copy-btn,
                    .hv-item {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}