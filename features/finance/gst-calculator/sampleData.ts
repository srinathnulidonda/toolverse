// features/finance/gst-calculator/sampleData.ts

import type { CalculationMode, SupplyType } from "./gstEngine";

export const SAMPLE_CALCULATIONS = {
    intraState18: {
        mode: "ADD_GST" as CalculationMode,
        amount: 10000,
        gstRate: 18,
        supplyType: "INTRA_STATE" as SupplyType,
        cessRate: 0,
        quantity: 1,
    },
    interState28: {
        mode: "ADD_GST" as CalculationMode,
        amount: 50000,
        gstRate: 28,
        supplyType: "INTER_STATE" as SupplyType,
        cessRate: 0,
        quantity: 1,
    },
    luxuryCarCess: {
        mode: "ADD_GST" as CalculationMode,
        amount: 1500000,
        gstRate: 28,
        supplyType: "INTER_STATE" as SupplyType,
        cessRate: 17,
        quantity: 1,
    },
    reverseIntraState: {
        mode: "REMOVE_GST" as CalculationMode,
        amount: 11800,
        gstRate: 18,
        supplyType: "INTRA_STATE" as SupplyType,
        cessRate: 0,
        quantity: 1,
    },
    multipleUnits: {
        mode: "ADD_GST" as CalculationMode,
        amount: 500,
        gstRate: 12,
        supplyType: "INTRA_STATE" as SupplyType,
        cessRate: 0,
        quantity: 10,
    },
    reverseWithCess: {
        mode: "REMOVE_GST" as CalculationMode,
        amount: 14500,
        gstRate: 28,
        supplyType: "INTER_STATE" as SupplyType,
        cessRate: 12,
        quantity: 1,
    },
} as const;

export type SampleCalculationType = keyof typeof SAMPLE_CALCULATIONS;

export const SAMPLE_CALCULATION_LABELS: Record<SampleCalculationType, { label: string; desc: string; icon: string }> = {
    intraState18: {
        label: "Intra-State 18%",
        desc: "₹10,000 + 18% GST (9% CGST + 9% SGST)",
        icon: "ti-map-pin",
    },
    interState28: {
        label: "Inter-State 28%",
        desc: "₹50,000 + 28% IGST across states",
        icon: "ti-route",
    },
    luxuryCarCess: {
        label: "Luxury Car + Cess",
        desc: "₹15,00,000 + 28% GST + 17% Cess",
        icon: "ti-car-suv",
    },
    reverseIntraState: {
        label: "Reverse Calculation",
        desc: "₹11,800 inclusive → extract 18% GST",
        icon: "ti-arrow-back-up",
    },
    multipleUnits: {
        label: "Multiple Units",
        desc: "₹500 × 10 units @ 12% GST",
        icon: "ti-stack-2",
    },
    reverseWithCess: {
        label: "Reverse with Cess",
        desc: "₹14,500 inclusive → 28% + 12% cess",
        icon: "ti-refresh-alert",
    },
};