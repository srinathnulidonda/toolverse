// features/finance/gst-calculator/gstPdfGenerator.ts

"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logger } from "@/lib/logger";
import type { GSTCalculationResult } from "./gstEngine";

export const PDF_BRAND = {
    companyName: "Toolverse",
    productName: "GST Calculator",
    websiteUrl: "www.toolverse.com",
    logoPath: "/logo.png",
    primary: [20, 92, 60] as [number, number, number],
    primaryDark: [13, 63, 41] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
};

export interface GSTReportData {
    reference: string;
    mode: string;
    supplyType: string;
    inputAmount: number;
    gstRate: number;
    cessRate: number;
    quantity: number;
    calculation: GSTCalculationResult;
}

function formatINR(amount: number): string {
    const value = isFinite(amount) ? amount : 0;
    return `Rs. ${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function generateReportId(): string {
    return `GST-${Date.now().toString(36).toUpperCase()}`;
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
    const title = "GST Calculation Report";
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

export async function generateGSTReportPDF(data: GSTReportData): Promise<jsPDF> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = PAGE.width;
    const reportId = generateReportId();
    const generatedStr = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
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
        { label: "Reference", value: data.reference || "—", mono: false },
        { label: "Calculation Mode", value: data.mode === "ADD_GST" ? "Add GST (Forward)" : "Remove GST (Reverse)", mono: false },
        { label: "Supply Type", value: data.supplyType === "INTRA_STATE" ? "Intra-State" : "Inter-State", mono: false },
        { label: "GST Rate", value: `${data.gstRate.toFixed(2)}%${data.cessRate > 0 ? ` + ${data.cessRate.toFixed(2)}% Cess` : ""}`, mono: false },
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
        const lines = doc.splitTextToSize(col.value, colW - 10);
        doc.text(lines, x, y + 14.5);

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
    doc.setTextColor(...PDF_BRAND.primary);
    doc.text(data.mode === "ADD_GST" ? "GST Added Successfully" : "GST Extracted Successfully", MARGIN_X, y + 7);

    y += 7 + 10;

    ensureSpace(24);
    const cardW = (pageWidth - MARGIN_X * 2 - 6) / 2;

    doc.setFillColor(...PDF_BRAND.primary);
    doc.roundedRect(MARGIN_X, y, cardW, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("BASE AMOUNT", MARGIN_X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(formatINR(data.calculation.baseAmount), MARGIN_X + 5, y + 15);

    const card2X = MARGIN_X + cardW + 6;
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.setDrawColor(...PDF_BRAND.border);
    doc.roundedRect(card2X, y, cardW, 20, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.gray);
    doc.text("TOTAL TAX", card2X + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...PDF_BRAND.primary);
    doc.text(formatINR(data.calculation.totalTax), card2X + 5, y + 15);

    y += 20 + 10;

    ensureSpace(14);
    y = sectionTitle(doc, y, "Tax Breakdown");

    const breakdownRows: [string, string][] = [
        ["Base Amount", formatINR(data.calculation.baseAmount)],
        ["Quantity", `${data.calculation.quantity} unit${data.calculation.quantity > 1 ? "s" : ""}`],
        ["Taxable Value", formatINR(data.calculation.taxableValue)],
    ];

    if (data.calculation.supplyType === "INTRA_STATE") {
        breakdownRows.push([`CGST @ ${(data.calculation.gstRate / 2).toFixed(2)}%`, formatINR(data.calculation.cgst)]);
        breakdownRows.push([`SGST @ ${(data.calculation.gstRate / 2).toFixed(2)}%`, formatINR(data.calculation.sgst)]);
    } else {
        breakdownRows.push([`IGST @ ${data.calculation.gstRate.toFixed(2)}%`, formatINR(data.calculation.igst)]);
    }

    if (data.calculation.cess > 0) {
        breakdownRows.push([`Cess @ ${data.calculation.cessRate.toFixed(2)}%`, formatINR(data.calculation.cess)]);
    }

    breakdownRows.push(["Total Tax", formatINR(data.calculation.totalTax)]);
    breakdownRows.push(["Final Amount (Inc. Tax)", formatINR(data.calculation.finalAmount)]);

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

    if (data.calculation.quantity > 1) {
        ensureSpace(14);
        y = sectionTitle(doc, y, "Per Unit Breakdown");

        autoTable(doc, {
            startY: y,
            margin: { left: MARGIN_X, right: MARGIN_X },
            theme: "plain",
            styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark },
            body: [
                ["Base Amount (Per Unit)", formatINR(data.calculation.perUnitBase)],
                ["Tax (Per Unit)", formatINR(data.calculation.perUnitTax)],
                ["Final Amount (Per Unit)", formatINR(data.calculation.perUnitFinal)],
            ],
            columnStyles: {
                0: { fontStyle: "bold", textColor: PDF_BRAND.gray },
                1: { halign: "right", fontStyle: "bold" },
            },
            alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
            didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
        });

        y = (doc as any).lastAutoTable.finalY + 10;
    }

    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    return doc;
}

export async function downloadGSTReportPDF(data: GSTReportData): Promise<void> {
    const doc = await generateGSTReportPDF(data);
    const safeName = (data.reference || "Calculation").replace(/[^a-zA-Z0-9-_]/g, "_");
    doc.save(`GST-Calculation-Report-${safeName}.pdf`);
}