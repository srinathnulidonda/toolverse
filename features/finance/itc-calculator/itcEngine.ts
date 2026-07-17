// features/finance/itc-calculator/itcEngine.ts

export interface ITCCalculation {
  totalITC: number;
  eligibleITC: number;
  blockedITC: number;
  reversedITC: number;
  itcUtilized: number;
  itcBalance: number;
}

export interface ITCOptions {
  gstRate: number;
  blockedAmount: number;
  reversedAmount: number;
  utilizedAmount: number;
  period: "monthly" | "quarterly" | "annual";
}

export interface BlockedITCCategory {
  title: string;
  description: string;
  icon: string;
  examples?: string[];
}

export interface GST_Rate {
  rate: number;
  label: string;
  description: string;
  common: boolean;
}

export const GST_RATES: GST_Rate[] = [
  { rate: 0, label: "0% GST", description: "Exempt goods & services", common: true },
  { rate: 0.25, label: "0.25% GST", description: "Precious stones, diamonds", common: false },
  { rate: 3, label: "3% GST", description: "Gold, silver, precious metals", common: false },
  { rate: 5, label: "5% GST", description: "Household necessities, transport", common: true },
  { rate: 12, label: "12% GST", description: "Processed foods, computers", common: true },
  { rate: 18, label: "18% GST", description: "Most services, industrial goods", common: true },
  { rate: 28, label: "28% GST", description: "Luxury items, automobiles", common: true },
];

export const BLOCKED_ITC_CATEGORIES: BlockedITCCategory[] = [
  {
    title: "Motor Vehicles",
    description:
      "ITC blocked on motor vehicles and other conveyances except for specific business use",
    icon: "ti-car",
    examples: ["Cars", "Two-wheelers", "Trucks for general business use"],
  },
  {
    title: "Food & Beverages",
    description:
      "ITC not available on food, beverages, outdoor catering, and accommodation services",
    icon: "ti-chef-hat",
    examples: ["Restaurant bills", "Office refreshments", "Business meals"],
  },
  {
    title: "Personal Use",
    description: "Goods or services for personal consumption or use by any person",
    icon: "ti-user",
    examples: ["Personal mobile bills", "Home items", "Entertainment"],
  },
  {
    title: "Club Memberships",
    description:
      "ITC blocked on membership of a club, health and fitness centre, and similar services",
    icon: "ti-building-community",
    examples: ["Club memberships", "Gym memberships", "Sports clubs"],
  },
  {
    title: "Life Insurance",
    description: "Health insurance and life insurance services for employees",
    icon: "ti-shield-heart",
    examples: ["Employee insurance premiums", "Health insurance", "Life insurance"],
  },
  {
    title: "Travel & Accommodation",
    description:
      "Rent-a-cab, life insurance and health insurance services (except for specific conditions)",
    icon: "ti-plane",
    examples: ["Taxi services", "Hotel accommodation", "Travel insurance"],
  },
];

export const DEFAULT_ITC_OPTIONS: ITCOptions = {
  gstRate: 18,
  blockedAmount: 0,
  reversedAmount: 0,
  utilizedAmount: 0,
  period: "monthly",
};

// Core ITC calculation function
export function calculateITC(
  purchaseAmount: number,
  gstRate: number,
  blockedAmount: number = 0,
  reversedAmount: number = 0,
  utilizedAmount: number = 0
): ITCCalculation {
  // Calculate total ITC from GST component of purchase
  const totalITC = (purchaseAmount * gstRate) / (100 + gstRate);

  // Calculate eligible ITC after blocking and reversals
  const eligibleITC = Math.max(0, totalITC - blockedAmount - reversedAmount);

  // Calculate remaining ITC balance after utilization
  const itcBalance = Math.max(0, eligibleITC - utilizedAmount);

  return {
    totalITC: parseFloat(totalITC.toFixed(2)),
    eligibleITC: parseFloat(eligibleITC.toFixed(2)),
    blockedITC: parseFloat(blockedAmount.toFixed(2)),
    reversedITC: parseFloat(reversedAmount.toFixed(2)),
    itcUtilized: parseFloat(utilizedAmount.toFixed(2)),
    itcBalance: parseFloat(itcBalance.toFixed(2)),
  };
}

// Calculate ITC for multiple items/periods
export function calculateBulkITC(
  items: Array<{
    purchaseAmount: number;
    gstRate: number;
    blockedAmount?: number;
    reversedAmount?: number;
    utilizedAmount?: number;
  }>
): ITCCalculation {
  let totalITC = 0;
  let totalEligible = 0;
  let totalBlocked = 0;
  let totalReversed = 0;
  let totalUtilized = 0;

  items.forEach((item) => {
    const calc = calculateITC(
      item.purchaseAmount,
      item.gstRate,
      item.blockedAmount || 0,
      item.reversedAmount || 0,
      item.utilizedAmount || 0
    );

    totalITC += calc.totalITC;
    totalEligible += calc.eligibleITC;
    totalBlocked += calc.blockedITC;
    totalReversed += calc.reversedITC;
    totalUtilized += calc.itcUtilized;
  });

  const itcBalance = Math.max(0, totalEligible - totalUtilized);

  return {
    totalITC: parseFloat(totalITC.toFixed(2)),
    eligibleITC: parseFloat(totalEligible.toFixed(2)),
    blockedITC: parseFloat(totalBlocked.toFixed(2)),
    reversedITC: parseFloat(totalReversed.toFixed(2)),
    itcUtilized: parseFloat(totalUtilized.toFixed(2)),
    itcBalance: parseFloat(itcBalance.toFixed(2)),
  };
}

// Calculate ITC eligibility percentage
export function calculateITCEligibilityRate(calculation: ITCCalculation): number {
  if (calculation.totalITC === 0) return 0;
  return parseFloat(((calculation.eligibleITC / calculation.totalITC) * 100).toFixed(2));
}

// Calculate ITC utilization percentage
export function calculateITCUtilizationRate(calculation: ITCCalculation): number {
  if (calculation.eligibleITC === 0) return 0;
  return parseFloat(((calculation.itcUtilized / calculation.eligibleITC) * 100).toFixed(2));
}

// Estimate monthly ITC based on period
export function estimateMonthlyITC(
  calculation: ITCCalculation,
  period: ITCOptions["period"]
): ITCCalculation {
  const divisor = period === "annual" ? 12 : period === "quarterly" ? 3 : 1;

  return {
    totalITC: parseFloat((calculation.totalITC / divisor).toFixed(2)),
    eligibleITC: parseFloat((calculation.eligibleITC / divisor).toFixed(2)),
    blockedITC: parseFloat((calculation.blockedITC / divisor).toFixed(2)),
    reversedITC: parseFloat((calculation.reversedITC / divisor).toFixed(2)),
    itcUtilized: parseFloat((calculation.itcUtilized / divisor).toFixed(2)),
    itcBalance: parseFloat((calculation.itcBalance / divisor).toFixed(2)),
  };
}

// Check if purchase qualifies for ITC
export function checkITCEligibility(
  category: string,
  businessUse: boolean = true,
  hasValidInvoice: boolean = true,
  supplierGSTIN: boolean = true
): {
  eligible: boolean;
  reason?: string;
  blockedCategories?: string[];
} {
  const blockedCats = [];

  // Check blocked categories
  const blocked = BLOCKED_ITC_CATEGORIES.find(
    (cat) =>
      cat.title.toLowerCase().includes(category.toLowerCase()) ||
      cat.examples?.some((ex) => ex.toLowerCase().includes(category.toLowerCase()))
  );

  if (blocked) {
    blockedCats.push(blocked.title);
  }

  // Check basic eligibility conditions
  if (!hasValidInvoice) {
    return {
      eligible: false,
      reason: "Valid tax invoice required for ITC claim",
      blockedCategories: blockedCats,
    };
  }

  if (!supplierGSTIN) {
    return {
      eligible: false,
      reason: "Supplier must be registered under GST",
      blockedCategories: blockedCats,
    };
  }

  if (!businessUse) {
    return {
      eligible: false,
      reason: "Goods/services must be used for business purposes",
      blockedCategories: blockedCats,
    };
  }

  if (blocked) {
    return {
      eligible: false,
      reason: `ITC blocked for ${blocked.title}`,
      blockedCategories: blockedCats,
    };
  }

  return { eligible: true, blockedCategories: [] };
}

// Calculate ITC reversal under Rule 42/43
export function calculateRule42Reversal(
  eligibleITC: number,
  exemptSupplies: number,
  totalSupplies: number
): number {
  if (totalSupplies === 0) return 0;

  const exemptRatio = exemptSupplies / totalSupplies;
  const reversalAmount = eligibleITC * exemptRatio;

  return parseFloat(reversalAmount.toFixed(2));
}

// Calculate interest on delayed ITC reversal
export function calculateITCInterest(
  amount: number,
  delayInDays: number,
  interestRate: number = 18 // 18% per annum as per GST law
): number {
  const dailyRate = interestRate / 365 / 100;
  const interest = amount * dailyRate * delayInDays;

  return parseFloat(interest.toFixed(2));
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number for display
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// Export to CSV for ITC records
export function exportITCToCSV(
  records: Array<{
    date: string;
    supplier: string;
    invoiceNo: string;
    amount: number;
    gstRate: number;
    itcClaimed: number;
    status: string;
  }>
): string {
  const headers = [
    "Date",
    "Supplier Name",
    "Invoice Number",
    "Purchase Amount",
    "GST Rate (%)",
    "ITC Claimed",
    "Status",
  ];

  const rows = records.map((record) => [
    record.date,
    record.supplier,
    record.invoiceNo,
    record.amount,
    record.gstRate,
    record.itcClaimed,
    record.status,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

// Sample ITC scenarios for testing
export const ITC_SCENARIOS = {
  manufacturing: {
    name: "Manufacturing Company",
    description: "Raw materials and manufacturing expenses",
    purchases: 500000,
    gstRate: 18,
    blockedAmount: 25000, // Motor vehicles, employee welfare
    reversedAmount: 0,
    utilizedAmount: 70000,
  },

  trading: {
    name: "Trading Business",
    description: "Goods for resale and office expenses",
    purchases: 200000,
    gstRate: 18,
    blockedAmount: 5000, // Office refreshments
    reversedAmount: 0,
    utilizedAmount: 30000,
  },

  services: {
    name: "Service Provider",
    description: "Office rent, utilities, and professional services",
    purchases: 150000,
    gstRate: 18,
    blockedAmount: 15000, // Restaurant bills, club memberships
    reversedAmount: 5000, // Some exempt supplies
    utilizedAmount: 20000,
  },

  ecommerce: {
    name: "E-commerce Platform",
    description: "Warehousing, logistics, and technology expenses",
    purchases: 800000,
    gstRate: 18,
    blockedAmount: 40000, // Employee benefits, food & beverage
    reversedAmount: 10000, // Export sales proportion
    utilizedAmount: 110000,
  },
};
