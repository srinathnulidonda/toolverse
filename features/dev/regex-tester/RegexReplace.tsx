// features/dev/regex-tester/RegexReplace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { performReplace, type RegexFlags } from "./utils";

interface RegexReplaceProps {
    pattern: string;
    flags: RegexFlags;
}

export default function RegexReplace({ pattern, flags }: RegexReplaceProps) {
    const [testString, setTestString] = useState("");
    const [replacement, setReplacement] = useState("");
    const [replaceMode, setReplaceMode] = useState<"standard" | "function">("standard");
    const [showDiff, setShowDiff] = useState(true);
    const [copiedKey, setCopiedKey] = useState("");

    const result = useMemo(() => {
        if (!pattern || !testString) {
            return null;
        }
        return performReplace(pattern, flags, testString, replacement);
    }, [pattern, flags, testString, replacement]);

    const diff = useMemo(() => {
        if (!result || result.original === result.replaced) return null;

        const originalLines = result.original.split("\n");
        const replacedLines = result.replaced.split("\n");
        const maxLines = Math.max(originalLines.length, replacedLines.length);

        const diffLines: Array<{
            original: string;
            replaced: string;
            changed: boolean;
            lineNum: number;
        }> = [];

        for (let i = 0; i < maxLines; i++) {
            const orig = originalLines[i] ?? "";
            const repl = replacedLines[i] ?? "";
            diffLines.push({
                original: orig,
                replaced: repl,
                changed: orig !== repl,
                lineNum: i + 1,
            });
        }

        return diffLines;
    }, [result]);

    const handleCopy = useCallback(async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(""), 1500);
        } catch {
            // Silent fail
        }
    }, []);

    const substitutionVars = [
        { var: "$&", desc: "The matched substring" },
        { var: "$`", desc: "String before the match" },
        { var: "$'", desc: "String after the match" },
        { var: "$n", desc: "nth capture group (e.g., $1, $2)" },
        { var: "$<name>", desc: "Named capture group" },
        { var: "$$", desc: "Literal $ character" },
    ];

    return (
        <>
            <div className="rxr-root">
                {/* Input Section */}
                <div className="rxr-section">
                    <div className="rxr-section-header">
                        <div className="rxr-section-title">
                            <i className="ti ti-file-text" />
                            Input Text
                        </div>
                        <div className="rxr-section-actions">
                            {testString && (
                                <>
                                    <span className="rxr-meta-text">
                                        {testString.length} chars · {testString.split("\n").length} lines
                                    </span>
                                    <button
                                        type="button"
                                        className="rxr-icon-btn"
                                        onClick={() => setTestString("")}
                                        title="Clear"
                                    >
                                        <i className="ti ti-x" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <textarea
                        className="rxr-textarea"
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        placeholder="Enter text to perform find and replace..."
                        spellCheck={false}
                        rows={8}
                    />
                </div>

                {/* Replacement Section */}
                <div className="rxr-section">
                    <div className="rxr-section-header">
                        <div className="rxr-section-title">
                            <i className="ti ti-replace" />
                            Replacement
                        </div>
                        <div className="rxr-section-actions">
                            <div className="rxr-mode-group">
                                <button
                                    type="button"
                                    className={`rxr-mode-btn${replaceMode === "standard" ? " active" : ""}`}
                                    onClick={() => setReplaceMode("standard")}
                                >
                                    Text
                                </button>
                                <button
                                    type="button"
                                    className={`rxr-mode-btn${replaceMode === "function" ? " active" : ""}`}
                                    onClick={() => setReplaceMode("function")}
                                    title="Advanced: Use function"
                                >
                                    Function
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rxr-replace-input-wrap">
                        <textarea
                            className="rxr-textarea rxr-replace-input"
                            value={replacement}
                            onChange={(e) => setReplacement(e.target.value)}
                            placeholder={
                                replaceMode === "standard"
                                    ? "Enter replacement text (use $1, $2 for groups)..."
                                    : "Enter replacement function (advanced)..."
                            }
                            spellCheck={false}
                            rows={3}
                        />

                        {replaceMode === "standard" && (
                            <div className="rxr-substitution-help">
                                <div className="rxr-help-title">
                                    <i className="ti ti-help-circle" />
                                    Substitution Variables
                                </div>
                                <div className="rxr-vars-grid">
                                    {substitutionVars.map((v) => (
                                        <button
                                            key={v.var}
                                            type="button"
                                            className="rxr-var-chip"
                                            onClick={() => setReplacement((prev) => prev + v.var)}
                                            title={v.desc}
                                        >
                                            <code>{v.var}</code>
                                            <span>{v.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Stats */}
                {result && (
                    <div className="rxr-stats-bar">
                        <div className="rxr-stats-items">
                            <div className="rxr-stat">
                                <i className="ti ti-replace" />
                                <span>
                                    <strong>{result.replacementCount}</strong> replacement
                                    {result.replacementCount !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="rxr-stat">
                                <i className="ti ti-text-size" />
                                <span>
                                    {result.original.length} → {result.replaced.length} chars
                                </span>
                            </div>
                            {result.original !== result.replaced && (
                                <div className="rxr-stat rxr-stat-change">
                                    <i className={`ti ${result.replaced.length > result.original.length ? "ti-arrow-up" : "ti-arrow-down"}`} />
                                    <span>
                                        {Math.abs(result.replaced.length - result.original.length)} chars
                                    </span>
                                </div>
                            )}
                        </div>

                        <label className="rxr-toggle-label">
                            <input
                                type="checkbox"
                                checked={showDiff}
                                onChange={(e) => setShowDiff(e.target.checked)}
                            />
                            <span>Show diff</span>
                        </label>
                    </div>
                )}

                {/* Result Output */}
                {result && (
                    <div className="rxr-section">
                        <div className="rxr-section-header">
                            <div className="rxr-section-title">
                                <i className="ti ti-check" />
                                Result
                                {result.replacementCount > 0 && (
                                    <span className="rxr-count-badge">{result.replacementCount}</span>
                                )}
                            </div>
                            <div className="rxr-section-actions">
                                <button
                                    type="button"
                                    className={`rxr-copy-btn${copiedKey === "result" ? " copied" : ""}`}
                                    onClick={() => handleCopy(result.replaced, "result")}
                                    disabled={!result.replaced}
                                >
                                    <i className={`ti ${copiedKey === "result" ? "ti-check" : "ti-copy"}`} />
                                    {copiedKey === "result" ? "Copied" : "Copy Result"}
                                </button>
                            </div>
                        </div>

                        {showDiff && diff ? (
                            <div className="rxr-diff-view">
                                <div className="rxr-diff-header">
                                    <div className="rxr-diff-col">
                                        <span className="rxr-diff-label removed">Original</span>
                                    </div>
                                    <div className="rxr-diff-col">
                                        <span className="rxr-diff-label added">Replaced</span>
                                    </div>
                                </div>
                                <div className="rxr-diff-lines">
                                    {diff.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className={`rxr-diff-row${line.changed ? " changed" : ""}`}
                                        >
                                            <div className="rxr-diff-col">
                                                <span className="rxr-line-num">{line.lineNum}</span>
                                                <span className="rxr-line-text">
                                                    {line.original || <span className="rxr-empty-line">(empty)</span>}
                                                </span>
                                            </div>
                                            <div className="rxr-diff-col">
                                                <span className="rxr-line-num">{line.lineNum}</span>
                                                <span className="rxr-line-text">
                                                    {line.replaced || <span className="rxr-empty-line">(empty)</span>}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rxr-result-output">
                                <pre className="rxr-output-text">{result.replaced}</pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!pattern && (
                    <div className="rxr-empty">
                        <div className="rxr-empty-icon">
                            <i className="ti ti-replace" />
                        </div>
                        <p className="rxr-empty-title">Find and Replace with Regex</p>
                        <p className="rxr-empty-desc">
                            Enter a regex pattern above to start finding and replacing text
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .rxr-root {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                .rxr-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .rxr-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .rxr-section-title {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .rxr-section-title i {
                    font-size: 14px;
                }

                .rxr-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .rxr-meta-text {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .rxr-icon-btn {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxr-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxr-mode-group {
                    display: flex;
                    gap: 2px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: 2px;
                }

                .rxr-mode-btn {
                    height: 26px;
                    padding: 0 10px;
                    border: none;
                    border-radius: calc(var(--radius-md) - 2px);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxr-mode-btn:hover {
                    color: var(--text);
                }

                .rxr-mode-btn.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                }

                .rxr-textarea {
                    width: 100%;
                    padding: 14px 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.7;
                    color: var(--text);
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .rxr-textarea:focus {
                    outline: none;
                    border-color: var(--brand);
                    box-shadow: 0 0 0 3px var(--brand-light);
                }

                .rxr-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .rxr-replace-input-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .rxr-replace-input {
                    margin: 0;
                }

                .rxr-substitution-help {
                    padding: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .rxr-help-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .rxr-help-title i {
                    font-size: 13px;
                }

                .rxr-vars-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 8px;
                }

                .rxr-var-chip {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 3px;
                    padding: 8px 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.12s;
                    text-align: left;
                }

                .rxr-var-chip:hover {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .rxr-var-chip code {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--brand);
                }

                .rxr-var-chip span {
                    font-size: 10.5px;
                    color: var(--text-tertiary);
                    line-height: 1.4;
                }

                .rxr-stats-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    flex-wrap: wrap;
                }

                .rxr-stats-items {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .rxr-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .rxr-stat i {
                    font-size: 14px;
                    color: var(--text-tertiary);
                }

                .rxr-stat strong {
                    color: var(--text);
                    font-weight: 700;
                }

                .rxr-stat-change {
                    color: var(--brand);
                }

                .rxr-stat-change i {
                    color: var(--brand);
                }

                .rxr-toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    user-select: none;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .rxr-toggle-label input {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: var(--brand);
                }

                .rxr-count-badge {
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
                    font-weight: 700;
                    border: 0.5px solid var(--brand-border);
                }

                .rxr-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 12px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxr-copy-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxr-copy-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .rxr-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .rxr-diff-view {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .rxr-diff-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .rxr-diff-col {
                    padding: 10px 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .rxr-diff-col:first-child {
                    border-right: 0.5px solid var(--border);
                }

                .rxr-diff-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    padding: 3px 8px;
                    border-radius: 4px;
                }

                .rxr-diff-label.removed {
                    background: #FEE2E2;
                    color: #991B1B;
                }

                .rxr-diff-label.added {
                    background: #D1FAE5;
                    color: #065F46;
                }

                @media (prefers-color-scheme: dark) {
                    .rxr-diff-label.removed {
                        background: #1C0A0A;
                        color: #F87171;
                    }
                    .rxr-diff-label.added {
                        background: #022C22;
                        color: #6EE7B7;
                    }
                }

                .rxr-diff-lines {
                    max-height: 500px;
                    overflow-y: auto;
                }

                .rxr-diff-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border-bottom: 0.5px solid var(--border-faint);
                }

                .rxr-diff-row.changed {
                    background: var(--brand-light);
                }

                .rxr-diff-row:last-child {
                    border-bottom: none;
                }

                .rxr-diff-row .rxr-diff-col {
                    padding: 8px 14px;
                }

                .rxr-line-num {
                    width: 40px;
                    flex-shrink: 0;
                    font-size: 11px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                    text-align: right;
                    user-select: none;
                }

                .rxr-line-text {
                    flex: 1;
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    color: var(--text);
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .rxr-empty-line {
                    color: var(--text-disabled);
                    font-style: italic;
                }

                .rxr-result-output {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .rxr-output-text {
                    margin: 0;
                    padding: 16px 18px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.7;
                    color: var(--text);
                    white-space: pre-wrap;
                    word-break: break-word;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .rxr-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .rxr-empty-icon {
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

                .rxr-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .rxr-empty-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 360px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .rxr-root {
                        padding: 12px;
                    }

                    .rxr-vars-grid {
                        grid-template-columns: 1fr;
                    }

                    .rxr-diff-header,
                    .rxr-diff-row {
                        grid-template-columns: 1fr;
                    }

                    .rxr-diff-row .rxr-diff-col:first-child {
                        border-right: none;
                        border-bottom: 0.5px solid var(--border-faint);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .rxr-icon-btn,
                    .rxr-mode-btn,
                    .rxr-var-chip,
                    .rxr-copy-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}