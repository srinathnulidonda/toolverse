// features/dev/slug-generator/ts/slugStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { SlugOptions } from "./utils";

export interface HistoryEntry {
  id: string;
  input: string;
  output: string;
  timestamp: number;
  options: SlugOptions;
}

const STORAGE_KEY = "slug-generator-history";
const MAX_HISTORY_ITEMS = 100;

// Storage wrapper
interface HistoryStorage {
  v: number;
  data: HistoryEntry[];
}

// Validation function
function validateHistory(raw: HistoryStorage | null): HistoryEntry[] {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("v" in raw) ||
    !("data" in raw) ||
    !Array.isArray(raw.data)
  ) {
    return [];
  }
  const valid: HistoryEntry[] = [];
  for (const item of raw.data) {
    if (
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.input === "string" &&
      typeof item.output === "string" &&
      typeof item.timestamp === "number" &&
      item.options &&
      typeof item.options === "object"
    ) {
      valid.push(item as HistoryEntry);
    }
  }
  if (valid.length > MAX_HISTORY_ITEMS) {
    return valid.slice(0, MAX_HISTORY_ITEMS);
  }
  return valid;
}

export function useSlugStore() {
  const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(STORAGE_KEY, {
    v: 1,
    data: [],
  });

  const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);

  // Sync back to storage if validation changes the data
  useEffect(() => {
    if (!JSON_equal(history, historyRaw?.data)) {
      setHistoryRaw({ v: 1, data: history });
    }
  }, [history, historyRaw]);

  const addToHistory = (entry: HistoryEntry) => {
    setHistoryRaw((prev) => {
      // Don't add duplicates
      const recentDuplicate = (prev?.data ?? [])
        .slice(0, 5)
        .find((h) => h.input === entry.input && h.output === entry.output);

      if (recentDuplicate) return prev;

      const newHistory = [...(prev?.data ?? []), entry].slice(0, MAX_HISTORY_ITEMS);
      return { v: 1, data: newHistory };
    });
  };

  const clearHistory = () => {
    setHistoryRaw({ v: 1, data: [] });
  };

  const removeFromHistory = (id: string) => {
    setHistoryRaw((prev) => ({
      v: 1,
      data: (prev?.data ?? []).filter((h) => h.id !== id),
    }));
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
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
