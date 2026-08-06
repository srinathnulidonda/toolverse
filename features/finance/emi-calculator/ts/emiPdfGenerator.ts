// features/finance/emi-calculator/ts/emiPdfGenerator.ts

"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logger } from "@/lib/logger";
import type { EMICalculationResult, EMIInput } from "./emiEngine";

export const PDF_BRAND = {
    companyName: "Toolverse",
    productName: "EMI Calculator",
    websiteUrl: "www.toolverse.com",
    logoPath: "/logo-dark.png",
    primary: [20, 92, 60] as [number, number, number],
    primaryDark: [13, 63, 41] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
};

export interface EMIReportData {
    loanAmount: number;
    interestRate: number;
    tenureValue: number;
    tenureUnit: 'years' | 'months';
    loanStartDate: string;
    loanType: string;
    prepaymentType: 'none' | 'one-time' | 'recurring';
    prepaymentAmount?: number;
    prepaymentMonth?: number;
    calculation: EMICalculationResult;
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
    return `EMI-${Date.now().toString(36).toUpperCase()}`;
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
const SECTION_GAP = 10;
const BLOCK_PAD = 8;

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

function drawHeader(
    doc: jsPDF,
    logo: LoadedLogo | null,
    reportId: string,
    generatedStr: string
) {
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
    const metaMaxWidth = Math.max(
        doc.getTextWidth(reportIdLine),
        doc.getTextWidth(generatedLine)
    );

    const gap = 8;
    const leftBound = logoX + logoSize + gap;
    const rightBound = pageWidth - MARGIN_X - metaMaxWidth - gap;
    const halfWidth = Math.min(pageWidth / 2 - leftBound, rightBound - pageWidth / 2);
    const title = "Loan EMI Calculation Report";
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
        pageHeight - 12
    );
    doc.text(
        "This is a system-generated report for informational purposes only and does not constitute financial advice.",
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

export async function generateEMIReportPDF(data: EMIReportData): Promise<jsPDF> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = PAGE.width;
    const reportId = generateReportId();
    const generatedStr = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    const logo = await loadLogo();

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
        { label: "Loan Amount", value: formatINR(data.loanAmount), mono: false },
        { label: "Interest Rate", value: `${data.interestRate}% p.a.`, mono: false },
        { label: "Loan Tenure", value: `${data.tenureValue} ${data.tenureUnit}`, mono: false },
        { label: "Loan Start Date", value: formatDate(data.loanStartDate), mono: true },
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
        doc.text(col.value, x, y + 14.5, { maxWidth: colW - 8 });

        if (i > 0) {
            doc.setDrawColor(...PDF_BRAND.border);
            doc.setLineWidth(0.2);
            doc.line(MARGIN_X + i * colW, y + 4, MARGIN_X + i * colW, y + infoBoxH - 4);
        }
    });

    y += infoBoxH + BLOCK_PAD;

    ensureSpace(14);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("CALCULATION SUMMARY", MARGIN_X, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...PDF_BRAND.primary);
    doc.text("Monthly EMI", MARGIN_X, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...PDF_BRAND.primaryDark);
    doc.text(formatINR(data.calculation.emi), MARGIN_X, y + 15);

    y += 20 + SECTION_GAP;

    ensureSpace(24);
    const cardW = (pageWidth - MARGIN_X * 2 - 6) / 2;

    doc.setFillColor(...PDF_BRAND.primary);
    doc.roundedRect(MARGIN_X, y, cardW, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Total Interest Payable", MARGIN_X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(formatINR(data.calculation.totalInterest), MARGIN_X + 5, y + 15);

    const card2X = MARGIN_X + cardW + 6;
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.setDrawColor(...PDF_BRAND.border);
    doc.roundedRect(card2X, y, cardW, 20, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("Total Amount Payable", card2X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(formatINR(data.calculation.totalPayment), card2X + 5, y + 15);

    y += 20 + SECTION_GAP;

    ensureSpace(14 + 16);
    y = sectionTitle(doc, y, "Loan Summary");

    const summaryRows: [string, string][] = [
        ["Loan Principal", formatINR(data.loanAmount)],
        ["Interest Rate", `${data.interestRate}% per annum`],
        [
            "Loan Tenure",
            data.tenureUnit === "years"
                ? `${data.tenureValue} years (${data.tenureValue * 12} months)`
                : `${data.tenureValue} months`,
        ],
        ["Loan Start Date", formatDate(data.loanStartDate)],
        ["Loan Type", data.loanType.charAt(0).toUpperCase() + data.loanType.slice(1)],
        [
            "Prepayment",
            data.prepaymentType === "none"
                ? "None"
                : data.prepaymentType === "one-time"
                    ? `One-time: ${formatINR(
                        data.prepaymentAmount || 0
                    )} at month ${data.prepaymentMonth || "-"}`
                    : `Recurring: ${formatINR(
                        data.prepaymentAmount || 0
                    )} per month starting from month ${data.prepaymentMonth || "-"}`
        ],
    ];

    autoTable(doc, {
        startY: y,
        margin: { top: CONTENT_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 24 },
        head: [["Particulars", "Details"]],
        body: summaryRows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark, valign: "middle" },
        headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
        columnStyles: {
            0: { cellWidth: 55, fontStyle: "bold" },
            1: { fontStyle: "normal" },
        },
        didParseCell: (hookData) => {
            hookData.cell.styles.halign = "left";
        },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + SECTION_GAP;

    if ((data.calculation.interestSaved ?? 0) > 0 || (data.calculation.tenureReducedMonths ?? 0) > 0) {
        ensureSpace(14 + 16);
        y = sectionTitle(doc, y, "Prepayment Benefits");

        const benefitRows: [string, string][] = [
            [
                "Interest Saved",
                formatINR(Math.max(0, data.calculation.interestSaved ?? 0)),
            ],
            [
                "Tenure Reduced",
                `${Math.max(0, data.calculation.tenureReducedMonths ?? 0)} months`,
            ],
            [
                "Total Interest with Prepayment",
                formatINR(data.calculation.totalInterestWithPrepayment ?? 0),
            ],
            [
                "Total Payment with Prepayment",
                formatINR(data.calculation.totalPaymentWithPrepayment ?? 0),
            ],
        ];

        autoTable(doc, {
            startY: y,
            margin: { top: CONTENT_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 24 },
            head: [["Particulars", "Amount/Value"]],
            body: benefitRows,
            theme: "plain",
            styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark, valign: "middle" },
            headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
            columnStyles: {
                0: { cellWidth: 55, fontStyle: "bold" },
                1: { cellWidth: PAGE.width - MARGIN_X * 2 - 55, fontStyle: "bold" },
            },
            didParseCell: (hookData) => {
                hookData.cell.styles.halign = "left";
            },
            alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
            didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
        });

        y = (doc as any).lastAutoTable.finalY + SECTION_GAP;
    }

    ensureSpace(14 + 16);
    y = sectionTitle(doc, y, "Principal vs Interest Breakdown");

    const breakdownRows: [string, string][] = [
        ["Principal Component", formatINR(data.calculation.principalVsInterestRatio.principal)],
        ["Interest Component", formatINR(data.calculation.principalVsInterestRatio.interest)],
        [
            "Principal : Interest Ratio",
            data.calculation.principalVsInterestRatio.interest > 0
                ? `${(
                    data.calculation.principalVsInterestRatio.principal /
                    data.calculation.principalVsInterestRatio.interest
                ).toFixed(2)} : 1`
                : "N/A (0% interest)",
        ],
    ];

    autoTable(doc, {
        startY: y,
        margin: { top: CONTENT_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 24 },
        head: [["Component", "Amount"]],
        body: breakdownRows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark, valign: "middle" },
        headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
        columnStyles: {
            0: { cellWidth: 55, fontStyle: "bold" },
            1: { fontStyle: "bold" },
        },
        didParseCell: (hookData) => {
            hookData.cell.styles.halign = "left";
        },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + SECTION_GAP;

    ensureSpace(30);
    y = sectionTitle(doc, y, "Amortization Schedule");

    // Column order & headers follow standard banking amortization schedule format:
    // Month | Payment Date | EMI | Principal | Interest | Balance
    // All columns left-aligned (header + data), matching the source spec's markdown table.
    const scheduleData = data.calculation.schedule.map((row) => [
        row.month,
        formatDate(row.paymentDate),
        formatINR(row.emi),
        formatINR(row.principal),
        formatINR(row.interest),
        formatINR(row.balance),
    ]);

    autoTable(doc, {
        startY: y,
        margin: { top: CONTENT_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 24 },
        head: [
            ["Month", "Payment Date", "EMI", "Principal", "Interest", "Balance"],
        ],
        body: scheduleData,
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 3, textColor: PDF_BRAND.dark, valign: "middle", halign: "left" },
        headStyles: {
            fillColor: PDF_BRAND.primary,
            textColor: 255,
            fontStyle: "bold",
            halign: "left",
        },
        columnStyles: {
            0: { fontStyle: "bold" },
            2: { fontStyle: "bold" },
            5: { fontStyle: "bold" },
        },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + SECTION_GAP;

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    return doc;
}

export async function downloadEMIReportPDF(data: EMIReportData): Promise<void> {
    const doc = await generateEMIReportPDF(data);
    const safeName =
        (data.loanType || "Loan").replace(/[^a-zA-Z0-9-_]/g, "_") +
        "-" +
        Date.now().toString(36).toUpperCase();
    doc.save(`EMI-Report-${safeName}.pdf`);
}