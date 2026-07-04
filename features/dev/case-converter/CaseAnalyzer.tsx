// features/dev/case-converter/CaseAnalyzer.tsx
"use client";

import { useMemo } from "react";
import { analyzeText, detectCase, generateVariableNames, CASE_FORMATS } from "./utils";

interface CaseAnalyzerProps {
    input: string;
    onInputChange: (value: string) => void;
}

export default function CaseAnalyzer({ input, onInputChange }: CaseAnalyzerProps) {
    const analysis = useMemo(() => {
        if (!input.trim()) return null;
        return analyzeText(input);
    }, [input]);

    const variableNames = useMemo(() => {
        if (!input.trim()) return null;
        return generateVariableNames(input);
    }, [input]);

    const detectedCaseInfo = useMemo(() => {
        if (!analysis) return null;
        return CASE_FORMATS.find((f) => f.id === analysis.originalCase);
    }, [analysis]);

    return (
        <>
            <div className="ca-root">
                {/* ── Input Section ── */}
                <div className="ca-input-section">
                    <div className="ca-input-header">
                        <div className="ca-input-label">
                            <i className="ti ti-pencil" />
                            Text to Analyze
                        </div>
                        {input && (
                            <button
                                className="ca-clear-btn"
                                onClick={() => onInputChange("")}
                                title="Clear"
                            >
                                <i className="ti ti-x" />
                            </button>
                        )}
                    </div>
                    <textarea
                        className="ca-textarea"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Enter text to analyze its case format and structure..."
                        rows={3}
                        spellCheck={false}
                    />
                </div>

                {/* ── Analysis Results ── */}
                {analysis ? (
                    <div className="ca-content">
                        {/* Detection Card */}
                        <div className="ca-card">
                            <div className="ca-card-header">
                                <i className="ti ti-scan" />
                                <span>Detection Results</span>
                            </div>
                            <div className="ca-card-body">
                                <div className="ca-detection">
                                    <div className="ca-detection-main">
                                        <span className="ca-detection-label">Detected Format:</span>
                                        <div className="ca-detection-result">
                                            {detectedCaseInfo ? (
                                                <>
                                                    <i className={`ti ${detectedCaseInfo.icon}`} />
                                                    <span className="ca-detection-name">
                                                        {detectedCaseInfo.label}
                                                    </span>
                                                    <span className="ca-detection-desc">
                                                        {detectedCaseInfo.description}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-help-circle" />
                                                    <span className="ca-detection-name">
                                                        {analysis.originalCase === "mixed"
                                                            ? "Mixed Case"
                                                            : "Unknown Format"}
                                                    </span>
                                                    <span className="ca-detection-desc">
                                                        No standard case format detected
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                {analysis.suggestions.length > 0 && (
                                    <div className="ca-suggestions">
                                        <div className="ca-suggestions-header">
                                            <i className="ti ti-bulb" />
                                            Suggestions
                                        </div>
                                        <ul className="ca-suggestions-list">
                                            {analysis.suggestions.map((suggestion, idx) => (
                                                <li key={idx} className="ca-suggestion-item">
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="ca-card">
                            <div className="ca-card-header">
                                <i className="ti ti-chart-dots" />
                                <span>Statistics</span>
                            </div>
                            <div className="ca-card-body">
                                <div className="ca-stats-grid">
                                    <div className="ca-stat">
                                        <div className="ca-stat-icon">
                                            <i className="ti ti-text-size" />
                                        </div>
                                        <div className="ca-stat-content">
                                            <span className="ca-stat-value">
                                                {analysis.characterCount}
                                            </span>
                                            <span className="ca-stat-label">Characters</span>
                                        </div>
                                    </div>

                                    <div className="ca-stat">
                                        <div className="ca-stat-icon">
                                            <i className="ti ti-vocabulary" />
                                        </div>
                                        <div className="ca-stat-content">
                                            <span className="ca-stat-value">{analysis.wordCount}</span>
                                            <span className="ca-stat-label">Words</span>
                                        </div>
                                    </div>

                                    <div className="ca-stat">
                                        <div className="ca-stat-icon">
                                            <i className="ti ti-123" />
                                        </div>
                                        <div className="ca-stat-content">
                                            <span className="ca-stat-value">
                                                {analysis.hasNumbers ? "Yes" : "No"}
                                            </span>
                                            <span className="ca-stat-label">Has Numbers</span>
                                        </div>
                                    </div>

                                    <div className="ca-stat">
                                        <div className="ca-stat-icon">
                                            <i className="ti ti-asterisk" />
                                        </div>
                                        <div className="ca-stat-content">
                                            <span className="ca-stat-value">
                                                {analysis.hasSpecialChars ? "Yes" : "No"}
                                            </span>
                                            <span className="ca-stat-label">Special Chars</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Word Breakdown */}
                                {analysis.words.length > 0 && (
                                    <div className="ca-words">
                                        <div className="ca-words-header">
                                            <i className="ti ti-list" />
                                            Word Breakdown
                                        </div>
                                        <div className="ca-words-list">
                                            {analysis.words.map((word, idx) => (
                                                <span key={idx} className="ca-word-tag">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variable Name Suggestions */}
                        {variableNames && (
                            <div className="ca-card">
                                <div className="ca-card-header">
                                    <i className="ti ti-code" />
                                    <span>Variable Name Suggestions</span>
                                </div>
                                <div className="ca-card-body">
                                    <div className="ca-variables">
                                        {Object.entries(variableNames).map(([context, name]) => (
                                            <div key={context} className="ca-variable">
                                                <div className="ca-variable-context">{context}</div>
                                                <code className="ca-variable-value">{name}</code>
                                                <button
                                                    type="button"
                                                    className="ca-variable-copy"
                                                    onClick={() => navigator.clipboard.writeText(name)}
                                                    title="Copy"
                                                >
                                                    <i className="ti ti-copy" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="ca-empty">
                        <div className="ca-empty-icon">
                            <i className="ti ti-chart-dots" />
                        </div>
                        <p className="ca-empty-title">Analyze Text Case</p>
                        <p className="ca-empty-desc">
                            Enter text above to detect its case format, view statistics, and get variable
                            name suggestions for different programming contexts.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .ca-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /* ── Input Section ── */
                .ca-input-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    overflow: hidden;
                }

                .ca-input-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .ca-input-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ca-input-label i {
                    font-size: 12px;
                }

                .ca-clear-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .ca-clear-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .ca-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.7;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: vertical;
                    min-height: 80px;
                }

                .ca-textarea::placeholder {
                    color: var(--text-disabled);
                    font-family: var(--font-sans);
                }

                /* ── Content ── */
                .ca-content {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .ca-card {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    overflow: hidden;
                }

                .ca-card-header {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ca-card-header i {
                    font-size: 12px;
                }

                .ca-card-body {
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                /* ── Detection ── */
                .ca-detection {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .ca-detection-main {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .ca-detection-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .ca-detection-result {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    border-radius: var(--cc-radius-md);
                }

                .ca-detection-result i {
                    font-size: 20px;
                    color: var(--brand);
                    flex-shrink: 0;
                }

                .ca-detection-result > span {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .ca-detection-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--brand-text);
                    font-family: var(--font-mono);
                }

                .ca-detection-desc {
                    font-size: 11px;
                    color: var(--brand-text);
                    opacity: 0.8;
                }

                /* ── Suggestions ── */
                .ca-suggestions {
                    padding: 12px;
                    background: #EFF6FF;
                    border: 0.5px solid #BFDBFE;
                    border-radius: var(--cc-radius-md);
                }

                @media (prefers-color-scheme: dark) {
                    .ca-suggestions {
                        background: #0A1628;
                        border-color: #1E3A5F;
                    }
                }

                .ca-suggestions-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #1D4ED8;
                    margin-bottom: 8px;
                }

                @media (prefers-color-scheme: dark) {
                    .ca-suggestions-header {
                        color: #93C5FD;
                    }
                }

                .ca-suggestions-header i {
                    font-size: 13px;
                }

                .ca-suggestions-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .ca-suggestion-item {
                    font-size: 12px;
                    color: #1D4ED8;
                    line-height: 1.6;
                    padding-left: 14px;
                    position: relative;
                }

                @media (prefers-color-scheme: dark) {
                    .ca-suggestion-item {
                        color: #93C5FD;
                    }
                }

                .ca-suggestion-item::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                }

                /* ── Statistics ── */
                .ca-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 12px;
                }

                .ca-stat {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-md);
                }

                .ca-stat-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: var(--cc-radius-md);
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .ca-stat-icon i {
                    font-size: 16px;
                    color: var(--brand);
                }

                .ca-stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .ca-stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                    line-height: 1;
                }

                .ca-stat-label {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                /* ── Words ── */
                .ca-words {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-top: 6px;
                    border-top: 0.5px solid var(--border-faint);
                }

                .ca-words-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .ca-words-header i {
                    font-size: 12px;
                }

                .ca-words-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .ca-word-tag {
                    display: inline-flex;
                    align-items: center;
                    height: 24px;
                    padding: 0 10px;
                    border-radius: 99px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    color: var(--text);
                    font-size: 11px;
                    font-weight: 500;
                    font-family: var(--font-mono);
                }

                /* ── Variables ── */
                .ca-variables {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .ca-variable {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-md);
                    transition: border-color 0.12s;
                }

                .ca-variable:hover {
                    border-color: var(--brand-border);
                }

                .ca-variable-context {
                    flex-shrink: 0;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    min-width: 140px;
                }

                .ca-variable-value {
                    flex: 1;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    background: var(--bg-card);
                    padding: 6px 10px;
                    border-radius: 5px;
                    border: 0.5px solid var(--border-faint);
                }

                .ca-variable-copy {
                    width: 28px;
                    height: 28px;
                    border-radius: 5px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .ca-variable-copy i {
                    font-size: 12px;
                }

                .ca-variable-copy:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* ── Empty State ── */
                .ca-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .ca-empty-icon {
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

                .ca-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .ca-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 380px;
                    line-height: 1.6;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .ca-root {
                        padding: 12px;
                    }

                    .ca-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .ca-variable {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .ca-variable-context {
                        min-width: unset;
                    }

                    .ca-variable-value {
                        width: 100%;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ca-clear-btn,
                    .ca-variable,
                    .ca-variable-copy {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}