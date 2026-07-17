// features/dev/url-encoder/UrlSecurity.tsx
"use client";

import { useMemo } from "react";
import { validateUrl, type ValidationResult } from "./utils";

interface UrlSecurityProps {
  input: string;
  mode: "encode" | "decode";
}

export default function UrlSecurity({ input, mode }: UrlSecurityProps) {
  const validation = useMemo<ValidationResult | null>(() => {
    if (!input.trim()) return null;
    return validateUrl(input);
  }, [input]);

  if (!validation) {
    return (
      <div className="us-empty">
        <div className="us-empty-icon">
          <i className="ti ti-shield-check" />
        </div>
        <p className="us-empty-title">Security Analysis</p>
        <p className="us-empty-desc">
          Enter a URL to check for security issues and vulnerabilities
        </p>
      </div>
    );
  }

  const { security, issues } = validation;

  return (
    <>
      <div className="us-root">
        {/* Security Score Card */}
        <div className={`us-score-card level-${security.level}`}>
          <div className="us-score-icon">
            <i
              className={`ti ${
                security.level === "safe"
                  ? "ti-shield-check"
                  : security.level === "caution"
                    ? "ti-shield-half"
                    : security.level === "warning"
                      ? "ti-shield-x"
                      : "ti-alert-triangle"
              }`}
            />
          </div>
          <div className="us-score-content">
            <div className="us-score-header">
              <h3 className="us-score-title">
                {security.level === "safe"
                  ? "Looks Safe"
                  : security.level === "caution"
                    ? "Use Caution"
                    : security.level === "warning"
                      ? "Warning"
                      : "High Risk"}
              </h3>
              <span className="us-score-value">{security.score}/100</span>
            </div>
            <div className="us-score-bar">
              <div className="us-score-bar-fill" style={{ width: `${security.score}%` }} />
            </div>
          </div>
        </div>

        {/* Risks List */}
        {security.risks.length > 0 && (
          <div className="us-section">
            <header className="us-section-header">
              <i className="ti ti-alert-circle" />
              Detected Risks
            </header>
            <div className="us-risks-list">
              {security.risks.map((risk, idx) => (
                <div key={idx} className="us-risk-item">
                  <i className="ti ti-alert-triangle" />
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Issues */}
        {issues.length > 0 && (
          <div className="us-section">
            <header className="us-section-header">
              <i className="ti ti-list-check" />
              Validation Details
            </header>
            <div className="us-issues-list">
              {issues.map((issue, idx) => (
                <div key={idx} className={`us-issue-item type-${issue.type}`}>
                  <i
                    className={`ti ${
                      issue.type === "error"
                        ? "ti-x-circle"
                        : issue.type === "warning"
                          ? "ti-alert-triangle"
                          : "ti-info-circle"
                    }`}
                  />
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Practices */}
        <div className="us-section">
          <header className="us-section-header">
            <i className="ti ti-bulb" />
            Best Practices
          </header>
          <div className="us-tips-list">
            <div className="us-tip-item">
              <i className="ti ti-check" />
              <span>Always validate and sanitize URLs before processing</span>
            </div>
            <div className="us-tip-item">
              <i className="ti ti-check" />
              <span>Use HTTPS URLs whenever possible for security</span>
            </div>
            <div className="us-tip-item">
              <i className="ti ti-check" />
              <span>Be cautious with URLs containing unusual encoding patterns</span>
            </div>
            <div className="us-tip-item">
              <i className="ti ti-check" />
              <span>Verify domain names match expected patterns</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .us-root {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /*  Empty State  */
        .us-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .us-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-disabled);
          margin-bottom: 6px;
        }

        .us-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .us-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 320px;
          line-height: 1.6;
        }

        /*  Score Card  */
        .us-score-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border-radius: var(--radius-lg);
          border: 0.5px solid;
        }

        .us-score-card.level-safe {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .us-score-card.level-caution {
          background: #fffbeb;
          border-color: #fde68a;
        }

        @media (prefers-color-scheme: dark) {
          .us-score-card.level-caution {
            background: #1c1400;
            border-color: #78350f;
          }
        }

        .us-score-card.level-warning {
          background: #fff7ed;
          border-color: #fed7aa;
        }

        @media (prefers-color-scheme: dark) {
          .us-score-card.level-warning {
            background: #1f1005;
            border-color: #9a3412;
          }
        }

        .us-score-card.level-danger {
          background: var(--error-bg);
          border-color: #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .us-score-card.level-danger {
            border-color: #7f1d1d;
          }
        }

        .us-score-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .level-safe .us-score-icon {
          background: var(--brand);
          color: white;
        }

        .level-caution .us-score-icon {
          background: #f59e0b;
          color: white;
        }

        .level-warning .us-score-icon {
          background: #f97316;
          color: white;
        }

        .level-danger .us-score-icon {
          background: #ef4444;
          color: white;
        }

        .us-score-content {
          flex: 1;
        }

        .us-score-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .us-score-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }

        .level-safe .us-score-title {
          color: var(--brand-text);
        }
        .level-caution .us-score-title {
          color: #92400e;
        }
        @media (prefers-color-scheme: dark) {
          .level-caution .us-score-title {
            color: #fcd34d;
          }
        }
        .level-warning .us-score-title {
          color: #9a3412;
        }
        @media (prefers-color-scheme: dark) {
          .level-warning .us-score-title {
            color: #fdba74;
          }
        }
        .level-danger .us-score-title {
          color: #991b1b;
        }
        @media (prefers-color-scheme: dark) {
          .level-danger .us-score-title {
            color: #f87171;
          }
        }

        .us-score-value {
          font-size: 16px;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .level-safe .us-score-value {
          color: var(--brand-text);
        }
        .level-caution .us-score-value {
          color: #92400e;
        }
        @media (prefers-color-scheme: dark) {
          .level-caution .us-score-value {
            color: #fcd34d;
          }
        }
        .level-warning .us-score-value {
          color: #9a3412;
        }
        @media (prefers-color-scheme: dark) {
          .level-warning .us-score-value {
            color: #fdba74;
          }
        }
        .level-danger .us-score-value {
          color: #991b1b;
        }
        @media (prefers-color-scheme: dark) {
          .level-danger .us-score-value {
            color: #f87171;
          }
        }

        .us-score-bar {
          height: 6px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 99px;
          overflow: hidden;
        }

        .us-score-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        .level-safe .us-score-bar-fill {
          background: var(--brand);
        }
        .level-caution .us-score-bar-fill {
          background: #f59e0b;
        }
        .level-warning .us-score-bar-fill {
          background: #f97316;
        }
        .level-danger .us-score-bar-fill {
          background: #ef4444;
        }

        /*  Section  */
        .us-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .us-section-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
        }

        .us-section-header i {
          font-size: 12px;
        }

        /*  Risks  */
        .us-risks-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .us-risk-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: var(--error-bg);
          border: 0.5px solid #fecaca;
          border-radius: var(--radius-md);
          font-size: 12px;
          color: #991b1b;
          line-height: 1.5;
        }

        @media (prefers-color-scheme: dark) {
          .us-risk-item {
            border-color: #7f1d1d;
            color: #f87171;
          }
        }

        .us-risk-item i {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /*  Issues  */
        .us-issues-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .us-issue-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          line-height: 1.5;
          border: 0.5px solid;
        }

        .us-issue-item.type-error {
          background: var(--error-bg);
          border-color: #fecaca;
          color: #991b1b;
        }

        @media (prefers-color-scheme: dark) {
          .us-issue-item.type-error {
            border-color: #7f1d1d;
            color: #f87171;
          }
        }

        .us-issue-item.type-warning {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }

        @media (prefers-color-scheme: dark) {
          .us-issue-item.type-warning {
            background: #1c1400;
            border-color: #78350f;
            color: #fcd34d;
          }
        }

        .us-issue-item.type-info {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }

        @media (prefers-color-scheme: dark) {
          .us-issue-item.type-info {
            background: #0a1628;
            border-color: #1e3a5f;
            color: #93c5fd;
          }
        }

        .us-issue-item i {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /*  Tips  */
        .us-tips-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .us-tip-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .us-tip-item i {
          font-size: 14px;
          color: var(--brand);
          flex-shrink: 0;
          margin-top: 1px;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .us-root {
            padding: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .us-score-bar-fill {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
