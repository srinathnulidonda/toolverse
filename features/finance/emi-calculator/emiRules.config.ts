// features/finance/emi-calculator/emiRules.config.ts

export const EMI_RULES_VERSION = "FY2024-25";

export const LOAN_TYPE_PRESETS = [
    {
        id: "home",
        label: "Home Loan",
        icon: "ti-home",
        typicalRateRange: "7.5% - 9.5%",
        typicalTenure: "10-30 years",
        description: "Long-term loan for purchasing or constructing residential property"
    },
    {
        id: "car",
        label: "Car Loan",
        icon: "ti-car",
        typicalRateRange: "7.0% - 12.0%",
        typicalTenure: "3-7 years",
        description: "Loan for purchasing new or used vehicles"
    },
    {
        id: "personal",
        label: "Personal Loan",
        icon: "ti-wallet",
        typicalRateRange: "10.5% - 24.0%",
        typicalTenure: "1-5 years",
        description: "Unsecured loan for personal expenses"
    },
    {
        id: "education",
        label: "Education Loan",
        icon: "ti-school",
        typicalRateRange: "8.0% - 15.0%",
        typicalTenure: "5-15 years",
        description: "Loan for financing educational expenses"
    }
] as const;

export const PREPAYMENT_OPTIONS = [
    {
        id: "none",
        label: "No Prepayment",
        description: "Regular EMI payments only"
    },
    {
        id: "one-time",
        label: "One-time Lump Sum",
        description: "Single lump sum payment at a specific month"
    },
    {
        id: "recurring",
        label: "Recurring Extra Payment",
        description: "Extra amount added to regular EMI every month"
    }
] as const;

export const EMI_CALCULATION_ASSUMPTIONS = {
    interestCompounding: "Monthly",
    paymentFrequency: "Monthly",
    dayCountConvention: "Actual/365",
    description: "Standard reducing balance method with monthly rests"
} as const;