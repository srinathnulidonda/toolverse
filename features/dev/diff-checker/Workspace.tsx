// features/dev/diff-checker/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";

type ViewMode = "split" | "unified";

interface DiffLine {
    type: "add" | "remove" | "unchanged";
    content: string;
    lineNum: number;
}

function computeDiff(text1: string, text2: string): { lines: DiffLine[]; stats: { added: number; removed: number; unchanged: number } } {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");

    const lines: DiffLine[] = [];
    let added = 0;
    let removed = 0;
    let unchanged = 0;

    const maxLen = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLen; i++) {
        const line1 = lines1[i];
        const line2 = lines2[i];

        if (line1 === line2) {
            if (line1 !== undefined) {
                lines.push({ type: "unchanged", content: line1, lineNum: i + 1 });
                unchanged++;
            }
        } else {
            if (line1 !== undefined) {
                lines.push({ type: "remove", content: line1, lineNum: i + 1 });
                removed++;
            }
            if (line2 !== undefined) {
                lines.push({ type: "add", content: line2, lineNum: i + 1 });
                added++;
            }
        }
    }

    return { lines, stats: { added, removed, unchanged } };
}

const SAMPLE_1 = `function hello() {
  console.log("Hello");
  return true;
}`;

const SAMPLE_2 = `function hello(name) {
  console.log("Hello, " + name);
  return name !== "";
}`;

export default function DiffCheckerWorkspace({ tool }: { tool: Tool }) {
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("split");
    const [copiedKey, setCopiedKey] = useState("");

    const diff = useMemo(() => {
        if (!text1 && !text2) return null;
        return computeDiff(text1, text2);
    }, [text1, text2]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadSample = () => {
        setText1(SAMPLE_1);
        setText2(SAMPLE_2);
    };

    const swapTexts = () => {
        const temp = text1;
        setText1(text2);
        setText2(temp);
    };

    return (
        <>
            <div className="diff-root">
                {/* Command Bar */}
                <div className="diff-cmd">
                    <div className="diff-cmd-left">
                        <button className="diff-preset-btn" onClick={loadSample}>
                            <i className="ti ti-file-diff" />
                            <span className="diff-preset-label">Load Sample</span>
                        </button>
                        <button className="diff-preset-btn" onClick={swapTexts} disabled={!text1 && !text2}>
                            <i className="ti ti-arrows-exchange" />
                            <span className="diff-preset-label">Swap</span>
                        </button>
                    </div>
                    <div className="diff-cmd-right">
                        <div className="diff-view-toggle">
                            <button
                                className={`diff-view-btn${viewMode === "split" ? " --on" : ""}`}
                                onClick={() => setViewMode("split")}
                            >
                                <i className="ti ti-layout-columns" />
                                <span>Split</span>
                            </button>
                            <button
                                className={`diff-view-btn${viewMode === "unified" ? " --on" : ""}`}
                                onClick={() => setViewMode("unified")}
                            >
                                <i className="ti ti-layout-list" />
                                <span>Unified</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                {diff && (
                    <div className="diff-stats-bar">
                        <div className="diff-stat-item diff-stat-item--add">
                            <i className="ti ti-plus" />
                            {diff.stats.added} added
                        </div>
                        <div className="diff-stat-item diff-stat-item--remove">
                            <i className="ti ti-minus" />
                            {diff.stats.removed} removed
                        </div>
                        <div className="diff-stat-item">
                            <i className="ti ti-equal" />
                            {diff.stats.unchanged} unchanged
                        </div>
                    </div>
                )}

                <div className="diff-body">
                    {viewMode === "split" ? (
                        <div className="diff-split">
                            {/* Original */}
                            <div className="diff-panel">
                                <div className="diff-panel-header">
                                    <div className="diff-panel-title">
                                        <i className="ti ti-file" />
                                        Original
                                    </div>
                                    {text1 && (
                                        <button className="diff-icon-btn" onClick={() => setText1("")} title="Clear">
                                            <i className="ti ti-x" />
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    className="diff-input"
                                    value={text1}
                                    onChange={(e) => setText1(e.target.value)}
                                    placeholder="Paste original text here..."
                                    spellCheck={false}
                                />
                            </div>

                            {/* Divider */}
                            <div className="diff-divider">
                                <div className="diff-divider-line" />
                                <button className="diff-swap-btn" onClick={swapTexts} title="Swap texts">
                                    <i className="ti ti-arrows-exchange" />
                                </button>
                                <div className="diff-divider-line" />
                            </div>

                            {/* Modified */}
                            <div className="diff-panel">
                                <div className="diff-panel-header">
                                    <div className="diff-panel-title">
                                        <i className="ti ti-file-diff" />
                                        Modified
                                    </div>
                                    {text2 && (
                                        <button className="diff-icon-btn" onClick={() => setText2("")} title="Clear">
                                            <i className="ti ti-x" />
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    className="diff-input"
                                    value={text2}
                                    onChange={(e) => setText2(e.target.value)}
                                    placeholder="Paste modified text here..."
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="diff-unified-wrap">
                            <div className="diff-unified">
                                {diff?.lines.map((line, idx) => (
                                    <div key={idx} className={`diff-line diff-line--${line.type}`}>
                                        <span className="diff-line-num">{line.lineNum}</span>
                                        <span className="diff-line-indicator">
                                            {line.type === "add" && "+"}
                                            {line.type === "remove" && "-"}
                                            {line.type === "unchanged" && " "}
                                        </span>
                                        <span className="diff-line-content">{line.content || " "}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!text1 && !text2 && (
                        <div className="diff-empty">
                            <div className="diff-empty-icon">
                                <i className="ti ti-git-compare" />
                            </div>
                            <p className="diff-empty-title">Compare Text Differences</p>
                            <p className="diff-empty-desc">
                                Enter text in both panels to see a side-by-side or unified diff view
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="diff-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .diff-root {
                    --diff-radius-sm: 6px;
                    --diff-radius-md: 8px;
                    --diff-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--diff-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .diff-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .diff-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .diff-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .diff-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--diff-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .diff-preset-btn:hover:not(:disabled) {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .diff-preset-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .diff-preset-btn i {
                    font-size: 13px;
                }

                .diff-view-toggle {
                    display: inline-flex;
                    gap: 2px;
                    padding: 2px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--diff-radius-md);
                }

                .diff-view-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 10px;
                    border: none;
                    border-radius: 5px;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .diff-view-btn:hover {
                    background: var(--bg-surface);
                }

                .diff-view-btn.--on {
                    background: var(--brand-light);
                    color: var(--brand);
                }

                .diff-view-btn i {
                    font-size: 13px;
                }

                .diff-stats-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .diff-stat-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .diff-stat-item i {
                    font-size: 13px;
                }

                .diff-stat-item--add {
                    color: #059669;
                }

                .diff-stat-item--remove {
                    color: #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .diff-stat-item--add {
                        color: #34d399;
                    }
                    .diff-stat-item--remove {
                        color: #f87171;
                    }
                }

                .diff-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 400px;
                }

                .diff-split {
                    display: grid;
                    grid-template-columns: 1fr 44px 1fr;
                    flex: 1;
                }

                .diff-panel {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .diff-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .diff-panel-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .diff-panel-title i {
                    font-size: 14px;
                }

                .diff-icon-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.1s;
                }

                .diff-icon-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .diff-input {
                    flex: 1;
                    width: 100%;
                    padding: 16px;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.75;
                    color: var(--text);
                    resize: none;
                }

                .diff-input::placeholder {
                    color: var(--text-disabled);
                }

                .diff-divider {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: var(--bg-surface);
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                    padding: 16px 0;
                }

                .diff-divider-line {
                    flex: 1;
                    width: 0.5px;
                    background: var(--border);
                }

                .diff-swap-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    margin: 8px 0;
                    transition: all 0.15s;
                }

                .diff-swap-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                    transform: rotate(90deg);
                }

                .diff-unified-wrap {
                    flex: 1;
                    overflow: auto;
                }

                .diff-unified {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    line-height: 1.6;
                }

                .diff-line {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 4px 12px;
                }

                .diff-line--add {
                    background: rgba(5, 150, 105, 0.08);
                    border-left: 2px solid #059669;
                }

                .diff-line--remove {
                    background: rgba(220, 38, 38, 0.08);
                    border-left: 2px solid #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .diff-line--add {
                        background: rgba(52, 211, 153, 0.1);
                        border-left-color: #34d399;
                    }
                    .diff-line--remove {
                        background: rgba(248, 113, 113, 0.1);
                        border-left-color: #f87171;
                    }
                }

                .diff-line-num {
                    width: 40px;
                    flex-shrink: 0;
                    color: var(--text-disabled);
                    font-size: 11px;
                    text-align: right;
                    user-select: none;
                }

                .diff-line-indicator {
                    width: 16px;
                    flex-shrink: 0;
                    font-weight: 700;
                    text-align: center;
                }

                .diff-line--add .diff-line-indicator {
                    color: #059669;
                }

                .diff-line--remove .diff-line-indicator {
                    color: #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .diff-line--add .diff-line-indicator {
                        color: #34d399;
                    }
                    .diff-line--remove .diff-line-indicator {
                        color: #f87171;
                    }
                }

                .diff-line-content {
                    flex: 1;
                    color: var(--text);
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .diff-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .diff-empty-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: var(--text-disabled);
                    margin-bottom: 6px;
                }

                .diff-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .diff-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                }

                .diff-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .diff-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .diff-cmd {
                        padding: 10px 12px;
                    }

                    .diff-preset-label {
                        display: none;
                    }

                    .diff-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .diff-split {
                        grid-template-columns: 1fr;
                    }

                    .diff-divider {
                        display: none;
                    }

                    .diff-stats-bar {
                        padding: 10px 12px;
                        gap: 12px;
                    }

                    .diff-view-btn span {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}