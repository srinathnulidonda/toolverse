import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";

export interface HistoryStoreOptions<T> {
  key: string;
  maxItems?: number;
  validateItem: (raw: any) => T | null;
  isDuplicate?: (newItem: T, recentItems: T[]) => boolean;
  recentItemsCount?: number;
  serialize?: (item: T) => any;
  deserialize?: (raw: any) => T | null;
}

export interface HistoryStore<T> {
  history: T[];
  addToHistory: (item: T) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export function useHistoryStore<T extends { id: string }>(options: HistoryStoreOptions<T>): HistoryStore<T> {
  const {
    key,
    maxItems = 100,
    validateItem,
    isDuplicate,
    recentItemsCount = 5,
    serialize = (item) => item, // default identity
    deserialize = (raw) => raw, // default identity
  } = options;

  const [rawItems, setRawItems] = useLocalStorage<any[]>(key, []);

  const history = useMemo(() => {
    const valid: T[] = [];
    for (const raw of rawItems) {
      const deserialized = deserialize?.(raw) ?? raw;
      const validated = validateItem(deserialized);
      if (validated !== null) {
        valid.push(validated);
      }
    }
    if (valid.length > maxItems) {
      return valid.slice(0, maxItems);
    }
    return valid;
  }, [rawItems, validateItem, maxItems, deserialize]);

  // Sync back to storage if validation changes the array
  useEffect(() => {
    // We need to convert history back to rawItems for storage.
    const newRaw = history.map((item) => serialize?.(item) ?? item);
    if (!JSON_equal(newRaw, rawItems)) {
      setRawItems(newRaw);
    }
  }, [history, rawItems, serialize]);

  const addToHistory = (item: T) => {
    setRawItems((prev) => {
      // Convert current rawItems to history for duplicate check
      const currentHistory: T[] = [];
      for (const raw of prev) {
        const deserialized = deserialize?.(raw) ?? raw;
        const validated = validateItem(deserialized);
        if (validated !== null) {
          currentHistory.push(validated);
        }
      }

      let isDup = false;
      if (isDuplicate) {
        const recent = currentHistory.slice(0, recentItemsCount);
        isDup = isDuplicate(item, recent);
      } else {
        // Default duplicate check: if no isDuplicate provided, we skip duplicate check.
        // We can also implement a default shallow equality if needed, but we require the feature to provide it if they want deduplication.
      }

      if (isDup) {
        return prev;
      }

      const newHistory = [...currentHistory, item].slice(0, maxItems);
      const newRaw = newHistory.map((i) => serialize?.(i) ?? i);
      return newRaw;
    });
  };

  const clearHistory = () => {
    setRawItems([]);
  };

  const removeFromHistory = (id: string) => {
    setRawItems((prev) => {
      const currentHistory: T[] = [];
      for (const raw of prev) {
        const deserialized = deserialize?.(raw) ?? raw;
        const validated = validateItem(deserialized);
        if (validated !== null) {
          currentHistory.push(validated);
        }
      }

      const filteredHistory = currentHistory.filter((item) => item.id !== id);
      const newRaw = filteredHistory.map((i) => serialize?.(i) ?? i);
      return newRaw;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}

// Helper for deep equality
function JSON_equal(a: any, b: any): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}
