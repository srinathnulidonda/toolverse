// features/finance/sip-calculator/ts/sipRules.config.ts

export const SIP_RULES_VERSION = "FY2024-25";

export const SIP_RETURN_PRESETS = [
    {
        id: "debt",
        label: "Debt Funds",
        icon: "ti-piggy-bank",
        typicalReturnRange: "6% - 9%",
        description: "Invests in fixed income instruments like bonds and government securities"
    },
    {
        id: "hybrid",
        label: "Hybrid Funds",
        icon: "ti-balance-wallet",
        typicalReturnRange: "8% - 12%",
        description: "Mix of equity and debt instruments for balanced risk-return"
    },
    {
        id: "equity",
        label: "Equity Funds",
        icon: "ti-trending-up",
        typicalReturnRange: "10% - 15%",
        description: "Primarily invests in company stocks for long-term growth"
    },
    {
        id: "small-cap",
        label: "Small Cap Funds",
        icon: "ti-trending-up",
        typicalReturnRange: "12% - 18%",
        description: "Invests in small-sized companies with high growth potential"
    }
] as const;

export const STEP_UP_PRESETS = [
    {
        id: "low",
        label: "Conservative",
        percentage: 5,
        description: "Suitable for slow income growth"
    },
    {
        id: "moderate",
        label: "Moderate",
        percentage: 10,
        description: "Matches average annual income growth"
    },
    {
        id: "aggressive",
        label: "Aggressive",
        percentage: 15,
        description: "For rapid income growth expectations"
    }
] as const;

export const SIP_CALCULATION_ASSUMPTIONS = {
    interestCompounding: "Monthly",
    paymentFrequency: "Monthly",
    stepUpFrequency: "Annually",
    stepUpAnniversary: "SIP start date (not calendar year)",
    description: "Standard compounding with monthly rests and annual step-up adjustments"
} as const;