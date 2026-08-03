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
  };

  const cx = complexityConfig[analysis.complexity];

  return (
    <>
      <div className="ja-root">
        {/* Summary Cards */}
        <div className="ja-cards">
          <div className="ja-card">
            <div
              className="ja-card-icon"
              style={{
                background: analysis.syntaxValid ? "#dcfce7" : "#fef2f2",
                color: analysis.syntaxValid ? "#16a34a" : "#dc2626",
              }}
            >
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
            {features.map((f) => (
              <div
                key={f.label}
                className={`ja-feature ${f.active ? "ja-feature--on" : "ja-feature--off"}`}
              >
                <i className={`ti ${f.icon}`} />
                <span>{f.label}</span>
                {f.active ? (
                  <i className="ti ti-check ja-feature-check" />
                ) : (
                  <i className="ti ti-minus ja-feature-off-icon" />
                )}
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
                    <i
                      className={`ti ${issue.type === "error"
                          ? "ti-circle-x"
                          : issue.type === "warning"
                            ? "ti-alert-triangle"
                            : "ti-info-circle"
                        }`}
                    />
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
    </>
  );
}
