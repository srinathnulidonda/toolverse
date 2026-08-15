// features/dev/js-minifier/JSAnalysis.tsx
"use client";

import { useMemo } from "react";
import type { CodeAnalysis, CodeIssue, JSStats } from "./ts/jsEngine";
import { formatBytes } from "./ts/jsEngine";
import styles from "./style/JSAnalysis.module.css";

interface JSAnalysisProps {
  analysis: CodeAnalysis;
  issues: CodeIssue[];
  stats: JSStats;
}

export default function JSAnalysis({ analysis, issues, stats }: JSAnalysisProps) {
  const issueSummary = useMemo(
    () => ({
      errors: issues.filter((i) => i.type === "error").length,
      warnings: issues.filter((i) => i.type === "warning").length,
      infos: issues.filter((i) => i.type === "info").length,
    }),
    [issues]
  );

  const features = useMemo(
    () => [
      { label: "ES Modules", active: analysis.hasESModules, icon: "ti-package" },
      { label: "CommonJS", active: analysis.hasCommonJS, icon: "ti-box" },
      { label: "Async / Await", active: analysis.hasAsyncAwait, icon: "ti-clock" },
      { label: "Arrow Functions", active: analysis.hasArrowFunctions, icon: "ti-arrow-right" },
      { label: "Classes", active: analysis.hasClasses, icon: "ti-hierarchy" },
      { label: "Destructuring", active: analysis.hasDestructuring, icon: "ti-layout-list" },
      { label: "Template Literals", active: analysis.hasTemplateLiterals, icon: "ti-template" },
      { label: "Optional Chaining", active: analysis.hasOptionalChaining, icon: "ti-link" },
    ],
    [analysis]
  );

  const complexityConfig = {
    low: { color: "#16a34a", bg: "#dcfce7", label: "Low", icon: "ti-circle-check" },
    medium: { color: "#d97706", bg: "#fef3c7", label: "Medium", icon: "ti-alert-circle" },
    high: { color: "#dc2626", bg: "#fef2f2", label: "High", icon: "ti-alert-triangle" },
  } as const;

  const cx = complexityConfig[analysis.complexity];

  const issueTypeClass = (type: CodeIssue["type"]) => {
    if (type === "error") return styles.jaIssueError;
    if (type === "warning") return styles.jaIssueWarning;
    return styles.jaIssueInfo;
  };

  const issueIcon = (type: CodeIssue["type"]) => {
    if (type === "error") return "ti-circle-x";
    if (type === "warning") return "ti-alert-triangle";
    return "ti-info-circle";
  };

  return (
    <div className={styles.jaRoot}>
      <div className={styles.jaCards}>
        <div className={styles.jaCard}>
          <div
            className={styles.jaCardIcon}
            style={{
              background: analysis.syntaxValid ? "#dcfce7" : "#fef2f2",
              color: analysis.syntaxValid ? "#16a34a" : "#dc2626",
            }}
          >
            <i className={`ti ${analysis.syntaxValid ? "ti-circle-check" : "ti-circle-x"}`} />
          </div>
          <div className={styles.jaCardBody}>
            <div className={styles.jaCardLabel}>Syntax</div>
            <div className={styles.jaCardValue}>{analysis.syntaxValid ? "Valid" : "Errors"}</div>
          </div>
        </div>

        <div className={styles.jaCard}>
          <div className={styles.jaCardIcon} style={{ background: cx.bg, color: cx.color }}>
            <i className={`ti ${cx.icon}`} />
          </div>
          <div className={styles.jaCardBody}>
            <div className={styles.jaCardLabel}>Complexity</div>
            <div className={styles.jaCardValue}>{cx.label}</div>
          </div>
        </div>

        <div className={styles.jaCard}>
          <div className={styles.jaCardIcon} style={{ background: "#eff6ff", color: "#2563eb" }}>
            <i className="ti ti-function" />
          </div>
          <div className={styles.jaCardBody}>
            <div className={styles.jaCardLabel}>Functions</div>
            <div className={styles.jaCardValue}>{stats.functions.toLocaleString()}</div>
          </div>
        </div>

        <div className={styles.jaCard}>
          <div className={styles.jaCardIcon} style={{ background: "#faf5ff", color: "#7c3aed" }}>
            <i className="ti ti-variable" />
          </div>
          <div className={styles.jaCardBody}>
            <div className={styles.jaCardLabel}>Variables</div>
            <div className={styles.jaCardValue}>{stats.variables.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className={styles.jaSection}>
        <div className={styles.jaSectionHeader}>
          <i className="ti ti-chart-bar" />
          <span>Size Analysis</span>
        </div>
        <div className={styles.jaSizeChart}>
          <div className={styles.jaSizeRow}>
            <span className={styles.jaSizeLabel}>Original</span>
            <div className={styles.jaSizeBarWrap}>
              <div
                className={`${styles.jaSizeBar} ${styles.jaSizeBarOriginal}`}
                style={{ width: "100%" }}
              />
            </div>
            <span className={styles.jaSizeValue}>{formatBytes(stats.original)}</span>
          </div>
          <div className={styles.jaSizeRow}>
            <span className={styles.jaSizeLabel}>Minified</span>
            <div className={styles.jaSizeBarWrap}>
              <div
                className={`${styles.jaSizeBar} ${styles.jaSizeBarMinified}`}
                style={{
                  width: `${Math.max(1, 100 - stats.savingsPercent)}%`,
                }}
              />
            </div>
            <span className={styles.jaSizeValue}>{formatBytes(stats.minified)}</span>
          </div>
          <div className={styles.jaSizeRow}>
            <span className={styles.jaSizeLabel}>Saved</span>
            <div className={styles.jaSizeBarWrap}>
              <div
                className={`${styles.jaSizeBar} ${styles.jaSizeBarSaved}`}
                style={{ width: `${Math.max(0, stats.savingsPercent)}%` }}
              />
            </div>
            <span className={`${styles.jaSizeValue} ${styles.jaSizeValueGood}`}>
              {formatBytes(stats.savings)} ({stats.savingsPercent}%)
            </span>
          </div>
        </div>

        <div className={styles.jaMetaGrid}>
          <div className={styles.jaMetaItem}>
            <span className={styles.jaMetaLabel}>Lines (before)</span>
            <span className={styles.jaMetaValue}>{stats.originalLines.toLocaleString()}</span>
          </div>
          <div className={styles.jaMetaItem}>
            <span className={styles.jaMetaLabel}>Lines (after)</span>
            <span className={styles.jaMetaValue}>{stats.minifiedLines.toLocaleString()}</span>
          </div>
          <div className={styles.jaMetaItem}>
            <span className={styles.jaMetaLabel}>Comments</span>
            <span className={styles.jaMetaValue}>{stats.comments.toLocaleString()}</span>
          </div>
          <div className={styles.jaMetaItem}>
            <span className={styles.jaMetaLabel}>Strings</span>
            <span className={styles.jaMetaValue}>{stats.strings.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.jaSection}>
        <div className={styles.jaSectionHeader}>
          <i className="ti ti-sparkles" />
          <span>Detected Features</span>
        </div>
        <div className={styles.jaFeatures}>
          {features.map((f) => (
            <div
              key={f.label}
              className={`${styles.jaFeature} ${f.active ? styles.jaFeatureOn : styles.jaFeatureOff}`}
            >
              <i className={`ti ${f.icon}`} />
              <span>{f.label}</span>
              {f.active ? (
                <i className={`ti ti-check ${styles.jaFeatureCheck}`} />
              ) : (
                <i className={`ti ti-minus ${styles.jaFeatureOffIcon}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {issues.length > 0 ? (
        <div className={styles.jaSection}>
          <div className={styles.jaSectionHeader}>
            <i className="ti ti-bug" />
            <span>Code Issues</span>
            <div className={styles.jaIssueCounts}>
              {issueSummary.errors > 0 && (
                <span className={`${styles.jaIssueBadge} ${styles.jaIssueBadgeError}`}>
                  {issueSummary.errors} error{issueSummary.errors !== 1 ? "s" : ""}
                </span>
              )}
              {issueSummary.warnings > 0 && (
                <span className={`${styles.jaIssueBadge} ${styles.jaIssueBadgeWarning}`}>
                  {issueSummary.warnings} warning{issueSummary.warnings !== 1 ? "s" : ""}
                </span>
              )}
              {issueSummary.infos > 0 && (
                <span className={`${styles.jaIssueBadge} ${styles.jaIssueBadgeInfo}`}>
                  {issueSummary.infos} info
                </span>
              )}
            </div>
          </div>
          <div className={styles.jaIssues}>
            {issues.map((issue, idx) => (
              <div
                key={`${issue.rule ?? "issue"}-${idx}`}
                className={`${styles.jaIssue} ${issueTypeClass(issue.type)}`}
              >
                <div className={styles.jaIssueIcon}>
                  <i className={`ti ${issueIcon(issue.type)}`} />
                </div>
                <div className={styles.jaIssueBody}>
                  <div className={styles.jaIssueMsg}>{issue.message}</div>
                  {(issue.line != null || issue.rule) && (
                    <div className={styles.jaIssueMeta}>
                      {issue.line != null && <span>Line {issue.line}</span>}
                      {issue.rule && <code>{issue.rule}</code>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.jaClean}>
          <div className={styles.jaCleanIcon}>
            <i className="ti ti-circle-check" />
          </div>
          <h3 className={styles.jaCleanTitle}>No Issues Found</h3>
          <p className={styles.jaCleanDesc}>Your code looks clean and production-ready.</p>
        </div>
      )}
    </div>
  );
}