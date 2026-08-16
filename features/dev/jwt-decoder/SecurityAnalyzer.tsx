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

const STRONG_ALGORITHMS = [
  "RS256", "RS384", "RS512",
  "ES256", "ES384", "ES512",
  "PS256", "PS384", "PS512",
];

const GRADE_CLASSES: Record<string, string> = {
  A: styles.saScoreGradeA,
  B: styles.saScoreGradeB,
  C: styles.saScoreGradeC,
  D: styles.saScoreGradeD,
  F: styles.saScoreGradeF,
};

const ISSUE_CLASSES: Record<string, string> = {
  critical: styles.saIssueCritical,
  warning: styles.saIssueWarning,
  info: styles.saIssueInfo,
};

const BADGE_CLASSES: Record<string, string> = {
  critical: styles.saIssueBadgeCritical,
  warning: styles.saIssueBadgeWarning,
  info: styles.saIssueBadgeInfo,
};

const BEST_PRACTICES = [
  "Use strong asymmetric algorithms (RS256, ES256)",
  "Set appropriate expiration times (15–60 min for access tokens)",
  "Include iss, aud, and jti claims for full token verification",
  "Never store passwords, secrets, or private keys in payload",
  "Always verify signature server-side before trusting claims",
  "Transmit tokens only over HTTPS connections",
];

export default function SecurityAnalyzer({ token }: SecurityAnalyzerProps) {
  const issues = useMemo((): SecurityIssue[] => {
    const findings: SecurityIssue[] = [];
    const { decoded, metadata } = token;
    const alg = (decoded.header.alg as string | undefined)?.toUpperCase() ?? "NONE";

    if (alg === "NONE") {
      findings.push({
        severity: "critical",
        title: "No Signature Algorithm",
        description: 'Token uses "none" algorithm — it carries no cryptographic signature.',
        recommendation: "Switch to a strong signing algorithm like RS256, RS512, or ES256.",
      });
    } else if (alg === "HS256") {
      findings.push({
        severity: "warning",
        title: "Symmetric Algorithm (HS256)",
        description:
          "HS256 uses a shared secret. A compromised secret allows anyone to forge valid tokens.",
        recommendation:
          "Consider asymmetric algorithms (RS256, ES256) so only you can sign tokens.",
      });
    } else if (STRONG_ALGORITHMS.includes(alg)) {
      findings.push({
        severity: "info",
        title: "Strong Algorithm Detected",
        description: `Using ${alg}, a recommended asymmetric signing algorithm.`,
      });
    } else {
      findings.push({
        severity: "warning",
        title: `Unknown Algorithm: ${alg}`,
        description: "This algorithm is not in the list of well-known JWT algorithms.",
        recommendation: "Verify this algorithm is supported and secure for your use case.",
      });
    }

    if (!decoded.payload.exp) {
      findings.push({
        severity: "warning",
        title: "No Expiration Time",
        description: "Token has no exp claim — it never expires on its own.",
        recommendation: "Always set an expiration to limit the window of token misuse.",
      });
    } else if (metadata.isExpired) {
      const age = metadata.timeToExpiry != null ? Math.abs(metadata.timeToExpiry) : 0;
      const ageStr = age > 86400
        ? `${Math.floor(age / 86400)} day(s)`
        : age > 3600
          ? `${Math.floor(age / 3600)} hour(s)`
          : `${Math.floor(age / 60)} minute(s)`;
      findings.push({
        severity: "critical",
        title: "Token Expired",
        description: `Token expired ${ageStr} ago and should not be accepted.`,
        recommendation: "Obtain a fresh token — this one must not be used.",
      });
    } else if (metadata.timeToExpiry != null && metadata.timeToExpiry > 86400 * 30) {
      findings.push({
        severity: "warning",
        title: "Long Expiration Time",
        description: `Token is valid for ${Math.floor(metadata.timeToExpiry / 86400)} more days.`,
        recommendation:
          "Use shorter lifetimes for access tokens (15–60 min) and rotate refresh tokens.",
      });
    }

    if (metadata.isNotYetValid) {
      findings.push({
        severity: "warning",
        title: "Token Not Yet Valid",
        description: 'The nbf (not before) claim has not been reached yet.',
      });
    }

    if (!decoded.payload.iss) {
      findings.push({
        severity: "info",
        title: "No Issuer Claim",
        description: "Omitting iss makes it harder to verify where the token originated.",
        recommendation: "Include iss so relying parties can validate the token source.",
      });
    }

    if (!decoded.payload.aud) {
      findings.push({
        severity: "info",
        title: "No Audience Claim",
        description: "Without aud, a token accepted by one service can be replayed against another.",
        recommendation: "Specify aud to restrict which services may accept this token.",
      });
    }

    if (!decoded.payload.jti) {
      findings.push({
        severity: "info",
        title: "No JWT ID",
        description: "Without jti, detecting token replay attacks is significantly harder.",
        recommendation: "Include a unique jti to support revocation and replay prevention.",
      });
    }

    const payloadStr = JSON.stringify(decoded.payload).toLowerCase();
    const sensitiveKeywords = ["password", "passwd", "secret", "private_key", "privatekey", "credential"];
    const found = sensitiveKeywords.find((kw) => payloadStr.includes(kw));
    if (found) {
      findings.push({
        severity: "critical",
        title: "Potential Sensitive Data in Payload",
        description: `The payload may contain sensitive information (detected keyword: "${found}"). JWT payloads are base64-encoded, not encrypted.`,
        recommendation: "Remove sensitive data from the payload. Use encrypted JWTs (JWE) if needed.",
      });
    }

    if (token.raw.length > 8192) {
      findings.push({
        severity: "warning",
        title: "Oversized Token",
        description: `Token is ${token.raw.length} bytes — large tokens can cause HTTP header size issues.`,
        recommendation: "Reduce payload size or move large data to a reference claim.",
      });
    }

    return findings;
  }, [token]);

  const { critical, warnings, info, score, grade } = useMemo(() => {
    const critical = issues.filter((i) => i.severity === "critical").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const info = issues.filter((i) => i.severity === "info").length;
    const score = Math.max(0, 100 - critical * 30 - warnings * 10);
    const grade =
      score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
    return { critical, warnings, info, score, grade };
  }, [issues]);

  return (
    <div className={styles.saRoot}>
      <div className={styles.saScoreCard}>
        <div className={styles.saScoreVisual}>
          <div className={`${styles.saScoreGrade} ${GRADE_CLASSES[grade] ?? styles.saScoreGradeF}`}>
            {grade}
          </div>
          <div className={styles.saScoreDetails}>
            <div className={styles.saScoreValue}>{score}/100</div>
            <div className={styles.saScoreLabel}>Security Score</div>
          </div>
        </div>

        <div className={styles.saScoreSummary}>
          {critical > 0 && (
            <div className={`${styles.saSummaryItem} ${styles.saSummaryItemCritical}`}>
              <i className="ti ti-alert-circle" />
              {critical} critical {critical === 1 ? "issue" : "issues"}
            </div>
          )}
          {warnings > 0 && (
            <div className={`${styles.saSummaryItem} ${styles.saSummaryItemWarning}`}>
              <i className="ti ti-alert-triangle" />
              {warnings} {warnings === 1 ? "warning" : "warnings"}
            </div>
          )}
          {info > 0 && (
            <div className={`${styles.saSummaryItem} ${styles.saSummaryItemInfo}`}>
              <i className="ti ti-info-circle" />
              {info} {info === 1 ? "suggestion" : "suggestions"}
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

      {issues.length > 0 && (
        <div className={styles.saSection}>
          <div className={styles.saSectionHeader}>
            <i className="ti ti-shield-check" />
            <span>Security Analysis</span>
          </div>
          <div className={styles.saIssuesList}>
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className={`${styles.saIssue} ${ISSUE_CLASSES[issue.severity] ?? ""}`}
              >
                <div className={styles.saIssueHeader}>
                  <div className={styles.saIssueIcon}>
                    {issue.severity === "critical" && <i className="ti ti-alert-octagon" />}
                    {issue.severity === "warning" && <i className="ti ti-alert-triangle" />}
                    {issue.severity === "info" && <i className="ti ti-info-circle" />}
                  </div>
                  <div className={styles.saIssueTitle}>{issue.title}</div>
                  <div className={`${styles.saIssueBadge} ${BADGE_CLASSES[issue.severity] ?? ""}`}>
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

      <div className={styles.saSection}>
        <div className={styles.saSectionHeader}>
          <i className="ti ti-checklist" />
          <span>Best Practices</span>
        </div>
        <div className={styles.saPracticesList}>
          {BEST_PRACTICES.map((practice, idx) => (
            <div key={idx} className={styles.saPractice}>
              <i className="ti ti-check" />
              <span>{practice}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}