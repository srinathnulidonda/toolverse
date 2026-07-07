// features/dev/json-validator/validatorStore.ts

import { useState, useEffect } from "react";
import type { ValidationResult, ValidationOptions } from "./validatorEngine";

export interface ValidationHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    input: string;
    result: ValidationResult;
    options: ValidationOptions;
    tags: string[];
    isFavorite: boolean;
    note?: string;
}

export interface ValidatorSettings {
    defaultOptions: ValidationOptions;
    autoSave: boolean;
    showLineNumbers: boolean;
    highlightErrors: boolean;
    maxHistoryItems: number;
    autoFormat: boolean;
}

const STORAGE_KEYS = {
    history: "json-validator-history",
    settings: "json-validator-settings",
} as const;

const DEFAULT_SETTINGS: ValidatorSettings = {
    defaultOptions: {
        mode: "standard",
        allowComments: false,
        allowTrailingCommas: false,
        allowSingleQuotes: false,
        allowUnquotedKeys: false,
        checkDuplicateKeys: true,
        maxDepth: 100,
        maxSize: 10 * 1024 * 1024,
        requireTopLevelObject: false,
    },
    autoSave: true,
    showLineNumbers: true,
    highlightErrors: true,
    maxHistoryItems: 100,
    autoFormat: false,
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
    } catch (error) {
        console.warn("Failed to save to localStorage:", error);
    }
}

export function useValidatorStore() {
    const [history, setHistory] = useState<ValidationHistoryEntry[]>([]);
    const [settings, setSettings] = useState<ValidatorSettings>(DEFAULT_SETTINGS);
    
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

    const addToHistory = (entry: Omit<ValidationHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;

        const newEntry: ValidationHistoryEntry = {
            ...entry,
            id: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    const updateEntry = (id: string, updates: Partial<ValidationHistoryEntry>) => {
        setHistory(prev => prev.map(item => 
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const searchHistory = (query: string): ValidationHistoryEntry[] => {
        if (!query.trim()) return history;
        
        const lowerQuery = query.toLowerCase();
        return history.filter(entry =>
            entry.title.toLowerCase().includes(lowerQuery) ||
            entry.input.toLowerCase().includes(lowerQuery) ||
            entry.note?.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    };

    const getFavorites = (): ValidationHistoryEntry[] => {
        return history.filter(entry => entry.isFavorite);
    };

    const getStatistics = () => {
        const totalEntries = history.length;
        const favoriteCount = getFavorites().length;
        
        const validCount = history.filter(e => e.result.valid).length;
        const invalidCount = totalEntries - validCount;
        
        const modeUsage = history.reduce((acc, entry) => {
            const mode = entry.options.mode;
            acc[mode] = (acc[mode] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const avgDepth = totalEntries > 0
            ? history.reduce((sum, e) => sum + e.result.stats.depth, 0) / totalEntries
            : 0;

        const avgSize = totalEntries > 0
            ? history.reduce((sum, e) => sum + e.result.stats.size, 0) / totalEntries
            : 0;

        return {
            totalEntries,
            favoriteCount,
            validCount,
            invalidCount,
            modeUsage,
            mostUsedMode: Object.entries(modeUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || null,
            avgDepth: Math.round(avgDepth * 10) / 10,
            avgSize: Math.round(avgSize),
        };
    };

    const updateSettings = (newSettings: Partial<ValidatorSettings>) => {
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
            const headers = ["Timestamp", "Title", "Valid", "Size", "Depth", "Tags", "Favorite"];
            const rows = history.map(entry => [
                new Date(entry.timestamp).toISOString(),
                entry.title,
                entry.result.valid ? "Yes" : "No",
                `${entry.result.stats.size} bytes`,
                String(entry.result.stats.depth),
                entry.tags.join(";"),
                entry.isFavorite ? "Yes" : "No"
            ]);
            
            return [headers, ...rows].map(row => 
                row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ).join("\n");
        }
    };

    const importHistory = (data: string, format: "json" | "csv") => {
        try {
            if (format === "json") {
                const imported = JSON.parse(data) as ValidationHistoryEntry[];
                setHistory(prev => [...imported, ...prev].slice(0, settings.maxHistoryItems));
                return { success: true, count: imported.length };
            }
            return { success: false, error: "CSV import not yet implemented" };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
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
        importHistory,
    };
}