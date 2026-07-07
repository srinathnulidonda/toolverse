// features/dev/random-string-generator/PatternGenerator.tsx
"use client";

import { useState, useCallback } from "react";
import { generateFromPattern, generateUUID, PATTERN_TEMPLATES, type Pattern } from "./utils";

interface PatternGeneratorProps {
    onGenerate?: (value: string) => void;
}

export default function PatternGenerator({ onGenerate }: PatternGeneratorProps) {
    const [pattern, setPattern] = useState("XXXX-NNNN-XXXX");
    const [count, setCount] = useState(5);
    const [results, setResults] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(() => {
        const newResults = Array.from({ length: count }, () => {
            // Special handling for UUID
            if (pattern.toLowerCase() === "uuid") {
                return generateUUID();
            }
            return generateFromPattern(pattern);
        });
        setResults(newResults);
        
        if (onGenerate && newResults.length > 0) {
            onGenerate(newResults[0]);
        }
    }, [pattern, count, onGenerate]);

    const handleCopy = useCallback(async (value: string, index: number) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 1500);
        } catch {
            // Silent fail
        }
    }, []);

    const loadTemplate = useCallback((template: Pattern) => {
        setPattern(template.pattern);
        setResults([]);
    }, []);

    return (
        <>
            <div className="pg-root">
                {/*  Pattern Input  */}
                <div className="pg-config">
                    <div className="pg-config-section">
                        <label className="pg-label">
                            Pattern Template
                            <span className="pg-label-hint">Use placeholders to define structure</span>
                        </label>
                        <input
                            type="text"
                            className="pg-pattern-input"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="e.g., XXXX-NNNN-XXXX"
                        />
                    </div>

                    <div className="pg-config-section">
                        <label className="pg-label">Pattern Syntax</label>
                        <div className="pg-syntax-grid">
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">X</code>
                                <span className="pg-syntax-desc">Uppercase letter (A-Z)</span>
                            </div>
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">x</code>
                                <span className="pg-syntax-desc">Lowercase letter (a-z)</span>
                            </div>
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">N</code>
                                <span className="pg-syntax-desc">Number (0-9)</span>
                            </div>
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">A</code>
                                <span className="pg-syntax-desc">Alphanumeric (A-Z, 0-9)</span>
                            </div>
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">a</code>
                                <span className="pg-syntax-desc">Alphanumeric (a-z, 0-9)</span>
                            </div>
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">H</code>
                                <span className="pg-syntax-desc">Hexadecimal (0-F)</span>
                            </div>
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">*</code>
                                <span className="pg-syntax-desc">Any (A-Z, a-z, 0-9)</span>
                            </div>
                            <div className="pg-syntax-item">
                                <code className="pg-syntax-code">-</code>
                                <span className="pg-syntax-desc">Literal character</span>
                            </div>
                        </div>
                    </div>

                    <div className="pg-config-section">
                        <label className="pg-label">Template Presets</label>
                        <div className="pg-templates">
                            {PATTERN_TEMPLATES.map((template, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="pg-template-btn"
                                    onClick={() => loadTemplate(template)}
                                >
                                    <code className="pg-template-pattern">{template.pattern}</code>
                                    <span className="pg-template-desc">{template.description}</span>
                                </button>
                            ))}
                            <button
                                type="button"
                                className="pg-template-btn"
                                onClick={() => {
                                    setPattern("uuid");
                                    setResults([]);
                                }}
                            >
                                <code className="pg-template-pattern">UUID</code>
                                <span className="pg-template-desc">RFC 4122 UUID v4</span>
                            </button>
                        </div>
                    </div>

                    <div className="pg-controls">
                        <div className="pg-count-control">
                            <label className="pg-count-label">Generate</label>
                            <input
                                type="number"
                                className="pg-count-input"
                                value={count}
                                onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                min="1"
                                max="50"
                            />
                            <span className="pg-count-unit">strings</span>
                        </div>
                        <button type="button" className="pg-generate-btn" onClick={handleGenerate}>
                            <i className="ti ti-wand" />
                            Generate
                        </button>
                    </div>
                </div>

                {/*  Results  */}
                <div className="pg-results-panel">
                    {results.length === 0 ? (
                        <div className="pg-empty">
                            <div className="pg-empty-icon">
                                <i className="ti ti-template" />
                            </div>
                            <p className="pg-empty-title">Pattern-Based Generation</p>
                            <p className="pg-empty-desc">
                                Define a custom pattern using placeholders to generate structured strings like license keys, product codes, or identifiers.
                            </p>
                            <div className="pg-empty-example">
                                <span className="pg-empty-example-label">Example:</span>
                                <code>XXXX-NNNN-XXXX</code>
                                <span>→</span>
                                <code>ABCD-1234-EFGH</code>
                            </div>
                        </div>
                    ) : (
                        <div className="pg-results">
                            <div className="pg-results-header">
                                <div className="pg-results-title">
                                    <i className="ti ti-check" />
                                    Generated from pattern: <code>{pattern}</code>
                                </div>
                            </div>
                            <div className="pg-results-list">
                                {results.map((result, idx) => (
                                    <div key={idx} className="pg-result-card">
                                        <span className="pg-result-index">#{idx + 1}</span>
                                        <div className="pg-result-value">{result}</div>
                                        <button
                                            type="button"
                                            className={`pg-copy-btn${copiedIndex === idx ? " copied" : ""}`}
                                            onClick={() => handleCopy(result, idx)}
                                        >
                                            <i className={`ti ${copiedIndex === idx ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .pg-root {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 1px;
                    background: var(--border);
                    min-height: 600px;
                }

                /*  Config Panel  */
                .pg-config {
                    background: var(--bg-surface);
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    overflow-y: auto;
                }

                .pg-config-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .pg-label {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .pg-label-hint {
                    font-size: 11px;
                    font-weight: 400;
                    text-transform: none;
                    letter-spacing: 0;
                    color: var(--text-disabled);
                }

                .pg-pattern-input {
                    width: 100%;
                    height: 42px;
                    padding: 0 12px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .pg-pattern-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .pg-syntax-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .pg-syntax-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 6px;
                }

                .pg-syntax-code {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                    flex-shrink: 0;
                }

                .pg-syntax-desc {
                    font-size: 11px;
                    color: var(--text-secondary);
                    line-height: 1.4;
                }

                .pg-templates {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .pg-template-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                    padding: 10px 12px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.12s;
                    text-align: left;
                }

                .pg-template-btn:hover {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .pg-template-pattern {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .pg-template-desc {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .pg-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pg-count-control {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }

                .pg-count-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .pg-count-input {
                    width: 60px;
                    height: 32px;
                    padding: 0 8px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    text-align: center;
                }

                .pg-count-unit {
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .pg-generate-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    height: 36px;
                    padding: 0 16px;
                    border-radius: 8px;
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand);
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .pg-generate-btn:hover {
                    background: var(--brand-hover);
                }

                .pg-generate-btn i {
                    font-size: 15px;
                }

                /*  Results Panel  */
                .pg-results-panel {
                    background: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .pg-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 12px;
                    text-align: center;
                }

                .pg-empty-icon {
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

                .pg-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .pg-empty-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 440px;
                    line-height: 1.6;
                }

                .pg-empty-example {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 10px;
                    margin-top: 8px;
                }

                .pg-empty-example-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                }

                .pg-empty-example code {
                    font-size: 12px;
                    font-family: var(--font-mono);
                    color: var(--brand);
                    background: var(--brand-light);
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .pg-empty-example span:not(.pg-empty-example-label) {
                    color: var(--text-disabled);
                }

                .pg-results {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .pg-results-header {
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .pg-results-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .pg-results-title i {
                    font-size: 14px;
                    color: var(--brand);
                }

                .pg-results-title code {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--brand);
                    background: var(--brand-light);
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .pg-results-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .pg-result-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                }

                .pg-result-index {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                    min-width: 28px;
                }

                .pg-result-value {
                    flex: 1;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    word-break: break-all;
                }

                .pg-copy-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .pg-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .pg-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                @media (max-width: 900px) {
                    .pg-root {
                        grid-template-columns: 1fr;
                    }

                    .pg-config {
                        max-height: 400px;
                    }

                    .pg-syntax-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .pg-template-btn,
                    .pg-generate-btn,
                    .pg-copy-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}