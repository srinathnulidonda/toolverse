// features/dev/json-validator/ValidationPanel.tsx
"use client";

import { useMemo, useState } from "react";
import type { ValidationResult } from "./validatorEngine";
import { formatBytes } from "./validatorEngine";

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
          <div className="vp-section">
            <div className="vp-section-header">
              <i className="ti ti-chart-bar" />
              <span>JSON Statistics</span>
            </div>
            <div className="vp-stats-grid">
              <div className="vp-stat-item">
                <span className="vp-stat-label">File Size</span>
                <span className="vp-stat-value">{formatBytes(result.stats.size)}</span>
              </div>
              <div className="vp-stat-item">
                <span className="vp-stat-label">Lines</span>
                <span className="vp-stat-value">{result.stats.lines.toLocaleString()}</span>
              </div>
              <div className="vp-stat-item">
                <span className="vp-stat-label">Max Depth</span>
                <span className="vp-stat-value">{result.stats.depth}</span>
              </div>
              <div className="vp-stat-item">
                <span className="vp-stat-label">Total Keys</span>
                <span className="vp-stat-value">{result.stats.keys.toLocaleString()}</span>
              </div>
              <div className="vp-stat-item">
                <span className="vp-stat-label">Objects</span>
                <span className="vp-stat-value">{result.stats.objects}</span>
              </div>
              <div className="vp-stat-item">
                <span className="vp-stat-label">Arrays</span>
                <span className="vp-stat-value">{result.stats.arrays}</span>
              </div>
              <div className="vp-stat-item">
                <span className="vp-stat-label">Strings</span>
                <span className="vp-stat-value">{result.stats.strings}</span>
              </div>
              <div className="vp-stat-item">
                <span className="vp-stat-label">Numbers</span>
                <span className="vp-stat-value">{result.stats.numbers}</span>
              </div>
            </div>
          </div>
        );
      case "metadata":
        return (
          <div className="vp-section">
            <div className="vp-section-header">
              <i className="ti ti-info-circle" />
              <span>Document Metadata</span>
            </div>
            <div className="vp-metadata-grid">
              <div className="vp-metadata-item">
                <span className="vp-metadata-label">Top-Level Type</span>
                <span className="vp-metadata-value">{result.metadata.topLevelType}</span>
              </div>
              <div className="vp-metadata-item">
                <span className="vp-metadata-label">Encoding</span>
                <span className="vp-metadata-value">{result.metadata.encoding}</span>
              </div>
              <div className="vp-metadata-item">
                <span className="vp-metadata-label">Line Endings</span>
                <span className="vp-metadata-value">{result.metadata.lineEndings}</span>
              </div>
              <div className="vp-metadata-item">
                <span className="vp-metadata-label">Indent Style</span>
                <span className="vp-metadata-value">
                  {result.metadata.indentStyle}
                  {result.metadata.indentSize && ` (${result.metadata.indentSize})`}
                </span>
              </div>
              {result.stats.duplicateKeys > 0 && (
                <div className="vp-metadata-item">
                  <span className="vp-metadata-label">Duplicate Keys</span>
                  <span className="vp-metadata-value vp-metadata-value--error">
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
              <div className="vp-section">
                <div className="vp-section-header">
                  <i className="ti ti-alert-circle" />
                  <span>Errors ({result.errors.length})</span>
                </div>
                <div className="vp-issues">
                  {result.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className={`vp-issue vp-issue--error vp-issue--${error.severity}`}
                    >
                      <div className="vp-issue-icon">
                        <i className="ti ti-x" />
                      </div>
                      <div className="vp-issue-content">
                        <div className="vp-issue-message">{error.message}</div>
                        <div className="vp-issue-meta">
                          {error.line && (
                            <span>
                              Line {error.line}
                              {error.column && `, Column ${error.column}`}
                            </span>
                          )}
                          {error.path && <span className="vp-issue-path">{error.path}</span>}
                        </div>
                      </div>
                      <div className="vp-issue-type">{error.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.securityIssues.length > 0 && (
              <div className="vp-section">
                <div className="vp-section-header">
                  <i className="ti ti-shield-exclamation" />
                  <span>Security Issues ({result.securityIssues.length})</span>
                </div>
                <div className="vp-issues">
                  {result.securityIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`vp-issue vp-issue--security vp-issue--${issue.severity}`}
                    >
                      <div className="vp-issue-icon">
                        <i className="ti ti-shield-x" />
                      </div>
                      <div className="vp-issue-content">
                        <div className="vp-issue-message">{issue.message}</div>
                        {issue.path && (
                          <div className="vp-issue-meta">
                            <span className="vp-issue-path">{issue.path}</span>
                          </div>
                        )}
                      </div>
                      <div className="vp-issue-severity">{issue.severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.warnings.length > 0 && (
              <div className="vp-section">
                <div className="vp-section-header">
                  <i className="ti ti-alert-triangle" />
                  <span>Warnings ({result.warnings.length})</span>
                </div>
                <div className="vp-issues">
                  {result.warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className={`vp-issue vp-issue--warning vp-issue--${warning.severity}`}
                    >
                      <div className="vp-issue-icon">
                        <i className="ti ti-alert-triangle" />
                      </div>
                      <div className="vp-issue-content">
                        <div className="vp-issue-message">{warning.message}</div>
                        {warning.path && (
                          <div className="vp-issue-meta">
                            <span className="vp-issue-path">{warning.path}</span>
                          </div>
                        )}
                      </div>
                      <div className="vp-issue-severity">{warning.severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      case "suggestions":
        return (
          <div className="vp-section">
            <div className="vp-section-header">
              <i className="ti ti-bulb" />
              <span>Suggestions</span>
            </div>
            <div className="vp-suggestions">
              {result.suggestions.map((suggestion, idx) => (
                <div key={idx} className="vp-suggestion">
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
      <div className="vp-root">
        {/* Summary Cards */}
        <div className="vp-summary">
          <div className="vp-summary-card">
            <div
              className="vp-summary-icon"
              style={{
                background: result.valid ? "#dcfce7" : "#fef2f2",
                color: result.valid ? "#16a34a" : "#dc2626",
              }}
            >
              <i className={`ti ${result.valid ? "ti-circle-check" : "ti-alert-circle"}`} />
            </div>
            <div className="vp-summary-content">
              <div className="vp-summary-label">Validation Status</div>
              <div className="vp-summary-value">{result.valid ? "Valid" : "Invalid"}</div>
            </div>
          </div>

          <div className="vp-summary-card">
            <div
              className="vp-summary-icon"
              style={{
                background: scoreGrade.color + "20",
                color: scoreGrade.color,
              }}
            >
              <span className="vp-grade">{scoreGrade.grade}</span>
            </div>
            <div className="vp-summary-content">
              <div className="vp-summary-label">Quality Score</div>
              <div className="vp-summary-value">
                {qualityScore}/100
                <span className="vp-grade-label">{scoreGrade.label}</span>
              </div>
            </div>
          </div>

          <div className="vp-summary-card">
            <div
              className="vp-summary-icon"
              style={{
                background: summary.totalIssues === 0 ? "#dcfce7" : "#fef3c7",
                color: summary.totalIssues === 0 ? "#16a34a" : "#d97706",
              }}
            >
              <i className="ti ti-list-check" />
            </div>
            <div className="vp-summary-content">
              <div className="vp-summary-label">Total Issues</div>
              <div className="vp-summary-value">{summary.totalIssues}</div>
            </div>
          </div>
        </div>

        {!isPerfect ? (
          <div className="vp-tabs-wrapper">
            <div className="vp-tab-bar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`vp-tab-button${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="vp-tab-content">{renderTabContent()}</div>
          </div>
        ) : (
          <div className="vp-perfect">
            <div className="vp-perfect-icon">
              <i className="ti ti-circle-check" />
            </div>
            <h3 className="vp-perfect-title">Perfect JSON!</h3>
            <p className="vp-perfect-desc">
              Your JSON is valid, secure, and follows all best practices.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
