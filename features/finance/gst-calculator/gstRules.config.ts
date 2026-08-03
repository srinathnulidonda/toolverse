// features/finance/gst-calculator/gstRules.config.ts

export const GST_RULES_VERSION = "FY2024-25";

export const GST_SLABS = [
    { rate: 0, label: "0% GST", description: "Essential items: milk, eggs, fresh vegetables, unbranded atta, etc." },
    { rate: 0.25, label: "0.25% GST", description: "Rough diamonds, precious stones" },
    { rate: 3, label: "3% GST", description: "Gold, silver, precious metals" },
    { rate: 5, label: "5% GST", description: "Household necessities: sugar, tea, coffee, edible oil, coal, etc." },
    { rate: 12, label: "12% GST", description: "Processed foods, computers, mobile phones, etc." },
    { rate: 18, label: "18% GST", description: "Most goods and services: hair oil, toothpaste, soap, capital goods, IT services, etc." },
    { rate: 28, label: "28% GST", description: "Luxury items: cars, motorcycles, air conditioners, cigarettes, aerated drinks, etc." },
] as const;

export const CESS_CATEGORIES = [
    {
        id: "tobacco",
        label: "Tobacco Products",
        note: "Pan masala, gutkha, cigarettes (up to 290% cess)",
        commonRate: 28,
    },
    {
        id: "luxury-cars",
        label: "Luxury & SUV Cars",
        note: "Above 4m length or 1500cc engine (15-22% cess)",
        commonRate: 17,
    },
    {
        id: "aerated-drinks",
        label: "Aerated Drinks & Cola",
        note: "Soft drinks, energy drinks (12% cess)",
        commonRate: 12,
    },
    {
        id: "coal-peat",
        label: "Coal, Lignite, Peat",
        note: "Fossil fuels (₹400 per tonne cess)",
        commonRate: 0,
    },
    {
        id: "pan-masala",
        label: "Pan Masala without Tobacco",
        note: "60% cess on retail sale price",
        commonRate: 60,
    },
] as const;

export const SUPPLY_TYPES = [
    {
        id: "INTRA_STATE" as const,
        label: "Intra-State Supply",
        description: "Within same state (CGST + SGST/UTGST)",
        note: "Both supplier and recipient in same state",
    },
    {
        id: "INTER_STATE" as const,
        label: "Inter-State Supply",
        description: "Across states (IGST)",
        note: "Supplier and recipient in different states",
    },
] as const;

export const GST_CALCULATION_RULES = {
    forward: {
        description: "Add GST to base amount (Exclusive → Inclusive)",
        formula: "Final Amount = Base Amount + (Base Amount × GST Rate%)",
        example: "₹1,000 + 18% GST = ₹1,180",
    },
    reverse: {
        description: "Remove GST from final amount (Inclusive → Exclusive)",
        formula: "Base Amount = Final Amount × 100 ÷ (100 + GST Rate%)",
        example: "₹1,180 including 18% GST → Base = ₹1,000",
    },
    intraSplit: {
        description: "Intra-state supply splits GST equally",
        formula: "CGST = SGST = (Base Amount × GST Rate%) ÷ 2",
        example: "18% GST = 9% CGST + 9% SGST",
    },
    cess: {
        description: "Cess is additional tax on specific goods",
        formula: "Cess = Base Amount × Cess Rate%",
        example: "Luxury car: 28% GST + 17% Cess = 45% total",
    },
} as const;

export const COMMON_MISTAKES = [
    {
        mistake: "Calculating GST on GST-inclusive amount",
        impact: "Overstated tax amount",
        solution: "Use reverse calculation mode for inclusive amounts",
    },
    {
        mistake: "Not splitting CGST/SGST for intra-state supply",
        impact: "Incorrect tax filing",
        solution: "Always split equally for same-state transactions",
    },
    {
        mistake: "Forgetting to add cess on applicable items",
        impact: "Understated tax liability",
        solution: "Check if item falls under cess categories",
    },
    {
        mistake: "Using wrong supply type",
        impact: "Wrong tax heads (CGST/SGST vs IGST)",
        solution: "Verify supplier and recipient state codes",
    },
] as const;