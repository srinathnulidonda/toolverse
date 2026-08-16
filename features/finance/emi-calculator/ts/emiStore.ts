// features/finance/emi-calculator/ts/emiStore.ts

import { logger } from "@/lib/logger";
import { useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { EMICalculationResult, EMIInput } from "./emiEngine";

export interface EMIHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    calculation: EMICalculationResult;
    input: EMIInput;
    isFavorite: boolean;
    tags: string[];
    note?: string;
}

export interface EMISettings {
    autoSave: boolean;
    maxHistoryItems: number;
    defaultCurrency: string;
    showAmortizationTable: boolean;
    decimalPlaces: number;
}

const STORAGE_KEYS = {
    history: "tv:emi-history",
    settings: "tv:emi-settings",
} as const;

interface HistoryStorage {
    v: number;
    data: EMIHistoryEntry[];
}

interface SettingsStorage {
    v: number;
    data: EMISettings;
}

function getDefaultSettings(): EMISettings {
    return {
        autoSave: true,
        maxHistoryItems: 100,
        defaultCurrency: "₹",
        showAmortizationTable: true,
        decimalPlaces: 2,
    };
}

function isValidHistoryEntry(item: any): item is EMIHistoryEntry {
    if (!item || typeof item !== "object") return false;

    if (
        typeof item.id !== "string" ||
        typeof item.timestamp !== "number" ||
        typeof item.title !== "string" ||
        typeof item.isFavorite !== "boolean" ||
        !Array.isArray(item.tags)
    ) {
        return false;
    }

    if (!item.calculation || typeof item.calculation !== "object") return false;
    const calc = item.calculation;
    if (
        typeof calc.emi !== "number" ||
        typeof calc.totalInterest !== "number" ||
        typeof calc.totalPayment !== "number" ||
        !calc.principalVsInterestRatio ||
        typeof calc.principalVsInterestRatio !== "object" ||
        typeof calc.principalVsInterestRatio.principal !== "number" ||
        typeof calc.principalVsInterestRatio.interest !== "number"
    ) {
        return false;
    }

    if (!item.input || typeof item.input !== "object") return false;
    const inp = item.input;
    if (
        typeof inp.loanAmount !== "number" ||
        typeof inp.interestRate !== "number" ||
        typeof inp.tenureValue !== "number" ||
        typeof inp.tenureUnit !== "string" ||
        typeof inp.loanStartDate !== "string"
    ) {
        return false;
    }

    if (
        !isFinite(calc.emi) ||
        !isFinite(calc.totalInterest) ||
        !isFinite(calc.totalPayment) ||
        calc.emi < 0 ||
        calc.totalInterest < 0 ||
        calc.totalPayment < 0
    ) {
        return false;
    }

    return true;
}

function validateHistory(raw: HistoryStorage | null, maxItems: number): EMIHistoryEntry[] {
    if (
        !raw ||
        typeof raw !== "object" ||
        !("v" in raw) ||
        !("data" in raw) ||
        !Array.isArray(raw.data)
    ) {
        return [];
    }

    const valid: EMIHistoryEntry[] = [];
    const invalid: any[] = [];

    for (const item of raw.data) {
        if (isValidHistoryEntry(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }

    if (invalid.length > 0 && process.env.NODE_ENV === "development") {
        logger.warn(`Filtered out ${invalid.length} invalid EMI history entries`);
    }

    valid.sort((a, b) => b.timestamp - a.timestamp);

    if (valid.length > maxItems) {
        return valid.slice(0, maxItems);
    }

    return valid;
}

function validateSettings(raw: SettingsStorage | null): EMISettings {
    const defaults = getDefaultSettings();

    if (!raw || typeof raw !== "object" || !("v" in raw) || !("data" in raw)) {
        return defaults;
    }

    return {
        autoSave: typeof raw.data.autoSave === "boolean" ? raw.data.autoSave : defaults.autoSave,
        maxHistoryItems:
            typeof raw.data.maxHistoryItems === "number" && raw.data.maxHistoryItems > 0
                ? Math.min(raw.data.maxHistoryItems, 500)
                : defaults.maxHistoryItems,
        defaultCurrency:
            typeof raw.data.defaultCurrency === "string"
                ? raw.data.defaultCurrency
                : defaults.defaultCurrency,
        showAmortizationTable:
            typeof raw.data.showAmortizationTable === "boolean"
                ? raw.data.showAmortizationTable
                : defaults.showAmortizationTable,
        decimalPlaces:
            typeof raw.data.decimalPlaces === "number" && raw.data.decimalPlaces >= 0
                ? Math.min(raw.data.decimalPlaces, 6)
                : defaults.decimalPlaces,
    };
}

function generateEntryId(): string {
    return `emi_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function useEMIStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(STORAGE_KEYS.history, {
        v: 1,
        data: [],
    });

    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(STORAGE_KEYS.settings, {
        v: 1,
        data: getDefaultSettings(),
    });

    const settings = useMemo(() => validateSettings(settingsRaw), [settingsRaw]);

    const history = useMemo(
        () => validateHistory(historyRaw, settings.maxHistoryItems),
        [historyRaw, settings.maxHistoryItems]
    );

    const saveToHistory = useCallback(
        (entry: Omit<EMIHistoryEntry, "id" | "timestamp">) => {
            if (!settings.autoSave) {
                return;
            }

            const newEntry: EMIHistoryEntry = {
                ...entry,
                id: generateEntryId(),
                timestamp: Date.now(),
            };

            try {
                setHistoryRaw((prev) => {
                    const newData = [newEntry, ...(prev?.data ?? [])].slice(0, settings.maxHistoryItems);
                    return { v: 1, data: newData };
                });
            } catch (error) {
                logger.error("Failed to save to history:", error);
            }
        },
        [settings.autoSave, settings.maxHistoryItems, setHistoryRaw]
    );

    const removeFromHistory = useCallback(
        (id: string) => {
            try {
                setHistoryRaw((prev) => ({
                    v: 1,
                    data: (prev?.data ?? []).filter((e) => e.id !== id),
                }));
            } catch (error) {
                logger.error("Failed to remove from history:", error);
            }
        },
        [setHistoryRaw]
    );

    const clearHistory = useCallback(() => {
        try {
            setHistoryRaw({ v: 1, data: [] });
        } catch (error) {
            logger.error("Failed to clear history:", error);
        }
    }, [setHistoryRaw]);

    const toggleFavorite = useCallback(
        (id: string) => {
            try {
                setHistoryRaw((prev) => ({
                    v: 1,
                    data: (prev?.data ?? []).map((e) =>
                        e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
                    ),
                }));
            } catch (error) {
                logger.error("Failed to toggle favorite:", error);
            }
        },
        [setHistoryRaw]
    );

    const updateEntry = useCallback(
        (id: string, updates: Partial<EMIHistoryEntry>) => {
            try {
                setHistoryRaw((prev) => ({
                    v: 1,
                    data: (prev?.data ?? []).map((e) => (e.id === id ? { ...e, ...updates } : e)),
                }));
            } catch (error) {
                logger.error("Failed to update entry:", error);
            }
        },
        [setHistoryRaw]
    );

    const searchHistory = useCallback(
        (query: string): EMIHistoryEntry[] => {
            if (!query.trim()) return history;

            const q = query.toLowerCase();
            return history.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.input.loanAmount.toString().includes(q) ||
                    e.input.interestRate.toString().includes(q) ||
                    e.input.tenureValue.toString().includes(q) ||
                    e.note?.toLowerCase().includes(q) ||
                    e.tags.some((t) => t.toLowerCase().includes(q)) ||
                    e.calculation.emi.toString().includes(q)
            );
        },
        [history]
    );

    const getFavorites = useCallback(() => history.filter((e) => e.isFavorite), [history]);

    const getStatistics = useCallback(() => {
        const totalEntries = history.length;
        const favoriteCount = history.filter((e) => e.isFavorite).length;
        const totalInterestPaid = history.reduce(
            (acc, e) => acc + (e.calculation?.totalInterestWithPrepayment || e.calculation?.totalInterest || 0),
            0
        );
        const totalPrincipalPaid = history.reduce(
            (acc, e) => acc + (e.calculation?.schedule?.reduce((sum, row) => sum + row.principal, 0) || 0),
            0
        );
        const averageEMI = totalEntries > 0 ? history.reduce((acc, e) => acc + e.calculation.emi, 0) / totalEntries : 0;

        const loanTypeUsage = history.reduce(
            (acc, e) => {
                const loanType = e.input.loanType || "unknown";
                acc[loanType] = (acc[loanType] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            totalEntries,
            favoriteCount,
            totalInterestPaid,
            totalPrincipalPaid,
            averageEMI,
            loanTypeUsage,
        };
    }, [history]);

    return {
        history,
        settings,
        saveToHistory,
        removeFromHistory,
        clearHistory,
        toggleFavorite,
        updateEntry,
        searchHistory,
        getFavorites,
        getStatistics,
    };
}