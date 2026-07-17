// features/dev/html-formatter/htmlStore.ts
import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";
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

export function useHTMLStore() {
  const [settings, setSettings] = useState<HTMLSettings>(DEFAULT_SETTINGS);

  const historyStore = useHistoryStore<HTMLHistoryEntry>({
    key: "html-formatter-history",
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
        return raw as HTMLHistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HTMLHistoryEntry, recentItems: HTMLHistoryEntry[]) => {
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

  const addToHistory = (entry: Omit<HTMLHistoryEntry, "id" | "timestamp">) => {
    if (!settings.autoSave) return;

    const newEntry: HTMLHistoryEntry = {
      ...entry,
      id: `html_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    historyAddToHistory(newEntry);
  };

  const clearHistory = () => {
    historyClearHistory();
  };

  // Note: The following functions are not used in the Workspace but are kept for compatibility
  // with any potential future use or other components that might import this store.
  // We implement them using the historyStore's capabilities where possible.

  const removeFromHistory = (id: string) => {
    // Since we don't have a direct removeFromHistory in useHistoryStore, we need to replace the whole list.
    // However, the current useHistoryStore does not expose a removeFromHistory function.
    // We'll implement it by filtering the history and then replacing the store.
    // This is less efficient but matches the previous behavior.
    const updated = history.filter((entry) => entry.id !== id);
    historyClearHistory();
    updated.forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map((entry) =>
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    );
    historyClearHistory();
    updated.forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const updateEntry = (id: string, updates: Partial<HTMLHistoryEntry>) => {
    const updated = history.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry));
    historyClearHistory();
    updated.forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const searchHistory = (query: string): HTMLHistoryEntry[] => {
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

  const getFavorites = (): HTMLHistoryEntry[] => {
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

  const updateSettings = (newSettings: Partial<HTMLSettings>) => {
    setSettings((prev) => ({ ...(prev ?? {}), ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportHistory = (format: "json" | "csv") => {
    if (format === "json") {
      return JSON.stringify(history, null, 2);
    } else {
      const headers = ["Timestamp", "Title", "Mode", "Savings", "Tags", "Favorite"];
      const rows = history.map((entry) => [
        new Date(entry.timestamp).toISOString(),
        entry.title,
        entry.options.mode,
        `${entry.result.stats?.savings ?? 0} bytes`,
        entry.tags.join(";"),
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