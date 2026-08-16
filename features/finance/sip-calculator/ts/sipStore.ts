// features/finance/sip-calculator/ts/sipStore.ts

import { logger } from "@/lib/logger";
import { useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { SIPCalculationResult, SIPInput } from "./sipEngine";

export interface SIPHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    calculation: SIPCalculationResult;
    input: SIPInput;
    isFavorite: boolean;
    tags: string[];
    note?: string;
}

export interface SIPSettings {
    autoSave: boolean;
    maxHistoryItems: number;
    defaultCurrency: string;
    showYearlyBreakdown: boolean;
    decimalPlaces: number;
}

const STORAGE_KEYS = {
    history: "tv:sip-history",
    settings: "tv:sip-settings",
} as const;

interface HistoryStorage {
    v: number;
    data: SIPHistoryEntry[];
}

interface SettingsStorage {
    v: number;
    data: SIPSettings;
}

function getDefaultSettings(): SIPSettings {
    return {
        autoSave: true,
        maxHistoryItems: 100,
        defaultCurrency: "₹",
        showYearlyBreakdown: true,
        decimalPlaces: 2,
    };
}

function isValidHistoryEntry(item: unknown): item is SIPHistoryEntry {
    if (!item || typeof item !== "object") return false;

    const obj = item as any;

    if (
        typeof obj.id !== "string" ||
        typeof obj.timestamp !== "number" ||
        typeof obj.title !== "string" ||
        typeof obj.isFavorite !== "boolean" ||
        !Array.isArray(obj.tags)
    ) {
        return false;
    }

    if (!obj.calculation || typeof obj.calculation !== "object") return false;
    const calc = obj.calculation;
    if (
        typeof calc.totalInvested !== "number" ||
        typeof calc.returns !== "number" ||
        typeof calc.maturityAmount !== "number" ||
        (calc.inflationAdjustedAmount !== undefined && typeof calc.inflationAdjustedAmount !== "number") ||
        (calc.monthlySIPRequired !== undefined && typeof calc.monthlySIPRequired !== "number")
    ) {
        return false;
    }

    if (!obj.input || typeof obj.input !== "object") return false;
    const inp = obj.input;
    if (
        typeof inp.monthlyInvestment !== "number" ||
        typeof inp.expectedReturn !== "number" ||
        typeof inp.tenureValue !== "number" ||
        typeof inp.tenureUnit !== "string" ||
        (inp.lumpSum !== undefined && typeof inp.lumpSum !== "number") ||
        (inp.inflationRate !== undefined && typeof inp.inflationRate !== "number") ||
        (inp.stepUpPercentage !== undefined && typeof inp.stepUpPercentage !== "number") ||
        (inp.goalAmount !== undefined && typeof inp.goalAmount !== "number")
    ) {
        return false;
    }

    if (
        !isFinite(calc.totalInvested) ||
        !isFinite(calc.returns) ||
        !isFinite(calc.maturityAmount) ||
        calc.totalInvested < 0 ||
        calc.returns < 0 ||
        calc.maturityAmount < 0 ||
        (calc.inflationAdjustedAmount !== undefined && (!isFinite(calc.inflationAdjustedAmount) || calc.inflationAdjectedAmount < 0)) ||
        (calc.monthlySIPRequired !== undefined && (!isFinite(calc.monthlySIPRequired) || calc.monthlySIPRequired < 0))
    ) {
        return false;
    }

    return true;
}

function validateHistory(raw: HistoryStorage | null, maxItems: number): SIPHistoryEntry[] {
    if (
        !raw ||
        typeof raw !== "object" ||
        !("v" in raw) ||
        !("data" in raw) ||
        !Array.isArray(raw.data)
    ) {
        return [];
    }

    const valid: SIPHistoryEntry[] = [];
    const invalid: unknown[] = [];

    for (const item of raw.data) {
        if (isValidHistoryEntry(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }

    if (invalid.length > 0 && process.env.NODE_ENV === "development") {
        logger.warn(`Filtered out ${invalid.length} invalid SIP history entries`);
    }

    valid.sort((a, b) => b.timestamp - a.timestamp);

    if (valid.length > maxItems) {
        return valid.slice(0, maxItems);
    }

    return valid;
}

function validateSettings(raw: SettingsStorage | null): SIPSettings {
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
        showYearlyBreakdown:
            typeof raw.data.showYearlyBreakdown === "boolean"
                ? raw.data.showYearlyBreakdown
                : defaults.showYearlyBreakdown,
        decimalPlaces:
            typeof raw.data.decimalPlaces === "number" && raw.data.decimalPlaces >= 0
                ? Math.min(raw.data.decimalPlaces, 6)
                : defaults.decimalPlaces,
    };
}

function generateEntryId(): string {
    return `sip_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function useSIPStore() {
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
        (entry: Omit<SIPHistoryEntry, "id" | "timestamp">) => {
            if (!settings.autoSave) {
                return;
            }

            const newEntry: SIPHistoryEntry = {
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
        (id: string, updates: Partial<SIPHistoryEntry>) => {
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
        (query: string): SIPHistoryEntry[] => {
            if (!query.trim()) return history;

            const q = query.toLowerCase();
            return history.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.input.monthlyInvestment.toString().includes(q) ||
                    e.input.expectedReturn.toString().includes(q) ||
                    e.input.tenureValue.toString().includes(q) ||
                    e.note?.toLowerCase().includes(q) ||
                    e.tags.some((t) => t.toLowerCase().includes(q)) ||
                    e.calculation.maturityAmount.toString().includes(q) ||
                    e.calculation.monthlySIPRequired?.toString().includes(q)
            );
        },
        [history]
    );

    const getFavorites = useCallback(() => history.filter((e) => e.isFavorite), [history]);

    const getStatistics = useCallback(() => {
        const totalEntries = history.length;
        const favoriteCount = history.filter((e) => e.isFavorite).length;
        const totalInvested = history.reduce(
            (acc, e) => acc + e.calculation.totalInvested,
            0
        );
        const totalReturns = history.reduce(
            (acc, e) => acc + e.calculation.returns,
            0
        );
        const totalMaturity = history.reduce(
            (acc, e) => acc + e.calculation.maturityAmount,
            0
        );
        const averageMonthlySIP = history.reduce(
            (acc, e) => acc + (e.calculation.monthlySIPRequired ?? e.input.monthlyInvestment ?? 0),
            0
        ) / (totalEntries > 0 ? totalEntries : 1);

        const sipTypeUsage = history.reduce(
            (acc, e) => {
                const sipType = e.input.mode;
                acc[sipType] = (acc[sipType] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            totalEntries,
            favoriteCount,
            totalInvested,
            totalReturns,
            totalMaturity,
            averageMonthlySIP,
            sipTypeUsage,
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