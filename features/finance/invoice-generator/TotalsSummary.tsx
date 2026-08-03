// features/finance/invoice-generator/TotalsSummary.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import type { InvoiceTotals, CurrencyCode } from "./invoiceEngine";

type TotalsSummaryProps = {
    totals: InvoiceTotals;
    currency: CurrencyCode;
    discountType: "FLAT" | "PERCENT";
    discountValue: string;
    onDiscountTypeChange: (value: "FLAT" | "PERCENT") => void;
    onDiscountValueChange: (value: string) => void;
};

export function TotalsSummary({
    totals,
    currency,
    discountType,
    discountValue,
    onDiscountTypeChange,
    onDiscountValueChange,
}: TotalsSummaryProps) {
    return (
        <div className="inv-totals">
            <h3 className="inv-totals-title">
                <i className="ti ti-calculator" aria-hidden="true" />
                Invoice Totals
            </h3>

            <div className="inv-discount-section">
                <label className="inv-discount-label">Discount (Optional)</label>
                <div className="inv-discount-controls">
                    <input
                        type="number"
                        className="inv-discount-input"
                        value={discountValue}
                        onChange={(e) => onDiscountValueChange(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                    />
                    <select
                        className="inv-discount-type"
                        value={discountType}
                        onChange={(e) => onDiscountTypeChange(e.target.value as "FLAT" | "PERCENT")}
                    >
                        <option value="FLAT">Flat Amount</option>
                        <option value="PERCENT">Percentage %</option>
                    </select>
                </div>
            </div>

            <div className="inv-totals-list">
                <div className="inv-totals-item">
                    <div className="inv-totals-label">
                        <i className="ti ti-receipt" aria-hidden="true" />
                        Subtotal
                    </div>
                    <div className="inv-totals-value">{formatCurrency(totals.subtotal, currency)}</div>
                </div>

                {totals.taxGroups.length > 0 && (
                    <>
                        <div className="inv-totals-divider" />
                        <div className="inv-totals-subtitle">
                            <i className="ti ti-percentage" aria-hidden="true" />
                            Tax Breakdown
                        </div>
                    </>
                )}

                {totals.taxGroups.map((group, index) => (
                    <div key={index} className="inv-totals-item">
                        <div className="inv-totals-label">
                            <i className="ti ti-tax" aria-hidden="true" />
                            Tax @ {group.rate.toFixed(2)}%
                        </div>
                        <div className="inv-totals-value">{formatCurrency(group.taxAmount, currency)}</div>
                    </div>
                ))}

                {totals.discountAmount > 0 && (
                    <>
                        <div className="inv-totals-divider" />
                        <div className="inv-totals-item inv-item-discount">
                            <div className="inv-totals-label">
                                <i className="ti ti-discount" aria-hidden="true" />
                                Discount
                            </div>
                            <div className="inv-totals-value">−{formatCurrency(totals.discountAmount, currency)}</div>
                        </div>
                    </>
                )}

                <div className="inv-totals-divider" />

                <div className="inv-totals-item inv-item-grand">
                    <div className="inv-totals-label">
                        <i className="ti ti-sum" aria-hidden="true" />
                        Grand Total
                    </div>
                    <div className="inv-totals-value">{formatCurrency(totals.grandTotal, currency)}</div>
                </div>
            </div>

            <style jsx>{`
        .inv-totals {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inv-totals-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .inv-totals-title i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .inv-discount-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inv-discount-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .inv-discount-controls {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .inv-discount-input {
          height: 36px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-mono);
          outline: none;
          transition: all 0.12s;
        }

        .inv-discount-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .inv-discount-type {
          height: 36px;
          padding: 0 32px 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 12px;
          font-family: var(--font-sans);
          cursor: pointer;
          outline: none;
          transition: all 0.12s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        .inv-discount-type:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .inv-totals-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border-faint);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .inv-totals-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: var(--bg-card);
          gap: 12px;
        }

        .inv-totals-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          flex: 1;
          font-family: var(--font-sans);
        }

        .inv-totals-label i {
          font-size: 15px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .inv-totals-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
          white-space: nowrap;
        }

        .inv-totals-divider {
          height: 0.5px;
          background: var(--border);
        }

        .inv-totals-subtitle {
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
          font-family: var(--font-sans);
        }

        .inv-totals-subtitle i {
          font-size: 12px;
        }

        .inv-item-discount .inv-totals-value {
          color: #B91C1C;
        }

        @media (prefers-color-scheme: dark) {
          .inv-item-discount .inv-totals-value {
            color: #F87171;
          }
        }

        .inv-item-grand {
          background: var(--bg-surface);
        }

        .inv-item-grand .inv-totals-label {
          color: var(--text);
          font-weight: 600;
        }

        .inv-item-grand .inv-totals-value {
          color: var(--brand-text);
          font-size: 15px;
          font-weight: 700;
        }

        @media (prefers-reduced-motion: reduce) {
          .inv-discount-input,
          .inv-discount-type {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}