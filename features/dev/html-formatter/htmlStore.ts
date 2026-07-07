// features/dev/html-formatter/htmlStore.ts
import { useState, useEffect } from "react";
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

const DEFAULT_SETTINGS: HTMLSettings = {
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

function loadFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Silent fail for quota exceeded
    }
}

export function useHTMLStore() {
    const [history, setHistory] = useState<HTMLHistoryEntry[]>([]);
    const [settings, setSettings] = useState<HTMLSettings>(DEFAULT_SETTINGS);
    
    useEffect(() => {
        setHistory(loadFromStorage(STORAGE_KEYS.history, []));
        setSettings(loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveToStorage(STORAGE_KEYS.history, history);
        }
    }, [history]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.settings, settings);
    }, [settings]);

    const addToHistory = (entry: Omit<HTMLHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;

        const newEntry: HTMLHistoryEntry = {
            ...entry,
            id: `html_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistory(prev => {
            // Check for recent duplicate
            const isDuplicate = prev.slice(0, 5).some(item => 
                item.input === newEntry.input
            );

            if (isDuplicate) return prev;

            return [newEntry, ...prev].slice(0, settings.maxHistoryItems);
        });

        return newEntry.id;
    };

    const removeFromHistory = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEYS.history);
    };

    const toggleFavorite = (id: string) => {
        setHistory(prev => prev.map(item => 
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ));
    };

    const updateEntry = (id: string, updates: Partial<HTMLHistoryEntry>) => {
        setHistory(prev => prev.map(item => 
            item.id === id ? { ...item, ...updates } : item
        ));
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
            acc + entry.result.stats.savings, 0
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
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        saveToStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
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
                `${entry.result.stats.savings} bytes`,
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