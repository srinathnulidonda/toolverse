// features/finance/itc-calculator/itcStore.ts

import { logger } from "@/lib/logger";
import { useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { ITCCalculationResult, ITCInvoiceInput } from "./itcEngine";

export interface ITHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    calculation: ITCCalculationResult;
    input: ITCInvoiceInput;
    isFavorite: boolean;
    tags: string[];
    note?: string;
}

export interface ITCSettings {
    autoSave: boolean;
    maxHistoryItems: number;
    defaultUsageSplit: {
        taxable: number;
        exempt: number;
        nonBusiness: number;
    };
    showAdvancedOptions: boolean;
}

const STORAGE_KEYS = {
    history: "tv:itc-history",
    settings: "tv:itc-settings",
} as const;

interface HistoryStorage {
    v: number;
    data: ITHistoryEntry[];
}

interface SettingsStorage {
    v: number;
    data: ITCSettings;
}

function getDefaultSettings(): ITCSettings {
    return {
        autoSave: true,
        maxHistoryItems: 100,
        defaultUsageSplit: {
            taxable: 100,
            exempt: 0,
            nonBusiness: 0,
        },
        showAdvancedOptions: false,
    };
}

function isValidHistoryEntry(item: any): item is ITHistoryEntry {
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
        typeof calc.eligibleITC !== "number" ||
        typeof calc.ineligibleITC !== "number" ||
        typeof calc.status !== "string" ||
        !calc.breakdown ||
        typeof calc.breakdown !== "object"
    ) {
        return false;
    }

    if (!item.input || typeof item.input !== "object") return false;
    const inp = item.input;
    if (
        typeof inp.invoiceNumber !== "string" ||
        typeof inp.invoiceDate !== "string" ||
        typeof inp.gstinSupplier !== "string" ||
        typeof inp.totalInvoiceValue !== "number" ||
        typeof inp.gstPaid !== "number"
    ) {
        return false;
    }

    if (
        !isFinite(calc.eligibleITC) ||
        !isFinite(calc.ineligibleITC) ||
        calc.eligibleITC < 0 ||
        calc.ineligibleITC < 0
    ) {
        return false;
    }

    return true;
}

function validateHistory(raw: HistoryStorage | null, maxItems: number): ITHistoryEntry[] {
    if (
        !raw ||
        typeof raw !== "object" ||
        !("v" in raw) ||
        !("data" in raw) ||
        !Array.isArray(raw.data)
    ) {
        return [];
    }

    const valid: ITHistoryEntry[] = [];
    const invalid: any[] = [];

    for (const item of raw.data) {
        if (isValidHistoryEntry(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }

    if (invalid.length > 0 && process.env.NODE_ENV === "development") {
        logger.warn(`Filtered out ${invalid.length} invalid ITC history entries`);
    }

    valid.sort((a, b) => b.timestamp - a.timestamp);

    if (valid.length > maxItems) {
        return valid.slice(0, maxItems);
    }

    return valid;
}

function validateSettings(raw: SettingsStorage | null): ITCSettings {
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
        defaultUsageSplit: raw.data.defaultUsageSplit || defaults.defaultUsageSplit,
        showAdvancedOptions:
            typeof raw.data.showAdvancedOptions === "boolean"
                ? raw.data.showAdvancedOptions
                : defaults.showAdvancedOptions,
    };
}

function generateEntryId(): string {
    return `itc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function useITCStore() {
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
        (entry: Omit<ITHistoryEntry, "id" | "timestamp">) => {
            if (!settings.autoSave) {
                return;
            }

            const newEntry: ITHistoryEntry = {
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
        (id: string, updates: Partial<ITHistoryEntry>) => {
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
        (query: string): ITHistoryEntry[] => {
            if (!query.trim()) return history;

            const q = query.toLowerCase();
            return history.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.input.invoiceNumber.toLowerCase().includes(q) ||
                    e.input.gstinSupplier.toLowerCase().includes(q) ||
                    e.note?.toLowerCase().includes(q) ||
                    e.tags.some((t) => t.toLowerCase().includes(q)) ||
                    e.calculation.status.toLowerCase().includes(q)
            );
        },
        [history]
    );

    const getFavorites = useCallback(() => history.filter((e) => e.isFavorite), [history]);

    const getStatistics = useCallback(() => {
        const totalEntries = history.length;
        const favoriteCount = history.filter((e) => e.isFavorite).length;
        const totalEligibleITC = history.reduce(
            (acc, e) => acc + (e.calculation?.eligibleITC || 0),
            0
        );
        const totalIneligibleITC = history.reduce(
            (acc, e) => acc + (e.calculation?.ineligibleITC || 0),
            0
        );
        const averageEligibleITC =
            totalEntries > 0 ? totalEligibleITC / totalEntries : 0;

        const statusUsage = history.reduce(
            (acc, e) => {
                const status = e.calculation?.status;
                if (status) {
                    acc[status] = (acc[status] || 0) + 1;
                }
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            totalEntries,
            favoriteCount,
            totalEligibleITC,
            totalIneligibleITC,
            averageEligibleITC,
            statusUsage,
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