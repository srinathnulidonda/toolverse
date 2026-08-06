// features/dev/jwt-decoder/SecurityAnalyzer.tsx
"use client";

import { useMemo } from "react";
import type { DecodedToken } from "./ts/jwtParser";
import styles from "./style/SecurityAnalyzer.module.css";

interface SecurityAnalyzerProps {
  token: DecodedToken;
}

interface SecurityIssue {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  recommendation?: string;
}

const WEAK_ALGORITHMS = ["none", "HS256"];
const STRONG_ALGORITHMS = [
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
  "PS256",
  "PS384",
  "PS512",
];

export default function SecurityAnalyzer({ token }: SecurityAnalyzerProps) {
  const issues = useMemo((): SecurityIssue[] => {
    const findings: SecurityIssue[] = [];
    const { decoded, metadata } = token;

    // Algorithm check
    const alg = decoded.header.alg?.toUpperCase() || "NONE";
    if (alg === "NONE") {
      findings.push({
        severity: "critical",
        title: "No Signature Algorithm",
        description: 'Token uses "none" algorithm, meaning it\'s not cryptographically signed',
        recommendation: "Use a strong signing algorithm like RS256, RS512, or ES256",
      });
    } else if (alg === "HS256") {
      findings.push({
        severity: "warning",
        title: "Symmetric Algorithm (HS256)",
        description:
          "HS256 uses a shared secret. If the secret is compromised, anyone can create valid tokens",
        recommendation: "Consider using asymmetric algorithms (RS256, ES256) for better security",
      });
    } else if (STRONG_ALGORITHMS.includes(alg)) {
      findings.push({
        severity: "info",
        title: "Strong Algorithm Detected",
        description: `Using ${alg}, which is a recommended asymmetric algorithm`,
      });
    }

    // Expiration check
    if (!decoded.payload.exp) {
      findings.push({
        severity: "warning",
        title: "No Expiration Time",
        description: "Token doesn't have an expiration time (exp claim)",
        recommendation: "Always set an expiration time to limit token lifetime",
      });
    } else if (metadata.isExpired) {
      findings.push({
        severity: "critical",
        title: "Token Expired",
        description: `Token expired ${Math.abs(metadata.timeToExpiry || 0)} seconds ago`,
        recommendation: "This token should not be accepted by any system",
      });
    } else if (metadata.timeToExpiry && metadata.timeToExpiry > 86400 * 30) {
      findings.push({
        severity: "warning",
        title: "Long Expiration Time",
        description: `Token valid for ${Math.floor(metadata.timeToExpiry / 86400)} days`,
        recommendation: "Consider shorter expiration times for access tokens (15-60 minutes)",
      });
    }

    // Not Before check
    if (metadata.isNotYetValid) {
      findings.push({
        severity: "warning",
        title: "Token Not Yet Valid",
        description: 'Token has a "nbf" (not before) claim that hasn\'t been reached yet',
      });
    }

    // Issuer check
    if (!decoded.payload.iss) {
      findings.push({
        severity: "info",
        title: "No Issuer Claim",
        description: "Token doesn't specify an issuer (iss claim)",
        recommendation: "Include issuer for better token verification",
      });
    }

    // Audience check
    if (!decoded.payload.aud) {
      findings.push({
        severity: "info",
        title: "No Audience Claim",
        description: "Token doesn't specify an audience (aud claim)",
        recommendation: "Include audience to prevent token misuse across different services",
      });
    }

    // JWT ID check
    if (!decoded.payload.jti) {
      findings.push({
        severity: "info",
        title: "No JWT ID",
        description: "Token doesn't have a unique identifier (jti claim)",
        recommendation: "Include jti for token revocation and replay attack prevention",
      });
    }

    // Check for sensitive data
    const payloadStr = JSON.stringify(decoded.payload).toLowerCase();
    if (
      payloadStr.includes("password") ||
      payloadStr.includes("secret") ||
      payloadStr.includes("private")
    ) {
      findings.push({
        severity: "critical",
        title: "Potential Sensitive Data",
        description: "Token payload may contain sensitive information",
        recommendation: "Never store passwords, secrets, or private keys in JWT payload",
      });
    }

    // Token size check
    if (token.raw.length > 8192) {
      findings.push({
        severity: "warning",
        title: "Large Token Size",
        description: `Token size is ${token.raw.length} bytes, which may cause issues with HTTP headers`,
        recommendation: "Keep tokens under 8KB for better compatibility",
      });
    }

    return findings;
  }, [token]);

  const stats = useMemo(() => {
    const critical = issues.filter((i) => i.severity === "critical").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const info = issues.filter((i) => i.severity === "info").length;

    let score = 100;
    score -= critical * 30;
    score -= warnings * 10;
    score = Math.max(0, score);

    let grade: string;
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else grade = "F";

    return { critical, warnings, info, score, grade };
  }, [issues]);

  return (
    <>
      <div className={styles.saRoot}>
        {/* Security Score */}
        <div className={styles.saScoreCard}>
          <div className={styles.saScoreVisual}>
            <div className={`${styles.saScoreGrade} ${styles[`saScoreGrade--${stats.grade.toLowerCase()}`]}`}>
              {stats.grade}
            </div>
            <div className={styles.saScoreDetails}>
              <div className={styles.saScoreValue}>{stats.score}/100</div>
              <div className={styles.saScoreLabel}>Security Score</div>
            </div>
          </div>

          <div className={styles.saScoreSummary}>
            {stats.critical > 0 && (
              <div className={`${styles.saSummaryItem} ${styles.saSummaryItemCritical}`}>
                <i className="ti ti-alert-circle" />
                {stats.critical} critical {stats.critical === 1 ? "issue" : "issues"}
              </div>
            )}
            {stats.warnings > 0 && (
              <div className={`${styles.saSummaryItem} ${styles.saSummaryItemWarning}`}>
                <i className="ti ti-alert-triangle" />
                {stats.warnings} {stats.warnings === 1 ? "warning" : "warnings"}
              </div>
            )}
            {stats.info > 0 && (
              <div className={`${styles.saSummaryItem} ${styles.saSummaryItemInfo}`}>
                <i className="ti ti-info-circle" />
                {stats.info} {stats.info === 1 ? "suggestion" : "suggestions"}
              </div>
            )}
            {issues.length === 0 && (
              <div className={`${styles.saSummaryItem} ${styles.saSummaryItemSuccess}`}>
                <i className="ti ti-circle-check" />
                No issues found
              </div>
            )}
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div className={styles.saIssues}>
            <div className={styles.saIssuesHeader}>
              <i className="ti ti-shield-check" />
              <span>Security Analysis</span>
            </div>
            <div className={styles.saIssuesList}>
              {issues.map((issue, idx) => (
                <div key={idx} className={`${styles.saIssue} ${styles[`saIssue--${issue.severity}`]}`}>
                  <div className={styles.saIssueHeader}>
                    <div className={styles.saIssueIcon}>
                      {issue.severity === "critical" && <i className="ti ti-alert-octagon" />}
                      {issue.severity === "warning" && <i className="ti ti-alert-triangle" />}
                      {issue.severity === "info" && <i className="ti ti-info-circle" />}
                    </div>
                    <div className={styles.saIssueTitle}>{issue.title}</div>
                    <div className={`${styles.saIssueBadge} ${styles[`saIssueBadge--${issue.severity}`]}`}>
                      {issue.severity}
                    </div>
                  </div>
                  <div className={styles.saIssueDescription}>{issue.description}</div>
                  {issue.recommendation && (
                    <div className={styles.saIssueRecommendation}>
                      <i className="ti ti-bulb" />
                      <span>{issue.recommendation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Practices */}
        <div className={styles.saPractices}>
          <div className={styles.saPracticesHeader}>
            <i className="ti ti-checklist" />
            <span>Best Practices</span>
          </div>
          <div className={styles.saPracticesList}>
            <div className={styles.saPractice}>
              <i className="ti ti-check" />
              <span>Use strong asymmetric algorithms (RS256, ES256)</span>
            </div>
            <div className={styles.saPractice}>
              <i className="ti ti-check" />
              <span>Set appropriate expiration times (15-60 min for access tokens)</span>
            </div>
            <div className={styles.saPractice}>
              <i className="ti ti-check" />
              <span>Include iss, aud, and jti claims</span>
            </div>
            <div className={styles.saPractice}>
              <i className="ti ti-check" />
              <span>Never store sensitive data in payload</span>
            </div>
            <div className={styles.saPractice}>
              <i className="ti ti-check" />
              <span>Verify signature on the server side</span>
            </div>
            <div className={styles.saPractice}>
              <i className="ti ti-check" />
              <span>Use HTTPS for token transmission</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}