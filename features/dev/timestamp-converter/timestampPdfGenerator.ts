// features/dev/timestamp-converter/timestampPdfGenerator.ts

"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logger } from "@/lib/logger";
import type { ConversionResult, TimestampOptions } from "./utils";

export const PDF_BRAND = {
    companyName: "Toolverse",
    productName: "Timestamp Converter",
    websiteUrl: "www.toolverse.com",
    logoPath: "/logo-dark.png",
    primary: [20, 92, 60] as [number, number, number],
    primaryDark: [13, 63, 41] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
};

export interface TimestampReportData {
    input: string;
    options: TimestampOptions;
    result: ConversionResult;
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
    return `TS-${Date.now().toString(36).toUpperCase()}`;
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
    const metaMaxWidth = Math.max(doc.getTextWidth(reportIdLine), doc.getTextWidth(generatedLine));

    const gap = 8;
    const leftBound = logoX + logoSize + gap;
    const rightBound = pageWidth - MARGIN_X - metaMaxWidth - gap;
    const halfWidth = Math.min(pageWidth / 2 - leftBound, rightBound - pageWidth / 2);
    const title = "Timestamp Conversion Report";
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
        "This is a system-generated report for internal reference only and does not constitute advice.",
        MARGIN_X,
        pageHeight - 7
    );
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - MARGIN_X, pageHeight - 7, { align: "right" });
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

export async function generateTimestampReportPDF(data: TimestampReportData): Promise<jsPDF> {
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

    // Input Summary
    ensureSpace(30);
    const infoBoxW = pageWidth - MARGIN_X * 2;
    const infoBoxH = 20;
    doc.setFillColor(...PDF_BRAND.lightGray);
    doc.roundedRect(MARGIN_X, y, infoBoxW, infoBoxH, 2, 2, "F");

    const infoCols = [
        { label: "Input", value: data.input || "—", mono: false },
        { label: "Unit", value: data.options.unit, mono: false },
        { label: "Timezone", value: data.options.timezone, mono: false },
        { label: "24-Hour Format", value: data.options.use24Hour ? "Yes" : "No", mono: false },
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

    // Conversion Results
    ensureSpace(14);
    y = sectionTitle(doc, y, "Conversion Results");

    const resultRows: [string, string][] = [
        ["Unix Timestamp (seconds)", data.result.unix.toString()],
        ["Unix Timestamp (milliseconds)", data.result.unixMs.toString()],
        ["Unix Timestamp (microseconds)", data.result.unixMicro.toString()],
        ["Unix Timestamp (nanoseconds)", data.result.unixNano.toString()],
        ["ISO 8601", data.result.iso],
        ["UTC", data.result.utc],
        ["Local Time", data.result.local],
        ["Relative Time", data.result.relative],
    ];

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN_X, right: MARGIN_X },
        head: [["Parameter", "Value"]],
        body: resultRows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark },
        headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
        columnStyles: { 1: { halign: "left" } },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Formatted Dates
    ensureSpace(14);
    y = sectionTitle(doc, y, "Formatted Dates");

    const formatRows: [string, string][] = [
        ["Short", data.result.formatted.short],
        ["Medium", data.result.formatted.medium],
        ["Long", data.result.formatted.long],
        ["Full", data.result.formatted.full],
    ];

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN_X, right: MARGIN_X },
        head: [["Format", "Value"]],
        body: formatRows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark },
        headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
        columnStyles: { 1: { halign: "left" } },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Date Components
    ensureSpace(14);
    y = sectionTitle(doc, y, "Date Components");

    const componentRows: [string, string][] = [
        ["Year", String(data.result.components.year)],
        ["Month", String(data.result.components.month)],
        ["Day", String(data.result.components.day)],
        ["Hour", String(data.result.components.hour)],
        ["Minute", String(data.result.components.minute)],
        ["Second", String(data.result.components.second)],
        ["Millisecond", String(data.result.components.millisecond)],
        ["Weekday", data.result.components.weekday],
        ["Month Name", data.result.components.monthName],
    ];

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN_X, right: MARGIN_X },
        head: [["Component", "Value"]],
        body: componentRows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark },
        headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
        columnStyles: { 1: { halign: "left" } },
        alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
        didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Timezone Info (if needed)
    if (data.options.timezone !== "UTC") {
        ensureSpace(14);
        y = sectionTitle(doc, y, "Timezone Information");

        const timezoneInfo = {
            name: data.options.timezone,
            offset: "", // We don't have a function to get offset from timezone string in the utils, but we can use Intl
            abbreviation: "",
        };

        try {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: data.options.timezone,
                timeZoneName: "short",
            });
            const parts = formatter.formatToParts(now);
            const abbreviationPart = parts.find((p) => p.type === "timeZoneName");
            timezoneInfo.abbreviation = abbreviationPart ? abbreviationPart.value : "";

            // Calculate offset
            const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
            const tzDate = new Date(now.toLocaleString("en-US", { timeZone: data.options.timezone }));
            const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000;
            const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
            const offsetMins = Math.abs(offsetMinutes) % 60;
            const offsetSign = offsetMinutes >= 0 ? "+" : "-";
            timezoneInfo.offset = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMins).padStart(2, "0")}`;
        } catch (e) {
            // fallback
            timezoneInfo.offset = "UTC";
            timezoneInfo.abbreviation = "UTC";
        }

        const tzRows: [string, string][] = [
            ["Timezone", timezoneInfo.name],
            ["Offset", `UTC${timezoneInfo.offset}`],
            ["Abbreviation", timezoneInfo.abbreviation],
        ];

        autoTable(doc, {
            startY: y,
            margin: { left: MARGIN_X, right: MARGIN_X },
            head: [["Property", "Value"]],
            body: tzRows,
            theme: "plain",
            styles: { fontSize: 9, cellPadding: 3, textColor: PDF_BRAND.dark },
            headStyles: { fillColor: PDF_BRAND.primary, textColor: 255, fontStyle: "bold" },
            columnStyles: { 1: { halign: "left" } },
            alternateRowStyles: { fillColor: PDF_BRAND.lightGray },
            didDrawPage: () => drawHeader(doc, logo, reportId, generatedStr),
        });

        y = (doc as any).lastAutoTable.finalY + 10;
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages);
    }

    return doc;
}

export async function downloadTimestampReportPDF(data: TimestampReportData): Promise<void> {
    const doc = await generateTimestampReportPDF(data);
    const safeName = `Timestamp-Conversion-${data.result.unix}`;
    doc.save(`${safeName}.pdf`);
}