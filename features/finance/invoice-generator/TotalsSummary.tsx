// features/finance/invoice-generator/TotalsSummary.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { InvoiceTotals, CurrencyCode } from "./ts/invoiceEngine";
import styles from "./style/TotalsSummary.module.css";

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
    <div className={styles.invTotals}>
      <h3 className={styles.invTotalsTitle}>
        <i className="ti ti-calculator" aria-hidden="true" />
        Invoice Totals
      </h3>

      <div className={styles.invDiscountSection}>
        <label className={styles.invDiscountLabel}>Discount (Optional)</label>
        <div className={styles.invDiscountControls}>
          <input
            type="number"
            className={styles.invDiscountInput}
            value={discountValue}
            onChange={(e) => onDiscountValueChange(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
          <select
            className={styles.invDiscountType}
            value={discountType}
            onChange={(e) => onDiscountTypeChange(e.target.value as "FLAT" | "PERCENT")}
          >
            <option value="FLAT">Flat Amount</option>
            <option value="PERCENT">Percentage %</option>
          </select>
        </div>
      </div>

      <div className={styles.invTotalsList}>
        <div className={styles.invTotalsItem}>
          <div className={styles.invTotalsLabel}>
            <i className="ti ti-receipt" aria-hidden="true" />
            Subtotal
          </div>
          <div className={styles.invTotalsValue}>{formatCurrency(totals.subtotal, currency)}</div>
        </div>

        {totals.taxGroups.length > 0 && (
          <>
            <div className={styles.invTotalsDivider} />
            <div className={styles.invTotalsSubtitle}>
              <i className="ti ti-percentage" aria-hidden="true" />
              Tax Breakdown
            </div>
          </>
        )}

        {totals.taxGroups.map((group, index) => (
          <div key={index} className={styles.invTotalsItem}>
            <div className={styles.invTotalsLabel}>
              <i className="ti ti-tax" aria-hidden="true" />
              Tax @ {group.rate.toFixed(2)}%
            </div>
            <div className={styles.invTotalsValue}>{formatCurrency(group.taxAmount, currency)}</div>
          </div>
        ))}

        {totals.discountAmount > 0 && (
          <>
            <div className={styles.invTotalsDivider} />
            <div className={`${styles.invTotalsItem} ${styles.invItemDiscount}`}>
              <div className={styles.invTotalsLabel}>
                <i className="ti ti-discount" aria-hidden="true" />
                Discount
              </div>
              <div className={styles.invTotalsValue}>−{formatCurrency(totals.discountAmount, currency)}</div>
            </div>
          </>
        )}

        <div className={styles.invTotalsDivider} />

        <div className={`${styles.invTotalsItem} ${styles.invItemGrand}`}>
          <div className={styles.invTotalsLabel}>
            <i className="ti ti-sum" aria-hidden="true" />
            Grand Total
          </div>
          <div className={styles.invTotalsValue}>{formatCurrency(totals.grandTotal, currency)}</div>
        </div>
      </div>
    </div>
  );
}