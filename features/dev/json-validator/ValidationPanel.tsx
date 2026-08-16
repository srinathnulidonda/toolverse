// features/dev/json-validator/ValidationPanel.tsx
"use client";

import { useMemo, useState } from "react";
import type { ValidationResult } from "./ts/validatorEngine";
import { formatBytes } from "./ts/validatorEngine";
import styles from "./style/ValidationPanel.module.css";

interface ValidationPanelProps {
  result: ValidationResult;
}

export default function ValidationPanel({ result }: ValidationPanelProps) {
  const summary = useMemo(() => {
    const totalIssues =
      result.errors.length + result.warnings.length + result.securityIssues.length;
    const criticalCount = result.errors.filter((e) => e.severity === "critical").length;
    const highPriorityWarnings = result.warnings.filter((w) => w.severity === "high").length;

    return {
      totalIssues,
      criticalCount,
      highPriorityWarnings,
      hasIssues: totalIssues > 0,
    };
  }, [result]);

  const qualityScore = useMemo(() => {
    let score = 100;

    // Deduct for errors
    score -= result.errors.length * 15;
    result.errors.forEach((err) => {
      if (err.severity === "critical") score -= 10;
    });

    // Deduct for warnings
    result.warnings.forEach((warning) => {
      if (warning.severity === "high") score -= 5;
      else if (warning.severity === "medium") score -= 3;
      else score -= 1;
    });

    // Deduct for security issues
    result.securityIssues.forEach((issue) => {
      if (issue.severity === "critical") score -= 20;
      else if (issue.severity === "high") score -= 10;
      else if (issue.severity === "medium") score -= 5;
      else score -= 2;
    });

    return Math.max(0, Math.min(100, score));
  }, [result]);

  const scoreGrade = useMemo(() => {
    if (qualityScore >= 90) return { grade: "A", color: "#16a34a", label: "Excellent" };
    if (qualityScore >= 75) return { grade: "B", color: "#84cc16", label: "Good" };
    if (qualityScore >= 60) return { grade: "C", color: "#eab308", label: "Fair" };
    if (qualityScore >= 40) return { grade: "D", color: "#f97316", label: "Poor" };
    return { grade: "F", color: "#ef4444", label: "Critical" };
  }, [qualityScore]);

  const [activeTab, setActiveTab] = useState<"stats" | "metadata" | "issues" | "suggestions">(
    "stats"
  );
  const isPerfect = result.valid && summary.totalIssues === 0;

  const tabs = [
    { id: "stats" as const, label: "Stats", icon: "ti-chart-bar" },
    { id: "metadata" as const, label: "Metadata", icon: "ti-info-circle" },
    { id: "issues" as const, label: "Issues", icon: "ti-alert-circle" },
    { id: "suggestions" as const, label: "Suggestions", icon: "ti-bulb" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "stats":
        return (
          <div className={styles.vpSection}>
            <div className={styles.vpSectionHeader}>
              <i className="ti ti-chart-bar" />
              <span>JSON Statistics</span>
            </div>
            <div className={styles.vpStatsGrid}>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>File Size</span>
                <span className={styles.vpStatValue}>{formatBytes(result.stats.size)}</span>
              </div>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>Lines</span>
                <span className={styles.vpStatValue}>{result.stats.lines.toLocaleString()}</span>
              </div>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>Max Depth</span>
                <span className={styles.vpStatValue}>{result.stats.depth}</span>
              </div>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>Total Keys</span>
                <span className={styles.vpStatValue}>{result.stats.keys.toLocaleString()}</span>
              </div>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>Objects</span>
                <span className={styles.vpStatValue}>{result.stats.objects}</span>
              </div>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>Arrays</span>
                <span className={styles.vpStatValue}>{result.stats.arrays}</span>
              </div>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>Strings</span>
                <span className={styles.vpStatValue}>{result.stats.strings}</span>
              </div>
              <div className={styles.vpStatItem}>
                <span className={styles.vpStatLabel}>Numbers</span>
                <span className={styles.vpStatValue}>{result.stats.numbers}</span>
              </div>
            </div>
          </div>
        );
      case "metadata":
        return (
          <div className={styles.vpSection}>
            <div className={styles.vpSectionHeader}>
              <i className="ti ti-info-circle" />
              <span>Document Metadata</span>
            </div>
            <div className={styles.vpMetadataGrid}>
              <div className={styles.vpMetadataItem}>
                <span className={styles.vpMetadataLabel}>Top-Level Type</span>
                <span className={styles.vpMetadataValue}>{result.metadata.topLevelType}</span>
              </div>
              <div className={styles.vpMetadataItem}>
                <span className={styles.vpMetadataLabel}>Encoding</span>
                <span className={styles.vpMetadataValue}>{result.metadata.encoding}</span>
              </div>
              <div className={styles.vpMetadataItem}>
                <span className={styles.vpMetadataLabel}>Line Endings</span>
                <span className={styles.vpMetadataValue}>{result.metadata.lineEndings}</span>
              </div>
              <div className={styles.vpMetadataItem}>
                <span className={styles.vpMetadataLabel}>Indent Style</span>
                <span className={styles.vpMetadataValue}>
                  {result.metadata.indentStyle}
                  {result.metadata.indentSize && ` (${result.metadata.indentSize})`}
                </span>
              </div>
              {result.stats.duplicateKeys > 0 && (
                <div className={styles.vpMetadataItem}>
                  <span className={styles.vpMetadataLabel}>Duplicate Keys</span>
                  <span className={`${styles.vpMetadataValue} ${styles.vpMetadataValueError}`}>
                    {result.stats.duplicateKeys}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      case "issues":
        return (
          <>
            {result.errors.length > 0 && (
              <div className={styles.vpSection}>
                <div className={styles.vpSectionHeader}>
                  <i className="ti ti-alert-circle" />
                  <span>Errors ({result.errors.length})</span>
                </div>
                <div className={styles.vpIssues}>
                  {result.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className={`${styles.vpIssue} ${styles.vpIssueError} ${styles[`vpIssue${error.severity.charAt(0).toUpperCase()}${error.severity.slice(1)}`]}`}
                    >
                      <div className={styles.vpIssueIcon}>
                        <i className="ti ti-x" />
                      </div>
                      <div className={styles.vpIssueContent}>
                        <div className={styles.vpIssueMessage}>{error.message}</div>
                        <div className={styles.vpIssueMeta}>
                          {error.line && (
                            <span>
                              Line {error.line}
                              {error.column && `, Column ${error.column}`}
                            </span>
                          )}
                          {error.path && <span className={styles.vpIssuePath}>{error.path}</span>}
                        </div>
                      </div>
                      <div className={styles.vpIssueType}>{error.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.securityIssues.length > 0 && (
              <div className={styles.vpSection}>
                <div className={styles.vpSectionHeader}>
                  <i className="ti ti-shield-exclamation" />
                  <span>Security Issues ({result.securityIssues.length})</span>
                </div>
                <div className={styles.vpIssues}>
                  {result.securityIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`${styles.vpIssue} ${styles.vpIssueSecurity} ${styles[`vpIssue${issue.severity.charAt(0).toUpperCase()}${issue.severity.slice(1)}`]}`}
                    >
                      <div className={styles.vpIssueIcon}>
                        <i className="ti ti-shield-x" />
                      </div>
                      <div className={styles.vpIssueContent}>
                        <div className={styles.vpIssueMessage}>{issue.message}</div>
                        {issue.path && (
                          <div className={styles.vpIssueMeta}>
                            <span className={styles.vpIssuePath}>{issue.path}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.vpIssueSeverity}>{issue.severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.warnings.length > 0 && (
              <div className={styles.vpSection}>
                <div className={styles.vpSectionHeader}>
                  <i className="ti ti-alert-triangle" />
                  <span>Warnings ({result.warnings.length})</span>
                </div>
                <div className={styles.vpIssues}>
                  {result.warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className={`${styles.vpIssue} ${styles.vpIssueWarning} ${styles[`vpIssue${warning.severity.charAt(0).toUpperCase()}${warning.severity.slice(1)}`]}`}
                    >
                      <div className={styles.vpIssueIcon}>
                        <i className="ti ti-alert-triangle" />
                      </div>
                      <div className={styles.vpIssueContent}>
                        <div className={styles.vpIssueMessage}>{warning.message}</div>
                        {warning.path && (
                          <div className={styles.vpIssueMeta}>
                            <span className={styles.vpIssuePath}>{warning.path}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.vpIssueSeverity}>{warning.severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      case "suggestions":
        return (
          <div className={styles.vpSection}>
            <div className={styles.vpSectionHeader}>
              <i className="ti ti-bulb" />
              <span>Suggestions</span>
            </div>
            <div className={styles.vpSuggestions}>
              {result.suggestions.map((suggestion, idx) => (
                <div key={idx} className={styles.vpSuggestion}>
                  <i className="ti ti-arrow-right" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.vpRoot}>
        {/* Summary Cards */}
        <div className={styles.vpSummary}>
          <div className={styles.vpSummaryCard}>
            <div
              className={styles.vpSummaryIcon}
              style={{
                background: result.valid ? "#dcfce7" : "#fef2f2",
                color: result.valid ? "#16a34a" : "#dc2626",
              }}
            >
              <i className={`ti ${result.valid ? "ti-circle-check" : "ti-alert-circle"}`} />
            </div>
            <div className={styles.vpSummaryContent}>
              <div className={styles.vpSummaryLabel}>Validation Status</div>
              <div className={styles.vpSummaryValue}>{result.valid ? "Valid" : "Invalid"}</div>
            </div>
          </div>

          <div className={styles.vpSummaryCard}>
            <div
              className={styles.vpSummaryIcon}
              style={{
                background: scoreGrade.color + "20",
                color: scoreGrade.color,
              }}
            >
              <span className={styles.vpGrade}>{scoreGrade.grade}</span>
            </div>
            <div className={styles.vpSummaryContent}>
              <div className={styles.vpSummaryLabel}>Quality Score</div>
              <div className={styles.vpSummaryValue}>
                {qualityScore}/100
                <span className={styles.vpGradeLabel}>{scoreGrade.label}</span>
              </div>
            </div>
          </div>

          <div className={styles.vpSummaryCard}>
            <div
              className={styles.vpSummaryIcon}
              style={{
                background: summary.totalIssues === 0 ? "#dcfce7" : "#fef3c7",
                color: summary.totalIssues === 0 ? "#16a34a" : "#d97706",
              }}
            >
              <i className="ti ti-list-check" />
            </div>
            <div className={styles.vpSummaryContent}>
              <div className={styles.vpSummaryLabel}>Total Issues</div>
              <div className={styles.vpSummaryValue}>{summary.totalIssues}</div>
            </div>
          </div>
        </div>

        {!isPerfect ? (
          <div className={styles.vpTabsWrapper}>
            <div className={styles.vpTabBar}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.vpTabButton}${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.vpTabContent}>{renderTabContent()}</div>
          </div>
        ) : (
          <div className={styles.vpPerfect}>
            <div className={styles.vpPerfectIcon}>
              <i className="ti ti-circle-check" />
            </div>
            <h3 className={styles.vpPerfectTitle}>Perfect JSON!</h3>
            <p className={styles.vpPerfectDesc}>
              Your JSON is valid, secure, and follows all best practices.
            </p>
          </div>
        )}
      </div>
    </>
  );
}