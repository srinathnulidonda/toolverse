// features/dev/case-converter/CasePreview.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { convertCase, CASE_FORMATS, type CaseType, type ConversionOptions } from "./utils";

interface CasePreviewProps {
    input: string;
    onInputChange: (value: string) => void;
    selectedCases: CaseType[];
    preserveNumbers: boolean;
    preserveAcronyms: boolean;
    onConvert?: (text: string, caseType: CaseType, result: string) => void;
}

export default function CasePreview({
    input,
    onInputChange,
    selectedCases,
    preserveNumbers,
    preserveAcronyms,
    onConvert,
}: CasePreviewProps) {
    const [copiedKey, setCopiedKey] = useState("");

    const options: ConversionOptions = {
        preserveNumbers,
        preserveAcronyms,
    };

    const results = useMemo(() => {
        if (!input.trim()) return [];

        return CASE_FORMATS.filter((format) => selectedCases.includes(format.id)).map((format) => ({
            ...format,
            converted: convertCase(input, format.id, options),
        }));
    }, [input, selectedCases, preserveNumbers, preserveAcronyms]);

    const handleCopy = useCallback(
        async (text: string, key: string, caseType: CaseType) => {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(""), 1800);

            if (onConvert) {
                onConvert(input, caseType, text);
            }
        },
        [input, onConvert]
    );

    return (
        <>
            <div className="cp-root">
                {/* ── Input Section ── */}
                <div className="cp-input-section">
                    <div className="cp-input-header">
                        <div className="cp-input-label">
                            <i className="ti ti-pencil" />
                            Input Text
                        </div>
                        {input && (
                            <button
                                className="cp-clear-btn"
                                onClick={() => onInputChange("")}
                                title="Clear"
                            >
                                <i className="ti ti-x" />
                            </button>
                        )}
                    </div>
                    <textarea
                        className="cp-textarea"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Enter text to convert case..."
                        rows={3}
                        spellCheck={false}
                    />
                </div>

                {/* ── Results Section ── */}
                {results.length === 0 && !input ? (
                    <div className="cp-empty">
                        <div className="cp-empty-icon">
                            <i className="ti ti-letter-case" />
                        </div>
                        <p className="cp-empty-title">Convert Text Case</p>
                        <p className="cp-empty-desc">
                            Convert text between camelCase, snake_case, kebab-case, and more. Enter text above to get started.
                        </p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="cp-results-section">
                        <div className="cp-results-header">
                            <div className="cp-results-label">
                                <i className="ti ti-sparkles" />
                                Converted Cases
                                <span className="cp-results-count">{results.length}</span>
                            </div>
                        </div>
                        <div className="cp-results">
                            {results.map((result) => (
                                <div key={result.id} className="cp-result-card">
                                    <div className="cp-result-header">
                                        <div className="cp-result-info">
                                            <i className={`ti ${result.icon}`} />
                                            <div className="cp-result-text">
                                                <span className="cp-result-label">{result.label}</span>
                                                <span className="cp-result-desc">{result.description}</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`cp-copy-btn${copiedKey === result.id ? " copied" : ""}`}
                                            onClick={() => handleCopy(result.converted, result.id, result.id)}
                                        >
                                            <i className={`ti ${copiedKey === result.id ? "ti-check" : "ti-copy"}`} />
                                            {copiedKey === result.id ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                    <div className="cp-result-value">{result.converted}</div>
                                    <div className="cp-result-example">Example: {result.example}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            <style jsx>{`
                .cp-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /* ── Input Section ── */
                .cp-input-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    overflow: hidden;
                }

                .cp-input-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .cp-input-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cp-input-label i {
                    font-size: 12px;
                }

                .cp-clear-btn {
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

                .cp-clear-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cp-textarea {
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

                .cp-textarea::placeholder {
                    color: var(--text-disabled);
                    font-family: var(--font-sans);
                }

                /* ── Results Section ── */
                .cp-results-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    min-height: 0;
                }

                .cp-results-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .cp-results-label {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cp-results-label i {
                    font-size: 12px;
                    color: var(--brand);
                }

                .cp-results-count {
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

                .cp-results {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    overflow: auto;
                }

                .cp-result-card {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    transition: border-color 0.12s;
                }

                .cp-result-card:hover {
                    border-color: var(--brand-border);
                }

                .cp-result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }

                .cp-result-info {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    flex: 1;
                    min-width: 0;
                }

                .cp-result-info > i {
                    font-size: 18px;
                    color: var(--brand);
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .cp-result-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .cp-result-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .cp-result-desc {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    line-height: 1.5;
                }

                .cp-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .cp-copy-btn i {
                    font-size: 12px;
                }

                .cp-copy-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cp-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .cp-result-value {
                    font-family: var(--font-mono);
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border-radius: var(--cc-radius-md);
                    word-break: break-all;
                }

                .cp-result-example {
                    font-size: 11px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                /* ── Empty State ── */
                .cp-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .cp-empty-icon {
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

                .cp-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .cp-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                    line-height: 1.6;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .cp-root {
                        padding: 12px;
                    }

                    .cp-result-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .cp-copy-btn {
                        align-self: flex-end;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cp-clear-btn,
                    .cp-copy-btn,
                    .cp-result-card {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}