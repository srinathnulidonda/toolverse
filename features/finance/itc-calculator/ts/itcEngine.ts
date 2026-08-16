// features/finance/itc-calculator/itcEngine.ts

import { REVERSAL_RULES } from "./itcRules.config";

export type ITCStatus =
    | "ELIGIBLE"
    | "BLOCKED_17_5"
    | "TIME_BARRED"
    | "REVERSED_42_43"
    | "REVERSED_37"
    | "PARTIALLY_AVAILABLE";

export interface ITCInvoiceInput {
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
    usageSplit?: {
        taxable: number;
        exempt: number;
        nonBusiness: number;
    };
    supplierPaymentStatus: {
        daysPastDue: number;
        amountPaid: number;
        totalPayable: number;
    };
    blockedCategory?: string;
}

export interface ITCCalculationResult {
    eligibleITC: number;
    ineligibleITC: number;
    status: ITCStatus;
    breakdown: {
        booksITC: number;
        gstr2bITC: number;
        matchedITC: number;
        blockedAmount: number;
        timeBarredAmount: number;
        reversed42_43: number;
        reversed37: number;
    };
    warnings: string[];
    recommendations: string[];
    explanation: string;
}

function calculateTimeLimitDeadline(invoiceDate: string): Date {
    const invoice = new Date(invoiceDate);
    const invoiceMonth = invoice.getMonth();
    const invoiceYear = invoice.getFullYear();

    const fyEndYear = invoiceMonth >= 3 ? invoiceYear + 1 : invoiceYear;

    return new Date(fyEndYear + 1, 10, 30);
}

function isTimeBarred(invoiceDate: string, claimDate: string): boolean {
    const deadline = calculateTimeLimitDeadline(invoiceDate);
    const claim = new Date(claimDate);

    return claim > deadline;
}

export function calculateITCEligibility(input: ITCInvoiceInput): ITCCalculationResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const matchedITC = Math.min(input.itcClaimedInBooks, input.itcAvailableInGSTR2B);

    if (input.itcClaimedInBooks > input.itcAvailableInGSTR2B) {
        const diff = input.itcClaimedInBooks - input.itcAvailableInGSTR2B;
        warnings.push(`Books ITC exceeds GSTR-2B by ₹${diff.toFixed(2)}. Contact supplier to file their return.`);
    }

    let blockedAmount = 0;
    if (input.blockedCategory) {
        blockedAmount = matchedITC;
        warnings.push(`This falls under blocked credit category (Section 17(5)). ITC cannot be claimed.`);
    }

    let timeBarredAmount = 0;
    if (input.checkTimeLimit && isTimeBarred(input.invoiceDate, input.claimDate)) {
        timeBarredAmount = matchedITC - blockedAmount;
        const deadline = calculateTimeLimitDeadline(input.invoiceDate);
        warnings.push(
            `ITC claim is time-barred. Deadline was ${deadline.toLocaleDateString()}. ITC cannot be claimed after this date.`
        );
    } else if (!input.checkTimeLimit) {
        const deadline = calculateTimeLimitDeadline(input.invoiceDate);
        const daysLeft = Math.ceil((deadline.getTime() - new Date(input.claimDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft < 90) {
            recommendations.push(`Claim this ITC soon. Only ${daysLeft} days left until deadline (${deadline.toLocaleDateString()}).`);
        }
    }

    let reversed42_43 = 0;
    if (input.usageSplit && (input.usageSplit.exempt > 0 || input.usageSplit.nonBusiness > 0)) {
        const availableForReversal = matchedITC - blockedAmount - timeBarredAmount;
        const reversalPercent = input.usageSplit.exempt + input.usageSplit.nonBusiness;
        reversed42_43 = (availableForReversal * reversalPercent) / 100;

        if (input.usageSplit.exempt > 0) {
            warnings.push(
                `${input.usageSplit.exempt}% of input used for exempt supplies. ITC reversed proportionately under Rule 42/43.`
            );
        }
        if (input.usageSplit.nonBusiness > 0) {
            warnings.push(
                `${input.usageSplit.nonBusiness}% of input used for non-business purposes. ITC cannot be claimed on this portion.`
            );
        }
        recommendations.push(`To claim full ITC, use inputs only for taxable supplies.`);
    }

    let reversed37 = 0;
    const totalPayable = input.supplierPaymentStatus.totalPayable;
    const amountPaid = input.supplierPaymentStatus.amountPaid;
    const paymentRatio = totalPayable > 0 ? Math.min(1, amountPaid / totalPayable) : 1;

    if (input.supplierPaymentStatus.daysPastDue > REVERSAL_RULES.rule37.daysLimit) {
        const availableForReversal = matchedITC - blockedAmount - timeBarredAmount - reversed42_43;
        reversed37 = availableForReversal * (1 - paymentRatio);

        const daysOverdue = input.supplierPaymentStatus.daysPastDue - REVERSAL_RULES.rule37.daysLimit;
        warnings.push(
            `Payment overdue by ${daysOverdue} days beyond 180-day limit. ITC must be reversed under Rule 37.`
        );
        recommendations.push(
            `Pay the remaining ₹${(totalPayable - amountPaid).toFixed(2)} to re-avail this ITC. Interest may also apply.`
        );
    } else if (input.supplierPaymentStatus.daysPastDue > 150 && paymentRatio < 1) {
        const daysLeft = 180 - input.supplierPaymentStatus.daysPastDue;
        recommendations.push(
            `Payment due in ${daysLeft} days. Pay ₹${(totalPayable - amountPaid).toFixed(2)} within this period to avoid ITC reversal.`
        );
    }

    const totalReversals = blockedAmount + timeBarredAmount + reversed42_43 + reversed37;
    const eligibleITC = Math.max(0, matchedITC - totalReversals);
    const ineligibleITC = matchedITC - eligibleITC;

    let status: ITCStatus = "ELIGIBLE";
    if (blockedAmount > 0) {
        status = "BLOCKED_17_5";
    } else if (timeBarredAmount > 0) {
        status = "TIME_BARRED";
    } else if (reversed37 > 0) {
        status = "REVERSED_37";
    } else if (reversed42_43 > 0) {
        status = "REVERSED_42_43";
    } else if (eligibleITC < matchedITC && eligibleITC > 0) {
        status = "PARTIALLY_AVAILABLE";
    }

    let explanation = "";
    if (status === "ELIGIBLE") {
        explanation = "All conditions met. Full ITC can be claimed.";
    } else if (status === "BLOCKED_17_5") {
        explanation = `This invoice is for a blocked credit category under Section 17(5). ITC cannot be claimed regardless of other factors.`;
    } else if (status === "TIME_BARRED") {
        explanation = `The time limit for claiming this ITC has expired as per Section 16(4). ITC cannot be claimed after the deadline.`;
    } else if (status === "REVERSED_37") {
        explanation = `Supplier payment not made within 180 days. ITC must be reversed under Rule 37 until payment is completed.`;
    } else if (status === "REVERSED_42_43") {
        explanation = `Input used for both taxable and exempt/non-business supplies. ITC reversed proportionately under Rule 42/43.`;
    } else if (status === "PARTIALLY_AVAILABLE") {
        explanation = `Multiple factors affecting ITC eligibility. Only partial ITC can be claimed.`;
    }

    if (eligibleITC > 0 && warnings.length === 0) {
        recommendations.push("Maintain proper documentation including tax invoice, payment proof, and GSTR-2B reconciliation.");
    }

    return {
        eligibleITC: parseFloat(eligibleITC.toFixed(2)),
        ineligibleITC: parseFloat(ineligibleITC.toFixed(2)),
        status,
        breakdown: {
            booksITC: parseFloat(input.itcClaimedInBooks.toFixed(2)),
            gstr2bITC: parseFloat(input.itcAvailableInGSTR2B.toFixed(2)),
            matchedITC: parseFloat(matchedITC.toFixed(2)),
            blockedAmount: parseFloat(blockedAmount.toFixed(2)),
            timeBarredAmount: parseFloat(timeBarredAmount.toFixed(2)),
            reversed42_43: parseFloat(reversed42_43.toFixed(2)),
            reversed37: parseFloat(reversed37.toFixed(2)),
        },
        warnings,
        recommendations,
        explanation,
    };
}

export function calculateBulkITC(invoices: ITCInvoiceInput[]): {
    totalEligibleITC: number;
    totalIneligibleITC: number;
    summaryByStatus: Record<ITCStatus, { count: number; amount: number }>;
} {
    const statusTypes: ITCStatus[] = [
        "ELIGIBLE",
        "BLOCKED_17_5",
        "TIME_BARRED",
        "REVERSED_42_43",
        "REVERSED_37",
        "PARTIALLY_AVAILABLE",
    ];

    const summaryByStatus: Record<ITCStatus, { count: number; amount: number }> = {} as any;
    statusTypes.forEach((status) => {
        summaryByStatus[status] = { count: 0, amount: 0 };
    });

    let totalEligibleITC = 0;
    let totalIneligibleITC = 0;

    invoices.forEach((invoice) => {
        const calc = calculateITCEligibility(invoice);
        totalEligibleITC += calc.eligibleITC;
        totalIneligibleITC += calc.ineligibleITC;

        const statusEntry = summaryByStatus[calc.status];
        statusEntry.count += 1;
        statusEntry.amount += calc.eligibleITC;
    });

    return {
        totalEligibleITC: parseFloat(totalEligibleITC.toFixed(2)),
        totalIneligibleITC: parseFloat(totalIneligibleITC.toFixed(2)),
        summaryByStatus,
    };
}