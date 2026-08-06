// features/finance/sip-calculator/ts/sampleData.ts

const today = new Date();
const getTodayString = () => today.toISOString().split('T')[0];

export const SAMPLE_SIPS = {
    regularSIP: {
        mode: "regular",
        monthlyInvestment: 10000,
        expectedReturn: 12,
        tenureValue: 15,
        tenureUnit: 'years',
        lumpSum: 50000,
        inflationRate: 6,
        stepUpPercentage: 0, // Not used in regular SIP
        goalAmount: 0 // Not used in regular SIP
    },
    stepUpSIP: {
        mode: "step-up",
        monthlyInvestment: 15000,
        expectedReturn: 14,
        tenureValue: 10,
        tenureUnit: 'years',
        lumpSum: 0,
        inflationRate: 6,
        stepUpPercentage: 10,
        goalAmount: 0 // Not used in step-up SIP
    },
    goalBasedSIP: {
        mode: "goal-based",
        monthlyInvestment: 0, // Will be calculated
        expectedReturn: 12,
        tenureValue: 20,
        tenureUnit: 'years',
        lumpSum: 100000,
        inflationRate: 6,
        stepUpPercentage: 0, // Not used in goal-based SIP
        goalAmount: 10000000 // 1 crore
    }
} as const;

export type SampleSIPType = keyof typeof SAMPLE_SIPS;

export const SAMPLE_SIP_LABELS: Record<SampleSIPType, { label: string; desc: string; icon: string }> = {
    regularSIP: {
        label: "Regular SIP",
        desc: "₹10,000/month for 15 years at 12% returns with ₹50,000 lump sum",
        icon: "ti-piggy-bank"
    },
    stepUpSIP: {
        label: "Step-Up SIP",
        desc: "₹15,000/month increasing 10% yearly for 10 years at 14% returns",
        icon: "ti-trending-up"
    },
    goalBasedSIP: {
        label: "Goal-Based SIP",
        desc: "Target ₹1 crore in 20 years at 12% returns with ₹1,00,000 lump sum",
        icon: "ti-target"
    }
};