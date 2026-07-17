// features/dev/jwt-decoder/SecurityAnalyzer.tsx
"use client";

import { useMemo } from "react";
import type { DecodedToken } from "./jwtParser";

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
      <div className="sa-root">
        {/* Security Score */}
        <div className="sa-score-card">
          <div className="sa-score-visual">
            <div className={`sa-score-grade sa-score-grade--${stats.grade.toLowerCase()}`}>
              {stats.grade}
            </div>
            <div className="sa-score-details">
              <div className="sa-score-value">{stats.score}/100</div>
              <div className="sa-score-label">Security Score</div>
            </div>
          </div>

          <div className="sa-score-summary">
            {stats.critical > 0 && (
              <div className="sa-summary-item sa-summary-item--critical">
                <i className="ti ti-alert-circle" />
                {stats.critical} critical {stats.critical === 1 ? "issue" : "issues"}
              </div>
            )}
            {stats.warnings > 0 && (
              <div className="sa-summary-item sa-summary-item--warning">
                <i className="ti ti-alert-triangle" />
                {stats.warnings} {stats.warnings === 1 ? "warning" : "warnings"}
              </div>
            )}
            {stats.info > 0 && (
              <div className="sa-summary-item sa-summary-item--info">
                <i className="ti ti-info-circle" />
                {stats.info} {stats.info === 1 ? "suggestion" : "suggestions"}
              </div>
            )}
            {issues.length === 0 && (
              <div className="sa-summary-item sa-summary-item--success">
                <i className="ti ti-circle-check" />
                No issues found
              </div>
            )}
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="sa-issues">
            <div className="sa-issues-header">
              <i className="ti ti-shield-check" />
              <span>Security Analysis</span>
            </div>
            <div className="sa-issues-list">
              {issues.map((issue, idx) => (
                <div key={idx} className={`sa-issue sa-issue--${issue.severity}`}>
                  <div className="sa-issue-header">
                    <div className="sa-issue-icon">
                      {issue.severity === "critical" && <i className="ti ti-alert-octagon" />}
                      {issue.severity === "warning" && <i className="ti ti-alert-triangle" />}
                      {issue.severity === "info" && <i className="ti ti-info-circle" />}
                    </div>
                    <div className="sa-issue-title">{issue.title}</div>
                    <div className={`sa-issue-badge sa-issue-badge--${issue.severity}`}>
                      {issue.severity}
                    </div>
                  </div>
                  <div className="sa-issue-description">{issue.description}</div>
                  {issue.recommendation && (
                    <div className="sa-issue-recommendation">
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
        <div className="sa-practices">
          <div className="sa-practices-header">
            <i className="ti ti-checklist" />
            <span>Best Practices</span>
          </div>
          <div className="sa-practices-list">
            <div className="sa-practice">
              <i className="ti ti-check" />
              <span>Use strong asymmetric algorithms (RS256, ES256)</span>
            </div>
            <div className="sa-practice">
              <i className="ti ti-check" />
              <span>Set appropriate expiration times (15-60 min for access tokens)</span>
            </div>
            <div className="sa-practice">
              <i className="ti ti-check" />
              <span>Include iss, aud, and jti claims</span>
            </div>
            <div className="sa-practice">
              <i className="ti ti-check" />
              <span>Never store sensitive data in payload</span>
            </div>
            <div className="sa-practice">
              <i className="ti ti-check" />
              <span>Verify signature on the server side</span>
            </div>
            <div className="sa-practice">
              <i className="ti ti-check" />
              <span>Use HTTPS for token transmission</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sa-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: auto;
          padding: 16px;
        }

        .sa-score-card {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
        }

        .sa-score-visual {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sa-score-grade {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          color: white;
          font-family: var(--font-sans);
        }

        .sa-score-grade--a {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .sa-score-grade--b {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        .sa-score-grade--c {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .sa-score-grade--d {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        }
        .sa-score-grade--f {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .sa-score-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sa-score-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-sans);
          line-height: 1;
        }

        .sa-score-label {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .sa-score-summary {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }

        .sa-summary-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .sa-summary-item i {
          font-size: 14px;
        }

        .sa-summary-item--critical {
          color: #dc2626;
        }

        .sa-summary-item--warning {
          color: #d97706;
        }

        .sa-summary-item--info {
          color: #2563eb;
        }

        .sa-summary-item--success {
          color: #059669;
        }

        @media (prefers-color-scheme: dark) {
          .sa-summary-item--critical {
            color: #f87171;
          }
          .sa-summary-item--warning {
            color: #fbbf24;
          }
          .sa-summary-item--info {
            color: #60a5fa;
          }
          .sa-summary-item--success {
            color: #34d399;
          }
        }

        .sa-issues {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sa-issues-header,
        .sa-practices-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
        }

        .sa-issues-header i,
        .sa-practices-header i {
          font-size: 14px;
        }

        .sa-issues-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sa-issue {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-left: 3px solid;
          border-radius: var(--radius-md);
        }

        .sa-issue--critical {
          border-left-color: #dc2626;
          background: rgba(220, 38, 38, 0.03);
        }

        .sa-issue--warning {
          border-left-color: #d97706;
          background: rgba(217, 119, 6, 0.03);
        }

        .sa-issue--info {
          border-left-color: #2563eb;
          background: rgba(37, 99, 235, 0.03);
        }

        @media (prefers-color-scheme: dark) {
          .sa-issue--critical {
            border-left-color: #f87171;
            background: rgba(248, 113, 113, 0.05);
          }
          .sa-issue--warning {
            border-left-color: #fbbf24;
            background: rgba(251, 191, 36, 0.05);
          }
          .sa-issue--info {
            border-left-color: #60a5fa;
            background: rgba(96, 165, 250, 0.05);
          }
        }

        .sa-issue-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sa-issue-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          font-size: 16px;
        }

        .sa-issue--critical .sa-issue-icon {
          color: #dc2626;
        }
        .sa-issue--warning .sa-issue-icon {
          color: #d97706;
        }
        .sa-issue--info .sa-issue-icon {
          color: #2563eb;
        }

        @media (prefers-color-scheme: dark) {
          .sa-issue--critical .sa-issue-icon {
            color: #f87171;
          }
          .sa-issue--warning .sa-issue-icon {
            color: #fbbf24;
          }
          .sa-issue--info .sa-issue-icon {
            color: #60a5fa;
          }
        }

        .sa-issue-title {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .sa-issue-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .sa-issue-badge--critical {
          background: #dc2626;
          color: white;
        }

        .sa-issue-badge--warning {
          background: #d97706;
          color: white;
        }

        .sa-issue-badge--info {
          background: #2563eb;
          color: white;
        }

        @media (prefers-color-scheme: dark) {
          .sa-issue-badge--critical {
            background: #f87171;
            color: #1a1a17;
          }
          .sa-issue-badge--warning {
            background: #fbbf24;
            color: #1a1a17;
          }
          .sa-issue-badge--info {
            background: #60a5fa;
            color: #1a1a17;
          }
        }

        .sa-issue-description {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          padding-left: 28px;
        }

        .sa-issue-recommendation {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 10px 12px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-sm);
          font-size: 11px;
          color: var(--brand-text);
          line-height: 1.5;
          margin-left: 28px;
        }

        .sa-issue-recommendation i {
          font-size: 13px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .sa-practices {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sa-practices-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sa-practice {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .sa-practice i {
          font-size: 14px;
          color: var(--brand);
          flex-shrink: 0;
          margin-top: 1px;
        }

        @media (max-width: 768px) {
          .sa-score-card {
            flex-direction: column;
            gap: 16px;
          }

          .sa-score-visual {
            padding-bottom: 16px;
            border-bottom: 0.5px solid var(--border-faint);
          }
        }
      `}</style>
    </>
  );
}
