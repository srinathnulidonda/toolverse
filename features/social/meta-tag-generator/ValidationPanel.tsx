// features/social/meta-tag-generator/ValidationPanel.tsx
"use client";

import { useMemo } from "react";
import type { MetaTags } from "./types";
import { validateMetaTags, getSEOScore } from "./utils";

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
    <>
      <div className="vp-root">
        {/* Score Overview */}
        <div className="vp-score-card">
          <div className="vp-score-circle">
            <svg viewBox="0 0 120 120" className="vp-score-svg">
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
            <div className="vp-score-text" style={{ color: getScoreColor(score) }}>
              {score}
            </div>
          </div>
          <div className="vp-score-details">
            <div className="vp-score-label" style={{ color: getScoreColor(score) }}>
              {getScoreLabel(score)}
            </div>
            <div className="vp-score-summary">
              {errors.length > 0 && (
                <span className="vp-badge vp-badge-error">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  {errors.length} Error{errors.length !== 1 ? "s" : ""}
                </span>
              )}
              {warnings.length > 0 && (
                <span className="vp-badge vp-badge-warning">
                  <i className="ti ti-alert-triangle" aria-hidden="true" />
                  {warnings.length} Warning{warnings.length !== 1 ? "s" : ""}
                </span>
              )}
              {errors.length === 0 && warnings.length === 0 && (
                <span className="vp-badge vp-badge-success">
                  <i className="ti ti-circle-check" aria-hidden="true" />
                  All Good!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="vp-issues">
            {errors.map((issue, idx) => (
              <div key={`error-${idx}`} className="vp-issue vp-issue-error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <div className="vp-issue-content">
                  <span className="vp-issue-field">{issue.field}</span>
                  <span className="vp-issue-message">{issue.message}</span>
                  {issue.recommendation && (
                    <span className="vp-issue-rec">{issue.recommendation}</span>
                  )}
                </div>
              </div>
            ))}
            {warnings.map((issue, idx) => (
              <div key={`warning-${idx}`} className="vp-issue vp-issue-warning">
                <i className="ti ti-alert-triangle" aria-hidden="true" />
                <div className="vp-issue-content">
                  <span className="vp-issue-field">{issue.field}</span>
                  <span className="vp-issue-message">{issue.message}</span>
                  {issue.recommendation && (
                    <span className="vp-issue-rec">{issue.recommendation}</span>
                  )}
                </div>
              </div>
            ))}
            {infos.map((issue, idx) => (
              <div key={`info-${idx}`} className="vp-issue vp-issue-info">
                <i className="ti ti-info-circle" aria-hidden="true" />
                <div className="vp-issue-content">
                  <span className="vp-issue-field">{issue.field}</span>
                  <span className="vp-issue-message">{issue.message}</span>
                  {issue.recommendation && (
                    <span className="vp-issue-rec">{issue.recommendation}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checklist */}
        <div className="vp-checklist">
          <div className="vp-checklist-header">
            <i className="ti ti-checklist" aria-hidden="true" />
            <span>SEO Checklist</span>
          </div>
          <div className="vp-checklist-items">
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

      <style>{`
        .vp-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .vp-score-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
        }

        .vp-score-circle {
          position: relative;
          width: 100px;
          height: 100px;
          flex-shrink: 0;
        }
        .vp-score-svg {
          width: 100%;
          height: 100%;
        }
        .vp-score-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
        }

        .vp-score-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .vp-score-label {
          font-size: 16px;
          font-weight: 700;
        }
        .vp-score-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .vp-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .vp-badge i { font-size: 14px; }
        .vp-badge-error { background: var(--error-bg); color: #B91C1C; }
        .vp-badge-warning { background: var(--warning-bg); color: #D97706; }
        .vp-badge-success { background: var(--brand-light); color: var(--brand-text); }

        .vp-issues {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vp-issue {
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 8px;
          border: 0.5px solid;
        }
        .vp-issue i {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .vp-issue-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }
        .vp-issue-field {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.7;
        }
        .vp-issue-message {
          font-size: 12.5px;
          font-weight: 500;
        }
        .vp-issue-rec {
          font-size: 11.5px;
          opacity: 0.85;
          line-height: 1.4;
        }

        .vp-issue-error {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }
        .vp-issue-warning {
          background: var(--warning-bg);
          border-color: #FDE68A;
          color: #D97706;
        }
        .vp-issue-info {
          background: var(--bg-surface);
          border-color: var(--border);
          color: var(--text-secondary);
        }

        .vp-checklist {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .vp-checklist-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .vp-checklist-header i { font-size: 16px; color: var(--text-secondary); }

        .vp-checklist-items {
          display: flex;
          flex-direction: column;
        }

        @media (prefers-color-scheme: dark) {
          .vp-issue-error { color: #F87171; border-color: #7F1D1D; }
          .vp-issue-warning { color: #FCD34D; border-color: #78350F; }
        }

        @media (max-width: 600px) {
          .vp-score-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <>
      <div className="ci-root">
        <div className={`ci-check ${checked ? "checked" : ""}`}>
          {checked && <i className="ti ti-check" aria-hidden="true" />}
        </div>
        <span className={`ci-label ${checked ? "checked" : ""}`}>{label}</span>
      </div>
      <style>{`
        .ci-root {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
        }
        .ci-root:last-child { border-bottom: none; }
        .ci-check {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .ci-check.checked {
          background: var(--brand);
          border-color: var(--brand);
        }
        .ci-check i {
          font-size: 12px;
          color: white;
        }
        .ci-label {
          font-size: 12.5px;
          color: var(--text-tertiary);
        }
        .ci-label.checked {
          color: var(--text);
        }
      `}</style>
    </>
  );
}
