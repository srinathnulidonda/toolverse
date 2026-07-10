// features/dev/case-converter/caseStore.ts
import { useState, useEffect, useMemo } from "react";
import type { CaseType } from "./utils";
import useLocalStorage from "@/lib/useLocalStorage";

export interface HistoryEntry {
    id: string;
    input: string;
    fromCase: CaseType | "auto";
    toCase: CaseType;
    output: string;
    timestamp: number;
}

const STORAGE_KEY = "case-converter-history";
const MAX_HISTORY_ITEMS = 50;

// Validation function for history array
function validateHistory(raw: HistoryEntry[] | null): HistoryEntry[] {
    if (!Array.isArray(raw)) return [];
    const valid: HistoryEntry[] = [];
    for (const item of raw) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.input === "string" &&
            typeof item.fromCase === "string" && // Actually it's a union but we trust
            typeof item.toCase === "string" &&
            typeof item.output === "string" &&
            typeof item.timestamp === "number"
        ) {
            valid.push(item as HistoryEntry);
        }
    }
    // Limit to max items (keeping most recent)
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

export function useCaseStore() {
    const [rawHistory, setRawHistory] = useLocalStorage<HistoryEntry[]>(
        STORAGE_KEY,
        []
    );

    const history = useMemo(() => validateHistory(rawHistory), [rawHistory]);

    // Ensure that if validation changes the array, we sync back to storage
    useEffect(() => {
        if (!JSON_equal(history, rawHistory)) {
            setRawHistory(history);
        }
    }, [history, rawHistory]);

    const addToHistory = (entry: HistoryEntry) => {
        setRawHistory((prev) => {
            // Don't add duplicates (same input/output within last 5 items)
            const recentDuplicate = (prev ?? []).slice(0, 5).find(
                (h) => h.input === entry.input && h.output === entry.output
            );
            if (recentDuplicate) return prev;

            const newHistory = [...(prev ?? []), entry].slice(
                0,
                MAX_HISTORY_ITEMS
            );
            return newHistory;
        });
    };

    const clearHistory = () => {
        setRawHistory([]);
    };

    const removeFromHistory = (id: string) => {
        setRawHistory((prev) =>
            (prev ?? []).filter((h) => h.id !== id)
        );
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