// features/dev/uuid-generator/UuidHistory.tsx
"use client";

import { formatTimestamp, VERSION_INFO } from "./utils";
import type { HistoryEntry } from "./uuidStore";

interface UuidHistoryProps {
    history: HistoryEntry[];
    onClear: () => void;
    onRestore: (entry: HistoryEntry) => void;
    onRemove: (id: string) => void;
}

export default function UuidHistory({ 
    history, 
    onClear, 
    onRestore,
    onRemove 
}: UuidHistoryProps) {
    const handleCopyEntry = async (uuids: string[]) => {
        try {
            await navigator.clipboard.writeText(uuids.join("\n"));
        } catch { /* silent */ }
    };

    return (
        <>
            <div className="uh-root">
                {history.length === 0 ? (
                    <div className="uh-empty">
                        <div className="uh-empty-icon">
                            <i className="ti ti-history" />
                        </div>
                        <p className="uh-empty-title">No History Yet</p>
                        <p className="uh-empty-desc">
                            Your UUID generation history will appear here. History is stored locally in your browser.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="uh-header">
                            <div className="uh-header-label">
                                <i className="ti ti-history" />
                                History
                                <span className="uh-count-badge">{history.length}</span>
                            </div>
                            <button type="button" className="uh-clear-btn" onClick={onClear}>
                                <i className="ti ti-trash" />
                                Clear All
                            </button>
                        </div>

                        <div className="uh-list">
                            {history.map((entry: HistoryEntry) => (
                                <div key={entry.id} className="uh-entry">
                                    <div className="uh-entry-header">
                                        <div className="uh-entry-meta">
                                            <span className="uh-version-badge">
                                                {VERSION_INFO[entry.version].label}
                                            </span>
                                            <span className="uh-format-tag">{entry.format}</span>
                                            <span className="uh-count-tag">
                                                <i className="ti ti-hash" />
                                                {entry.count}
                                            </span>
                                        </div>
                                        <div className="uh-entry-actions">
                                            <span className="uh-timestamp">
                                                {formatTimestamp(entry.timestamp)}
                                            </span>
                                            <button
                                                type="button"
                                                className="uh-icon-btn"
                                                onClick={() => onRestore(entry)}
                                                title="Restore"
                                            >
                                                <i className="ti ti-arrow-back-up" />
                                            </button>
                                            <button
                                                type="button"
                                                className="uh-icon-btn uh-remove-btn"
                                                onClick={() => onRemove(entry.id)}
                                                title="Remove"
                                            >
                                                <i className="ti ti-x" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="uh-entry-content">
                                        <div className="uh-uuids">
                                            {entry.uuids.slice(0, 3).map((uuid: string, i: number) => (
                                                <code key={i} className="uh-uuid">{uuid}</code>
                                            ))}
                                            {entry.count > 3 && (
                                                <span className="uh-more">
                                                    +{entry.count - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="uh-entry-footer">
                                        <button
                                            type="button"
                                            className="uh-copy-btn"
                                            onClick={() => handleCopyEntry(entry.uuids)}
                                        >
                                            <i className="ti ti-copy" />
                                            Copy All
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                .uh-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /*  Header  */
                .uh-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-shrink: 0;
                }

                .uh-header-label {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .uh-header-label i {
                    font-size: 13px;
                }

                .uh-count-badge {
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

                .uh-clear-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .uh-clear-btn i {
                    font-size: 12px;
                }

                .uh-clear-btn:hover {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .uh-clear-btn:hover {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                /*  List  */
                .uh-list {
                    flex: 1;
                    overflow: auto;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .uh-entry {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: border-color 0.12s;
                }

                .uh-entry:hover {
                    border-color: var(--brand-border);
                }

                .uh-entry-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .uh-entry-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .uh-version-badge {
                    display: inline-flex;
                    align-items: center;
                    height: 22px;
                    padding: 0 8px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border: 0.5px solid var(--brand-border);
                    font-size: 10px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                }

                .uh-format-tag,
                .uh-count-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    height: 22px;
                    padding: 0 8px;
                    border-radius: 99px;
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    border: 0.5px solid var(--border);
                    font-size: 10px;
                    font-weight: 600;
                }

                .uh-count-tag i {
                    font-size: 10px;
                }

                .uh-entry-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .uh-timestamp {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .uh-icon-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: var(--radius-sm);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .uh-icon-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .uh-icon-btn i {
                    font-size: 12px;
                }

                .uh-remove-btn:hover {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .uh-remove-btn:hover {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                .uh-entry-content {
                    padding: 12px 14px;
                }

                .uh-uuids {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .uh-uuid {
                    font-family: var(--font-mono);
                    font-size: 11.5px;
                    color: var(--text);
                    background: var(--bg-surface);
                    padding: 6px 10px;
                    border-radius: var(--radius-sm);
                    border: 0.5px solid var(--border-faint);
                    word-break: break-all;
                }

                .uh-more {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-style: italic;
                    padding: 4px 10px;
                }

                .uh-entry-footer {
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border-faint);
                    display: flex;
                    justify-content: flex-end;
                }

                .uh-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .uh-copy-btn i {
                    font-size: 11px;
                }

                .uh-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                /*  Empty State  */
                .uh-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .uh-empty-icon {
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
                    margin-bottom: 6px;
                }

                .uh-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .uh-empty-desc {
                    font-size: 12.5px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .uh-list {
                        padding: 10px;
                    }

                    .uh-entry-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .uh-entry-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .uh-clear-btn,
                    .uh-icon-btn,
                    .uh-copy-btn,
                    .uh-entry {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}