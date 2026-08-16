// features/finance/itc-calculator/itcPdfGenerator.ts

"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logger } from "@/lib/logger";
import type { ITCCalculationResult, ITCStatus } from "./itcEngine";

export const PDF_BRAND = {
    companyName: "Toolverse",
    productName: "ITC Calculator",
    websiteUrl: "www.toolverse.com",
    logoPath: "/logo-dark.png",
    primary: [20, 92, 60] as [number, number, number],
    primaryDark: [13, 63, 41] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
};

const STATUS_PDF_CONFIG: Record<
    ITCStatus,
    { label: string; color: [number, number, number]; bg: [number, number, number] }
> = {
    ELIGIBLE: { label: "Fully Eligible", color: [5, 150, 105], bg: [220, 252, 231] },
    BLOCKED_17_5: { label: "Blocked Credit — Section 17(5)", color: [220, 38, 38], bg: [254, 226, 226] },
    TIME_BARRED: { label: "Time Barred — Section 16(4)", color: [217, 119, 6], bg: [254, 243, 199] },
    REVERSED_42_43: { label: "Reversed — Rule 42/43", color: [37, 99, 235], bg: [219, 234, 254] },
    REVERSED_37: { label: "Reversed — Rule 37", color: [124, 58, 237], bg: [237, 233, 254] },
    PARTIALLY_AVAILABLE: { label: "Partially Available", color: [234, 88, 12], bg: [255, 237, 213] },
};

export interface ITCReportData {
    invoiceNumber: string;
    invoiceDate: string;
    claimDate: string;
    gstinSupplier: string;
    totalInvoiceValue: number;
    gstPaid: number;
    itcClaimedInBooks: number;
    itcAvailableInGSTR2B: number;
    isCapitalGood: boolean;
    checkTimeLimit: boolean;
    usageTaxable: number;
    usageExempt: number;
    usageNonBusiness: number;
    daysPastDue: number;
    amountPaid: number;
    totalPayable: number;
    blockedCategory?: string;
    calculation: ITCCalculationResult;
}

function formatINR(amount: number): string {
    const value = isFinite(amount) ? amount : 0;
    return `Rs. ${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(value: string): string {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function generateReportId(): string {
    return `ITC-${Date.now().toString(36).toUpperCase()}`;
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

async function loadLogo(): Promise<LoadedLogo | null> {
    try {
        const res = await fetch(PDF_BRAND.logoPath);
        if (!res.ok) return null;
        const blob = await res.blob();
        const dataUrl: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        const { width, height } = await loadImageDimensions(dataUrl);
        return { dataUrl, width, height };
    } catch (error) {
        logger.warn("PDF export: logo not loaded, using fallback monogram", error);
        return null;
    }
}

const PAGE = { width: 210, height: 297 };
const MARGIN_X = 14;
const CONTENT_TOP = 36;
const CONTENT_BOTTOM = PAGE.height - 22;

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

function drawLogoFallback(doc: jsPDF, x: number, y: number, size: number = 14) {
    const initials = "TV";
    doc.setFillColor(...PDF_BRAND.primary);
    doc.roundedRect(x, y, size, size, size * 0.22, size * 0.22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size * 0.55);
    doc.text(initials, x + size / 2, y + size * 0.68, { align: "center" });
}

function drawHeader(doc: jsPDF, logo: LoadedLogo | null, reportId: string, generatedStr: string) {
    const pageWidth = PAGE.width;

    doc.setFillColor(...PDF_BRAND.primary);
    doc.rect(0, 0, pageWidth, 2.2, "F");

    const rowCenterY = 18;
    const logoSize = 22;
    const logoX = MARGIN_X;

    if (logo) {
        const ratio = Math.min(logoSize / logo.width, logoSize / logo.height);
        const w = logo.width * ratio;
        const h = logo.height * ratio;
        doc.addImage(logo.dataUrl, "PNG", logoX, rowCenterY - h / 2, w, h);
    } else {
        drawLogoFallback(doc, logoX, rowCenterY - logoSize / 2, logoSize);
    }

    const reportIdLine = `Report ID: ${reportId}`;
    const generatedLine = `Generated: ${generatedStr}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text(reportIdLine, pageWidth - MARGIN_X, rowCenterY - 2.3, { align: "right" });
    doc.text(generatedLine, pageWidth - MARGIN_X, rowCenterY + 3.3, { align: "right" });
    const metaMaxWidth = Math.max(doc.getTextWidth(reportIdLine), doc.getTextWidth(generatedLine));

    const gap = 8;
    const leftBound = logoX + logoSize + gap;
    const rightBound = pageWidth - MARGIN_X - metaMaxWidth - gap;
    const halfWidth = Math.min(pageWidth / 2 - leftBound, rightBound - pageWidth / 2);
    const title = "Input Tax Credit (ITC) Eligibility Report";
    const titleSize = fitFontSize(doc, title, halfWidth * 2, 14, 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleSize);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(title, pageWidth / 2, rowCenterY + 2, { align: "center" });

    doc.setDrawColor(...PDF_BRAND.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, 30, pageWidth - MARGIN_X, 30);
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
    doc.text(
        `${PDF_BRAND.companyName}  ·  ${PDF_BRAND.websiteUrl}`,
        MARGIN_X,
        pageHeight - 11
    );
    doc.text(
        "This is a system-generated report for internal reference only and does not constitute tax or legal advice.",
        MARGIN_X,
        pageHeight - 7
    );
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - MARGIN_X, pageHeight - 9, { align: "right" });
}

function sectionTitle(doc: jsPDF, y: number, label: string): number {
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.roundedRect(MARGIN_X, y, PAGE.width - MARGIN_X * 2, 8, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(label.toUpperCase(), MARGIN_X + 4, y + 5.5);
    return y + 8 + 5;
}

export async function generateITCReportPDF(data: ITCReportData): Promise<jsPDF> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = PAGE.width;
    const reportId = generateReportId();
    const generatedStr = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const logo = await loadLogo();
    const statusCfg = STATUS_PDF_CONFIG[data.calculation.status];

    let y = CONTENT_TOP;

    const newPage = () => {
        doc.addPage();
        drawHeader(doc, logo, reportId, generatedStr);
        y = CONTENT_TOP;
    };

    const ensureSpace = (needed: number) => {
        if (y + needed > CONTENT_BOTTOM) newPage();
    };

    drawHeader(doc, logo, reportId, generatedStr);

    ensureSpace(30);
    const infoBoxW = pageWidth - MARGIN_X * 2;
    const infoBoxH = 20;
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.roundedRect(MARGIN_X, y, infoBoxW, infoBoxH, 2, 2, "F");

    const infoCols = [
        { label: "Invoice Number", value: data.invoiceNumber || "—", mono: false },
        { label: "Invoice Date", value: formatDate(data.invoiceDate), mono: false },
        { label: "Claim Date", value: formatDate(data.claimDate), mono: false },
        { label: "Supplier GSTIN", value: data.gstinSupplier || "—", mono: true },
    ];
    const colW = infoBoxW / infoCols.length;

    infoCols.forEach((col, i) => {
        const x = MARGIN_X + i * colW + 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...PDF_BRAND.gray);
        doc.text(col.label.toUpperCase(), x, y + 7.5);
        doc.setFont(col.mono ? "courier" : "helvetica", "bold");
        doc.setFontSize(col.mono ? 8.5 : 9.5);
        doc.setTextColor(...PDF_BRAND.dark);
        doc.text(col.value, x, y + 14.5);

        if (i > 0) {
            doc.setDrawColor(...PDF_BRAND.border);
            doc.setLineWidth(0.2);
            doc.line(MARGIN_X + i * colW, y + 4, MARGIN_X + i * colW, y + infoBoxH - 4);
        }
    });

    y += infoBoxH + 8;

    ensureSpace(14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("CALCULATION STATUS", MARGIN_X, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...statusCfg.color);
    doc.text(statusCfg.label, MARGIN_X, y + 7);

    y += 7 + 10;

    ensureSpace(24);
    const cardW = (pageWidth - MARGIN_X * 2 - 6) / 2;

    doc.setFillColor(...PDF_BRAND.primary);
    doc.roundedRect(MARGIN_X, y, cardW, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("NET ELIGIBLE ITC", MARGIN_X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(formatINR(data.calculation.eligibleITC), MARGIN_X + 5, y + 15);

    const card2X = MARGIN_X + cardW + 6;
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.setDrawColor(...PDF_BRAND.border);
    doc.roundedRect(card2X, y, cardW, 20, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("INELIGIBLE / REVERSED ITC", card2X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(formatINR(data.calculation.ineligibleITC), card2X + 5, y + 15);

    y += 20 + 10;

    ensureSpace(14);
    y = sectionTitle(doc, y, "Financial Breakdown");

    const breakdownRows: [string, string][] = [
        ["ITC as per Books", formatINR(data.calculation.breakdown.booksITC)],
        ["ITC as per GSTR-2B", formatINR(data.calculation.breakdown.gstr2bITC)],
        ["Matched ITC (Minimum)", formatINR(data.calculation.breakdown.matchedITC)],
    ];
    if (data.calculation.breakdown.blockedAmount > 0)
        breakdownRows.push([
            "Less: Blocked Credit (Sec 17(5))",
            `- ${formatINR(data.calculation.breakdown.blockedAmount)}`,
        ]);
    if (data.calculation.breakdown.timeBarredAmount > 0)
        breakdownRows.push([
            "Less: Time-Barred (Sec 16(4))",
            `- ${formatINR(data.calculation.breakdown.timeBarredAmount)}`,
        ]);
    if (data.calculation.breakdown.reversed42_43 > 0)
        breakdownRows.push(["Less: Reversed (Rule 42/43)", `- ${formatINR(data.calculation.breakdown.reversed42_43)}`]);
    if (data.calculation.breakdown.reversed37 > 0)
        breakdownRows.push(["Less: Reversed (Rule 37)", `- ${formatINR(data.calculation.breakdown.reversed37)}`]);
    breakdownRows.push(["Net Eligible ITC", formatINR(data.calculation.eligibleITC)]);

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN_X, right: MARGIN_X },
        head: [["Particulars", "Amount"]],
        body: breakdownRows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark },
        headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didParseCell: (hookData: any) => {
            if (hookData.row.index === breakdownRows.length - 1 && hookData.section === "body") {
                hookData.cell.styles.fillColor = [220, 252, 231];
                hookData.cell.styles.textColor = PDF_BRAND.primaryDark;
                hookData.cell.styles.fontStyle = "bold";
            }
        },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    ensureSpace(14);
    y = sectionTitle(doc, y, "Invoice & Payment Details");

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN_X, right: MARGIN_X },
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark },
        body: [
            [
                "Total Invoice Value",
                formatINR(data.totalInvoiceValue),
                "Asset Type",
                data.isCapitalGood ? "Capital Good" : "Regular",
            ],
            ["GST Paid", formatINR(data.gstPaid), "Time Limit Check", data.checkTimeLimit ? "Enabled" : "Disabled"],
            ["Amount Paid to Supplier", formatINR(data.amountPaid), "Total Payable", formatINR(data.totalPayable)],
            [
                "Days Past Due",
                `${data.daysPastDue} days${data.daysPastDue > 180 ? "  (exceeds 180-day limit)" : ""}`,
                "Blocked Category",
                data.blockedCategory ? data.blockedCategory : "None",
            ],
        ],
        columnStyles: {
            0: { fontStyle: "bold", textColor: PDF_BRAND.gray, cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { fontStyle: "bold", textColor: PDF_BRAND.gray, cellWidth: 45 },
            3: { cellWidth: 45 },
        },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    ensureSpace(30);
    y = sectionTitle(doc, y, "Usage Distribution (Rule 42/43 Basis)");

    const usageBars: { label: string; value: number; color: [number, number, number] }[] = [
        { label: "Taxable Supply", value: data.usageTaxable, color: PDF_BRAND.primary },
        { label: "Exempt Supply", value: data.usageExempt, color: [217, 119, 6] },
        { label: "Non-Business Use", value: data.usageNonBusiness, color: [220, 38, 38] },
    ];

    const barMaxWidth = pageWidth - MARGIN_X * 2;
    usageBars.forEach((bar) => {
        ensureSpace(13);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...PDF_BRAND.dark);
        doc.text(bar.label, MARGIN_X, y + 4);
        doc.setFont("helvetica", "bold");
        doc.text(`${bar.value}%`, pageWidth - MARGIN_X, y + 4, { align: "right" });

        doc.setFillColor(...PDF_BRAND.lightGray);
        doc.roundedRect(MARGIN_X, y + 6, barMaxWidth, 3, 1, 1, "F");
        const fillW = Math.max(0, Math.min(barMaxWidth, (barMaxWidth * bar.value) / 100));
        if (fillW > 0) {
            doc.setFillColor(...bar.color);
            doc.roundedRect(MARGIN_X, y + 6, fillW, 3, 1, 1, "F");
        }
        y += 13;
    });

    y += 4;

    if (data.calculation.explanation) {
        ensureSpace(22);
        y = sectionTitle(doc, y, "Explanation");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...PDF_BRAND.dark);
        const lines = doc.splitTextToSize(data.calculation.explanation, pageWidth - MARGIN_X * 2 - 4);
        doc.text(lines, MARGIN_X, y);
        y += lines.length * 4.6 + 8;
    }

    if (data.calculation.warnings.length > 0) {
        ensureSpace(16);
        y = sectionTitle(doc, y, "Warnings");
        data.calculation.warnings.forEach((warning) => {
            const lines = doc.splitTextToSize(warning, pageWidth - MARGIN_X * 2 - 16);
            const boxH = lines.length * 4.6 + 5;
            ensureSpace(boxH + 4);
            doc.setFillColor(254, 243, 199);
            doc.roundedRect(MARGIN_X, y, pageWidth - MARGIN_X * 2, boxH, 1.5, 1.5, "F");
            doc.setFillColor(217, 119, 6);
            doc.circle(MARGIN_X + 5, y + 5.3, 1.1, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(146, 64, 14);
            doc.text(lines, MARGIN_X + 9, y + 5.5);
            y += boxH + 4;
        });
        y += 4;
    }

    if (data.calculation.recommendations.length > 0) {
        ensureSpace(16);
        y = sectionTitle(doc, y, "Recommendations");
        data.calculation.recommendations.forEach((rec) => {
            const lines = doc.splitTextToSize(rec, pageWidth - MARGIN_X * 2 - 16);
            const boxH = lines.length * 4.6 + 5;
            ensureSpace(boxH + 4);
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(MARGIN_X, y, pageWidth - MARGIN_X * 2, boxH, 1.5, 1.5, "F");
            doc.setFillColor(...PDF_BRAND.primary);
            doc.circle(MARGIN_X + 5, y + 5.3, 1.1, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(...PDF_BRAND.primaryDark);
            doc.text(lines, MARGIN_X + 9, y + 5.5);
            y += boxH + 4;
        });
    }

    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    return doc;
}

export async function downloadITCReportPDF(data: ITCReportData): Promise<void> {
    const doc = await generateITCReportPDF(data);
    const safeName = (data.invoiceNumber || "Draft").replace(/[^a-zA-Z0-9-_]/g, "_");
    doc.save(`ITC-Report-${safeName}.pdf`);
}