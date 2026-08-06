// features/finance/sip-calculator/ResultDetails.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { SIPCalculationResult } from "./ts/sipEngine";
import styles from "./style/ResultDetails.module.css";

type ResultDetailsProps = {
  calculation: SIPCalculationResult;
  monthlyInvestment: number;
  expectedReturn: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  lumpSum?: number;
  inflationRate?: number;
  stepUpPercentage?: number;
  goalAmount?: number;
  mode: 'regular' | 'step-up' | 'goal-based';
};

export function ResultDetails({
  calculation,
  monthlyInvestment,
  expectedReturn,
  tenureValue,
  tenureUnit,
  lumpSum,
  inflationRate,
  stepUpPercentage,
  goalAmount,
  mode,
}: ResultDetailsProps) {
  const tenureInMonths = tenureUnit === 'years' ? tenureValue * 12 : tenureValue;
  const tenureDisplay = tenureUnit === 'years'
    ? `${tenureValue} years (${tenureInMonths} months)`
    : `${tenureValue} months`;

  const startDate = new Date().toISOString().split('T')[0];
  const startDateFormatted = new Date(startDate).toLocaleDateString();

  const investedShare = calculation.totalInvested + calculation.returns > 0
    ? (calculation.totalInvested / (calculation.totalInvested + calculation.returns)) * 100
    : 0;
  const returnsShare = calculation.totalInvested + calculation.returns > 0
    ? (calculation.returns / (calculation.totalInvested + calculation.returns)) * 100
    : 0;

  return (
    <div className={styles.sipResultDetails}>
      <div className={styles.sipDetailSection}>
        <h4 className={styles.sipDetailHeading}>
          <i className="ti ti-file-description" aria-hidden="true" />
          SIP Summary
        </h4>
        <div className={styles.sipDetailGrid}>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>SIP Type</span>
            <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
              {mode === 'regular' ? 'Regular SIP' : mode === 'step-up' ? 'Step-Up SIP' : 'Goal-Based SIP'}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Monthly Investment</span>
            <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
              {formatCurrency(monthlyInvestment)}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Expected Return</span>
            <span className={styles.sipDetailValue}>
              {expectedReturn}% p.a.
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Investment Tenure</span>
            <span className={styles.sipDetailValue}>
              {tenureDisplay}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Start Date</span>
            <span className={styles.sipDetailValue}>
              {startDateFormatted}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Lump Sum (Initial)</span>
            <span className={styles.sipDetailValue}>
              {lumpSum && lumpSum > 0 ? formatCurrency(lumpSum) : 'None'}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Inflation Rate</span>
            <span className={styles.sipDetailValue}>
              {inflationRate && inflationRate > 0 ? `${inflationRate}%` : 'None'}
            </span>
          </div>
          {mode === 'step-up' && (
            <div className={styles.sipDetailItem}>
              <span className={styles.sipDetailLabel}>Annual Step-Up</span>
              <span className={styles.sipDetailValue}>
                {stepUpPercentage && stepUpPercentage > 0 ? `${stepUpPercentage}%` : 'None'}
              </span>
            </div>
          )}
          {mode === 'goal-based' && (
            <div className={styles.sipDetailItem}>
              <span className={styles.sipDetailLabel}>Target Amount</span>
              <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
                {goalAmount !== undefined ? formatCurrency(goalAmount) : '₹0'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.sipDetailSection}>
        <h4 className={styles.sipDetailHeading}>
          <i className="ti ti-calculator" aria-hidden="true" />
          SIP Calculation Details
        </h4>
        <div className={styles.sipDetailGrid}>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Total Amount Invested</span>
            <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
              {formatCurrency(calculation.totalInvested)}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Total Returns / Wealth Gained</span>
            <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
              {formatCurrency(calculation.returns)}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Maturity Amount (Nominal)</span>
            <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
              {formatCurrency(calculation.maturityAmount)}
            </span>
          </div>
          <div className={styles.sipDetailItem}>
            <span className={styles.sipDetailLabel}>Inflation-Adjusted Maturity</span>
            <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
              {inflationRate && inflationRate > 0 && calculation.inflationAdjustedAmount !== undefined
                ? formatCurrency(calculation.inflationAdjustedAmount)
                : 'N/A'}
            </span>
          </div>
          {mode === 'goal-based' && (
            <div className={styles.sipDetailItem}>
              <span className={styles.sipDetailLabel}>Required Monthly SIP</span>
              <span className={`${styles.sipDetailValue} ${styles.sipMono}`}>
                {formatCurrency(calculation.monthlySIPRequired!)}
              </span>
            </div>
          )}
          {mode === 'goal-based' && (
            <div className={styles.sipDetailItem}>
              <span className={styles.sipDetailLabel}>Lump Sum Contribution</span>
              <span className={styles.sipDetailValue}>
                {lumpSum && lumpSum > 0 ? formatCurrency(lumpSum) : '₹0'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.sipDetailSection}>
        <h4 className={styles.sipDetailHeading}>
          <i className="ti ti-chart-pie" aria-hidden="true" />
          Investment vs Returns Breakdown
        </h4>
        <div className={styles.sipRatioChart}>
          <div className={styles.sipRatioItem}>
            <span className={styles.sipRatioLabel}>
              <i className="ti ti-piggy-bank" aria-hidden="true" /> Total Invested
            </span>
            <span className={styles.sipRatioValue}>{formatCurrency(calculation.totalInvested)}</span>
          </div>
          <div className={styles.sipRatioBar}>
            <div
              className={`${styles.sipRatioFill} ${styles.sipBarInvested}`}
              style={{ width: `${investedShare}%` }}
            />
          </div>

          <div className={styles.sipRatioItem}>
            <span className={styles.sipRatioLabel}>
              <i className="ti ti-trending-up" aria-hidden="true" /> Returns Earned
            </span>
            <span className={styles.sipRatioValue}>{formatCurrency(calculation.returns)}</span>
          </div>
          <div className={styles.sipRatioBar}>
            <div
              className={`${styles.sipRatioFill} ${styles.sipBarReturns}`}
              style={{ width: `${returnsShare}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.sipDetailSection}>
        <h4 className={styles.sipDetailHeading}>
          <i className="ti ti-list-ol" aria-hidden="true" />
          Year-wise Growth Schedule
        </h4>
        <p className={styles.sipScheduleNote}>
          Showing yearly breakdown. Download PDF for detailed month-by-month schedule.
        </p>
        <div className={styles.sipScheduleTable}>
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Invested That Year (₹)</th>
                <th>Cumulative Invested (₹)</th>
                <th>Interest Earned That Year (₹)</th>
                <th>Cumulative Interest (₹)</th>
                <th>Year-End Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {calculation.yearlyBreakdown.map((yearData, index) => (
                <tr key={index} className={index % 2 === 1 ? styles.sipRowAlt : ""}>
                  <td>{yearData.year}</td>
                  <td className={styles.sipMono}>{formatCurrency(yearData.investedThatYear)}</td>
                  <td className={styles.sipMono}>{formatCurrency(yearData.cumulativeInvested)}</td>
                  <td className={styles.sipMono}>{formatCurrency(yearData.interestThatYear)}</td>
                  <td className={styles.sipMono}>{formatCurrency(yearData.cumulativeInterest)}</td>
                  <td className={`${styles.sipMono} ${styles.sipBalance}`}>
                    {formatCurrency(yearData.yearEndBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mode === 'goal-based' && (
        <div className={styles.sipDetailSection}>
          <h4 className={styles.sipDetailHeading}>
            <i className="ti ti-target" aria-hidden="true" />
            Goal Analysis
          </h4>
          <div className={styles.sipGoalAnalysis}>
            <div className={styles.sipGoalItem}>
              <span className={styles.sipGoalLabel}>Target Amount</span>
              <span className={styles.sipGoalValue}>
                {goalAmount !== undefined ? formatCurrency(goalAmount) : '₹0'}
              </span>
            </div>
            <div className={styles.sipGoalItem}>
              <span className={styles.sipGoalLabel}>Current Lump Sum</span>
              <span className={styles.sipGoalValue}>
                {lumpSum && lumpSum > 0 ? formatCurrency(lumpSum) : '₹0'}
              </span>
            </div>
            <div className={styles.sipGoalItem}>
              <span className={styles.sipGoalLabel}>Required Monthly SIP</span>
              <span className={styles.sipGoalValue}>
                {formatCurrency(calculation.monthlySIPRequired!)}
              </span>
            </div>
            <div className={styles.sipGoalItem}>
              <span className={styles.sipGoalLabel}>Total Investment Needed</span>
              <span className={styles.sipGoalValue}>
                {formatCurrency(
                  calculation.monthlySIPRequired! * tenureInMonths + (lumpSum || 0)
                )}
              </span>
            </div>
            <div className={styles.sipGoalItem}>
              <span className={styles.sipGoalLabel}>Expected Returns</span>
              <span className={styles.sipGoalValue}>
                {formatCurrency(calculation.returns)}
              </span>
            </div>
            <div className={styles.sipGoalItem}>
              <span className={styles.sipGoalLabel}>Total Future Value</span>
              <span className={styles.sipGoalValue}>
                {formatCurrency(calculation.maturityAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}