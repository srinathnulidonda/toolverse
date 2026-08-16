// features/finance/sip-calculator/ResultSummary.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { SIPCalculationResult } from "./ts/sipEngine";
import styles from "./style/ResultSummary.module.css";

type SIPMode = "regular" | "step-up" | "goal-based";

const MODE_STATUS_CONFIG: Record<SIPMode, { label: string; icon: string; color: string; bg: string }> = {
  regular: {
    label: "Regular SIP",
    icon: "ti-piggy-bank",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  "step-up": {
    label: "Step-Up SIP",
    icon: "ti-trending-up",
    color: "#0D6EFD",
    bg: "rgba(13, 110, 253, 0.1)",
  },
  "goal-based": {
    label: "Goal-Based SIP",
    icon: "ti-target",
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
  mode: SIPMode;
  onCopy: (text: string, key: string) => void;
  copiedKey: string;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
};

function buildInsights(params: {
  mode: SIPMode;
  expectedReturn: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  stepUpPercentage: number;
  inflationRate: number;
  lumpSum: number;
  calculation: SIPCalculationResult;
}) {
  const { mode, expectedReturn, tenureValue, tenureUnit, stepUpPercentage, inflationRate, lumpSum, calculation } = params;
  const tenureInYears = tenureUnit === 'years' ? tenureValue : tenureValue / 12;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (expectedReturn > 20) {
    warnings.push(
      `An expected return of ${expectedReturn}% p.a. is very aggressive. Most diversified equity funds historically average 10%–15% p.a.`
    );
  } else if (expectedReturn > 15) {
    warnings.push(
      `An expected return of ${expectedReturn}% p.a. is on the higher side. Consider a more conservative estimate for planning.`
    );
  }

  if (mode === "step-up" && stepUpPercentage > 25) {
    warnings.push(
      `A ${stepUpPercentage}% annual step-up is aggressive and may be difficult to sustain over the full tenure.`
    );
  }

  if (tenureInYears < 1) {
    warnings.push("Very short investment tenures significantly limit the benefit of compounding.");
  }

  if (mode === "goal-based" && (calculation.monthlySIPRequired ?? 0) <= 0) {
    recommendations.push("Your lump sum alone is projected to meet this goal — no additional monthly SIP is required.");
  }

  if (inflationRate === 0) {
    recommendations.push("Add an expected inflation rate to see the real, inflation-adjusted value of your investment.");
  }

  if (mode === "regular" && lumpSum === 0 && tenureInYears >= 5) {
    recommendations.push("Adding a lump sum investment upfront can meaningfully accelerate long-term compounding.");
  }

  if (tenureInYears >= 10) {
    recommendations.push("Long tenures of 10+ years allow compounding to work most effectively in your favor.");
  }

  const explanation = mode === "goal-based"
    ? `To reach a target of ${formatCurrency(params.calculation.maturityAmount)} over ${tenureValue} ${tenureUnit}, you need a monthly SIP of ${formatCurrency(calculation.monthlySIPRequired ?? 0)}, assuming a ${expectedReturn}% annual return.`
    : `Investing consistently at a ${expectedReturn}% annual return over ${tenureValue} ${tenureUnit} is projected to grow your capital from ${formatCurrency(calculation.totalInvested)} to ${formatCurrency(calculation.maturityAmount)}.`;

  return { warnings, recommendations, explanation };
}

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
  const statusConfig = MODE_STATUS_CONFIG[mode];
  const { warnings, recommendations, explanation } = buildInsights({
    mode,
    expectedReturn,
    tenureValue,
    tenureUnit,
    stepUpPercentage,
    inflationRate,
    lumpSum,
    calculation,
  });

  const primaryCardLabel = mode === "goal-based"
    ? "Required Monthly SIP"
    : mode === "step-up"
      ? "Starting Monthly SIP"
      : "Monthly SIP";

  const primaryCardValue = mode === "goal-based"
    ? formatCurrency(calculation.monthlySIPRequired ?? 0)
    : formatCurrency(monthlyInvestment);

  let resultText = '';
  resultText += `SIP Calculation Result - ${statusConfig.label}\n\n`;
  resultText += `═══════════════════════════════════\n`;
  resultText += `${primaryCardLabel.toUpperCase()}: ${primaryCardValue}\n`;
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
  resultText += `Total Amount Invested: ${formatCurrency(calculation.totalInvested)}\n`;
  resultText += `Estimated Returns: ${formatCurrency(calculation.returns)}\n`;
  resultText += `Maturity Amount: ${formatCurrency(calculation.maturityAmount)}\n`;
  if (inflationRate > 0) {
    resultText += `Inflation-Adjusted Maturity: ${formatCurrency(calculation.inflationAdjustedAmount ?? 0)}\n`;
    resultText += `Real Returns: ${formatCurrency(calculation.realReturns ?? 0)}\n`;
  }
  resultText += `\nExplanation:\n${explanation}\n`;
  if (warnings.length > 0) {
    resultText += `\nWarnings:\n${warnings.map((w) => `• ${w}`).join('\n')}\n`;
  }
  if (recommendations.length > 0) {
    resultText += `\nRecommendations:\n${recommendations.map((r) => `• ${r}`).join('\n')}\n`;
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
          <span className={styles.sipStatusLabel}>SIP Type</span>
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
            <span className={styles.sipCardLabel}>{primaryCardLabel}</span>
            <strong className={styles.sipCardValue}>{primaryCardValue}</strong>
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

      <div className={styles.sipExplanation}>
        <h4 className={styles.sipExplanationHeading}>
          <i className="ti ti-bulb" aria-hidden="true" />
          Explanation
        </h4>
        <p className={styles.sipExplanationText}>{explanation}</p>
      </div>

      {warnings.length > 0 && (
        <div className={styles.sipWarnings}>
          <h4 className={styles.sipWarningsHeading}>
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            Warnings
          </h4>
          <div className={styles.sipWarningsList}>
            {warnings.map((warning, index) => (
              <div key={index} className={styles.sipWarningItem}>
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className={styles.sipRecommendations}>
          <h4 className={styles.sipRecommendationsHeading}>
            <i className="ti ti-bulb" aria-hidden="true" />
            Recommendations
          </h4>
          <div className={styles.sipRecommendationsList}>
            {recommendations.map((recommendation, index) => (
              <div key={index} className={styles.sipRecommendationItem}>
                <i className="ti ti-check" aria-hidden="true" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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