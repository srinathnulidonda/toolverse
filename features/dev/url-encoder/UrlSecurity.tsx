// features/dev/url-encoder/UrlSecurity.tsx
"use client";

import { useMemo } from "react";
import { validateUrl, type ValidationResult } from "./ts/utils";
import styles from "./style/UrlSecurity.module.css";

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
      <div className={styles.usEmpty}>
        <div className={styles.usEmptyIcon}>
          <i className="ti ti-shield-check" />
        </div>
        <p className={styles.usEmptyTitle}>Security Analysis</p>
        <p className={styles.usEmptyDesc}>
          Enter a URL to check for security issues and vulnerabilities
        </p>
      </div>
    );
  }

  const { security, issues } = validation;

  return (
    <>
      <div className={styles.usRoot}>
        {/* Security Score Card */}
        <div className={`${styles.usScoreCard} ${styles[`level${security.level.charAt(0).toUpperCase() + security.level.slice(1)}`]}`}>
          <div className={styles.usScoreIcon}>
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
          <div className={styles.usScoreContent}>
            <div className={styles.usScoreHeader}>
              <h3 className={styles.usScoreTitle}>
                {security.level === "safe"
                  ? "Looks Safe"
                  : security.level === "caution"
                    ? "Use Caution"
                    : security.level === "warning"
                      ? "Warning"
                      : "High Risk"}
              </h3>
              <span className={styles.usScoreValue}>{security.score}/100</span>
            </div>
            <div className={styles.usScoreBar}>
              <div className={styles.usScoreBarFill} style={{ width: `${security.score}%` }} />
            </div>
          </div>
        </div>

        {/* Risks List */}
        {security.risks.length > 0 && (
          <div className={styles.usSection}>
            <header className={styles.usSectionHeader}>
              <i className="ti ti-alert-circle" />
              Detected Risks
            </header>
            <div className={styles.usRisksList}>
              {security.risks.map((risk, idx) => (
                <div key={idx} className={styles.usRiskItem}>
                  <i className="ti ti-alert-triangle" />
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Issues */}
        {issues.length > 0 && (
          <div className={styles.usSection}>
            <header className={styles.usSectionHeader}>
              <i className="ti ti-list-check" />
              Validation Details
            </header>
            <div className={styles.usIssuesList}>
              {issues.map((issue, idx) => (
                <div key={idx} className={`${styles.usIssueItem} ${styles[`type${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}`]}`}>
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
        <div className={styles.usSection}>
          <header className={styles.usSectionHeader}>
            <i className="ti ti-bulb" />
            Best Practices
          </header>
          <div className={styles.usTipsList}>
            <div className={styles.usTipItem}>
              <i className="ti ti-check" />
              <span>Always validate and sanitize URLs before processing</span>
            </div>
            <div className={styles.usTipItem}>
              <i className="ti ti-check" />
              <span>Use HTTPS URLs whenever possible for security</span>
            </div>
            <div className={styles.usTipItem}>
              <i className="ti ti-check" />
              <span>Be cautious with URLs containing unusual encoding patterns</span>
            </div>
            <div className={styles.usTipItem}>
              <i className="ti ti-check" />
              <span>Verify domain names match expected patterns</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}