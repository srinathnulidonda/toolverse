// features/dev/hash-generator/hashStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
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
} as const;

const MAX_HISTORY_ITEMS = 100;

// Storage wrappers
interface HistoryStorage {
    v: number;
    data: HashHistoryEntry[];
}
interface SettingsStorage {
    v: number;
    data: HashSettings;
}

// Validation functions
function validateHistory(raw: HistoryStorage | null): HashHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: HashHistoryEntry[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.input === "string" &&
            (item.inputType === "text" || item.inputType === "file") &&
            (item.fileName === undefined || typeof item.fileName === "string") &&
            (item.fileSize === undefined || typeof item.fileSize === "number") &&
            Array.isArray(item.results) &&
            item.results.every(r =>
                r &&
                typeof r === "object" &&
                typeof r.algorithm === "string" &&
                typeof r.hash === "string" &&
                typeof r.executionTime === "number"
            ) &&
            Array.isArray(item.tags) &&
            item.tags.every(t => typeof t === "string") &&
            typeof item.isFavorite === "boolean"
        ) {
            valid.push(item as HashHistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): HashSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return {
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
    }
    // We could validate the settings object, but for simplicity we'll just return the data.
    // In a real scenario, we would define the shape of HashSettings and validate accordingly.
    return raw.data;
}

export function useHashStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEYS.history,
        { v: 1, data: [] }
    );
    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(
        STORAGE_KEYS.settings,
        { v: 1, data: {
            defaultAlgorithms: ["SHA256", "SHA512"],
            defaultFormat: "hex",
            autoSave: true,
            showDeprecatedAlgorithms: false,
            enableSalt: false,
            defaultSalt: "",
            enablePepper: false,
            defaultPepper: "",
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

    const addToHistory = (entry: Omit<HashHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;

        const newEntry: HashHistoryEntry = {
            ...entry,
            id: `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistoryRaw((prev) => {
            // Check for duplicate
            const isDuplicate = (prev?.data ?? []).some(item =>
                item.input === newEntry.input &&
                JSON.stringify(item.results.map(r => r.algorithm)) === JSON.stringify(newEntry.results.map(r => r.algorithm))
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

    const updateEntry = (id: string, updates: Partial<HashHistoryEntry>) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        }));
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
        setSettingsRaw((prev) => ({
            v: 1,
            data: { ...(prev?.data ?? {}), ...newSettings }
        }));
    };

    const resetSettings = () => {
        setSettingsRaw({ v: 1, data: {
            defaultAlgorithms: ["SHA256", "SHA512"],
            defaultFormat: "hex",
            autoSave: true,
            showDeprecatedAlgorithms: false,
            enableSalt: false,
            defaultSalt: "",
            enablePepper: false,
            defaultPepper: "",
            maxHistoryItems: 100,
        } });
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

// Helper for deep equality (since we don't have lodash)
function JSON_equal(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}