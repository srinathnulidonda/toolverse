// features/finance/emi-calculator/LoanInputForm.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import styles from "./style/LoanInputForm.module.css";

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
    <div className={styles.emiInputForm}>
      <div className={styles.emiFormSection}>
        <h4 className={styles.emiSectionTitle}>
          <i className="ti ti-home" aria-hidden="true" />
          Loan Details
        </h4>

        <div className={styles.emiFormGrid}>
          <div className={styles.emiField}>
            <label htmlFor="loan-amount" className={styles.emiLabel}>
              Loan Amount
              <span className={styles.emiRequired}>*</span>
            </label>
            <div className={styles.emiAmountField}>
              <span className={styles.emiCurrencySymbol}>₹</span>
              <input
                id="loan-amount"
                type="number"
                className={styles.emiAmountInput}
                value={loanAmount}
                onChange={(e) => onLoanAmountChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className={styles.emiField}>
            <label htmlFor="interest-rate" className={styles.emiLabel}>
              Interest Rate (% p.a.)
              <span className={styles.emiRequired}>*</span>
            </label>
            <div className={styles.emiAmountField}>
              <input
                id="interest-rate"
                type="number"
                className={styles.emiAmountInput}
                value={interestRate}
                onChange={(e) => onInterestRateChange(e.target.value)}
                placeholder="0.00"
                min="0"
                max="50"
                step="0.01"
                required
              />
              <span className={styles.emiCurrencySymbol}>%</span>
            </div>
          </div>

          <div className={styles.emiField}>
            <label htmlFor="tenure-value" className={styles.emiLabel}>
              Tenure Value
              <span className={styles.emiRequired}>*</span>
            </label>
            <div className={styles.emiAmountField}>
              <input
                id="tenure-value"
                type="number"
                className={styles.emiAmountInput}
                value={tenureValue}
                onChange={(e) => onTenureValueChange(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          <div className={styles.emiField}>
            <label htmlFor="tenure-unit" className={styles.emiLabel}>
              Tenure Unit
              <span className={styles.emiRequired}>*</span>
            </label>
            <select
              id="tenure-unit"
              className={styles.emiInput}
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

        <div className={styles.emiField}>
          <label htmlFor="loan-type" className={styles.emiLabel}>
            Loan Type
            <span className={styles.emiRequired}>*</span>
          </label>
          <select
            id="loan-type"
            className={styles.emiInput}
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
          <p className={styles.emiFieldHelp}>Select the type of loan</p>
        </div>
      </div>

      <div className={styles.emiFormSection}>
        <h4 className={styles.emiSectionTitle}>
          <i className="ti ti-calendar" aria-hidden="true" />
          Loan Start Date
        </h4>

        <div className={styles.emiField}>
          <label htmlFor="loan-start-date" className={styles.emiLabel}>
            Loan Start Date
            <span className={styles.emiRequired}>*</span>
          </label>
          <input
            id="loan-start-date"
            type="date"
            className={styles.emiInput}
            value={loanStartDate}
            onChange={(e) => onLoanStartDateChange(e.target.value)}
            required
          />
          <p className={styles.emiFieldHelp}>Date when your loan EMI starts</p>
        </div>
      </div>

      <div className={styles.emiFormSection}>
        <h4 className={styles.emiSectionTitle}>
          <i className="ti ti-cash" aria-hidden="true" />
          Prepayment Options
        </h4>
        <p className={styles.emiSectionHelp}>Optional: Add prepayment to reduce interest and tenure</p>

        <div className={styles.emiFormGrid}>
          <div className={styles.emiField}>
            <label htmlFor="prepayment-type" className={styles.emiLabel}>
              Prepayment Type
              <span className={styles.emiRequired}>*</span>
            </label>
            <select
              id="prepayment-type"
              className={styles.emiInput}
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
              <div className={styles.emiField}>
                <label htmlFor="prepayment-amount" className={styles.emiLabel}>
                  Prepayment Amount (₹)
                  {prepaymentType === 'one-time' && (
                    <span className={styles.emiRequired}>*</span>
                  )}
                </label>
                <div className={styles.emiAmountField}>
                  <span className={styles.emiCurrencySymbol}>₹</span>
                  <input
                    id="prepayment-amount"
                    type="number"
                    className={styles.emiAmountInput}
                    value={prepaymentAmount}
                    onChange={(e) => onPrepaymentAmountChange(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required={prepaymentType === 'one-time'}
                  />
                </div>
                {prepaymentType === 'one-time' && prepaymentAmountNum > 0 && (
                  <p className={styles.emiFieldHelp}>One-time lump sum payment</p>
                )}
                {prepaymentType === 'recurring' && prepaymentAmountNum > 0 && (
                  <p className={styles.emiFieldHelp}>Extra amount added to regular EMI each month</p>
                )}
              </div>

              <div className={styles.emiField}>
                <label htmlFor="prepayment-month" className={styles.emiLabel}>
                  Prepayment Month
                  {prepaymentType === 'one-time' && (
                    <span className={styles.emiRequired}>*</span>
                  )}
                </label>
                <input
                  id="prepayment-month"
                  type="number"
                  className={styles.emiInput}
                  value={prepaymentMonth}
                  onChange={(e) => onPrepaymentMonthChange(e.target.value)}
                  min="1"
                  step="1"
                  required={prepaymentType === 'one-time'}
                />
                {prepaymentType === 'one-time' && (
                  <p className={styles.emiFieldHelp}>Month in which lump sum payment is made (1-based)</p>
                )}
                {prepaymentType === 'recurring' && (
                  <p className={styles.emiFieldHelp}>Starting month for recurring extra payments (1-based)</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {hasCalculation && (
        <div className={styles.emiFormActions}>
          <button
            type="button"
            className={styles.emiViewResultsBtn}
            onClick={onViewResults}
            aria-label="View calculation results"
          >
            <i className="ti ti-arrow-right" aria-hidden="true" />
            <span className={styles.emiBtnContent}>
              <strong>View Results</strong>
              <span className={styles.emiBtnDesc}>See your EMI calculation</span>
            </span>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}