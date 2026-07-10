// features/dev/base64-encoder/base64Store.ts
import { useState, useEffect, useMemo } from "react";
import type { Mode, EncodingOptions } from "./utils";
import useLocalStorage from "@/lib/useLocalStorage";

export interface HistoryEntry {
    id: string;
    mode: Mode;
    input: string;
    output: string;
    timestamp: number;
    options: EncodingOptions;
}

const STORAGE_KEY = "base64-history";
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
            typeof item.mode === "string" &&
            typeof item.input === "string" &&
            typeof item.output === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.options === "object" &&
            item.options !== null
        ) {
            // Optionally deeper validation of options if needed
            valid.push(item as HistoryEntry);
        }
    }
    // Limit to max items (keeping most recent)
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

export function useBase64Store() {
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

    // Note: The above effect will run after render; we could also rely on the
    // setter below to always store validated data, but this ensures that
    // if validation logic changes, we update storage accordingly.

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