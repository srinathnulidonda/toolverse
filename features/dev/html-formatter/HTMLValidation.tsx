// features/dev/html-formatter/HTMLValidation.tsx
"use client";

import { useMemo } from "react";
import type { ValidationResult, HTMLMetadata } from "./htmlEngine";

interface HTMLValidationProps {
    validation: ValidationResult;
    metadata: HTMLMetadata;
}

export default function HTMLValidation({ validation, metadata }: HTMLValidationProps) {
    const validationSummary = useMemo(() => {
        const totalIssues = validation.errors.length + validation.warnings.length;
        const criticalIssues = validation.errors.length;
        const highPriorityWarnings = validation.warnings.filter(w => w.severity === "high").length;
        
        return {
            totalIssues,
            criticalIssues,
            highPriorityWarnings,
            hasIssues: totalIssues > 0,
        };
    }, [validation]);

    const accessibilityGrade = useMemo(() => {
        const score = metadata.accessibilityScore;
        if (score >= 90) return { grade: "A", color: "#16a34a", label: "Excellent" };
        if (score >= 75) return { grade: "B", color: "#84cc16", label: "Good" };
        if (score >= 60) return { grade: "C", color: "#eab308", label: "Fair" };
        if (score >= 40) return { grade: "D", color: "#f97316", label: "Poor" };
        return { grade: "F", color: "#ef4444", label: "Critical" };
    }, [metadata.accessibilityScore]);

    return (
        <>
            <div className="hv-root">
                {/* Validation Summary */}
                <div className="hv-summary">
                    <div className="hv-summary-card">
                        <div className="hv-summary-icon" style={{ 
                            background: validation.isValid ? '#dcfce7' : '#fef2f2',
                            color: validation.isValid ? '#16a34a' : '#dc2626' 
                        }}>
                            <i className={`ti ${validation.isValid ? "ti-circle-check" : "ti-alert-circle"}`} />
                        </div>
                        <div className="hv-summary-content">
                            <div className="hv-summary-label">Validation Status</div>
                            <div className="hv-summary-value">
                                {validation.isValid ? "Valid" : `${validationSummary.totalIssues} Issues`}
                            </div>
                        </div>
                    </div>

                    <div className="hv-summary-card">
                        <div className="hv-summary-icon" style={{ 
                            background: accessibilityGrade.color + '20',
                            color: accessibilityGrade.color 
                        }}>
                            <span className="hv-grade">{accessibilityGrade.grade}</span>
                        </div>
                        <div className="hv-summary-content">
                            <div className="hv-summary-label">Accessibility Score</div>
                            <div className="hv-summary-value">
                                {metadata.accessibilityScore}/100
                                <span className="hv-grade-label">{accessibilityGrade.label}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hv-summary-card">
                        <div className="hv-summary-icon" style={{ 
                            background: metadata.hasSemanticHTML ? '#dcfce7' : '#fef3c7',
                            color: metadata.hasSemanticHTML ? '#16a34a' : '#d97706'
                        }}>
                            <i className="ti ti-code" />
                        </div>
                        <div className="hv-summary-content">
                            <div className="hv-summary-label">Semantic HTML</div>
                            <div className="hv-summary-value">
                                {metadata.hasSemanticHTML ? "Yes" : "No"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="hv-section">
                    <div className="hv-section-header">
                        <i className="ti ti-info-circle" />
                        <span>Document Metadata</span>
                    </div>
                    <div className="hv-metadata-grid">
                        <div className="hv-metadata-item">
                            <span className="hv-metadata-label">DOCTYPE</span>
                            <span className="hv-metadata-value">
                                {metadata.doctype ? "✓ Present" : "✗ Missing"}
                            </span>
                        </div>
                        <div className="hv-metadata-item">
                            <span className="hv-metadata-label">Language</span>
                            <span className="hv-metadata-value">
                                {metadata.language || "Not specified"}
                            </span>
                        </div>
                        <div className="hv-metadata-item">
                            <span className="hv-metadata-label">Charset</span>
                            <span className="hv-metadata-value">
                                {metadata.charset || "Not specified"}
                            </span>
                        </div>
                        <div className="hv-metadata-item">
                            <span className="hv-metadata-label">Title</span>
                            <span className="hv-metadata-value">
                                {metadata.title || "Not specified"}
                            </span>
                        </div>
                        <div className="hv-metadata-item">
                            <span className="hv-metadata-label">Meta Tags</span>
                            <span className="hv-metadata-value">{metadata.metaTags}</span>
                        </div>
                        <div className="hv-metadata-item">
                            <span className="hv-metadata-label">Scripts</span>
                            <span className="hv-metadata-value">{metadata.scriptTags}</span>
                        </div>
                    </div>
                </div>

                {/* Errors */}
                {validation.errors.length > 0 && (
                    <div className="hv-section">
                        <div className="hv-section-header">
                            <i className="ti ti-alert-circle" />
                            <span>Errors ({validation.errors.length})</span>
                        </div>
                        <div className="hv-issues">
                            {validation.errors.map((error, idx) => (
                                <div key={idx} className="hv-issue hv-issue--error">
                                    <div className="hv-issue-icon">
                                        <i className="ti ti-x" />
                                    </div>
                                    <div className="hv-issue-content">
                                        <div className="hv-issue-message">{error.message}</div>
                                        {error.element && (
                                            <div className="hv-issue-meta">
                                                Element: <code>&lt;{error.element}&gt;</code>
                                            </div>
                                        )}
                                    </div>
                                    <div className="hv-issue-type">{error.type}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                    <div className="hv-section">
                        <div className="hv-section-header">
                            <i className="ti ti-alert-triangle" />
                            <span>Warnings ({validation.warnings.length})</span>
                        </div>
                        <div className="hv-issues">
                            {validation.warnings.map((warning, idx) => (
                                <div key={idx} className={`hv-issue hv-issue--warning hv-issue--${warning.severity}`}>
                                    <div className="hv-issue-icon">
                                        <i className="ti ti-alert-triangle" />
                                    </div>
                                    <div className="hv-issue-content">
                                        <div className="hv-issue-message">{warning.message}</div>
                                        {warning.element && (
                                            <div className="hv-issue-meta">
                                                Element: <code>&lt;{warning.element}&gt;</code>
                                            </div>
                                        )}
                                    </div>
                                    <div className="hv-issue-severity">{warning.severity}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                {validation.suggestions.length > 0 && (
                    <div className="hv-section">
                        <div className="hv-section-header">
                            <i className="ti ti-bulb" />
                            <span>Suggestions</span>
                        </div>
                        <div className="hv-suggestions">
                            {validation.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="hv-suggestion">
                                    <i className="ti ti-check" />
                                    <span>{suggestion}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Good State */}
                {validation.isValid && validation.warnings.length === 0 && (
                    <div className="hv-all-good">
                        <div className="hv-all-good-icon">
                            <i className="ti ti-circle-check" />
                        </div>
                        <h3 className="hv-all-good-title">Perfect HTML!</h3>
                        <p className="hv-all-good-desc">
                            Your HTML is valid, well-structured, and follows best practices.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .hv-root {
                    flex: 1;
                    padding: 16px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-surface);
                }

                .hv-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .hv-summary-card {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .hv-summary-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    flex-shrink: 0;
                }

                .hv-grade {
                    font-size: 20px;
                    font-weight: 700;
                    font-family: var(--font-sans);
                }

                .hv-summary-content {
                    flex: 1;
                    min-width: 0;
                }

                .hv-summary-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 4px;
                }

                .hv-summary-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hv-grade-label {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-tertiary);
                }

                .hv-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .hv-section-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hv-section-header i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .hv-metadata-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 1px;
                    background: var(--border);
                }

                .hv-metadata-item {
                    background: var(--bg-card);
                    padding: 12px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .hv-metadata-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hv-metadata-value {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .hv-issues {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border);
                }

                .hv-issue {
                    background: var(--bg-card);
                    padding: 12px 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .hv-issue-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .hv-issue--error .hv-issue-icon {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .hv-issue--warning .hv-issue-icon {
                    background: #fef3c7;
                    color: #d97706;
                }

                @media (prefers-color-scheme: dark) {
                    .hv-issue--error .hv-issue-icon {
                        background: #1f1517;
                        color: #f87171;
                    }
                    .hv-issue--warning .hv-issue-icon {
                        background: #451a03;
                        color: #fbbf24;
                    }
                }

                .hv-issue-content {
                    flex: 1;
                    min-width: 0;
                }

                .hv-issue-message {
                    font-size: 13px;
                    color: var(--text);
                    line-height: 1.5;
                    margin-bottom: 4px;
                }

                .hv-issue-meta {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .hv-issue-meta code {
                    font-size: 10px;
                    padding: 1px 4px;
                }

                .hv-issue-type,
                .hv-issue-severity {
                    font-size: 9px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 99px;
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    flex-shrink: 0;
                }

                .hv-issue--high .hv-issue-severity {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .hv-issue--medium .hv-issue-severity {
                    background: #fef3c7;
                    color: #d97706;
                }

                @media (prefers-color-scheme: dark) {
                    .hv-issue--high .hv-issue-severity {
                        background: #1f1517;
                        color: #f87171;
                    }
                    .hv-issue--medium .hv-issue-severity {
                        background: #451a03;
                        color: #fbbf24;
                    }
                }

                .hv-suggestions {
                    padding: 12px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .hv-suggestion {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .hv-suggestion i {
                    font-size: 14px;
                    color: var(--brand);
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .hv-all-good {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 40px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 12px;
                }

                .hv-all-good-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #dcfce7;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }

                @media (prefers-color-scheme: dark) {
                    .hv-all-good-icon {
                        background: #022c22;
                        color: #4ade80;
                    }
                }

                .hv-all-good-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .hv-all-good-desc {
                    font-size: 14px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .hv-root {
                        padding: 12px;
                    }

                    .hv-summary {
                        grid-template-columns: 1fr;
                    }

                    .hv-metadata-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}