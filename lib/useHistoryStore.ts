//lib/useHistoryStore.ts
import { useState, useEffect, useMemo } from "react";
import { logger } from "@/lib/logger";

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

  const [rawItems, setRawItems] = useState<any[]>(() => {
    // During SSR, we cannot access localStorage, so we return the initial value (empty array).
    // On the client, we will update this in the useEffect below.
    return [];
  });

  // Hydrate from localStorage on the client.
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      const parsed = parseStored<any[]>(item, key);
      if (parsed === null) {
        // Corrupt data - use default
        const defaultValue: any[] = []; // initial value for rawItems is empty array
        const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
        try {
          window.localStorage.setItem(key, wrapped);
        } catch (writeError) {
          if (process.env.NODE_ENV !== "production") {
            logger.warn(`Failed to write default value to localStorage:`, writeError);
          }
        }
        setRawItems(defaultValue);
        return;
      }

      if (parsed.isNew) {
        // Brand new key - no warning needed
        const defaultValue: any[] = []; // initial value for rawItems is empty array
        const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
        try {
          window.localStorage.setItem(key, wrapped);
        } catch (writeError) {
          if (process.env.NODE_ENV !== "production") {
            logger.warn(`Failed to write default value to localStorage:`, writeError);
          }
        }
        setRawItems(defaultValue);
        return;
      }

      // Migrate if needed
      const migratedData = migrateData<any[]>(parsed, [], key); // default rawItems is empty array
      setRawItems(migratedData);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        logger.warn(`Error reading localStorage key "${key}":`, error);
      }
      setRawItems([]);
    }
  }, [key]);

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

// Helper for parsing stored data (copied from useLocalStorage.ts)
const CURRENT_VERSION = 1;

interface StorageChangeDetail {
  key: string;
  newValue: string | null;
}

function parseStored<T>(
  item: string | null,
  key: string
): { data: T; version: number; isNew: boolean } | null {
  // Distinguish between new key (null) vs empty string or corrupt data
  const isNewKey = item === null;

  if (isNewKey) {
    return { data: null as any, version: -1, isNew: true };
  }

  try {
    const parsed = JSON.parse(item);
    if (typeof parsed === "object" && parsed !== null && "v" in parsed && "data" in parsed) {
      const version = Number(parsed.v);
      if (!Number.isNaN(version)) {
        return { data: parsed.data as T, version: version, isNew: false };
      }
    }
    // Legacy format: raw value (not wrapped)
    return { data: parsed as T, version: 0, isNew: false };
  } catch (error) {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
        logger.warn(`Failed to parse storage for key "${key}". Data may be corrupt.`, error);
    }
    return null;
  }
}

function migrateData<T>(parsed: { data: T; version: number }, defaultValue: T, key: string): T {
  if (parsed.version === CURRENT_VERSION) {
    return parsed.data;
  }

  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    logger.warn(
      `Migrating storage for key "${key}" from v${parsed.version} to v${CURRENT_VERSION}.`
    );
  }

  // Handle legacy version (v0) - use the data as-is
  if (parsed.version === 0) {
    return parsed.data;
  }

  // Unknown version - use default
  return defaultValue;
}
