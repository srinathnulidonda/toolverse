// features/finance/itc-calculator/itcRules.config.ts

export const ITC_RULES_VERSION = "FY2024-25";

export const BLOCKED_CREDIT_CATEGORIES = [
    {
        id: "motor-vehicles",
        label: "Motor Vehicles & Conveyances",
        note: "unless used for taxable supply"
    },
    {
        id: "food-beverages",
        label: "Food, Beverages & Outdoor Catering",
        note: "except for employees or business purposes"
    },
    {
        id: "health-life-insurance",
        label: "Health/Life Insurance",
        note: "unless statutorily obligated"
    },
    {
        id: "rent-a-cab",
        label: "Rent-a-Cab",
        note: "unless used for making taxable supply"
    },
    {
        id: "membership-club",
        label: "Club, Health & Fitness Membership",
        note: "personal use blocked"
    },
    {
        id: "employee-travel",
        label: "Employee Travel Benefits (LTA)",
        note: "leave travel assistance"
    },
    {
        id: "works-contract",
        label: "Works Contract for Immovable Property",
        note: "except plant & machinery"
    },
    {
        id: "construction-immovable",
        label: "Construction of Immovable Property",
        note: "except plant & machinery"
    },
    {
        id: "goods-lost",
        label: "Goods Lost, Stolen, Destroyed or Written Off",
        note: "involuntary loss"
    },
    {
        id: "free-gifts",
        label: "Free Gifts, Samples & Promotional Items",
        note: "given without consideration"
    },
    {
        id: "personal-use",
        label: "Goods/Services for Personal Consumption",
        note: "owner, employees or related persons"
    },
    {
        id: "composition-scheme",
        label: "Inputs for Composition Scheme Supplies",
        note: "when opted for composition"
    },
    {
        id: "csr-expenses",
        label: "CSR-Related Expenditure",
        note: "blocked as per latest clarification"
    }
] as const;

export const TIME_LIMIT_RULE = {
    description: "ITC must be claimed by earlier of: November 30 of following FY OR date of filing annual return for that year",
    cutoffMonth: 10,
    cutoffDay: 30,
    section: "16(4)",
    notes: "Missing the deadline makes ITC time-barred and non-claimable"
} as const;

export const REVERSAL_RULES = {
    rule42_43: {
        description: "Proportionate reversal for common credit used for both taxable and exempt supplies",
        formula: "(Common ITC × Exempt Turnover) / Total Turnover",
        section: "Rule 42 & 43 of CGST Rules",
        notes: "Applies when inputs are used for both taxable and exempt supplies"
    },
    rule37: {
        description: "Reversal if supplier not paid within 180 days from invoice date, with re-availment upon payment",
        daysLimit: 180,
        section: "Section 16(2) read with Rule 37",
        notes: "ITC must be reversed if payment not made within 180 days; can be reclaimed when payment is made"
    }
} as const;

export const ITC_DOCUMENTATION_REQUIREMENTS = {
    mandatory: [
        "Tax invoice or debit note issued by supplier",
        "Supplier has filed GSTR-1 return",
        "Invoice appears in GSTR-2B of recipient",
        "Tax has been paid to government by supplier",
        "Recipient has filed GSTR-3B return"
    ],
    recommended: [
        "Maintain proper books of accounts",
        "Reconcile books with GSTR-2A/2B monthly",
        "Track payment status for Rule 37 compliance",
        "Document usage split for Rule 42/43",
        "Maintain capital goods register if applicable"
    ]
} as const;

export const COMMON_ITC_MISTAKES = [
    {
        mistake: "Claiming ITC before supplier files their return",
        impact: "ITC may not appear in GSTR-2B and can be disallowed",
        solution: "Always verify invoice in GSTR-2B before claiming"
    },
    {
        mistake: "Not reversing ITC for unpaid invoices after 180 days",
        impact: "Non-compliance with Rule 37, penalty and interest",
        solution: "Implement automated payment tracking system"
    },
    {
        mistake: "Claiming full ITC on blocked categories",
        impact: "Entire ITC claim can be rejected under Section 17(5)",
        solution: "Review expense category before processing invoices"
    },
    {
        mistake: "Missing the time limit for claiming ITC",
        impact: "ITC becomes time-barred and permanently lost",
        solution: "File returns timely and claim all eligible ITC before Nov 30"
    },
    {
        mistake: "Not maintaining proportionate reversal calculation",
        impact: "Excess ITC claim, demand and penalty",
        solution: "Calculate and reverse ITC monthly for exempt supplies"
    }
] as const;