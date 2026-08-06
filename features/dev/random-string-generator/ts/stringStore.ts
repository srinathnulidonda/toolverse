// features/dev/random-string-generator/ts/stringStore.ts
import { logger } from "@/lib/logger";
import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";
import type { GeneratorOptions, GeneratedString } from "./utils";

const HISTORY_KEY = "rsg-history";
const FAVORITES_KEY = "rsg-favorites";
const MAX_HISTORY = 100;
const MAX_FAVORITES = 50;

export function useStringStore() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const historyStore = useHistoryStore<GeneratedString>({
    key: HISTORY_KEY,
    maxItems: MAX_HISTORY,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).value === "string" &&
        typeof (raw as any).timestamp === "number" &&
        typeof (raw as any).options === "object" &&
        typeof (raw as any).entropy === "number" &&
        typeof (raw as any).strength === "string"
      ) {
        return raw as GeneratedString;
      }
      return null;
    },
    isDuplicate: (newItem: GeneratedString, recentItems: GeneratedString[]) => {
      return recentItems.some((item) => item.value === newItem.value);
    },
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const {
    history,
    addToHistory: historyAddToHistory,
    clearHistory: historyClearHistory,
  } = historyStore;

  const addToHistory = (entry: GeneratedString) => {
    // Validate entry before adding (same as before)
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof entry.id !== "string" ||
      typeof entry.value !== "string" ||
      typeof entry.timestamp !== "number" ||
      typeof entry.options !== "object" ||
      typeof entry.entropy !== "number" ||
      typeof entry.strength !== "string"
    ) {
      logger.warn("Invalid history entry:", entry);
      return;
    }

    historyAddToHistory(entry);
  };

  const clearHistory = () => {
    historyClearHistory();
  };

  const removeFromHistory = (id: string) => {
    // Since we don't have a direct remove, we filter and replace
    const updated = history.filter((item) => item.id !== id);
    historyClearHistory();
    updated.forEach((item) => {
      historyAddToHistory(item);
    });
  };

  const addToFavorites = (value: string) => {
    if (typeof value !== "string") return;
    setFavorites((prev) => {
      const unique = [...new Set([...(prev ?? []), value])];
      return unique.slice(0, MAX_FAVORITES);
    });
  };

  const removeFromFavorites = (value: string) => {
    setFavorites((prev) => (prev ?? []).filter((f) => f !== value));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const isFavorite = (value: string) => {
    return (favorites ?? []).includes(value);
  };

  return {
    history,
    favorites,
    addToHistory,
    clearHistory,
    removeFromHistory,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
  };
}