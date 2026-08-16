// features/dev/url-encoder/ts/urlStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { Mode, EncodingOptions } from "./utils";

export interface HistoryEntry {
  id: string;
  mode: Mode;
  input: string;
  output: string;
  timestamp: number;
  options: EncodingOptions;
}

const STORAGE_KEY = "url-encoder-history";
const MAX_HISTORY = 50;

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
      typeof item.mode === "string" && // Mode is a union type, but we trust it
      typeof item.input === "string" &&
      typeof item.output === "string" &&
      typeof item.timestamp === "number" &&
      item.options &&
      typeof item.options === "object"
    ) {
      valid.push(item as HistoryEntry);
    }
  }
  if (valid.length > MAX_HISTORY) {
    return valid.slice(0, MAX_HISTORY);
  }
  return valid;
}

export function useUrlStore() {
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
      // Check for recent duplicates
      const isDuplicate = (prev?.data ?? [])
        .slice(0, 5)
        .some((h) => h.input === entry.input && h.output === entry.output);

      if (isDuplicate) return prev;

      const newHistory = [...(prev?.data ?? []), entry].slice(0, MAX_HISTORY);
      return { v: 1, data: newHistory };
    });
  };

  const clearHistory = () => {
    setHistoryRaw({ v: 1, data: [] });
  };

  const removeEntry = (id: string) => {
    setHistoryRaw((prev) => ({
      v: 1,
      data: (prev?.data ?? []).filter((h) => h.id !== id),
    }));
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeEntry,
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
