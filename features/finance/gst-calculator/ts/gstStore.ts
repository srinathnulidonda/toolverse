// features/finance/gst-calculator/ts/gstStore.ts

import { logger } from "@/lib/logger";
import { useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { GSTCalculationResult, GSTInput } from "./gstEngine";

export interface GSTHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    calculation: GSTCalculationResult;
    input: GSTInput;
    isFavorite: boolean;
    tags: string[];
    note?: string;
}

export interface GSTSettings {
    autoSave: boolean;
    maxHistoryItems: number;
    defaultGSTRate: number;
    defaultSupplyType: "INTRA_STATE" | "INTER_STATE";
    showAdvancedOptions: boolean;
}

const STORAGE_KEYS = {
    history: "tv:gst-history",
    settings: "tv:gst-settings",
} as const;

interface HistoryStorage {
    v: number;
    data: GSTHistoryEntry[];
}

interface SettingsStorage {
    v: number;
    data: GSTSettings;
}

function getDefaultSettings(): GSTSettings {
    return {
        autoSave: true,
        maxHistoryItems: 100,
        defaultGSTRate: 18,
        defaultSupplyType: "INTRA_STATE",
        showAdvancedOptions: false,
    };
}

function isValidHistoryEntry(item: any): item is GSTHistoryEntry {
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
        typeof calc.baseAmount !== "number" ||
        typeof calc.taxableValue !== "number" ||
        typeof calc.totalTax !== "number" ||
        typeof calc.finalAmount !== "number" ||
        typeof calc.gstRate !== "number"
    ) {
        return false;
    }

    if (!item.input || typeof item.input !== "object") return false;
    const inp = item.input;
    if (
        typeof inp.mode !== "string" ||
        typeof inp.amount !== "number" ||
        typeof inp.gstRate !== "number" ||
        typeof inp.supplyType !== "string"
    ) {
        return false;
    }

    if (
        !isFinite(calc.baseAmount) ||
        !isFinite(calc.totalTax) ||
        !isFinite(calc.finalAmount) ||
        calc.baseAmount < 0 ||
        calc.totalTax < 0 ||
        calc.finalAmount < 0
    ) {
        return false;
    }

    return true;
}

function validateHistory(raw: HistoryStorage | null, maxItems: number): GSTHistoryEntry[] {
    if (
        !raw ||
        typeof raw !== "object" ||
        !("v" in raw) ||
        !("data" in raw) ||
        !Array.isArray(raw.data)
    ) {
        return [];
    }

    const valid: GSTHistoryEntry[] = [];
    const invalid: any[] = [];

    for (const item of raw.data) {
        if (isValidHistoryEntry(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }

    if (invalid.length > 0 && process.env.NODE_ENV === "development") {
        logger.warn(`Filtered out ${invalid.length} invalid GST history entries`);
    }

    valid.sort((a, b) => b.timestamp - a.timestamp);

    if (valid.length > maxItems) {
        return valid.slice(0, maxItems);
    }

    return valid;
}

function validateSettings(raw: SettingsStorage | null): GSTSettings {
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
        defaultGSTRate:
            typeof raw.data.defaultGSTRate === "number" ? raw.data.defaultGSTRate : defaults.defaultGSTRate,
        defaultSupplyType: raw.data.defaultSupplyType || defaults.defaultSupplyType,
        showAdvancedOptions:
            typeof raw.data.showAdvancedOptions === "boolean"
                ? raw.data.showAdvancedOptions
                : defaults.showAdvancedOptions,
    };
}

function generateEntryId(): string {
    return `gst_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function useGSTStore() {
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
        (entry: Omit<GSTHistoryEntry, "id" | "timestamp">) => {
            if (!settings.autoSave) {
                return;
            }

            const newEntry: GSTHistoryEntry = {
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
        (id: string, updates: Partial<GSTHistoryEntry>) => {
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
        (query: string): GSTHistoryEntry[] => {
            if (!query.trim()) return history;

            const q = query.toLowerCase();
            return history.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.note?.toLowerCase().includes(q) ||
                    e.tags.some((t) => t.toLowerCase().includes(q)) ||
                    e.calculation.mode.toLowerCase().includes(q) ||
                    e.calculation.supplyType.toLowerCase().includes(q)
            );
        },
        [history]
    );

    const getFavorites = useCallback(() => history.filter((e) => e.isFavorite), [history]);

    const getStatistics = useCallback(() => {
        const totalEntries = history.length;
        const favoriteCount = history.filter((e) => e.isFavorite).length;
        const totalBaseAmount = history.reduce((acc, e) => acc + (e.calculation?.baseAmount || 0), 0);
        const totalTax = history.reduce((acc, e) => acc + (e.calculation?.totalTax || 0), 0);
        const avgGSTRate = totalEntries > 0
            ? history.reduce((acc, e) => acc + (e.calculation?.gstRate || 0), 0) / totalEntries
            : 0;

        const modeUsage = history.reduce(
            (acc, e) => {
                const mode = e.calculation?.mode;
                if (mode) {
                    acc[mode] = (acc[mode] || 0) + 1;
                }
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            totalEntries,
            favoriteCount,
            totalBaseAmount,
            totalTax,
            avgGSTRate,
            modeUsage,
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