// features/finance/emi-calculator/ResultSummary.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import type { EMICalculationResult } from "./emiEngine";

// Reusing the same status config pattern but adapting for EMI
const EMI_STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  DEFAULT: {
    label: "Standard EMI",
    icon: "ti-credit-card",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  WITH_PREPAYMENT: {
    label: "With Prepayment Savings",
    icon: "ti-check-circle",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  HIGH_INTEREST: {
    label: "High Interest Loan",
    icon: "ti-trending-up",
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
  LONG_TERM: {
    label: "Long Term Loan",
    icon: "ti-clock",
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.1)",
  },
};

type ResultSummaryProps = {
  calculation: EMICalculationResult;
  loanAmount: number;
  interestRate: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  loanType: string;
  prepaymentType: 'none' | 'one-time' | 'recurring';
  onCopy: (text: string, key: string) => void;
  copiedKey: string;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
};

export function ResultSummary({
  calculation,
  loanAmount,
  interestRate,
  tenureValue,
  tenureUnit,
  loanType,
  prepaymentType,
  onCopy,
  copiedKey,
  onDownloadPDF,
  isGeneratingPDF,
}: ResultSummaryProps) {
  // Determine status based on loan characteristics
  let statusKey = "DEFAULT";
  if (prepaymentType !== 'none') {
    statusKey = "WITH_PREPAYMENT";
  } else if (interestRate > 15) {
    statusKey = "HIGH_INTEREST";
  } else if ((tenureUnit === 'years' && tenureValue > 10) || (tenureUnit === 'months' && tenureValue > 120)) {
    statusKey = "LONG_TERM";
  }

  const statusConfig = EMI_STATUS_CONFIG[statusKey];

  const resultText = `
EMI Calculation Result - ${loanType} Loan

═══════════════════════════════════
MONTHLY EMI: ${formatCurrency(calculation.emi)}
═══════════════════════════════════

Loan Amount: ${formatCurrency(loanAmount)}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenureValue} ${tenureUnit === 'years' ? 'years' : 'months'}
Loan Type: ${loanType}
${prepaymentType !== 'none' && `Prepayment: ${prepaymentType === 'one-time' ? 'One-time' : 'Recurring'}`}

Status: ${statusConfig.label}
Total Interest Payable: ${formatCurrency(calculation.totalInterest)}
Total Amount Payable: ${formatCurrency(calculation.totalPayment)}

Principal vs Interest Breakdown:
• Principal Component: ${formatCurrency(calculation.principalVsInterestRatio.principal)}
• Interest Component: ${formatCurrency(calculation.principalVsInterestRatio.interest)}

${calculation.interestSaved && calculation.interestSaved > 0 ? `
Prepayment Benefits:
• Interest Saved: ${formatCurrency(calculation.interestSaved)}
• Tenure Reduced: ${calculation.tenureReducedMonths} months
• Total Interest with Prepayment: ${formatCurrency(calculation.totalInterestWithPrepayment || 0)}
• Total Payment with Prepayment: ${formatCurrency(calculation.totalPaymentWithPrepayment || 0)}
` : ''}
`.trim();

  return (
    <div className="emi-result-summary">
      <div
        className="emi-status-banner"
        style={{
          backgroundColor: statusConfig.bg,
          borderColor: statusConfig.color,
        }}
      >
        <div className="emi-status-icon" style={{ color: statusConfig.color }}>
          <i className={`ti ${statusConfig.icon}`} aria-hidden="true" />
        </div>
        <div className="emi-status-content">
          <span className="emi-status-label">Calculation Status</span>
          <strong className="emi-status-value" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </strong>
        </div>
      </div>

      <div className="emi-result-cards">
        <div className="emi-result-card emi-card-primary">
          <div className="emi-card-icon">
            <i className="ti ti-credit-card" aria-hidden="true" />
          </div>
          <div className="emi-card-content">
            <span className="emi-card-label">Monthly EMI</span>
            <strong className="emi-card-value">{formatCurrency(calculation.emi)}</strong>
          </div>
        </div>

        <div className="emi-result-card emi-card-secondary">
          <div className="emi-card-icon">
            <i className="ti ti-trending-up" aria-hidden="true" />
          </div>
          <div className="emi-card-content">
            <span className="emi-card-label">Total Interest</span>
            <strong className="emi-card-value">{formatCurrency(calculation.totalInterest)}</strong>
          </div>
        </div>

        <div className="emi-result-card emi-card-secondary">
          <div className="emi-card-icon">
            <i className="ti ti-wallet" aria-hidden="true" />
          </div>
          <div className="emi-card-content">
            <span className="emi-card-label">Total Payment</span>
            <strong className="emi-card-value">{formatCurrency(calculation.totalPayment)}</strong>
          </div>
        </div>
      </div>

      {calculation.interestSaved && calculation.interestSaved > 0 && (
        <div className="emi-prepayment-benefits">
          <h4 className="emi-prepayment-heading">
            <i className="ti ti-check-circle" aria-hidden="true" />
            Prepayment Benefits
          </h4>
          <div className="emi-prepayment-grid">
            <div className="emi-benefit-item">
              <span className="emi-benefit-label">Interest Saved</span>
              <strong className="emi-benefit-value">{formatCurrency(calculation.interestSaved)}</strong>
            </div>
            <div className="emi-benefit-item">
              <span className="emi-benefit-label">Tenure Reduced</span>
              <strong className="emi-benefit-value">{calculation.tenureReducedMonths} months</strong>
            </div>
            <div className="emi-benefit-item">
              <span className="emi-benefit-label">New Total Interest</span>
              <strong className="emi-benefit-value">{formatCurrency(calculation.totalInterestWithPrepayment || 0)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="emi-breakdown-section">
        <h4 className="emi-breakdown-heading">
          <i className="ti ti-list-details" aria-hidden="true" />
          Principal vs Interest Breakdown
        </h4>

        <div className="emi-breakdown-list">
          <div className="emi-breakdown-item">
            <div className="emi-breakdown-label">
              <i className="ti ti-subtract" aria-hidden="true" />
              Principal Component
            </div>
            <div className="emi-breakdown-value">{formatCurrency(calculation.principalVsInterestRatio.principal)}</div>
          </div>

          <div className="emi-breakdown-item">
            <div className="emi-breakdown-label">
              <i className="ti ti-percent" aria-hidden="true" />
              Interest Component
            </div>
            <div className="emi-breakdown-value">{formatCurrency(calculation.principalVsInterestRatio.interest)}</div>
          </div>

          <div className="emi-breakdown-divider" />

          <div className="emi-breakdown-item emi-item-total">
            <div className="emi-breakdown-label">
              <i className="ti ti-sum" aria-hidden="true" />
              Principal : Interest Ratio
            </div>
            <div className="emi-breakdown-value">
              {(
                calculation.principalVsInterestRatio.principal /
                calculation.principalVsInterestRatio.interest
              ).toFixed(2)} : 1
            </div>
          </div>
        </div>
      </div>

      <div className="emi-result-actions">
        <button
          type="button"
          className={`emi-action-btn${copiedKey === "summary" ? " success" : ""}`}
          onClick={() => onCopy(resultText, "summary")}
        >
          <i className={`ti ${copiedKey === "summary" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
          {copiedKey === "summary" ? "Copied!" : (
            <>
              Copy<span className="emi-btn-text-full"> Result</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="emi-action-btn primary"
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          aria-busy={isGeneratingPDF}
        >
          <i
            className={`ti ${isGeneratingPDF ? "ti-loader-2 emi-spin" : "ti-file-download"}`}
            aria-hidden="true"
          />
          {isGeneratingPDF ? "Generating PDF…" : "Download PDF Report"}
        </button>
      </div>

      <style jsx>{`
        .emi-result-summary {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          font-family: var(--font-sans);
        }

        .emi-status-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid;
          border-radius: var(--radius-lg);
          transition: all 0.12s;
        }

        .emi-status-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .emi-status-icon {
            background: rgba(0, 0, 0, 0.2);
          }
        }

        .emi-status-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .emi-status-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.75;
        }

        .emi-status-value {
          font-size: 15px;
          font-weight: 700;
        }

        .emi-result-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .emi-result-card {
          padding: 16px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.12s;
        }

        .emi-result-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .emi-card-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .emi-card-primary {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .emi-card-primary .emi-card-icon {
          background: rgba(20, 92, 60, 0.15);
          color: var(--brand);
        }

        @media (prefers-color-scheme: dark) {
          .emi-card-primary .emi-card-icon {
            background: rgba(76, 175, 130, 0.15);
            color: var(--brand);
          }
        }

        .emi-card-primary .emi-card-value {
          color: var(--brand-text);
        }

        .emi-card-secondary {
          background: rgba(220, 38, 38, 0.05);
          border-color: rgba(220, 38, 38, 0.2);
        }

        .emi-card-secondary .emi-card-icon {
          background: rgba(220, 38, 38, 0.1);
          color: #DC2626;
        }

        .emi-card-secondary .emi-card-value {
          color: #DC2626;
        }

        @media (prefers-color-scheme: dark) {
          .emi-card-secondary {
            background: rgba(239, 68, 68, 0.08);
            border-color: rgba(239, 68, 68, 0.2);
          }

          .emi-card-secondary .emi-card-icon {
            color: #F87171;
          }

          .emi-card-secondary .emi-card-value {
            color: #F87171;
          }
        }

        .emi-card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .emi-card-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .emi-card-value {
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-mono);
          line-height: 1;
        }

        .emi-prepayment-benefits {
          padding: 16px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
        }

        .emi-prepayment-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 12px 0;
        }

        .emi-prepayment-heading i {
          color: var(--brand);
        }

        .emi-prepayment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .emi-benefit-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .emi-benefit-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .emi-benefit-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .emi-breakdown-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .emi-breakdown-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .emi-breakdown-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .emi-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border-faint);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .emi-breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: var(--bg-card);
          gap: 12px;
        }

        .emi-breakdown-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          flex: 1;
        }

        .emi-breakdown-label i {
          font-size: 15px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .emi-breakdown-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
          white-space: nowrap;
        }

        .emi-breakdown-divider {
          height: 0.5px;
          background: var(--border);
        }

        .emi-item-total {
          background: var(--bg-surface);
        }

        .emi-item-total .emi-breakdown-label {
          color: var(--text);
          font-weight: 600;
        }

        .emi-item-total .emi-breakdown-value {
          color: var(--brand-text);
          font-size: 15px;
          font-weight: 700;
        }

        .emi-result-actions {
          display: flex;
          gap: 8px;
          padding-top: 4px;
        }

        .emi-action-btn {
          flex: 1;
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          text-align: center;
          white-space: nowrap;
        }

        .emi-action-btn i {
          font-size: 15px;
        }

        .emi-action-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
          border-color: var(--brand-border);
        }

        .emi-action-btn.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .emi-action-btn.primary {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
          font-weight: 600;
        }

        .emi-action-btn.primary:hover:not(:disabled) {
          background: var(--brand-hover);
          border-color: var(--brand-hover);
          color: white;
        }

        .emi-action-btn.primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .emi-spin {
          animation: emi-spin-rotate 0.8s linear infinite;
        }

        @keyframes emi-spin-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .emi-result-summary {
            padding: 16px;
            gap: 16px;
          }

          .emi-result-cards {
            grid-template-columns: 1fr;
          }

          .emi-card-value {
            font-size: 15px;
          }

          .emi-breakdown-label {
            font-size: 12px;
          }

          .emi-breakdown-value {
            font-size: 12.5px;
          }

          .emi-result-actions {
            gap: 6px;
          }

          .emi-action-btn {
            flex: 0 0 auto;
            width: auto;
            height: 32px;
            padding: 0 12px;
            font-size: 12px;
            white-space: nowrap;
          }

          .emi-action-btn i {
            font-size: 13px;
          }

          .emi-btn-text-full {
            display: none;
          }

          .emi-action-btn.primary {
            flex: 1;
            padding: 0 10px;
            white-space: nowrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .emi-status-banner,
          .emi-result-card,
          .emi-action-btn,
          .emi-spin {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}