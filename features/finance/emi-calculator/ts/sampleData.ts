// features/finance/emi-calculator/ts/sampleData.ts

const today = new Date();
const getTodayString = () => today.toISOString().split('T')[0];
const getDateString = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const SAMPLE_LOANS = {
    homeLoan: {
        loanAmount: 5000000,
        interestRate: 8.5,
        tenureValue: 20,
        tenureUnit: 'years',
        loanStartDate: getTodayString(),
        loanType: "Home",
        prepaymentType: "none",
        prepaymentAmount: undefined,
        prepaymentMonth: undefined,
    },
    carLoan: {
        loanAmount: 800000,
        interestRate: 9.0,
        tenureValue: 5,
        tenureUnit: 'years',
        loanStartDate: getTodayString(),
        loanType: "Car",
        prepaymentType: "none",
        prepaymentAmount: undefined,
        prepaymentMonth: undefined,
    },
    personalLoan: {
        loanAmount: 500000,
        interestRate: 14.0,
        tenureValue: 3,
        tenureUnit: 'years',
        loanStartDate: getTodayString(),
        loanType: "Personal",
        prepaymentType: "one-time",
        prepaymentAmount: 100000,
        prepaymentMonth: 12,
    },
    educationLoan: {
        loanAmount: 1500000,
        interestRate: 10.5,
        tenureValue: 10,
        tenureUnit: 'years',
        loanStartDate: getTodayString(),
        loanType: "Education",
        prepaymentType: "recurring",
        prepaymentAmount: 5000,
        prepaymentMonth: 6,
    },
    zeroInterestLoan: {
        loanAmount: 300000,
        interestRate: 0,
        tenureValue: 2,
        tenureUnit: 'years',
        loanStartDate: getTodayString(),
        loanType: "Interest-Free",
        prepaymentType: "none",
        prepaymentAmount: undefined,
        prepaymentMonth: undefined,
    },
} as const;

export type SampleLoanType = keyof typeof SAMPLE_LOANS;

export const SAMPLE_LOAN_LABELS: Record<SampleLoanType, { label: string; desc: string; icon: string }> = {
    homeLoan: {
        label: "Home Loan",
        desc: "20-year home loan at 8.5% interest",
        icon: "ti-home",
    },
    carLoan: {
        label: "Car Loan",
        desc: "5-year car loan at 9.0% interest",
        icon: "ti-car",
    },
    personalLoan: {
        label: "Personal Loan with Prepayment",
        desc: "3-year personal loan with ₹1,00,000 lump sum prepayment",
        icon: "ti-wallet",
    },
    educationLoan: {
        label: "Education Loan with Extra Payment",
        desc: "10-year education loan with ₹5,000 extra monthly payment",
        icon: "ti-school",
    },
    zeroInterestLoan: {
        label: "Interest-Free Loan",
        desc: "2-year loan at 0% interest (edge case)",
        icon: "ti-checkbox",
    },
};