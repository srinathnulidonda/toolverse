// features/dev/json-validator/validatorStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
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

const MAX_HISTORY_ITEMS = 100;

// Storage wrappers
interface HistoryStorage {
    v: number;
    data: ValidationHistoryEntry[];
}
interface SettingsStorage {
    v: number;
    data: ValidatorSettings;
}

// Validation functions
function validateHistory(raw: HistoryStorage | null): ValidationHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: ValidationHistoryEntry[] = [];
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
            typeof item.result.valid === "boolean" &&
            item.options &&
            typeof item.options === "object" &&
            Array.isArray(item.tags) &&
            item.tags.every(t => typeof t === "string") &&
            typeof item.isFavorite === "boolean"
        ) {
            valid.push(item as ValidationHistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): ValidatorSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return {
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
    }
    // We could validate the settings object, but for simplicity we'll just return the data.
    // In a real scenario, we would define the shape of ValidatorSettings and validate accordingly.
    return raw.data;
}

export function useValidatorStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEYS.history,
        { v: 1, data: [] }
    );
    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(
        STORAGE_KEYS.settings,
        { v: 1, data: {
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

    const addToHistory = (entry: Omit<ValidationHistoryEntry, "id" | "timestamp">) => {
        if (!settings.autoSave) return;

        const newEntry: ValidationHistoryEntry = {
            ...entry,
            id: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    const updateEntry = (id: string, updates: Partial<ValidationHistoryEntry>) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        }));
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
        setSettingsRaw((prev) => ({
            v: 1,
            data: { ...(prev?.data ?? {}), ...newSettings }
        }));
    };

    const resetSettings = () => {
        setSettingsRaw({ v: 1, data: {
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
        } });
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
                setHistoryRaw((prev) => ({
                    v: 1,
                    data: [...imported, ...(prev?.data ?? [])].slice(0, settings.maxHistoryItems)
                }));
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

// Helper for deep equality (since we don't have lodash)
function JSON_equal(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}