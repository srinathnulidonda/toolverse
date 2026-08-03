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
    const highPriorityWarnings = validation.warnings.filter((w) => w.severity === "high").length;

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
            <div
              className="hv-summary-icon"
              style={{
                background: validation.isValid ? "#dcfce7" : "#fef2f2",
                color: validation.isValid ? "#16a34a" : "#dc2626",
              }}
            >
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
            <div
              className="hv-summary-icon"
              style={{
                background: accessibilityGrade.color + "20",
                color: accessibilityGrade.color,
              }}
            >
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
            <div
              className="hv-summary-icon"
              style={{
                background: metadata.hasSemanticHTML ? "#dcfce7" : "#fef3c7",
                color: metadata.hasSemanticHTML ? "#16a34a" : "#d97706",
              }}
            >
              <i className="ti ti-code" />
            </div>
            <div className="hv-summary-content">
              <div className="hv-summary-label">Semantic HTML</div>
              <div className="hv-summary-value">{metadata.hasSemanticHTML ? "Yes" : "No"}</div>
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
              <span className="hv-metadata-value">{metadata.language || "Not specified"}</span>
            </div>
            <div className="hv-metadata-item">
              <span className="hv-metadata-label">Charset</span>
              <span className="hv-metadata-value">{metadata.charset || "Not specified"}</span>
            </div>
            <div className="hv-metadata-item">
              <span className="hv-metadata-label">Title</span>
              <span className="hv-metadata-value">{metadata.title || "Not specified"}</span>
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
                <div
                  key={idx}
                  className={`hv-issue hv-issue--warning hv-issue--${warning.severity}`}
                >
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
    </>
  );
}
