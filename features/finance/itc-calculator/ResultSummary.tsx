// features/finance/itc-calculator/ResultSummary.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import type { ITCCalculationResult, ITCStatus } from "./itcEngine";

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
    <div className="itc-result-summary">
      <div
        className="itc-status-banner"
        style={{
          backgroundColor: statusConfig.bg,
          borderColor: statusConfig.color,
        }}
      >
        <div className="itc-status-icon" style={{ color: statusConfig.color }}>
          <i className={`ti ${statusConfig.icon}`} aria-hidden="true" />
        </div>
        <div className="itc-status-content">
          <span className="itc-status-label">Calculation Status</span>
          <strong className="itc-status-value" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </strong>
        </div>
      </div>

      <div className="itc-result-cards">
        <div className="itc-result-card itc-card-primary">
          <div className="itc-card-icon">
            <i className="ti ti-circle-check" aria-hidden="true" />
          </div>
          <div className="itc-card-content">
            <span className="itc-card-label">Eligible ITC</span>
            <strong className="itc-card-value">{formatCurrency(calculation.eligibleITC)}</strong>
          </div>
        </div>

        {calculation.ineligibleITC > 0 && (
          <div className="itc-result-card itc-card-danger">
            <div className="itc-card-icon">
              <i className="ti ti-circle-x" aria-hidden="true" />
            </div>
            <div className="itc-card-content">
              <span className="itc-card-label">Ineligible ITC</span>
              <strong className="itc-card-value">{formatCurrency(calculation.ineligibleITC)}</strong>
            </div>
          </div>
        )}
      </div>

      {calculation.explanation && (
        <div className="itc-explanation">
          <h4 className="itc-explanation-heading">
            <i className="ti ti-lightbulb" aria-hidden="true" />
            Explanation
          </h4>
          <p className="itc-explanation-text">{calculation.explanation}</p>
        </div>
      )}

      {calculation.warnings.length > 0 && (
        <div className="itc-warnings">
          <h4 className="itc-warnings-heading">
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            Warnings
          </h4>
          <div className="itc-warnings-list">
            {calculation.warnings.map((warning, index) => (
              <div key={index} className="itc-warning-item">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {calculation.recommendations.length > 0 && (
        <div className="itc-recommendations">
          <h4 className="itc-recommendations-heading">
            <i className="ti ti-bulb" aria-hidden="true" />
            Recommendations
          </h4>
          <div className="itc-recommendations-list">
            {calculation.recommendations.map((recommendation, index) => (
              <div key={index} className="itc-recommendation-item">
                <i className="ti ti-check" aria-hidden="true" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="itc-breakdown-section">
        <h4 className="itc-breakdown-heading">
          <i className="ti ti-list-details" aria-hidden="true" />
          Detailed Breakdown
        </h4>

        <div className="itc-breakdown-list">
          <div className="itc-breakdown-item">
            <div className="itc-breakdown-label">
              <i className="ti ti-book" aria-hidden="true" />
              ITC as per Books
            </div>
            <div className="itc-breakdown-value">{formatCurrency(calculation.breakdown.booksITC)}</div>
          </div>

          <div className="itc-breakdown-item">
            <div className="itc-breakdown-label">
              <i className="ti ti-file-text" aria-hidden="true" />
              ITC as per GSTR-2B
            </div>
            <div className="itc-breakdown-value">{formatCurrency(calculation.breakdown.gstr2bITC)}</div>
          </div>

          <div className="itc-breakdown-divider" />

          <div className="itc-breakdown-item itc-item-highlight">
            <div className="itc-breakdown-label">
              <i className="ti ti-circle-check" aria-hidden="true" />
              Matched ITC (Minimum)
            </div>
            <div className="itc-breakdown-value">{formatCurrency(calculation.breakdown.matchedITC)}</div>
          </div>

          {(calculation.breakdown.blockedAmount > 0 ||
            calculation.breakdown.timeBarredAmount > 0 ||
            calculation.breakdown.reversed42_43 > 0 ||
            calculation.breakdown.reversed37 > 0) && (
              <>
                <div className="itc-breakdown-divider" />
                <div className="itc-breakdown-subtitle">
                  <i className="ti ti-minus" aria-hidden="true" />
                  Deductions
                </div>
              </>
            )}

          {calculation.breakdown.blockedAmount > 0 && (
            <div className="itc-breakdown-item itc-item-negative">
              <div className="itc-breakdown-label">
                <i className="ti ti-ban" aria-hidden="true" />
                Blocked Credit (17(5))
              </div>
              <div className="itc-breakdown-value">−{formatCurrency(calculation.breakdown.blockedAmount)}</div>
            </div>
          )}

          {calculation.breakdown.timeBarredAmount > 0 && (
            <div className="itc-breakdown-item itc-item-negative">
              <div className="itc-breakdown-label">
                <i className="ti ti-clock-x" aria-hidden="true" />
                Time-Barred (16(4))
              </div>
              <div className="itc-breakdown-value">−{formatCurrency(calculation.breakdown.timeBarredAmount)}</div>
            </div>
          )}

          {calculation.breakdown.reversed42_43 > 0 && (
            <div className="itc-breakdown-item itc-item-negative">
              <div className="itc-breakdown-label">
                <i className="ti ti-refresh-alert" aria-hidden="true" />
                Reversed (Rule 42/43)
              </div>
              <div className="itc-breakdown-value">−{formatCurrency(calculation.breakdown.reversed42_43)}</div>
            </div>
          )}

          {calculation.breakdown.reversed37 > 0 && (
            <div className="itc-breakdown-item itc-item-negative">
              <div className="itc-breakdown-label">
                <i className="ti ti-clock-pause" aria-hidden="true" />
                Reversed (Rule 37)
              </div>
              <div className="itc-breakdown-value">−{formatCurrency(calculation.breakdown.reversed37)}</div>
            </div>
          )}

          <div className="itc-breakdown-divider" />

          <div className="itc-breakdown-item itc-item-total">
            <div className="itc-breakdown-label">
              <i className="ti ti-sum" aria-hidden="true" />
              Net Eligible ITC
            </div>
            <div className="itc-breakdown-value">{formatCurrency(calculation.eligibleITC)}</div>
          </div>
        </div>
      </div>

      <div className="itc-result-actions">
        <button
          type="button"
          className={`itc-action-btn${copiedKey === "summary" ? " success" : ""}`}
          onClick={() => onCopy(resultText, "summary")}
        >
          <i className={`ti ${copiedKey === "summary" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
          {copiedKey === "summary" ? "Copied!" : (
            <>
              Copy<span className="itc-btn-text-full"> Result</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="itc-action-btn primary"
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          aria-busy={isGeneratingPDF}
        >
          <i
            className={`ti ${isGeneratingPDF ? "ti-loader-2 itc-spin" : "ti-file-download"}`}
            aria-hidden="true"
          />
          {isGeneratingPDF ? "Generating PDF…" : "Download PDF Report"}
        </button>
      </div>

      <style jsx>{`
        .itc-result-summary {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          font-family: var(--font-sans);
        }

        .itc-status-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid;
          border-radius: var(--radius-lg);
          transition: all 0.12s;
        }

        .itc-status-icon {
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
          .itc-status-icon {
            background: rgba(0, 0, 0, 0.2);
          }
        }

        .itc-status-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .itc-status-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.75;
        }

        .itc-status-value {
          font-size: 15px;
          font-weight: 700;
        }

        .itc-result-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .itc-result-card {
          padding: 16px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.12s;
        }

        .itc-result-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .itc-card-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .itc-card-primary {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .itc-card-primary .itc-card-icon {
          background: rgba(20, 92, 60, 0.15);
          color: var(--brand);
        }

        @media (prefers-color-scheme: dark) {
          .itc-card-primary .itc-card-icon {
            background: rgba(76, 175, 130, 0.15);
            color: var(--brand);
          }
        }

        .itc-card-primary .itc-card-value {
          color: var(--brand-text);
        }

        .itc-card-danger {
          background: rgba(220, 38, 38, 0.05);
          border-color: rgba(220, 38, 38, 0.2);
        }

        .itc-card-danger .itc-card-icon {
          background: rgba(220, 38, 38, 0.1);
          color: #DC2626;
        }

        .itc-card-danger .itc-card-value {
          color: #DC2626;
        }

        @media (prefers-color-scheme: dark) {
          .itc-card-danger {
            background: rgba(239, 68, 68, 0.08);
            border-color: rgba(239, 68, 68, 0.2);
          }

          .itc-card-danger .itc-card-icon {
            color: #F87171;
          }

          .itc-card-danger .itc-card-value {
            color: #F87171;
          }
        }

        .itc-card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .itc-card-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .itc-card-value {
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-mono);
          line-height: 1;
        }

        .itc-explanation,
        .itc-warnings,
        .itc-recommendations {
          padding: 16px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
        }

        .itc-explanation-heading,
        .itc-warnings-heading,
        .itc-recommendations-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 12px 0;
        }

        .itc-explanation-heading i {
          color: var(--brand);
        }

        .itc-warnings-heading i {
          color: #D97706;
        }

        .itc-recommendations-heading i {
          color: var(--brand);
        }

        .itc-explanation-text {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .itc-warnings-list,
        .itc-recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .itc-warning-item,
        .itc-recommendation-item {
          display: flex;
          gap: 10px;
          font-size: 12px;
          line-height: 1.5;
        }

        .itc-warning-item i {
          color: #D97706;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .itc-recommendation-item i {
          color: var(--brand);
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .itc-warning-item span {
          color: var(--text-secondary);
        }

        .itc-recommendation-item span {
          color: var(--text-secondary);
        }

        .itc-breakdown-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .itc-breakdown-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .itc-breakdown-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .itc-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border-faint);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .itc-breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: var(--bg-card);
          gap: 12px;
        }

        .itc-breakdown-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          flex: 1;
        }

        .itc-breakdown-label i {
          font-size: 15px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .itc-breakdown-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
          white-space: nowrap;
        }

        .itc-breakdown-divider {
          height: 0.5px;
          background: var(--border);
        }

        .itc-breakdown-subtitle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-surface);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .itc-breakdown-subtitle i {
          font-size: 12px;
        }

        .itc-item-highlight {
          background: var(--brand-light);
        }

        .itc-item-highlight .itc-breakdown-value {
          color: var(--brand-text);
        }

        .itc-item-negative .itc-breakdown-label {
          color: var(--text-tertiary);
        }

        .itc-item-negative .itc-breakdown-value {
          color: #B91C1C;
        }

        @media (prefers-color-scheme: dark) {
          .itc-item-negative .itc-breakdown-value {
            color: #F87171;
          }
        }

        .itc-item-total {
          background: var(--bg-surface);
        }

        .itc-item-total .itc-breakdown-label {
          color: var(--text);
          font-weight: 600;
        }

        .itc-item-total .itc-breakdown-value {
          color: var(--brand-text);
          font-size: 15px;
          font-weight: 700;
        }

        .itc-result-actions {
          display: flex;
          gap: 8px;
          padding-top: 4px;
        }

        .itc-action-btn {
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

        .itc-action-btn i {
          font-size: 15px;
        }

        .itc-action-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
          border-color: var(--brand-border);
        }

        .itc-action-btn.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .itc-action-btn.primary {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
          font-weight: 600;
        }

        .itc-action-btn.primary:hover:not(:disabled) {
          background: var(--brand-hover);
          border-color: var(--brand-hover);
          color: white;
        }

        .itc-action-btn.primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .itc-spin {
          animation: itc-spin-rotate 0.8s linear infinite;
        }

        @keyframes itc-spin-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .itc-result-summary {
            padding: 16px;
            gap: 16px;
          }

          .itc-result-cards {
            grid-template-columns: 1fr;
          }

          .itc-card-value {
            font-size: 18px;
          }

          .itc-breakdown-label {
            font-size: 12px;
          }

          .itc-breakdown-value {
            font-size: 12.5px;
          }

          .itc-result-actions {
            gap: 6px;
          }

          .itc-action-btn {
            flex: 0 0 auto;
            width: auto;
            height: 32px;
            padding: 0 12px;
            font-size: 12px;
            white-space: nowrap;
          }

          .itc-action-btn i {
            font-size: 13px;
          }

          .itc-btn-text-full {
            display: none;
          }

          .itc-action-btn.primary {
            flex: 1;
            padding: 0 10px;
            white-space: nowrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .itc-status-banner,
          .itc-result-card,
          .itc-action-btn,
          .itc-spin {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}