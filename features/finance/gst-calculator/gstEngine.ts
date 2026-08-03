// features/finance/gst-calculator/gstEngine.ts

export type CalculationMode = "ADD_GST" | "REMOVE_GST";
export type SupplyType = "INTRA_STATE" | "INTER_STATE";

export interface GSTInput {
    mode: CalculationMode;
    amount: number;
    gstRate: number;
    supplyType: SupplyType;
    cessRate: number;
    quantity: number;
}

export interface GSTCalculationResult {
    baseAmount: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
    totalTax: number;
    finalAmount: number;
    gstRate: number;
    cessRate: number;
    supplyType: SupplyType;
    mode: CalculationMode;
    quantity: number;
    perUnitBase: number;
    perUnitTax: number;
    perUnitFinal: number;
    breakdown: {
        description: string;
        formula: string;
        result: number;
    }[];
}

function safeDiv(numerator: number, denominator: number, fallback: number = 0): number {
    if (!isFinite(numerator) || !isFinite(denominator)) return fallback;
    if (denominator === 0) return fallback;
    const result = numerator / denominator;
    return isFinite(result) ? result : fallback;
}

export function calculateGST(input: GSTInput): GSTCalculationResult {
    const breakdown: { description: string; formula: string; result: number }[] = [];

    // Validate inputs
    if (input.amount < 0) input.amount = 0;
    if (input.gstRate < 0) input.gstRate = 0;
    if (input.gstRate > 100) input.gstRate = 100;
    if (input.cessRate < 0) input.cessRate = 0;
    if (input.cessRate > 100) input.cessRate = 100;
    if (input.quantity <= 0) input.quantity = 1;

    let baseAmount = 0;
    let taxableValue = 0;
    let totalTax = 0;
    let finalAmount = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let cess = 0;

    if (input.mode === "ADD_GST") {
        // Forward calculation: amount is base, add GST to it
        baseAmount = input.amount;
        taxableValue = baseAmount * input.quantity;

        breakdown.push({
            description: "Taxable Value (Base × Quantity)",
            formula: `₹${baseAmount.toFixed(2)} × ${input.quantity}`,
            result: taxableValue,
        });

        const gstAmount = (taxableValue * input.gstRate) / 100;

        if (input.supplyType === "INTRA_STATE") {
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
            breakdown.push({
                description: `CGST @ ${(input.gstRate / 2).toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${(input.gstRate / 2).toFixed(2)}%`,
                result: cgst,
            });
            breakdown.push({
                description: `SGST @ ${(input.gstRate / 2).toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${(input.gstRate / 2).toFixed(2)}%`,
                result: sgst,
            });
        } else {
            igst = gstAmount;
            breakdown.push({
                description: `IGST @ ${input.gstRate.toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${input.gstRate.toFixed(2)}%`,
                result: igst,
            });
        }

        if (input.cessRate > 0) {
            cess = (taxableValue * input.cessRate) / 100;
            breakdown.push({
                description: `Cess @ ${input.cessRate.toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${input.cessRate.toFixed(2)}%`,
                result: cess,
            });
        }

        totalTax = cgst + sgst + igst + cess;
        finalAmount = taxableValue + totalTax;

        breakdown.push({
            description: "Total Tax",
            formula: `${input.supplyType === "INTRA_STATE" ? "CGST + SGST" : "IGST"}${input.cessRate > 0 ? " + Cess" : ""}`,
            result: totalTax,
        });

        breakdown.push({
            description: "Final Amount (Inc. Tax)",
            formula: `Taxable Value + Total Tax`,
            result: finalAmount,
        });
    } else {
        // Reverse calculation: amount is final (inclusive), extract GST from it
        finalAmount = input.amount;
        const totalRate = input.gstRate + input.cessRate;
        const divisor = 100 + totalRate;

        taxableValue = safeDiv(finalAmount * 100, divisor, 0);
        baseAmount = safeDiv(taxableValue, input.quantity, 0);

        breakdown.push({
            description: "Extract Taxable Value",
            formula: `₹${finalAmount.toFixed(2)} × 100 ÷ ${divisor.toFixed(2)}`,
            result: taxableValue,
        });

        breakdown.push({
            description: "Base Amount (Per Unit)",
            formula: `₹${taxableValue.toFixed(2)} ÷ ${input.quantity}`,
            result: baseAmount,
        });

        const gstAmount = (taxableValue * input.gstRate) / 100;

        if (input.supplyType === "INTRA_STATE") {
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
            breakdown.push({
                description: `CGST @ ${(input.gstRate / 2).toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${(input.gstRate / 2).toFixed(2)}%`,
                result: cgst,
            });
            breakdown.push({
                description: `SGST @ ${(input.gstRate / 2).toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${(input.gstRate / 2).toFixed(2)}%`,
                result: sgst,
            });
        } else {
            igst = gstAmount;
            breakdown.push({
                description: `IGST @ ${input.gstRate.toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${input.gstRate.toFixed(2)}%`,
                result: igst,
            });
        }

        if (input.cessRate > 0) {
            cess = (taxableValue * input.cessRate) / 100;
            breakdown.push({
                description: `Cess @ ${input.cessRate.toFixed(2)}%`,
                formula: `₹${taxableValue.toFixed(2)} × ${input.cessRate.toFixed(2)}%`,
                result: cess,
            });
        }

        totalTax = cgst + sgst + igst + cess;

        breakdown.push({
            description: "Total Tax",
            formula: `${input.supplyType === "INTRA_STATE" ? "CGST + SGST" : "IGST"}${input.cessRate > 0 ? " + Cess" : ""}`,
            result: totalTax,
        });
    }

    const perUnitBase = safeDiv(baseAmount, 1, 0);
    const perUnitTax = safeDiv(totalTax, input.quantity, 0);
    const perUnitFinal = safeDiv(finalAmount, input.quantity, 0);

    return {
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        taxableValue: parseFloat(taxableValue.toFixed(2)),
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        igst: parseFloat(igst.toFixed(2)),
        cess: parseFloat(cess.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        gstRate: input.gstRate,
        cessRate: input.cessRate,
        supplyType: input.supplyType,
        mode: input.mode,
        quantity: input.quantity,
        perUnitBase: parseFloat(perUnitBase.toFixed(2)),
        perUnitTax: parseFloat(perUnitTax.toFixed(2)),
        perUnitFinal: parseFloat(perUnitFinal.toFixed(2)),
        breakdown,
    };
}

export function calculateBulkGST(inputs: GSTInput[]): {
    totalBaseAmount: number;
    totalTax: number;
    totalFinalAmount: number;
    itemCount: number;
    avgGSTRate: number;
} {
    let totalBaseAmount = 0;
    let totalTax = 0;
    let totalFinalAmount = 0;
    let totalGSTRate = 0;

    inputs.forEach((input) => {
        const result = calculateGST(input);
        totalBaseAmount += result.baseAmount;
        totalTax += result.totalTax;
        totalFinalAmount += result.finalAmount;
        totalGSTRate += result.gstRate;
    });

    return {
        totalBaseAmount: parseFloat(totalBaseAmount.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        totalFinalAmount: parseFloat(totalFinalAmount.toFixed(2)),
        itemCount: inputs.length,
        avgGSTRate: inputs.length > 0 ? parseFloat((totalGSTRate / inputs.length).toFixed(2)) : 0,
    };
}