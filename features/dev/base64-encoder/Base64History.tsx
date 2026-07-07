// features/dev/base64-encoder/Base64History.tsx
"use client";

import { formatBytes } from "@/utils";
import * as store from "./base64Store";

interface Base64HistoryProps {
    history: store.HistoryEntry[];
    onClear: () => void;
    onRestore: (entry: store.HistoryEntry) => void;
}

export default function Base64History({ history, onClear, onRestore }: Base64HistoryProps) {
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
            <div className="bh-root">
                {history.length === 0 ? (
                    <div className="bh-empty">
                        <div className="bh-empty-icon">
                            <i className="ti ti-history" />
                        </div>
                        <p className="bh-empty-title">No History Yet</p>
                        <p className="bh-empty-desc">
                            Your conversion history will appear here. History is stored locally in your browser.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bh-header">
                            <div className="bh-header-label">
                                <i className="ti ti-history" />
                                History
                                <span className="bh-count-badge">{history.length}</span>
                            </div>
                            <button type="button" className="bh-clear-btn" onClick={onClear}>
                                <i className="ti ti-trash" />
                                Clear All
                            </button>
                        </div>

                        <div className="bh-list">
                            {history.map((entry) => (
                                <div key={entry.id} className="bh-item">
                                    <div className="bh-item-header">
                                        <div className="bh-item-mode">
                                            <i className={`ti ${entry.mode === "encode" ? "ti-lock" : "ti-lock-open"}`} />
                                            <span>{entry.mode === "encode" ? "Encode" : "Decode"}</span>
                                        </div>
                                        <div className="bh-item-meta">
                                            <span className="bh-item-time">{formatTimestamp(entry.timestamp)}</span>
                                            <button
                                                type="button"
                                                className="bh-restore-btn"
                                                onClick={() => onRestore(entry)}
                                                title="Restore this conversion"
                                            >
                                                <i className="ti ti-arrow-back-up" />
                                                Restore
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bh-item-content">
                                        <div className="bh-item-row">
                                            <span className="bh-item-label">Input:</span>
                                            <code className="bh-item-code">
                                                {entry.input}
                                                {entry.input.length < entry.output.length && "..."}
                                            </code>
                                        </div>
                                        <div className="bh-item-row">
                                            <span className="bh-item-label">Output:</span>
                                            <code className="bh-item-code">
                                                {entry.output}
                                                {entry.output.length > 100 && "..."}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="bh-item-footer">
                                        <div className="bh-item-options">
                                            {entry.options.urlSafe && (
                                                <span className="bh-option-tag">URL-safe</span>
                                            )}
                                            {entry.options.wrapLines && (
                                                <span className="bh-option-tag">Wrapped</span>
                                            )}
                                            {entry.options.asDataUri && (
                                                <span className="bh-option-tag">Data URI</span>
                                            )}
                                            {!entry.options.padding && (
                                                <span className="bh-option-tag">No padding</span>
                                            )}
                                            {entry.options.charset !== "UTF-8" && (
                                                <span className="bh-option-tag">{entry.options.charset}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                .bh-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /*  Header  */
                .bh-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-shrink: 0;
                }

                .bh-header-label {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .bh-header-label i {
                    font-size: 12px;
                }

                .bh-count-badge {
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

                .bh-clear-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--b64-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bh-clear-btn i {
                    font-size: 12px;
                }

                .bh-clear-btn:hover {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .bh-clear-btn:hover {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                /*  List  */
                .bh-list {
                    flex: 1;
                    overflow: auto;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .bh-item {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--b64-radius-lg);
                    overflow: hidden;
                    transition: border-color 0.12s;
                }

                .bh-item:hover {
                    border-color: var(--brand-border);
                }

                .bh-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                    gap: 12px;
                }

                .bh-item-mode {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                }

                .bh-item-mode i {
                    font-size: 13px;
                    color: var(--brand);
                }

                .bh-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bh-item-time {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .bh-restore-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: var(--b64-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bh-restore-btn i {
                    font-size: 11px;
                }

                .bh-restore-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .bh-item-content {
                    padding: 12px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .bh-item-row {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bh-item-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .bh-item-code {
                    font-family: var(--font-mono);
                    font-size: 11.5px;
                    color: var(--text);
                    background: var(--bg-surface);
                    padding: 6px 10px;
                    border-radius: 5px;
                    border: 0.5px solid var(--border-faint);
                    word-break: break-all;
                    line-height: 1.6;
                }

                .bh-item-footer {
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border-faint);
                }

                .bh-item-options {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .bh-option-tag {
                    display: inline-flex;
                    align-items: center;
                    height: 20px;
                    padding: 0 8px;
                    border-radius: 99px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    color: var(--text-tertiary);
                    font-size: 10px;
                    font-weight: 500;
                }

                /*  Empty State  */
                .bh-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .bh-empty-icon {
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

                .bh-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .bh-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .bh-list {
                        padding: 10px;
                    }

                    .bh-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .bh-item-meta {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .bh-clear-btn,
                    .bh-restore-btn,
                    .bh-item {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}