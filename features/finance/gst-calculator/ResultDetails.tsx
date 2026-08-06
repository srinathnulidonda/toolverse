// features/finance/gst-calculator/ResultDetails.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { GSTCalculationResult } from "./ts/gstEngine";
import styles from "./style/ResultDetails.module.css";

type ResultDetailsProps = {
  calculation: GSTCalculationResult;
  inputAmount: number;
  gstRate: number;
  cessRate: number;
  quantity: number;
  mode: string;
  supplyType: string;
};

export function ResultDetails({
  calculation,
  inputAmount,
  gstRate,
  cessRate,
  quantity,
  mode,
  supplyType,
}: ResultDetailsProps) {
  return (
    <div className={styles.gstResultDetails}>
      <div className={styles.gstDetailSection}>
        <h4 className={styles.gstDetailHeading}>
          <i className="ti ti-info-circle" aria-hidden="true" />
          Input Summary
        </h4>
        <div className={styles.gstDetailGrid}>
          <div className={styles.gstDetailItem}>
            <span className={styles.gstDetailLabel}>Calculation Mode</span>
            <span className={styles.gstDetailValue}>
              {mode === "ADD_GST" ? "Add GST (Forward)" : "Remove GST (Reverse)"}
            </span>
          </div>
          <div className={styles.gstDetailItem}>
            <span className={styles.gstDetailLabel}>Supply Type</span>
            <span className={styles.gstDetailValue}>
              {supplyType === "INTRA_STATE" ? "Intra-State" : "Inter-State"}
            </span>
          </div>
          <div className={styles.gstDetailItem}>
            <span className={styles.gstDetailLabel}>Input Amount</span>
            <span className={`${styles.gstDetailValue} ${styles.gstMono}`}>{formatCurrency(inputAmount)}</span>
          </div>
          <div className={styles.gstDetailItem}>
            <span className={styles.gstDetailLabel}>GST Rate</span>
            <span className={`${styles.gstDetailValue} ${styles.gstMono}`}>{gstRate.toFixed(2)}%</span>
          </div>
          {cessRate > 0 && (
            <div className={styles.gstDetailItem}>
              <span className={styles.gstDetailLabel}>Cess Rate</span>
              <span className={`${styles.gstDetailValue} ${styles.gstMono}`}>{cessRate.toFixed(2)}%</span>
            </div>
          )}
          <div className={styles.gstDetailItem}>
            <span className={styles.gstDetailLabel}>Quantity</span>
            <span className={styles.gstDetailValue}>{quantity} unit{quantity > 1 ? "s" : ""}</span>
          </div>
          <div className={styles.gstDetailItem}>
            <span className={styles.gstDetailLabel}>Effective Tax Rate</span>
            <span className={`${styles.gstDetailValue} ${styles.gstMono}`}>{(gstRate + cessRate).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className={styles.gstDetailSection}>
        <h4 className={styles.gstDetailHeading}>
          <i className="ti ti-receipt-tax" aria-hidden="true" />
          Tax Component Split
        </h4>
        <div className={styles.gstTaxBars}>
          {calculation.supplyType === "INTRA_STATE" ? (
            <>
              <div className={styles.gstTaxBarItem}>
                <div className={styles.gstTaxBarHeader}>
                  <span className={styles.gstTaxBarLabel}>
                    <i className="ti ti-building" aria-hidden="true" />
                    CGST (Central GST)
                  </span>
                  <strong className={styles.gstTaxBarAmount}>{formatCurrency(calculation.cgst)}</strong>
                </div>
                <div className={styles.gstTaxBarTrack}>
                  <div
                    className={`${styles.gstTaxBarFill} ${styles.gstBarCgst}`}
                    style={{
                      width: `${calculation.totalTax > 0 ? (calculation.cgst / calculation.totalTax) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={styles.gstTaxBarRate}>{(calculation.gstRate / 2).toFixed(2)}%</span>
              </div>

              <div className={styles.gstTaxBarItem}>
                <div className={styles.gstTaxBarHeader}>
                  <span className={styles.gstTaxBarLabel}>
                    <i className="ti ti-map-pin" aria-hidden="true" />
                    SGST (State GST)
                  </span>
                  <strong className={styles.gstTaxBarAmount}>{formatCurrency(calculation.sgst)}</strong>
                </div>
                <div className={styles.gstTaxBarTrack}>
                  <div
                    className={`${styles.gstTaxBarFill} ${styles.gstBarSgst}`}
                    style={{
                      width: `${calculation.totalTax > 0 ? (calculation.sgst / calculation.totalTax) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={styles.gstTaxBarRate}>{(calculation.gstRate / 2).toFixed(2)}%</span>
              </div>
            </>
          ) : (
            <div className={styles.gstTaxBarItem}>
              <div className={styles.gstTaxBarHeader}>
                <span className={styles.gstTaxBarLabel}>
                  <i className="ti ti-route" aria-hidden="true" />
                  IGST (Integrated GST)
                </span>
                <strong className={styles.gstTaxBarAmount}>{formatCurrency(calculation.igst)}</strong>
              </div>
              <div className={styles.gstTaxBarTrack}>
                <div
                  className={`${styles.gstTaxBarFill} ${styles.gstBarIgst}`}
                  style={{
                    width: `${calculation.totalTax > 0 ? (calculation.igst / calculation.totalTax) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className={styles.gstTaxBarRate}>{calculation.gstRate.toFixed(2)}%</span>
            </div>
          )}

          {calculation.cess > 0 && (
            <div className={styles.gstTaxBarItem}>
              <div className={styles.gstTaxBarHeader}>
                <span className={styles.gstTaxBarLabel}>
                  <i className="ti ti-plus-minus" aria-hidden="true" />
                  Cess (Compensation)
                </span>
                <strong className={styles.gstTaxBarAmount}>{formatCurrency(calculation.cess)}</strong>
              </div>
              <div className={styles.gstTaxBarTrack}>
                <div
                  className={`${styles.gstTaxBarFill} ${styles.gstBarCess}`}
                  style={{
                    width: `${calculation.totalTax > 0 ? (calculation.cess / calculation.totalTax) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className={styles.gstTaxBarRate}>{calculation.cessRate.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.gstDetailSection}>
        <h4 className={styles.gstDetailHeading}>
          <i className="ti ti-calculator" aria-hidden="true" />
          Calculation Steps
        </h4>
        <div className={styles.gstCalcSteps}>
          {calculation.breakdown.map((step, index) => (
            <div key={index} className={styles.gstCalcStep}>
              <div className={styles.gstStepNum}>{index + 1}</div>
              <div className={styles.gstStepContent}>
                <strong className={styles.gstStepTitle}>{step.description}</strong>
                <div className={styles.gstStepFormula}>
                  <code>{step.formula}</code>
                </div>
                <div className={styles.gstStepResult}>
                  <i className="ti ti-arrow-right" aria-hidden="true" />
                  <strong>{formatCurrency(step.result)}</strong>
                </div>
              </div>
            </div>
          ))}

          <div className={`${styles.gstCalcStep} ${styles.gstStepFinal}`}>
            <div className={styles.gstStepNum}>
              <i className="ti ti-check" aria-hidden="true" />
            </div>
            <div className={styles.gstStepContent}>
              <strong className={styles.gstStepTitle}>Final Result</strong>
              <div className={styles.gstStepSummary}>
                <div className={styles.gstSummaryItem}>
                  <span>Base Amount:</span>
                  <strong>{formatCurrency(calculation.baseAmount)}</strong>
                </div>
                <div className={styles.gstSummaryItem}>
                  <span>Total Tax:</span>
                  <strong>{formatCurrency(calculation.totalTax)}</strong>
                </div>
                <div className={`${styles.gstSummaryItem} ${styles.gstSummaryTotal}`}>
                  <span>Final Amount:</span>
                  <strong>{formatCurrency(calculation.finalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}