// features/finance/gst-calculator/ResultSummary.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { GSTCalculationResult, CalculationMode } from "./ts/gstEngine";
import styles from "./style/ResultSummary.module.css";

type ResultSummaryProps = {
  calculation: GSTCalculationResult;
  reference: string;
  onCopy: (text: string, key: string) => void;
  copiedKey: string;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
};

export function ResultSummary({
  calculation,
  reference,
  onCopy,
  copiedKey,
  onDownloadPDF,
  isGeneratingPDF,
}: ResultSummaryProps) {
  const resultText = `
GST Calculation Result - ${reference}

═══════════════════════════════════
Mode: ${calculation.mode === "ADD_GST" ? "Add GST (Forward)" : "Remove GST (Reverse)"}
Supply Type: ${calculation.supplyType === "INTRA_STATE" ? "Intra-State" : "Inter-State"}
═══════════════════════════════════

BASE AMOUNT: ${formatCurrency(calculation.baseAmount)}
TOTAL TAX: ${formatCurrency(calculation.totalTax)}
FINAL AMOUNT: ${formatCurrency(calculation.finalAmount)}

Tax Breakdown:
• Taxable Value: ${formatCurrency(calculation.taxableValue)}
${calculation.supplyType === "INTRA_STATE"
      ? `• CGST @ ${(calculation.gstRate / 2).toFixed(2)}%: ${formatCurrency(calculation.cgst)}
• SGST @ ${(calculation.gstRate / 2).toFixed(2)}%: ${formatCurrency(calculation.sgst)}`
      : `• IGST @ ${calculation.gstRate.toFixed(2)}%: ${formatCurrency(calculation.igst)}`}
${calculation.cess > 0 ? `• Cess @ ${calculation.cessRate.toFixed(2)}%: ${formatCurrency(calculation.cess)}` : ''}

${calculation.quantity > 1 ? `\nPer Unit:
• Base: ${formatCurrency(calculation.perUnitBase)}
• Tax: ${formatCurrency(calculation.perUnitTax)}
• Final: ${formatCurrency(calculation.perUnitFinal)}` : ''}
  `.trim();

  return (
    <div className={styles.gstResultSummary}>
      <div className={styles.gstStatusBanner}>
        <div className={styles.gstStatusIcon}>
          <i className={`ti ${calculation.mode === "ADD_GST" ? "ti-plus" : "ti-minus"}`} aria-hidden="true" />
        </div>
        <div className={styles.gstStatusContent}>
          <span className={styles.gstStatusLabel}>Calculation Status</span>
          <strong className={styles.gstStatusValue}>
            {calculation.mode === "ADD_GST" ? "GST Added Successfully" : "GST Extracted Successfully"}
          </strong>
        </div>
      </div>

      <div className={styles.gstResultCards}>
        <div className={`${styles.gstResultCard} ${styles.gstCardPrimary}`}>
          <div className={styles.gstCardIcon}>
            <i className="ti ti-currency-rupee" aria-hidden="true" />
          </div>
          <div className={styles.gstCardContent}>
            <span className={styles.gstCardLabel}>Base Amount</span>
            <strong className={styles.gstCardValue}>{formatCurrency(calculation.baseAmount)}</strong>
          </div>
        </div>

        <div className={`${styles.gstResultCard} ${styles.gstCardAccent}`}>
          <div className={styles.gstCardIcon}>
            <i className="ti ti-receipt-tax" aria-hidden="true" />
          </div>
          <div className={styles.gstCardContent}>
            <span className={styles.gstCardLabel}>Total Tax</span>
            <strong className={styles.gstCardValue}>{formatCurrency(calculation.totalTax)}</strong>
          </div>
        </div>

        <div className={`${styles.gstResultCard} ${styles.gstCardSuccess}`}>
          <div className={styles.gstCardIcon}>
            <i className="ti ti-circle-check" aria-hidden="true" />
          </div>
          <div className={styles.gstCardContent}>
            <span className={styles.gstCardLabel}>Final Amount</span>
            <strong className={styles.gstCardValue}>{formatCurrency(calculation.finalAmount)}</strong>
          </div>
        </div>
      </div>

      <div className={styles.gstBreakdownSection}>
        <h4 className={styles.gstBreakdownHeading}>
          <i className="ti ti-list-details" aria-hidden="true" />
          Tax Breakdown
        </h4>

        <div className={styles.gstBreakdownList}>
          <div className={styles.gstBreakdownItem}>
            <div className={styles.gstBreakdownLabel}>
              <i className="ti ti-currency-rupee" aria-hidden="true" />
              Base Amount
            </div>
            <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.baseAmount)}</div>
          </div>

          {calculation.quantity > 1 && (
            <div className={styles.gstBreakdownItem}>
              <div className={styles.gstBreakdownLabel}>
                <i className="ti ti-x" aria-hidden="true" />
                Quantity
              </div>
              <div className={styles.gstBreakdownValue}>{calculation.quantity} units</div>
            </div>
          )}

          <div className={styles.gstBreakdownDivider} />

          <div className={`${styles.gstBreakdownItem} ${styles.gstItemHighlight}`}>
            <div className={styles.gstBreakdownLabel}>
              <i className="ti ti-receipt" aria-hidden="true" />
              Taxable Value
            </div>
            <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.taxableValue)}</div>
          </div>

          <div className={styles.gstBreakdownDivider} />
          <div className={styles.gstBreakdownSubtitle}>
            <i className="ti ti-plus" aria-hidden="true" />
            Tax Components
          </div>

          {calculation.supplyType === "INTRA_STATE" ? (
            <>
              <div className={styles.gstBreakdownItem}>
                <div className={styles.gstBreakdownLabel}>
                  <i className="ti ti-building" aria-hidden="true" />
                  CGST @ {(calculation.gstRate / 2).toFixed(2)}%
                </div>
                <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.cgst)}</div>
              </div>

              <div className={styles.gstBreakdownItem}>
                <div className={styles.gstBreakdownLabel}>
                  <i className="ti ti-map-pin" aria-hidden="true" />
                  SGST @ {(calculation.gstRate / 2).toFixed(2)}%
                </div>
                <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.sgst)}</div>
              </div>
            </>
          ) : (
            <div className={styles.gstBreakdownItem}>
              <div className={styles.gstBreakdownLabel}>
                <i className="ti ti-route" aria-hidden="true" />
                IGST @ {calculation.gstRate.toFixed(2)}%
              </div>
              <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.igst)}</div>
            </div>
          )}

          {calculation.cess > 0 && (
            <div className={styles.gstBreakdownItem}>
              <div className={styles.gstBreakdownLabel}>
                <i className="ti ti-plus-minus" aria-hidden="true" />
                Cess @ {calculation.cessRate.toFixed(2)}%
              </div>
              <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.cess)}</div>
            </div>
          )}

          <div className={styles.gstBreakdownDivider} />

          <div className={`${styles.gstBreakdownItem} ${styles.gstItemTotal}`}>
            <div className={styles.gstBreakdownLabel}>
              <i className="ti ti-sum" aria-hidden="true" />
              Total Tax
            </div>
            <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.totalTax)}</div>
          </div>

          <div className={`${styles.gstBreakdownItem} ${styles.gstItemTotal}`}>
            <div className={styles.gstBreakdownLabel}>
              <i className="ti ti-circle-check" aria-hidden="true" />
              Final Amount (Inc. Tax)
            </div>
            <div className={styles.gstBreakdownValue}>{formatCurrency(calculation.finalAmount)}</div>
          </div>
        </div>
      </div>

      {calculation.quantity > 1 && (
        <div className={styles.gstPerUnit}>
          <h4 className={styles.gstPerUnitHeading}>
            <i className="ti ti-package" aria-hidden="true" />
            Per Unit Breakdown
          </h4>
          <div className={styles.gstPerUnitGrid}>
            <div className={styles.gstPerUnitItem}>
              <span className={styles.gstPerUnitLabel}>Base</span>
              <strong className={styles.gstPerUnitValue}>{formatCurrency(calculation.perUnitBase)}</strong>
            </div>
            <div className={styles.gstPerUnitItem}>
              <span className={styles.gstPerUnitLabel}>Tax</span>
              <strong className={styles.gstPerUnitValue}>{formatCurrency(calculation.perUnitTax)}</strong>
            </div>
            <div className={styles.gstPerUnitItem}>
              <span className={styles.gstPerUnitLabel}>Final</span>
              <strong className={styles.gstPerUnitValue}>{formatCurrency(calculation.perUnitFinal)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className={styles.gstResultActions}>
        <button
          type="button"
          className={`${styles.gstActionBtn}${copiedKey === "summary" ? ` ${styles.success}` : ""}`}
          onClick={() => onCopy(resultText, "summary")}
        >
          <i className={`ti ${copiedKey === "summary" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
          {copiedKey === "summary" ? "Copied!" : (
            <>
              Copy<span className={styles.gstBtnTextFull}> Result</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={`${styles.gstActionBtn} ${styles.primary}`}
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          aria-busy={isGeneratingPDF}
        >
          <i
            className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.gstSpin}` : "ti-file-download"}`}
            aria-hidden="true"
          />
          {isGeneratingPDF ? "Generating PDF…" : "Download PDF Report"}
        </button>
      </div>
    </div>
  );
}