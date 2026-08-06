// features/finance/emi-calculator/ResultDetails.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { EMICalculationResult, EMIInput } from "./ts/emiEngine";
import styles from "./style/ResultDetails.module.css";

type ResultDetailsProps = {
  calculation: EMICalculationResult;
  loanAmount: number;
  interestRate: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  loanStartDate: string;
  loanType: string;
  prepaymentType: 'none' | 'one-time' | 'recurring';
  prepaymentAmount?: number;
  prepaymentMonth?: number;
};

export function ResultDetails({
  calculation,
  loanAmount,
  interestRate,
  tenureValue,
  tenureUnit,
  loanStartDate,
  loanType,
  prepaymentType,
  prepaymentAmount,
  prepaymentMonth,
}: ResultDetailsProps) {
  const tenureInMonths = tenureUnit === 'years' ? tenureValue * 12 : tenureValue;
  const tenureDisplay = tenureUnit === 'years'
    ? `${tenureValue} years (${tenureInMonths} months)`
    : `${tenureValue} months`;

  const startDateFormatted = new Date(loanStartDate).toLocaleDateString();

  return (
    <div className={styles.emiResultDetails}>
      <div className={styles.emiDetailSection}>
        <h4 className={styles.emiDetailHeading}>
          <i className="ti ti-home" aria-hidden="true" />
          Loan Summary
        </h4>
        <div className={styles.emiDetailGrid}>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Loan Type</span>
            <span className={`${styles.emiDetailValue} ${styles.emiMono}`}>{loanType}</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Loan Amount</span>
            <span className={`${styles.emiDetailValue} ${styles.emiMono}`}>{formatCurrency(loanAmount)}</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Interest Rate</span>
            <span className={styles.emiDetailValue}>{interestRate}% p.a.</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Loan Tenure</span>
            <span className={styles.emiDetailValue}>{tenureDisplay}</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Loan Start Date</span>
            <span className={styles.emiDetailValue}>{startDateFormatted}</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Prepayment Plan</span>
            <span className={styles.emiDetailValue}>
              {prepaymentType === 'none' ? 'None' :
                prepaymentType === 'one-time' ?
                  `One-time: ${formatCurrency(prepaymentAmount || 0)} at month ${prepaymentMonth || '-'}` :
                  `Recurring: ${formatCurrency(prepaymentAmount || 0)} per month from month ${prepaymentMonth || '-'}`
              }
            </span>
          </div>
        </div>
      </div>

      <div className={styles.emiDetailSection}>
        <h4 className={styles.emiDetailHeading}>
          <i className="ti ti-calculator" aria-hidden="true" />
          EMI Calculation Details
        </h4>
        <div className={styles.emiDetailGrid}>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Monthly EMI</span>
            <span className={`${styles.emiDetailValue} ${styles.emiMono}`}>{formatCurrency(calculation.emi)}</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Total Interest Payable</span>
            <span className={`${styles.emiDetailValue} ${styles.emiMono}`}>{formatCurrency(calculation.totalInterest)}</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Total Amount Payable</span>
            <span className={`${styles.emiDetailValue} ${styles.emiMono}`}>{formatCurrency(calculation.totalPayment)}</span>
          </div>
          <div className={styles.emiDetailItem}>
            <span className={styles.emiDetailLabel}>Total Principal</span>
            <span className={`${styles.emiDetailValue} ${styles.emiMono}`}>{formatCurrency(calculation.principalVsInterestRatio.principal)}</span>
          </div>
        </div>
      </div>

      <div className={styles.emiDetailSection}>
        <h4 className={styles.emiDetailHeading}>
          <i className="ti ti-chart-pie" aria-hidden="true" />
          Principal vs Interest Ratio
        </h4>
        <div className={styles.emiRatioChart}>
          <div className={styles.emiRatioItem}>
            <div className={styles.emiRatioLabel}>Principal Component</div>
            <div className={`${styles.emiRatioValue} ${styles.emiMono}`}>
              {formatCurrency(calculation.principalVsInterestRatio.principal)}
            </div>
          </div>
          <div className={styles.emiRatioBar}>
            <div
              className={`${styles.emiRatioFill} ${styles.emiBarPrincipal}`}
              style={{
                width: `${(calculation.principalVsInterestRatio.principal /
                  (calculation.principalVsInterestRatio.principal + calculation.principalVsInterestRatio.interest)) * 100}%`
              }}
            />
          </div>
          <div className={styles.emiRatioItem}>
            <div className={styles.emiRatioLabel}>Interest Component</div>
            <div className={`${styles.emiRatioValue} ${styles.emiMono}`}>
              {formatCurrency(calculation.principalVsInterestRatio.interest)}
            </div>
          </div>
          <div className={styles.emiRatioBar}>
            <div
              className={`${styles.emiRatioFill} ${styles.emiBarInterest}`}
              style={{
                width: `${(calculation.principalVsInterestRatio.interest /
                  (calculation.principalVsInterestRatio.principal + calculation.principalVsInterestRatio.interest)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.emiDetailSection}>
        <h4 className={styles.emiDetailHeading}>
          <i className="ti ti-calculator" aria-hidden="true" />
          Calculation Steps
        </h4>
        <div className={styles.emiCalcSteps}>
          <div className={styles.emiCalcStep}>
            <div className={styles.emiStepNum}>1</div>
            <div className={styles.emiStepContent}>
              <strong className={styles.emiStepTitle}>Convert Annual Rate to Monthly</strong>
              <p className={styles.emiStepDesc}>Divide annual interest rate by 12 and 100</p>
              <div className={styles.emiStepFormula}>
                <code>
                  r = {interestRate}% ÷ 12 ÷ 100 = <strong>{(interestRate / 12 / 100).toFixed(6)}</strong>
                </code>
              </div>
            </div>
          </div>

          <div className={styles.emiCalcStep}>
            <div className={styles.emiStepNum}>2</div>
            <div className={styles.emiStepContent}>
              <strong className={styles.emiStepTitle}>Calculate Compound Factor</strong>
              <p className={styles.emiStepDesc}>(1 + r)^n where n is total months</p>
              <div className={styles.emiStepFormula}>
                <code>
                  (1 + {((interestRate / 12 / 100).toFixed(6))})^{tenureInMonths} = <strong>{Math.pow(1 + (interestRate / 12 / 100), tenureInMonths).toFixed(6)}</strong>
                </code>
              </div>
            </div>
          </div>

          <div className={styles.emiCalcStep}>
            <div className={styles.emiStepNum}>3</div>
            <div className={styles.emiStepContent}>
              <strong className={styles.emiStepTitle}>Apply EMI Formula</strong>
              <p className={styles.emiStepDesc}>EMI = P × r × (1+r)^n / ((1+r)^n - 1)</p>
              <div className={styles.emiStepFormula}>
                <code>
                  {loanAmount} × {((interestRate / 12 / 100).toFixed(6))} × {Math.pow(1 + (interestRate / 12 / 100), tenureInMonths).toFixed(6)} ÷ ({Math.pow(1 + (interestRate / 12 / 100), tenureInMonths).toFixed(6)} - 1)
                </code>
                <div className={styles.emiStepResult}>
                  = <strong>{formatCurrency(calculation.emi)}</strong>
                </div>
              </div>
            </div>
          </div>

          {interestRate === 0 && (
            <div className={styles.emiCalcStep}>
              <div className={styles.emiStepNum}>4</div>
              <div className={styles.emiStepContent}>
                <strong className={styles.emiStepTitle}>Zero Interest Special Case</strong>
                <p className={styles.emiStepDesc}>When interest rate is 0%, EMI = Principal ÷ Tenure</p>
                <div className={styles.emiStepFormula}>
                  <code>
                    {loanAmount} ÷ {tenureInMonths} = <strong>{formatCurrency(loanAmount / tenureInMonths)}</strong>
                  </code>
                </div>
              </div>
            </div>
          )}

          <div className={`${styles.emiCalcStep} ${styles.emiStepFinal}`}>
            <div className={styles.emiStepNum}>
              <i className="ti ti-check" aria-hidden="true" />
            </div>
            <div className={styles.emiStepContent}>
              <strong className={styles.emiStepTitle}>Monthly EMI Amount</strong>
              <p className={styles.emiStepDesc}>Fixed monthly payment throughout loan tenure</p>
              <div className={`${styles.emiStepFormula} ${styles.emiFinal}`}>
                <code>
                  <strong>{formatCurrency(calculation.emi)}</strong>
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {prepaymentType !== 'none' && (
        <div className={styles.emiDetailSection}>
          <h4 className={styles.emiDetailHeading}>
            <i className="ti ti-check-circle" aria-hidden="true" />
            Prepayment Impact Analysis
          </h4>
          <div className={styles.emiPrepaymentDetail}>
            <div className={styles.emiPrepaymentItem}>
              <span className={styles.emiPrepaymentLabel}>Original Loan Tenure</span>
              <span className={styles.emiPrepaymentValue}>{tenureInMonths} months</span>
            </div>
            <div className={styles.emiPrepaymentItem}>
              <span className={styles.emiPrepaymentLabel}>New Loan Tenure with Prepayment</span>
              <span className={styles.emiPrepaymentValue}>
                {((calculation.tenureReducedMonths ?? 0) > 0) ?
                  `${tenureInMonths - (calculation.tenureReducedMonths ?? 0)} months` :
                  `${tenureInMonths} months (no change)`}
              </span>
            </div>
            <div className={styles.emiPrepaymentItem}>
              <span className={styles.emiPrepaymentLabel}>Tenure Reduced By</span>
              <span className={styles.emiPrepaymentValue}>
                {(calculation.tenureReducedMonths ?? 0)} months
              </span>
            </div>
            <div className={styles.emiPrepaymentItem}>
              <span className={styles.emiPrepaymentLabel}>Original Total Interest</span>
              <span className={styles.emiPrepaymentValue}>{formatCurrency(
                (calculation.emi * tenureInMonths) - loanAmount
              )}</span>
            </div>
            <div className={styles.emiPrepaymentItem}>
              <span className={styles.emiPrepaymentLabel}>New Total Interest with Prepayment</span>
              <span className={styles.emiPrepaymentValue}>{formatCurrency(calculation.totalInterestWithPrepayment || 0)}</span>
            </div>
            <div className={styles.emiPrepaymentItem}>
              <span className={styles.emiPrepaymentLabel}>Interest Saved</span>
              <span className={`${styles.emiPrepaymentValue} ${styles.emiSaving}`}>{formatCurrency(calculation.interestSaved || 0)}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.emiDetailSection}>
        <h4 className={styles.emiDetailHeading}>
          <i className="ti ti-list-ol" aria-hidden="true" />
          Amortization Schedule (First 12 Months)
        </h4>
        <p className={styles.emiScheduleNote}>Showing first year. Download PDF for full schedule.</p>
        <div className={styles.emiScheduleTable}>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Payment Date</th>
                <th>EMI (₹)</th>
                <th>Principal (₹)</th>
                <th>Interest (₹)</th>
                <th>Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {calculation.schedule.slice(0, 12).map((row, index) => (
                <tr key={index} className={index % 2 === 1 ? styles.emiRowAlt : ""}>
                  <td>{row.month}</td>
                  <td>{new Date(row.paymentDate).toLocaleDateString()}</td>
                  <td className={styles.emiMono}>{formatCurrency(row.emi)}</td>
                  <td className={styles.emiMono}>{formatCurrency(row.principal)}</td>
                  <td className={styles.emiMono}>{formatCurrency(row.interest)}</td>
                  <td className={`${styles.emiMono} ${styles.emiBalance}`}>{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}