// features/dev/regex-tester/ts/regexStore.ts
import { useState, useEffect } from "react";
import { useHistoryStore } from "@/lib/useHistoryStore";
import { SAMPLE_PATTERNS, normalizeFlags, generateId } from "./utils";
import type { RegexFlags, RegexPattern } from "./utils";

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
  const [patterns, setPatterns] = useState<RegexPattern[]>([]);
  const [patternsLoaded, setPatternsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setPatternsLoaded(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(PATTERNS_KEY);
      const stored: RegexPattern[] = raw
        ? (JSON.parse(raw) as RegexPattern[]).map((p) => ({
          ...p,
          flags: normalizeFlags(p.flags),
        }))
        : [];
      const storedIds = new Set(stored.map((p) => p.id));
      const missingBuiltIns = SAMPLE_PATTERNS.filter((p) => !storedIds.has(p.id));
      setPatterns([...stored, ...missingBuiltIns]);
    } catch {
      setPatterns([...SAMPLE_PATTERNS]);
    } finally {
      setPatternsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !patternsLoaded) return;
    try {
      window.localStorage.setItem(PATTERNS_KEY, JSON.stringify(patterns));
    } catch {}
  }, [patterns, patternsLoaded]);

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

  const savePattern = (pattern: Omit<RegexPattern, "id" | "createdAt" | "updatedAt">) => {
    const newPattern: RegexPattern = {
      ...pattern,
      id: generateId(),
      isBuiltIn: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPatterns((prev) => [newPattern, ...prev]);
    return newPattern;
  };

  const updatePattern = (id: string, updates: Partial<RegexPattern>) => {
    setPatterns((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
    );
  };

  const deletePattern = (id: string) => {
    setPatterns((prev) => prev.filter((p) => !(p.id === id && !p.isBuiltIn)));
  };

  const toggleFavorite = (id: string) => {
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  };

  const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };

    historyAddToHistory(newEntry);
  };

  const clearHistory = () => {
    historyClearHistory();
  };

  const deleteHistoryEntry = (id: string) => {
    const remaining = history.filter((entry) => entry.id !== id);
    historyClearHistory();
    [...remaining].reverse().forEach((entry) => {
      historyAddToHistory(entry);
    });
  };

  const importPatterns = (newPatterns: RegexPattern[]) => {
    const sanitized: RegexPattern[] = newPatterns
      .filter(
        (p): p is RegexPattern =>
          !!p && typeof p === "object" && typeof p.pattern === "string" && typeof p.name === "string"
      )
      .map((p) => ({
        ...p,
        id: generateId(),
        isBuiltIn: false,
        flags: normalizeFlags(p.flags),
        tags: Array.isArray(p.tags) ? p.tags : [],
        category: p.category ?? "custom",
        description: p.description || "Imported regex pattern",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

    setPatterns((prev) => [...sanitized, ...prev]);
  };

  const exportPatterns = (): string => {
    return JSON.stringify(
      patterns.filter((p) => !p.isBuiltIn),
      null,
      2
    );
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