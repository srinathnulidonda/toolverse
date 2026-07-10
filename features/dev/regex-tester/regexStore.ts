// features/dev/regex-tester/regexStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
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

// Storage wrappers
interface PatternsStorage {
    v: number;
    data: RegexPattern[];
}
interface HistoryStorage {
    v: number;
    data: HistoryEntry[];
}

// Validation functions
function validatePatterns(raw: PatternsStorage | null): RegexPattern[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: RegexPattern[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.pattern === "string" &&
            typeof item.flags === "object" &&
            typeof item.createdAt === "number" &&
            typeof item.updatedAt === "number" &&
            typeof item.favorite === "boolean"
        ) {
            valid.push(item as RegexPattern);
        }
    }
    return valid;
}

function validateHistory(raw: HistoryStorage | null): HistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: HistoryEntry[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.pattern === "string" &&
            typeof item.flags === "object" &&
            typeof item.testString === "string" &&
            typeof item.matchCount === "number" &&
            typeof item.timestamp === "number"
        ) {
            valid.push(item as HistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY) {
        return valid.slice(0, MAX_HISTORY);
    }
    return valid;
}

export function useRegexStore() {
    const [patternsRaw, setPatternsRaw] = useLocalStorage<PatternsStorage>(
        STORAGE_KEY_PATTERNS,
        { v: 1, data: [] }
    );
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEY_HISTORY,
        { v: 1, data: [] }
    );

    const patterns = useMemo(() => validatePatterns(patternsRaw), [patternsRaw]);
    const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);

    // Sync back to storage if validation changes the data
    useEffect(() => {
        if (!JSON_equal(patterns, patternsRaw?.data)) {
            setPatternsRaw({ v: 1, data: patterns });
        }
    }, [patterns, patternsRaw]);

    useEffect(() => {
        if (!JSON_equal(history, historyRaw?.data)) {
            setHistoryRaw({ v: 1, data: history });
        }
    }, [history, historyRaw]);

    const savePattern = (pattern: Omit<RegexPattern, "id" | "createdAt" | "updatedAt">) => {
        const newPattern: RegexPattern = {
            ...pattern,
            id: Date.now().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setPatternsRaw((prev) => ({
            v: 1,
            data: [...(prev?.data ?? []), newPattern]
        }));
        return newPattern;
    };

    const updatePattern = (id: string, updates: Partial<RegexPattern>) => {
        setPatternsRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(p =>
                p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
            )
        }));
    };

    const deletePattern = (id: string) => {
        setPatternsRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(p => p.id !== id)
        }));
    };

    const toggleFavorite = (id: string) => {
        setPatternsRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(p =>
                p.id === id ? { ...p, favorite: !p.favorite } : p
            )
        }));
    };

    const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
        const newEntry: HistoryEntry = {
            ...entry,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };

        setHistoryRaw((prev) => {
            // Don't add duplicates (same pattern and test string)
            const isDuplicate = (prev?.data ?? []).some(
                h => h.pattern === entry.pattern && h.testString === entry.testString
            );

            if (isDuplicate) return prev;

            const newHistory = [...(prev?.data ?? []), newEntry].slice(0, MAX_HISTORY);
            return { v: 1, data: newHistory };
        });
    };

    const clearHistory = () => {
        setHistoryRaw({ v: 1, data: [] });
    };

    const deleteHistoryEntry = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(h => h.id !== id)
        }));
    };

    const importPatterns = (newPatterns: RegexPattern[]) => {
        setPatternsRaw((prev) => ({
            v: 1,
            data: [...newPatterns, ...(prev?.data ?? [])]
        }));
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

// Helper for deep equality (since we don't have lodash)
function JSON_equal(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}