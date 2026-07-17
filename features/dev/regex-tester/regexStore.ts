import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";
import type { RegexFlags, TestCase, RegexPattern, PatternCategory } from "./utils";

const PATTERNS_KEY = "regex-patterns";
const HISTORY_KEY = "regex-history";
const MAX_HISTORY = 100;

export interface HistoryEntry {
  id: string;
  pattern: string;
  flags: RegexFlags;
  testString: string;
  matchCount: number;
  timestamp: number;
}

export function useRegexStore() {
  // Patterns storage (favorites/library) - using useState
  const [patterns, setPatterns] = useState<RegexPattern[]>([]);

  // History storage - using useHistoryStore
  const historyStore = useHistoryStore<HistoryEntry>({
    key: HISTORY_KEY,
    maxItems: MAX_HISTORY,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).pattern === "string" &&
        typeof (raw as any).flags === "object" &&
        typeof (raw as any).testString === "string" &&
        typeof (raw as any).matchCount === "number" &&
        typeof (raw as any).timestamp === "number"
      ) {
        return raw as HistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HistoryEntry, recentItems: HistoryEntry[]) => {
      return recentItems.some(
        (item) => item.pattern === newItem.pattern && item.testString === newItem.testString
      );
    },
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const {
    history,
    addToHistory: historyAddToHistory,
    clearHistory: historyClearHistory,
  } = historyStore;

  // Patterns API
  const savePattern = (pattern: Omit<RegexPattern, "id" | "createdAt" | "updatedAt">) => {
    const newPattern: RegexPattern = {
      ...pattern,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPatterns((prev) => [...prev, newPattern]);
    return newPattern;
  };

  const updatePattern = (id: string, updates: Partial<RegexPattern>) => {
    setPatterns((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
    );
  };

  const deletePattern = (id: string) => {
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  };

  // History API
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

  const deleteHistoryEntry = (id: string) => {
    // Since we don't have direct remove, we filter and replace
    const updated = history.filter((entry) => entry.id !== id);
    historyClearHistory();
    updated.forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const importPatterns = (newPatterns: RegexPattern[]) => {
    setPatterns((prev) => [...newPatterns, ...prev]);
  };

  const exportPatterns = (): string => {
    return JSON.stringify(patterns, null, 2);
  };

  return {
    patterns,
    history,
    savePattern,
    updatePattern,
    deletePattern,
    toggleFavorite,
    addToHistory,
    clearHistory,
    deleteHistoryEntry,
    importPatterns,
    exportPatterns,
  };
}