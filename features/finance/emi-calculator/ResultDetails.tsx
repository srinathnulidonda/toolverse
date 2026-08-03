// features/finance/emi-calculator/ResultDetails.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import type { EMICalculationResult, EMIInput } from "./emiEngine";

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
    <div className="emi-result-details">
      <div className="emi-detail-section">
        <h4 className="emi-detail-heading">
          <i className="ti ti-home" aria-hidden="true" />
          Loan Summary
        </h4>
        <div className="emi-detail-grid">
          <div className="emi-detail-item">
            <span className="emi-detail-label">Loan Type</span>
            <span className="emi-detail-value emi-mono">{loanType}</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Loan Amount</span>
            <span className="emi-detail-value emi-mono">{formatCurrency(loanAmount)}</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Interest Rate</span>
            <span className="emi-detail-value">{interestRate}% p.a.</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Loan Tenure</span>
            <span className="emi-detail-value">{tenureDisplay}</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Loan Start Date</span>
            <span className="emi-detail-value">{startDateFormatted}</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Prepayment Plan</span>
            <span className="emi-detail-value">
              {prepaymentType === 'none' ? 'None' :
                prepaymentType === 'one-time' ?
                  `One-time: ${formatCurrency(prepaymentAmount || 0)} at month ${prepaymentMonth || '-'}` :
                  `Recurring: ${formatCurrency(prepaymentAmount || 0)} per month from month ${prepaymentMonth || '-'}`
              }
            </span>
          </div>
        </div>
      </div>

      <div className="emi-detail-section">
        <h4 className="emi-detail-heading">
          <i className="ti ti-calculator" aria-hidden="true" />
          EMI Calculation Details
        </h4>
        <div className="emi-detail-grid">
          <div className="emi-detail-item">
            <span className="emi-detail-label">Monthly EMI</span>
            <span className="emi-detail-value emi-mono">{formatCurrency(calculation.emi)}</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Total Interest Payable</span>
            <span className="emi-detail-value emi-mono">{formatCurrency(calculation.totalInterest)}</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Total Amount Payable</span>
            <span className="emi-detail-value emi-mono">{formatCurrency(calculation.totalPayment)}</span>
          </div>
          <div className="emi-detail-item">
            <span className="emi-detail-label">Total Principal</span>
            <span className="emi-detail-value emi-mono">{formatCurrency(calculation.principalVsInterestRatio.principal)}</span>
          </div>
        </div>
      </div>

      <div className="emi-detail-section">
        <h4 className="emi-detail-heading">
          <i className="ti ti-chart-pie" aria-hidden="true" />
          Principal vs Interest Ratio
        </h4>
        <div className="emi-ratio-chart">
          <div className="emi-ratio-item">
            <div className="emi-ratio-label">Principal Component</div>
            <div className="emi-ratio-value emi-mono">
              {formatCurrency(calculation.principalVsInterestRatio.principal)}
            </div>
          </div>
          <div className="emi-ratio-bar">
            <div
              className="emi-ratio-fill emi-bar-principal"
              style={{
                width: `${(calculation.principalVsInterestRatio.principal /
                           (calculation.principalVsInterestRatio.principal + calculation.principalVsInterestRatio.interest)) * 100}%`
              }}
            />
          </div>
          <div className="emi-ratio-item">
            <div className="emi-ratio-label">Interest Component</div>
            <div className="emi-ratio-value emi-mono">
              {formatCurrency(calculation.principalVsInterestRatio.interest)}
            </div>
          </div>
          <div className="emi-ratio-bar">
            <div
              className="emi-ratio-fill emi-bar-interest"
              style={{
                width: `${(calculation.principalVsInterestRatio.interest /
                           (calculation.principalVsInterestRatio.principal + calculation.principalVsInterestRatio.interest)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className="emi-detail-section">
        <h4 className="emi-detail-heading">
          <i className="ti ti-calculator" aria-hidden="true" />
          Calculation Steps
        </h4>
        <div className="emi-calc-steps">
          <div className="emi-calc-step">
            <div className="emi-step-num">1</div>
            <div className="emi-step-content">
              <strong className="emi-step-title">Convert Annual Rate to Monthly</strong>
              <p className="emi-step-desc">Divide annual interest rate by 12 and 100</p>
              <div className="emi-step-formula">
                <code>
                  r = {interestRate}% ÷ 12 ÷ 100 = <strong>{(interestRate / 12 / 100).toFixed(6)}</strong>
                </code>
              </div>
            </div>
          </div>

          <div className="emi-calc-step">
            <div className="emi-step-num">2</div>
            <div className="emi-step-content">
              <strong className="emi-step-title">Calculate Compound Factor</strong>
              <p className="emi-step-desc">(1 + r)^n where n is total months</p>
              <div className="emi-step-formula">
                <code>
                  (1 + {((interestRate / 12 / 100).toFixed(6))})^{tenureInMonths} = <strong>{Math.pow(1 + (interestRate / 12 / 100), tenureInMonths).toFixed(6)}</strong>
                </code>
              </div>
            </div>
          </div>

          <div className="emi-calc-step">
            <div className="emi-step-num">3</div>
            <div className="emi-step-content">
              <strong className="emi-step-title">Apply EMI Formula</strong>
              <p className="emi-step-desc">EMI = P × r × (1+r)^n / ((1+r)^n - 1)</p>
              <div className="emi-step-formula">
                <code>
                  {loanAmount} × {((interestRate / 12 / 100).toFixed(6))} × {Math.pow(1 + (interestRate / 12 / 100), tenureInMonths).toFixed(6)} ÷ ({Math.pow(1 + (interestRate / 12 / 100), tenureInMonths).toFixed(6)} - 1)
                </code>
                <div className="emi-step-result">
                  = <strong>{formatCurrency(calculation.emi)}</strong>
                </div>
              </div>
            </div>
          </div>

          {interestRate === 0 && (
            <div className="emi-calc-step">
              <div className="emi-step-num">4</div>
              <div className="emi-step-content">
                <strong className="emi-step-title">Zero Interest Special Case</strong>
                <p className="emi-step-desc">When interest rate is 0%, EMI = Principal ÷ Tenure</p>
                <div className="emi-step-formula">
                  <code>
                    {loanAmount} ÷ {tenureInMonths} = <strong>{formatCurrency(loanAmount / tenureInMonths)}</strong>
                  </code>
                </div>
              </div>
            </div>
          )}

          <div className="emi-calc-step emi-step-final">
            <div className="emi-step-num">
              <i className="ti ti-check" aria-hidden="true" />
            </div>
            <div className="emi-step-content">
              <strong className="emi-step-title">Monthly EMI Amount</strong>
              <p className="emi-step-desc">Fixed monthly payment throughout loan tenure</p>
              <div className="emi-step-formula emi-final">
                <code>
                  <strong>{formatCurrency(calculation.emi)}</strong>
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {prepaymentType !== 'none' && (
        <div className="emi-detail-section">
          <h4 className="emi-detail-heading">
            <i className="ti ti-check-circle" aria-hidden="true" />
            Prepayment Impact Analysis
          </h4>
          <div className="emi-prepayment-detail">
            <div className="EMI-prepayment-item">
              <span className="emi-prepayment-label">Original Loan Tenure</span>
              <span className="emi-prepayment-value">{tenureInMonths} months</span>
            </div>
            <div className="EMI-prepayment-item">
              <span className="emi-prepayment-label">New Loan Tenure with Prepayment</span>
              <span className="emi-prepayment-value">
                {((calculation.tenureReducedMonths ?? 0) > 0) ?
                  `${tenureInMonths - (calculation.tenureReducedMonths ?? 0)} months` :
                  `${tenureInMonths} months (no change)`}
              </span>
            </div>
            <div className="EMI-prepayment-item">
              <span className="emi-prepayment-label">Tenure Reduced By</span>
              <span className="emi-prepayment-value">
                {(calculation.tenureReducedMonths ?? 0)} months
              </span>
            </div>
            <div className="EMI-prepayment-item">
              <span className="emi-prepayment-label">Original Total Interest</span>
              <span className="emi-prepayment-value">{formatCurrency(
                // Calculate original interest without prepayment
                (calculation.emi * tenureInMonths) - loanAmount
              )}</span>
            </div>
            <div className="EMI-prepayment-item">
              <span className="emi-prepayment-label">New Total Interest with Prepayment</span>
              <span className="emi-prepayment-value">{formatCurrency(calculation.totalInterestWithPrepayment || 0)}</span>
            </div>
            <div className="EMI-prepayment-item">
              <span className="emi-prepayment-label">Interest Saved</span>
              <span className="emi-prepayment-value emi-saving">{formatCurrency(calculation.interestSaved || 0)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="emi-detail-section">
        <h4 className="emi-detail-heading">
          <i className="ti ti-list-ol" aria-hidden="true" />
          Amortization Schedule (First 12 Months)
        </h4>
        <p className="emi-schedule-note">Showing first year. Download PDF for full schedule.</p>
        <div className="emi-schedule-table">
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
                <tr key={index} className={index % 2 === 1 ? "emi-row-alt" : ""}>
                  <td>{row.month}</td>
                  <td>{new Date(row.paymentDate).toLocaleDateString()}</td>
                  <td className="emi-mono">{formatCurrency(row.emi)}</td>
                  <td className="emi-mono">{formatCurrency(row.principal)}</td>
                  <td className="emi-mono">{formatCurrency(row.interest)}</td>
                  <td className="emi-mono emi-balance">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .emi-result-details {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: var(--font-sans);
        }

        .emi-detail-section {
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .emi-detail-heading {
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

        .emi-detail-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .emi-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
        }

        .emi-detail-item {
          display: flex;
          width: 100%;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .emi-detail-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
        }

        .emi-detail-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .emi-mono {
          font-family: var(--font-mono);
        }

        .emi-detail-section:nth-child(2) {
          background: var(--bg-surface);
        }

        .emi-ratio-chart {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .emi-ratio-item {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .emi-ratio-label {
          font-size: 12.5px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .emi-ratio-bar {
          height: 8px;
          background: var(--border-faint);
          border-radius: 99px;
          overflow: hidden;
          display: flex;
        }

        .emi-ratio-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .emi-bar-principal {
          background: linear-gradient(90deg, var(--brand), var(--brand-hover));
        }

        .emi-bar-interest {
          background: linear-gradient(90deg, #dc2626, #ef4444);
        }

        .emi-ratio-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .emi-calc-steps {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .emi-calc-step {
          display: flex;
          gap: 12px;
        }

        .emi-step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .emi-step-final .emi-step-num {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
        }

        .emi-step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .emi-step-title {
          font-size: 12px;
          color: var(--text);
        }

        .emi-step-desc {
          margin: 0;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .emi-step-formula {
          margin-top: 6px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          border: 0.5px solid var(--border);
        }

        .emi-step-formula code {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text);
        }

        .emi-step-formula strong {
          color: var(--brand);
        }

        .emi-step-result {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--brand-text);
          font-family: var(--font-mono);
        }

        .emi-final {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .emi-final code strong {
          font-size: 16px;
        }

        .emi-prepayment-detail {
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
        }

        .emi-prepayment-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 0.5px solid var(--border-faint);
        }

        .emi-prepayment-item:last-child {
          border-bottom: none;
        }

        .emi-prepayment-label {
          font-size: 12.5px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .emi-prepayment-value {
          font-size: 12.5px;
          color: var(--text);
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .emi-prepayment-value.emi-saving {
          color: var(--brand-text);
          font-weight: 600;
        }

        .emi-schedule-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .emi-schedule-table th,
        .emi-schedule-table td {
          padding: 10px 12px;
          text-align: left;
          font-size: 12px;
          border-bottom: 0.5px solid var(--border-faint);
        }

        .emi-schedule-table th {
          background: var(--bg-surface);
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .emi-schedule-table td {
          color: var(--text);
        }

        .emi-schedule-table tbody tr:last-child td {
          border-bottom: none;
        }

        .emi-schedule-table tbody tr:hover {
          background: var(--border-faint);
        }

        .emi-balance {
          font-weight: 600;
        }

        .emi-row-alt {
          background: var(--bg-card);
        }

        .emi-schedule-note {
          font-size: 11px;
          color: var(--text-tertiary);
          font-style: italic;
          margin: 8px 0 0 0;
        }

        @media (max-width: 768px) {
          .emi-result-details {
            padding: 16px;
            gap: 20px;
          }

          .emi-detail-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .emi-ratio-chart {
            gap: 8px;
          }

          .emi-ratio-item {
            font-size: 11px;
          }

          .emi-calc-steps {
            gap: 8px;
          }

          .emi-step-title {
            font-size: 10px;
          }

          .emi-step-desc {
            font-size: 9px;
          }

          .emi-prepayment-detail {
            grid-template-columns: 1fr;
          }

          .emi-prepayment-label,
          .emi-prepayment-value {
            font-size: 11px;
          }

          .emi-schedule-table {
            overflow-x: auto;
            width: 100%;
          }

          .emi-schedule-table th,
          .emi-schedule-table td {
            padding: 8px 10px;
            font-size: 11px;
          }

          .emi-schedule-note {
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .emi-ratio-fill {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}