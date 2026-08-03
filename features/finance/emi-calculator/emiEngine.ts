// features/finance/emi-calculator/emiEngine.ts

export interface EMIInput {
    loanAmount: number;           // Principal loan amount
    interestRate: number;         // Annual interest rate (%)
    tenureValue: number;          // Tenure value
    tenureUnit: 'years' | 'months'; // Tenure unit
    loanStartDate: string;        // Start date in YYYY-MM-DD format
    loanType?: string;            // Optional loan type for display
    prepaymentType?: 'none' | 'one-time' | 'recurring'; // Prepayment type
    prepaymentAmount?: number;    // Prepayment amount
    prepaymentMonth?: number;     // Month when prepayment applies (1-based)
}

export interface EMIScheduleRow {
    month: number;
    paymentDate: string;          // YYYY-MM-DD format
    emi: number;
    principal: number;
    interest: number;
    balance: number;
}

export interface EMICalculationResult {
    emi: number;
    totalInterest: number;
    totalPayment: number;
    schedule: EMIScheduleRow[];
    principalVsInterestRatio: {
        principal: number;
        interest: number;
    };
    // Prepayment results (if applicable)
    interestSaved?: number;
    tenureReducedMonths?: number;
    totalInterestWithPrepayment?: number;
    totalPaymentWithPrepayment?: number;
}

export function calculateEMI(input: EMIInput): EMICalculationResult {
    // Validate inputs
    if (input.loanAmount <= 0) {
        throw new Error('Loan amount must be greater than zero');
    }

    if (input.interestRate < 0 || input.interestRate > 50) {
        throw new Error('Interest rate must be between 0 and 50 percent');
    }

    if (input.tenureValue <= 0) {
        throw new Error('Tenure must be greater than zero');
    }

    // Convert tenure to months
    const tenureInMonths = input.tenureUnit === 'years'
        ? input.tenureValue * 12
        : input.tenureValue;

    if (tenureInMonths <= 0) {
        throw new Error('Tenure in months must be greater than zero');
    }

    // Calculate monthly interest rate
    const monthlyRate = input.interestRate / 12 / 100;

    // Handle zero interest rate edge case
    let emi: number;
    if (monthlyRate === 0) {
        emi = input.loanAmount / tenureInMonths;
    } else {
        // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
        const compoundFactor = Math.pow(1 + monthlyRate, tenureInMonths);
        emi = input.loanAmount * monthlyRate * compoundFactor / (compoundFactor - 1);
    }

    // Generate amortization schedule
    const schedule: EMIScheduleRow[] = [];
    let remainingBalance = input.loanAmount;
    let totalInterest = 0;
    let totalPayment = 0;

    // Parse start date
    let currentDate = new Date(input.loanStartDate);

    for (let month = 1; month <= tenureInMonths; month++) {
        // Calculate interest for this month
        const interestPayment = remainingBalance * monthlyRate;

        // Calculate principal for this month
        const principalPayment = emi - interestPayment;

        // Update balance
        remainingBalance -= principalPayment;

        // Ensure balance doesn't go negative due to floating point errors
        if (remainingBalance < 0) {
            remainingBalance = 0;
        }

        // Accumulate totals
        totalInterest += interestPayment;
        totalPayment += emi;

        // Format date for this payment (add month-1 months to start date)
        const paymentDate = new Date(currentDate);
        paymentDate.setMonth(currentDate.getMonth() + month - 1);

        schedule.push({
            month,
            paymentDate: paymentDate.toISOString().split('T')[0],
            emi: parseFloat(emi.toFixed(2)),
            principal: parseFloat(principalPayment.toFixed(2)),
            interest: parseFloat(interestPayment.toFixed(2)),
            balance: parseFloat(remainingBalance.toFixed(2))
        });
    }

    // Adjust final balance to exactly zero due to rounding
    if (schedule.length > 0) {
        schedule[schedule.length - 1].balance = 0;
        // Adjust last month's principal to account for any rounding difference
        const lastPaymentAdjustment = schedule[schedule.length - 1].balance;
        schedule[schedule.length - 1].principal += lastPaymentAdjustment;
        schedule[schedule.length - 1].emi =
            parseFloat((schedule[schedule.length - 1].principal + schedule[schedule.length - 1].interest).toFixed(2));
    }

    // Recalculate totals with adjusted schedule
    totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    totalPayment = schedule.reduce((sum, row) => sum + row.emi, 0);

    // Calculate principal vs interest ratio
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);

    const result: EMICalculationResult = {
        emi: parseFloat(emi.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        totalPayment: parseFloat(totalPayment.toFixed(2)),
        schedule,
        principalVsInterestRatio: {
            principal: parseFloat(totalPrincipal.toFixed(2)),
            interest: parseFloat(totalInterest.toFixed(2))
        }
    };

    return result;
}

export function calculateWithPrepayment(input: EMIInput, prepayment: {
    type: 'one-time' | 'recurring';
    amount: number;
    month: number; // 1-based month
}): EMICalculationResult {
    // Validate prepayment inputs
    if (prepayment.amount <= 0) {
        throw new Error('Prepayment amount must be greater than zero');
    }

    if (prepayment.month < 1) {
        throw new Error('Prepayment month must be at least 1');
    }

    // Convert tenure to months
    const tenureInMonths = input.tenureUnit === 'years'
        ? input.tenureValue * 12
        : input.tenureValue;

    if (prepayment.month > tenureInMonths) {
        throw new Error('Prepayment month cannot exceed loan tenure');
    }

    // Calculate monthly interest rate
    const monthlyRate = input.interestRate / 12 / 100;

    // Handle zero interest rate edge case
    let emi: number;
    if (monthlyRate === 0) {
        emi = input.loanAmount / tenureInMonths;
    } else {
        // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
        const compoundFactor = Math.pow(1 + monthlyRate, tenureInMonths);
        emi = input.loanAmount * monthlyRate * compoundFactor / (compoundFactor - 1);
    }

    // Generate amortization schedule with prepayment
    const schedule: EMIScheduleRow[] = [];
    let remainingBalance = input.loanAmount;
    let totalInterest = 0;
    let totalPayment = 0;
    let prepaymentApplied = false;

    // Parse start date
    let currentDate = new Date(input.loanStartDate);

    for (let month = 1; month <= tenureInMonths; month++) {
        // Check if prepayment applies this month
        let prepaymentThisMonth = 0;
        if (!prepaymentApplied &&
            ((prepayment.type === 'one-time' && month === prepayment.month) ||
             (prepayment.type === 'recurring' && month >= prepayment.month))) {
            prepaymentThisMonth = prepayment.amount;
            prepaymentApplied = true;

            // For one-time prepayment, only apply in the specified month
            // For recurring prepayment, apply every month starting from the specified month
        }

        // Calculate interest for this month
        const interestPayment = remainingBalance * monthlyRate;

        // Calculate principal for this month (EMI + prepayment - interest)
        let principalPayment = emi + prepaymentThisMonth - interestPayment;

        // Update balance
        remainingBalance -= principalPayment;

        // Ensure balance doesn't go negative
        if (remainingBalance < 0) {
            // Adjust the last payment to bring balance to zero
            const adjustmentNeeded = Math.abs(remainingBalance);
            principalPayment += adjustmentNeeded;
            remainingBalance = 0;
        }

        // Accumulate totals
        totalInterest += interestPayment;
        totalPayment += emi + prepaymentThisMonth;

        // Format date for this payment
        const paymentDate = new Date(currentDate);
        paymentDate.setMonth(currentDate.getMonth() + month - 1);

        schedule.push({
            month,
            paymentDate: paymentDate.toISOString().split('T')[0],
            emi: parseFloat((emi + prepaymentThisMonth).toFixed(2)),
            principal: parseFloat(principalPayment.toFixed(2)),
            interest: parseFloat(interestPayment.toFixed(2)),
            balance: parseFloat(remainingBalance.toFixed(2))
        });

        // If balance reaches zero, we've paid off the loan early
        if (remainingBalance <= 0) {
            break;
        }
    }

    // Calculate original schedule without prepayment for comparison
    const originalResult = calculateEMI({
        ...input,
        prepaymentType: 'none'
    });

    // Calculate interest saved and tenure reduced
    const interestSaved = originalResult.totalInterest - totalInterest;
    const tenureReducedMonths = originalResult.schedule.length - schedule.length;

    const result: EMICalculationResult = {
        emi: parseFloat(emi.toFixed(2)), // Base EMI (without prepayment)
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        totalPayment: parseFloat(totalPayment.toFixed(2)),
        schedule,
        principalVsInterestRatio: {
            principal: parseFloat((schedule.reduce((sum, row) => sum + row.principal, 0)).toFixed(2)),
            interest: parseFloat(totalInterest.toFixed(2))
        },
        interestSaved: parseFloat(Math.max(0, interestSaved).toFixed(2)),
        tenureReducedMonths: Math.max(0, tenureReducedMonths),
        totalInterestWithPrepayment: parseFloat(totalInterest.toFixed(2)),
        totalPaymentWithPrepayment: parseFloat(totalPayment.toFixed(2))
    };

    return result;
}