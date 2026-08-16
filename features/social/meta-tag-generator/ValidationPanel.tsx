// features/social/meta-tag-generator/ValidationPanel.tsx
"use client";

import { useMemo } from "react";
import type { MetaTags } from "./ts/types";
import { validateMetaTags, getSEOScore } from "./ts/utils";
import styles from "./style/ValidationPanel.module.css";

type ValidationPanelProps = {
  tags: MetaTags;
};

export default function ValidationPanel({ tags }: ValidationPanelProps) {
  const issues = useMemo(() => validateMetaTags(tags), [tags]);
  const score = useMemo(() => getSEOScore(tags), [tags]);

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");

  const getScoreColor = (s: number) => {
    if (s >= 85) return "var(--brand)";
    if (s >= 60) return "#D97706";
    return "#B91C1C";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 85) return "Excellent SEO";
    if (s >= 70) return "Good SEO";
    if (s >= 50) return "Needs Improvement";
    return "Poor SEO";
  };

  return (
    <div className={styles.vpRoot}>
      <div className={styles.vpScoreCard}>
        <div className={styles.vpScoreCircle}>
          <svg viewBox="0 0 120 120" className={styles.vpScoreSvg}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={getScoreColor(score)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="326.7"
              strokeDashoffset={326.7 - (326.7 * score) / 100}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className={styles.vpScoreText} style={{ color: getScoreColor(score) }}>
            {score}
          </div>
        </div>
        <div className={styles.vpScoreDetails}>
          <div className={styles.vpScoreLabel} style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </div>
          <div className={styles.vpScoreSummary}>
            {errors.length > 0 && (
              <span className={`${styles.vpBadge} ${styles.vpBadgeError}`}>
                <i className="ti ti-alert-circle" aria-hidden="true" />
                {errors.length} Error{errors.length !== 1 ? "s" : ""}
              </span>
            )}
            {warnings.length > 0 && (
              <span className={`${styles.vpBadge} ${styles.vpBadgeWarning}`}>
                <i className="ti ti-alert-triangle" aria-hidden="true" />
                {warnings.length} Warning{warnings.length !== 1 ? "s" : ""}
              </span>
            )}
            {errors.length === 0 && warnings.length === 0 && (
              <span className={`${styles.vpBadge} ${styles.vpBadgeSuccess}`}>
                <i className="ti ti-circle-check" aria-hidden="true" />
                All Good!
              </span>
            )}
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <div className={styles.vpIssues}>
          {errors.map((issue, idx) => (
            <div key={`error-${idx}`} className={`${styles.vpIssue} ${styles.vpIssueError}`}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
              <div className={styles.vpIssueContent}>
                <span className={styles.vpIssueField}>{issue.field}</span>
                <span className={styles.vpIssueMessage}>{issue.message}</span>
                {issue.recommendation && (
                  <span className={styles.vpIssueRec}>{issue.recommendation}</span>
                )}
              </div>
            </div>
          ))}
          {warnings.map((issue, idx) => (
            <div key={`warning-${idx}`} className={`${styles.vpIssue} ${styles.vpIssueWarning}`}>
              <i className="ti ti-alert-triangle" aria-hidden="true" />
              <div className={styles.vpIssueContent}>
                <span className={styles.vpIssueField}>{issue.field}</span>
                <span className={styles.vpIssueMessage}>{issue.message}</span>
                {issue.recommendation && (
                  <span className={styles.vpIssueRec}>{issue.recommendation}</span>
                )}
              </div>
            </div>
          ))}
          {infos.map((issue, idx) => (
            <div key={`info-${idx}`} className={`${styles.vpIssue} ${styles.vpIssueInfo}`}>
              <i className="ti ti-info-circle" aria-hidden="true" />
              <div className={styles.vpIssueContent}>
                <span className={styles.vpIssueField}>{issue.field}</span>
                <span className={styles.vpIssueMessage}>{issue.message}</span>
                {issue.recommendation && (
                  <span className={styles.vpIssueRec}>{issue.recommendation}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.vpChecklist}>
        <div className={styles.vpChecklistHeader}>
          <i className="ti ti-checklist" aria-hidden="true" />
          <span>SEO Checklist</span>
        </div>
        <div className={styles.vpChecklistItems}>
          <ChecklistItem checked={!!tags.title} label="Page title set" />
          <ChecklistItem checked={!!tags.description} label="Meta description set" />
          <ChecklistItem checked={!!tags.canonical} label="Canonical URL set" />
          <ChecklistItem checked={!!tags.ogImage} label="Open Graph image set" />
          <ChecklistItem checked={!!tags.twitterCard} label="Twitter card configured" />
          <ChecklistItem checked={!!tags.keywords} label="Keywords defined" />
          <ChecklistItem checked={!!tags.robots} label="Robots directive set" />
          <ChecklistItem checked={tags.enableSchema} label="Schema.org markup added" />
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className={styles.ciRoot}>
      <div className={`${styles.ciCheck} ${checked ? styles.checked : ""}`}>
        {checked && <i className="ti ti-check" aria-hidden="true" />}
      </div>
      <span className={`${styles.ciLabel} ${checked ? styles.checked : ""}`}>{label}</span>
    </div>
  );
}
