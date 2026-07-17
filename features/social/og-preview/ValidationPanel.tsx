// features/social/og-preview/ValidationPanel.tsx
"use client";

import { useMemo } from "react";
import type { MetaData, Platform, ValidationResult } from "./types";
import { validateMetaForPlatform, getPlatformLabel, getPlatformIcon } from "./utils";

const VALIDATION_PLATFORMS: Platform[] = ["facebook", "twitter", "linkedin"];

type ValidationPanelProps = {
  meta: MetaData;
};

export default function ValidationPanel({ meta }: ValidationPanelProps) {
  const validations = useMemo(() => {
    const results: Record<Platform, ValidationResult[]> = {} as any;
    VALIDATION_PLATFORMS.forEach((platform) => {
      results[platform] = validateMetaForPlatform(meta, platform);
    });
    return results;
  }, [meta]);

  const totalIssues = useMemo(() => {
    let errors = 0;
    let warnings = 0;
    Object.values(validations).forEach((results) => {
      results.forEach((r) => {
        if (r.level === "error") errors++;
        else if (r.level === "warning") warnings++;
      });
    });
    return { errors, warnings };
  }, [validations]);

  const overallScore = useMemo(() => {
    const total = totalIssues.errors * 2 + totalIssues.warnings;
    const maxScore = 100;
    const score = Math.max(0, maxScore - total * 5);
    return Math.round(score);
  }, [totalIssues]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "var(--brand)";
    if (score >= 70) return "#D97706";
    return "#B91C1C";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
  };

  return (
    <>
      <div className="vp-root">
        {/* Score card */}
        <div className="vp-score-card">
          <div className="vp-score-ring" style={{ "--score": overallScore } as any}>
            <svg className="vp-score-svg" viewBox="0 0 120 120">
              <circle
                className="vp-score-bg"
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--border)"
                strokeWidth="8"
              />
              <circle
                className="vp-score-fg"
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={getScoreColor(overallScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="339.292"
                strokeDashoffset={339.292 - (339.292 * overallScore) / 100}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="vp-score-value" style={{ color: getScoreColor(overallScore) }}>
              {overallScore}
            </div>
          </div>
          <div className="vp-score-info">
            <div className="vp-score-label" style={{ color: getScoreColor(overallScore) }}>
              {getScoreLabel(overallScore)}
            </div>
            <p className="vp-score-desc">SEO & Social Score</p>
            <div className="vp-score-stats">
              {totalIssues.errors > 0 && (
                <span className="vp-stat vp-stat-error">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  {totalIssues.errors} error{totalIssues.errors !== 1 ? "s" : ""}
                </span>
              )}
              {totalIssues.warnings > 0 && (
                <span className="vp-stat vp-stat-warning">
                  <i className="ti ti-alert-triangle" aria-hidden="true" />
                  {totalIssues.warnings} warning{totalIssues.warnings !== 1 ? "s" : ""}
                </span>
              )}
              {totalIssues.errors === 0 && totalIssues.warnings === 0 && (
                <span className="vp-stat vp-stat-success">
                  <i className="ti ti-circle-check" aria-hidden="true" />
                  No issues found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Platform validations */}
        <div className="vp-platforms">
          {VALIDATION_PLATFORMS.map((platform) => {
            const results = validations[platform];
            const hasErrors = results.some((r) => r.level === "error");
            const hasWarnings = results.some((r) => r.level === "warning");
            const isPerfect = results.length === 0;

            return (
              <div key={platform} className="vp-platform">
                <div className="vp-platform-header">
                  <i className={`ti ${getPlatformIcon(platform)}`} aria-hidden="true" />
                  <span className="vp-platform-name">{getPlatformLabel(platform)}</span>
                  {isPerfect && (
                    <span className="vp-platform-badge vp-badge-success">
                      <i className="ti ti-check" aria-hidden="true" />
                      Perfect
                    </span>
                  )}
                  {hasErrors && (
                    <span className="vp-platform-badge vp-badge-error">
                      {results.filter((r) => r.level === "error").length} error
                      {results.filter((r) => r.level === "error").length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {!hasErrors && hasWarnings && (
                    <span className="vp-platform-badge vp-badge-warning">
                      {results.filter((r) => r.level === "warning").length} warning
                      {results.filter((r) => r.level === "warning").length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {results.length > 0 && (
                  <div className="vp-issues">
                    {results.map((result, idx) => (
                      <div key={idx} className={`vp-issue vp-issue-${result.level}`}>
                        <div className="vp-issue-header">
                          <i
                            className={`ti ${
                              result.level === "error" ? "ti-alert-circle" : "ti-alert-triangle"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="vp-issue-message">{result.message}</span>
                        </div>
                        {result.recommendation && (
                          <div className="vp-issue-rec">
                            <i className="ti ti-bulb" aria-hidden="true" />
                            {result.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Best practices */}
        <div className="vp-tips">
          <div className="vp-tips-header">
            <i className="ti ti-lightbulb" aria-hidden="true" />
            <span>Best Practices</span>
          </div>
          <ul className="vp-tips-list">
            <li>Use 1200×630px images for optimal display across all platforms</li>
            <li>Keep titles under 60 characters for Facebook and Twitter</li>
            <li>Descriptions should be 125-155 characters for best engagement</li>
            <li>Include image alt text for accessibility</li>
            <li>Test your meta tags with platform-specific debuggers</li>
            <li>Use unique images and descriptions for each page</li>
          </ul>
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

        .vp-score-ring {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }
        .vp-score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .vp-score-fg {
          transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .vp-score-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          font-family: var(--font-sans);
        }

        .vp-score-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .vp-score-label {
          font-size: 18px;
          font-weight: 700;
          font-family: var(--font-sans);
        }
        .vp-score-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
        }
        .vp-score-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }
        .vp-stat {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .vp-stat i { font-size: 14px; }
        .vp-stat-error {
          background: var(--error-bg);
          color: #B91C1C;
        }
        .vp-stat-warning {
          background: var(--warning-bg);
          color: #D97706;
        }
        .vp-stat-success {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .vp-platforms {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vp-platform {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .vp-platform-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }
        .vp-platform-header i {
          font-size: 16px;
          color: var(--text-secondary);
        }
        .vp-platform-name {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .vp-platform-badge {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .vp-platform-badge i { font-size: 12px; }
        .vp-badge-success {
          background: var(--brand-light);
          color: var(--brand-text);
        }
        .vp-badge-error {
          background: var(--error-bg);
          color: #B91C1C;
        }
        .vp-badge-warning {
          background: var(--warning-bg);
          color: #D97706;
        }

        .vp-issues {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
        }

        .vp-issue {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 0.5px solid;
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
        .vp-issue-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .vp-issue-header i {
          font-size: 16px;
          margin-top: 1px;
          flex-shrink: 0;
        }
        .vp-issue-message {
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.5;
        }
        .vp-issue-rec {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding-left: 24px;
          font-size: 11.5px;
          opacity: 0.9;
          line-height: 1.5;
        }
        .vp-issue-rec i {
          font-size: 13px;
          margin-top: 1px;
          flex-shrink: 0;
        }

        .vp-tips {
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 10px;
          padding: 14px 16px;
        }
        .vp-tips-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--brand-text);
          margin-bottom: 10px;
        }
        .vp-tips-header i { font-size: 16px; }
        .vp-tips-list {
          margin: 0;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .vp-tips-list li {
          font-size: 12px;
          color: var(--brand-text);
          line-height: 1.5;
          opacity: 0.95;
        }

        @media (max-width: 600px) {
          .vp-score-card {
            flex-direction: column;
            text-align: center;
          }
          .vp-score-stats {
            justify-content: center;
          }
        }

        @media (prefers-color-scheme: dark) {
          .vp-issue-error {
            color: #F87171;
            border-color: #7F1D1D;
          }
          .vp-issue-warning {
            color: #FCD34D;
            border-color: #78350F;
          }
        }
      `}</style>
    </>
  );
}
