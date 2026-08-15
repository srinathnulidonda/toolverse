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
    primary: [20, 92, 60] as [number, number, number],
    primaryDark: [13, 63, 41] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
};

const PAGE = { width: 210, height: 297 };
const MARGIN_X = 14;
const CONTENT_TOP = 38;
const CONTENT_BOTTOM = PAGE.height - 22;
const SECTION_GAP = 8;
const BLOCK_PAD = 8;

/**
 * Format a number as Indian Rupees.
 * Uses "Rs." prefix instead of a currency symbol to avoid
 * unsupported glyphs in the PDF's standard fonts.
 */
function formatCurrency(amount: number, _currencyCode?: keyof typeof CURRENCY_CONFIG): string {
    const value = isFinite(amount) ? amount : 0;
    return `Rs. ${value.toLocaleString("en-IN", {
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

function drawLogoFallback(doc: jsPDF, companyName: string, x: number, y: number, size: number = 14) {
    const initials =
        (companyName || "IN")
            .trim()
            .split(/\s+/)
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "IN";
    doc.setFillColor(...PDF_BRAND.primary);
    doc.roundedRect(x, y, size, size, size * 0.22, size * 0.22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size * 0.5);
    doc.text(initials, x + size / 2, y + size * 0.65, { align: "center" });
}

function drawHeader(
    doc: jsPDF,
    invoice: InvoiceData,
    logo: LoadedLogo | null,
    generatedStr: string
) {
    const pageWidth = PAGE.width;

    // Top accent bar
    doc.setFillColor(...PDF_BRAND.primary);
    doc.rect(0, 0, pageWidth, 2.2, "F");

    const rowCenterY = 16;
    const logoSize = 20;
    const logoX = MARGIN_X;

    // Logo or fallback
    if (logo) {
        const ratio = Math.min(logoSize / logo.width, logoSize / logo.height);
        const w = logo.width * ratio;
        const h = logo.height * ratio;
        doc.addImage(logo.dataUrl, "PNG", logoX, rowCenterY - h / 2, w, h);
    } else {
        drawLogoFallback(doc, invoice.companyName, logoX, rowCenterY - logoSize / 2, logoSize);
    }

    // Right side: invoice number and due date
    const invoiceLine = `Invoice #: ${invoice.invoiceNumber}`;
    const dueLine = `Due: ${formatDate(invoice.dueDate)}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text(invoiceLine, pageWidth - MARGIN_X, rowCenterY - 2.3, { align: "right" });
    doc.text(dueLine, pageWidth - MARGIN_X, rowCenterY + 3.3, { align: "right" });
    const metaMaxWidth = Math.max(doc.getTextWidth(invoiceLine), doc.getTextWidth(dueLine));

    // Centered title (auto-fitted)
    const gap = 8;
    const leftBound = logoX + logoSize + gap;
    const rightBound = pageWidth - MARGIN_X - metaMaxWidth - gap;
    const halfWidth = Math.min(pageWidth / 2 - leftBound, rightBound - pageWidth / 2);
    const title = "TAX INVOICE";
    const titleSize = fitFontSize(doc, title, halfWidth * 2, 16, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleSize);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(title, pageWidth / 2, rowCenterY, { align: "center" });

    // Status badge under title
    const statusConfig = PAYMENT_STATUS_CONFIG[invoice.paymentStatus];
    const badgeText = statusConfig.label.toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const badgeWidth = doc.getTextWidth(badgeText) + 6;
    doc.setFillColor(...statusConfig.bg);
    doc.setDrawColor(...statusConfig.color);
    doc.setLineWidth(0.3);
    doc.roundedRect(pageWidth / 2 - badgeWidth / 2, rowCenterY + 5, badgeWidth, 5, 1, 1, "FD");
    doc.setTextColor(...statusConfig.color);
    doc.text(badgeText, pageWidth / 2, rowCenterY + 8.3, { align: "center" });

    // Divider
    doc.setDrawColor(...PDF_BRAND.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, 32, pageWidth - MARGIN_X, 32);

    // generatedStr is not directly displayed; kept for consistency with EMI pattern
    void generatedStr;
}

function drawFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
    const pageWidth = PAGE.width;
    const pageHeight = PAGE.height;

    doc.setDrawColor(...PDF_BRAND.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, pageHeight - 17, pageWidth - MARGIN_X, pageHeight - 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text(`${PDF_BRAND.companyName} · ${PDF_BRAND.websiteUrl}`, MARGIN_X, pageHeight - 12);
    doc.text(
        "This is a computer-generated invoice and does not require a physical signature.",
        MARGIN_X,
        pageHeight - 7
    );
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - MARGIN_X, pageHeight - 7, {
        align: "right",
    });
}

function sectionTitle(doc: jsPDF, y: number, label: string): number {
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.roundedRect(MARGIN_X, y, PAGE.width - MARGIN_X * 2, BLOCK_PAD, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(label.toUpperCase(), MARGIN_X + 4, y + 5.5);
    return y + BLOCK_PAD + 5;
}

function drawInvoiceMetaBox(doc: jsPDF, invoice: InvoiceData, y: number): number {
    const pageWidth = PAGE.width;
    const infoBoxW = pageWidth - MARGIN_X * 2;
    const infoBoxH = 20;

    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.roundedRect(MARGIN_X, y, infoBoxW, infoBoxH, 2, 2, "F");

    const statusConfig = PAYMENT_STATUS_CONFIG[invoice.paymentStatus];
    const infoCols: { label: string; value: string; color: [number, number, number] }[] = [
        { label: "Invoice Number", value: invoice.invoiceNumber, color: PDF_BRAND.dark },
        { label: "Issue Date", value: formatDate(invoice.invoiceDate), color: PDF_BRAND.dark },
        { label: "Due Date", value: formatDate(invoice.dueDate), color: PDF_BRAND.dark },
        { label: "Payment Status", value: statusConfig.label.toUpperCase(), color: statusConfig.color },
    ];
    const colW = infoBoxW / infoCols.length;

    infoCols.forEach((col, i) => {
        const x = MARGIN_X + i * colW + 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...PDF_BRAND.gray);
        doc.text(col.label.toUpperCase(), x, y + 7.5);

        // All values use Helvetica Bold for consistency (no courier)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...col.color);
        doc.text(col.value, x, y + 14.5, { maxWidth: colW - 8 });

        if (i > 0) {
            doc.setDrawColor(...PDF_BRAND.border);
            doc.setLineWidth(0.2);
            doc.line(MARGIN_X + i * colW, y + 4, MARGIN_X + i * colW, y + infoBoxH - 4);
        }
    });

    return y + infoBoxH + BLOCK_PAD;
}

function drawFromBillToCards(doc: jsPDF, invoice: InvoiceData, y: number): number {
    const pageWidth = PAGE.width;
    const gap = 6;
    const cardW = (pageWidth - MARGIN_X * 2 - gap) / 2;
    const card2X = MARGIN_X + cardW + gap;
    const padX = 5;
    const contentWidth = cardW - padX * 2;

    const fromLines = [
        invoice.companyAddress,
        invoice.companyGSTIN ? `GSTIN: ${invoice.companyGSTIN}` : "",
        invoice.companyEmail,
        invoice.companyPhone,
    ].filter(Boolean);

    const billToLines = [
        invoice.clientAddress,
        invoice.clientGSTIN ? `GSTIN: ${invoice.clientGSTIN}` : "",
        invoice.clientEmail,
        invoice.clientPhone,
    ].filter(Boolean);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const fromWrapped: string[] = fromLines.flatMap((l) => doc.splitTextToSize(l, contentWidth));
    const billToWrapped: string[] = billToLines.flatMap((l) => doc.splitTextToSize(l, contentWidth));
    const maxLines = Math.max(fromWrapped.length, billToWrapped.length, 1);
    const cardH = 18 + maxLines * 4.3 + 4;

    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.setDrawColor(...PDF_BRAND.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_X, y, cardW, cardH, 2, 2, "FD");
    doc.roundedRect(card2X, y, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_BRAND.primary);
    doc.text("FROM", MARGIN_X + padX, y + 6);
    doc.text("BILL TO", card2X + padX, y + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(invoice.companyName || "—", MARGIN_X + padX, y + 12.5, { maxWidth: contentWidth });
    doc.text(invoice.clientName || "—", card2X + padX, y + 12.5, { maxWidth: contentWidth });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text(fromWrapped, MARGIN_X + padX, y + 18);
    doc.text(billToWrapped, card2X + padX, y + 18);

    return y + cardH + SECTION_GAP;
}

export async function generateInvoicePDF(
    invoice: InvoiceData,
    totals: InvoiceTotals
): Promise<jsPDF> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = PAGE.width;
    const generatedStr = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    const logo = await loadLogo(invoice.companyLogo);

    let y = CONTENT_TOP;

    const newPage = () => {
        doc.addPage();
        drawHeader(doc, invoice, logo, generatedStr);
        y = CONTENT_TOP;
    };

    const ensureSpace = (needed: number) => {
        if (y + needed > CONTENT_BOTTOM) newPage();
    };

    drawHeader(doc, invoice, logo, generatedStr);

    // Invoice meta info box
    ensureSpace(28);
    y = drawInvoiceMetaBox(doc, invoice, y);

    // From / Bill To cards
    ensureSpace(45);
    y = drawFromBillToCards(doc, invoice, y);

    // Line items
    ensureSpace(24);
    y = sectionTitle(doc, y, "Line Items");

    // No row number column – only description and financial data
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
        margin: { top: CONTENT_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 24 },
        head: [["Description", "Qty", "Unit Price", "Tax", "Amount"]],
        body: tableData,
        theme: "striped",
        styles: {
            fontSize: 8.5,
            cellPadding: 3,
            textColor: PDF_BRAND.dark,
            valign: "middle",
            halign: "left", // ALL columns left‑aligned, just like the EMI schedule
        },
        headStyles: {
            fillColor: PDF_BRAND.primary,
            textColor: 255,
            fontStyle: "bold",
            halign: "left",
        },
        columnStyles: {
            0: { cellWidth: "auto" },        // Description – flexible width
            1: { cellWidth: 15 },            // Qty
            2: { cellWidth: 28 },            // Unit Price
            3: { cellWidth: 18 },            // Tax
            4: { cellWidth: 32, fontStyle: "bold" }, // Amount – bold
        },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, invoice, logo, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + SECTION_GAP;

    // Amount summary
    ensureSpace(50);
    y = sectionTitle(doc, y, "Amount Summary");

    const summaryRows: [string, string][] = [
        ["Subtotal", formatCurrency(totals.subtotal, invoice.currency)],
    ];
    totals.taxGroups.forEach((group) => {
        summaryRows.push([
            `Tax @ ${group.rate.toFixed(2)}%`,
            formatCurrency(group.taxAmount, invoice.currency),
        ]);
    });
    if (totals.discountAmount > 0) {
        summaryRows.push([
            "Discount",
            `-${formatCurrency(totals.discountAmount, invoice.currency)}`,
        ]);
    }

    const summaryTableWidth = 80;
    autoTable(doc, {
        startY: y,
        margin: {
            top: CONTENT_TOP,
            left: pageWidth - MARGIN_X - summaryTableWidth,
            right: MARGIN_X,
            bottom: 24,
        },
        tableWidth: summaryTableWidth,
        body: summaryRows,
        theme: "plain",
        styles: {
            fontSize: 9,
            cellPadding: 2.5,
            textColor: PDF_BRAND.dark,
            halign: "left", // Left‑align both columns, no more gap between label and value
        },
        columnStyles: {
            0: { fontStyle: "normal", textColor: PDF_BRAND.gray },
            1: { fontStyle: "bold" },
        },
        didDrawPage: () => drawHeader(doc, invoice, logo, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Grand total banner (same style as EMI's highlighted card)
    ensureSpace(24);
    doc.setFillColor(...PDF_BRAND.primary);
    doc.roundedRect(MARGIN_X, y, pageWidth - MARGIN_X * 2, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL AMOUNT DUE", MARGIN_X + 6, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(
        formatCurrency(totals.grandTotal, invoice.currency),
        pageWidth - MARGIN_X - 6,
        y + 13.5,
        { align: "right" }
    );

    y += 20 + SECTION_GAP;

    // Notes
    if (invoice.notes) {
        ensureSpace(20);
        y = sectionTitle(doc, y, "Notes");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...PDF_BRAND.dark);
        const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - MARGIN_X * 2 - 4);
        ensureSpace(notesLines.length * 4.2 + 6);
        doc.text(notesLines, MARGIN_X + 2, y);
        y += notesLines.length * 4.2 + SECTION_GAP;
    }

    // Terms & Conditions
    if (invoice.terms) {
        ensureSpace(20);
        y = sectionTitle(doc, y, "Terms & Conditions");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...PDF_BRAND.dark);
        const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - MARGIN_X * 2 - 4);
        ensureSpace(termsLines.length * 4.2 + 6);
        doc.text(termsLines, MARGIN_X + 2, y);
        y += termsLines.length * 4.2;
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    return doc;
}

export async function downloadInvoicePDF(
    invoice: InvoiceData,
    totals: InvoiceTotals
): Promise<void> {
    const doc = await generateInvoicePDF(invoice, totals);
    const safeName = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
    doc.save(`Invoice-${safeName}.pdf`);
}