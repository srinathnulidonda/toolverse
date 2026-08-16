// features/dev/json-minifier/JSONAnalysis.tsx
"use client";

import { useMemo } from "react";
import type { JSONAnalysis, JSONIssue, JSONStats } from "./ts/jsonEngine";
import { formatBytes } from "./ts/jsonEngine";
import styles from "./style/JSONAnalysis.module.css";

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
    if (depth > 3) return <span className={styles.jvaSchemaEllipsis}>…</span>;

    if (node.type === "object" && node.children) {
      return (
        <div className={styles.jvaSchemaObject}>
          <span className={styles.jvaSchemaBrace}>{"{"}</span>
          <div className={styles.jvaSchemaChildren}>
            {Object.entries(node.children)
              .slice(0, 8)
              .map(([k, v]: [string, any]) => (
                <div key={k} className={styles.jvaSchemaRow}>
                  <span className={styles.jvaSchemaKey}>"{k}"</span>
                  <span className={styles.jvaSchemaColon}>:</span>
                  {renderSchema(v, depth + 1)}
                </div>
              ))}
            {Object.keys(node.children).length > 8 && (
              <div className={`${styles.jvaSchemaRow} ${styles.jvaSchemaMore}`}>
                +{Object.keys(node.children).length - 8} more…
              </div>
            )}
          </div>
          <span className={styles.jvaSchemaBrace}>{"}"}</span>
        </div>
      );
    }

    if (node.type === "array") {
      return (
        <span>
          <span className={`${styles.jvaSchemaType} ${styles.jvaSchemaTypeArray}`}>array[{node.count}]</span>
          {node.items && node.items.type !== "unknown" && (
            <> of {renderSchema(node.items, depth + 1)}</>
          )}
        </span>
      );
    }

    const typeColors: Record<string, string> = {
      string: styles.jvaSchemaTypeString,
      number: styles.jvaSchemaTypeNumber,
      boolean: styles.jvaSchemaTypeBoolean,
      null: styles.jvaSchemaTypeNull,
      object: styles.jvaSchemaTypeObject,
      array: styles.jvaSchemaTypeArray,
    };

    return <span className={`${styles.jvaSchemaType} ${typeColors[node.type] || ""}`}>{node.type}</span>;
  };

  return (
    <>
      <div className={styles.jvaRoot}>
        <div className={styles.jvaCards}>
          <div className={styles.jvaCard}>
            <div
              className={styles.jvaCardIcon}
              style={{
                background: analysis.isValid ? "#dcfce7" : "#fef2f2",
                color: analysis.isValid ? "#16a34a" : "#dc2626",
              }}
            >
              <i className={`ti ${analysis.isValid ? "ti-circle-check" : "ti-circle-x"}`} />
            </div>
            <div className={styles.jvaCardBody}>
              <div className={styles.jvaCardLabel}>Status</div>
              <div className={styles.jvaCardValue}>{analysis.isValid ? "Valid" : "Invalid"}</div>
            </div>
          </div>

          <div className={styles.jvaCard}>
            <div className={styles.jvaCardIcon} style={{ background: "#eff6ff", color: "#2563eb" }}>
              <i className="ti ti-braces" />
            </div>
            <div className={styles.jvaCardBody}>
              <div className={styles.jvaCardLabel}>Root Type</div>
              <div className={styles.jvaCardValue} style={{ textTransform: "capitalize" }}>
                {analysis.rootType}
              </div>
            </div>
          </div>

          <div className={styles.jvaCard}>
            <div className={styles.jvaCardIcon} style={{ background: "#faf5ff", color: "#7c3aed" }}>
              <i className="ti ti-key" />
            </div>
            <div className={styles.jvaCardBody}>
              <div className={styles.jvaCardLabel}>Total Keys</div>
              <div className={styles.jvaCardValue}>{stats.keys.toLocaleString()}</div>
            </div>
          </div>

          <div className={styles.jvaCard}>
            <div className={styles.jvaCardIcon} style={{ background: "#fff7ed", color: "#ea580c" }}>
              <i className="ti ti-layers" />
            </div>
            <div className={styles.jvaCardBody}>
              <div className={styles.jvaCardLabel}>Max Depth</div>
              <div className={styles.jvaCardValue}>{stats.depth}</div>
            </div>
          </div>
        </div>

        <div className={styles.jvaSection}>
          <div className={styles.jvaSectionHeader}>
            <i className="ti ti-chart-bar" />
            <span>Size Analysis</span>
          </div>
          <div className={styles.jvaSizeRows}>
            <div className={styles.jvaSizeRow}>
              <span className={styles.jvaSizeLabel}>Original</span>
              <div className={styles.jvaSizeTrack}>
                <div className={`${styles.jvaSizeFill} ${styles.jvaSizeFillOrig}`} style={{ width: "100%" }} />
              </div>
              <span className={styles.jvaSizeVal}>{formatBytes(stats.original)}</span>
            </div>
            <div className={styles.jvaSizeRow}>
              <span className={styles.jvaSizeLabel}>Processed</span>
              <div className={styles.jvaSizeTrack}>
                <div
                  className={`${styles.jvaSizeFill} ${styles.jvaSizeFillProc}`}
                  style={{ width: `${Math.max(5, 100 - Math.abs(stats.savingsPercent))}%` }}
                />
              </div>
              <span className={styles.jvaSizeVal}>{formatBytes(stats.processed)}</span>
            </div>
            {stats.savings !== 0 && (
              <div className={styles.jvaSizeRow}>
                <span className={styles.jvaSizeLabel}>{stats.savings > 0 ? "Saved" : "Added"}</span>
                <div className={styles.jvaSizeTrack}>
                  <div
                    className={`${styles.jvaSizeFill} ${stats.savings > 0 ? styles.jvaSizeFillSave : styles.jvaSizeFillAdd}`}
                    style={{ width: `${Math.abs(stats.savingsPercent)}%` }}
                  />
                </div>
                <span className={`${styles.jvaSizeVal} ${stats.savings > 0 ? styles.good : styles.warn}`}>
                  {formatBytes(Math.abs(stats.savings))} ({Math.abs(stats.savingsPercent)}%)
                </span>
              </div>
            )}
          </div>

          <div className={styles.jvaMetaGrid}>
            <div className={styles.jvaMetaItem}>
              <span className={styles.jvaMetaLabel}>Objects</span>
              <span className={styles.jvaMetaValue}>{stats.objects}</span>
            </div>
            <div className={styles.jvaMetaItem}>
              <span className={styles.jvaMetaLabel}>Arrays</span>
              <span className={styles.jvaMetaValue}>{stats.arrays}</span>
            </div>
            <div className={styles.jvaMetaItem}>
              <span className={styles.jvaMetaLabel}>Strings</span>
              <span className={styles.jvaMetaValue}>{stats.strings}</span>
            </div>
            <div className={styles.jvaMetaItem}>
              <span className={styles.jvaMetaLabel}>Numbers</span>
              <span className={styles.jvaMetaValue}>{stats.numbers}</span>
            </div>
            <div className={styles.jvaMetaItem}>
              <span className={styles.jvaMetaLabel}>Booleans</span>
              <span className={styles.jvaMetaValue}>{stats.booleans}</span>
            </div>
            <div className={styles.jvaMetaItem}>
              <span className={styles.jvaMetaLabel}>Nulls</span>
              <span className={styles.jvaMetaValue}>{stats.nulls}</span>
            </div>
          </div>
        </div>

        {typeDistribution.length > 0 && (
          <div className={styles.jvaSection}>
            <div className={styles.jvaSectionHeader}>
              <i className="ti ti-chart-donut" />
              <span>Value Distribution</span>
            </div>
            <div className={styles.jvaDist}>
              <div className={styles.jvaDistBar}>
                {typeDistribution.map((t) => (
                  <div
                    key={t.label}
                    className={styles.jvaDistSegment}
                    style={{ width: `${t.pct}%`, background: t.color }}
                    title={`${t.label}: ${t.count} (${t.pct}%)`}
                  />
                ))}
              </div>
              <div className={styles.jvaDistLegend}>
                {typeDistribution.map((t) => (
                  <div key={t.label} className={styles.jvaDistItem}>
                    <span className={styles.jvaDistDot} style={{ background: t.color }} />
                    <span className={styles.jvaDistLabel}>{t.label}</span>
                    <span className={styles.jvaDistCount}>{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.jvaSection}>
          <div className={styles.jvaSectionHeader}>
            <i className="ti ti-info-circle" />
            <span>Structure Info</span>
          </div>
          <div className={styles.jvaFeatures}>
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
              <div key={f.label} className={`${styles.jvaFeature} ${f.active ? styles.on : styles.off}`}>
                <i className={`ti ${f.icon}`} />
                <span>{f.label}</span>
                <i className={`ti ${f.active ? "ti-check" : "ti-minus"} ${styles.jvaFeatureTick}`} />
              </div>
            ))}
            {analysis.deepestPath && (
              <div className={`${styles.jvaFeature} ${styles.on}`}>
                <i className="ti ti-route" />
                <span>
                  Deepest path: <code>{analysis.deepestPath}</code>
                </span>
              </div>
            )}
            {analysis.largestArray > 0 && (
              <div className={`${styles.jvaFeature} ${styles.on}`}>
                <i className="ti ti-list" />
                <span>
                  Largest array: <strong>{analysis.largestArray} items</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.jvaSection}>
          <div className={styles.jvaSectionHeader}>
            <i className="ti ti-hierarchy" />
            <span>Inferred Schema</span>
          </div>
          <div className={styles.jvaSchemaWrap}>{renderSchema(analysis.schema)}</div>
        </div>

        {issues.length > 0 && (
          <div className={styles.jvaSection}>
            <div className={styles.jvaSectionHeader}>
              <i className="ti ti-alert-circle" />
              <span>Issues</span>
              <div className={styles.jvaIssueCounts}>
                {issueSummary.errors > 0 && (
                  <span className={`${styles.jvaBadge} ${styles.jvaBadgeError}`}>
                    {issueSummary.errors} error{issueSummary.errors !== 1 ? "s" : ""}
                  </span>
                )}
                {issueSummary.warnings > 0 && (
                  <span className={`${styles.jvaBadge} ${styles.jvaBadgeWarning}`}>
                    {issueSummary.warnings} warning{issueSummary.warnings !== 1 ? "s" : ""}
                  </span>
                )}
                {issueSummary.infos > 0 && (
                  <span className={`${styles.jvaBadge} ${styles.jvaBadgeInfo}`}>{issueSummary.infos} info</span>
                )}
              </div>
            </div>
            <div className={styles.jvaIssues}>
              {issues.slice(0, 20).map((issue, idx) => (
                <div key={idx} className={`${styles.jvaIssue} ${styles[`jvaIssue${issue.type.charAt(0).toUpperCase()}${issue.type.slice(1)}`]}`}>
                  <div className={styles.jvaIssueIcon}>
                    <i
                      className={`ti ${issue.type === "error"
                        ? "ti-circle-x"
                        : issue.type === "warning"
                          ? "ti-alert-triangle"
                          : "ti-info-circle"
                        }`}
                    />
                  </div>
                  <div className={styles.jvaIssueBody}>
                    <div className={styles.jvaIssueMsg}>{issue.message}</div>
                    <div className={styles.jvaIssueMeta}>
                      {issue.path && <span>{issue.path}</span>}
                      {issue.rule && <code>{issue.rule}</code>}
                    </div>
                  </div>
                </div>
              ))}
              {issues.length > 20 && (
                <div className={styles.jvaIssuesMore}>+{issues.length - 20} more issues</div>
              )}
            </div>
          </div>
        )}

        {issues.length === 0 && (
          <div className={styles.jvaClean}>
            <div className={styles.jvaCleanIcon}>
              <i className="ti ti-circle-check" />
            </div>
            <h3 className={styles.jvaCleanTitle}>Clean JSON</h3>
            <p className={styles.jvaCleanDesc}>No issues detected — your JSON is well-structured.</p>
          </div>
        )}
      </div>
    </>
  );
}