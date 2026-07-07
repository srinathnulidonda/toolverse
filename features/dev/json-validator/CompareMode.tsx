// features/dev/json-validator/CompareMode.tsx
"use client";

import { useState, useMemo, useCallback } from "react";

interface CompareModeProps {
    leftDefault?: string;
}

type DiffType = "added" | "removed" | "modified" | "same";

interface DiffLine {
    type: DiffType;
    path: string;
    leftValue?: any;
    rightValue?: any;
    line: number;
}

function deepCompare(left: any, right: any, path = "$"): DiffLine[] {
    const diffs: DiffLine[] = [];
    
    // Type mismatch
    if (typeof left !== typeof right || Array.isArray(left) !== Array.isArray(right)) {
        diffs.push({
            type: "modified",
            path,
            leftValue: left,
            rightValue: right,
            line: 0
        });
        return diffs;
    }

    // Primitives
    if (typeof left !== "object" || left === null) {
        if (left !== right) {
            diffs.push({
                type: "modified",
                path,
                leftValue: left,
                rightValue: right,
                line: 0
            });
        }
        return diffs;
    }

    // Arrays
    if (Array.isArray(left)) {
        const maxLen = Math.max(left.length, right.length);
        for (let i = 0; i < maxLen; i++) {
            if (i >= left.length) {
                diffs.push({
                    type: "added",
                    path: `${path}[${i}]`,
                    rightValue: right[i],
                    line: 0
                });
            } else if (i >= right.length) {
                diffs.push({
                    type: "removed",
                    path: `${path}[${i}]`,
                    leftValue: left[i],
                    line: 0
                });
            } else {
                diffs.push(...deepCompare(left[i], right[i], `${path}[${i}]`));
            }
        }
        return diffs;
    }

    // Objects
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of allKeys) {
        const newPath = `${path}.${key}`;
        if (!(key in right)) {
            diffs.push({
                type: "removed",
                path: newPath,
                leftValue: left[key],
                line: 0
            });
        } else if (!(key in left)) {
            diffs.push({
                type: "added",
                path: newPath,
                rightValue: right[key],
                line: 0
            });
        } else {
            diffs.push(...deepCompare(left[key], right[key], newPath));
        }
    }

    return diffs;
}

export default function CompareMode({ leftDefault = "" }: CompareModeProps) {
    const [leftInput, setLeftInput] = useState(leftDefault);
    const [rightInput, setRightInput] = useState("");
    const [viewMode, setViewMode] = useState<"split" | "unified">("split");
    const [copiedKey, setCopiedKey] = useState("");

    const comparison = useMemo(() => {
        if (!leftInput.trim() || !rightInput.trim()) {
            return { valid: false, diffs: [] };
        }

        try {
            const leftParsed = JSON.parse(leftInput);
            const rightParsed = JSON.parse(rightInput);
            const diffs = deepCompare(leftParsed, rightParsed);
            
            return {
                valid: true,
                diffs,
                stats: {
                    added: diffs.filter(d => d.type === "added").length,
                    removed: diffs.filter(d => d.type === "removed").length,
                    modified: diffs.filter(d => d.type === "modified").length,
                    same: diffs.filter(d => d.type === "same").length,
                }
            };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : "Parse error",
                diffs: []
            };
        }
    }, [leftInput, rightInput]);

    const handleCopy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1500);
    }, []);

    const areSame = comparison.valid && comparison.diffs.length === 0;

    return (
        <>
            <div className="cm-root">
                {/* Header */}
                <div className="cm-header">
                    <div className="cm-header-left">
                        <i className="ti ti-git-compare" />
                        <span>Compare JSON Documents</span>
                    </div>
                    <div className="cm-header-right">
                        <div className="cm-view-toggle">
                            <button
                                type="button"
                                className={`cm-view-btn${viewMode === "split" ? " active" : ""}`}
                                onClick={() => setViewMode("split")}
                            >
                                <i className="ti ti-layout-columns" />
                                Split
                            </button>
                            <button
                                type="button"
                                className={`cm-view-btn${viewMode === "unified" ? " active" : ""}`}
                                onClick={() => setViewMode("unified")}
                            >
                                <i className="ti ti-list" />
                                Unified
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {comparison.valid && comparison.stats && (
                    <div className="cm-stats">
                        {areSame ? (
                            <div className="cm-stat cm-stat--same">
                                <i className="ti ti-checks" />
                                <span>Documents are identical</span>
                            </div>
                        ) : (
                            <>
                                {comparison.stats.added > 0 && (
                                    <div className="cm-stat cm-stat--added">
                                        <i className="ti ti-plus" />
                                        <span>{comparison.stats.added} added</span>
                                    </div>
                                )}
                                {comparison.stats.removed > 0 && (
                                    <div className="cm-stat cm-stat--removed">
                                        <i className="ti ti-minus" />
                                        <span>{comparison.stats.removed} removed</span>
                                    </div>
                                )}
                                {comparison.stats.modified > 0 && (
                                    <div className="cm-stat cm-stat--modified">
                                        <i className="ti ti-pencil" />
                                        <span>{comparison.stats.modified} modified</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className={`cm-body cm-body--${viewMode}`}>
                    {viewMode === "split" ? (
                        <>
                            {/* Left Panel */}
                            <div className="cm-panel">
                                <div className="cm-panel-header">
                                    <div className="cm-panel-title">
                                        <i className="ti ti-file" />
                                        Original
                                    </div>
                                    <div className="cm-panel-actions">
                                        <button
                                            type="button"
                                            className={`cm-copy-btn${copiedKey === "left" ? " copied" : ""}`}
                                            onClick={() => handleCopy(leftInput, "left")}
                                            disabled={!leftInput}
                                        >
                                            <i className={`ti ${copiedKey === "left" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                        <button
                                            type="button"
                                            className="cm-clear-btn"
                                            onClick={() => setLeftInput("")}
                                            disabled={!leftInput}
                                        >
                                            <i className="ti ti-x" />
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="cm-textarea"
                                    value={leftInput}
                                    onChange={(e) => setLeftInput(e.target.value)}
                                    placeholder="Paste first JSON..."
                                    spellCheck={false}
                                />
                            </div>

                            {/* Divider */}
                            <div className="cm-divider">
                                <div className="cm-divider-icon">
                                    <i className="ti ti-arrows-left-right" />
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="cm-panel">
                                <div className="cm-panel-header">
                                    <div className="cm-panel-title">
                                        <i className="ti ti-file" />
                                        Modified
                                    </div>
                                    <div className="cm-panel-actions">
                                        <button
                                            type="button"
                                            className={`cm-copy-btn${copiedKey === "right" ? " copied" : ""}`}
                                            onClick={() => handleCopy(rightInput, "right")}
                                            disabled={!rightInput}
                                        >
                                            <i className={`ti ${copiedKey === "right" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                        <button
                                            type="button"
                                            className="cm-clear-btn"
                                            onClick={() => setRightInput("")}
                                            disabled={!rightInput}
                                        >
                                            <i className="ti ti-x" />
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="cm-textarea"
                                    value={rightInput}
                                    onChange={(e) => setRightInput(e.target.value)}
                                    placeholder="Paste second JSON to compare..."
                                    spellCheck={false}
                                />
                            </div>
                        </>
                    ) : (
                        /* Unified View */
                        <div className="cm-unified">
                            {!comparison.valid && comparison.error && (
                                <div className="cm-error">
                                    <i className="ti ti-alert-circle" />
                                    <span>{comparison.error}</span>
                                </div>
                            )}

                            {comparison.valid && comparison.diffs.length === 0 && (
                                <div className="cm-same">
                                    <i className="ti ti-checks" />
                                    <span>Documents are identical</span>
                                </div>
                            )}

                            {comparison.valid && comparison.diffs.length > 0 && (
                                <div className="cm-diff-list">
                                    {comparison.diffs.map((diff, idx) => (
                                        <div key={idx} className={`cm-diff-item cm-diff-item--${diff.type}`}>
                                            <div className="cm-diff-icon">
                                                {diff.type === "added" && <i className="ti ti-plus" />}
                                                {diff.type === "removed" && <i className="ti ti-minus" />}
                                                {diff.type === "modified" && <i className="ti ti-pencil" />}
                                            </div>
                                            <div className="cm-diff-content">
                                                <div className="cm-diff-path">{diff.path}</div>
                                                {diff.type === "modified" && (
                                                    <div className="cm-diff-values">
                                                        <div className="cm-diff-value cm-diff-value--old">
                                                            <span className="cm-diff-label">−</span>
                                                            <code>{JSON.stringify(diff.leftValue)}</code>
                                                        </div>
                                                        <div className="cm-diff-value cm-diff-value--new">
                                                            <span className="cm-diff-label">+</span>
                                                            <code>{JSON.stringify(diff.rightValue)}</code>
                                                        </div>
                                                    </div>
                                                )}
                                                {diff.type === "removed" && (
                                                    <div className="cm-diff-value cm-diff-value--old">
                                                        <span className="cm-diff-label">−</span>
                                                        <code>{JSON.stringify(diff.leftValue)}</code>
                                                    </div>
                                                )}
                                                {diff.type === "added" && (
                                                    <div className="cm-diff-value cm-diff-value--new">
                                                        <span className="cm-diff-label">+</span>
                                                        <code>{JSON.stringify(diff.rightValue)}</code>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {!leftInput && !rightInput && (
                    <div className="cm-empty">
                        <div className="cm-empty-icon">
                            <i className="ti ti-git-compare" />
                        </div>
                        <h3 className="cm-empty-title">Compare JSON Documents</h3>
                        <p className="cm-empty-desc">
                            Paste two JSON documents to see structural differences, additions, and modifications.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .cm-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-surface);
                    overflow: hidden;
                    min-height: 0;
                }

                .cm-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .cm-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cm-header-left i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .cm-header-right {
                    display: flex;
                    gap: 8px;
                }

                .cm-view-toggle {
                    display: flex;
                    gap: 2px;
                    padding: 2px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                }

                .cm-view-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border: none;
                    border-radius: 5px;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .cm-view-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cm-view-btn.active {
                    background: var(--bg-card);
                    color: var(--text);
                    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
                }

                .cm-view-btn i {
                    font-size: 13px;
                }

                .cm-stats {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                    flex-shrink: 0;
                }

                .cm-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 99px;
                }

                .cm-stat i {
                    font-size: 13px;
                }

                .cm-stat--same {
                    background: #f0fdf4;
                    color: #16a34a;
                }

                .cm-stat--added {
                    background: #dcfce7;
                    color: #16a34a;
                }

                .cm-stat--removed {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .cm-stat--modified {
                    background: #fef3c7;
                    color: #d97706;
                }

                @media (prefers-color-scheme: dark) {
                    .cm-stat--same {
                        background: #052e16;
                        color: #4ade80;
                    }
                    .cm-stat--added {
                        background: #14532d;
                        color: #86efac;
                    }
                    .cm-stat--removed {
                        background: #1f1517;
                        color: #f87171;
                    }
                    .cm-stat--modified {
                        background: #451a03;
                        color: #fbbf24;
                    }
                }

                .cm-body {
                    flex: 1;
                    display: flex;
                    min-height: 0;
                    overflow: hidden;
                }

                .cm-body--split {
                    gap: 0;
                }

                .cm-body--unified {
                    flex-direction: column;
                }

                .cm-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    overflow: hidden;
                }

                .cm-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .cm-panel-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cm-panel-title i {
                    font-size: 13px;
                }

                .cm-panel-actions {
                    display: flex;
                    gap: 4px;
                }

                .cm-copy-btn,
                .cm-clear-btn {
                    width: 28px;
                    height: 28px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cm-copy-btn:hover:not(:disabled),
                .cm-clear-btn:hover:not(:disabled) {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cm-copy-btn:disabled,
                .cm-clear-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .cm-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .cm-textarea {
                    flex: 1;
                    padding: 14px 16px;
                    border: none;
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 13px;
                    font-family: var(--font-mono);
                    line-height: 1.6;
                    resize: none;
                    outline: none;
                    min-height: 0;
                }

                .cm-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .cm-divider {
                    width: 40px;
                    background: var(--bg-surface);
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .cm-divider-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-disabled);
                    font-size: 14px;
                }

                .cm-unified {
                    flex: 1;
                    overflow: auto;
                    padding: 16px;
                    min-height: 0;
                }

                .cm-error,
                .cm-same {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 16px;
                    border-radius: var(--radius-lg);
                    font-size: 13px;
                    font-weight: 500;
                }

                .cm-error {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 0.5px solid #fecaca;
                }

                .cm-same {
                    background: #f0fdf4;
                    color: #16a34a;
                    border: 0.5px solid #bbf7d0;
                }

                @media (prefers-color-scheme: dark) {
                    .cm-error {
                        background: #1f1517;
                        color: #f87171;
                        border-color: #7f1d1d;
                    }
                    .cm-same {
                        background: #052e16;
                        color: #4ade80;
                        border-color: #166534;
                    }
                }

                .cm-error i,
                .cm-same i {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .cm-diff-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .cm-diff-item {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 12px;
                    display: flex;
                    gap: 12px;
                }

                .cm-diff-item--added {
                    border-left: 3px solid #16a34a;
                }

                .cm-diff-item--removed {
                    border-left: 3px solid #dc2626;
                }

                .cm-diff-item--modified {
                    border-left: 3px solid #d97706;
                }

                .cm-diff-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .cm-diff-item--added .cm-diff-icon {
                    background: #dcfce7;
                    color: #16a34a;
                }

                .cm-diff-item--removed .cm-diff-icon {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .cm-diff-item--modified .cm-diff-icon {
                    background: #fef3c7;
                    color: #d97706;
                }

                @media (prefers-color-scheme: dark) {
                    .cm-diff-item--added .cm-diff-icon {
                        background: #14532d;
                        color: #86efac;
                    }
                    .cm-diff-item--removed .cm-diff-icon {
                        background: #1f1517;
                        color: #f87171;
                    }
                    .cm-diff-item--modified .cm-diff-icon {
                        background: #451a03;
                        color: #fbbf24;
                    }
                }

                .cm-diff-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    min-width: 0;
                }

                .cm-diff-path {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .cm-diff-values {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .cm-diff-value {
                    display: flex;
                    gap: 8px;
                    font-size: 12px;
                    font-family: var(--font-mono);
                    padding: 6px 10px;
                    border-radius: var(--radius-md);
                }

                .cm-diff-value--old {
                    background: #fef2f2;
                    color: #991b1b;
                }

                .cm-diff-value--new {
                    background: #f0fdf4;
                    color: #166534;
                }

                @media (prefers-color-scheme: dark) {
                    .cm-diff-value--old {
                        background: #1f1517;
                        color: #fca5a5;
                    }
                    .cm-diff-value--new {
                        background: #052e16;
                        color: #86efac;
                    }
                }

                .cm-diff-label {
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .cm-diff-value code {
                    background: none;
                    border: none;
                    padding: 0;
                    font-size: inherit;
                    color: inherit;
                }

                .cm-empty {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 60px 24px;
                    text-align: center;
                    background: var(--bg-surface);
                }

                .cm-empty-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: var(--text-disabled);
                }

                .cm-empty-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .cm-empty-desc {
                    font-size: 14px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .cm-body--split {
                        flex-direction: column;
                    }

                    .cm-divider {
                        width: 100%;
                        height: 40px;
                        border-left: none;
                        border-right: none;
                        border-top: 0.5px solid var(--border);
                        border-bottom: 0.5px solid var(--border);
                    }

                    .cm-unified {
                        padding: 12px;
                    }

                    .cm-view-btn span {
                        display: none;
                    }

                    .cm-view-btn {
                        min-width: 32px;
                        padding: 0 8px;
                        justify-content: center;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cm-view-btn,
                    .cm-copy-btn,
                    .cm-clear-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}