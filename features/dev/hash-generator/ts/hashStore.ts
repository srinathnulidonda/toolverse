// features/dev/hash-generator/ts/hashStore.ts
import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";
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

export function useHashStore() {
  const [settings, setSettings] = useState<HashSettings>(DEFAULT_SETTINGS);

  const historyStore = useHistoryStore<HashHistoryEntry>({
    key: "hash-generator-history",
    maxItems: settings.maxHistoryItems,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).timestamp === "number" &&
        typeof (raw as any).input === "string" &&
        ((raw as any).inputType === "text" || (raw as any).inputType === "file") &&
        ((raw as any).fileName === undefined || typeof (raw as any).fileName === "string") &&
        ((raw as any).fileSize === undefined || typeof (raw as any).fileSize === "number") &&
        Array.isArray((raw as any).results) &&
        (raw as any).results.every(
          (r: any) =>
            r &&
            typeof r === "object" &&
            typeof r.algorithm === "string" &&
            typeof r.hash === "string" &&
            typeof r.executionTime === "number"
        ) &&
        Array.isArray((raw as any).tags) &&
        (raw as any).tags.every((t: any) => typeof t === "string") &&
        typeof (raw as any).isFavorite === "boolean"
      ) {
        return raw as HashHistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HashHistoryEntry, recentItems: HashHistoryEntry[]) => {
      return recentItems.some(
        (item) =>
          item.input === newItem.input &&
          JSON.stringify(item.results.map((r) => r.algorithm)) ===
          JSON.stringify(newItem.results.map((r) => r.algorithm))
      );
    },
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const {
    history,
    addToHistory: historyAddToHistory,
    clearHistory: historyClearHistory,
    removeFromHistory: historyRemoveFromHistory,
  } = historyStore;

  const addToHistory = (entry: Omit<HashHistoryEntry, "id" | "timestamp">) => {
    if (!settings.autoSave) return;

    const newEntry: HashHistoryEntry = {
      ...entry,
      id: `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    historyAddToHistory(newEntry);
  };

  const clearHistory = () => {
    historyClearHistory();
  };

  const removeFromHistory = (id: string) => {
    historyRemoveFromHistory(id);
  };

  const toggleFavorite = (id: string) => {
    // Since we cannot directly update an item in the history store, we replace the whole list.
    const updated = history.map((entry) =>
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    );
    // Replace all items
    historyClearHistory();
    updated.forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const updateEntry = (id: string, updates: Partial<HashHistoryEntry>) => {
    const updated = history.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry));
    historyClearHistory();
    updated.forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const searchHistory = (query: string): HashHistoryEntry[] => {
    if (!query.trim()) return history;

    const lowerQuery = query.toLowerCase();
    return history.filter(
      (entry) =>
        entry.input.toLowerCase().includes(lowerQuery) ||
        (entry.fileName?.toLowerCase().includes(lowerQuery) ?? false) ||
        (entry.note?.toLowerCase().includes(lowerQuery) ?? false) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        entry.results.some(
          (result) =>
            result.hash.toLowerCase().includes(lowerQuery) ||
            result.algorithm.toLowerCase().includes(lowerQuery)
        )
    );
  };

  const getHistoryByTag = (tag: string): HashHistoryEntry[] => {
    return history.filter((entry) => entry.tags.includes(tag));
  };

  const getFavorites = (): HashHistoryEntry[] => {
    return history.filter((entry) => entry.isFavorite);
  };

  const getStatistics = () => {
    const totalEntries = history.length;
    const favoriteCount = getFavorites().length;
    const algorithmUsage = history.reduce(
      (acc, entry) => {
        entry.results.forEach((result) => {
          acc[result.algorithm] = (acc[result.algorithm] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

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
      mostUsedAlgorithm:
        Object.entries(algorithmUsage).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
    };
  };

  const updateSettings = (newSettings: Partial<HashSettings>) => {
    setSettings((prev) => ({ ...(prev ?? {}), ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportHistory = (format: "json" | "csv") => {
    if (format === "json") {
      return JSON.stringify(history, null, 2);
    } else {
      const headers = ["Timestamp", "Input", "Algorithms", "Hashes", "Tags", "Favorite", "Note"];
      const rows = history.map((entry) => [
        new Date(entry.timestamp).toISOString(),
        entry.input.substring(0, 100),
        entry.results.map((r) => r.algorithm).join(";"),
        entry.results.map((r) => r.hash).join(";"),
        entry.tags.join(";"),
        entry.isFavorite ? "Yes" : "No",
        entry.note || "",
      ]);

      return [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
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