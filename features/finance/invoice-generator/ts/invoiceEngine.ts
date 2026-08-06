// features/finance/invoice-generator/ts/invoiceEngine.ts

export interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    currency: "INR" | "USD" | "EUR" | "GBP";
    paymentStatus: "DRAFT" | "SENT" | "PAID" | "OVERDUE";

    companyName: string;
    companyAddress: string;
    companyGSTIN: string;
    companyEmail: string;
    companyPhone: string;
    companyLogo?: string;

    clientName: string;
    clientAddress: string;
    clientGSTIN: string;
    clientEmail: string;
    clientPhone: string;

    lineItems: InvoiceLineItem[];

    discountType: "FLAT" | "PERCENT";
    discountValue: number;

    notes: string;
    terms: string;
}

export interface TaxGroup {
    rate: number;
    taxableAmount: number;
    taxAmount: number;
}

export interface InvoiceTotals {
    subtotal: number;
    taxGroups: TaxGroup[];
    totalTax: number;
    discountAmount: number;
    grandTotal: number;
}

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

function safeDiv(numerator: number, denominator: number, fallback: number = 0): number {
    if (!isFinite(numerator) || !isFinite(denominator)) return fallback;
    if (denominator === 0) return fallback;
    const result = numerator / denominator;
    return isFinite(result) ? result : fallback;
}

export function calculateLineTotal(item: InvoiceLineItem): number {
    if (item.quantity < 0 || item.unitPrice < 0 || item.taxRate < 0) return 0;

    const baseAmount = item.quantity * item.unitPrice;
    const taxAmount = (baseAmount * item.taxRate) / 100;
    const total = baseAmount + taxAmount;

    return parseFloat(total.toFixed(2));
}

export function calculateInvoiceTotals(
    lineItems: InvoiceLineItem[],
    discountType: "FLAT" | "PERCENT",
    discountValue: number
): InvoiceTotals {
    // Guard against invalid discount
    if (discountValue < 0) discountValue = 0;
    if (discountType === "PERCENT" && discountValue > 100) discountValue = 100;

    // Calculate subtotal (base amounts only, before tax)
    const subtotal = lineItems.reduce((sum, item) => {
        if (item.quantity < 0 || item.unitPrice < 0) return sum;
        return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Group by tax rate
    const taxGroupMap = new Map<number, { taxableAmount: number; taxAmount: number }>();

    lineItems.forEach((item) => {
        if (item.quantity < 0 || item.unitPrice < 0 || item.taxRate < 0) return;

        const baseAmount = item.quantity * item.unitPrice;
        const taxAmount = (baseAmount * item.taxRate) / 100;

        const existing = taxGroupMap.get(item.taxRate) || { taxableAmount: 0, taxAmount: 0 };
        existing.taxableAmount += baseAmount;
        existing.taxAmount += taxAmount;
        taxGroupMap.set(item.taxRate, existing);
    });

    // Convert to array and sort by rate
    const taxGroups: TaxGroup[] = Array.from(taxGroupMap.entries())
        .map(([rate, data]) => ({
            rate,
            taxableAmount: parseFloat(data.taxableAmount.toFixed(2)),
            taxAmount: parseFloat(data.taxAmount.toFixed(2)),
        }))
        .sort((a, b) => a.rate - b.rate);

    const totalTax = taxGroups.reduce((sum, group) => sum + group.taxAmount, 0);

    // Calculate discount
    let discountAmount = 0;
    if (discountType === "FLAT") {
        discountAmount = Math.min(discountValue, subtotal + totalTax);
    } else {
        discountAmount = ((subtotal + totalTax) * discountValue) / 100;
    }

    const grandTotal = subtotal + totalTax - discountAmount;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxGroups,
        totalTax: parseFloat(totalTax.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        grandTotal: parseFloat(Math.max(0, grandTotal).toFixed(2)),
    };
}

export function generateInvoiceNumber(lastNumber: string): string {
    // Extract numeric part from pattern like "INV-0001" or "0001"
    const match = lastNumber.match(/(\d+)$/);
    if (!match) {
        return "INV-0001";
    }

    const numericPart = parseInt(match[1], 10);
    const nextNumber = numericPart + 1;
    const paddedNumber = nextNumber.toString().padStart(4, "0");

    // Preserve prefix if it exists
    const prefix = lastNumber.substring(0, lastNumber.length - match[1].length);
    return prefix ? `${prefix}${paddedNumber}` : `INV-${paddedNumber}`;
}

export function generateLineItemId(): string {
    return `line_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function createEmptyLineItem(): InvoiceLineItem {
    return {
        id: generateLineItemId(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
    };
}

export function isValidLineItem(item: InvoiceLineItem): boolean {
    return (
        item.description.trim() !== "" &&
        item.quantity > 0 &&
        item.unitPrice >= 0 &&
        item.taxRate >= 0 &&
        item.taxRate <= 100
    );
}