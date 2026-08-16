// features/finance/itc-calculator/InvoiceInputForm.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import styles from "./style/InvoiceInputForm.module.css";

type InvoiceInputFormProps = {
  invoiceNumber: string;
  invoiceDate: string;
  claimDate: string;
  gstinSupplier: string;
  totalInvoiceValue: string;
  gstPaid: string;
  itcClaimedInBooks: string;
  itcAvailableInGSTR2B: string;
  isCapitalGood: boolean;
  checkTimeLimit: boolean;
  daysPastDue: string;
  amountPaid: string;
  totalPayable: string;
  onInvoiceNumberChange: (value: string) => void;
  onInvoiceDateChange: (value: string) => void;
  onClaimDateChange: (value: string) => void;
  onGstinSupplierChange: (value: string) => void;
  onTotalInvoiceValueChange: (value: string) => void;
  onGstPaidChange: (value: string) => void;
  onItcClaimedInBooksChange: (value: string) => void;
  onItcAvailableInGSTR2BChange: (value: string) => void;
  onIsCapitalGoodChange: (value: boolean) => void;
  onCheckTimeLimitChange: (value: boolean) => void;
  onDaysPastDueChange: (value: string) => void;
  onAmountPaidChange: (value: string) => void;
  onTotalPayableChange: (value: string) => void;
  isValidForm: boolean;
  hasCalculation: boolean;
  onViewResults: () => void;
};

export function InvoiceInputForm({
  invoiceNumber,
  invoiceDate,
  claimDate,
  gstinSupplier,
  totalInvoiceValue,
  gstPaid,
  itcClaimedInBooks,
  itcAvailableInGSTR2B,
  isCapitalGood,
  checkTimeLimit,
  daysPastDue,
  amountPaid,
  totalPayable,
  onInvoiceNumberChange,
  onInvoiceDateChange,
  onClaimDateChange,
  onGstinSupplierChange,
  onTotalInvoiceValueChange,
  onGstPaidChange,
  onItcClaimedInBooksChange,
  onItcAvailableInGSTR2BChange,
  onIsCapitalGoodChange,
  onCheckTimeLimitChange,
  onDaysPastDueChange,
  onAmountPaidChange,
  onTotalPayableChange,
  isValidForm,
  hasCalculation,
  onViewResults,
}: InvoiceInputFormProps) {
  const daysPastDueNum = parseInt(daysPastDue, 10) || 0;
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const totalPayableNum = parseFloat(totalPayable) || 0;

  return (
    <div className={styles.itcInputForm}>
      <div className={styles.itcFormSection}>
        <h4 className={styles.itcSectionTitle}>
          <i className="ti ti-file-invoice" aria-hidden="true" />
          Basic Information
        </h4>

        <div className={styles.itcFormGrid}>
          <div className={styles.itcField}>
            <label htmlFor="invoice-number" className={styles.itcLabel}>
              Invoice Number
              <span className={styles.itcRequired}>*</span>
            </label>
            <input
              id="invoice-number"
              type="text"
              className={styles.itcInput}
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              placeholder="e.g., INV-2024-001"
              required
            />
          </div>

          <div className={styles.itcField}>
            <label htmlFor="invoice-date" className={styles.itcLabel}>
              Invoice Date
              <span className={styles.itcRequired}>*</span>
            </label>
            <input
              id="invoice-date"
              type="date"
              className={styles.itcInput}
              value={invoiceDate}
              onChange={(e) => onInvoiceDateChange(e.target.value)}
              required
            />
          </div>

          <div className={styles.itcField}>
            <label htmlFor="claim-date" className={styles.itcLabel}>
              Claim Date
              <span className={styles.itcRequired}>*</span>
            </label>
            <input
              id="claim-date"
              type="date"
              className={styles.itcInput}
              value={claimDate}
              onChange={(e) => onClaimDateChange(e.target.value)}
              required
            />
            <p className={styles.itcFieldHelp}>Date when you're claiming this ITC</p>
          </div>

          <div className={`${styles.itcField} ${styles.itcFieldFull}`}>
            <label htmlFor="gstin-supplier" className={styles.itcLabel}>
              Supplier GSTIN
              <span className={styles.itcRequired}>*</span>
            </label>
            <input
              id="gstin-supplier"
              type="text"
              className={`${styles.itcInput} ${styles.itcInputMono}`}
              value={gstinSupplier}
              onChange={(e) => onGstinSupplierChange(e.target.value.toUpperCase())}
              placeholder="27AAPFU0939F1ZV"
              maxLength={15}
              required
            />
            <p className={styles.itcFieldHelp}>15-character alphanumeric GSTIN</p>
          </div>
        </div>

        <div className={styles.itcCheckboxGroup}>
          <label className={styles.itcCheckboxWrapper}>
            <input
              type="checkbox"
              className={styles.itcCheckboxInput}
              checked={isCapitalGood}
              onChange={(e) => onIsCapitalGoodChange(e.target.checked)}
            />
            <span className={styles.itcCheckboxBox}>
              <i className="ti ti-check" aria-hidden="true" />
            </span>
            <span className={styles.itcCheckboxLabel}>
              <strong>Capital Goods Asset</strong>
              <span className={styles.itcCheckboxDesc}>Different reversal rules may apply</span>
            </span>
          </label>

          <label className={styles.itcCheckboxWrapper}>
            <input
              type="checkbox"
              className={styles.itcCheckboxInput}
              checked={checkTimeLimit}
              onChange={(e) => onCheckTimeLimitChange(e.target.checked)}
            />
            <span className={styles.itcCheckboxBox}>
              <i className="ti ti-check" aria-hidden="true" />
            </span>
            <span className={styles.itcCheckboxLabel}>
              <strong>Apply Time Limit Check (Section 16(4))</strong>
              <span className={styles.itcCheckboxDesc}>Disable if invoice is recent or time limit not relevant</span>
            </span>
          </label>
        </div>
      </div>

      <div className={styles.itcFormSection}>
        <h4 className={styles.itcSectionTitle}>
          <i className="ti ti-calculator" aria-hidden="true" />
          Financial Details
        </h4>

        <div className={styles.itcFormGrid}>
          <div className={styles.itcField}>
            <label htmlFor="total-invoice-value" className={styles.itcLabel}>
              Total Invoice Value
              <span className={styles.itcRequired}>*</span>
            </label>
            <div className={styles.itcAmountField}>
              <span className={styles.itcCurrencySymbol}>₹</span>
              <input
                id="total-invoice-value"
                type="number"
                className={styles.itcAmountInput}
                value={totalInvoiceValue}
                onChange={(e) => onTotalInvoiceValueChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className={styles.itcField}>
            <label htmlFor="gst-paid" className={styles.itcLabel}>
              GST Paid
              <span className={styles.itcRequired}>*</span>
            </label>
            <div className={styles.itcAmountField}>
              <span className={styles.itcCurrencySymbol}>₹</span>
              <input
                id="gst-paid"
                type="number"
                className={styles.itcAmountInput}
                value={gstPaid}
                onChange={(e) => onGstPaidChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className={styles.itcField}>
            <label htmlFor="itc-books" className={styles.itcLabel}>
              ITC Claimed (Books)
              <span className={styles.itcRequired}>*</span>
            </label>
            <div className={styles.itcAmountField}>
              <span className={styles.itcCurrencySymbol}>₹</span>
              <input
                id="itc-books"
                type="number"
                className={styles.itcAmountInput}
                value={itcClaimedInBooks}
                onChange={(e) => onItcClaimedInBooksChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className={styles.itcField}>
            <label htmlFor="itc-gstr2b" className={styles.itcLabel}>
              ITC Available (GSTR-2B)
              <span className={styles.itcRequired}>*</span>
            </label>
            <div className={styles.itcAmountField}>
              <span className={styles.itcCurrencySymbol}>₹</span>
              <input
                id="itc-gstr2b"
                type="number"
                className={styles.itcAmountInput}
                value={itcAvailableInGSTR2B}
                onChange={(e) => onItcAvailableInGSTR2BChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.itcFormSection}>
        <h4 className={styles.itcSectionTitle}>
          <i className="ti ti-cash" aria-hidden="true" />
          Supplier Payment Status
        </h4>
        <p className={styles.itcSectionHelp}>Required for Rule 37 compliance (180 days payment limit)</p>

        <div className={styles.itcFormGrid}>
          <div className={styles.itcField}>
            <label htmlFor="days-past-due" className={styles.itcLabel}>
              Days Past Due
            </label>
            <input
              id="days-past-due"
              type="number"
              className={styles.itcInput}
              value={daysPastDue}
              onChange={(e) => onDaysPastDueChange(e.target.value)}
              min="0"
              step="1"
            />
            {daysPastDueNum > 0 && (
              <p className={`${styles.itcFieldHint} ${daysPastDueNum > 180 ? "error" : "warning"}`}>
                <i
                  className={`ti ${daysPastDueNum > 180 ? "ti-alert-triangle" : "ti-info-circle"}`}
                  aria-hidden="true"
                />
                {daysPastDueNum > 180
                  ? "Exceeds 180 days - ITC reversal required"
                  : "Within time limit"}
              </p>
            )}
          </div>

          <div className={styles.itcField}>
            <label htmlFor="amount-paid" className={styles.itcLabel}>
              Amount Paid
            </label>
            <div className={styles.itcAmountField}>
              <span className={styles.itcCurrencySymbol}>₹</span>
              <input
                id="amount-paid"
                type="number"
                className={styles.itcAmountInput}
                value={amountPaid}
                onChange={(e) => onAmountPaidChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className={styles.itcField}>
            <label htmlFor="total-payable" className={styles.itcLabel}>
              Total Payable
            </label>
            <div className={styles.itcAmountField}>
              <span className={styles.itcCurrencySymbol}>₹</span>
              <input
                id="total-payable"
                type="number"
                className={styles.itcAmountInput}
                value={totalPayable}
                onChange={(e) => onTotalPayableChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {totalPayableNum > 0 && (
          <div className={styles.itcPaymentProgress}>
            <div className={styles.itcProgressHeader}>
              <span className={styles.itcProgressLabel}>Payment Progress</span>
              <span className={styles.itcProgressValue}>
                {formatCurrency(amountPaidNum)} / {formatCurrency(totalPayableNum)}
              </span>
              <strong className={styles.itcProgressPercent}>
                {((amountPaidNum / totalPayableNum) * 100).toFixed(1)}%
              </strong>
            </div>
            <div className={styles.itcProgressBar}>
              <div
                className={styles.itcProgressFill}
                style={{
                  width: `${Math.min(100, (amountPaidNum / totalPayableNum) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {hasCalculation && (
        <div className={styles.itcFormActions}>
          <button
            type="button"
            className={styles.itcViewResultsBtn}
            onClick={onViewResults}
            aria-label="View calculation results"
          >
            <i className="ti ti-arrow-right" aria-hidden="true" />
            <span className={styles.itcBtnContent}>
              <strong>View Results</strong>
              <span className={styles.itcBtnDesc}>See your ITC calculation</span>
            </span>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}