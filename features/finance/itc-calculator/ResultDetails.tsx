// features/finance/itc-calculator/ResultDetails.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import type { ITCCalculationResult } from "./itcEngine";

type ResultDetailsProps = {
    calculation: ITCCalculationResult;
    invoiceNumber: string;
    invoiceDate: string;
    claimDate: string;
    gstinSupplier: string;
    totalInvoiceValue: number;
    gstPaid: number;
    itcClaimedInBooks: number;
    itcAvailableInGSTR2B: number;
    isCapitalGood: boolean;
    checkTimeLimit: boolean;
    usageTaxable: number;
    usageExempt: number;
    usageNonBusiness: number;
    daysPastDue: number;
    amountPaid: number;
    totalPayable: number;
};

export function ResultDetails({
    calculation,
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
    usageTaxable,
    usageExempt,
    usageNonBusiness,
    daysPastDue,
    amountPaid,
    totalPayable,
}: ResultDetailsProps) {
    return (
        <div className="itc-result-details">
            <div className="itc-detail-section">
                <h4 className="itc-detail-heading">
                    <i className="ti ti-file-invoice" aria-hidden="true" />
                    Input Summary
                </h4>
                <div className="itc-detail-grid">
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Invoice Number</span>
                        <span className="itc-detail-value">{invoiceNumber}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Invoice Date</span>
                        <span className="itc-detail-value">{new Date(invoiceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Claim Date</span>
                        <span className="itc-detail-value">{new Date(claimDate).toLocaleDateString()}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Supplier GSTIN</span>
                        <span className="itc-detail-value itc-mono">{gstinSupplier}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Asset Type</span>
                        <span className="itc-detail-value">{isCapitalGood ? "Capital Good" : "Regular"}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Time Limit Check</span>
                        <span className="itc-detail-value">{checkTimeLimit ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Total Invoice Value</span>
                        <span className="itc-detail-value itc-mono">{formatCurrency(totalInvoiceValue)}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">GST Paid</span>
                        <span className="itc-detail-value itc-mono">{formatCurrency(gstPaid)}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">ITC Claimed (Books)</span>
                        <span className="itc-detail-value itc-mono">{formatCurrency(itcClaimedInBooks)}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">ITC Available (GSTR-2B)</span>
                        <span className="itc-detail-value itc-mono">{formatCurrency(itcAvailableInGSTR2B)}</span>
                    </div>
                </div>
            </div>

            <div className="itc-detail-section">
                <h4 className="itc-detail-heading">
                    <i className="ti ti-chart-pie" aria-hidden="true" />
                    Usage Distribution
                </h4>
                <div className="itc-usage-bars">
                    <div className="itc-usage-bar-item">
                        <div className="itc-usage-bar-header">
                            <span className="itc-usage-bar-label">
                                <i className="ti ti-circle-check" aria-hidden="true" />
                                Taxable Supply
                            </span>
                            <strong className="itc-usage-bar-percent">{usageTaxable}%</strong>
                        </div>
                        <div className="itc-usage-bar-track">
                            <div
                                className="itc-usage-bar-fill itc-bar-taxable"
                                style={{ width: `${usageTaxable}%` }}
                            />
                        </div>
                    </div>

                    <div className="itc-usage-bar-item">
                        <div className="itc-usage-bar-header">
                            <span className="itc-usage-bar-label">
                                <i className="ti ti-circle-x" aria-hidden="true" />
                                Exempt Supply
                            </span>
                            <strong className="itc-usage-bar-percent">{usageExempt}%</strong>
                        </div>
                        <div className="itc-usage-bar-track">
                            <div
                                className="itc-usage-bar-fill itc-bar-exempt"
                                style={{ width: `${usageExempt}%` }}
                            />
                        </div>
                    </div>

                    <div className="itc-usage-bar-item">
                        <div className="itc-usage-bar-header">
                            <span className="itc-usage-bar-label">
                                <i className="ti ti-circle-dashed" aria-hidden="true" />
                                Non-Business
                            </span>
                            <strong className="itc-usage-bar-percent">{usageNonBusiness}%</strong>
                        </div>
                        <div className="itc-usage-bar-track">
                            <div
                                className="itc-usage-bar-fill itc-bar-nonbusiness"
                                style={{ width: `${usageNonBusiness}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="itc-detail-section">
                <h4 className="itc-detail-heading">
                    <i className="ti ti-cash" aria-hidden="true" />
                    Payment Details
                </h4>
                <div className="itc-detail-grid">
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Days Past Due</span>
                        <span className={`itc-detail-value${daysPastDue > 180 ? " itc-error" : ""}`}>
                            {daysPastDue} days
                            {daysPastDue > 180 && <i className="ti ti-alert-circle" aria-hidden="true" />}
                        </span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Amount Paid</span>
                        <span className="itc-detail-value itc-mono">{formatCurrency(amountPaid)}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Total Payable</span>
                        <span className="itc-detail-value itc-mono">{formatCurrency(totalPayable)}</span>
                    </div>
                    <div className="itc-detail-item">
                        <span className="itc-detail-label">Payment Ratio</span>
                        <span className="itc-detail-value itc-mono">
                            {totalPayable > 0 ? `${((amountPaid / totalPayable) * 100).toFixed(1)}%` : "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="itc-detail-section">
                <h4 className="itc-detail-heading">
                    <i className="ti ti-calculator" aria-hidden="true" />
                    Calculation Steps
                </h4>
                <div className="itc-calc-steps">
                    <div className="itc-calc-step">
                        <div className="itc-step-num">1</div>
                        <div className="itc-step-content">
                            <strong className="itc-step-title">Match Books vs GSTR-2B</strong>
                            <p className="itc-step-desc">Take minimum of both values</p>
                            <div className="itc-step-formula">
                                <code>
                                    min({formatCurrency(calculation.breakdown.booksITC)}, {formatCurrency(calculation.breakdown.gstr2bITC)})
                                    = <strong>{formatCurrency(calculation.breakdown.matchedITC)}</strong>
                                </code>
                            </div>
                        </div>
                    </div>

                    {calculation.breakdown.blockedAmount > 0 && (
                        <div className="itc-calc-step">
                            <div className="itc-step-num">2</div>
                            <div className="itc-step-content">
                                <strong className="itc-step-title">Apply Blocked Credits (Section 17(5))</strong>
                                <p className="itc-step-desc">Deduct ineligible category amount</p>
                                <div className="itc-step-formula itc-deduction">
                                    <code>−{formatCurrency(calculation.breakdown.blockedAmount)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    {calculation.breakdown.timeBarredAmount > 0 && (
                        <div className="itc-calc-step">
                            <div className="itc-step-num">
                                {calculation.breakdown.blockedAmount > 0 ? 3 : 2}
                            </div>
                            <div className="itc-step-content">
                                <strong className="itc-step-title">Check Time Limit (Section 16(4))</strong>
                                <p className="itc-step-desc">Remove time-barred amount</p>
                                <div className="itc-step-formula itc-deduction">
                                    <code>−{formatCurrency(calculation.breakdown.timeBarredAmount)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    {calculation.breakdown.reversed42_43 > 0 && (
                        <div className="itc-calc-step">
                            <div className="itc-step-num">
                                {(calculation.breakdown.blockedAmount > 0 ? 1 : 0) +
                                    (calculation.breakdown.timeBarredAmount > 0 ? 1 : 0) +
                                    2}
                            </div>
                            <div className="itc-step-content">
                                <strong className="itc-step-title">Apply Rule 42/43 Reversal</strong>
                                <p className="itc-step-desc">Proportionate to exempt/non-business usage ({usageExempt + usageNonBusiness}%)</p>
                                <div className="itc-step-formula itc-deduction">
                                    <code>−{formatCurrency(calculation.breakdown.reversed42_43)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    {calculation.breakdown.reversed37 > 0 && (
                        <div className="itc-calc-step">
                            <div className="itc-step-num">
                                {(calculation.breakdown.blockedAmount > 0 ? 1 : 0) +
                                    (calculation.breakdown.timeBarredAmount > 0 ? 1 : 0) +
                                    (calculation.breakdown.reversed42_43 > 0 ? 1 : 0) +
                                    2}
                            </div>
                            <div className="itc-step-content">
                                <strong className="itc-step-title">Apply Rule 37 Reversal</strong>
                                <p className="itc-step-desc">Payment overdue beyond 180 days</p>
                                <div className="itc-step-formula itc-deduction">
                                    <code>−{formatCurrency(calculation.breakdown.reversed37)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="itc-calc-step itc-step-final">
                        <div className="itc-step-num">
                            <i className="ti ti-check" aria-hidden="true" />
                        </div>
                        <div className="itc-step-content">
                            <strong className="itc-step-title">Net Eligible ITC</strong>
                            <p className="itc-step-desc">Final amount available for credit</p>
                            <div className="itc-step-formula itc-final">
                                <code>
                                    <strong>{formatCurrency(calculation.eligibleITC)}</strong>
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .itc-result-details {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: var(--font-sans);
        }

        .itc-detail-section {
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .itc-detail-heading {
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

        .itc-detail-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .itc-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
        }

        .itc-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .itc-detail-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
        }

        .itc-detail-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .itc-mono {
          font-family: var(--font-mono);
        }

        .itc-error {
          color: #B91C1C;
        }

        .itc-error i {
          font-size: 14px;
        }

        @media (prefers-color-scheme: dark) {
          .itc-error {
            color: #F87171;
          }
        }

        .itc-usage-bars {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .itc-usage-bar-item {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .itc-usage-bar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .itc-usage-bar-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .itc-usage-bar-label i {
          font-size: 14px;
        }

        .itc-usage-bar-percent {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .itc-usage-bar-track {
          height: 8px;
          background: var(--border-faint);
          border-radius: 99px;
          overflow: hidden;
        }

        .itc-usage-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .itc-bar-taxable {
          background: linear-gradient(90deg, var(--brand), var(--brand-hover));
        }

        .itc-bar-exempt {
          background: linear-gradient(90deg, #d97706, #f59e0b);
        }

        .itc-bar-nonbusiness {
          background: linear-gradient(90deg, #dc2626, #ef4444);
        }

        .itc-calc-steps {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .itc-calc-step {
          display: flex;
          gap: 12px;
        }

        .itc-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .itc-step-final .itc-step-num {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
        }

        .itc-step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .itc-step-title {
          font-size: 13px;
          color: var(--text);
        }

        .itc-step-desc {
          margin: 0;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .itc-step-formula {
          margin-top: 6px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          border: 0.5px solid var(--border);
        }

        .itc-step-formula code {
          font-size: 12.5px;
          font-family: var(--font-mono);
          color: var(--text);
        }

        .itc-step-formula strong {
          color: var(--brand);
        }

        .itc-deduction code {
          color: #B91C1C;
        }

        @media (prefers-color-scheme: dark) {
          .itc-deduction code {
            color: #F87171;
          }
        }

        .itc-final {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .itc-final code strong {
          font-size: 15px;
        }

        @media (max-width: 768px) {
          .itc-result-details {
            padding: 16px;
            gap: 20px;
          }

          .itc-detail-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .itc-usage-bar-fill {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}