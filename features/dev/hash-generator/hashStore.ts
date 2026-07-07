// features/dev/hash-generator/hashStore.ts
import { useState, useEffect } from "react";
import type { HashResult, HashAlgorithm, HashFormat } from "./hashEngine";

export interface HashHistoryEntry {
    id: string;
    timestamp: number;
    input: string;
    inputType: "text" | "file";
    fileName?: string;
    fileSize?: number;
    results: HashResult[];
    tags: string[];
    isFavorite: boolean;
    note?: string;
}

export interface HashSettings {
    defaultAlgorithms: HashAlgorithm[];
    defaultFormat: HashFormat;
    autoSave: boolean;
    showDeprecatedAlgorithms: boolean;
    enableSalt: boolean;
    defaultSalt: string;
    enablePepper: boolean;
    defaultPepper: string;
    maxHistoryItems: number;
}

const STORAGE_KEYS = {
    history: "hash-generator-history",
    settings: "hash-generator-settings",
    favorites: "hash-generator-favorites",
} as const;

const DEFAULT_SETTINGS: HashSettings = {
    defaultAlgorithms: ["SHA256", "SHA512"],
    defaultFormat: "hex",
    autoSave: true,
    showDeprecatedAlgorithms: false,
    enableSalt: false,
    defaultSalt: "",
    enablePepper: false,
    defaultPepper: "",
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

export function useHashStore() {
    const [history, setHistory] = useState<HashHistoryEntry[]>([]);
    const [settings, setSettings] = useState<HashSettings>(DEFAULT_SETTINGS);
    
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

    const addToHistory = (entry: Omit<HashHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;

        const newEntry: HashHistoryEntry = {
            ...entry,
            id: `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistory(prev => {
            // Check for duplicate
            const isDuplicate = prev.some(item => 
                item.input === newEntry.input && 
                JSON.stringify(item.results.map(r => r.algorithm)) === JSON.stringify(newEntry.results.map(r => r.algorithm))
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

    const updateEntry = (id: string, updates: Partial<HashHistoryEntry>) => {
        setHistory(prev => prev.map(item => 
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const searchHistory = (query: string): HashHistoryEntry[] => {
        if (!query.trim()) return history;
        
        const lowerQuery = query.toLowerCase();
        return history.filter(entry =>
            entry.input.toLowerCase().includes(lowerQuery) ||
            entry.fileName?.toLowerCase().includes(lowerQuery) ||
            entry.note?.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            entry.results.some(result => 
                result.hash.toLowerCase().includes(lowerQuery) ||
                result.algorithm.toLowerCase().includes(lowerQuery)
            )
        );
    };

    const getHistoryByTag = (tag: string): HashHistoryEntry[] => {
        return history.filter(entry => entry.tags.includes(tag));
    };

    const getFavorites = (): HashHistoryEntry[] => {
        return history.filter(entry => entry.isFavorite);
    };

    const getStatistics = () => {
        const totalEntries = history.length;
        const favoriteCount = getFavorites().length;
        const algorithmUsage = history.reduce((acc, entry) => {
            entry.results.forEach(result => {
                acc[result.algorithm] = (acc[result.algorithm] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);
        
        const totalProcessingTime = history.reduce((acc, entry) => {
            return acc + entry.results.reduce((sum, result) => sum + result.executionTime, 0);
        }, 0);

        const averageProcessingTime = totalEntries > 0 ? totalProcessingTime / totalEntries : 0;

        return {
            totalEntries,
            favoriteCount,
            algorithmUsage,
            totalProcessingTime,
            averageProcessingTime,
            mostUsedAlgorithm: Object.entries(algorithmUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || null,
        };
    };

    const updateSettings = (newSettings: Partial<HashSettings>) => {
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
            const headers = ["Timestamp", "Input", "Algorithms", "Hashes", "Tags", "Favorite", "Note"];
            const rows = history.map(entry => [
                new Date(entry.timestamp).toISOString(),
                entry.input.substring(0, 100),
                entry.results.map(r => r.algorithm).join(";"),
                entry.results.map(r => r.hash).join(";"),
                entry.tags.join(";"),
                entry.isFavorite ? "Yes" : "No",
                entry.note || ""
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
        getHistoryByTag,
        getFavorites,
        getStatistics,
        updateSettings,
        resetSettings,
        exportHistory,
    };
}