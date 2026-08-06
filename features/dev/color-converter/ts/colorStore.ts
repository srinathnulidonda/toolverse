// features/dev/color-converter/ts/colorStore.ts
import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";

const HISTORY_KEY = "color-converter-history";
const MAX_HISTORY_ITEMS = 50;

export interface HistoryEntry {
  id: string;
  color: string;
  format: string;
  timestamp: number;
}

export function useColorStore() {
  const historyStore = useHistoryStore<HistoryEntry>({
    key: HISTORY_KEY,
    maxItems: MAX_HISTORY_ITEMS,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).color === "string" &&
        typeof (raw as any).format === "string" &&
        typeof (raw as any).timestamp === "number"
      ) {
        return raw as HistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HistoryEntry, recentItems: HistoryEntry[]) => {
      return recentItems.some((h) => h.color.toLowerCase() === newItem.color.toLowerCase());
    },
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const {
    history,
    addToHistory: historyAddToHistory,
    clearHistory: historyClearHistory,
  } = historyStore;

  const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    historyAddToHistory(newEntry);
  };

  const clearHistory = () => {
    historyClearHistory();
  };

  const removeFromHistory = (id: string) => {
    // Since we don't have a direct remove, we filter and replace
    const updated = history.filter((entry) => entry.id !== id);
    historyClearHistory();
    updated.forEach((entry) => {
      const { id: _, timestamp: __, ...rest } = entry;
      addToHistory(rest);
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
