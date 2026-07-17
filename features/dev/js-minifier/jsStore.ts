// features/dev/js-minifier/jsStore.ts
import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";
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

export function useJSStore() {
  const [settings, setSettings] = useState<JSSettings>(DEFAULT_SETTINGS);

  const historyStore = useHistoryStore<JSHistoryEntry>({
    key: "js-minifier-history",
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
        (raw as any).options &&
        typeof (raw as any).options === "object" &&
        Array.isArray((raw as any).tags) &&
        typeof (raw as any).isFavorite === "boolean"
      ) {
        return raw as JSHistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: JSHistoryEntry, recentItems: JSHistoryEntry[]) => {
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

  const addToHistory = (entry: Omit<JSHistoryEntry, "id" | "timestamp">) => {
    if (!settings.autoSave) return;

    const newEntry: JSHistoryEntry = {
      ...entry,
      id: `js_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    historyAddToHistory(newEntry);
  };

  const clearHistory = () => {
    historyClearHistory();
  };

  // Helper to replace the entire history list
  const replaceHistory = (newHistory: JSHistoryEntry[]) => {
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

  const updateEntry = (id: string, updates: Partial<JSHistoryEntry>) => {
    const updated = history.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry));
    replaceHistory(updated);
  };

  const searchHistory = (query: string): JSHistoryEntry[] => {
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

  const getFavorites = (): JSHistoryEntry[] => {
    return history.filter((entry) => entry.isFavorite);
  };

  const getStatistics = () => {
    const totalEntries = history.length;
    const favoriteCount = getFavorites().length;
    const totalSavings = history.reduce(
      (acc, entry) => acc + (entry.result.stats?.savings ?? 0),
      0
    );
    const averageSavings = totalEntries > 0 ? totalSavings / totalEntries : 0;

    const modeUsage = history.reduce(
      (acc, entry) => {
        const mode = entry.options.mode;
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalEntries,
      favoriteCount,
      totalSavings,
      averageSavings,
      modeUsage,
      mostUsedMode: Object.entries(modeUsage).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
    };
  };

  const updateSettings = (newSettings: Partial<JSSettings>) => {
    setSettings((prev) => ({ ...(prev ?? {}), ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportHistory = (format: "json" | "csv") => {
    if (format === "json") {
      return JSON.stringify(history, null, 2);
    } else {
      const headers = ["Timestamp", "Title", "Mode", "Original", "Minified", "Savings", "Favorite"];
      const rows = history.map((entry) => [
        new Date(entry.timestamp).toISOString(),
        entry.title,
        entry.options.mode,
        `${entry.result.stats?.original ?? 0} bytes`,
        `${entry.result.stats?.minified ?? 0} bytes`,
        `${entry.result.stats?.savings ?? 0}%`,
        entry.isFavorite ? "Yes" : "No",
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
    getFavorites,
    getStatistics,
    updateSettings,
    resetSettings,
    exportHistory,
  };
}