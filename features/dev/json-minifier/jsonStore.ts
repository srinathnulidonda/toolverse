// features/dev/json-minifier/jsonStore.ts
import { useState, useEffect } from "react";
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

const DEFAULT_SETTINGS: JSONSettings = {
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

function loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}

function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* quota exceeded */ }
}

export function useJSONStore() {
    const [history,  setHistory]  = useState<JSONHistoryEntry[]>([]);
    const [settings, setSettings] = useState<JSONSettings>(DEFAULT_SETTINGS);

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

    const addToHistory = (entry: Omit<JSONHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;
        const newEntry: JSONHistoryEntry = {
            ...entry,
            id: `json_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };
        setHistory(prev => {
            const isDup = prev.slice(0, 5).some(e => e.input === newEntry.input);
            if (isDup) return prev;
            return [newEntry, ...prev].slice(0, settings.maxHistoryItems);
        });
        return newEntry.id;
    };

    const removeFromHistory = (id: string) =>
        setHistory(prev => prev.filter(e => e.id !== id));

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEYS.history);
    };

    const toggleFavorite = (id: string) =>
        setHistory(prev => prev.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));

    const updateEntry = (id: string, updates: Partial<JSONHistoryEntry>) =>
        setHistory(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

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
        const totalEntries  = history.length;
        const favoriteCount = getFavorites().length;
        const totalSavings  = history.reduce((acc, e) => acc + e.result.stats.savings, 0);
        const modeUsage     = history.reduce((acc, e) => {
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

    const updateSettings = (updates: Partial<JSONSettings>) =>
        setSettings(prev => ({ ...prev, ...updates }));

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        saveToStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    };

    const exportHistory = (format: "json" | "csv") => {
        if (format === "json") return JSON.stringify(history, null, 2);
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