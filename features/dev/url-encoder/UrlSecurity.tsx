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
              className={`ti ${security.level === "safe"
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
                    className={`ti ${issue.type === "error"
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
    </>
  );
}
