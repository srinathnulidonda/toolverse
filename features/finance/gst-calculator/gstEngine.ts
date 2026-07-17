import { logger } from "@/lib/logger";
// features/finance/gst-calculator/gstEngine.ts

export type GSTMode = "exclusive" | "inclusive" | "reverse";
export type GSTType = "intra" | "inter";
export type RoundingMode = "none" | "nearest" | "up" | "down";

export interface GSTRate {
  rate: number;
  label: string;
  description: string;
  common: boolean;
}

export const GST_RATES: GSTRate[] = [
  { rate: 0, label: "0% GST", description: "Exempt goods & services", common: true },
  { rate: 0.25, label: "0.25% GST", description: "Precious stones, diamonds", common: false },
  { rate: 3, label: "3% GST", description: "Gold, silver, precious metals", common: false },
  { rate: 5, label: "5% GST", description: "Household necessities, transport", common: true },
  { rate: 12, label: "12% GST", description: "Processed foods, computers", common: true },
  { rate: 18, label: "18% GST", description: "Most services, industrial goods", common: true },
  { rate: 28, label: "28% GST", description: "Luxury items, automobiles", common: true },
];

export interface GSTCalculation {
  originalAmount: number;
  gstRate: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  cessAmount: number;
  discountAmount: number;
  finalAmount: number;
  roundOffAmount: number;
}

export interface GSTOptions {
  mode: GSTMode;
  gstType: GSTType;
  gstRate: number;
  cessRate: number;
  discountPercent: number;
  discountAmount: number;
  roundingMode: RoundingMode;
  includeRoundOff: boolean;
  quantity: number;
  pricePerUnit: number;
}

export interface BulkGSTItem {
  id: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  pricePerUnit: number;
  gstRate: number;
  cessRate: number;
  discountPercent: number;
  calculation?: GSTCalculation;
}

export interface GSTInvoice {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerGSTIN?: string;
  items: BulkGSTItem[];
  subtotal: number;
  totalGST: number;
  totalCess: number;
  totalDiscount: number;
  grandTotal: number;
  roundOff: number;
}

export interface ITCCalculation {
  eligibleITC: number;
  blockedITC: number;
  reversedITC: number;
  totalITC: number;
  itcUtilized: number;
  itcBalance: number;
}

export interface GSTReconciliation {
  salesAsPerBooks: number;
  salesAsPerGSTR1: number;
  difference: number;
  purchaseAsPerBooks: number;
  purchaseAsPerGSTR2A: number;
  purchaseDifference: number;
  itcClaimed: number;
  itcAvailable: number;
  itcMismatch: number;
}

export const DEFAULT_GST_OPTIONS: GSTOptions = {
  mode: "exclusive",
  gstType: "intra",
  gstRate: 18,
  cessRate: 0,
  discountPercent: 0,
  discountAmount: 0,
  roundingMode: "nearest",
  includeRoundOff: true,
  quantity: 1,
  pricePerUnit: 0,
};

export interface HSNCode {
  code: string;
  description: string;
  gstRate: number;
  cessRate: number;
  category: string;
}

export const HSN_CODES: HSNCode[] = [
  {
    code: "1001",
    description: "Wheat and meslin",
    gstRate: 0,
    cessRate: 0,
    category: "Agriculture",
  },
  { code: "0901", description: "Coffee", gstRate: 5, cessRate: 0, category: "Food & Beverages" },
  {
    code: "7113",
    description: "Jewellery - Gold",
    gstRate: 3,
    cessRate: 0,
    category: "Precious Metals",
  },
  {
    code: "8471",
    description: "Computers & peripherals",
    gstRate: 18,
    cessRate: 0,
    category: "Electronics",
  },
  { code: "8703", description: "Motor cars", gstRate: 28, cessRate: 15, category: "Automobiles" },
  {
    code: "9971",
    description: "Accounting services",
    gstRate: 18,
    cessRate: 0,
    category: "Services",
  },
  { code: "9973", description: "Legal services", gstRate: 18, cessRate: 0, category: "Services" },
  {
    code: "9996",
    description: "Hotel accommodation",
    gstRate: 12,
    cessRate: 0,
    category: "Hospitality",
  },
];

function roundCurrency(value: number): number {
  return parseFloat(value.toFixed(2));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateGST(amount: number, options: GSTOptions): GSTCalculation {
  const { mode, gstType, roundingMode, includeRoundOff, quantity, pricePerUnit } = options;

  const gstRate = clamp(options.gstRate, 0, 100);
  const cessRate = clamp(options.cessRate, 0, 100);
  const discountPercent = clamp(options.discountPercent, 0, 100);

  let baseAmount = amount;
  if (quantity > 0 && pricePerUnit > 0) {
    baseAmount = quantity * pricePerUnit;
  }

  if (!isFinite(baseAmount) || baseAmount < 0) {
    baseAmount = 0;
  }

  let originalAmount = baseAmount;
  let gstAmount = 0;
  let totalBeforeCessAndDiscount = baseAmount;

  if (mode === "exclusive") {
    gstAmount = (baseAmount * gstRate) / 100;
    totalBeforeCessAndDiscount = baseAmount + gstAmount;
  } else if (mode === "inclusive") {
    totalBeforeCessAndDiscount = baseAmount;
    gstAmount = (baseAmount * gstRate) / (100 + gstRate);
    originalAmount = baseAmount - gstAmount;
  } else if (mode === "reverse") {
    let workingAmount = baseAmount;

    let discountAmountTemp = options.discountAmount;
    if (discountPercent > 0 && discountAmountTemp === 0) {
      discountAmountTemp = (workingAmount * discountPercent) / (100 + gstRate + cessRate);
    }
    workingAmount = workingAmount + discountAmountTemp;

    const cessAmountTemp = (workingAmount * cessRate) / (100 + gstRate + cessRate);
    workingAmount = workingAmount - cessAmountTemp;

    gstAmount = (workingAmount * gstRate) / (100 + gstRate);
    originalAmount = workingAmount - gstAmount;
    totalBeforeCessAndDiscount = workingAmount;
  }

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstType === "intra") {
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  } else {
    igst = gstAmount;
  }

  const cessAmount = (originalAmount * cessRate) / 100;

  let discountAmountFinal = options.discountAmount;
  if (discountPercent > 0 && discountAmountFinal === 0) {
    discountAmountFinal = (originalAmount * discountPercent) / 100;
  }

  let finalAmount = totalBeforeCessAndDiscount + cessAmount - discountAmountFinal;

  if (finalAmount < 0) {
    finalAmount = 0;
  }

  let roundOffAmount = 0;
  if (includeRoundOff && isFinite(finalAmount)) {
    const rounded = applyRounding(finalAmount, roundingMode);
    roundOffAmount = rounded - finalAmount;
    finalAmount = rounded;
  }

  return {
    originalAmount: roundCurrency(originalAmount),
    gstRate,
    gstAmount: roundCurrency(gstAmount),
    cgst: roundCurrency(cgst),
    sgst: roundCurrency(sgst),
    igst: roundCurrency(igst),
    totalAmount: roundCurrency(totalBeforeCessAndDiscount),
    cessAmount: roundCurrency(cessAmount),
    discountAmount: roundCurrency(discountAmountFinal),
    finalAmount: roundCurrency(finalAmount),
    roundOffAmount: roundCurrency(roundOffAmount),
  };
}

export function applyRounding(amount: number, mode: RoundingMode): number {
  if (!isFinite(amount)) return amount;

  switch (mode) {
    case "none":
      return amount;
    case "nearest":
      return Math.round(amount);
    case "up":
      return Math.ceil(amount);
    case "down":
      return Math.floor(amount);
    default:
      return amount;
  }
}

export function calculateBulkGST(
  items: BulkGSTItem[],
  globalOptions?: Partial<GSTOptions>,
  invoiceNumber?: string
): GSTInvoice {
  const processedItems = items.map((item) => {
    // Validate item has required data
    if (!item.quantity || item.quantity <= 0 || !item.pricePerUnit || item.pricePerUnit < 0) {
      logger.warn(`Invalid bulk item: ${item.description}. Quantity and price must be positive.`);
    }

    const options: GSTOptions = {
      ...DEFAULT_GST_OPTIONS,
      ...globalOptions,
      gstRate: item.gstRate,
      cessRate: item.cessRate,
      discountPercent: item.discountPercent,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
    };

    const calculation = calculateGST(0, options);

    return {
      ...item,
      calculation,
    };
  });

  const subtotal = processedItems.reduce(
    (sum, item) => sum + (item.calculation?.originalAmount || 0),
    0
  );
  const totalGST = processedItems.reduce(
    (sum, item) => sum + (item.calculation?.gstAmount || 0),
    0
  );
  const totalCess = processedItems.reduce(
    (sum, item) => sum + (item.calculation?.cessAmount || 0),
    0
  );
  const totalDiscount = processedItems.reduce(
    (sum, item) => sum + (item.calculation?.discountAmount || 0),
    0
  );
  const grandTotalBeforeRounding = processedItems.reduce(
    (sum, item) => sum + (item.calculation?.finalAmount || 0),
    0
  );

  const roundingMode = globalOptions?.roundingMode || "nearest";
  const roundedTotal = applyRounding(grandTotalBeforeRounding, roundingMode);
  const roundOff = roundedTotal - grandTotalBeforeRounding;

  return {
    invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
    invoiceDate: new Date(),
    customerName: "",
    items: processedItems,
    subtotal: roundCurrency(subtotal),
    totalGST: roundCurrency(totalGST),
    totalCess: roundCurrency(totalCess),
    totalDiscount: roundCurrency(totalDiscount),
    grandTotal: roundCurrency(roundedTotal),
    roundOff: roundCurrency(roundOff),
  };
}

export function calculateITC(
  purchases: number,
  gstRate: number,
  blockedCredits: number = 0,
  reversedCredits: number = 0,
  utilized: number = 0
): ITCCalculation {
  const totalITC = (purchases * gstRate) / (100 + gstRate);
  const eligibleITC = totalITC - blockedCredits - reversedCredits;
  const itcBalance = eligibleITC - utilized;

  return {
    eligibleITC: roundCurrency(eligibleITC),
    blockedITC: roundCurrency(blockedCredits),
    reversedITC: roundCurrency(reversedCredits),
    totalITC: roundCurrency(totalITC),
    itcUtilized: roundCurrency(utilized),
    itcBalance: roundCurrency(itcBalance),
  };
}

export function calculateCompositionTax(
  turnover: number,
  businessType: "manufacturer" | "trader" | "restaurant"
): number {
  const rates = {
    manufacturer: 1,
    trader: 1,
    restaurant: 5,
  };

  const rate = rates[businessType] || 1;
  return roundCurrency((turnover * rate) / 100);
}

export function reconcileGST(data: {
  salesBooks: number;
  salesGSTR1: number;
  purchaseBooks: number;
  purchaseGSTR2A: number;
  itcClaimed: number;
  itcAvailable: number;
}): GSTReconciliation {
  return {
    salesAsPerBooks: data.salesBooks,
    salesAsPerGSTR1: data.salesGSTR1,
    difference: roundCurrency(data.salesBooks - data.salesGSTR1),
    purchaseAsPerBooks: data.purchaseBooks,
    purchaseAsPerGSTR2A: data.purchaseGSTR2A,
    purchaseDifference: roundCurrency(data.purchaseBooks - data.purchaseGSTR2A),
    itcClaimed: data.itcClaimed,
    itcAvailable: data.itcAvailable,
    itcMismatch: roundCurrency(data.itcClaimed - data.itcAvailable),
  };
}

export function searchHSNCode(query: string): HSNCode[] {
  const q = query.toLowerCase().trim();
  if (!q) return HSN_CODES;

  return HSN_CODES.filter(
    (hsn) =>
      hsn.code.includes(q) ||
      hsn.description.toLowerCase().includes(q) ||
      hsn.category.toLowerCase().includes(q)
  );
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  if (!isFinite(amount)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "0.00";

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function escapeCSVCell(cell: any): string {
  return `"${String(cell).replace(/"/g, '""')}"`;
}

export function exportToCSV(items: BulkGSTItem[]): string {
  const headers = [
    "Description",
    "HSN/SAC",
    "Qty",
    "Rate",
    "Amount",
    "GST Rate",
    "GST Amount",
    "Cess",
    "Discount",
    "Total",
  ];

  const rows = items.map((item) => [
    item.description,
    item.hsnCode || "-",
    item.quantity,
    item.pricePerUnit,
    item.calculation?.originalAmount || 0,
    `${item.gstRate}%`,
    item.calculation?.gstAmount || 0,
    item.calculation?.cessAmount || 0,
    item.calculation?.discountAmount || 0,
    item.calculation?.finalAmount || 0,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCSVCell).join(",")).join("\n");
}

export const SAMPLE_TEMPLATES = {
  ecommerce: {
    name: "E-commerce Order",
    description: "Sample e-commerce purchase",
    items: [
      {
        description: "Wireless Mouse",
        hsnCode: "8471",
        quantity: 2,
        pricePerUnit: 500,
        gstRate: 18,
        cessRate: 0,
        discountPercent: 10,
      },
      {
        description: "USB Cable",
        hsnCode: "8544",
        quantity: 3,
        pricePerUnit: 150,
        gstRate: 18,
        cessRate: 0,
        discountPercent: 5,
      },
      {
        description: "Laptop Bag",
        hsnCode: "4202",
        quantity: 1,
        pricePerUnit: 1200,
        gstRate: 18,
        cessRate: 0,
        discountPercent: 0,
      },
    ],
  },
  restaurant: {
    name: "Restaurant Bill",
    description: "Sample restaurant invoice",
    items: [
      {
        description: "Butter Chicken",
        hsnCode: "9963",
        quantity: 2,
        pricePerUnit: 350,
        gstRate: 5,
        cessRate: 0,
        discountPercent: 0,
      },
      {
        description: "Naan",
        hsnCode: "9963",
        quantity: 4,
        pricePerUnit: 40,
        gstRate: 5,
        cessRate: 0,
        discountPercent: 0,
      },
      {
        description: "Biryani",
        hsnCode: "9963",
        quantity: 1,
        pricePerUnit: 400,
        gstRate: 5,
        cessRate: 0,
        discountPercent: 0,
      },
      {
        description: "Cold Drink",
        hsnCode: "2202",
        quantity: 3,
        pricePerUnit: 60,
        gstRate: 12,
        cessRate: 0,
        discountPercent: 0,
      },
    ],
  },
  services: {
    name: "Professional Services",
    description: "Sample service invoice",
    items: [
      {
        description: "Web Design Services",
        hsnCode: "998314",
        quantity: 1,
        pricePerUnit: 25000,
        gstRate: 18,
        cessRate: 0,
        discountPercent: 0,
      },
      {
        description: "SEO Consultation",
        hsnCode: "998314",
        quantity: 3,
        pricePerUnit: 5000,
        gstRate: 18,
        cessRate: 0,
        discountPercent: 10,
      },
      {
        description: "Hosting (Annual)",
        hsnCode: "998314",
        quantity: 1,
        pricePerUnit: 3000,
        gstRate: 18,
        cessRate: 0,
        discountPercent: 0,
      },
    ],
  },
  automobile: {
    name: "Automobile Purchase",
    description: "Sample car purchase with cess",
    items: [
      {
        description: "Compact SUV",
        hsnCode: "8703",
        quantity: 1,
        pricePerUnit: 800000,
        gstRate: 28,
        cessRate: 15,
        discountPercent: 2,
      },
      {
        description: "Extended Warranty",
        hsnCode: "9971",
        quantity: 1,
        pricePerUnit: 15000,
        gstRate: 18,
        cessRate: 0,
        discountPercent: 0,
      },
    ],
  },
};
