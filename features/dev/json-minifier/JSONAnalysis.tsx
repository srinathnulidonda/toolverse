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
  const issueSummary = useMemo(
    () => ({
      errors: issues.filter((i) => i.type === "error").length,
      warnings: issues.filter((i) => i.type === "warning").length,
      infos: issues.filter((i) => i.type === "info").length,
    }),
    [issues]
  );

  const typeDistribution = useMemo(() => {
    const total = stats.totalValues || 1;
    return [
      {
        label: "Strings",
        count: stats.strings,
        color: "#3b82f6",
        pct: Math.round((stats.strings / total) * 100),
      },
      {
        label: "Numbers",
        count: stats.numbers,
        color: "#8b5cf6",
        pct: Math.round((stats.numbers / total) * 100),
      },
      {
        label: "Booleans",
        count: stats.booleans,
        color: "#f59e0b",
        pct: Math.round((stats.booleans / total) * 100),
      },
      {
        label: "Nulls",
        count: stats.nulls,
        color: "#6b7280",
        pct: Math.round((stats.nulls / total) * 100),
      },
      {
        label: "Arrays",
        count: stats.arrays,
        color: "#10b981",
        pct: Math.round((stats.arrays / total) * 100),
      },
      {
        label: "Objects",
        count: stats.objects,
        color: "#ef4444",
        pct: Math.round((stats.objects / total) * 100),
      },
    ].filter((t) => t.count > 0);
  }, [stats]);

  const renderSchema = (node: any, depth = 0): React.ReactNode => {
    if (!node) return null;
    if (depth > 3) return <span className="jva-schema-ellipsis">…</span>;

    if (node.type === "object" && node.children) {
      return (
        <div className="jva-schema-object">
          <span className="jva-schema-brace">{"{"}</span>
          <div className="jva-schema-children">
            {Object.entries(node.children)
              .slice(0, 8)
              .map(([k, v]: [string, any]) => (
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
          <span className="jva-schema-type jva-schema-type--array">array[{node.count}]</span>
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

    return <span className={`jva-schema-type ${typeColors[node.type] || ""}`}>{node.type}</span>;
  };

  return (
    <>
      <div className="jva-root">
        {/* Summary Cards */}
        <div className="jva-cards">
          <div className="jva-card">
            <div
              className="jva-card-icon"
              style={{
                background: analysis.isValid ? "#dcfce7" : "#fef2f2",
                color: analysis.isValid ? "#16a34a" : "#dc2626",
              }}
            >
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
                <span className="jva-size-label">{stats.savings > 0 ? "Saved" : "Added"}</span>
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
                {typeDistribution.map((t) => (
                  <div
                    key={t.label}
                    className="jva-dist-segment"
                    style={{ width: `${t.pct}%`, background: t.color }}
                    title={`${t.label}: ${t.count} (${t.pct}%)`}
                  />
                ))}
              </div>
              <div className="jva-dist-legend">
                {typeDistribution.map((t) => (
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
              { label: "Nested Objects", active: analysis.hasNestedObjects, icon: "ti-braces" },
              { label: "Arrays", active: analysis.hasArrays, icon: "ti-brackets" },
              { label: "Null Values", active: analysis.hasNulls, icon: "ti-circle-off" },
              { label: "Mixed Types", active: analysis.hasMixedTypes, icon: "ti-arrows-shuffle" },
              {
                label: "Duplicate Keys",
                active: analysis.duplicateKeys.length > 0,
                icon: "ti-copy",
              },
            ].map((f) => (
              <div key={f.label} className={`jva-feature ${f.active ? "on" : "off"}`}>
                <i className={`ti ${f.icon}`} />
                <span>{f.label}</span>
                <i className={`ti ${f.active ? "ti-check" : "ti-minus"} jva-feature-tick`} />
              </div>
            ))}
            {analysis.deepestPath && (
              <div className="jva-feature on">
                <i className="ti ti-route" />
                <span>
                  Deepest path: <code>{analysis.deepestPath}</code>
                </span>
              </div>
            )}
            {analysis.largestArray > 0 && (
              <div className="jva-feature on">
                <i className="ti ti-list" />
                <span>
                  Largest array: <strong>{analysis.largestArray} items</strong>
                </span>
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
          <div className="jva-schema-wrap">{renderSchema(analysis.schema)}</div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="jva-section">
            <div className="jva-section-header">
              <i className="ti ti-alert-circle" />
              <span>Issues</span>
              <div className="jva-issue-counts">
                {issueSummary.errors > 0 && (
                  <span className="jva-badge jva-badge--error">
                    {issueSummary.errors} error{issueSummary.errors !== 1 ? "s" : ""}
                  </span>
                )}
                {issueSummary.warnings > 0 && (
                  <span className="jva-badge jva-badge--warning">
                    {issueSummary.warnings} warning{issueSummary.warnings !== 1 ? "s" : ""}
                  </span>
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
                    <i
                      className={`ti ${issue.type === "error"
                          ? "ti-circle-x"
                          : issue.type === "warning"
                            ? "ti-alert-triangle"
                            : "ti-info-circle"
                        }`}
                    />
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
            <div className="jva-clean-icon">
              <i className="ti ti-circle-check" />
            </div>
            <h3 className="jva-clean-title">Clean JSON</h3>
            <p className="jva-clean-desc">No issues detected — your JSON is well-structured.</p>
          </div>
        )}
      </div>
    </>
  );
}
