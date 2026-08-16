// features/finance/invoice-generator/ts/sampleData.ts

import type { InvoiceData } from "./invoiceEngine";
import { generateLineItemId } from "./invoiceEngine";

const getTodayString = () => new Date().toISOString().split('T')[0];
const getDateString = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
};

export const SAMPLE_INVOICES = {
    consultingService: {
        invoiceNumber: "INV-2024-001",
        invoiceDate: getTodayString(),
        dueDate: getDateString(30),
        currency: "INR" as const,
        paymentStatus: "SENT" as const,

        companyName: "ABC Consulting Pvt Ltd",
        companyAddress: "123 Business Park, MG Road\nBangalore, Karnataka 560001\nIndia",
        companyGSTIN: "29AABCT1234F1Z5",
        companyEmail: "billing@abcconsulting.com",
        companyPhone: "+91 80 1234 5678",
        companyLogo: "",

        clientName: "XYZ Technologies Ltd",
        clientAddress: "456 Tech Tower, Sector 5\nGurgaon, Haryana 122001\nIndia",
        clientGSTIN: "06AAFCX1234P1ZV",
        clientEmail: "accounts@xyztech.com",
        clientPhone: "+91 124 9876 5432",

        lineItems: [
            {
                id: generateLineItemId(),
                description: "Software Development Services - Month of January 2024",
                quantity: 160,
                unitPrice: 1500,
                taxRate: 18,
            },
            {
                id: generateLineItemId(),
                description: "UI/UX Design Services",
                quantity: 40,
                unitPrice: 2000,
                taxRate: 18,
            },
            {
                id: generateLineItemId(),
                description: "Project Management & Consulting",
                quantity: 1,
                unitPrice: 50000,
                taxRate: 18,
            },
        ],

        discountType: "FLAT" as const,
        discountValue: 10000,

        notes: "Thank you for your business! Payment can be made via bank transfer using the details below.",
        terms: "Payment Terms: Net 30 Days\n\nBank Details:\nBank Name: HDFC Bank\nAccount Number: 1234567890\nIFSC Code: HDFC0001234\nAccount Name: ABC Consulting Pvt Ltd\n\nLate payments will incur a 2% monthly interest charge.",
    },

    productSale: {
        invoiceNumber: "INV-2024-002",
        invoiceDate: getTodayString(),
        dueDate: getDateString(15),
        currency: "USD" as const,
        paymentStatus: "DRAFT" as const,

        companyName: "Global Electronics Inc",
        companyAddress: "789 Export Avenue\nMumbai, Maharashtra 400001\nIndia",
        companyGSTIN: "27AAGFG1234R1Z5",
        companyEmail: "export@globalelectronics.com",
        companyPhone: "+91 22 2345 6789",
        companyLogo: "",

        clientName: "Tech Imports LLC",
        clientAddress: "321 Commerce Street\nNew York, NY 10001\nUSA",
        clientGSTIN: "",
        clientEmail: "purchasing@techimports.com",
        clientPhone: "+1 212 555 0123",

        lineItems: [
            {
                id: generateLineItemId(),
                description: "Wireless Bluetooth Headphones - Model BH-2000",
                quantity: 500,
                unitPrice: 45,
                taxRate: 0,
            },
            {
                id: generateLineItemId(),
                description: "USB-C Fast Chargers - 65W",
                quantity: 1000,
                unitPrice: 12,
                taxRate: 0,
            },
            {
                id: generateLineItemId(),
                description: "Laptop Carrying Cases - Premium",
                quantity: 250,
                unitPrice: 28,
                taxRate: 0,
            },
            {
                id: generateLineItemId(),
                description: "Shipping & Handling",
                quantity: 1,
                unitPrice: 2500,
                taxRate: 0,
            },
        ],

        discountType: "PERCENT" as const,
        discountValue: 5,

        notes: "All products shipped FOB Mumbai. Delivery within 30 days of payment confirmation.",
        terms: "Payment Terms: 50% advance, 50% on delivery\n\nPayment Method: Wire transfer to our international account\nBank: Citibank N.A.\nSWIFT Code: CITIUS33\nAccount Number: US1234567890\n\nAll prices in USD. No returns on international orders.",
    },
} as const;

export type SampleInvoiceType = keyof typeof SAMPLE_INVOICES;

export const SAMPLE_INVOICE_LABELS: Record<SampleInvoiceType, { label: string; desc: string; icon: string }> = {
    consultingService: {
        label: "Consulting Services",
        desc: "Service-based invoice with hourly billing",
        icon: "ti-briefcase",
    },
    productSale: {
        label: "Product Sale (Export)",
        desc: "Product invoice with multiple items",
        icon: "ti-package",
    },
};