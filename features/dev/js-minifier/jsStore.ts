// features/dev/js-minifier/jsStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { MinifyResult, MinifyOptions } from "./jsEngine";

export interface JSHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    input: string;
    result: MinifyResult;
    options: MinifyOptions;
    isFavorite: boolean;
    tags: string[];
    note?: string;
}

export interface JSSettings {
    defaultOptions: MinifyOptions;
    autoSave: boolean;
    showAnalysis: boolean;
    showLinting: boolean;
    fontSize: "sm" | "md" | "lg";
    wordWrap: boolean;
    maxHistoryItems: number;
}

const STORAGE_KEYS = {
    history: "js-minifier-history",
    settings: "js-minifier-settings",
} as const;

const MAX_HISTORY_ITEMS = 50;

// Storage wrappers
interface HistoryStorage {
    v: number;
    data: JSHistoryEntry[];
}
interface SettingsStorage {
    v: number;
    data: JSSettings;
}

// Validation functions
function validateHistory(raw: HistoryStorage | null): JSHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: JSHistoryEntry[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.title === "string" &&
            typeof item.input === "string" &&
            item.result &&
            typeof item.result === "object" &&
            item.options &&
            typeof item.options === "object" &&
            Array.isArray(item.tags) &&
            typeof item.isFavorite === "boolean"
        ) {
            valid.push(item as JSHistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): JSSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return {
            defaultOptions: {
                mode: "minify",
                removeComments: true,
                removeConsole: false,
                removeDebugger: true,
                collapseWhitespace: true,
                semicolons: true,
                quoteStyle: "auto",
                mangle: false,
                deadCodeElimination: false,
                inlineShortFunctions: false,
            },
            autoSave: true,
            showAnalysis: true,
            showLinting: true,
            fontSize: "md",
            wordWrap: true,
            maxHistoryItems: 50,
        };
    }
    // We could validate the settings object, but for simplicity we'll just return the data.
    // In a real scenario, we would define the shape of JSSettings and validate accordingly.
    return raw.data;
}

export function useJSStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEYS.history,
        { v: 1, data: [] }
    );
    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(
        STORAGE_KEYS.settings,
        { v: 1, data: {
            defaultOptions: {
                mode: "minify",
                removeComments: true,
                removeConsole: false,
                removeDebugger: true,
                collapseWhitespace: true,
                semicolons: true,
                quoteStyle: "auto",
                mangle: false,
                deadCodeElimination: false,
                inlineShortFunctions: false,
            },
            autoSave: true,
            showAnalysis: true,
            showLinting: true,
            fontSize: "md",
            wordWrap: true,
            maxHistoryItems: 50,
        } }
    );

    const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);
    const settings = useMemo(() => validateSettings(settingsRaw), [settingsRaw]);

    // Sync back to storage if validation changes the data
    useEffect(() => {
        if (!JSON_equal(history, historyRaw?.data)) {
            setHistoryRaw({ v: 1, data: history });
        }
    }, [history, historyRaw]);

    useEffect(() => {
        if (!JSON_equal(settings, settingsRaw?.data)) {
            setSettingsRaw({ v: 1, data: settings });
        }
    }, [settings, settingsRaw]);

    const addToHistory = (entry: Omit<JSHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;

        const newEntry: JSHistoryEntry = {
            ...entry,
            id: `js_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistoryRaw((prev) => {
            const isDuplicate = (prev?.data ?? []).slice(0, 5).some(e => e.input === newEntry.input);
            if (isDuplicate) return prev;

            const newData = [...(prev?.data ?? []), newEntry].slice(0, settings.maxHistoryItems);
            return { v: 1, data: newData };
        });
    };

    const removeFromHistory = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(e => e.id !== id)
        }));
    };

    const clearHistory = () => {
        setHistoryRaw({ v: 1, data: [] });
    };

    const toggleFavorite = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(e =>
                e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
            )
        }));
    };

    const updateEntry = (id: string, updates: Partial<JSHistoryEntry>) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(e =>
                e.id === id ? { ...e, ...updates } : e
            )
        }));
    };

    const searchHistory = (query: string): JSHistoryEntry[] => {
        if (!query.trim()) return history;

        const q = query.toLowerCase();
        return history.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.input.toLowerCase().includes(q) ||
            e.note?.toLowerCase().includes(q) ||
            e.tags.some(t => t.toLowerCase().includes(q))
        );
    };

    const getFavorites = () => history.filter(e => e.isFavorite);

    const getStatistics = () => {
        const totalEntries = history.length;
        const favoriteCount = getFavorites().length;
        const totalSavings = history.reduce((acc, e) => acc + e.result.stats.savings, 0);
        const averageSavings = totalEntries > 0 ? totalSavings / totalEntries : 0;
        const modeUsage = history.reduce((acc, e) => {
            acc[e.options.mode] = (acc[e.options.mode] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalEntries,
            favoriteCount,
            totalSavings,
            averageSavings,
            modeUsage,
            mostUsedMode: Object.entries(modeUsage).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
        };
    };

    const updateSettings = (updates: Partial<JSSettings>) => {
        setSettingsRaw((prev) => ({
            v: 1,
            data: { ...(prev?.data ?? {}), ...updates }
        }));
    };

    const resetSettings = () => {
        setSettingsRaw({ v: 1, data: {
            defaultOptions: {
                mode: "minify",
                removeComments: true,
                removeConsole: false,
                removeDebugger: true,
                collapseWhitespace: true,
                semicolons: true,
                quoteStyle: "auto",
                mangle: false,
                deadCodeElimination: false,
                inlineShortFunctions: false,
            },
            autoSave: true,
            showAnalysis: true,
            showLinting: true,
            fontSize: "md",
            wordWrap: true,
            maxHistoryItems: 50,
        } });
    };

    const exportHistory = (format: "json" | "csv") => {
        if (format === "json") return JSON.stringify(history, null, 2);

        const headers = ["Timestamp", "Title", "Mode", "Original", "Minified", "Savings", "Favorite"];
        const rows = history.map(e => [
            new Date(e.timestamp).toISOString(),
            e.title,
            e.options.mode,
            `${e.result.stats.original} bytes`,
            `${e.result.stats.minified} bytes`,
            `${e.result.stats.savingsPercent}%`,
            e.isFavorite ? "Yes" : "No",
        ]);

        return [headers, ...rows]
            .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    return {
        history,
        settings,
        addToHistory,
        removeFromHistory,
        clearHistory,
        toggleFavorite,
        updateEntry,
        searchHistory,
        getFavorites,
        getStatistics,
        updateSettings,
        resetSettings,
        exportHistory,
    };
}

// Helper for deep equality (since we don't have lodash)
function JSON_equal(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}