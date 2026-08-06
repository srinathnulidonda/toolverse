// features/finance/sip-calculator/ResultSummary.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { SIPCalculationResult } from "./ts/sipEngine";
import styles from "./style/ResultSummary.module.css";

const SIP_STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  REGULAR: {
    label: "Regular SIP",
    icon: "ti-piggy-bank",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  STEP_UP: {
    label: "Step-Up SIP",
    icon: "ti-trending-up",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  GOAL_BASED: {
    label: "Goal-Based SIP",
    icon: "ti-target",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  HIGH_RETURN: {
    label: "High Return Projection",
    icon: "ti-trending-up",
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.1)",
  },
  LONG_TERM: {
    label: "Long Term Wealth Creation",
    icon: "ti-clock",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.1)",
  },
};

type ResultSummaryProps = {
  calculation: SIPCalculationResult;
  monthlyInvestment: number;
  expectedReturn: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  lumpSum: number;
  inflationRate: number;
  stepUpPercentage: number;
  goalAmount: number;
  mode: "regular" | "step-up" | "goal-based";
  onCopy: (text: string, key: string) => void;
  copiedKey: string;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
};

export function ResultSummary({
  calculation,
  monthlyInvestment,
  expectedReturn,
  tenureValue,
  tenureUnit,
  lumpSum,
  inflationRate,
  stepUpPercentage,
  goalAmount,
  mode,
  onCopy,
  copiedKey,
  onDownloadPDF,
  isGeneratingPDF,
}: ResultSummaryProps) {
  let statusKey: keyof typeof SIP_STATUS_CONFIG;

  if (mode === "regular") {
    statusKey = "REGULAR";
  } else if (mode === "step-up") {
    statusKey = "STEP_UP";
  } else if (mode === "goal-based") {
    statusKey = "GOAL_BASED";
  } else {
    statusKey = "REGULAR";
  }

  if (expectedReturn > 15) {
    statusKey = "HIGH_RETURN";
  }
  if ((tenureUnit === 'years' && tenureValue > 10) || (tenureUnit === 'months' && tenureValue > 120)) {
    statusKey = "LONG_TERM";
  }

  const statusConfig = SIP_STATUS_CONFIG[statusKey];

  let resultText = '';
  resultText += `SIP Calculation Result - ${mode === "goal-based" ? "Goal-Based SIP" : mode === "step-up" ? "Step-Up SIP" : "Regular SIP"}\n\n`;
  resultText += `═══════════════════════════════════\n`;
  resultText += `MONTHLY SIP: ${formatCurrency(monthlyInvestment)}\n`;
  resultText += `═══════════════════════════════════\n\n`;
  if (lumpSum > 0) {
    resultText += `Initial Lump Sum: ${formatCurrency(lumpSum)}\n`;
  }
  resultText += `Expected Return: ${expectedReturn}% p.a.\n`;
  resultText += `Tenure: ${tenureValue} ${tenureUnit === 'years' ? 'years' : 'months'}\n`;
  if (mode === "step-up") {
    resultText += `Annual Step-Up: ${stepUpPercentage}%\n`;
  }
  if (mode === "goal-based") {
    resultText += `Target Amount: ${formatCurrency(goalAmount)}\n`;
  }
  resultText += `\n`;
  resultText += `Status: ${statusConfig.label}\n`;
  resultText += `Total Amount Invested: ${formatCurrency(calculation.totalInvested)}\n`;
  resultText += `Estimated Returns: ${formatCurrency(calculation.returns)}\n`;
  resultText += `Maturity Amount: ${formatCurrency(calculation.maturityAmount)}\n`;
  if (inflationRate > 0) {
    resultText += `Inflation-Adjusted Maturity: ${formatCurrency(calculation.inflationAdjustedAmount ?? 0)}\n`;
    resultText += `Real Returns: ${formatCurrency(calculation.realReturns ?? 0)}\n`;
  }
  resultText += `\n`;
  resultText += `Projected Value Breakdown:\n`;
  resultText += `• Principal (Invested): ${formatCurrency(calculation.totalInvested)}\n`;
  resultText += `• Returns/Gains: ${formatCurrency(calculation.returns)}\n`;
  if (inflationRate > 0) {
    const inflationImpact = calculation.maturityAmount - (calculation.inflationAdjustedAmount ?? 0);
    resultText += `• Inflation Impact: ${formatCurrency(inflationImpact)}\n`;
  }
  resultText = resultText.trim();

  const copyIconClass = copiedKey === "summary" ? "ti ti-check" : "ti ti-copy";

  return (
    <div className={styles.sipResultSummary}>
      <div
        className={styles.sipStatusBanner}
        style={{
          backgroundColor: statusConfig.bg,
          borderColor: statusConfig.color,
        }}
      >
        <div className={styles.sipStatusIcon} style={{ color: statusConfig.color }}>
          <i className={`ti ${statusConfig.icon}`} aria-hidden="true" />
        </div>
        <div className={styles.sipStatusContent}>
          <span className={styles.sipStatusLabel}>Calculation Status</span>
          <strong className={styles.sipStatusValue} style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </strong>
        </div>
      </div>

      <div className={styles.sipResultCards}>
        <div className={`${styles.sipResultCard} ${styles.sipCardPrimary}`}>
          <div className={styles.sipCardIcon}>
            <i className="ti ti-piggy-bank" aria-hidden="true" />
          </div>
          <div className={styles.sipCardContent}>
            <span className={styles.sipCardLabel}>
              {mode === "goal-based" ? "Required Monthly SIP" : "Monthly SIP"}
            </span>
            <strong className={styles.sipCardValue}>
              {mode === "goal-based"
                ? formatCurrency(calculation.monthlySIPRequired!)
                : formatCurrency(monthlyInvestment)}
            </strong>
          </div>
        </div>

        <div className={`${styles.sipResultCard} ${styles.sipCardSecondary}`}>
          <div className={styles.sipCardIcon}>
            <i className="ti ti-wallet" aria-hidden="true" />
          </div>
          <div className={styles.sipCardContent}>
            <span className={styles.sipCardLabel}>Total Invested</span>
            <strong className={styles.sipCardValue}>{formatCurrency(calculation.totalInvested)}</strong>
          </div>
        </div>

        <div className={`${styles.sipResultCard} ${styles.sipCardSecondary}`}>
          <div className={styles.sipCardIcon}>
            <i className="ti ti-trending-up" aria-hidden="true" />
          </div>
          <div className={styles.sipCardContent}>
            <span className={styles.sipCardLabel}>Estimated Returns</span>
            <strong className={styles.sipCardValue}>{formatCurrency(calculation.returns)}</strong>
          </div>
        </div>

        <div className={`${styles.sipResultCard} ${styles.sipCardPrimary}`}>
          <div className={styles.sipCardIcon}>
            <i className="ti ti-report-money" aria-hidden="true" />
          </div>
          <div className={styles.sipCardContent}>
            <span className={styles.sipCardLabel}>Maturity Amount</span>
            <strong className={styles.sipCardValue}>{formatCurrency(calculation.maturityAmount)}</strong>
          </div>
        </div>
      </div>

      {inflationRate > 0 && (
        <div className={styles.sipInflationSection}>
          <h4 className={styles.sipInflationHeading}>
            <i className="ti ti-trending-down" aria-hidden="true" />
            Inflation Impact
          </h4>
          <div className={styles.sipInflationGrid}>
            <div className={styles.sipInflationItem}>
              <span className={styles.sipInflationLabel}>Inflation Rate</span>
              <strong className={styles.sipInflationValue}>{inflationRate}% p.a.</strong>
            </div>
            <div className={styles.sipInflationItem}>
              <span className={styles.sipInflationLabel}>Nominal Maturity</span>
              <strong className={styles.sipInflationValue}>{formatCurrency(calculation.maturityAmount)}</strong>
            </div>
            <div className={styles.sipInflationItem}>
              <span className={styles.sipInflationLabel}>Inflation-Adjusted Value</span>
              <strong className={styles.sipInflationValue}>
                {formatCurrency(calculation.inflationAdjustedAmount ?? 0)}
              </strong>
            </div>
            <div className={styles.sipInflationItem}>
              <span className={styles.sipInflationLabel}>Real Returns (After Inflation)</span>
              <strong className={styles.sipInflationValue}>{formatCurrency(calculation.realReturns ?? 0)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className={styles.sipBreakdownSection}>
        <h4 className={styles.sipBreakdownHeading}>
          <i className="ti ti-list-details" aria-hidden="true" />
          Investment Breakdown
        </h4>

        <div className={styles.sipBreakdownList}>
          <div className={styles.sipBreakdownItem}>
            <div className={styles.sipBreakdownLabel}>
              <i className="ti ti-piggy-bank" aria-hidden="true" />
              Total Investment (Principal)
            </div>
            <div className={styles.sipBreakdownValue}>{formatCurrency(calculation.totalInvested)}</div>
          </div>

          <div className={styles.sipBreakdownItem}>
            <div className={styles.sipBreakdownLabel}>
              <i className="ti ti-trending-up" aria-hidden="true" />
              Estimated Returns
            </div>
            <div className={styles.sipBreakdownValue}>{formatCurrency(calculation.returns)}</div>
          </div>

          <div className={styles.sipBreakdownDivider} />

          <div className={`${styles.sipBreakdownItem} ${styles.sipItemTotal}`}>
            <div className={styles.sipBreakdownLabel}>
              <i className="ti ti-wallet" aria-hidden="true" />
              Future Value
            </div>
            <div className={styles.sipBreakdownValue}>{formatCurrency(calculation.maturityAmount)}</div>
          </div>
        </div>
      </div>

      <div className={styles.sipResultActions}>
        <button
          type="button"
          className={`${styles.sipActionBtn}${copiedKey === "summary" ? ` ${styles.success}` : ""}`}
          onClick={() => onCopy(resultText, "summary")}
        >
          <i className={copyIconClass} aria-hidden="true" />
          {copiedKey === "summary" ? (
            "Copied!"
          ) : (
            <>
              Copy<span className={styles.sipBtnTextFull}> Result</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={`${styles.sipActionBtn} ${styles.primary}`}
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          aria-busy={isGeneratingPDF}
        >
          <i
            className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.sipSpin}` : "ti-file-download"}`}
            aria-hidden="true"
          />
          {isGeneratingPDF ? "Generating PDF…" : "Download PDF Report"}
        </button>
      </div>
    </div>
  );
}