// features/finance/gst-calculator/ResultDetails.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import type { GSTCalculationResult } from "./gstEngine";

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
        <div className="gst-result-details">
            <div className="gst-detail-section">
                <h4 className="gst-detail-heading">
                    <i className="ti ti-info-circle" aria-hidden="true" />
                    Input Summary
                </h4>
                <div className="gst-detail-grid">
                    <div className="gst-detail-item">
                        <span className="gst-detail-label">Calculation Mode</span>
                        <span className="gst-detail-value">
                            {mode === "ADD_GST" ? "Add GST (Forward)" : "Remove GST (Reverse)"}
                        </span>
                    </div>
                    <div className="gst-detail-item">
                        <span className="gst-detail-label">Supply Type</span>
                        <span className="gst-detail-value">
                            {supplyType === "INTRA_STATE" ? "Intra-State" : "Inter-State"}
                        </span>
                    </div>
                    <div className="gst-detail-item">
                        <span className="gst-detail-label">Input Amount</span>
                        <span className="gst-detail-value gst-mono">{formatCurrency(inputAmount)}</span>
                    </div>
                    <div className="gst-detail-item">
                        <span className="gst-detail-label">GST Rate</span>
                        <span className="gst-detail-value gst-mono">{gstRate.toFixed(2)}%</span>
                    </div>
                    {cessRate > 0 && (
                        <div className="gst-detail-item">
                            <span className="gst-detail-label">Cess Rate</span>
                            <span className="gst-detail-value gst-mono">{cessRate.toFixed(2)}%</span>
                        </div>
                    )}
                    <div className="gst-detail-item">
                        <span className="gst-detail-label">Quantity</span>
                        <span className="gst-detail-value">{quantity} unit{quantity > 1 ? "s" : ""}</span>
                    </div>
                    <div className="gst-detail-item">
                        <span className="gst-detail-label">Effective Tax Rate</span>
                        <span className="gst-detail-value gst-mono">{(gstRate + cessRate).toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            <div className="gst-detail-section">
                <h4 className="gst-detail-heading">
                    <i className="ti ti-receipt-tax" aria-hidden="true" />
                    Tax Component Split
                </h4>
                <div className="gst-tax-bars">
                    {calculation.supplyType === "INTRA_STATE" ? (
                        <>
                            <div className="gst-tax-bar-item">
                                <div className="gst-tax-bar-header">
                                    <span className="gst-tax-bar-label">
                                        <i className="ti ti-building" aria-hidden="true" />
                                        CGST (Central GST)
                                    </span>
                                    <strong className="gst-tax-bar-amount">{formatCurrency(calculation.cgst)}</strong>
                                </div>
                                <div className="gst-tax-bar-track">
                                    <div
                                        className="gst-tax-bar-fill gst-bar-cgst"
                                        style={{
                                            width: `${calculation.totalTax > 0 ? (calculation.cgst / calculation.totalTax) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                                <span className="gst-tax-bar-rate">{(calculation.gstRate / 2).toFixed(2)}%</span>
                            </div>

                            <div className="gst-tax-bar-item">
                                <div className="gst-tax-bar-header">
                                    <span className="gst-tax-bar-label">
                                        <i className="ti ti-map-pin" aria-hidden="true" />
                                        SGST (State GST)
                                    </span>
                                    <strong className="gst-tax-bar-amount">{formatCurrency(calculation.sgst)}</strong>
                                </div>
                                <div className="gst-tax-bar-track">
                                    <div
                                        className="gst-tax-bar-fill gst-bar-sgst"
                                        style={{
                                            width: `${calculation.totalTax > 0 ? (calculation.sgst / calculation.totalTax) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                                <span className="gst-tax-bar-rate">{(calculation.gstRate / 2).toFixed(2)}%</span>
                            </div>
                        </>
                    ) : (
                        <div className="gst-tax-bar-item">
                            <div className="gst-tax-bar-header">
                                <span className="gst-tax-bar-label">
                                    <i className="ti ti-route" aria-hidden="true" />
                                    IGST (Integrated GST)
                                </span>
                                <strong className="gst-tax-bar-amount">{formatCurrency(calculation.igst)}</strong>
                            </div>
                            <div className="gst-tax-bar-track">
                                <div
                                    className="gst-tax-bar-fill gst-bar-igst"
                                    style={{
                                        width: `${calculation.totalTax > 0 ? (calculation.igst / calculation.totalTax) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <span className="gst-tax-bar-rate">{calculation.gstRate.toFixed(2)}%</span>
                        </div>
                    )}

                    {calculation.cess > 0 && (
                        <div className="gst-tax-bar-item">
                            <div className="gst-tax-bar-header">
                                <span className="gst-tax-bar-label">
                                    <i className="ti ti-plus-minus" aria-hidden="true" />
                                    Cess (Compensation)
                                </span>
                                <strong className="gst-tax-bar-amount">{formatCurrency(calculation.cess)}</strong>
                            </div>
                            <div className="gst-tax-bar-track">
                                <div
                                    className="gst-tax-bar-fill gst-bar-cess"
                                    style={{
                                        width: `${calculation.totalTax > 0 ? (calculation.cess / calculation.totalTax) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <span className="gst-tax-bar-rate">{calculation.cessRate.toFixed(2)}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="gst-detail-section">
                <h4 className="gst-detail-heading">
                    <i className="ti ti-calculator" aria-hidden="true" />
                    Calculation Steps
                </h4>
                <div className="gst-calc-steps">
                    {calculation.breakdown.map((step, index) => (
                        <div key={index} className="gst-calc-step">
                            <div className="gst-step-num">{index + 1}</div>
                            <div className="gst-step-content">
                                <strong className="gst-step-title">{step.description}</strong>
                                <div className="gst-step-formula">
                                    <code>{step.formula}</code>
                                </div>
                                <div className="gst-step-result">
                                    <i className="ti ti-arrow-right" aria-hidden="true" />
                                    <strong>{formatCurrency(step.result)}</strong>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="gst-calc-step gst-step-final">
                        <div className="gst-step-num">
                            <i className="ti ti-check" aria-hidden="true" />
                        </div>
                        <div className="gst-step-content">
                            <strong className="gst-step-title">Final Result</strong>
                            <div className="gst-step-summary">
                                <div className="gst-summary-item">
                                    <span>Base Amount:</span>
                                    <strong>{formatCurrency(calculation.baseAmount)}</strong>
                                </div>
                                <div className="gst-summary-item">
                                    <span>Total Tax:</span>
                                    <strong>{formatCurrency(calculation.totalTax)}</strong>
                                </div>
                                <div className="gst-summary-item gst-summary-total">
                                    <span>Final Amount:</span>
                                    <strong>{formatCurrency(calculation.finalAmount)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .gst-result-details {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: var(--font-sans);
        }

        .gst-detail-section {
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .gst-detail-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .gst-detail-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .gst-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
        }

        .gst-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gst-detail-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
        }

        .gst-detail-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .gst-mono {
          font-family: var(--font-mono);
        }

        .gst-tax-bars {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .gst-tax-bar-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gst-tax-bar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .gst-tax-bar-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .gst-tax-bar-label i {
          font-size: 14px;
        }

        .gst-tax-bar-amount {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .gst-tax-bar-track {
          height: 8px;
          background: var(--border-faint);
          border-radius: 99px;
          overflow: hidden;
        }

        .gst-tax-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gst-bar-cgst {
          background: linear-gradient(90deg, #2563EB, #3B82F6);
        }

        .gst-bar-sgst {
          background: linear-gradient(90deg, #7C3AED, #8B5CF6);
        }

        .gst-bar-igst {
          background: linear-gradient(90deg, var(--brand), var(--brand-hover));
        }

        .gst-bar-cess {
          background: linear-gradient(90deg, #D97706, #F59E0B);
        }

        .gst-tax-bar-rate {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .gst-calc-steps {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .gst-calc-step {
          display: flex;
          gap: 12px;
        }

        .gst-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .gst-step-final .gst-step-num {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
        }

        .gst-step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gst-step-title {
          font-size: 13px;
          color: var(--text);
        }

        .gst-step-formula {
          padding: 8px 10px;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          border: 0.5px solid var(--border);
        }

        .gst-step-formula code {
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          word-break: break-word;
        }

        .gst-step-result {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: var(--brand-light);
          border-radius: var(--radius-sm);
          border: 0.5px solid var(--brand-border);
        }

        .gst-step-result i {
          font-size: 14px;
          color: var(--brand);
        }

        .gst-step-result strong {
          font-size: 13px;
          font-weight: 700;
          color: var(--brand-text);
          font-family: var(--font-mono);
        }

        .gst-step-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gst-summary-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          border: 0.5px solid var(--border);
          font-size: 12.5px;
        }

        .gst-summary-item span {
          color: var(--text-secondary);
        }

        .gst-summary-item strong {
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .gst-summary-total {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .gst-summary-total strong {
          color: var(--brand-text);
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .gst-result-details {
            padding: 16px;
            gap: 20px;
          }

          .gst-detail-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .gst-detail-heading {
            font-size: 12px;
            padding: 10px 14px;
          }

          .gst-detail-heading i {
            font-size: 14px;
          }

          .gst-detail-label {
            font-size: 10.5px;
          }

          .gst-detail-value {
            font-size: 12px;
          }

          .gst-tax-bars {
            padding: 12px;
            gap: 12px;
          }

          .gst-tax-bar-label {
            font-size: 11.5px;
          }

          .gst-tax-bar-label i {
            font-size: 12px;
          }

          .gst-tax-bar-amount {
            font-size: 12px;
          }

          .gst-tax-bar-rate {
            font-size: 10px;
          }

          .gst-step-num {
            width: 24px;
            height: 24px;
            font-size: 11px;
          }

          .gst-step-title {
            font-size: 12px;
          }

          .gst-step-formula code {
            font-size: 11px;
          }

          .gst-step-result {
            padding: 5px 8px;
            gap: 4px;
          }

          .gst-step-result i {
            font-size: 12px;
          }

          .gst-step-result strong {
            font-size: 12px;
          }

          .gst-summary-item {
            padding: 6px 10px;
            gap: 6px;
            font-size: 11.5px;
          }

          .gst-summary-item span {
            font-size: 10.5px;
          }

          .gst-summary-item strong {
            font-size: 11.5px;
          }

          .gst-action-btn {
            height: 32px;
            padding: 0 12px;
            font-size: 12px;
          }

          .gst-action-btn i {
            font-size: 13px;
          }

          .gst-spin {
            animation-duration: 0.6s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gst-tax-bar-fill {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}