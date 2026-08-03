// features/finance/emi-calculator/LoanInputForm.tsx

"use client";

import { formatCurrency } from "@/lib/utils";

type LoanInputFormProps = {
  loanAmount: string;
  interestRate: string;
  tenureValue: string;
  tenureUnit: 'years' | 'months';
  loanStartDate: string;
  loanType: string;
  prepaymentType: 'none' | 'one-time' | 'recurring';
  prepaymentAmount: string;
  prepaymentMonth: string;
  onLoanAmountChange: (value: string) => void;
  onInterestRateChange: (value: string) => void;
  onTenureValueChange: (value: string) => void;
  onTenureUnitChange: (value: 'years' | 'months') => void;
  onLoanStartDateChange: (value: string) => void;
  onLoanTypeChange: (value: string) => void;
  onPrepaymentTypeChange: (value: 'none' | 'one-time' | 'recurring') => void;
  onPrepaymentAmountChange: (value: string) => void;
  onPrepaymentMonthChange: (value: string) => void;
  isValidForm: boolean;
  hasCalculation: boolean;
  onViewResults: () => void;
};

export function LoanInputForm({
  loanAmount,
  interestRate,
  tenureValue,
  tenureUnit,
  loanStartDate,
  loanType,
  prepaymentType,
  prepaymentAmount,
  prepaymentMonth,
  onLoanAmountChange,
  onInterestRateChange,
  onTenureValueChange,
  onTenureUnitChange,
  onLoanStartDateChange,
  onLoanTypeChange,
  onPrepaymentTypeChange,
  onPrepaymentAmountChange,
  onPrepaymentMonthChange,
  isValidForm,
  hasCalculation,
  onViewResults,
}: LoanInputFormProps) {
  const tenureUnitOptions = [
    { value: 'years' as const, label: 'Years' },
    { value: 'months' as const, label: 'Months' },
  ] as const;

  const prepaymentTypeOptions = [
    { value: 'none' as const, label: 'No Prepayment' },
    { value: 'one-time' as const, label: 'One-time Lump Sum' },
    { value: 'recurring' as const, label: 'Recurring Extra Payment' },
  ] as const;

  const prepaymentAmountNum = parseFloat(prepaymentAmount) || 0;
  const prepaymentMonthNum = parseInt(prepaymentMonth, 10) || 0;
  const tenureValueNum = parseInt(tenureValue, 10) || 0;
  const interestRateNum = parseFloat(interestRate) || 0;

  return (
    <div className="emi-input-form">
      <div className="emi-form-section">
        <h4 className="emi-section-title">
          <i className="ti ti-home" aria-hidden="true" />
          Loan Details
        </h4>

        <div className="emi-form-grid">
          <div className="emi-field">
            <label htmlFor="loan-amount" className="emi-label">
              Loan Amount
              <span className="emi-required">*</span>
            </label>
            <div className="emi-amount-field">
              <span className="emi-currency-symbol">₹</span>
              <input
                id="loan-amount"
                type="number"
                className="emi-amount-input"
                value={loanAmount}
                onChange={(e) => onLoanAmountChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="emi-field">
            <label htmlFor="interest-rate" className="emi-label">
              Interest Rate (% p.a.)
              <span className="emi-required">*</span>
            </label>
            <div className="emi-amount-field">
              <input
                id="interest-rate"
                type="number"
                className="emi-amount-input"
                value={interestRate}
                onChange={(e) => onInterestRateChange(e.target.value)}
                placeholder="0.00"
                min="0"
                max="50"
                step="0.01"
                required
              />
              <span className="emi-currency-symbol">%</span>
            </div>
          </div>

          <div className="emi-field">
            <label htmlFor="tenure-value" className="emi-label">
              Tenure Value
              <span className="emi-required">*</span>
            </label>
            <div className="emi-amount-field">
              <input
                id="tenure-value"
                type="number"
                className="emi-amount-input"
                value={tenureValue}
                onChange={(e) => onTenureValueChange(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          <div className="emi-field">
            <label htmlFor="tenure-unit" className="emi-label">
              Tenure Unit
              <span className="emi-required">*</span>
            </label>
            <select
              id="tenure-unit"
              className="emi-input"
              value={tenureUnit}
              onChange={(e) => onTenureUnitChange(e.target.value as 'years' | 'months')}
              required
            >
              {tenureUnitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="emi-field">
          <label htmlFor="loan-type" className="emi-label">
            Loan Type
            <span className="emi-required">*</span>
          </label>
          <select
            id="loan-type"
            className="emi-input"
            value={loanType}
            onChange={(e) => onLoanTypeChange(e.target.value)}
            required
          >
            <option value="">Select Loan Type</option>
            <option value="home">Home Loan</option>
            <option value="car">Car Loan</option>
            <option value="personal">Personal Loan</option>
            <option value="education">Education Loan</option>
          </select>
          <p className="emi-field-help">Select the type of loan</p>
        </div>
      </div>

      <div className="emi-form-section">
        <h4 className="emi-section-title">
          <i className="ti ti-calendar" aria-hidden="true" />
          Loan Start Date
        </h4>

        <div className="emi-field">
          <label htmlFor="loan-start-date" className="emi-label">
            Loan Start Date
            <span className="emi-required">*</span>
          </label>
          <input
            id="loan-start-date"
            type="date"
            className="emi-input"
            value={loanStartDate}
            onChange={(e) => onLoanStartDateChange(e.target.value)}
            required
          />
          <p className="emi-field-help">Date when your loan EMI starts</p>
        </div>
      </div>

      <div className="emi-form-section">
        <h4 className="emi-section-title">
          <i className="ti ti-cash" aria-hidden="true" />
          Prepayment Options
        </h4>
        <p className="emi-section-help">Optional: Add prepayment to reduce interest and tenure</p>

        <div className="emi-form-grid">
          <div className="emi-field">
            <label htmlFor="prepayment-type" className="emi-label">
              Prepayment Type
              <span className="emi-required">*</span>
            </label>
            <select
              id="prepayment-type"
              className="emi-input"
              value={prepaymentType}
              onChange={(e) => onPrepaymentTypeChange(e.target.value as 'none' | 'one-time' | 'recurring')}
              required
            >
              {prepaymentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {prepaymentType !== 'none' && (
            <>
              <div className="emi-field">
                <label htmlFor="prepayment-amount" className="emi-label">
                  Prepayment Amount (₹)
                  {prepaymentType === 'one-time' && (
                    <span className="emi-required">*</span>
                  )}
                </label>
                <div className="emi-amount-field">
                  <span className="emi-currency-symbol">₹</span>
                  <input
                    id="prepayment-amount"
                    type="number"
                    className="emi-amount-input"
                    value={prepaymentAmount}
                    onChange={(e) => onPrepaymentAmountChange(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required={prepaymentType === 'one-time'}
                  />
                </div>
                {prepaymentType === 'one-time' && prepaymentAmountNum > 0 && (
                  <p className="emi-field-help">One-time lump sum payment</p>
                )}
                {prepaymentType === 'recurring' && prepaymentAmountNum > 0 && (
                  <p className="emi-field-help">Extra amount added to regular EMI each month</p>
                )}
              </div>

              <div className="emi-field">
                <label htmlFor="prepayment-month" className="emi-label">
                  Prepayment Month
                  {prepaymentType === 'one-time' && (
                    <span className="emi-required">*</span>
                  )}
                </label>
                <input
                  id="prepayment-month"
                  type="number"
                  className="emi-input"
                  value={prepaymentMonth}
                  onChange={(e) => onPrepaymentMonthChange(e.target.value)}
                  min="1"
                  step="1"
                  required={prepaymentType === 'one-time'}
                />
                {prepaymentType === 'one-time' && (
                  <p className="emi-field-help">Month in which lump sum payment is made (1-based)</p>
                )}
                {prepaymentType === 'recurring' && (
                  <p className="emi-field-help">Starting month for recurring extra payments (1-based)</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {hasCalculation && (
        <div className="emi-form-actions">
          <button
            type="button"
            className="emi-view-results-btn"
            onClick={onViewResults}
            aria-label="View calculation results"
          >
            <i className="ti ti-arrow-right" aria-hidden="true" />
            <span className="emi-btn-content">
              <strong>View Results</strong>
              <span className="emi-btn-desc">See your EMI calculation</span>
            </span>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}

      <style jsx>{`
        .emi-input-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .emi-form-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .emi-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .emi-section-title i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .emi-section-help {
          font-size: 12px;
          color: var(--text-secondary);
          margin: -8px 0 0 0;
          line-height: 1.5;
          font-family: var(--font-sans);
        }

        .emi-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .emi-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .emi-field-full {
          grid-column: 1 / -1;
        }

        .emi-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-sans);
        }

        .emi-required {
          color: #B91C1C;
          font-size: 13px;
        }

        @media (prefers-color-scheme: dark) {
          .emi-required {
            color: #F87171;
          }
        }

        .emi-input {
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

        .emi-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .emi-input::placeholder {
          color: var(--text-disabled);
        }

        .emi-amount-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .emi-currency-symbol {
          position: absolute;
          left: 12px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-tertiary);
          pointer-events: none;
          font-family: var(--font-sans);
        }

        .emi-amount-input {
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

        .emi-amount-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .emi-field-help {
          font-size: 11px;
          color: var(--text-tertiary);
          margin: 0;
          line-height: 1.4;
          font-family: var(--font-sans);
        }

        .emi-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .emi-checkbox-wrapper {
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

        .emi-checkbox-wrapper:hover {
          background: var(--border-faint);
          border-color: var(--brand-border);
        }

        .emi-checkbox-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .emi-checkbox-box {
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

        .emi-checkbox-box i {
          font-size: 13px;
          color: white;
          opacity: 0;
          transform: scale(0.7);
          transition: all 0.12s;
        }

        .emi-checkbox-input:checked + .emi-checkbox-box {
          background: var(--brand);
          border-color: var(--brand);
        }

        .emi-checkbox-input:checked + .emi-checkbox-box i {
          opacity: 1;
          transform: scale(1);
        }

        .emi-checkbox-label {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .emi-checkbox-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .emi-form-actions {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 0.5px solid var(--border-faint);
          display: none;
        }

        .emi-view-results-btn {
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

        .emi-view-results-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .emi-view-results-btn:hover::before {
          left: 100%;
        }

        .emi-view-results-btn:hover {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(20, 92, 60, 0.2);
        }

        @media (prefers-color-scheme: dark) {
          .emi-view-results-btn:hover {
            box-shadow: 0 4px 16px rgba(76, 175, 130, 0.2);
          }
        }

        .emi-view-results-btn > i:first-child {
          font-size: 18px;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .emi-btn-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .emi-btn-content strong {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
        }

        .emi-btn-desc {
          font-size: 12px;
          opacity: 0.8;
          line-height: 1.3;
        }

        .emi-view-results-btn > i:last-child {
          font-size: 16px;
          flex-shrink: 0;
          opacity: 0.6;
          transition: transform 0.15s;
        }

        .emi-view-results-btn:hover > i:last-child {
          transform: translateX(3px);
          opacity: 1;
        }

        @media (max-width: 768px) {
          .emi-input-form {
            padding: 16px;
          }

          .emi-form-grid {
            grid-template-columns: 1fr;
          }

          .emi-form-actions {
            display: block;
          }

          .emi-view-results-btn {
            padding: 14px 16px;
          }

          .emi-btn-content strong {
            font-size: 13px;
          }

          .emi-btn-desc {
            font-size: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .emi-input,
          .emi-amount-input,
          .emi-checkbox-wrapper,
          .emi-checkbox-box,
          .emi-checkbox-box i,
          .emi-view-results-btn,
          .emi-view-results-btn::before,
          .emi-view-results-btn > i:last-child {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}