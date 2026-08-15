// features/finance/sip-calculator/ts/sipEngine.ts

export interface SIPInput {
  mode: 'regular' | 'step-up' | 'goal-based';
  monthlyInvestment: number;
  expectedReturn: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  lumpSum?: number;
  inflationRate?: number;
  stepUpPercentage?: number;
  goalAmount?: number;
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
  totalInvested: number;
  returns: number;
  maturityAmount: number;
  inflationAdjustedAmount?: number;
  realReturns?: number;
  monthlySIPRequired?: number;
  yearlyBreakdown: SIPScheduleRow[];
}

export interface GoalSIPInput {
  goalAmount: number;
  expectedReturn: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  lumpSum?: number;
  inflationRate?: number;
}

export interface GoalSIPResult {
  monthlySIPRequired: number;
  totalInvested: number;
  returns: number;
  maturityAmount: number;
  inflationAdjustedAmount?: number;
  realReturns?: number;
  yearlyBreakdown: SIPScheduleRow[];
}

function round2(value: number): number {
  return parseFloat(value.toFixed(2));
}

function buildYearlyBreakdown(
  tenureInMonths: number,
  monthlyRate: number,
  lumpSum: number,
  getMonthlyInvestment: (month: number, year: number) => number
): { yearlyBreakdown: SIPScheduleRow[]; maturityAmount: number; totalInvested: number; totalInterest: number } {
  const totalYears = Math.ceil(tenureInMonths / 12);
  const yearlyBreakdown: SIPScheduleRow[] = [];

  let balance = 0;
  let cumulativeInvested = 0;
  let cumulativeInterest = 0;

  for (let year = 1; year <= totalYears; year++) {
    const startMonth = (year - 1) * 12 + 1;
    const endMonth = Math.min(year * 12, tenureInMonths);

    let investedThatYear = 0;
    let interestThatYear = 0;

    if (year === 1 && lumpSum > 0) {
      balance += lumpSum;
      investedThatYear += lumpSum;
    }

    for (let month = startMonth; month <= endMonth; month++) {
      const contribution = getMonthlyInvestment(month, year);
      balance += contribution;
      investedThatYear += contribution;

      const monthlyInterest = balance * monthlyRate;
      interestThatYear += monthlyInterest;
      balance += monthlyInterest;
    }

    cumulativeInvested += investedThatYear;
    cumulativeInterest += interestThatYear;

    yearlyBreakdown.push({
      year,
      investedThatYear: round2(investedThatYear),
      cumulativeInvested: round2(cumulativeInvested),
      interestThatYear: round2(interestThatYear),
      cumulativeInterest: round2(cumulativeInterest),
      yearEndBalance: round2(balance),
    });
  }

  return {
    yearlyBreakdown,
    maturityAmount: balance,
    totalInvested: cumulativeInvested,
    totalInterest: cumulativeInterest,
  };
}

export function calculateRegularSIP(input: SIPInput): SIPCalculationResult {
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

  const tenureInMonths = input.tenureUnit === 'years' ? input.tenureValue * 12 : input.tenureValue;

  if (tenureInMonths <= 0) {
    throw new Error('Tenure in months must be greater than zero');
  }

  const monthlyRate = input.expectedReturn / 12 / 100;
  const preciseYears = tenureInMonths / 12;

  const { yearlyBreakdown, maturityAmount, totalInvested } = buildYearlyBreakdown(
    tenureInMonths,
    monthlyRate,
    lumpSum,
    () => input.monthlyInvestment
  );

  const returns = maturityAmount - totalInvested;

  let inflationAdjustedAmount: number | undefined;
  let realReturns: number | undefined;

  if (inflationRate > 0) {
    inflationAdjustedAmount = maturityAmount / Math.pow(1 + inflationRate / 100, preciseYears);
    realReturns = inflationAdjustedAmount - totalInvested;
  }

  return {
    totalInvested: round2(totalInvested),
    returns: round2(returns),
    maturityAmount: round2(maturityAmount),
    ...(inflationRate > 0
      ? {
          inflationAdjustedAmount: round2(inflationAdjustedAmount as number),
          realReturns: round2(realReturns as number),
        }
      : {}),
    yearlyBreakdown,
  };
}

export function calculateStepUpSIP(input: SIPInput): SIPCalculationResult {
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

  const tenureInMonths = input.tenureUnit === 'years' ? input.tenureValue * 12 : input.tenureValue;

  if (tenureInMonths <= 0) {
    throw new Error('Tenure in months must be greater than zero');
  }

  const monthlyRate = input.expectedReturn / 12 / 100;
  const preciseYears = tenureInMonths / 12;
  const stepUpFactor = 1 + input.stepUpPercentage / 100;

  const { yearlyBreakdown, maturityAmount, totalInvested } = buildYearlyBreakdown(
    tenureInMonths,
    monthlyRate,
    lumpSum,
    (_month, year) => input.monthlyInvestment * Math.pow(stepUpFactor, year - 1)
  );

  const returns = maturityAmount - totalInvested;

  let inflationAdjustedAmount: number | undefined;
  let realReturns: number | undefined;

  if (inflationRate > 0) {
    inflationAdjustedAmount = maturityAmount / Math.pow(1 + inflationRate / 100, preciseYears);
    realReturns = inflationAdjustedAmount - totalInvested;
  }

  return {
    totalInvested: round2(totalInvested),
    returns: round2(returns),
    maturityAmount: round2(maturityAmount),
    ...(inflationRate > 0
      ? {
          inflationAdjustedAmount: round2(inflationAdjustedAmount as number),
          realReturns: round2(realReturns as number),
        }
      : {}),
    yearlyBreakdown,
  };
}

export function calculateGoalBasedSIP(input: GoalSIPInput): GoalSIPResult {
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

  const inflationRate = input.inflationRate ?? 0;
  if (inflationRate < 0 || inflationRate > 20) {
    throw new Error('Inflation rate must be between 0 and 20 percent');
  }

  const tenureInMonths = input.tenureUnit === 'years' ? input.tenureValue * 12 : input.tenureValue;

  if (tenureInMonths <= 0) {
    throw new Error('Tenure in months must be greater than zero');
  }

  const monthlyRate = input.expectedReturn / 12 / 100;
  const preciseYears = tenureInMonths / 12;

  const futureValueOfLumpSum =
    lumpSum > 0
      ? monthlyRate === 0
        ? lumpSum
        : lumpSum * Math.pow(1 + monthlyRate, tenureInMonths)
      : 0;

  const requiredFutureValueFromSIP = Math.max(0, input.goalAmount - futureValueOfLumpSum);

  let monthlySIPRequired = 0;
  if (requiredFutureValueFromSIP > 0) {
    if (monthlyRate === 0) {
      monthlySIPRequired = requiredFutureValueFromSIP / tenureInMonths;
    } else {
      const denominator = ((Math.pow(1 + monthlyRate, tenureInMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      monthlySIPRequired = requiredFutureValueFromSIP / denominator;
    }
  }

  const { yearlyBreakdown, maturityAmount, totalInvested } = buildYearlyBreakdown(
    tenureInMonths,
    monthlyRate,
    lumpSum,
    () => monthlySIPRequired
  );

  const returns = maturityAmount - totalInvested;

  let inflationAdjustedAmount: number | undefined;
  let realReturns: number | undefined;

  if (inflationRate > 0) {
    inflationAdjustedAmount = maturityAmount / Math.pow(1 + inflationRate / 100, preciseYears);
    realReturns = inflationAdjustedAmount - totalInvested;
  }

  return {
    monthlySIPRequired: round2(monthlySIPRequired),
    totalInvested: round2(totalInvested),
    returns: round2(returns),
    maturityAmount: round2(maturityAmount),
    ...(inflationRate > 0
      ? {
          inflationAdjustedAmount: round2(inflationAdjustedAmount as number),
          realReturns: round2(realReturns as number),
        }
      : {}),
    yearlyBreakdown,
  };
}

export function calculateSIP(input: SIPInput): SIPCalculationResult {
  switch (input.mode) {
    case 'regular':
      return calculateRegularSIP(input);
    case 'step-up':
      return calculateStepUpSIP(input);
    case 'goal-based': {
      if (!input.goalAmount || input.goalAmount <= 0) {
        throw new Error('Goal amount must be greater than zero');
      }

      const result = calculateGoalBasedSIP({
        goalAmount: input.goalAmount,
        expectedReturn: input.expectedReturn,
        tenureValue: input.tenureValue,
        tenureUnit: input.tenureUnit,
        lumpSum: input.lumpSum,
        inflationRate: input.inflationRate,
      });

      return {
        totalInvested: result.totalInvested,
        returns: result.returns,
        maturityAmount: result.maturityAmount,
        inflationAdjustedAmount: result.inflationAdjustedAmount,
        realReturns: result.realReturns,
        monthlySIPRequired: result.monthlySIPRequired,
        yearlyBreakdown: result.yearlyBreakdown,
      };
    }
    default:
      throw new Error(`Invalid SIP mode: ${input.mode}`);
  }
}