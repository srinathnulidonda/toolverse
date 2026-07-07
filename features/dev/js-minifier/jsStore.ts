// features/dev/js-minifier/jsStore.ts
import { useState, useEffect } from "react";
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

const DEFAULT_SETTINGS: JSSettings = {
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

function loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota exceeded */ }
}

export function useJSStore() {
    const [history, setHistory] = useState<JSHistoryEntry[]>([]);
    const [settings, setSettings] = useState<JSSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        setHistory(loadFromStorage(STORAGE_KEYS.history, []));
        setSettings(loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
    }, []);

    useEffect(() => {
        if (history.length > 0) saveToStorage(STORAGE_KEYS.history, history);
    }, [history]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.settings, settings);
    }, [settings]);

    const addToHistory = (entry: Omit<JSHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;

        const newEntry: JSHistoryEntry = {
            ...entry,
            id: `js_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistory(prev => {
            const isDuplicate = prev.slice(0, 5).some(e => e.input === newEntry.input);
            if (isDuplicate) return prev;
            return [newEntry, ...prev].slice(0, settings.maxHistoryItems);
        });

        return newEntry.id;
    };

    const removeFromHistory = (id: string) => {
        setHistory(prev => prev.filter(e => e.id !== id));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEYS.history);
    };

    const toggleFavorite = (id: string) => {
        setHistory(prev => prev.map(e =>
            e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
        ));
    };

    const updateEntry = (id: string, updates: Partial<JSHistoryEntry>) => {
        setHistory(prev => prev.map(e =>
            e.id === id ? { ...e, ...updates } : e
        ));
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
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        saveToStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
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