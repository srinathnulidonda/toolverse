// features/dev/json-minifier/JSONAnalysis.tsx
"use client";

import { useMemo } from "react";
import type { JSONAnalysis, JSONIssue, JSONStats } from "./jsonEngine";
import { formatBytes } from "./jsonEngine";

interface JSONAnalysisProps {
    analysis: JSONAnalysis;
    issues: JSONIssue[];
    stats: JSONStats;
}

export default function JSONAnalysis({ analysis, issues, stats }: JSONAnalysisProps) {
    const issueSummary = useMemo(() => ({
        errors:   issues.filter(i => i.type === "error").length,
        warnings: issues.filter(i => i.type === "warning").length,
        infos:    issues.filter(i => i.type === "info").length,
    }), [issues]);

    const typeDistribution = useMemo(() => {
        const total = stats.totalValues || 1;
        return [
            { label: "Strings",  count: stats.strings,  color: "#3b82f6", pct: Math.round(stats.strings  / total * 100) },
            { label: "Numbers",  count: stats.numbers,  color: "#8b5cf6", pct: Math.round(stats.numbers  / total * 100) },
            { label: "Booleans", count: stats.booleans, color: "#f59e0b", pct: Math.round(stats.booleans / total * 100) },
            { label: "Nulls",    count: stats.nulls,    color: "#6b7280", pct: Math.round(stats.nulls    / total * 100) },
            { label: "Arrays",   count: stats.arrays,   color: "#10b981", pct: Math.round(stats.arrays   / total * 100) },
            { label: "Objects",  count: stats.objects,  color: "#ef4444", pct: Math.round(stats.objects  / total * 100) },
        ].filter(t => t.count > 0);
    }, [stats]);

    const renderSchema = (node: any, depth = 0): React.ReactNode => {
        if (!node) return null;
        if (depth > 3) return <span className="jva-schema-ellipsis">…</span>;

        if (node.type === "object" && node.children) {
            return (
                <div className="jva-schema-object">
                    <span className="jva-schema-brace">{"{"}</span>
                    <div className="jva-schema-children">
                        {Object.entries(node.children).slice(0, 8).map(([k, v]: [string, any]) => (
                            <div key={k} className="jva-schema-row">
                                <span className="jva-schema-key">"{k}"</span>
                                <span className="jva-schema-colon">:</span>
                                {renderSchema(v, depth + 1)}
                            </div>
                        ))}
                        {Object.keys(node.children).length > 8 && (
                            <div className="jva-schema-row jva-schema-more">
                                +{Object.keys(node.children).length - 8} more…
                            </div>
                        )}
                    </div>
                    <span className="jva-schema-brace">{"}"}</span>
                </div>
            );
        }

        if (node.type === "array") {
            return (
                <span className="jva-schema-array">
                    <span className="jva-schema-type jva-schema-type--array">
                        array[{node.count}]
                    </span>
                    {node.items && node.items.type !== "unknown" && (
                        <> of {renderSchema(node.items, depth + 1)}</>
                    )}
                </span>
            );
        }

        const typeColors: Record<string, string> = {
            string: "jva-schema-type--string",
            number: "jva-schema-type--number",
            boolean: "jva-schema-type--boolean",
            null: "jva-schema-type--null",
            object: "jva-schema-type--object",
            array: "jva-schema-type--array",
        };

        return (
            <span className={`jva-schema-type ${typeColors[node.type] || ""}`}>
                {node.type}
            </span>
        );
    };

    return (
        <>
            <div className="jva-root">
                {/* Summary Cards */}
                <div className="jva-cards">
                    <div className="jva-card">
                        <div className="jva-card-icon" style={{
                            background: analysis.isValid ? "#dcfce7" : "#fef2f2",
                            color: analysis.isValid ? "#16a34a" : "#dc2626"
                        }}>
                            <i className={`ti ${analysis.isValid ? "ti-circle-check" : "ti-circle-x"}`} />
                        </div>
                        <div className="jva-card-body">
                            <div className="jva-card-label">Status</div>
                            <div className="jva-card-value">{analysis.isValid ? "Valid" : "Invalid"}</div>
                        </div>
                    </div>

                    <div className="jva-card">
                        <div className="jva-card-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                            <i className="ti ti-braces" />
                        </div>
                        <div className="jva-card-body">
                            <div className="jva-card-label">Root Type</div>
                            <div className="jva-card-value" style={{ textTransform: "capitalize" }}>
                                {analysis.rootType}
                            </div>
                        </div>
                    </div>

                    <div className="jva-card">
                        <div className="jva-card-icon" style={{ background: "#faf5ff", color: "#7c3aed" }}>
                            <i className="ti ti-key" />
                        </div>
                        <div className="jva-card-body">
                            <div className="jva-card-label">Total Keys</div>
                            <div className="jva-card-value">{stats.keys.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="jva-card">
                        <div className="jva-card-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                            <i className="ti ti-layers" />
                        </div>
                        <div className="jva-card-body">
                            <div className="jva-card-label">Max Depth</div>
                            <div className="jva-card-value">{stats.depth}</div>
                        </div>
                    </div>
                </div>

                {/* Size Analysis */}
                <div className="jva-section">
                    <div className="jva-section-header">
                        <i className="ti ti-chart-bar" />
                        <span>Size Analysis</span>
                    </div>
                    <div className="jva-size-rows">
                        <div className="jva-size-row">
                            <span className="jva-size-label">Original</span>
                            <div className="jva-size-track">
                                <div className="jva-size-fill jva-size-fill--orig" style={{ width: "100%" }} />
                            </div>
                            <span className="jva-size-val">{formatBytes(stats.original)}</span>
                        </div>
                        <div className="jva-size-row">
                            <span className="jva-size-label">Processed</span>
                            <div className="jva-size-track">
                                <div
                                    className="jva-size-fill jva-size-fill--proc"
                                    style={{ width: `${Math.max(5, 100 - Math.abs(stats.savingsPercent))}%` }}
                                />
                            </div>
                            <span className="jva-size-val">{formatBytes(stats.processed)}</span>
                        </div>
                        {stats.savings !== 0 && (
                            <div className="jva-size-row">
                                <span className="jva-size-label">
                                    {stats.savings > 0 ? "Saved" : "Added"}
                                </span>
                                <div className="jva-size-track">
                                    <div
                                        className={`jva-size-fill ${stats.savings > 0 ? "jva-size-fill--save" : "jva-size-fill--add"}`}
                                        style={{ width: `${Math.abs(stats.savingsPercent)}%` }}
                                    />
                                </div>
                                <span className={`jva-size-val ${stats.savings > 0 ? "good" : "warn"}`}>
                                    {formatBytes(Math.abs(stats.savings))} ({Math.abs(stats.savingsPercent)}%)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="jva-meta-grid">
                        <div className="jva-meta-item">
                            <span className="jva-meta-label">Objects</span>
                            <span className="jva-meta-value">{stats.objects}</span>
                        </div>
                        <div className="jva-meta-item">
                            <span className="jva-meta-label">Arrays</span>
                            <span className="jva-meta-value">{stats.arrays}</span>
                        </div>
                        <div className="jva-meta-item">
                            <span className="jva-meta-label">Strings</span>
                            <span className="jva-meta-value">{stats.strings}</span>
                        </div>
                        <div className="jva-meta-item">
                            <span className="jva-meta-label">Numbers</span>
                            <span className="jva-meta-value">{stats.numbers}</span>
                        </div>
                        <div className="jva-meta-item">
                            <span className="jva-meta-label">Booleans</span>
                            <span className="jva-meta-value">{stats.booleans}</span>
                        </div>
                        <div className="jva-meta-item">
                            <span className="jva-meta-label">Nulls</span>
                            <span className="jva-meta-value">{stats.nulls}</span>
                        </div>
                    </div>
                </div>

                {/* Type Distribution */}
                {typeDistribution.length > 0 && (
                    <div className="jva-section">
                        <div className="jva-section-header">
                            <i className="ti ti-chart-donut" />
                            <span>Value Distribution</span>
                        </div>
                        <div className="jva-dist">
                            <div className="jva-dist-bar">
                                {typeDistribution.map(t => (
                                    <div
                                        key={t.label}
                                        className="jva-dist-segment"
                                        style={{ width: `${t.pct}%`, background: t.color }}
                                        title={`${t.label}: ${t.count} (${t.pct}%)`}
                                    />
                                ))}
                            </div>
                            <div className="jva-dist-legend">
                                {typeDistribution.map(t => (
                                    <div key={t.label} className="jva-dist-item">
                                        <span className="jva-dist-dot" style={{ background: t.color }} />
                                        <span className="jva-dist-label">{t.label}</span>
                                        <span className="jva-dist-count">{t.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Features */}
                <div className="jva-section">
                    <div className="jva-section-header">
                        <i className="ti ti-info-circle" />
                        <span>Structure Info</span>
                    </div>
                    <div className="jva-features">
                        {[
                            { label: "Nested Objects",   active: analysis.hasNestedObjects, icon: "ti-braces"     },
                            { label: "Arrays",           active: analysis.hasArrays,         icon: "ti-brackets"   },
                            { label: "Null Values",      active: analysis.hasNulls,          icon: "ti-circle-off" },
                            { label: "Mixed Types",      active: analysis.hasMixedTypes,     icon: "ti-arrows-shuffle"},
                            { label: "Duplicate Keys",   active: analysis.duplicateKeys.length > 0, icon: "ti-copy"},
                        ].map(f => (
                            <div key={f.label} className={`jva-feature ${f.active ? "on" : "off"}`}>
                                <i className={`ti ${f.icon}`} />
                                <span>{f.label}</span>
                                <i className={`ti ${f.active ? "ti-check" : "ti-minus"} jva-feature-tick`} />
                            </div>
                        ))}
                        {analysis.deepestPath && (
                            <div className="jva-feature on">
                                <i className="ti ti-route" />
                                <span>Deepest path: <code>{analysis.deepestPath}</code></span>
                            </div>
                        )}
                        {analysis.largestArray > 0 && (
                            <div className="jva-feature on">
                                <i className="ti ti-list" />
                                <span>Largest array: <strong>{analysis.largestArray} items</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schema */}
                <div className="jva-section">
                    <div className="jva-section-header">
                        <i className="ti ti-hierarchy" />
                        <span>Inferred Schema</span>
                    </div>
                    <div className="jva-schema-wrap">
                        {renderSchema(analysis.schema)}
                    </div>
                </div>

                {/* Issues */}
                {issues.length > 0 && (
                    <div className="jva-section">
                        <div className="jva-section-header">
                            <i className="ti ti-alert-circle" />
                            <span>Issues</span>
                            <div className="jva-issue-counts">
                                {issueSummary.errors > 0 && (
                                    <span className="jva-badge jva-badge--error">{issueSummary.errors} error{issueSummary.errors !== 1 ? "s" : ""}</span>
                                )}
                                {issueSummary.warnings > 0 && (
                                    <span className="jva-badge jva-badge--warning">{issueSummary.warnings} warning{issueSummary.warnings !== 1 ? "s" : ""}</span>
                                )}
                                {issueSummary.infos > 0 && (
                                    <span className="jva-badge jva-badge--info">{issueSummary.infos} info</span>
                                )}
                            </div>
                        </div>
                        <div className="jva-issues">
                            {issues.slice(0, 20).map((issue, idx) => (
                                <div key={idx} className={`jva-issue jva-issue--${issue.type}`}>
                                    <div className="jva-issue-icon">
                                        <i className={`ti ${
                                            issue.type === "error"   ? "ti-circle-x"       :
                                            issue.type === "warning" ? "ti-alert-triangle" :
                                                                       "ti-info-circle"
                                        }`} />
                                    </div>
                                    <div className="jva-issue-body">
                                        <div className="jva-issue-msg">{issue.message}</div>
                                        <div className="jva-issue-meta">
                                            {issue.path && <span>{issue.path}</span>}
                                            {issue.rule && <code>{issue.rule}</code>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {issues.length > 20 && (
                                <div className="jva-issues-more">+{issues.length - 20} more issues</div>
                            )}
                        </div>
                    </div>
                )}

                {issues.length === 0 && (
                    <div className="jva-clean">
                        <div className="jva-clean-icon"><i className="ti ti-circle-check" /></div>
                        <h3 className="jva-clean-title">Clean JSON</h3>
                        <p className="jva-clean-desc">No issues detected — your JSON is well-structured.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .jva-root {
                    flex: 1;
                    padding: 16px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-surface);
                }

                /* Cards */
                .jva-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                }

                .jva-card {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    padding: 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .jva-card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .jva-card-body { min-width: 0; }

                .jva-card-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 3px;
                }

                .jva-card-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                }

                /* Section */
                .jva-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .jva-section-header {
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

                .jva-section-header i { font-size: 14px; color: var(--text-secondary); }

                .jva-issue-counts {
                    display: flex;
                    gap: 6px;
                    margin-left: auto;
                }

                /* Size Analysis */
                .jva-size-rows {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border-bottom: 0.5px solid var(--border);
                }

                .jva-size-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .jva-size-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    width: 60px;
                    flex-shrink: 0;
                }

                .jva-size-track {
                    flex: 1;
                    height: 8px;
                    background: var(--bg-surface);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .jva-size-fill {
                    height: 100%;
                    border-radius: 99px;
                    transition: width 0.4s ease;
                }

                .jva-size-fill--orig { background: var(--border); }
                .jva-size-fill--proc { background: #3b82f6; }
                .jva-size-fill--save { background: #22c55e; }
                .jva-size-fill--add  { background: #f59e0b; }

                .jva-size-val {
                    font-size: 11px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                    color: var(--text-secondary);
                    width: 100px;
                    text-align: right;
                    flex-shrink: 0;
                }

                .jva-size-val.good { color: #16a34a; }
                .jva-size-val.warn { color: #d97706; }

                @media (prefers-color-scheme: dark) {
                    .jva-size-val.good { color: #4ade80; }
                    .jva-size-val.warn { color: #fbbf24; }
                }

                /* Meta Grid */
                .jva-meta-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 1px;
                    background: var(--border);
                }

                .jva-meta-item {
                    background: var(--bg-card);
                    padding: 12px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .jva-meta-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                }

                .jva-meta-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                /* Distribution */
                .jva-dist { padding: 16px; }

                .jva-dist-bar {
                    height: 12px;
                    border-radius: 6px;
                    overflow: hidden;
                    display: flex;
                    margin-bottom: 14px;
                    background: var(--bg-surface);
                }

                .jva-dist-segment {
                    height: 100%;
                    transition: width 0.4s ease;
                    min-width: 2px;
                }

                .jva-dist-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .jva-dist-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .jva-dist-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .jva-dist-label { font-weight: 500; }

                .jva-dist-count {
                    font-family: var(--font-mono);
                    font-weight: 700;
                    color: var(--text);
                }

                /* Features */
                .jva-features {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border);
                }

                .jva-feature {
                    background: var(--bg-card);
                    padding: 10px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 500;
                }

                .jva-feature i:first-child { font-size: 14px; flex-shrink: 0; }
                .jva-feature span { flex: 1; }

                .jva-feature.on { color: var(--text); }
                .jva-feature.off { color: var(--text-disabled); }

                .jva-feature.on i:first-child  { color: var(--brand); }
                .jva-feature.off i:first-child { color: var(--text-disabled); }

                .jva-feature-tick { font-size: 13px !important; }
                .jva-feature.on  .jva-feature-tick { color: #22c55e !important; }
                .jva-feature.off .jva-feature-tick { color: var(--border) !important; }

                .jva-feature code {
                    font-size: 11px;
                    padding: 1px 5px;
                    background: var(--bg-surface);
                    border-radius: 4px;
                    color: var(--brand);
                }

                /* Schema */
                .jva-schema-wrap {
                    padding: 16px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    line-height: 1.7;
                    overflow: auto;
                }

                .jva-schema-object { display: flex; flex-direction: column; }
                .jva-schema-brace { color: var(--text-secondary); font-weight: 600; }

                .jva-schema-children {
                    padding-left: 16px;
                    border-left: 1.5px solid var(--border);
                    margin-left: 4px;
                }

                .jva-schema-row {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    padding: 1px 0;
                }

                .jva-schema-key   { color: var(--brand); }
                .jva-schema-colon { color: var(--text-tertiary); }
                .jva-schema-ellipsis { color: var(--text-disabled); }
                .jva-schema-more { color: var(--text-disabled); font-size: 11px; }

                .jva-schema-type {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 1px 5px;
                    border-radius: 4px;
                }

                .jva-schema-type--string  { background: #eff6ff; color: #2563eb; }
                .jva-schema-type--number  { background: #faf5ff; color: #7c3aed; }
                .jva-schema-type--boolean { background: #fff7ed; color: #ea580c; }
                .jva-schema-type--null    { background: var(--bg-surface); color: var(--text-tertiary); }
                .jva-schema-type--object  { background: #fef2f2; color: #dc2626; }
                .jva-schema-type--array   { background: #f0fdf4; color: #16a34a; }

                @media (prefers-color-scheme: dark) {
                    .jva-schema-type--string  { background: #0a1628; color: #93c5fd; }
                    .jva-schema-type--number  { background: #150e28; color: #c4b5fd; }
                    .jva-schema-type--boolean { background: #1c1008; color: #fdba74; }
                    .jva-schema-type--null    { background: var(--bg-surface); color: var(--text-tertiary); }
                    .jva-schema-type--object  { background: #1f1517; color: #f87171; }
                    .jva-schema-type--array   { background: #022c22; color: #4ade80; }
                }

                /* Badges */
                .jva-badge {
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 7px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .jva-badge--error   { background: #fef2f2; color: #dc2626; }
                .jva-badge--warning { background: #fef3c7; color: #d97706; }
                .jva-badge--info    { background: #eff6ff; color: #2563eb; }

                @media (prefers-color-scheme: dark) {
                    .jva-badge--error   { background: #1f1517; color: #f87171; }
                    .jva-badge--warning { background: #451a03; color: #fbbf24; }
                    .jva-badge--info    { background: #0a1628; color: #93c5fd; }
                }

                /* Issues */
                .jva-issues {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border);
                }

                .jva-issue {
                    background: var(--bg-card);
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 16px;
                }

                .jva-issue-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .jva-issue--error   .jva-issue-icon { background: #fef2f2; color: #dc2626; }
                .jva-issue--warning .jva-issue-icon { background: #fef3c7; color: #d97706; }
                .jva-issue--info    .jva-issue-icon { background: #eff6ff; color: #2563eb; }

                @media (prefers-color-scheme: dark) {
                    .jva-issue--error   .jva-issue-icon { background: #1f1517; color: #f87171; }
                    .jva-issue--warning .jva-issue-icon { background: #451a03; color: #fbbf24; }
                    .jva-issue--info    .jva-issue-icon { background: #0a1628; color: #93c5fd; }
                }

                .jva-issue-body { flex: 1; min-width: 0; }

                .jva-issue-msg {
                    font-size: 13px;
                    color: var(--text);
                    line-height: 1.5;
                    margin-bottom: 3px;
                }

                .jva-issue-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .jva-issue-meta code {
                    font-size: 10px;
                    padding: 1px 5px;
                    background: var(--bg-surface);
                    border-radius: 4px;
                }

                .jva-issues-more {
                    padding: 10px 16px;
                    font-size: 12px;
                    color: var(--text-tertiary);
                    text-align: center;
                    background: var(--bg-card);
                }

                /* Clean */
                .jva-clean {
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

                .jva-clean-icon {
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
                    .jva-clean-icon { background: #022c22; color: #4ade80; }
                }

                .jva-clean-title { font-size: 16px; font-weight: 600; color: var(--text); margin: 0; }
                .jva-clean-desc  { font-size: 13px; color: var(--text-tertiary); margin: 0; }

                @media (max-width: 768px) {
                    .jva-root { padding: 12px; }
                    .jva-cards { grid-template-columns: repeat(2, 1fr); }
                    .jva-meta-grid { grid-template-columns: repeat(2, 1fr); }
                    .jva-dist-legend { gap: 8px; }
                }
            `}</style>
        </>
    );
}