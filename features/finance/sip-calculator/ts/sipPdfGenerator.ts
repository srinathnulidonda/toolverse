// features/finance/sip-calculator/ts/sipPdfGenerator.ts

"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logger } from "@/lib/logger";
import type { SIPCalculationResult, SIPInput } from "./sipEngine";

export const PDF_BRAND = {
    companyName: "Toolverse",
    productName: "SIP Calculator",
    websiteUrl: "www.toolverse.com",
    logoPath: "/logo-dark.png",
    primary: [5, 150, 105] as [number, number, number],
    primaryDark: [2, 102, 71] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
};

export interface SIPReportData {
    mode: "regular" | "step-up" | "goal-based";
    monthlyInvestment: number;
    expectedReturn: number;
    tenureValue: number;
    tenureUnit: 'years' | 'months';
    lumpSum?: number;
    inflationRate?: number;
    stepUpPercentage?: number;
    goalAmount?: number;
    calculation: SIPCalculationResult;
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
    return `SIP-${Date.now().toString(36).toUpperCase()}`;
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
    const title = "SIP Investment Report";
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

export async function generateSIPReportPDF(data: SIPReportData): Promise<jsPDF> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = PAGE.width;
    const reportId = generateReportId();
    const generatedStr = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    const logo = await loadLogo();
    const startDateStr = new Date().toISOString().split("T")[0];
    const isGoalBased = data.mode === "goal-based";
    const tenureMonths = data.tenureUnit === "years" ? data.tenureValue * 12 : data.tenureValue;

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
        { label: "Monthly SIP", value: formatINR(data.monthlyInvestment), mono: false },
        { label: "Expected Return", value: `${data.expectedReturn}% p.a.`, mono: false },
        { label: "Investment Tenure", value: `${data.tenureValue} ${data.tenureUnit}`, mono: false },
        { label: "Start Date", value: formatDate(startDateStr), mono: true },
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

    const heroLabel = isGoalBased ? "Required Monthly SIP" : "Maturity Amount";
    const heroValue = isGoalBased
        ? (data.calculation.monthlySIPRequired || 0)
        : data.calculation.maturityAmount;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...PDF_BRAND.primary);
    doc.text(heroLabel, MARGIN_X, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...PDF_BRAND.primaryDark);
    doc.text(formatINR(heroValue), MARGIN_X, y + 15);

    y += 20 + SECTION_GAP;

    ensureSpace(24);
    const cardW = (pageWidth - MARGIN_X * 2 - 6) / 2;

    doc.setFillColor(...PDF_BRAND.primary);
    doc.roundedRect(MARGIN_X, y, cardW, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Estimated Returns", MARGIN_X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(formatINR(data.calculation.returns), MARGIN_X + 5, y + 15);

    const card2X = MARGIN_X + cardW + 6;
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.setDrawColor(...PDF_BRAND.border);
    doc.roundedRect(card2X, y, cardW, 20, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("Total Invested", card2X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...PDF_BRAND.primaryDark);
    doc.text(formatINR(data.calculation.totalInvested), card2X + 5, y + 15);

    y += 20 + SECTION_GAP;

    ensureSpace(14 + 16);
    y = sectionTitle(doc, y, "Investment Summary");

    const summaryRows: [string, string][] = [
        ["Monthly SIP Amount", formatINR(data.monthlyInvestment)],
        ["Expected Annual Return", `${data.expectedReturn}% p.a.`],
        [
            "Investment Tenure",
            data.tenureUnit === "years"
                ? `${data.tenureValue} years (${data.tenureValue * 12} months)`
                : `${data.tenureValue} months`,
        ],
        ["Start Date", formatDate(startDateStr)],
        [
            "SIP Type",
            data.mode === "regular"
                ? "Regular SIP"
                : data.mode === "step-up"
                    ? "Step-Up SIP"
                    : "Goal-Based SIP",
        ],
        ["Initial Lump Sum", data.lumpSum && data.lumpSum > 0 ? formatINR(data.lumpSum) : "None"],
        ["Inflation Rate", data.inflationRate && data.inflationRate > 0 ? `${data.inflationRate}%` : "None"],
        ...(data.mode === "step-up"
            ? ([["Annual Step-Up", `${data.stepUpPercentage}%`]] as [string, string][])
            : []),
        ...(isGoalBased
            ? ([
                ["Target Amount", formatINR(data.goalAmount || 0)],
                ["Required Monthly SIP", formatINR(data.calculation.monthlySIPRequired || 0)],
            ] as [string, string][])
            : []),
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

    if (isGoalBased) {
        ensureSpace(14 + 16);
        y = sectionTitle(doc, y, "Goal-Based SIP Details");

        const totalInvestmentNeeded =
            (data.calculation.monthlySIPRequired || 0) * tenureMonths + (data.lumpSum || 0);

        const goalRows: [string, string][] = [
            ["Target Amount", formatINR(data.goalAmount || 0)],
            ["Present Value of Lump Sum", formatINR(data.lumpSum || 0)],
            ["Required Monthly SIP", formatINR(data.calculation.monthlySIPRequired || 0)],
            ["Total Investment Needed", formatINR(totalInvestmentNeeded)],
            ["Expected Returns", formatINR(data.calculation.returns)],
            ["Total Future Value", formatINR(data.calculation.maturityAmount)],
        ];

        autoTable(doc, {
            startY: y,
            margin: { top: CONTENT_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 24 },
            head: [["Particulars", "Amount/Value"]],
            body: goalRows,
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
    y = sectionTitle(doc, y, "Investment vs Returns Breakdown");

    const breakdownRows: [string, string][] = [
        ["Total Invested (Principal)", formatINR(data.calculation.totalInvested)],
        ["Returns Earned", formatINR(data.calculation.returns)],
        ["Future Value (Maturity)", formatINR(data.calculation.maturityAmount)],
    ];

    if (data.inflationRate && data.inflationRate > 0 && data.calculation.inflationAdjustedAmount !== undefined) {
        breakdownRows.push(
            ["Inflation-Adjusted Value", formatINR(data.calculation.inflationAdjustedAmount)],
            ["Real Returns (After Inflation)", formatINR(data.calculation.realReturns || 0)]
        );
    }

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
    y = sectionTitle(doc, y, "Year-wise Growth Schedule");

    // Column order & headers follow standard investment growth schedule format:
    // Year | Invested That Year | Cumulative Invested | Interest That Year | Cumulative Interest | Year-End Balance
    // All columns left-aligned (header + data), matching the EMI amortization table format.
    const yearlyData = data.calculation.yearlyBreakdown.map((yr) => [
        yr.year,
        formatINR(yr.investedThatYear),
        formatINR(yr.cumulativeInvested),
        formatINR(yr.interestThatYear),
        formatINR(yr.cumulativeInterest),
        formatINR(yr.yearEndBalance),
    ]);

    autoTable(doc, {
        startY: y,
        margin: { top: CONTENT_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 24 },
        head: [
            ["Year", "Invested That Year", "Cumulative Invested", "Interest That Year", "Cumulative Interest", "Year-End Balance"],
        ],
        body: yearlyData,
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
            3: { fontStyle: "bold" },
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

export async function downloadSIPReportPDF(data: SIPReportData): Promise<void> {
    const doc = await generateSIPReportPDF(data);
    const safeName =
        (data.mode === "regular" ? "Regular-SIP" : data.mode === "step-up" ? "StepUp-SIP" : "GoalBased-SIP") +
        "-" +
        Date.now().toString(36).toUpperCase();
    doc.save(`SIP-Report-${safeName}.pdf`);
}