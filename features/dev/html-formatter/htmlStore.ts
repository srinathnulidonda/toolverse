// features/dev/html-formatter/htmlStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { ProcessResult, FormattingOptions } from "./htmlEngine";

export interface HTMLHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    input: string;
    result: ProcessResult;
    options: FormattingOptions;
    tags: string[];
    isFavorite: boolean;
    note?: string;
}

export interface HTMLSettings {
    defaultOptions: FormattingOptions;
    autoSave: boolean;
    showValidation: boolean;
    enableLivePreview: boolean;
    maxHistoryItems: number;
}

const STORAGE_KEYS = {
    history: "html-formatter-history",
    settings: "html-formatter-settings",
} as const;

const MAX_HISTORY_ITEMS = 100;

// Storage wrappers
interface HistoryStorage {
    v: number;
    data: HTMLHistoryEntry[];
}
interface SettingsStorage {
    v: number;
    data: HTMLSettings;
}

// Validation functions
function validateHistory(raw: HistoryStorage | null): HTMLHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: HTMLHistoryEntry[] = [];
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
            valid.push(item as HTMLHistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): HTMLSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return {
            defaultOptions: {
                mode: "format",
                indentStyle: "2-spaces",
                lineBreakStyle: "lf",
                preserveNewlines: false,
                wrapAttributes: false,
                wrapLineLength: 120,
                sortAttributes: false,
                removeComments: false,
                removeOptionalTags: false,
                collapseWhitespace: true,
                preserveInlineElements: true,
            },
            autoSave: true,
            showValidation: true,
            enableLivePreview: false,
            maxHistoryItems: 100,
        };
    }
    // We could validate the settings object, but for simplicity we'll just return the data.
    // In a real scenario, we would define the shape of HTMLSettings and validate accordingly.
    return raw.data;
}

export function useHTMLStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEYS.history,
        { v: 1, data: [] }
    );
    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(
        STORAGE_KEYS.settings,
        { v: 1, data: {
            defaultOptions: {
                mode: "format",
                indentStyle: "2-spaces",
                lineBreakStyle: "lf",
                preserveNewlines: false,
                wrapAttributes: false,
                wrapLineLength: 120,
                sortAttributes: false,
                removeComments: false,
                removeOptionalTags: false,
                collapseWhitespace: true,
                preserveInlineElements: true,
            },
            autoSave: true,
            showValidation: true,
            enableLivePreview: false,
            maxHistoryItems: 100,
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

    const addToHistory = (entry: Omit<HTMLHistoryEntry, "id" | "timestamp">) => {
        // Note: autoSave is now part of settings, but we still respect it.
        if (!settings.autoSave) return;

        const newEntry: HTMLHistoryEntry = {
            ...entry,
            id: `html_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistoryRaw((prev) => {
            // Check for recent duplicate
            const isDuplicate = (prev?.data ?? []).slice(0, 5).some(item =>
                item.input === newEntry.input
            );

            if (isDuplicate) return prev;

            const newData = [...(prev?.data ?? []), newEntry].slice(0, settings.maxHistoryItems);
            return { v: 1, data: newData };
        });
    };

    const removeFromHistory = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(item => item.id !== id)
        }));
    };

    const clearHistory = () => {
        setHistoryRaw({ v: 1, data: [] });
    };

    const toggleFavorite = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(item =>
                item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
            )
        }));
    };

    const updateEntry = (id: string, updates: Partial<HTMLHistoryEntry>) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        }));
    };

    const searchHistory = (query: string): HTMLHistoryEntry[] => {
        if (!query.trim()) return history;

        const lowerQuery = query.toLowerCase();
        return history.filter(entry =>
            entry.title.toLowerCase().includes(lowerQuery) ||
            entry.input.toLowerCase().includes(lowerQuery) ||
            entry.note?.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    };

    const getFavorites = (): HTMLHistoryEntry[] => {
        return history.filter(entry => entry.isFavorite);
    };

    const getStatistics = () => {
        const totalEntries = history.length;
        const favoriteCount = getFavorites().length;

        const totalSavings = history.reduce((acc, entry) =>
            acc + (entry.result.stats?.savings ?? 0), 0
        );

        const averageSavings = totalEntries > 0 ? totalSavings / totalEntries : 0;

        const modeUsage = history.reduce((acc, entry) => {
            const mode = entry.options.mode;
            acc[mode] = (acc[mode] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalEntries,
            favoriteCount,
            totalSavings,
            averageSavings,
            modeUsage,
            mostUsedMode: Object.entries(modeUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || null,
        };
    };

    const updateSettings = (newSettings: Partial<HTMLSettings>) => {
        setSettingsRaw((prev) => ({
            v: 1,
            data: { ...(prev?.data ?? {}), ...newSettings }
        }));
    };

    const resetSettings = () => {
        setSettingsRaw({ v: 1, data: {
            defaultOptions: {
                mode: "format",
                indentStyle: "2-spaces",
                lineBreakStyle: "lf",
                preserveNewlines: false,
                wrapAttributes: false,
                wrapLineLength: 120,
                sortAttributes: false,
                removeComments: false,
                removeOptionalTags: false,
                collapseWhitespace: true,
                preserveInlineElements: true,
            },
            autoSave: true,
            showValidation: true,
            enableLivePreview: false,
            maxHistoryItems: 100,
        } });
    };

    const exportHistory = (format: "json" | "csv") => {
        if (format === "json") {
            return JSON.stringify(history, null, 2);
        } else {
            const headers = ["Timestamp", "Title", "Mode", "Savings", "Tags", "Favorite"];
            const rows = history.map(entry => [
                new Date(entry.timestamp).toISOString(),
                entry.title,
                entry.options.mode,
                `${entry.result.stats?.savings ?? 0} bytes`,
                entry.tags.join(";"),
                entry.isFavorite ? "Yes" : "No"
            ]);

            return [headers, ...rows].map(row =>
                row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ).join("\n");
        }
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