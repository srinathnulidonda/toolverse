// features/finance/sip-calculator/ts/sipEngine.ts

export interface SIPInput {
    mode: 'regular' | 'step-up' | 'goal-based';
    monthlyInvestment: number;           // Base monthly investment (for regular/step-up) or target-based calculation
    expectedReturn: number;              // Annual expected return rate (%)
    tenureValue: number;                 // Investment duration value
    tenureUnit: 'years' | 'months';      // Investment duration unit
    lumpSum?: number;                    // Initial lump sum investment (optional)
    inflationRate?: number;              // Annual inflation rate for real returns calculation (optional)
    stepUpPercentage?: number;           // Annual step-up percentage (for step-up mode)
    goalAmount?: number;                 // Target amount (for goal-based mode)
}

export interface SIPScheduleRow {
    year: number;
    investedThatYear: number;
    cumulativeInvested: number;
    interestThatYear: number;
    cumulativeInterest: number;
    yearEndBalance: number;
}

export interface SIPCalculationResult {
    totalInvested: number;               // Total amount invested over the period
    returns: number;                     // Total returns/gains earned
    maturityAmount: number;              // Future value (nominal)
    inflationAdjustedAmount?: number;    // Future value adjusted for inflation
    realReturns?: number;                // Real returns after inflation
    monthlySIPRequired?: number;         // For goal-based mode: required monthly SIP
    yearlyBreakdown: SIPScheduleRow[];   // Year-wise breakdown for display
}

export interface GoalSIPInput {
    goalAmount: number;                  // Target amount to achieve
    expectedReturn: number;              // Annual expected return rate (%)
    tenureValue: number;                 // Investment duration value
    tenureUnit: 'years' | 'months';      // Investment duration unit
    lumpSum?: number;                    // Initial lump sum investment (optional)
}

export interface GoalSIPResult {
    monthlySIPRequired: number;          // Required monthly SIP to reach goal
    totalInvested: number;               // Total amount that will be invested
    returns: number;                     // Total returns/gains earned
    maturityAmount: number;              // Future value (should equal goalAmount approximately)
    yearlyBreakdown: SIPScheduleRow[];   // Year-wise breakdown
}

/**
 * Calculate returns for a regular SIP (fixed monthly investment)
 * Formula: M = P × [({(1 + i)^n – 1} / i)] × (1 + i)
 * Where: P = monthly investment, i = monthly rate, n = number of months
 */
export function calculateRegularSIP(input: SIPInput): SIPCalculationResult {
    // Validate inputs
    if (input.monthlyInvestment <= 0) {
        throw new Error('Monthly investment must be greater than zero');
    }

    if (input.expectedReturn <= 0 || input.expectedReturn > 30) {
        throw new Error('Expected return must be between 0 and 30 percent');
    }

    if (input.tenureValue <= 0) {
        throw new Error('Tenure must be greater than zero');
    }

    const lumpSum = input.lumpSum ?? 0;
    if (lumpSum < 0) {
        throw new Error('Lump sum cannot be negative');
    }

    const inflationRate = input.inflationRate ?? 0;
    if (inflationRate < 0 || inflationRate > 20) {
        throw new Error('Inflation rate must be between 0 and 20 percent');
    }

    // Convert tenure to months
    const tenureInMonths = input.tenureUnit === 'years'
        ? input.tenureValue * 12
        : input.tenureValue;

    if (tenureInMonths <= 0) {
        throw new Error('Tenure in months must be greater than zero');
    }

    // Convert annual rates to monthly
    const monthlyRate = input.expectedReturn / 12 / 100;
    const monthlyInflationRate = inflationRate / 12 / 100;

    // Calculate future value of SIP series
    let futureValueOfSIP = 0;
    if (monthlyRate === 0) {
        futureValueOfSIP = input.monthlyInvestment * tenureInMonths;
    } else {
        // FV = P * [((1 + r)^n - 1) / r] * (1 + r)
        const compoundFactor = Math.pow(1 + monthlyRate, tenureInMonths);
        futureValueOfSIP = input.monthlyInvestment *
                          ((Math.pow(1 + monthlyRate, tenureInMonths) - 1) / monthlyRate) *
                          (1 + monthlyRate);
    }

    // Calculate future value of lump sum
    let futureValueOfLumpSum = lumpSum;
    if (lumpSum > 0) {
        if (monthlyRate === 0) {
            futureValueOfLumpSum = lumpSum;
        } else {
            futureValueOfLumpSum = lumpSum * Math.pow(1 + monthlyRate, tenureInMonths);
        }
    }

    const maturityAmount = futureValueOfSIP + futureValueOfLumpSum;
    const totalInvested = (input.monthlyInvestment * tenureInMonths) + lumpSum;
    const returns = maturityAmount - totalInvested;

    // Calculate inflation-adjusted values if inflation is provided
    let inflationAdjustedAmount = undefined;
    let realReturns = undefined;
    if (inflationRate > 0) {
        inflationAdjustedAmount = maturityAmount / Math.pow(1 + inflationRate / 100, input.tenureValue);
        realReturns = inflationAdjustedAmount - totalInvested;
    }

    // Generate year-wise breakdown
    const yearlyBreakdown: SIPScheduleRow[] = [];
    let balance = 0;
    let cumulativeInvested = 0;
    let cumulativeInterest = 0;

    for (let year = 1; year <= Math.ceil(tenureInMonths / 12); year++) {
        const startMonth = (year - 1) * 12 + 1;
        const endMonth = Math.min(year * 12, tenureInMonths);
        const monthsInYear = endMonth - startMonth + 1;

        let investedThatYear = 0;
        let interestThatYear = 0;

        // Calculate monthly contributions and interest for this year
        let yearStartBalance = balance;
        for (let month = startMonth; month <= endMonth; month++) {
            // Add monthly investment
            const monthlyInvestment = input.monthlyInvestment;
            investedThatYear += monthlyInvestment;
            balance += monthlyInvestment;

            // Calculate interest on current balance
            const monthlyInterest = balance * monthlyRate;
            interestThatYear += monthlyInterest;
            balance += monthlyInterest;
        }

        // Add lump sum interest in first year only
        if (year === 1 && lumpSum > 0) {
            const lumpSumInterest = lumpSum * monthlyRate * 12; // Simple approximation for first year
            interestThatYear += lumpSumInterest;
            balance += lumpSumInterest;
            // Note: lump sum principal already accounted for in initial balance
        }

        cumulativeInvested += investedThatYear;
        cumulativeInterest += interestThatYear;
        const yearEndBalance = balance;

        yearlyBreakdown.push({
            year,
            investedThatYear: parseFloat(investedThatYear.toFixed(2)),
            cumulativeInvested: parseFloat(cumulativeInvested.toFixed(2)),
            interestThatYear: parseFloat(interestThatYear.toFixed(2)),
            cumulativeInterest: parseFloat(cumulativeInterest.toFixed(2)),
            yearEndBalance: parseFloat(yearEndBalance.toFixed(2))
        });
    }

    return {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        returns: parseFloat(returns.toFixed(2)),
        maturityAmount: parseFloat(maturityAmount.toFixed(2)),
        ...(inflationRate > 0 ? {
            inflationAdjustedAmount: parseFloat(inflationAdjustedAmount!.toFixed(2)),
            realReturns: parseFloat(realReturns!.toFixed(2))
        } : {}),
        yearlyBreakdown
    };
}

/**
 * Calculate returns for a step-up SIP (monthly investment increases annually by a fixed percentage)
 * Calculation done year-by-year with monthly compounding within each year
 */
export function calculateStepUpSIP(input: SIPInput): SIPCalculationResult {
    // Validate inputs
    if (input.monthlyInvestment <= 0) {
        throw new Error('Monthly investment must be greater than zero');
    }

    if (input.expectedReturn <= 0 || input.expectedReturn > 30) {
        throw new Error('Expected return must be between 0 and 30 percent');
    }

    if (input.tenureValue <= 0) {
        throw new Error('Tenure must be greater than zero');
    }

    if (input.stepUpPercentage === undefined) {
        throw new Error('Step-up percentage is required for step-up SIP');
    }

    if (input.stepUpPercentage < 0 || input.stepUpPercentage > 50) {
        throw new Error('Step-up percentage must be between 0 and 50 percent');
    }

    const lumpSum = input.lumpSum ?? 0;
    if (lumpSum < 0) {
        throw new Error('Lump sum cannot be negative');
    }

    const inflationRate = input.inflationRate ?? 0;
    if (inflationRate < 0 || inflationRate > 20) {
        throw new Error('Inflation rate must be between 0 and 20 percent');
    }

    // Convert tenure to months and years
    const tenureInMonths = input.tenureUnit === 'years'
        ? input.tenureValue * 12
        : input.tenureValue;
    const tenureInYears = Math.ceil(tenureInMonths / 12);

    if (tenureInMonths <= 0) {
        throw new Error('Tenure in months must be greater than zero');
    }

    // Convert annual rates to monthly
    const monthlyRate = input.expectedReturn / 12 / 100;
    const monthlyInflationRate = inflationRate / 12 / 100;

    let balance = lumpSum; // Start with lump sum
    let totalInvested = lumpSum;
    let totalInterest = 0;
    let currentMonthlyInvestment = input.monthlyInvestment;

    // Generate year-wise breakdown
    const yearlyBreakdown: SIPScheduleRow[] = [];

    for (let year = 1; year <= tenureInYears; year++) {
        const startMonth = (year - 1) * 12 + 1;
        const endMonth = Math.min(year * 12, tenureInMonths);
        const monthsInYear = endMonth - startMonth + 1;

        let investedThatYear = 0;
        let interestThatYear = 0;

        // Process each month in this year
        for (let month = startMonth; month <= endMonth; month++) {
            // Add monthly investment for this month
            investedThatYear += currentMonthlyInvestment;
            balance += currentMonthlyInvestment;

            // Calculate interest on current balance
            const monthlyInterest = balance * monthlyRate;
            interestThatYear += monthlyInterest;
            balance += monthlyInterest;
        }

        // Add lump sum interest in first year only
        if (year === 1 && lumpSum > 0) {
            // Calculate compound interest on lump sum for the first year
            const lumpSumFactor = Math.pow(1 + monthlyRate, 12);
            const lumpSumInterest = lumpSum * (lumpSumFactor - 1);
            interestThatYear += lumpSumInterest;
            balance += lumpSumInterest;
        }

        totalInvested += investedThatYear;
        totalInterest += interestThatYear;

        yearlyBreakdown.push({
            year,
            investedThatYear: parseFloat(investedThatYear.toFixed(2)),
            cumulativeInvested: parseFloat(totalInvested.toFixed(2)),
            interestThatYear: parseFloat(interestThatYear.toFixed(2)),
            cumulativeInterest: parseFloat(totalInterest.toFixed(2)),
            yearEndBalance: parseFloat(balance.toFixed(2))
        });

        // Increase monthly investment for next year (except for the last year)
        if (year < tenureInYears) {
            currentMonthlyInvestment *= (1 + input.stepUpPercentage! / 100);
        }
    }

    const maturityAmount = balance;
    const returns = maturityAmount - totalInvested;

    // Calculate inflation-adjusted values if inflation is provided
    let inflationAdjustedAmount = undefined;
    let realReturns = undefined;
    if (inflationRate > 0) {
        inflationAdjustedAmount = maturityAmount / Math.pow(1 + inflationRate / 100, tenureInYears);
        realReturns = inflationAdjustedAmount - totalInvested;
    }

    return {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        returns: parseFloat(returns.toFixed(2)),
        maturityAmount: parseFloat(maturityAmount.toFixed(2)),
        ...(inflationRate > 0 ? {
            inflationAdjustedAmount: parseFloat(inflationAdjustedAmount!.toFixed(2)),
            realReturns: parseFloat(realReturns!.toFixed(2))
        } : {}),
        yearlyBreakdown
    };
}

/**
 * Calculate required monthly SIP for a goal-based approach (reverse calculation)
 * Uses the standard SIP formula in reverse: P = M / [({(1+i)^n – 1}/i) × (1+i)]
 */
export function calculateGoalBasedSIP(input: GoalSIPInput): GoalSIPResult {
    // Validate inputs
    if (input.goalAmount <= 0) {
        throw new Error('Goal amount must be greater than zero');
    }

    if (input.expectedReturn <= 0 || input.expectedReturn > 30) {
        throw new Error('Expected return must be between 0 and 30 percent');
    }

    if (input.tenureValue <= 0) {
        throw new Error('Tenure must be greater than zero');
    }

    const lumpSum = input.lumpSum ?? 0;
    if (lumpSum < 0) {
        throw new Error('Lump sum cannot be negative');
    }

    // Convert tenure to months
    const tenureInMonths = input.tenureUnit === 'years'
        ? input.tenureValue * 12
        : input.tenureValue;

    if (tenureInMonths <= 0) {
        throw new Error('Tenure in months must be greater than zero');
    }

    // Convert annual rate to monthly
    const monthlyRate = input.expectedReturn / 12 / 100;

    // Calculate future value of lump sum
    let futureValueOfLumpSum = lumpSum;
    if (lumpSum > 0) {
        if (monthlyRate === 0) {
            futureValueOfLumpSum = lumpSum;
        } else {
            futureValueOfLumpSum = lumpSum * Math.pow(1 + monthlyRate, tenureInMonths);
        }
    }

    // The remaining amount to be achieved through SIP
    const requiredFutureValueFromSIP = Math.max(0, input.goalAmount - futureValueOfLumpSum);

    // If lump sum already meets or exceeds goal, no SIP needed
    if (requiredFutureValueFromSIP <= 0) {
        const yearlyBreakdown: SIPScheduleRow[] = [];
        let balance = lumpSum;
        let totalInvested = lumpSum;
        let totalInterest = 0;

        for (let year = 1; year <= Math.ceil(tenureInMonths / 12); year++) {
            const startMonth = (year - 1) * 12 + 1;
            const endMonth = Math.min(year * 12, tenureInMonths);
            const monthsInYear = endMonth - startMonth + 1;

            let investedThatYear = 0; // No additional investments needed
            let interestThatYear = 0;

            // Calculate interest on existing balance
            for (let month = startMonth; month <= endMonth; month++) {
                const monthlyInterest = balance * monthlyRate;
                interestThatYear += monthlyInterest;
                balance += monthlyInterest;
            }

            // Add lump sum growth in first year
            if (year === 1 && lumpSum > 0) {
                const lumpSumFactor = Math.pow(1 + monthlyRate, 12);
                const lumpSumInterest = lumpSum * (lumpSumFactor - 1);
                interestThatYear += lumpSumInterest;
                balance += lumpSumInterest;
            }

            totalInterest += interestThatYear;

            yearlyBreakdown.push({
                year,
                investedThatYear: parseFloat(investedThatYear.toFixed(2)),
                cumulativeInvested: parseFloat(totalInvested.toFixed(2)),
                interestThatYear: parseFloat(interestThatYear.toFixed(2)),
                cumulativeInterest: parseFloat(totalInterest.toFixed(2)),
                yearEndBalance: parseFloat(balance.toFixed(2))
            });
        }

        return {
            monthlySIPRequired: 0,
            totalInvested: parseFloat(totalInvested.toFixed(2)),
            returns: parseFloat(totalInterest.toFixed(2)),
            maturityAmount: parseFloat(balance.toFixed(2)),
            yearlyBreakdown
        };
    }

    // Calculate required monthly SIP using the formula
    let monthlySIPRequired = 0;
    if (monthlyRate === 0) {
        monthlySIPRequired = requiredFutureValueFromSIP / tenureInMonths;
    } else {
        // P = M / [({(1+i)^n – 1}/i) × (1+i)]
        const denominator = ((Math.pow(1 + monthlyRate, tenureInMonths) - 1) / monthlyRate) * (1 + monthlyRate);
        monthlySIPRequired = requiredFutureValueFromSIP / denominator;
    }

    // Calculate actual future value with this SIP to verify
    let futureValueOfSIP = 0;
    if (monthlyRate === 0) {
        futureValueOfSIP = monthlySIPRequired * tenureInMonths;
    } else {
        const compoundFactor = Math.pow(1 + monthlyRate, tenureInMonths);
        futureValueOfSIP = monthlySIPRequired *
                          ((Math.pow(1 + monthlyRate, tenureInMonths) - 1) / monthlyRate) *
                          (1 + monthlyRate);
    }

    const maturityAmount = futureValueOfSIP + futureValueOfLumpSum;
    const totalInvested = (monthlySIPRequired * tenureInMonths) + lumpSum;
    const returns = maturityAmount - totalInvested;

    // Generate year-wise breakdown
    const yearlyBreakdown: SIPScheduleRow[] = [];
    let balance = lumpSum;
    let totalInvestedSoFar = lumpSum;
    let totalInterestSoFar = 0;

    for (let year = 1; year <= Math.ceil(tenureInMonths / 12); year++) {
        const startMonth = (year - 1) * 12 + 1;
        const endMonth = Math.min(year * 12, tenureInMonths);
        const monthsInYear = endMonth - startMonth + 1;

        let investedThatYear = monthlySIPRequired * monthsInYear;
        let interestThatYear = 0;

        // Process each month in this year
        for (let month = startMonth; month <= endMonth; month++) {
            // Add monthly investment for this month
            balance += monthlySIPRequired;

            // Calculate interest on current balance
            const monthlyInterest = balance * monthlyRate;
            interestThatYear += monthlyInterest;
            balance += monthlyInterest;
        }

        // Add lump sum growth in first year
        if (year === 1 && lumpSum > 0) {
            const lumpSumFactor = Math.pow(1 + monthlyRate, 12);
            const lumpSumInterest = lumpSum * (lumpSumFactor - 1);
            interestThatYear += lumpSumInterest;
            balance += lumpSumInterest;
        }

        totalInvestedSoFar += investedThatYear;
        totalInterestSoFar += interestThatYear;

        yearlyBreakdown.push({
            year,
            investedThatYear: parseFloat(investedThatYear.toFixed(2)),
            cumulativeInvested: parseFloat(totalInvestedSoFar.toFixed(2)),
            interestThatYear: parseFloat(interestThatYear.toFixed(2)),
            cumulativeInterest: parseFloat(totalInterestSoFar.toFixed(2)),
            yearEndBalance: parseFloat(balance.toFixed(2))
        });
    }

    return {
        monthlySIPRequired: parseFloat(monthlySIPRequired.toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        returns: parseFloat(returns.toFixed(2)),
        maturityAmount: parseFloat(maturityAmount.toFixed(2)),
        yearlyBreakdown
    };
}

/**
 * Main SIP calculation function that routes to the appropriate calculator based on mode
 */
export function calculateSIP(input: SIPInput): SIPCalculationResult {
    switch (input.mode) {
        case 'regular':
            return calculateRegularSIP(input);
        case 'step-up':
            return calculateStepUpSIP(input);
        case 'goal-based':
            // For goal-based mode, we need to convert SIPInput to GoalSIPInput
            const result = calculateGoalBasedSIP({
                goalAmount: input.goalAmount!,
                expectedReturn: input.expectedReturn,
                tenureValue: input.tenureValue,
                tenureUnit: input.tenureUnit,
                lumpSum: input.lumpSum
            });

            // Convert GoalSIPResult to SIPCalculationResult format
            return {
                totalInvested: result.totalInvested,
                returns: result.returns,
                maturityAmount: result.maturityAmount,
                monthlySIPRequired: result.monthlySIPRequired,
                yearlyBreakdown: result.yearlyBreakdown
            };
        default:
            throw new Error(`Invalid SIP mode: ${input.mode}`);
    }
}