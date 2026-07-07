// features/dev/js-minifier/JSAnalysis.tsx
"use client";

import { useMemo } from "react";
import type { CodeAnalysis, CodeIssue, JSStats } from "./jsEngine";
import { formatBytes } from "./jsEngine";

interface JSAnalysisProps {
    analysis: CodeAnalysis;
    issues: CodeIssue[];
    stats: JSStats;
}

export default function JSAnalysis({ analysis, issues, stats }: JSAnalysisProps) {
    const issueSummary = useMemo(() => ({
        errors:   issues.filter(i => i.type === "error").length,
        warnings: issues.filter(i => i.type === "warning").length,
        infos:    issues.filter(i => i.type === "info").length,
    }), [issues]);

    const features = useMemo(() => [
        { label: "ES Modules",         active: analysis.hasESModules,       icon: "ti-package"          },
        { label: "CommonJS",           active: analysis.hasCommonJS,         icon: "ti-box"              },
        { label: "Async / Await",      active: analysis.hasAsyncAwait,       icon: "ti-clock"            },
        { label: "Arrow Functions",    active: analysis.hasArrowFunctions,   icon: "ti-arrow-right"      },
        { label: "Classes",            active: analysis.hasClasses,          icon: "ti-hierarchy"        },
        { label: "Destructuring",      active: analysis.hasDestructuring,    icon: "ti-layout-list"      },
        { label: "Template Literals",  active: analysis.hasTemplateLiterals, icon: "ti-template"         },
        { label: "Optional Chaining",  active: analysis.hasOptionalChaining, icon: "ti-link"             },
    ], [analysis]);

    const complexityConfig = {
        low:    { color: "#16a34a", bg: "#dcfce7", label: "Low",    icon: "ti-circle-check"    },
        medium: { color: "#d97706", bg: "#fef3c7", label: "Medium", icon: "ti-alert-circle"    },
        high:   { color: "#dc2626", bg: "#fef2f2", label: "High",   icon: "ti-alert-triangle"  },
    };

    const cx = complexityConfig[analysis.complexity];

    return (
        <>
            <div className="ja-root">
                {/* Summary Cards */}
                <div className="ja-cards">
                    <div className="ja-card">
                        <div className="ja-card-icon" style={{
                            background: analysis.syntaxValid ? "#dcfce7" : "#fef2f2",
                            color:      analysis.syntaxValid ? "#16a34a" : "#dc2626"
                        }}>
                            <i className={`ti ${analysis.syntaxValid ? "ti-circle-check" : "ti-circle-x"}`} />
                        </div>
                        <div className="ja-card-body">
                            <div className="ja-card-label">Syntax</div>
                            <div className="ja-card-value">{analysis.syntaxValid ? "Valid" : "Errors"}</div>
                        </div>
                    </div>

                    <div className="ja-card">
                        <div className="ja-card-icon" style={{ background: cx.bg, color: cx.color }}>
                            <i className={`ti ${cx.icon}`} />
                        </div>
                        <div className="ja-card-body">
                            <div className="ja-card-label">Complexity</div>
                            <div className="ja-card-value">{cx.label}</div>
                        </div>
                    </div>

                    <div className="ja-card">
                        <div className="ja-card-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                            <i className="ti ti-function" />
                        </div>
                        <div className="ja-card-body">
                            <div className="ja-card-label">Functions</div>
                            <div className="ja-card-value">{stats.functions}</div>
                        </div>
                    </div>

                    <div className="ja-card">
                        <div className="ja-card-icon" style={{ background: "#faf5ff", color: "#7c3aed" }}>
                            <i className="ti ti-variable" />
                        </div>
                        <div className="ja-card-body">
                            <div className="ja-card-label">Variables</div>
                            <div className="ja-card-value">{stats.variables}</div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="ja-section">
                    <div className="ja-section-header">
                        <i className="ti ti-chart-bar" />
                        <span>Size Analysis</span>
                    </div>
                    <div className="ja-size-chart">
                        <div className="ja-size-row">
                            <span className="ja-size-label">Original</span>
                            <div className="ja-size-bar-wrap">
                                <div className="ja-size-bar ja-size-bar--original" style={{ width: "100%" }} />
                            </div>
                            <span className="ja-size-value">{formatBytes(stats.original)}</span>
                        </div>
                        <div className="ja-size-row">
                            <span className="ja-size-label">Minified</span>
                            <div className="ja-size-bar-wrap">
                                <div
                                    className="ja-size-bar ja-size-bar--minified"
                                    style={{ width: `${100 - stats.savingsPercent}%` }}
                                />
                            </div>
                            <span className="ja-size-value">{formatBytes(stats.minified)}</span>
                        </div>
                        <div className="ja-size-row">
                            <span className="ja-size-label">Saved</span>
                            <div className="ja-size-bar-wrap">
                                <div
                                    className="ja-size-bar ja-size-bar--saved"
                                    style={{ width: `${stats.savingsPercent}%` }}
                                />
                            </div>
                            <span className="ja-size-value ja-size-value--good">
                                {formatBytes(stats.savings)} ({stats.savingsPercent}%)
                            </span>
                        </div>
                    </div>

                    <div className="ja-meta-grid">
                        <div className="ja-meta-item">
                            <span className="ja-meta-label">Lines (before)</span>
                            <span className="ja-meta-value">{stats.originalLines.toLocaleString()}</span>
                        </div>
                        <div className="ja-meta-item">
                            <span className="ja-meta-label">Lines (after)</span>
                            <span className="ja-meta-value">{stats.minifiedLines.toLocaleString()}</span>
                        </div>
                        <div className="ja-meta-item">
                            <span className="ja-meta-label">Comments</span>
                            <span className="ja-meta-value">{stats.comments}</span>
                        </div>
                        <div className="ja-meta-item">
                            <span className="ja-meta-label">Strings</span>
                            <span className="ja-meta-value">{stats.strings}</span>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="ja-section">
                    <div className="ja-section-header">
                        <i className="ti ti-sparkles" />
                        <span>Detected Features</span>
                    </div>
                    <div className="ja-features">
                        {features.map(f => (
                            <div key={f.label} className={`ja-feature ${f.active ? "ja-feature--on" : "ja-feature--off"}`}>
                                <i className={`ti ${f.icon}`} />
                                <span>{f.label}</span>
                                {f.active
                                    ? <i className="ti ti-check ja-feature-check" />
                                    : <i className="ti ti-minus ja-feature-off-icon" />
                                }
                            </div>
                        ))}
                    </div>
                </div>

                {/* Issues */}
                {issues.length > 0 && (
                    <div className="ja-section">
                        <div className="ja-section-header">
                            <i className="ti ti-bug" />
                            <span>Code Issues</span>
                            <div className="ja-issue-counts">
                                {issueSummary.errors > 0 && (
                                    <span className="ja-issue-badge ja-issue-badge--error">
                                        {issueSummary.errors} error{issueSummary.errors !== 1 ? "s" : ""}
                                    </span>
                                )}
                                {issueSummary.warnings > 0 && (
                                    <span className="ja-issue-badge ja-issue-badge--warning">
                                        {issueSummary.warnings} warning{issueSummary.warnings !== 1 ? "s" : ""}
                                    </span>
                                )}
                                {issueSummary.infos > 0 && (
                                    <span className="ja-issue-badge ja-issue-badge--info">
                                        {issueSummary.infos} info
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="ja-issues">
                            {issues.map((issue, idx) => (
                                <div key={idx} className={`ja-issue ja-issue--${issue.type}`}>
                                    <div className="ja-issue-icon">
                                        <i className={`ti ${
                                            issue.type === "error"   ? "ti-circle-x"        :
                                            issue.type === "warning" ? "ti-alert-triangle"  :
                                                                       "ti-info-circle"
                                        }`} />
                                    </div>
                                    <div className="ja-issue-body">
                                        <div className="ja-issue-msg">{issue.message}</div>
                                        <div className="ja-issue-meta">
                                            {issue.line && <span>Line {issue.line}</span>}
                                            {issue.rule && <code>{issue.rule}</code>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {issues.length === 0 && (
                    <div className="ja-clean">
                        <div className="ja-clean-icon">
                            <i className="ti ti-circle-check" />
                        </div>
                        <h3 className="ja-clean-title">No Issues Found</h3>
                        <p className="ja-clean-desc">Your code looks clean and production-ready.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .ja-root {
                    flex: 1;
                    padding: 16px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-surface);
                }

                /*  Cards  */
                .ja-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 10px;
                }

                .ja-card {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    padding: 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .ja-card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .ja-card-body {
                    min-width: 0;
                }

                .ja-card-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 3px;
                }

                .ja-card-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                }

                /*  Section  */
                .ja-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .ja-section-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ja-section-header i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .ja-issue-counts {
                    display: flex;
                    gap: 6px;
                    margin-left: auto;
                }

                /*  Size Chart  */
                .ja-size-chart {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border-bottom: 0.5px solid var(--border);
                }

                .ja-size-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .ja-size-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    width: 60px;
                    flex-shrink: 0;
                }

                .ja-size-bar-wrap {
                    flex: 1;
                    height: 8px;
                    background: var(--bg-surface);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .ja-size-bar {
                    height: 100%;
                    border-radius: 99px;
                    transition: width 0.4s ease;
                }

                .ja-size-bar--original { background: var(--border); }
                .ja-size-bar--minified { background: #3b82f6; }
                .ja-size-bar--saved    { background: #22c55e; }

                .ja-size-value {
                    font-size: 11px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                    color: var(--text-secondary);
                    width: 90px;
                    text-align: right;
                    flex-shrink: 0;
                }

                .ja-size-value--good { color: #16a34a; }

                @media (prefers-color-scheme: dark) {
                    .ja-size-value--good { color: #4ade80; }
                }

                /*  Meta Grid  */
                .ja-meta-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 1px;
                    background: var(--border);
                }

                .ja-meta-item {
                    background: var(--bg-card);
                    padding: 12px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .ja-meta-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                }

                .ja-meta-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                /*  Features  */
                .ja-features {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1px;
                    background: var(--border);
                }

                .ja-feature {
                    background: var(--bg-card);
                    padding: 10px 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .ja-feature i:first-child {
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .ja-feature span {
                    flex: 1;
                }

                .ja-feature--on {
                    color: var(--text);
                }

                .ja-feature--off {
                    color: var(--text-disabled);
                }

                .ja-feature--on i:first-child { color: var(--brand); }
                .ja-feature--off i:first-child { color: var(--text-disabled); }

                .ja-feature-check { color: #22c55e !important; font-size: 13px !important; }
                .ja-feature-off-icon { color: var(--border) !important; font-size: 13px !important; }

                /*  Issues  */
                .ja-issue-badge {
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 7px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .ja-issue-badge--error   { background: #fef2f2; color: #dc2626; }
                .ja-issue-badge--warning { background: #fef3c7; color: #d97706; }
                .ja-issue-badge--info    { background: #eff6ff; color: #2563eb; }

                @media (prefers-color-scheme: dark) {
                    .ja-issue-badge--error   { background: #1f1517; color: #f87171; }
                    .ja-issue-badge--warning { background: #451a03; color: #fbbf24; }
                    .ja-issue-badge--info    { background: #0a1628; color: #93c5fd; }
                }

                .ja-issues {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border);
                }

                .ja-issue {
                    background: var(--bg-card);
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 16px;
                }

                .ja-issue-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .ja-issue--error   .ja-issue-icon { background: #fef2f2; color: #dc2626; }
                .ja-issue--warning .ja-issue-icon { background: #fef3c7; color: #d97706; }
                .ja-issue--info    .ja-issue-icon { background: #eff6ff; color: #2563eb; }

                @media (prefers-color-scheme: dark) {
                    .ja-issue--error   .ja-issue-icon { background: #1f1517; color: #f87171; }
                    .ja-issue--warning .ja-issue-icon { background: #451a03; color: #fbbf24; }
                    .ja-issue--info    .ja-issue-icon { background: #0a1628; color: #93c5fd; }
                }

                .ja-issue-body { flex: 1; min-width: 0; }

                .ja-issue-msg {
                    font-size: 13px;
                    color: var(--text);
                    line-height: 1.5;
                    margin-bottom: 3px;
                }

                .ja-issue-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .ja-issue-meta code {
                    font-size: 10px;
                    padding: 1px 5px;
                    background: var(--bg-surface);
                    border-radius: 4px;
                }

                /*  Clean State  */
                .ja-clean {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    padding: 40px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 10px;
                }

                .ja-clean-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    background: #dcfce7;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                }

                @media (prefers-color-scheme: dark) {
                    .ja-clean-icon { background: #022c22; color: #4ade80; }
                }

                .ja-clean-title { font-size: 16px; font-weight: 600; color: var(--text); margin: 0; }
                .ja-clean-desc  { font-size: 13px; color: var(--text-tertiary); margin: 0; }

                @media (max-width: 768px) {
                    .ja-root { padding: 12px; }
                    .ja-cards { grid-template-columns: repeat(2, 1fr); }
                    .ja-features { grid-template-columns: 1fr; }
                    .ja-meta-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
        </>
    );
}