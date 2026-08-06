// features/finance/emi-calculator/ResultSummary.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { EMICalculationResult } from "./ts/emiEngine";
import styles from "./style/ResultSummary.module.css";

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
    <div className={styles.emiResultSummary}>
      <div
        className={styles.emiStatusBanner}
        style={{
          backgroundColor: statusConfig.bg,
          borderColor: statusConfig.color,
        }}
      >
        <div className={styles.emiStatusIcon} style={{ color: statusConfig.color }}>
          <i className={`ti ${statusConfig.icon}`} aria-hidden="true" />
        </div>
        <div className={styles.emiStatusContent}>
          <span className={styles.emiStatusLabel}>Calculation Status</span>
          <strong className={styles.emiStatusValue} style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </strong>
        </div>
      </div>

      <div className={styles.emiResultCards}>
        <div className={`${styles.emiResultCard} ${styles.emiCardPrimary}`}>
          <div className={styles.emiCardIcon}>
            <i className="ti ti-credit-card" aria-hidden="true" />
          </div>
          <div className={styles.emiCardContent}>
            <span className={styles.emiCardLabel}>Monthly EMI</span>
            <strong className={styles.emiCardValue}>{formatCurrency(calculation.emi)}</strong>
          </div>
        </div>

        <div className={`${styles.emiResultCard} ${styles.emiCardSecondary}`}>
          <div className={styles.emiCardIcon}>
            <i className="ti ti-trending-up" aria-hidden="true" />
          </div>
          <div className={styles.emiCardContent}>
            <span className={styles.emiCardLabel}>Total Interest</span>
            <strong className={styles.emiCardValue}>{formatCurrency(calculation.totalInterest)}</strong>
          </div>
        </div>

        <div className={`${styles.emiResultCard} ${styles.emiCardSecondary}`}>
          <div className={styles.emiCardIcon}>
            <i className="ti ti-wallet" aria-hidden="true" />
          </div>
          <div className={styles.emiCardContent}>
            <span className={styles.emiCardLabel}>Total Payment</span>
            <strong className={styles.emiCardValue}>{formatCurrency(calculation.totalPayment)}</strong>
          </div>
        </div>
      </div>

      {calculation.interestSaved && calculation.interestSaved > 0 && (
        <div className={styles.emiPrepaymentBenefits}>
          <h4 className={styles.emiPrepaymentHeading}>
            <i className="ti ti-check-circle" aria-hidden="true" />
            Prepayment Benefits
          </h4>
          <div className={styles.emiPrepaymentGrid}>
            <div className={styles.emiBenefitItem}>
              <span className={styles.emiBenefitLabel}>Interest Saved</span>
              <strong className={styles.emiBenefitValue}>{formatCurrency(calculation.interestSaved)}</strong>
            </div>
            <div className={styles.emiBenefitItem}>
              <span className={styles.emiBenefitLabel}>Tenure Reduced</span>
              <strong className={styles.emiBenefitValue}>{calculation.tenureReducedMonths} months</strong>
            </div>
            <div className={styles.emiBenefitItem}>
              <span className={styles.emiBenefitLabel}>New Total Interest</span>
              <strong className={styles.emiBenefitValue}>{formatCurrency(calculation.totalInterestWithPrepayment || 0)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className={styles.emiBreakdownSection}>
        <h4 className={styles.emiBreakdownHeading}>
          <i className="ti ti-list-details" aria-hidden="true" />
          Principal vs Interest Breakdown
        </h4>

        <div className={styles.emiBreakdownList}>
          <div className={styles.emiBreakdownItem}>
            <div className={styles.emiBreakdownLabel}>
              <i className="ti ti-subtract" aria-hidden="true" />
              Principal Component
            </div>
            <div className={styles.emiBreakdownValue}>{formatCurrency(calculation.principalVsInterestRatio.principal)}</div>
          </div>

          <div className={styles.emiBreakdownItem}>
            <div className={styles.emiBreakdownLabel}>
              <i className="ti ti-percent" aria-hidden="true" />
              Interest Component
            </div>
            <div className={styles.emiBreakdownValue}>{formatCurrency(calculation.principalVsInterestRatio.interest)}</div>
          </div>

          <div className={styles.emiBreakdownDivider} />

          <div className={`${styles.emiBreakdownItem} ${styles.emiItemTotal}`}>
            <div className={styles.emiBreakdownLabel}>
              <i className="ti ti-sum" aria-hidden="true" />
              Principal : Interest Ratio
            </div>
            <div className={styles.emiBreakdownValue}>
              {(
                calculation.principalVsInterestRatio.principal /
                calculation.principalVsInterestRatio.interest
              ).toFixed(2)} : 1
            </div>
          </div>
        </div>
      </div>

      <div className={styles.emiResultActions}>
        <button
          type="button"
          className={`${styles.emiActionBtn}${copiedKey === "summary" ? ` ${styles.success}` : ""}`}
          onClick={() => onCopy(resultText, "summary")}
        >
          <i className={`ti ${copiedKey === "summary" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
          {copiedKey === "summary" ? "Copied!" : (
            <>
              Copy<span className={styles.emiBtnTextFull}> Result</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={`${styles.emiActionBtn} ${styles.primary}`}
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          aria-busy={isGeneratingPDF}
        >
          <i
            className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.emiSpin}` : "ti-file-download"}`}
            aria-hidden="true"
          />
          {isGeneratingPDF ? "Generating PDF…" : "Download PDF Report"}
        </button>
      </div>
    </div>
  );
}