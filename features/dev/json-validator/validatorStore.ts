// features/dev/json-validator/validatorStore.ts
import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";
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

export function useValidatorStore() {
  const [settings, setSettings] = useState<ValidatorSettings>(DEFAULT_SETTINGS);

  const historyStore = useHistoryStore<ValidationHistoryEntry>({
    key: "json-validator-history",
    maxItems: settings.maxHistoryItems,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).timestamp === "number" &&
        typeof (raw as any).title === "string" &&
        typeof (raw as any).input === "string" &&
        (raw as any).result &&
        typeof (raw as any).result === "object" &&
        typeof (raw as any).result.valid === "boolean" &&
        (raw as any).options &&
        typeof (raw as any).options === "object" &&
        Array.isArray((raw as any).tags) &&
        (raw as any).tags.every((t: any) => typeof t === "string") &&
        typeof (raw as any).isFavorite === "boolean"
      ) {
        return raw as ValidationHistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: ValidationHistoryEntry, recentItems: ValidationHistoryEntry[]) => {
      return recentItems.some((item) => item.input === newItem.input);
    },
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const {
    history,
    addToHistory: historyAddToHistory,
    clearHistory: historyClearHistory,
  } = historyStore;

  const addToHistory = (entry: Omit<ValidationHistoryEntry, "id" | "timestamp">) => {
    if (!settings.autoSave) return;

    const newEntry: ValidationHistoryEntry = {
      ...entry,
      id: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    historyAddToHistory(newEntry);
  };

  const clearHistory = () => {
    historyClearHistory();
  };

  // Helper to replace the entire history list
  const replaceHistory = (newHistory: ValidationHistoryEntry[]) => {
    historyClearHistory();
    newHistory.forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const removeFromHistory = (id: string) => {
    const updated = history.filter((entry) => entry.id !== id);
    replaceHistory(updated);
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map((entry) =>
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    );
    replaceHistory(updated);
  };

  const updateEntry = (id: string, updates: Partial<ValidationHistoryEntry>) => {
    const updated = history.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry));
    replaceHistory(updated);
  };

  const searchHistory = (query: string): ValidationHistoryEntry[] => {
    if (!query.trim()) return history;

    const lowerQuery = query.toLowerCase();
    return history.filter(
      (entry) =>
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.input.toLowerCase().includes(lowerQuery) ||
        (entry.note?.toLowerCase().includes(lowerQuery) ?? false) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const getFavorites = (): ValidationHistoryEntry[] => {
    return history.filter((entry) => entry.isFavorite);
  };

  const getStatistics = () => {
    const totalEntries = history.length;
    const favoriteCount = getFavorites().length;

    const validCount = history.filter((e) => e.result.valid).length;
    const invalidCount = totalEntries - validCount;

    const modeUsage = history.reduce(
      (acc, entry) => {
        const mode = entry.options.mode;
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const avgDepth =
      totalEntries > 0
        ? history.reduce((sum, e) => sum + e.result.stats.depth, 0) / totalEntries
        : 0;

    const avgSize =
      totalEntries > 0
        ? history.reduce((sum, e) => sum + e.result.stats.size, 0) / totalEntries
        : 0;

    return {
      totalEntries,
      favoriteCount,
      validCount,
      invalidCount,
      modeUsage,
      mostUsedMode: Object.entries(modeUsage).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
      avgDepth: Math.round(avgDepth * 10) / 10,
      avgSize: Math.round(avgSize),
    };
  };

  const updateSettings = (newSettings: Partial<ValidatorSettings>) => {
    setSettings((prev) => ({ ...(prev ?? {}), ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportHistory = (format: "json" | "csv") => {
    if (format === "json") {
      return JSON.stringify(history, null, 2);
    } else {
      const headers = ["Timestamp", "Title", "Valid", "Size", "Depth", "Tags", "Favorite"];
      const rows = history.map((entry) => [
        new Date(entry.timestamp).toISOString(),
        entry.title,
        entry.result.valid ? "Yes" : "No",
        `${entry.result.stats.size ?? 0} bytes`,
        `${entry.result.stats.depth ?? 0}`,
        entry.tags.join(";"),
        entry.isFavorite ? "Yes" : "No",
      ]);

      return [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    }
  };

  const importHistory = (data: string, format: "json" | "csv") => {
    try {
      if (format === "json") {
        const imported = JSON.parse(data) as ValidationHistoryEntry[];
        // Validate each imported item
        const validImported = imported.filter((item) => {
          return (
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
            item.tags.every((t) => typeof t === "string") &&
            typeof item.isFavorite === "boolean"
          );
        });
        replaceHistory(validImported);
        return { success: true, count: validImported.length };
      }
      // CSV import not implemented for simplicity
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