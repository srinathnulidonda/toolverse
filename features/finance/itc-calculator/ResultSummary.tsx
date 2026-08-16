// features/finance/itc-calculator/ResultSummary.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { ITCCalculationResult, ITCStatus } from "./ts/itcEngine";
import styles from "./style/ResultSummary.module.css";

type ResultSummaryProps = {
  calculation: ITCCalculationResult;
  invoiceNumber: string;
  onCopy: (text: string, key: string) => void;
  copiedKey: string;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
};

const STATUS_CONFIG: Record<
  ITCStatus,
  { label: string; icon: string; color: string; bg: string }
> = {
  ELIGIBLE: {
    label: "Fully Eligible",
    icon: "ti-circle-check",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  BLOCKED_17_5: {
    label: "Blocked Credit",
    icon: "ti-ban",
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
  TIME_BARRED: {
    label: "Time Barred",
    icon: "ti-clock-x",
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.1)",
  },
  REVERSED_42_43: {
    label: "Reversed (Rule 42/43)",
    icon: "ti-refresh-alert",
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.1)",
  },
  REVERSED_37: {
    label: "Reversed (Rule 37)",
    icon: "ti-clock-pause",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.1)",
  },
  PARTIALLY_AVAILABLE: {
    label: "Partially Available",
    icon: "ti-circle-half",
    color: "#EA580C",
    bg: "rgba(234, 88, 12, 0.1)",
  },
};

export function ResultSummary({
  calculation,
  invoiceNumber,
  onCopy,
  copiedKey,
  onDownloadPDF,
  isGeneratingPDF,
}: ResultSummaryProps) {
  const statusConfig = STATUS_CONFIG[calculation.status];

  const resultText = `
ITC Calculation Result - ${invoiceNumber}

═══════════════════════════════════
NET ELIGIBLE ITC: ${formatCurrency(calculation.eligibleITC)}
═══════════════════════════════════

Status: ${statusConfig.label}
Ineligible ITC: ${formatCurrency(calculation.ineligibleITC)}

Breakdown:
• ITC as per Books: ${formatCurrency(calculation.breakdown.booksITC)}
• ITC as per GSTR-2B: ${formatCurrency(calculation.breakdown.gstr2bITC)}
• Matched ITC (min): ${formatCurrency(calculation.breakdown.matchedITC)}

Deductions:
• Blocked (17(5)): ${formatCurrency(calculation.breakdown.blockedAmount)}
• Time-Barred (16(4)): ${formatCurrency(calculation.breakdown.timeBarredAmount)}
• Reversed (42/43): ${formatCurrency(calculation.breakdown.reversed42_43)}
• Reversed (37): ${formatCurrency(calculation.breakdown.reversed37)}

${calculation.explanation ? `\nExplanation: ${calculation.explanation}` : ''}
${calculation.warnings.length > 0 ? `\nWarnings:\n${calculation.warnings.map(w => `• ${w}`).join('\n')}` : ''}
${calculation.recommendations.length > 0 ? `\nRecommendations:\n${calculation.recommendations.map(r => `• ${r}`).join('\n')}` : ''}
  `.trim();

  return (
    <div className={styles.itcResultSummary}>
      <div
        className={styles.itcStatusBanner}
        style={{
          backgroundColor: statusConfig.bg,
          borderColor: statusConfig.color,
        }}
      >
        <div className={styles.itcStatusIcon} style={{ color: statusConfig.color }}>
          <i className={`ti ${statusConfig.icon}`} aria-hidden="true" />
        </div>
        <div className={styles.itcStatusContent}>
          <span className={styles.itcStatusLabel}>Calculation Status</span>
          <strong className={styles.itcStatusValue} style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </strong>
        </div>
      </div>

      <div className={styles.itcResultCards}>
        <div className={`${styles.itcResultCard} ${styles.itcCardPrimary}`}>
          <div className={styles.itcCardIcon}>
            <i className="ti ti-circle-check" aria-hidden="true" />
          </div>
          <div className={styles.itcCardContent}>
            <span className={styles.itcCardLabel}>Eligible ITC</span>
            <strong className={styles.itcCardValue}>{formatCurrency(calculation.eligibleITC)}</strong>
          </div>
        </div>

        {calculation.ineligibleITC > 0 && (
          <div className={`${styles.itcResultCard} ${styles.itcCardDanger}`}>
            <div className={styles.itcCardIcon}>
              <i className="ti ti-circle-x" aria-hidden="true" />
            </div>
            <div className={styles.itcCardContent}>
              <span className={styles.itcCardLabel}>Ineligible ITC</span>
              <strong className={styles.itcCardValue}>{formatCurrency(calculation.ineligibleITC)}</strong>
            </div>
          </div>
        )}
      </div>

      {calculation.explanation && (
        <div className={styles.itcExplanation}>
          <h4 className={styles.itcExplanationHeading}>
            <i className="ti ti-lightbulb" aria-hidden="true" />
            Explanation
          </h4>
          <p className={styles.itcExplanationText}>{calculation.explanation}</p>
        </div>
      )}

      {calculation.warnings.length > 0 && (
        <div className={styles.itcWarnings}>
          <h4 className={styles.itcWarningsHeading}>
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            Warnings
          </h4>
          <div className={styles.itcWarningsList}>
            {calculation.warnings.map((warning, index) => (
              <div key={index} className={styles.itcWarningItem}>
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {calculation.recommendations.length > 0 && (
        <div className={styles.itcRecommendations}>
          <h4 className={styles.itcRecommendationsHeading}>
            <i className="ti ti-bulb" aria-hidden="true" />
            Recommendations
          </h4>
          <div className={styles.itcRecommendationsList}>
            {calculation.recommendations.map((recommendation, index) => (
              <div key={index} className={styles.itcRecommendationItem}>
                <i className="ti ti-check" aria-hidden="true" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.itcBreakdownSection}>
        <h4 className={styles.itcBreakdownHeading}>
          <i className="ti ti-list-details" aria-hidden="true" />
          Detailed Breakdown
        </h4>

        <div className={styles.itcBreakdownList}>
          <div className={styles.itcBreakdownItem}>
            <div className={styles.itcBreakdownLabel}>
              <i className="ti ti-book" aria-hidden="true" />
              ITC as per Books
            </div>
            <div className={styles.itcBreakdownValue}>{formatCurrency(calculation.breakdown.booksITC)}</div>
          </div>

          <div className={styles.itcBreakdownItem}>
            <div className={styles.itcBreakdownLabel}>
              <i className="ti ti-file-text" aria-hidden="true" />
              ITC as per GSTR-2B
            </div>
            <div className={styles.itcBreakdownValue}>{formatCurrency(calculation.breakdown.gstr2bITC)}</div>
          </div>

          <div className={styles.itcBreakdownDivider} />

          <div className={`${styles.itcBreakdownItem} ${styles.itcItemHighlight}`}>
            <div className={styles.itcBreakdownLabel}>
              <i className="ti ti-circle-check" aria-hidden="true" />
              Matched ITC (Minimum)
            </div>
            <div className={styles.itcBreakdownValue}>{formatCurrency(calculation.breakdown.matchedITC)}</div>
          </div>

          {(calculation.breakdown.blockedAmount > 0 ||
            calculation.breakdown.timeBarredAmount > 0 ||
            calculation.breakdown.reversed42_43 > 0 ||
            calculation.breakdown.reversed37 > 0) && (
              <>
                <div className={styles.itcBreakdownDivider} />
                <div className={styles.itcBreakdownSubtitle}>
                  <i className="ti ti-minus" aria-hidden="true" />
                  Deductions
                </div>
              </>
            )}

          {calculation.breakdown.blockedAmount > 0 && (
            <div className={`${styles.itcBreakdownItem} ${styles.itcItemNegative}`}>
              <div className={styles.itcBreakdownLabel}>
                <i className="ti ti-ban" aria-hidden="true" />
                Blocked Credit (17(5))
              </div>
              <div className={styles.itcBreakdownValue}>−{formatCurrency(calculation.breakdown.blockedAmount)}</div>
            </div>
          )}

          {calculation.breakdown.timeBarredAmount > 0 && (
            <div className={`${styles.itcBreakdownItem} ${styles.itcItemNegative}`}>
              <div className={styles.itcBreakdownLabel}>
                <i className="ti ti-clock-x" aria-hidden="true" />
                Time-Barred (16(4))
              </div>
              <div className={styles.itcBreakdownValue}>−{formatCurrency(calculation.breakdown.timeBarredAmount)}</div>
            </div>
          )}

          {calculation.breakdown.reversed42_43 > 0 && (
            <div className={`${styles.itcBreakdownItem} ${styles.itcItemNegative}`}>
              <div className={styles.itcBreakdownLabel}>
                <i className="ti ti-refresh-alert" aria-hidden="true" />
                Reversed (Rule 42/43)
              </div>
              <div className={styles.itcBreakdownValue}>−{formatCurrency(calculation.breakdown.reversed42_43)}</div>
            </div>
          )}

          {calculation.breakdown.reversed37 > 0 && (
            <div className={`${styles.itcBreakdownItem} ${styles.itcItemNegative}`}>
              <div className={styles.itcBreakdownLabel}>
                <i className="ti ti-clock-pause" aria-hidden="true" />
                Reversed (Rule 37)
              </div>
              <div className={styles.itcBreakdownValue}>−{formatCurrency(calculation.breakdown.reversed37)}</div>
            </div>
          )}

          <div className={styles.itcBreakdownDivider} />

          <div className={`${styles.itcBreakdownItem} ${styles.itcItemTotal}`}>
            <div className={styles.itcBreakdownLabel}>
              <i className="ti ti-sum" aria-hidden="true" />
              Net Eligible ITC
            </div>
            <div className={styles.itcBreakdownValue}>{formatCurrency(calculation.eligibleITC)}</div>
          </div>
        </div>
      </div>

      <div className={styles.itcResultActions}>
        <button
          type="button"
          className={`${styles.itcActionBtn}${copiedKey === "summary" ? " success" : ""}`}
          onClick={() => onCopy(resultText, "summary")}
        >
          <i className={`ti ${copiedKey === "summary" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
          {copiedKey === "summary" ? "Copied!" : (
            <>
              Copy<span className={styles.itcBtnTextFull}> Result</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={`${styles.itcActionBtn} primary`}
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          aria-busy={isGeneratingPDF}
        >
          <i
            className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.itcSpin}` : "ti-file-download"}`}
            aria-hidden="true"
          />
          {isGeneratingPDF ? "Generating PDF…" : "Download PDF Report"}
        </button>
      </div>
    </div>
  );
}