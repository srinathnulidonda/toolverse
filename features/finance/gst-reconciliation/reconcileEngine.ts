// features/finance/gst-reconciliation/reconcileEngine.ts

export type ReconciliationType = "sales" | "purchases" | "itc";

export interface ReconciliationData {
    sales: {
        books: number;
        gstr1: number;
        period: string;
    };
    purchases: {
        books: number;
        gstr2a: number;
        period: string;
    };
    itc: {
        claimed: number;
        available: number;
        period: string;
    };
}

export interface Recommendation {
    severity: "info" | "warning" | "error";
    icon: string;
    title: string;
    description: string;
    action?: string;
}

export interface ReconciliationResult {
    salesVariance: number;
    purchaseVariance: number;
    itcVariance: number;
    complianceScore: number;
    details: ReconciliationData;
    recommendations: Recommendation[];
    riskLevel: "low" | "medium" | "high";
}

export interface ReconciliationTypeInfo {
    id: ReconciliationType;
    name: string;
    description: string;
    icon: string;
}

export interface MismatchReason {
    category: string;
    reasons: string[];
    icon: string;
}

export const RECONCILIATION_TYPES: ReconciliationTypeInfo[] = [
    {
        id: "sales",
        name: "Sales Reconciliation",
        description: "Books vs GSTR-1",
        icon: "ti-trending-up",
    },
    {
        id: "purchases",
        name: "Purchase Reconciliation",
        description: "Books vs GSTR-2A",
        icon: "ti-shopping-cart",
    },
    {
        id: "itc",
        name: "ITC Reconciliation",
        description: "Claimed vs Available",
        icon: "ti-receipt-refund",
    },
];

export const MISMATCH_REASONS: MismatchReason[] = [
    {
        category: "Sales Mismatches",
        icon: "ti-trending-up",
        reasons: [
            "Invoice not reported in GSTR-1",
            "Wrong GSTIN entered for B2B invoice",
            "Amendment not filed for corrected invoice",
            "Credit/Debit note not accounted",
            "Export invoice classification error",
            "B2C vs B2B classification error",
        ],
    },
    {
        category: "Purchase Mismatches",
        icon: "ti-shopping-cart",
        reasons: [
            "Supplier hasn't filed GSTR-1",
            "Supplier filed with wrong GSTIN",
            "Invoice date mismatch",
            "Supplier used wrong tax rate",
            "Invoice not yet reflected in GSTR-2A",
            "Duplicate invoice entry in books",
        ],
    },
    {
        category: "ITC Mismatches",
        icon: "ti-receipt-refund",
        reasons: [
            "ITC claimed before supplier filing",
            "Blocked credit wrongly claimed",
            "ITC reversal not accounted",
            "Provisional ITC not reconciled",
            "Time-barred ITC claims",
            "Rule 36(4) restriction violation",
        ],
    },
];

// Main reconciliation function
export function reconcileGSTReturns(data: ReconciliationData): ReconciliationResult {
    const salesVariance = parseFloat((data.sales.books - data.sales.gstr1).toFixed(2));
    const purchaseVariance = parseFloat((data.purchases.books - data.purchases.gstr2a).toFixed(2));
    const itcVariance = parseFloat((data.itc.claimed - data.itc.available).toFixed(2));

    const recommendations = generateRecommendations(data, salesVariance, purchaseVariance, itcVariance);
    const complianceScore = calculateComplianceScore(data, salesVariance, purchaseVariance, itcVariance);
    const riskLevel = determineRiskLevel(complianceScore, salesVariance, purchaseVariance, itcVariance);

    return {
        salesVariance,
        purchaseVariance,
        itcVariance,
        complianceScore,
        details: data,
        recommendations,
        riskLevel,
    };
}

// Generate contextual recommendations based on variances
function generateRecommendations(
    data: ReconciliationData,
    salesVariance: number,
    purchaseVariance: number,
    itcVariance: number
): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Sales variance recommendations
    if (Math.abs(salesVariance) > 0) {
        if (salesVariance > 0) {
            recommendations.push({
                severity: "warning",
                icon: "ti-alert-triangle",
                title: "Under-reported Sales",
                description: `You have ₹${Math.abs(salesVariance).toLocaleString('en-IN')} in sales that appears in your books but not in GSTR-1. This could result in a tax notice.`,
                action: "File GSTR-1 amendment to include missing invoices before the due date.",
            });
        } else {
            recommendations.push({
                severity: "error",
                icon: "ti-alert-circle",
                title: "Over-reported Sales",
                description: `Your GSTR-1 shows ₹${Math.abs(salesVariance).toLocaleString('en-IN')} more than your books. This needs immediate investigation.`,
                action: "Review GSTR-1 entries for duplicate or incorrect invoices.",
            });
        }
    }

    // Purchase variance recommendations
    if (Math.abs(purchaseVariance) > 0) {
        if (purchaseVariance > 0) {
            recommendations.push({
                severity: "error",
                icon: "ti-x",
                title: "Missing Purchase Invoices in GSTR-2A",
                description: `₹${Math.abs(purchaseVariance).toLocaleString('en-IN')} in purchases from your books are not reflected in GSTR-2A. This means your suppliers haven't filed their returns.`,
                action: "Follow up with suppliers to ensure timely GSTR-1 filing. Your ITC claim may be at risk.",
            });
        } else {
            recommendations.push({
                severity: "warning",
                icon: "ti-info-circle",
                title: "Extra Credits in GSTR-2A",
                description: `GSTR-2A shows ₹${Math.abs(purchaseVariance).toLocaleString('en-IN')} more than your books. You may have missed recording some purchases.`,
                action: "Review supplier invoices and update your purchase register.",
            });
        }
    }

    // ITC variance recommendations
    if (Math.abs(itcVariance) > 0) {
        if (itcVariance > 0) {
            recommendations.push({
                severity: "error",
                icon: "ti-alert-triangle",
                title: "Excess ITC Claimed",
                description: `You've claimed ₹${Math.abs(itcVariance).toLocaleString('en-IN')} more ITC than available in GSTR-2A. This violates Rule 36(4) and may attract penalty.`,
                action: "Reverse excess ITC claim immediately in next GSTR-3B filing to avoid interest and penalty.",
            });
        } else {
            recommendations.push({
                severity: "info",
                icon: "ti-info-circle",
                title: "Under-claimed ITC",
                description: `You have ₹${Math.abs(itcVariance).toLocaleString('en-IN')} in additional ITC available that you haven't claimed yet.`,
                action: "Claim the eligible ITC in your next GSTR-3B filing to optimize tax credits.",
            });
        }
    }

    // Perfect match recommendation
    if (salesVariance === 0 && purchaseVariance === 0 && itcVariance === 0) {
        recommendations.push({
            severity: "info",
            icon: "ti-check",
            title: "Perfect Reconciliation!",
            description: "All your figures match perfectly between books and GST returns. Great job maintaining compliance!",
        });
    }

    return recommendations;
}

// Calculate compliance score (0-100)
function calculateComplianceScore(
    data: ReconciliationData,
    salesVariance: number,
    purchaseVariance: number,
    itcVariance: number
): number {
    let score = 100;

    // Sales variance impact (max -30 points)
    if (data.sales.books > 0) {
        const salesVariancePercent = Math.abs(salesVariance / data.sales.books) * 100;
        if (salesVariancePercent > 10) score -= 30;
        else if (salesVariancePercent > 5) score -= 20;
        else if (salesVariancePercent > 1) score -= 10;
        else if (salesVariancePercent > 0) score -= 5;
    }

    // Purchase variance impact (max -30 points)
    if (data.purchases.books > 0) {
        const purchaseVariancePercent = Math.abs(purchaseVariance / data.purchases.books) * 100;
        if (purchaseVariancePercent > 10) score -= 30;
        else if (purchaseVariancePercent > 5) score -= 20;
        else if (purchaseVariancePercent > 1) score -= 10;
        else if (purchaseVariancePercent > 0) score -= 5;
    }

    // ITC variance impact (max -40 points, more critical)
    if (data.itc.claimed > 0) {
        const itcVariancePercent = Math.abs(itcVariance / data.itc.claimed) * 100;
        if (itcVariance > 0) {
            // Excess ITC claimed is more serious
            if (itcVariancePercent > 10) score -= 40;
            else if (itcVariancePercent > 5) score -= 25;
            else if (itcVariancePercent > 1) score -= 15;
            else if (itcVariancePercent > 0) score -= 8;
        } else {
            // Under-claimed ITC is less serious (opportunity loss, not compliance issue)
            if (itcVariancePercent > 10) score -= 15;
            else if (itcVariancePercent > 5) score -= 10;
            else if (itcVariancePercent > 1) score -= 5;
        }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

// Determine overall risk level
function determineRiskLevel(
    complianceScore: number,
    salesVariance: number,
    purchaseVariance: number,
    itcVariance: number
): "low" | "medium" | "high" {
    // High risk if excess ITC claimed (regulatory violation)
    if (itcVariance > 0 && Math.abs(itcVariance) > 1000) {
        return "high";
    }

    if (complianceScore >= 90) return "low";
    if (complianceScore >= 70) return "medium";
    return "high";
}

// Calculate variance percentage
export function calculateVariancePercentage(actual: number, expected: number): number {
    if (expected === 0) return actual === 0 ? 0 : 100;
    return parseFloat((((actual - expected) / expected) * 100).toFixed(2));
}

// Estimate potential penalty for mismatches
export function estimatePenalty(
    itcVariance: number,
    delayInDays: number = 30,
    interestRate: number = 18
): {
    interestAmount: number;
    penaltyAmount: number;
    totalLiability: number;
} {
    if (itcVariance <= 0) {
        return { interestAmount: 0, penaltyAmount: 0, totalLiability: 0 };
    }

    // Interest calculation (18% per annum on excess ITC)
    const dailyRate = interestRate / 365 / 100;
    const interestAmount = parseFloat((itcVariance * dailyRate * delayInDays).toFixed(2));

    // Penalty (10% of tax amount or Rs. 10,000, whichever is higher, as per Sec 122)
    const penaltyAmount = Math.max(itcVariance * 0.1, 10000);

    const totalLiability = parseFloat((itcVariance + interestAmount + penaltyAmount).toFixed(2));

    return {
        interestAmount,
        penaltyAmount: parseFloat(penaltyAmount.toFixed(2)),
        totalLiability,
    };
}

// Get reconciliation status summary
export function getReconciliationStatus(result: ReconciliationResult): {
    status: "matched" | "minor_mismatch" | "major_mismatch";
    label: string;
    color: string;
} {
    const totalVariance = Math.abs(result.salesVariance) + 
                          Math.abs(result.purchaseVariance) + 
                          Math.abs(result.itcVariance);

    if (totalVariance === 0) {
        return { status: "matched", label: "Fully Matched", color: "#10b981" };
    }

    if (result.complianceScore >= 85) {
        return { status: "minor_mismatch", label: "Minor Mismatch", color: "#f59e0b" };
    }

    return { status: "major_mismatch", label: "Major Mismatch", color: "#dc2626" };
}

// Batch reconciliation for multiple periods
export function batchReconcile(
    periodsData: ReconciliationData[]
): {
    results: ReconciliationResult[];
    summary: {
        totalPeriods: number;
        averageComplianceScore: number;
        totalSalesVariance: number;
        totalPurchaseVariance: number;
        totalITCVariance: number;
        periodsWithIssues: number;
    };
} {
    const results = periodsData.map(data => reconcileGSTReturns(data));

    const totalSalesVariance = results.reduce((sum, r) => sum + Math.abs(r.salesVariance), 0);
    const totalPurchaseVariance = results.reduce((sum, r) => sum + Math.abs(r.purchaseVariance), 0);
    const totalITCVariance = results.reduce((sum, r) => sum + Math.abs(r.itcVariance), 0);
    const averageComplianceScore = results.reduce((sum, r) => sum + r.complianceScore, 0) / results.length;
    const periodsWithIssues = results.filter(r => 
        Math.abs(r.salesVariance) > 0 || Math.abs(r.purchaseVariance) > 0 || Math.abs(r.itcVariance) > 0
    ).length;

    return {
        results,
        summary: {
            totalPeriods: periodsData.length,
            averageComplianceScore: parseFloat(averageComplianceScore.toFixed(2)),
            totalSalesVariance: parseFloat(totalSalesVariance.toFixed(2)),
            totalPurchaseVariance: parseFloat(totalPurchaseVariance.toFixed(2)),
            totalITCVariance: parseFloat(totalITCVariance.toFixed(2)),
            periodsWithIssues,
        },
    };
}

// Parse CSV data for reconciliation (basic implementation)
export function parseCSVForReconciliation(csvContent: string): {
    invoiceNumber: string;
    date: string;
    amount: number;
    gstAmount: number;
    party: string;
}[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const invoiceIdx = headers.findIndex(h => h.includes('invoice'));
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const amountIdx = headers.findIndex(h => h.includes('amount') && !h.includes('gst'));
    const gstIdx = headers.findIndex(h => h.includes('gst'));
    const partyIdx = headers.findIndex(h => h.includes('party') || h.includes('name') || h.includes('supplier'));

    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length >= headers.length) {
            results.push({
                invoiceNumber: values[invoiceIdx] || '',
                date: values[dateIdx] || '',
                amount: parseFloat(values[amountIdx]) || 0,
                gstAmount: parseFloat(values[gstIdx]) || 0,
                party: values[partyIdx] || '',
            });
        }
    }

    return results;
}

// Match invoices between two datasets (fuzzy matching)
export function matchInvoices(
    booksData: Array<{ invoiceNumber: string; amount: number; date: string }>,
    gstrData: Array<{ invoiceNumber: string; amount: number; date: string }>
): {
    matched: Array<{ books: any; gstr: any; variance: number }>;
    onlyInBooks: any[];
    onlyInGSTR: any[];
} {
    const matched: Array<{ books: any; gstr: any; variance: number }> = [];
    const onlyInBooks: any[] = [];
    const gstrMatched = new Set<number>();

    booksData.forEach(bookEntry => {
        const gstrIndex = gstrData.findIndex((gstrEntry, idx) => 
            !gstrMatched.has(idx) && 
            (gstrEntry.invoiceNumber === bookEntry.invoiceNumber ||
             Math.abs(gstrEntry.amount - bookEntry.amount) < 1) // Allow small rounding differences
        );

        if (gstrIndex !== -1) {
            gstrMatched.add(gstrIndex);
            matched.push({
                books: bookEntry,
                gstr: gstrData[gstrIndex],
                variance: bookEntry.amount - gstrData[gstrIndex].amount,
            });
        } else {
            onlyInBooks.push(bookEntry);
        }
    });

    const onlyInGSTR = gstrData.filter((_, idx) => !gstrMatched.has(idx));

    return { matched, onlyInBooks, onlyInGSTR };
}

// Format currency
export function formatCurrency(amount: number, currency: string = "INR"): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Format number
export function formatNumber(n: number): string {
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

// Export reconciliation report to CSV
export function exportReconciliationReport(result: ReconciliationResult, period: string): string {
    const rows = [
        ["GST Reconciliation Report"],
        [`Period: ${period}`],
        [""],
        ["Category", "Books Amount", "Return Amount", "Variance", "Status"],
        [
            "Sales",
            result.details.sales.books.toString(),
            result.details.sales.gstr1.toString(),
            result.salesVariance.toString(),
            result.salesVariance === 0 ? "Matched" : "Mismatch",
        ],
        [
            "Purchases",
            result.details.purchases.books.toString(),
            result.details.purchases.gstr2a.toString(),
            result.purchaseVariance.toString(),
            result.purchaseVariance === 0 ? "Matched" : "Mismatch",
        ],
        [
            "ITC",
            result.details.itc.claimed.toString(),
            result.details.itc.available.toString(),
            result.itcVariance.toString(),
            result.itcVariance === 0 ? "Matched" : "Mismatch",
        ],
        [""],
        [`Compliance Score: ${result.complianceScore}%`],
        [`Risk Level: ${result.riskLevel.toUpperCase()}`],
        [""],
        ["Recommendations:"],
        ...result.recommendations.map(r => [r.title, r.description]),
    ];

    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

// Sample reconciliation scenarios
export const SAMPLE_RECONCILIATION_SCENARIOS = {
    perfectMatch: {
        name: "Perfect Match",
        description: "All figures reconcile perfectly",
        data: {
            sales: { books: 500000, gstr1: 500000, period: "2024-01" },
            purchases: { books: 300000, gstr2a: 300000, period: "2024-01" },
            itc: { claimed: 45000, available: 45000, period: "2024-01" },
        },
    },
    minorMismatch: {
        name: "Minor Mismatch",
        description: "Small discrepancies within acceptable range",
        data: {
            sales: { books: 500000, gstr1: 495000, period: "2024-01" },
            purchases: { books: 300000, gstr2a: 297000, period: "2024-01" },
            itc: { claimed: 45000, available: 44000, period: "2024-01" },
        },
    },
    majorMismatch: {
        name: "Major Mismatch",
        description: "Significant discrepancies requiring immediate attention",
        data: {
            sales: { books: 500000, gstr1: 450000, period: "2024-01" },
            purchases: { books: 300000, gstr2a: 250000, period: "2024-01" },
            itc: { claimed: 55000, available: 40000, period: "2024-01" },
        },
    },
};