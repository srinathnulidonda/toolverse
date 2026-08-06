// features/finance/invoice-generator/ts/invoicePdfGenerator.ts

"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logger } from "@/lib/logger";
import type { InvoiceData, InvoiceTotals } from "./invoiceEngine";
import { CURRENCY_CONFIG, PAYMENT_STATUS_CONFIG } from "./invoiceRules.config";

const PDF_BRAND = {
    companyName: "Toolverse",
    websiteUrl: "www.toolverse.com",
    logoPath: "/logo-dark.png",
    primary: [20, 92, 60] as [number, number, number],
    primaryDark: [13, 63, 41] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
};

const PAGE = { width: 210, height: 297 };
const MARGIN_X = 14;
const CONTENT_TOP = 50;

function formatCurrency(amount: number, currencyCode: keyof typeof CURRENCY_CONFIG): string {
    const config = CURRENCY_CONFIG[currencyCode];
    const value = isFinite(amount) ? amount : 0;
    return `${config.symbol}${value.toLocaleString(config.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

interface LoadedLogo {
    dataUrl: string;
    width: number;
    height: number;
}

function loadImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = dataUrl;
    });
}

async function loadLogo(logoDataUrl?: string): Promise<LoadedLogo | null> {
    if (!logoDataUrl) return null;

    try {
        const { width, height } = await loadImageDimensions(logoDataUrl);
        return { dataUrl: logoDataUrl, width, height };
    } catch (error) {
        logger.warn("PDF export: logo failed to load", error);
        return null;
    }
}

function fitFontSize(
    doc: jsPDF,
    text: string,
    maxWidth: number,
    startSize: number,
    minSize: number
): number {
    let size = startSize;
    doc.setFont("helvetica", "bold");
    while (size > minSize) {
        doc.setFontSize(size);
        if (doc.getTextWidth(text) <= maxWidth) break;
        size -= 0.5;
    }
    return size;
}

function drawHeader(
    doc: jsPDF,
    invoice: InvoiceData,
    logo: LoadedLogo | null
) {
    const pageWidth = PAGE.width;
    const y = 15;

    // Logo or wordmark on left
    if (logo) {
        const maxLogoHeight = 18;
        const ratio = Math.min(maxLogoHeight / logo.height, 50 / logo.width);
        const w = logo.width * ratio;
        const h = logo.height * ratio;
        doc.addImage(logo.dataUrl, "PNG", MARGIN_X, y, w, h);
    } else if (invoice.companyName) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...PDF_BRAND.dark);
        doc.text(invoice.companyName, MARGIN_X, y + 6);
    }

    // INVOICE title - centered, auto-fit
    const titleText = "INVOICE";
    const titleMaxWidth = 80;
    const titleSize = fitFontSize(doc, titleText, titleMaxWidth, 24, 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleSize);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(titleText, pageWidth / 2, y + 8, { align: "center" });

    // Invoice details - right aligned
    const rightX = pageWidth - MARGIN_X;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("Invoice Number:", rightX, y + 2, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(invoice.invoiceNumber, rightX, y + 8, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text(`Issue Date: ${formatDate(invoice.invoiceDate)}`, rightX, y + 13, { align: "right" });
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, rightX, y + 18, { align: "right" });

    // Payment status badge
    const statusConfig = PAYMENT_STATUS_CONFIG[invoice.paymentStatus];
    const badgeY = y + 22;
    const badgeText = statusConfig.label.toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const badgeWidth = doc.getTextWidth(badgeText) + 6;
    const badgeX = rightX - badgeWidth;

    doc.setFillColor(...statusConfig.bg);
    doc.setDrawColor(...statusConfig.color);
    doc.setLineWidth(0.3);
    doc.roundedRect(badgeX, badgeY - 3, badgeWidth, 5, 1, 1, "FD");
    doc.setTextColor(...statusConfig.color);
    doc.text(badgeText, badgeX + badgeWidth / 2, badgeY, { align: "center" });
}

function drawFromBillTo(doc: jsPDF, invoice: InvoiceData, y: number): number {
    const pageWidth = PAGE.width;
    const colWidth = (pageWidth - MARGIN_X * 2 - 8) / 2;

    // From column
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("FROM", MARGIN_X, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(invoice.companyName, MARGIN_X, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.gray);
    const fromLines = [
        invoice.companyAddress,
        invoice.companyGSTIN ? `GSTIN: ${invoice.companyGSTIN}` : "",
        invoice.companyEmail,
        invoice.companyPhone,
    ].filter(Boolean);

    let fromY = y + 12;
    fromLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, colWidth - 5);
        doc.text(wrapped, MARGIN_X, fromY);
        fromY += wrapped.length * 4.5;
    });

    // Bill To column
    const billToX = MARGIN_X + colWidth + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("BILL TO", billToX, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(invoice.clientName, billToX, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.gray);
    const billToLines = [
        invoice.clientAddress,
        invoice.clientGSTIN ? `GSTIN: ${invoice.clientGSTIN}` : "",
        invoice.clientEmail,
        invoice.clientPhone,
    ].filter(Boolean);

    let billToY = y + 12;
    billToLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, colWidth - 5);
        doc.text(wrapped, billToX, billToY);
        billToY += wrapped.length * 4.5;
    });

    return Math.max(fromY, billToY) + 8;
}

function drawFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
    const pageWidth = PAGE.width;
    const pageHeight = PAGE.height;

    doc.setDrawColor(...PDF_BRAND.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, pageHeight - 15, pageWidth - MARGIN_X, pageHeight - 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text(`Generated with ${PDF_BRAND.companyName}`, MARGIN_X, pageHeight - 9);

    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - MARGIN_X, pageHeight - 9, { align: "right" });
}

export async function generateInvoicePDF(
    invoice: InvoiceData,
    totals: InvoiceTotals
): Promise<jsPDF> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = PAGE.width;

    const logo = await loadLogo(invoice.companyLogo);

    drawHeader(doc, invoice, logo);

    let y = drawFromBillTo(doc, invoice, 40);

    // Line items table
    const tableData = invoice.lineItems.map((item) => {
        const baseAmount = item.quantity * item.unitPrice;
        const taxAmount = (baseAmount * item.taxRate) / 100;
        const lineTotal = baseAmount + taxAmount;

        return [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.unitPrice, invoice.currency),
            `${item.taxRate.toFixed(2)}%`,
            formatCurrency(lineTotal, invoice.currency),
        ];
    });

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN_X, right: MARGIN_X },
        head: [["Description", "Qty", "Unit Price", "Tax", "Total"]],
        body: tableData,
        theme: "plain",
        styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: PDF_BRAND.dark,
        },
        headStyles: {
            fillColor: PDF_BRAND.primary,
            textColor: 255,
            fontStyle: "bold",
            fontSize: 9,
        },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { halign: "center", cellWidth: 15 },
            2: { halign: "right", cellWidth: 30, fontStyle: "bold" },
            3: { halign: "center", cellWidth: 20 },
            4: { halign: "right", cellWidth: 35, fontStyle: "bold" },
        },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Totals section - right aligned
    const totalsX = pageWidth - MARGIN_X - 60;
    const totalsWidth = 60;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("Subtotal:", totalsX, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(formatCurrency(totals.subtotal, invoice.currency), totalsX + totalsWidth, y, { align: "right" });
    y += 6;

    // Tax groups
    totals.taxGroups.forEach((group) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...PDF_BRAND.gray);
        doc.text(`Tax @ ${group.rate.toFixed(2)}%:`, totalsX, y, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...PDF_BRAND.dark);
        doc.text(formatCurrency(group.taxAmount, invoice.currency), totalsX + totalsWidth, y, { align: "right" });
        y += 6;
    });

    // Discount
    if (totals.discountAmount > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...PDF_BRAND.gray);
        doc.text("Discount:", totalsX, y, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text(`-${formatCurrency(totals.discountAmount, invoice.currency)}`, totalsX + totalsWidth, y, { align: "right" });
        y += 6;
    }

    // Grand total - highlighted
    y += 2;
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(totalsX - 5, y - 5, totalsWidth + 10, 10, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PDF_BRAND.primaryDark);
    doc.text("GRAND TOTAL:", totalsX, y + 2, { align: "right" });
    doc.setFontSize(13);
    doc.text(formatCurrency(totals.grandTotal, invoice.currency), totalsX + totalsWidth, y + 2, { align: "right" });

    y += 15;

    // Notes and Terms
    if (invoice.notes || invoice.terms) {
        if (y > PAGE.height - 60) {
            doc.addPage();
            y = 20;
        }

        if (invoice.notes) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...PDF_BRAND.gray);
            doc.text("NOTES", MARGIN_X, y);
            y += 6;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...PDF_BRAND.dark);
            const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - MARGIN_X * 2);
            doc.text(notesLines, MARGIN_X, y);
            y += notesLines.length * 4 + 8;
        }

        if (invoice.terms) {
            if (y > PAGE.height - 40) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...PDF_BRAND.gray);
            doc.text("TERMS & CONDITIONS", MARGIN_X, y);
            y += 6;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...PDF_BRAND.dark);
            const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - MARGIN_X * 2);
            doc.text(termsLines, MARGIN_X, y);
            y += termsLines.length * 4;
        }
    }

    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    return doc;
}

export async function downloadInvoicePDF(invoice: InvoiceData, totals: InvoiceTotals): Promise<void> {
    const doc = await generateInvoicePDF(invoice, totals);
    const safeName = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
    doc.save(`Invoice-${safeName}.pdf`);
}