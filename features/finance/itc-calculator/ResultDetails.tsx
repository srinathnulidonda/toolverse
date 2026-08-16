// features/finance/itc-calculator/ResultDetails.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import type { ITCCalculationResult } from "./ts/itcEngine";
import styles from "./style/ResultDetails.module.css";

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
        <div className={styles.itcResultDetails}>
            <div className={styles.itcDetailSection}>
                <h4 className={styles.itcDetailHeading}>
                    <i className="ti ti-file-invoice" aria-hidden="true" />
                    Input Summary
                </h4>
                <div className={styles.itcDetailGrid}>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Invoice Number</span>
                        <span className={styles.itcDetailValue}>{invoiceNumber}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Invoice Date</span>
                        <span className={styles.itcDetailValue}>{new Date(invoiceDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Claim Date</span>
                        <span className={styles.itcDetailValue}>{new Date(claimDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Supplier GSTIN</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>{gstinSupplier}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Asset Type</span>
                        <span className={styles.itcDetailValue}>{isCapitalGood ? "Capital Good" : "Regular"}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Time Limit Check</span>
                        <span className={styles.itcDetailValue}>{checkTimeLimit ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Total Invoice Value</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>{formatCurrency(totalInvoiceValue)}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>GST Paid</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>{formatCurrency(gstPaid)}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>ITC Claimed (Books)</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>{formatCurrency(itcClaimedInBooks)}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>ITC Available (GSTR-2B)</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>{formatCurrency(itcAvailableInGSTR2B)}</span>
                    </div>
                </div>
            </div>

            <div className={styles.itcDetailSection}>
                <h4 className={styles.itcDetailHeading}>
                    <i className="ti ti-chart-pie" aria-hidden="true" />
                    Usage Distribution
                </h4>
                <div className={styles.itcUsageBars}>
                    <div className={styles.itcUsageBarItem}>
                        <div className={styles.itcUsageBarHeader}>
                            <span className={styles.itcUsageBarLabel}>
                                <i className="ti ti-circle-check" aria-hidden="true" />
                                Taxable Supply
                            </span>
                            <strong className={styles.itcUsageBarPercent}>{usageTaxable}%</strong>
                        </div>
                        <div className={styles.itcUsageBarTrack}>
                            <div
                                className={`${styles.itcUsageBarFill} ${styles.itcBarTaxable}`}
                                style={{ width: `${usageTaxable}%` }}
                            />
                        </div>
                    </div>

                    <div className={styles.itcUsageBarItem}>
                        <div className={styles.itcUsageBarHeader}>
                            <span className={styles.itcUsageBarLabel}>
                                <i className="ti ti-circle-x" aria-hidden="true" />
                                Exempt Supply
                            </span>
                            <strong className={styles.itcUsageBarPercent}>{usageExempt}%</strong>
                        </div>
                        <div className={styles.itcUsageBarTrack}>
                            <div
                                className={`${styles.itcUsageBarFill} ${styles.itcBarExempt}`}
                                style={{ width: `${usageExempt}%` }}
                            />
                        </div>
                    </div>

                    <div className={styles.itcUsageBarItem}>
                        <div className={styles.itcUsageBarHeader}>
                            <span className={styles.itcUsageBarLabel}>
                                <i className="ti ti-circle-dashed" aria-hidden="true" />
                                Non-Business
                            </span>
                            <strong className={styles.itcUsageBarPercent}>{usageNonBusiness}%</strong>
                        </div>
                        <div className={styles.itcUsageBarTrack}>
                            <div
                                className={`${styles.itcUsageBarFill} ${styles.itcBarNonbusiness}`}
                                style={{ width: `${usageNonBusiness}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.itcDetailSection}>
                <h4 className={styles.itcDetailHeading}>
                    <i className="ti ti-cash" aria-hidden="true" />
                    Payment Details
                </h4>
                <div className={styles.itcDetailGrid}>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Days Past Due</span>
                        <span className={`${styles.itcDetailValue}${daysPastDue > 180 ? ` ${styles.itcError}` : ""}`}>
                            {daysPastDue} days
                            {daysPastDue > 180 && <i className="ti ti-alert-circle" aria-hidden="true" />}
                        </span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Amount Paid</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>{formatCurrency(amountPaid)}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Total Payable</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>{formatCurrency(totalPayable)}</span>
                    </div>
                    <div className={styles.itcDetailItem}>
                        <span className={styles.itcDetailLabel}>Payment Ratio</span>
                        <span className={`${styles.itcDetailValue} ${styles.itcMono}`}>
                            {totalPayable > 0 ? `${((amountPaid / totalPayable) * 100).toFixed(1)}%` : "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.itcDetailSection}>
                <h4 className={styles.itcDetailHeading}>
                    <i className="ti ti-calculator" aria-hidden="true" />
                    Calculation Steps
                </h4>
                <div className={styles.itcCalcSteps}>
                    <div className={styles.itcCalcStep}>
                        <div className={styles.itcStepNum}>1</div>
                        <div className={styles.itcStepContent}>
                            <strong className={styles.itcStepTitle}>Match Books vs GSTR-2B</strong>
                            <p className={styles.itcStepDesc}>Take minimum of both values</p>
                            <div className={styles.itcStepFormula}>
                                <code>
                                    min({formatCurrency(calculation.breakdown.booksITC)}, {formatCurrency(calculation.breakdown.gstr2bITC)})
                                    = <strong>{formatCurrency(calculation.breakdown.matchedITC)}</strong>
                                </code>
                            </div>
                        </div>
                    </div>

                    {calculation.breakdown.blockedAmount > 0 && (
                        <div className={styles.itcCalcStep}>
                            <div className={styles.itcStepNum}>2</div>
                            <div className={styles.itcStepContent}>
                                <strong className={styles.itcStepTitle}>Apply Blocked Credits (Section 17(5))</strong>
                                <p className={styles.itcStepDesc}>Deduct ineligible category amount</p>
                                <div className={`${styles.itcStepFormula} ${styles.itcDeduction}`}>
                                    <code>−{formatCurrency(calculation.breakdown.blockedAmount)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    {calculation.breakdown.timeBarredAmount > 0 && (
                        <div className={styles.itcCalcStep}>
                            <div className={styles.itcStepNum}>
                                {calculation.breakdown.blockedAmount > 0 ? 3 : 2}
                            </div>
                            <div className={styles.itcStepContent}>
                                <strong className={styles.itcStepTitle}>Check Time Limit (Section 16(4))</strong>
                                <p className={styles.itcStepDesc}>Remove time-barred amount</p>
                                <div className={`${styles.itcStepFormula} ${styles.itcDeduction}`}>
                                    <code>−{formatCurrency(calculation.breakdown.timeBarredAmount)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    {calculation.breakdown.reversed42_43 > 0 && (
                        <div className={styles.itcCalcStep}>
                            <div className={styles.itcStepNum}>
                                {(calculation.breakdown.blockedAmount > 0 ? 1 : 0) +
                                    (calculation.breakdown.timeBarredAmount > 0 ? 1 : 0) +
                                    2}
                            </div>
                            <div className={styles.itcStepContent}>
                                <strong className={styles.itcStepTitle}>Apply Rule 42/43 Reversal</strong>
                                <p className={styles.itcStepDesc}>Proportionate to exempt/non-business usage ({usageExempt + usageNonBusiness}%)</p>
                                <div className={`${styles.itcStepFormula} ${styles.itcDeduction}`}>
                                    <code>−{formatCurrency(calculation.breakdown.reversed42_43)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    {calculation.breakdown.reversed37 > 0 && (
                        <div className={styles.itcCalcStep}>
                            <div className={styles.itcStepNum}>
                                {(calculation.breakdown.blockedAmount > 0 ? 1 : 0) +
                                    (calculation.breakdown.timeBarredAmount > 0 ? 1 : 0) +
                                    (calculation.breakdown.reversed42_43 > 0 ? 1 : 0) +
                                    2}
                            </div>
                            <div className={styles.itcStepContent}>
                                <strong className={styles.itcStepTitle}>Apply Rule 37 Reversal</strong>
                                <p className={styles.itcStepDesc}>Payment overdue beyond 180 days</p>
                                <div className={`${styles.itcStepFormula} ${styles.itcDeduction}`}>
                                    <code>−{formatCurrency(calculation.breakdown.reversed37)}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`${styles.itcCalcStep} ${styles.itcStepFinal}`}>
                        <div className={styles.itcStepNum}>
                            <i className="ti ti-check" aria-hidden="true" />
                        </div>
                        <div className={styles.itcStepContent}>
                            <strong className={styles.itcStepTitle}>Net Eligible ITC</strong>
                            <p className={styles.itcStepDesc}>Final amount available for credit</p>
                            <div className={`${styles.itcStepFormula} ${styles.itcFinal}`}>
                                <code>
                                    <strong>{formatCurrency(calculation.eligibleITC)}</strong>
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}