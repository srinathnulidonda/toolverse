// features/dev/regex-tester/regexStore.ts

import { useState, useEffect } from "react";
import type { RegexPattern, RegexFlags, TestCase } from "./utils";

const STORAGE_KEY_PATTERNS = "regex-patterns";
const STORAGE_KEY_HISTORY = "regex-history";
const MAX_HISTORY = 100;

export interface HistoryEntry {
    id: string;
    pattern: string;
    flags: RegexFlags;
    testString: string;
    matchCount: number;
    timestamp: number;
}

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const saveToStorage = <T,>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Silent fail
    }
};

export function useRegexStore() {
    const [patterns, setPatterns] = useState<RegexPattern[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // Load from storage on mount
    useEffect(() => {
        setPatterns(loadFromStorage(STORAGE_KEY_PATTERNS, []));
        setHistory(loadFromStorage(STORAGE_KEY_HISTORY, []));
    }, []);

    // Save patterns to storage
    useEffect(() => {
        if (patterns.length > 0) {
            saveToStorage(STORAGE_KEY_PATTERNS, patterns);
        }
    }, [patterns]);

    // Save history to storage
    useEffect(() => {
        if (history.length > 0) {
            saveToStorage(STORAGE_KEY_HISTORY, history);
        }
    }, [history]);

    const savePattern = (pattern: Omit<RegexPattern, "id" | "createdAt" | "updatedAt">) => {
        const newPattern: RegexPattern = {
            ...pattern,
            id: Date.now().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setPatterns((prev) => [newPattern, ...prev]);
        return newPattern;
    };

    const updatePattern = (id: string, updates: Partial<RegexPattern>) => {
        setPatterns((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, ...updates, updatedAt: Date.now() }
                    : p
            )
        );
    };

    const deletePattern = (id: string) => {
        setPatterns((prev) => prev.filter((p) => p.id !== id));
    };

    const toggleFavorite = (id: string) => {
        setPatterns((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, favorite: !p.favorite } : p
            )
        );
    };

    const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
        const newEntry: HistoryEntry = {
            ...entry,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };

        setHistory((prev) => {
            // Don't add duplicates (same pattern and test string)
            const isDuplicate = prev.some(
                (h) => h.pattern === entry.pattern && h.testString === entry.testString
            );

            if (isDuplicate) return prev;

            return [newEntry, ...prev].slice(0, MAX_HISTORY);
        });
    };

    const clearHistory = () => {
        setHistory([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY_HISTORY);
        }
    };

    const deleteHistoryEntry = (id: string) => {
        setHistory((prev) => prev.filter((h) => h.id !== id));
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