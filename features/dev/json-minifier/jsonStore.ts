// features/dev/json-minifier/jsonStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { ProcessResult, ProcessOptions } from "./jsonEngine";

export interface JSONHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    input: string;
    result: ProcessResult;
    options: ProcessOptions;
    isFavorite: boolean;
    tags: string[];
    note?: string;
}

export interface JSONSettings {
    defaultOptions: ProcessOptions;
    autoSave: boolean;
    showAnalysis: boolean;
    showIssues: boolean;
    fontSize: "sm" | "md" | "lg";
    wordWrap: boolean;
    maxHistoryItems: number;
}

const STORAGE_KEYS = {
    history: "json-processor-history",
    settings: "json-processor-settings",
} as const;

const MAX_HISTORY_ITEMS = 50;

// Storage wrappers
interface HistoryStorage {
    v: number;
    data: JSONHistoryEntry[];
}
interface SettingsStorage {
    v: number;
    data: JSONSettings;
}

// Validation functions
function validateHistory(raw: HistoryStorage | null): JSONHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: JSONHistoryEntry[] = [];
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
            valid.push(item as JSONHistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): JSONSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return {
            defaultOptions: {
                mode: "minify",
                indentStyle: "2-spaces",
                sortKeys: false,
                sortOrder: "asc",
                removeNulls: false,
                removeEmptyStrings: false,
                removeEmptyArrays: false,
                removeEmptyObjects: false,
                escapedUnicode: false,
            },
            autoSave: true,
            showAnalysis: true,
            showIssues: true,
            fontSize: "md",
            wordWrap: true,
            maxHistoryItems: 50,
        };
    }
    // We could validate the settings object, but for simplicity we'll just return the data.
    // In a real scenario, we would define the shape of JSONSettings and validate accordingly.
    return raw.data;
}

export function useJSONStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEYS.history,
        { v: 1, data: [] }
    );
    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(
        STORAGE_KEYS.settings,
        { v: 1, data: {
            defaultOptions: {
                mode: "minify",
                indentStyle: "2-spaces",
                sortKeys: false,
                sortOrder: "asc",
                removeNulls: false,
                removeEmptyStrings: false,
                removeEmptyArrays: false,
                removeEmptyObjects: false,
                escapedUnicode: false,
            },
            autoSave: true,
            showAnalysis: true,
            showIssues: true,
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

    const addToHistory = (entry: Omit<JSONHistoryEntry, "id" | "timestamp">) => {
        // Note: autoSave is now part of settings, but we still respect it.
        if (!settings.autoSave) return;

        const newEntry: JSONHistoryEntry = {
            ...entry,
            id: `json_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistoryRaw((prev) => {
            // Check for recent duplicate
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
            data: (prev?.data ?? []).map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e)
        }));
    };

    const updateEntry = (id: string, updates: Partial<JSONHistoryEntry>) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    };

    const searchHistory = (query: string): JSONHistoryEntry[] => {
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
        const modeUsage = history.reduce((acc, e) => {
            acc[e.options.mode] = (acc[e.options.mode] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return {
            totalEntries,
            favoriteCount,
            totalSavings,
            averageSavings: totalEntries > 0 ? totalSavings / totalEntries : 0,
            modeUsage,
            mostUsedMode: Object.entries(modeUsage).sort(([,a],[,b]) => b - a)[0]?.[0] || null,
        };
    };

    const updateSettings = (updates: Partial<JSONSettings>) => {
        setSettingsRaw((prev) => ({
            v: 1,
            data: { ...(prev?.data ?? {}), ...updates }
        }));
    };

    const resetSettings = () => {
        setSettingsRaw({ v: 1, data: {
            defaultOptions: {
                mode: "minify",
                indentStyle: "2-spaces",
                sortKeys: false,
                sortOrder: "asc",
                removeNulls: false,
                removeEmptyStrings: false,
                removeEmptyArrays: false,
                removeEmptyObjects: false,
                escapedUnicode: false,
            },
            autoSave: true,
            showAnalysis: true,
            showIssues: true,
            fontSize: "md",
            wordWrap: true,
            maxHistoryItems: 50,
        } });
    };

    const exportHistory = (format: "json" | "csv") => {
        if (format === "json") {
            return JSON.stringify(history, null, 2);
        }
        const headers = ["Timestamp", "Title", "Mode", "Original", "Processed", "Savings", "Favorite"];
        const rows = history.map(e => [
            new Date(e.timestamp).toISOString(),
            e.title,
            e.options.mode,
            `${e.result.stats.original} bytes`,
            `${e.result.stats.processed} bytes`,
            `${e.result.stats.savingsPercent}%`,
            e.isFavorite ? "Yes" : "No",
        ]);
        return [headers, ...rows]
            .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    return {
        history, settings,
        addToHistory, removeFromHistory, clearHistory,
        toggleFavorite, updateEntry, searchHistory,
        getFavorites, getStatistics,
        updateSettings, resetSettings, exportHistory,
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