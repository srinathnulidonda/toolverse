// features/finance/sip-calculator/SIPInputForm.tsx
"use client";

import styles from "./style/SIPInputForm.module.css";

type SIPInputFormProps = {
  mode: "regular" | "step-up" | "goal-based";
  monthlyInvestment: string;
  expectedReturn: string;
  tenureValue: string;
  tenureUnit: "years" | "months";
  lumpSum: string;
  inflationRate: string;
  stepUpPercentage: string;
  goalAmount: string;
  onModeChange: (value: "regular" | "step-up" | "goal-based") => void;
  onMonthlyInvestmentChange: (value: string) => void;
  onExpectedReturnChange: (value: string) => void;
  onTenureValueChange: (value: string) => void;
  onTenureUnitChange: (value: "years" | "months") => void;
  onLumpSumChange: (value: string) => void;
  onInflationRateChange: (value: string) => void;
  onStepUpPercentageChange: (value: string) => void;
  onGoalAmountChange: (value: string) => void;
  hasCalculation: boolean;
  onViewResults: () => void;
};

const MODE_OPTIONS: {
  id: "regular" | "step-up" | "goal-based";
  icon: string;
  label: string;
  desc: string;
}[] = [
  { id: "regular", icon: "ti-repeat", label: "Regular SIP", desc: "Fixed amount every month" },
  { id: "step-up", icon: "ti-trending-up", label: "Step-Up SIP", desc: "Increase amount yearly" },
  { id: "goal-based", icon: "ti-target", label: "Goal-Based SIP", desc: "Solve for a target corpus" },
];

export function SIPInputForm({
  mode,
  monthlyInvestment,
  expectedReturn,
  tenureValue,
  tenureUnit,
  lumpSum,
  inflationRate,
  stepUpPercentage,
  goalAmount,
  onModeChange,
  onMonthlyInvestmentChange,
  onExpectedReturnChange,
  onTenureValueChange,
  onTenureUnitChange,
  onLumpSumChange,
  onInflationRateChange,
  onStepUpPercentageChange,
  onGoalAmountChange,
  hasCalculation,
  onViewResults,
}: SIPInputFormProps) {
  const isStepUp = mode === "step-up";
  const isGoalBased = mode === "goal-based";

  const returnNum = parseFloat(expectedReturn) || 0;
  const stepUpNum = parseFloat(stepUpPercentage) || 0;
  const tenureNum = parseInt(tenureValue, 10) || 0;
  const tenureInMonths = tenureUnit === "years" ? tenureNum * 12 : tenureNum;

  return (
    <div className={styles.sipInputForm}>
      <div className={styles.sipFormSection}>
        <h4 className={styles.sipSectionTitle}>
          <i className="ti ti-adjustments" aria-hidden="true" />
          Investment Type
        </h4>

        <div className={styles.sipModeGrid}>
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`${styles.sipModeCard}${mode === opt.id ? ` ${styles.active}` : ""}`}
              onClick={() => onModeChange(opt.id)}
              aria-pressed={mode === opt.id}
            >
              <span className={styles.sipModeIcon}>
                <i className={`ti ${opt.icon}`} aria-hidden="true" />
              </span>
              <span className={styles.sipModeText}>
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </span>
              <span className={styles.sipModeCheck}>
                <i className="ti ti-check" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sipFormSection}>
        <h4 className={styles.sipSectionTitle}>
          <i className="ti ti-calculator" aria-hidden="true" />
          Investment Details
        </h4>

        <div className={styles.sipFormGrid}>
          {!isGoalBased && (
            <div className={styles.sipField}>
              <label htmlFor="sip-monthly" className={styles.sipLabel}>
                Monthly Investment
                <span className={styles.sipRequired}>*</span>
              </label>
              <div className={styles.sipAmountField}>
                <span className={styles.sipCurrencySymbol}>₹</span>
                <input
                  id="sip-monthly"
                  type="number"
                  inputMode="decimal"
                  className={styles.sipAmountInput}
                  value={monthlyInvestment}
                  onChange={(e) => onMonthlyInvestmentChange(e.target.value)}
                  placeholder="5000"
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>
          )}

          {isGoalBased && (
            <div className={styles.sipField}>
              <label htmlFor="sip-goal" className={styles.sipLabel}>
                Target Amount
                <span className={styles.sipRequired}>*</span>
              </label>
              <div className={styles.sipAmountField}>
                <span className={styles.sipCurrencySymbol}>₹</span>
                <input
                  id="sip-goal"
                  type="number"
                  inputMode="decimal"
                  className={styles.sipAmountInput}
                  value={goalAmount}
                  onChange={(e) => onGoalAmountChange(e.target.value)}
                  placeholder="1000000"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <p className={styles.sipFieldHelp}>
                Your lump sum (if any) is applied first; the required SIP covers the remaining gap
              </p>
            </div>
          )}

          <div className={styles.sipField}>
            <label htmlFor="sip-lumpsum" className={styles.sipLabel}>
              Lump Sum Investment
            </label>
            <div className={styles.sipAmountField}>
              <span className={styles.sipCurrencySymbol}>₹</span>
              <input
                id="sip-lumpsum"
                type="number"
                inputMode="decimal"
                className={styles.sipAmountInput}
                value={lumpSum}
                onChange={(e) => onLumpSumChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <p className={styles.sipFieldHelp}>Optional one-time investment at start</p>
          </div>

          <div className={styles.sipField}>
            <label htmlFor="sip-tenure" className={styles.sipLabel}>
              Investment Tenure
              <span className={styles.sipRequired}>*</span>
            </label>
            <div className={styles.sipCombinedField}>
              <input
                id="sip-tenure"
                type="number"
                inputMode="numeric"
                className={styles.sipInput}
                value={tenureValue}
                onChange={(e) => onTenureValueChange(e.target.value)}
                placeholder="10"
                min="1"
                step="1"
                required
                aria-describedby="sip-tenure-hint"
              />
              <select
                className={styles.sipUnitSelect}
                value={tenureUnit}
                onChange={(e) => onTenureUnitChange(e.target.value as "years" | "months")}
                aria-label="Tenure unit"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
            {tenureInMonths > 0 && tenureInMonths < 12 && (
              <p id="sip-tenure-hint" className={`${styles.sipFieldHint} ${styles.warning}`}>
                <i className="ti ti-info-circle" aria-hidden="true" />
                Short tenures limit the benefit of compounding
              </p>
            )}
          </div>

          <div className={styles.sipField}>
            <label htmlFor="sip-return" className={styles.sipLabel}>
              Expected Annual Return
              <span className={styles.sipRequired}>*</span>
            </label>
            <div className={styles.sipPercentField}>
              <input
                id="sip-return"
                type="number"
                inputMode="decimal"
                className={styles.sipPercentInput}
                value={expectedReturn}
                onChange={(e) => onExpectedReturnChange(e.target.value)}
                placeholder="12"
                min="0.1"
                max="30"
                step="0.1"
                required
                aria-describedby="sip-return-hint"
              />
              <span className={styles.sipPercentSymbol}>%</span>
            </div>
            {returnNum > 20 ? (
              <p id="sip-return-hint" className={`${styles.sipFieldHint} ${styles.error}`}>
                <i className="ti ti-alert-triangle" aria-hidden="true" />
                Very aggressive assumption — most equity funds average 10%–15% p.a.
              </p>
            ) : (
              <p id="sip-return-hint" className={styles.sipFieldHelp}>
                Typical range: 8%–15% p.a. for equity funds
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sipFormSection}>
        <h4 className={styles.sipSectionTitle}>
          <i className="ti ti-settings" aria-hidden="true" />
          Advanced Options
        </h4>
        <p className={styles.sipSectionHelp}>
          Fine-tune your projection with inflation and step-up assumptions
        </p>

        <div className={styles.sipFormGrid}>
          <div className={styles.sipField}>
            <label htmlFor="sip-inflation" className={styles.sipLabel}>
              Inflation Rate
            </label>
            <div className={styles.sipPercentField}>
              <input
                id="sip-inflation"
                type="number"
                inputMode="decimal"
                className={styles.sipPercentInput}
                value={inflationRate}
                onChange={(e) => onInflationRateChange(e.target.value)}
                placeholder="6"
                min="0"
                max="20"
                step="0.1"
              />
              <span className={styles.sipPercentSymbol}>%</span>
            </div>
            <p className={styles.sipFieldHelp}>Used to calculate real (inflation-adjusted) returns</p>
          </div>

          {isStepUp && (
            <div className={styles.sipField}>
              <label htmlFor="sip-stepup" className={styles.sipLabel}>
                Annual Step-Up
                <span className={styles.sipRequired}>*</span>
              </label>
              <div className={styles.sipPercentField}>
                <input
                  id="sip-stepup"
                  type="number"
                  inputMode="decimal"
                  className={styles.sipPercentInput}
                  value={stepUpPercentage}
                  onChange={(e) => onStepUpPercentageChange(e.target.value)}
                  placeholder="10"
                  min="0"
                  max="50"
                  step="0.1"
                  required
                  aria-describedby="sip-stepup-hint"
                />
                <span className={styles.sipPercentSymbol}>%</span>
              </div>
              {stepUpNum > 25 ? (
                <p id="sip-stepup-hint" className={`${styles.sipFieldHint} ${styles.warning}`}>
                  <i className="ti ti-info-circle" aria-hidden="true" />
                  High step-up rates can be hard to sustain year after year
                </p>
              ) : (
                <p id="sip-stepup-hint" className={styles.sipFieldHelp}>
                  Increase in SIP amount every year
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {hasCalculation && (
        <div className={styles.sipFormActions}>
          <button
            type="button"
            className={styles.sipViewResultsBtn}
            onClick={onViewResults}
            aria-label="View calculation results"
          >
            <i className="ti ti-arrow-right" aria-hidden="true" />
            <span className={styles.sipBtnContent}>
              <strong>View Results</strong>
              <span className={styles.sipBtnDesc}>See your SIP projection</span>
            </span>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}