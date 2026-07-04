// features/dev/case-converter/CaseHistory.tsx
"use client";

import type { HistoryEntry } from "./caseStore";

interface CaseHistoryProps {
    history: HistoryEntry[];
    onClear: () => void;
    onRestore: (entry: HistoryEntry) => void;
}

export default function CaseHistory({ history, onClear, onRestore }: CaseHistoryProps) {
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

    return (
        <>
            <div className="ch-root">
                {history.length === 0 ? (
                    <div className="ch-empty">
                        <div className="ch-empty-icon">
                            <i className="ti ti-history" />
                        </div>
                        <p className="ch-empty-title">No History Yet</p>
                        <p className="ch-empty-desc">
                            Your conversion history will appear here. History is stored locally in your
                            browser.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="ch-header">
                            <div className="ch-header-label">
                                <i className="ti ti-history" />
                                Conversion History
                                <span className="ch-count-badge">{history.length}</span>
                            </div>
                            <button type="button" className="ch-clear-btn" onClick={onClear}>
                                <i className="ti ti-trash" />
                                Clear All
                            </button>
                        </div>

                        <div className="ch-list">
                            {history.map((entry) => (
                                <div key={entry.id} className="ch-item">
                                    <div className="ch-item-header">
                                        <div className="ch-item-conversion">
                                            <span className="ch-item-case">{entry.toCase}</span>
                                            <i className="ti ti-arrow-right" />
                                        </div>
                                        <div className="ch-item-meta">
                                            <span className="ch-item-time">
                                                {formatTimestamp(entry.timestamp)}
                                            </span>
                                            <button
                                                type="button"
                                                className="ch-restore-btn"
                                                onClick={() => onRestore(entry)}
                                                title="Restore this conversion"
                                            >
                                                <i className="ti ti-arrow-back-up" />
                                                Restore
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ch-item-content">
                                        <div className="ch-item-row">
                                            <span className="ch-item-label">Input:</span>
                                            <code className="ch-item-code">{entry.input}</code>
                                        </div>
                                        <div className="ch-item-row">
                                            <span className="ch-item-label">Output:</span>
                                            <code className="ch-item-code">{entry.output}</code>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                .ch-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* ── Header ── */
                .ch-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-shrink: 0;
                }

                .ch-header-label {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ch-header-label i {
                    font-size: 12px;
                }

                .ch-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 600;
                }

                .ch-clear-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .ch-clear-btn i {
                    font-size: 12px;
                }

                .ch-clear-btn:hover {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .ch-clear-btn:hover {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                /* ── List ── */
                .ch-list {
                    flex: 1;
                    overflow: auto;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .ch-item {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    overflow: hidden;
                    transition: border-color 0.12s;
                }

                .ch-item:hover {
                    border-color: var(--brand-border);
                }

                .ch-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                    gap: 12px;
                }

                .ch-item-conversion {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                }

                .ch-item-case {
                    display: inline-flex;
                    align-items: center;
                    height: 22px;
                    padding: 0 8px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 11px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                }

                .ch-item-conversion i {
                    font-size: 12px;
                    color: var(--text-disabled);
                }

                .ch-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .ch-item-time {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .ch-restore-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .ch-restore-btn i {
                    font-size: 11px;
                }

                .ch-restore-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .ch-item-content {
                    padding: 12px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .ch-item-row {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .ch-item-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .ch-item-code {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    background: var(--bg-surface);
                    padding: 8px 10px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border-faint);
                    word-break: break-all;
                    line-height: 1.6;
                }

                /* ── Empty State ── */
                .ch-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .ch-empty-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 13px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: var(--text-disabled);
                    margin-bottom: 6px;
                }

                .ch-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .ch-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .ch-list {
                        padding: 12px;
                    }

                    .ch-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .ch-item-meta {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ch-clear-btn,
                    .ch-restore-btn,
                    .ch-item {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}