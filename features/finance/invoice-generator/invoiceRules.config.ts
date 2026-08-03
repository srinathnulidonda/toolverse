// features/finance/invoice-generator/invoiceRules.config.ts

export const INVOICE_VERSION = "v1.0";

export const CURRENCY_CONFIG = {
    INR: {
        code: "INR",
        symbol: "₹",
        locale: "en-IN",
        name: "Indian Rupee",
    },
    USD: {
        code: "USD",
        symbol: "$",
        locale: "en-US",
        name: "US Dollar",
    },
    EUR: {
        code: "EUR",
        symbol: "€",
        locale: "de-DE",
        name: "Euro",
    },
    GBP: {
        code: "GBP",
        symbol: "£",
        locale: "en-GB",
        name: "British Pound",
    },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;

export const TAX_RATE_PRESETS = [
    { rate: 0, label: "0% (Exempt)" },
    { rate: 5, label: "5% GST" },
    { rate: 12, label: "12% GST" },
    { rate: 18, label: "18% GST" },
    { rate: 28, label: "28% GST" },
    { rate: 10, label: "10% VAT" },
    { rate: 20, label: "20% VAT" },
] as const;

export const PAYMENT_STATUS_CONFIG = {
    DRAFT: {
        label: "Draft",
        color: [107, 114, 128] as [number, number, number],
        bg: [243, 244, 246] as [number, number, number],
    },
    SENT: {
        label: "Sent",
        color: [37, 99, 235] as [number, number, number],
        bg: [219, 234, 254] as [number, number, number],
    },
    PAID: {
        label: "Paid",
        color: [5, 150, 105] as [number, number, number],
        bg: [220, 252, 231] as [number, number, number],
    },
    OVERDUE: {
        label: "Overdue",
        color: [220, 38, 38] as [number, number, number],
        bg: [254, 226, 226] as [number, number, number],
    },
} as const;

export const DEFAULT_TERMS_TEMPLATES = [
    {
        id: "net-30",
        label: "Net 30 Days",
        content: "Payment is due within 30 days of invoice date. Late payments may incur additional charges.",
    },
    {
        id: "net-15",
        label: "Net 15 Days",
        content: "Payment is due within 15 days of invoice date.",
    },
    {
        id: "due-on-receipt",
        label: "Due on Receipt",
        content: "Payment is due immediately upon receipt of this invoice.",
    },
    {
        id: "bank-transfer",
        label: "Bank Transfer Details",
        content: "Bank Name: [Your Bank]\nAccount Number: [Account No.]\nIFSC Code: [IFSC]\nAccount Name: [Your Business Name]",
    },
    {
        id: "standard-terms",
        label: "Standard Terms",
        content: "1. Payment is due as per agreed terms.\n2. Please include invoice number in payment reference.\n3. For any queries, contact us at the details above.\n\nThank you for your business!",
    },
] as const;

export const INVOICE_RULES = {
    maxLineItems: 100,
    minLineItems: 1,
    defaultCurrency: "INR" as CurrencyCode,
    defaultPaymentStatus: "DRAFT" as const,
    invoiceNumberPrefix: "INV-",
    invoiceNumberPadding: 4,
} as const;