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

      <style jsx>{`
        .vp-root {
          /* CRITICAL FIX: Proper container setup */
          width: 100%;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--bg-surface);
          /* Ensure proper scrolling on mobile */
          -webkit-overflow-scrolling: touch;
        }

        /* Summary */
        .vp-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .vp-summary-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0; /* Allow shrinking */
        }

        .vp-summary-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .vp-grade {
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-sans);
        }

        .vp-summary-content {
          flex: 1;
          min-width: 0; /* Allow text truncation */
        }

        .vp-summary-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .vp-summary-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .vp-grade-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
        }

        /* Section */
        .vp-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .vp-section-header {
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

        .vp-section-header i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* Stats Grid */
        .vp-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1px;
          background: var(--border);
        }

        .vp-stat-item {
          background: var(--bg-card);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vp-stat-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .vp-stat-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
          word-break: break-word;
        }

        /* Metadata Grid */
        .vp-metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1px;
          background: var(--border);
        }

        .vp-metadata-item {
          background: var(--bg-card);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vp-metadata-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .vp-metadata-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          font-family: var(--font-mono);
          word-break: break-word;
        }

        .vp-metadata-value--error {
          color: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .vp-metadata-value--error {
            color: #f87171;
          }
        }

        /* Issues */
        .vp-issues {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
        }

        .vp-issue {
          background: var(--bg-card);
          padding: 12px 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .vp-issue-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }

        .vp-issue--error .vp-issue-icon {
          background: #fef2f2;
          color: #dc2626;
        }

        .vp-issue--warning .vp-issue-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .vp-issue--security .vp-issue-icon {
          background: #fef3c7;
          color: #ea580c;
        }

        @media (prefers-color-scheme: dark) {
          .vp-issue--error .vp-issue-icon {
            background: #1f1517;
            color: #f87171;
          }
          .vp-issue--warning .vp-issue-icon {
            background: #451a03;
            color: #fbbf24;
          }
          .vp-issue--security .vp-issue-icon {
            background: #431407;
            color: #fb923c;
          }
        }

        .vp-issue-content {
          flex: 1;
          min-width: 0; /* Allow text wrapping */
        }

        .vp-issue-message {
          font-size: 13px;
          color: var(--text);
          line-height: 1.5;
          margin-bottom: 4px;
          word-wrap: break-word;
        }

        .vp-issue-meta {
          font-size: 11px;
          color: var(--text-tertiary);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .vp-issue-path {
          font-family: var(--font-mono);
          background: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 3px;
          word-break: break-all;
        }

        .vp-issue-type,
        .vp-issue-severity {
          font-size: 9px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 99px;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          flex-shrink: 0;
          align-self: flex-start;
          white-space: nowrap;
        }

        .vp-issue--critical .vp-issue-type,
        .vp-issue--critical .vp-issue-severity {
          background: #fef2f2;
          color: #dc2626;
        }

        .vp-issue--high .vp-issue-severity {
          background: #fef3c7;
          color: #d97706;
        }

        @media (prefers-color-scheme: dark) {
          .vp-issue--critical .vp-issue-type,
          .vp-issue--critical .vp-issue-severity {
            background: #1f1517;
            color: #f87171;
          }
          .vp-issue--high .vp-issue-severity {
            background: #451a03;
            color: #fbbf24;
          }
        }

        /* Suggestions */
        .vp-suggestions {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vp-suggestion {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .vp-suggestion i {
          font-size: 14px;
          color: var(--brand);
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Perfect State */
        .vp-perfect {
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

        .vp-perfect-icon {
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
          .vp-perfect-icon {
            background: #022c22;
            color: #4ade80;
          }
        }

        .vp-perfect-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .vp-perfect-desc {
          font-size: 14px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 400px;
          line-height: 1.6;
        }

        /* Tabs */
        .vp-tabs-wrapper {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
        }

        .vp-tab-bar {
          display: flex;
          border-bottom: 0.5px solid var(--border);
          padding: 0 14px;
          background: var(--bg-surface);
          flex-shrink: 0;
        }

        .vp-tab-button {
          flex: 1;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
        }

        .vp-tab-button.active {
          color: var(--text);
        }

        .vp-tab-button.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .vp-tab-button i {
          font-size: 14px;
        }

        .vp-tab-content {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 0 14px;
        }

        /* MOBILE OPTIMIZATIONS */
        @media (max-width: 768px) {
          .vp-root {
            padding: 12px;
            gap: 12px;
          }

          .vp-summary {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .vp-summary-card {
            padding: 12px;
          }

          .vp-summary-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .vp-grade {
            font-size: 18px;
          }

          .vp-summary-value {
            font-size: 15px;
          }

          .vp-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .vp-stat-item {
            padding: 10px 12px;
          }

          .vp-stat-value {
            font-size: 14px;
          }

          .vp-metadata-grid {
            grid-template-columns: 1fr;
          }

          .vp-metadata-item {
            padding: 10px 12px;
          }

          .vp-section-header {
            padding: 10px 12px;
            font-size: 11px;
          }

          .vp-issue {
            padding: 10px 12px;
            gap: 8px;
          }

          .vp-issue-icon {
            width: 20px;
            height: 20px;
            font-size: 11px;
          }

          .vp-issue-message {
            font-size: 12px;
          }

          .vp-issue-meta {
            font-size: 10px;
          }

          .vp-issue-type,
          .vp-issue-severity {
            font-size: 8px;
            padding: 3px 6px;
          }

          .vp-suggestions {
            padding: 10px 12px;
          }

          .vp-suggestion {
            font-size: 12px;
          }

          .vp-perfect {
            padding: 32px 20px;
          }

          .vp-perfect-icon {
            width: 48px;
            height: 48px;
            font-size: 24px;
          }

          .vp-perfect-title {
            font-size: 16px;
          }

          .vp-perfect-desc {
            font-size: 13px;
          }

          .vp-tab-bar {
            padding: 0 10px;
          }

          .vp-tab-button {
            height: 36px;
            font-size: 11px;
          }

          .vp-tab-button i {
            font-size: 12px;
          }

          .vp-tab-content {
            padding: 0 10px;
          }
        }
      `}</style>
    </>
  );
}
