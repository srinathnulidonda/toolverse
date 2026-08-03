// features/finance/itc-calculator/InvoiceInputForm.tsx

"use client";

import { formatCurrency } from "@/lib/utils";

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
    <div className="itc-input-form">
      <div className="itc-form-section">
        <h4 className="itc-section-title">
          <i className="ti ti-file-invoice" aria-hidden="true" />
          Basic Information
        </h4>

        <div className="itc-form-grid">
          <div className="itc-field">
            <label htmlFor="invoice-number" className="itc-label">
              Invoice Number
              <span className="itc-required">*</span>
            </label>
            <input
              id="invoice-number"
              type="text"
              className="itc-input"
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              placeholder="e.g., INV-2024-001"
              required
            />
          </div>

          <div className="itc-field">
            <label htmlFor="invoice-date" className="itc-label">
              Invoice Date
              <span className="itc-required">*</span>
            </label>
            <input
              id="invoice-date"
              type="date"
              className="itc-input"
              value={invoiceDate}
              onChange={(e) => onInvoiceDateChange(e.target.value)}
              required
            />
          </div>

          <div className="itc-field">
            <label htmlFor="claim-date" className="itc-label">
              Claim Date
              <span className="itc-required">*</span>
            </label>
            <input
              id="claim-date"
              type="date"
              className="itc-input"
              value={claimDate}
              onChange={(e) => onClaimDateChange(e.target.value)}
              required
            />
            <p className="itc-field-help">Date when you're claiming this ITC</p>
          </div>

          <div className="itc-field itc-field-full">
            <label htmlFor="gstin-supplier" className="itc-label">
              Supplier GSTIN
              <span className="itc-required">*</span>
            </label>
            <input
              id="gstin-supplier"
              type="text"
              className="itc-input itc-input-mono"
              value={gstinSupplier}
              onChange={(e) => onGstinSupplierChange(e.target.value.toUpperCase())}
              placeholder="27AAPFU0939F1ZV"
              maxLength={15}
              required
            />
            <p className="itc-field-help">15-character alphanumeric GSTIN</p>
          </div>
        </div>

        <div className="itc-checkbox-group">
          <label className="itc-checkbox-wrapper">
            <input
              type="checkbox"
              className="itc-checkbox-input"
              checked={isCapitalGood}
              onChange={(e) => onIsCapitalGoodChange(e.target.checked)}
            />
            <span className="itc-checkbox-box">
              <i className="ti ti-check" aria-hidden="true" />
            </span>
            <span className="itc-checkbox-label">
              <strong>Capital Goods Asset</strong>
              <span className="itc-checkbox-desc">Different reversal rules may apply</span>
            </span>
          </label>

          <label className="itc-checkbox-wrapper">
            <input
              type="checkbox"
              className="itc-checkbox-input"
              checked={checkTimeLimit}
              onChange={(e) => onCheckTimeLimitChange(e.target.checked)}
            />
            <span className="itc-checkbox-box">
              <i className="ti ti-check" aria-hidden="true" />
            </span>
            <span className="itc-checkbox-label">
              <strong>Apply Time Limit Check (Section 16(4))</strong>
              <span className="itc-checkbox-desc">Disable if invoice is recent or time limit not relevant</span>
            </span>
          </label>
        </div>
      </div>

      <div className="itc-form-section">
        <h4 className="itc-section-title">
          <i className="ti ti-calculator" aria-hidden="true" />
          Financial Details
        </h4>

        <div className="itc-form-grid">
          <div className="itc-field">
            <label htmlFor="total-invoice-value" className="itc-label">
              Total Invoice Value
              <span className="itc-required">*</span>
            </label>
            <div className="itc-amount-field">
              <span className="itc-currency-symbol">₹</span>
              <input
                id="total-invoice-value"
                type="number"
                className="itc-amount-input"
                value={totalInvoiceValue}
                onChange={(e) => onTotalInvoiceValueChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="itc-field">
            <label htmlFor="gst-paid" className="itc-label">
              GST Paid
              <span className="itc-required">*</span>
            </label>
            <div className="itc-amount-field">
              <span className="itc-currency-symbol">₹</span>
              <input
                id="gst-paid"
                type="number"
                className="itc-amount-input"
                value={gstPaid}
                onChange={(e) => onGstPaidChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="itc-field">
            <label htmlFor="itc-books" className="itc-label">
              ITC Claimed (Books)
              <span className="itc-required">*</span>
            </label>
            <div className="itc-amount-field">
              <span className="itc-currency-symbol">₹</span>
              <input
                id="itc-books"
                type="number"
                className="itc-amount-input"
                value={itcClaimedInBooks}
                onChange={(e) => onItcClaimedInBooksChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="itc-field">
            <label htmlFor="itc-gstr2b" className="itc-label">
              ITC Available (GSTR-2B)
              <span className="itc-required">*</span>
            </label>
            <div className="itc-amount-field">
              <span className="itc-currency-symbol">₹</span>
              <input
                id="itc-gstr2b"
                type="number"
                className="itc-amount-input"
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

      <div className="itc-form-section">
        <h4 className="itc-section-title">
          <i className="ti ti-cash" aria-hidden="true" />
          Supplier Payment Status
        </h4>
        <p className="itc-section-help">Required for Rule 37 compliance (180 days payment limit)</p>

        <div className="itc-form-grid">
          <div className="itc-field">
            <label htmlFor="days-past-due" className="itc-label">
              Days Past Due
            </label>
            <input
              id="days-past-due"
              type="number"
              className="itc-input"
              value={daysPastDue}
              onChange={(e) => onDaysPastDueChange(e.target.value)}
              min="0"
              step="1"
            />
            {daysPastDueNum > 0 && (
              <p className={`itc-field-hint ${daysPastDueNum > 180 ? "error" : "warning"}`}>
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

          <div className="itc-field">
            <label htmlFor="amount-paid" className="itc-label">
              Amount Paid
            </label>
            <div className="itc-amount-field">
              <span className="itc-currency-symbol">₹</span>
              <input
                id="amount-paid"
                type="number"
                className="itc-amount-input"
                value={amountPaid}
                onChange={(e) => onAmountPaidChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="itc-field">
            <label htmlFor="total-payable" className="itc-label">
              Total Payable
            </label>
            <div className="itc-amount-field">
              <span className="itc-currency-symbol">₹</span>
              <input
                id="total-payable"
                type="number"
                className="itc-amount-input"
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
          <div className="itc-payment-progress">
            <div className="itc-progress-header">
              <span className="itc-progress-label">Payment Progress</span>
              <span className="itc-progress-value">
                {formatCurrency(amountPaidNum)} / {formatCurrency(totalPayableNum)}
              </span>
              <strong className="itc-progress-percent">
                {((amountPaidNum / totalPayableNum) * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="itc-progress-bar">
              <div
                className="itc-progress-fill"
                style={{
                  width: `${Math.min(100, (amountPaidNum / totalPayableNum) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {hasCalculation && (
        <div className="itc-form-actions">
          <button
            type="button"
            className="itc-view-results-btn"
            onClick={onViewResults}
            aria-label="View calculation results"
          >
            <i className="ti ti-arrow-right" aria-hidden="true" />
            <span className="itc-btn-content">
              <strong>View Results</strong>
              <span className="itc-btn-desc">See your ITC calculation</span>
            </span>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}

      <style jsx>{`
        .itc-input-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .itc-form-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .itc-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .itc-section-title i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .itc-section-help {
          font-size: 12px;
          color: var(--text-secondary);
          margin: -8px 0 0 0;
          line-height: 1.5;
          font-family: var(--font-sans);
        }

        .itc-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .itc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .itc-field-full {
          grid-column: 1 / -1;
        }

        .itc-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-sans);
        }

        .itc-required {
          color: #B91C1C;
          font-size: 13px;
        }

        @media (prefers-color-scheme: dark) {
          .itc-required {
            color: #F87171;
          }
        }

        .itc-input {
          height: 40px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.12s;
        }

        .itc-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .itc-input::placeholder {
          color: var(--text-disabled);
        }

        .itc-input-mono {
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .itc-amount-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .itc-currency-symbol {
          position: absolute;
          left: 12px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-tertiary);
          pointer-events: none;
          font-family: var(--font-sans);
        }

        .itc-amount-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 32px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          font-family: var(--font-mono);
          outline: none;
          transition: all 0.12s;
        }

        .itc-amount-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .itc-field-help {
          font-size: 11px;
          color: var(--text-tertiary);
          margin: 0;
          line-height: 1.4;
          font-family: var(--font-sans);
        }

        .itc-field-hint {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          margin: 0;
          line-height: 1.4;
          font-family: var(--font-sans);
        }

        .itc-field-hint i {
          font-size: 12px;
        }

        .itc-field-hint.error {
          color: #B91C1C;
        }

        .itc-field-hint.warning {
          color: #D97706;
        }

        @media (prefers-color-scheme: dark) {
          .itc-field-hint.error {
            color: #F87171;
          }
          .itc-field-hint.warning {
            color: #FBBF24;
          }
        }

        .itc-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .itc-checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          cursor: pointer;
          transition: all 0.12s;
        }

        .itc-checkbox-wrapper:hover {
          background: var(--border-faint);
          border-color: var(--brand-border);
        }

        .itc-checkbox-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .itc-checkbox-box {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border);
          border-radius: 4px;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.12s;
        }

        .itc-checkbox-box i {
          font-size: 13px;
          color: white;
          opacity: 0;
          transform: scale(0.7);
          transition: all 0.12s;
        }

        .itc-checkbox-input:checked + .itc-checkbox-box {
          background: var(--brand);
          border-color: var(--brand);
        }

        .itc-checkbox-input:checked + .itc-checkbox-box i {
          opacity: 1;
          transform: scale(1);
        }

        .itc-checkbox-label {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .itc-checkbox-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .itc-payment-progress {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .itc-progress-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          font-family: var(--font-sans);
        }

        .itc-progress-label {
          color: var(--text-secondary);
        }

        .itc-progress-value {
          color: var(--text);
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .itc-progress-percent {
          margin-left: auto;
          font-weight: 600;
          color: var(--brand);
          font-family: var(--font-mono);
        }

        .itc-progress-bar {
          height: 6px;
          background: var(--border-faint);
          border-radius: 99px;
          overflow: hidden;
        }

        .itc-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--brand), var(--brand-hover));
          border-radius: 99px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .itc-form-actions {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 0.5px solid var(--border-faint);
          display: none;
        }

        .itc-view-results-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-lg);
          background: var(--brand-light);
          color: var(--brand-text);
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .itc-view-results-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .itc-view-results-btn:hover::before {
          left: 100%;
        }

        .itc-view-results-btn:hover {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(20, 92, 60, 0.2);
        }

        @media (prefers-color-scheme: dark) {
          .itc-view-results-btn:hover {
            box-shadow: 0 4px 16px rgba(76, 175, 130, 0.2);
          }
        }

        .itc-view-results-btn > i:first-child {
          font-size: 18px;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .itc-btn-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .itc-btn-content strong {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
        }

        .itc-btn-desc {
          font-size: 12px;
          opacity: 0.8;
          line-height: 1.3;
        }

        .itc-view-results-btn > i:last-child {
          font-size: 16px;
          flex-shrink: 0;
          opacity: 0.6;
          transition: transform 0.15s;
        }

        .itc-view-results-btn:hover > i:last-child {
          transform: translateX(3px);
          opacity: 1;
        }

        @media (max-width: 768px) {
          .itc-input-form {
            padding: 16px;
          }

          .itc-form-grid {
            grid-template-columns: 1fr;
          }

          .itc-form-actions {
            display: block;
          }

          .itc-view-results-btn {
            padding: 14px 16px;
          }

          .itc-btn-content strong {
            font-size: 13px;
          }

          .itc-btn-desc {
            font-size: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .itc-input,
          .itc-amount-input,
          .itc-checkbox-wrapper,
          .itc-checkbox-box,
          .itc-checkbox-box i,
          .itc-progress-fill,
          .itc-view-results-btn,
          .itc-view-results-btn::before,
          .itc-view-results-btn > i:last-child {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}