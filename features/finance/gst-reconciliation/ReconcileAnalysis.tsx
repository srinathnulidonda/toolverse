// features/finance/gst-reconciliation/ReconcileAnalysis.tsx
"use client";

import { useMemo } from "react";
import {
  formatCurrency,
  estimatePenalty,
  getReconciliationStatus,
  MISMATCH_REASONS,
} from "./reconcileEngine";
import type { ReconciliationResult } from "./reconcileEngine";

interface ReconcileAnalysisProps {
  result: ReconciliationResult;
  period: string;
}

export default function ReconcileAnalysis({ result, period }: ReconcileAnalysisProps) {
  const status = useMemo(() => getReconciliationStatus(result), [result]);

  const penaltyEstimate = useMemo(() => {
    if (result.itcVariance <= 0) return null;
    return estimatePenalty(result.itcVariance);
  }, [result.itcVariance]);

  const totalVarianceAmount = useMemo(() => {
    return (
      Math.abs(result.salesVariance) +
      Math.abs(result.purchaseVariance) +
      Math.abs(result.itcVariance)
    );
  }, [result]);

  const varianceBreakdown = useMemo(
    () => [
      {
        label: "Sales Variance",
        value: Math.abs(result.salesVariance),
        color: "#10b981",
        percentage:
          totalVarianceAmount > 0
            ? (Math.abs(result.salesVariance) / totalVarianceAmount) * 100
            : 0,
      },
      {
        label: "Purchase Variance",
        value: Math.abs(result.purchaseVariance),
        color: "#3b82f6",
        percentage:
          totalVarianceAmount > 0
            ? (Math.abs(result.purchaseVariance) / totalVarianceAmount) * 100
            : 0,
      },
      {
        label: "ITC Variance",
        value: Math.abs(result.itcVariance),
        color: "#f59e0b",
        percentage:
          totalVarianceAmount > 0 ? (Math.abs(result.itcVariance) / totalVarianceAmount) * 100 : 0,
      },
    ],
    [result, totalVarianceAmount]
  );

  const riskFactors = useMemo(() => {
    const factors = [];

    if (result.itcVariance > 0) {
      factors.push({
        level: "high" as const,
        title: "Excess ITC Claim",
        description: "This violates Rule 36(4) and may trigger automated notices",
      });
    }

    if (Math.abs(result.salesVariance) > result.details.sales.books * 0.05) {
      factors.push({
        level: "medium" as const,
        title: "Significant Sales Discrepancy",
        description: "Variance exceeds 5% of total sales, requires review",
      });
    }

    if (Math.abs(result.purchaseVariance) > result.details.purchases.books * 0.1) {
      factors.push({
        level: "medium" as const,
        title: "Purchase Reconciliation Gap",
        description: "Multiple suppliers may not have filed returns on time",
      });
    }

    if (result.complianceScore >= 95) {
      factors.push({
        level: "low" as const,
        title: "Excellent Compliance",
        description: "Your GST filings are well-reconciled",
      });
    }

    return factors;
  }, [result]);

  const monthlyTrend = useMemo(() => {
    // Simulated trend data - in real app, this would come from historical data
    const months = ["Oct", "Nov", "Dec", "Jan"];
    return months.map((month, idx) => ({
      month,
      score: idx === months.length - 1 ? result.complianceScore : 75 + Math.random() * 20,
    }));
  }, [result.complianceScore]);

  return (
    <>
      <div className="ra-root">
        {/* Status Banner */}
        <div className="ra-status-banner" style={{ borderColor: status.color }}>
          <div
            className="ra-status-icon"
            style={{ background: status.color + "20", color: status.color }}
          >
            <i
              className={`ti ${status.status === "matched" ? "ti-check" : status.status === "minor_mismatch" ? "ti-alert-triangle" : "ti-alert-circle"}`}
            />
          </div>
          <div className="ra-status-content">
            <div className="ra-status-title">{status.label}</div>
            <div className="ra-status-desc">
              {status.status === "matched"
                ? "All amounts reconcile perfectly across your books and GST returns."
                : status.status === "minor_mismatch"
                  ? "Minor discrepancies found. Review recommended but not urgent."
                  : "Significant discrepancies detected. Immediate action required to avoid penalties."}
            </div>
          </div>
          <div className="ra-status-score" style={{ color: status.color }}>
            {result.complianceScore}%
          </div>
        </div>

        {/* Risk Assessment */}
        {riskFactors.length > 0 && (
          <div className="ra-section">
            <div className="ra-section-header">
              <i className="ti ti-shield-exclamation" />
              <span>Risk Assessment</span>
            </div>
            <div className="ra-risk-factors">
              {riskFactors.map((factor, idx) => (
                <div key={idx} className={`ra-risk-factor ra-risk-factor--${factor.level}`}>
                  <div className="ra-risk-icon">
                    <i
                      className={`ti ${
                        factor.level === "high"
                          ? "ti-alert-triangle"
                          : factor.level === "medium"
                            ? "ti-alert-circle"
                            : "ti-check-circle"
                      }`}
                    />
                  </div>
                  <div className="ra-risk-content">
                    <div className="ra-risk-title">{factor.title}</div>
                    <div className="ra-risk-desc">{factor.description}</div>
                  </div>
                  <div className={`ra-risk-badge ra-risk-badge--${factor.level}`}>
                    {factor.level.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Penalty Estimate */}
        {penaltyEstimate && penaltyEstimate.totalLiability > 0 && (
          <div className="ra-section">
            <div className="ra-section-header">
              <i className="ti ti-alert-triangle" />
              <span>Potential Penalty Estimate</span>
            </div>
            <div className="ra-penalty-warning">
              <div className="ra-penalty-icon">
                <i className="ti ti-currency-rupee" />
              </div>
              <div className="ra-penalty-content">
                <p className="ra-penalty-text">
                  Based on excess ITC claim of {formatCurrency(result.itcVariance)}, here's the
                  estimated financial impact if not corrected within 30 days:
                </p>
                <div className="ra-penalty-breakdown">
                  <div className="ra-penalty-item">
                    <span className="ra-penalty-label">Excess ITC (Principal)</span>
                    <span className="ra-penalty-value">{formatCurrency(result.itcVariance)}</span>
                  </div>
                  <div className="ra-penalty-item">
                    <span className="ra-penalty-label">Interest (18% p.a., 30 days)</span>
                    <span className="ra-penalty-value">
                      {formatCurrency(penaltyEstimate.interestAmount)}
                    </span>
                  </div>
                  <div className="ra-penalty-item">
                    <span className="ra-penalty-label">Potential Penalty</span>
                    <span className="ra-penalty-value">
                      {formatCurrency(penaltyEstimate.penaltyAmount)}
                    </span>
                  </div>
                  <div className="ra-penalty-item ra-penalty-item--total">
                    <span className="ra-penalty-label">
                      <strong>Total Liability</strong>
                    </span>
                    <span className="ra-penalty-value">
                      <strong>{formatCurrency(penaltyEstimate.totalLiability)}</strong>
                    </span>
                  </div>
                </div>
                <p className="ra-penalty-action">
                  <strong>Action Required:</strong> Reverse the excess ITC in your next GSTR-3B
                  filing to avoid these charges.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Variance Breakdown */}
        <div className="ra-section">
          <div className="ra-section-header">
            <i className="ti ti-chart-pie" />
            <span>Variance Distribution</span>
          </div>
          <div className="ra-variance-breakdown">
            {varianceBreakdown.map((item, idx) => (
              <div key={idx} className="ra-variance-item">
                <div className="ra-variance-info">
                  <div className="ra-variance-label">{item.label}</div>
                  <div className="ra-variance-percent">{item.percentage.toFixed(1)}%</div>
                </div>
                <div className="ra-variance-bar-wrap">
                  <div
                    className="ra-variance-bar"
                    style={{
                      width: `${item.percentage}%`,
                      background: item.color,
                    }}
                  />
                </div>
                <div className="ra-variance-value">{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Trend */}
        <div className="ra-section">
          <div className="ra-section-header">
            <i className="ti ti-chart-line" />
            <span>Compliance Score Trend</span>
          </div>
          <div className="ra-trend">
            <div className="ra-trend-chart">
              {monthlyTrend.map((point, idx) => (
                <div key={idx} className="ra-trend-bar-wrap">
                  <div className="ra-trend-bar-container">
                    <div
                      className="ra-trend-bar"
                      style={{
                        height: `${point.score}%`,
                        background:
                          point.score >= 90 ? "#10b981" : point.score >= 70 ? "#f59e0b" : "#dc2626",
                      }}
                    />
                  </div>
                  <div className="ra-trend-label">{point.month}</div>
                  <div className="ra-trend-value">{point.score.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Common Mismatch Reasons */}
        <div className="ra-section">
          <div className="ra-section-header">
            <i className="ti ti-list-search" />
            <span>Common Mismatch Reasons</span>
          </div>
          <div className="ra-mismatch-reasons">
            {MISMATCH_REASONS.map((category, idx) => (
              <div key={idx} className="ra-mismatch-category">
                <div className="ra-mismatch-category-header">
                  <i className={`ti ${category.icon}`} />
                  <span>{category.category}</span>
                </div>
                <ul className="ra-mismatch-list">
                  {category.reasons.map((reason, ridx) => (
                    <li key={ridx} className="ra-mismatch-item">
                      <i className="ti ti-point" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="ra-section">
          <div className="ra-section-header">
            <i className="ti ti-checklist" />
            <span>Recommended Action Plan</span>
          </div>
          <div className="ra-action-plan">
            <div className="ra-action-step">
              <div className="ra-action-number">1</div>
              <div className="ra-action-content">
                <div className="ra-action-title">Review Discrepancies</div>
                <div className="ra-action-desc">
                  Cross-check each variance against individual invoices to identify specific
                  mismatches.
                </div>
              </div>
            </div>

            <div className="ra-action-step">
              <div className="ra-action-number">2</div>
              <div className="ra-action-content">
                <div className="ra-action-title">Contact Suppliers</div>
                <div className="ra-action-desc">
                  For purchase mismatches, reach out to suppliers who haven't filed their GSTR-1
                  returns.
                </div>
              </div>
            </div>

            <div className="ra-action-step">
              <div className="ra-action-number">3</div>
              <div className="ra-action-content">
                <div className="ra-action-title">File Amendments</div>
                <div className="ra-action-desc">
                  Submit necessary corrections in your next GST return filing (GSTR-1 or GSTR-3B).
                </div>
              </div>
            </div>

            <div className="ra-action-step">
              <div className="ra-action-number">4</div>
              <div className="ra-action-content">
                <div className="ra-action-title">Document Everything</div>
                <div className="ra-action-desc">
                  Maintain records of reconciliation and corrective actions for audit purposes.
                </div>
              </div>
            </div>

            {result.itcVariance > 0 && (
              <div className="ra-action-step ra-action-step--urgent">
                <div className="ra-action-number">
                  <i className="ti ti-alert-triangle" />
                </div>
                <div className="ra-action-content">
                  <div className="ra-action-title">Urgent: Reverse Excess ITC</div>
                  <div className="ra-action-desc">
                    Immediately reverse the excess ITC claim of {formatCurrency(result.itcVariance)}{" "}
                    to minimize interest and penalty exposure.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ra-root {
          flex: 1;
          padding: 16px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--bg-surface);
        }

        /* Status Banner */
        .ra-status-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 2px solid;
          border-radius: 12px;
        }

        .ra-status-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
        }

        .ra-status-content {
          flex: 1;
        }

        .ra-status-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .ra-status-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .ra-status-score {
          font-size: 36px;
          font-weight: 800;
          font-family: var(--font-mono);
          flex-shrink: 0;
        }

        /* Section */
        .ra-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .ra-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ra-section-header i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* Risk Factors */
        .ra-risk-factors {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ra-risk-factor {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          border: 0.5px solid;
        }

        .ra-risk-factor--high {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .ra-risk-factor--medium {
          background: #fef3c7;
          border-color: #fde68a;
        }

        .ra-risk-factor--low {
          background: #dcfce7;
          border-color: #bbf7d0;
        }

        @media (prefers-color-scheme: dark) {
          .ra-risk-factor--high {
            background: #1f1517;
            border-color: #3c1518;
          }
          .ra-risk-factor--medium {
            background: #451a03;
            border-color: #78350f;
          }
          .ra-risk-factor--low {
            background: #022c22;
            border-color: #064e3b;
          }
        }

        .ra-risk-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .ra-risk-factor--high .ra-risk-icon {
          background: #fecaca;
          color: #dc2626;
        }

        .ra-risk-factor--medium .ra-risk-icon {
          background: #fde68a;
          color: #92400e;
        }

        .ra-risk-factor--low .ra-risk-icon {
          background: #bbf7d0;
          color: #166534;
        }

        @media (prefers-color-scheme: dark) {
          .ra-risk-factor--high .ra-risk-icon {
            background: #3c1518;
            color: #f87171;
          }
          .ra-risk-factor--medium .ra-risk-icon {
            background: #78350f;
            color: #fbbf24;
          }
          .ra-risk-factor--low .ra-risk-icon {
            background: #064e3b;
            color: #4ade80;
          }
        }

        .ra-risk-content {
          flex: 1;
        }

        .ra-risk-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }

        .ra-risk-desc {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .ra-risk-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .ra-risk-badge--high {
          background: #dc2626;
          color: white;
        }

        .ra-risk-badge--medium {
          background: #f59e0b;
          color: white;
        }

        .ra-risk-badge--low {
          background: #10b981;
          color: white;
        }

        /* Penalty Warning */
        .ra-penalty-warning {
          display: flex;
          gap: 16px;
          padding: 16px;
        }

        .ra-penalty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #fef2f2;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .ra-penalty-icon {
            background: #1f1517;
            color: #f87171;
          }
        }

        .ra-penalty-content {
          flex: 1;
        }

        .ra-penalty-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .ra-penalty-breakdown {
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ra-penalty-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .ra-penalty-item--total {
          padding-top: 8px;
          border-top: 1px solid var(--border);
          font-size: 14px;
        }

        .ra-penalty-label {
          color: var(--text-secondary);
        }

        .ra-penalty-value {
          color: var(--text);
          font-family: var(--font-mono);
        }

        .ra-penalty-action {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          padding: 10px;
          background: var(--bg-surface);
          border-radius: 6px;
        }

        .ra-penalty-action strong {
          color: var(--text);
        }

        /* Variance Breakdown */
        .ra-variance-breakdown {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ra-variance-item {
          display: grid;
          grid-template-columns: 140px 1fr 120px;
          gap: 12px;
          align-items: center;
        }

        .ra-variance-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ra-variance-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .ra-variance-percent {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .ra-variance-bar-wrap {
          height: 8px;
          background: var(--bg-surface);
          border-radius: 99px;
          overflow: hidden;
        }

        .ra-variance-bar {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        .ra-variance-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
          text-align: right;
        }

        /* Trend Chart */
        .ra-trend {
          padding: 20px;
        }

        .ra-trend-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 150px;
          gap: 16px;
        }

        .ra-trend-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
        }

        .ra-trend-bar-container {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          max-width: 60px;
        }

        .ra-trend-bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          transition: height 0.4s ease;
          min-height: 4px;
        }

        .ra-trend-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
        }

        .ra-trend-value {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
        }

        /* Mismatch Reasons */
        .ra-mismatch-reasons {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ra-mismatch-category {
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .ra-mismatch-category-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }

        .ra-mismatch-category-header i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .ra-mismatch-list {
          padding: 10px 12px;
          margin: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ra-mismatch-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .ra-mismatch-item i {
          font-size: 6px;
          color: var(--text-disabled);
          flex-shrink: 0;
        }

        /* Action Plan */
        .ra-action-plan {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ra-action-step {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 10px;
        }

        .ra-action-step--urgent {
          background: #fef2f2;
          border-color: #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .ra-action-step--urgent {
            background: #1f1517;
            border-color: #3c1518;
          }
        }

        .ra-action-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--brand);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .ra-action-step--urgent .ra-action-number {
          background: #dc2626;
        }

        .ra-action-content {
          flex: 1;
        }

        .ra-action-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .ra-action-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .ra-root {
            padding: 12px;
          }

          .ra-status-banner {
            flex-direction: column;
            text-align: center;
          }

          .ra-variance-item {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .ra-trend-chart {
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}
