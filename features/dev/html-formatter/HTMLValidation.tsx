// features/dev/html-formatter/HTMLValidation.tsx
"use client";

import { useMemo } from "react";
import type { ValidationResult, HTMLMetadata } from "./ts/htmlEngine";
import styles from "./style/HTMLValidation.module.css";

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
      <div className={styles.hvRoot}>
        {/* Validation Summary */}
        <div className={styles.hvSummary}>
          <div className={styles.hvSummaryCard}>
            <div
              className={styles.hvSummaryIcon}
              style={{
                background: validation.isValid ? "#dcfce7" : "#fef2f2",
                color: validation.isValid ? "#16a34a" : "#dc2626",
              }}
            >
              <i className={`ti ${validation.isValid ? "ti-circle-check" : "ti-alert-circle"}`} />
            </div>
            <div className={styles.hvSummaryContent}>
              <div className={styles.hvSummaryLabel}>Validation Status</div>
              <div className={styles.hvSummaryValue}>
                {validation.isValid ? "Valid" : `${validationSummary.totalIssues} Issues`}
              </div>
            </div>
          </div>

          <div className={styles.hvSummaryCard}>
            <div
              className={styles.hvSummaryIcon}
              style={{
                background: accessibilityGrade.color + "20",
                color: accessibilityGrade.color,
              }}
            >
              <span className={styles.hvGrade}>{accessibilityGrade.grade}</span>
            </div>
            <div className={styles.hvSummaryContent}>
              <div className={styles.hvSummaryLabel}>Accessibility Score</div>
              <div className={styles.hvSummaryValue}>
                {metadata.accessibilityScore}/100
                <span className={styles.hvGradeLabel}>{accessibilityGrade.label}</span>
              </div>
            </div>
          </div>

          <div className={styles.hvSummaryCard}>
            <div
              className={styles.hvSummaryIcon}
              style={{
                background: metadata.hasSemanticHTML ? "#dcfce7" : "#fef3c7",
                color: metadata.hasSemanticHTML ? "#16a34a" : "#d97706",
              }}
            >
              <i className="ti ti-code" />
            </div>
            <div className={styles.hvSummaryContent}>
              <div className={styles.hvSummaryLabel}>Semantic HTML</div>
              <div className={styles.hvSummaryValue}>{metadata.hasSemanticHTML ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className={styles.hvSection}>
          <div className={styles.hvSectionHeader}>
            <i className="ti ti-info-circle" />
            <span>Document Metadata</span>
          </div>
          <div className={styles.hvMetadataGrid}>
            <div className={styles.hvMetadataItem}>
              <span className={styles.hvMetadataLabel}>DOCTYPE</span>
              <span className={styles.hvMetadataValue}>
                {metadata.doctype ? "✓ Present" : "✗ Missing"}
              </span>
            </div>
            <div className={styles.hvMetadataItem}>
              <span className={styles.hvMetadataLabel}>Language</span>
              <span className={styles.hvMetadataValue}>{metadata.language || "Not specified"}</span>
            </div>
            <div className={styles.hvMetadataItem}>
              <span className={styles.hvMetadataLabel}>Charset</span>
              <span className={styles.hvMetadataValue}>{metadata.charset || "Not specified"}</span>
            </div>
            <div className={styles.hvMetadataItem}>
              <span className={styles.hvMetadataLabel}>Title</span>
              <span className={styles.hvMetadataValue}>{metadata.title || "Not specified"}</span>
            </div>
            <div className={styles.hvMetadataItem}>
              <span className={styles.hvMetadataLabel}>Meta Tags</span>
              <span className={styles.hvMetadataValue}>{metadata.metaTags}</span>
            </div>
            <div className={styles.hvMetadataItem}>
              <span className={styles.hvMetadataLabel}>Scripts</span>
              <span className={styles.hvMetadataValue}>{metadata.scriptTags}</span>
            </div>
          </div>
        </div>

        {/* Errors */}
        {validation.errors.length > 0 && (
          <div className={styles.hvSection}>
            <div className={styles.hvSectionHeader}>
              <i className="ti ti-alert-circle" />
              <span>Errors ({validation.errors.length})</span>
            </div>
            <div className={styles.hvIssues}>
              {validation.errors.map((error, idx) => (
                <div key={idx} className={`${styles.hvIssue} ${styles.hvIssueError}`}>
                  <div className={styles.hvIssueIcon}>
                    <i className="ti ti-x" />
                  </div>
                  <div className={styles.hvIssueContent}>
                    <div className={styles.hvIssueMessage}>{error.message}</div>
                    {error.element && (
                      <div className={styles.hvIssueMeta}>
                        Element: <code>&lt;{error.element}&gt;</code>
                      </div>
                    )}
                  </div>
                  <div className={styles.hvIssueType}>{error.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <div className={styles.hvSection}>
            <div className={styles.hvSectionHeader}>
              <i className="ti ti-alert-triangle" />
              <span>Warnings ({validation.warnings.length})</span>
            </div>
            <div className={styles.hvIssues}>
              {validation.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className={`${styles.hvIssue} ${styles.hvIssueWarning} ${styles[`hvIssue${warning.severity.charAt(0).toUpperCase() + warning.severity.slice(1)}`]}`}
                >
                  <div className={styles.hvIssueIcon}>
                    <i className="ti ti-alert-triangle" />
                  </div>
                  <div className={styles.hvIssueContent}>
                    <div className={styles.hvIssueMessage}>{warning.message}</div>
                    {warning.element && (
                      <div className={styles.hvIssueMeta}>
                        Element: <code>&lt;{warning.element}&gt;</code>
                      </div>
                    )}
                  </div>
                  <div className={styles.hvIssueSeverity}>{warning.severity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {validation.suggestions.length > 0 && (
          <div className={styles.hvSection}>
            <div className={styles.hvSectionHeader}>
              <i className="ti ti-bulb" />
              <span>Suggestions</span>
            </div>
            <div className={styles.hvSuggestions}>
              {validation.suggestions.map((suggestion, idx) => (
                <div key={idx} className={styles.hvSuggestion}>
                  <i className="ti ti-check" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Good State */}
        {validation.isValid && validation.warnings.length === 0 && (
          <div className={styles.hvAllGood}>
            <div className={styles.hvAllGoodIcon}>
              <i className="ti ti-circle-check" />
            </div>
            <h3 className={styles.hvAllGoodTitle}>Perfect HTML!</h3>
            <p className={styles.hvAllGoodDesc}>
              Your HTML is valid, well-structured, and follows best practices.
            </p>
          </div>
        )}
      </div>
    </>
  );
}