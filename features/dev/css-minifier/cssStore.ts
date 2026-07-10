// features/dev/css-minifier/cssStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";

export interface HistoryEntry {
    id: string;
    input: string;
    output: string;
    timestamp: number;
    stats?: {
        original: number;
        minified: number;
        savings: number;
        savingsPercent: number;
    };
}

const STORAGE_KEY = "css-minifier-history";
const MAX_HISTORY_ITEMS = 50;

interface HistoryEntryStorage {
    v: number;
    data: HistoryEntry[];
}

function validateHistory(raw: HistoryEntryStorage | null): HistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const version = raw.v;
    const dataArray = raw.data;
    const valid: HistoryEntry[] = [];
    for (const item of dataArray) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.input === "string" &&
            typeof item.output === "string" &&
            typeof item.timestamp === "number" &&
            (item.stats === undefined || (
                typeof item.stats === "object" &&
                item.stats !== null &&
                typeof item.stats.original === "number" &&
                typeof item.stats.minified === "number" &&
                typeof item.stats.savings === "number" &&
                typeof item.stats.savingsPercent === "number"
            ))
        ) {
            valid.push(item as HistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

export function useCSSStore() {
    const [rawHistory, setRawHistory] = useLocalStorage<HistoryEntryStorage>(
        STORAGE_KEY,
        { v: 1, data: [] }
    );

    const history = useMemo(() => validateHistory(rawHistory), [rawHistory]);

    useEffect(() => {
        if (!JSON_equal(history, rawHistory?.data)) {
            setRawHistory({ v: 1, data: history });
        }
    }, [history, rawHistory]);

    const addToHistory = (entry: HistoryEntry) => {
        setRawHistory((prev) => {
            const recentDuplicate = (prev?.data ?? [])
                .slice(0, 5)
                .find((h) => h.input === entry.input && h.output === entry.output);
            if (recentDuplicate) return prev;

            const newData = [...(prev?.data ?? []), entry].slice(
                0,
                MAX_HISTORY_ITEMS
            );
            return { v: 1, data: newData };
        });
    };

    const clearHistory = () => {
        setRawHistory({ v: 1, data: [] });
    };

    const removeFromHistory = (id: string) => {
        setRawHistory((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter((h) => h.id !== id)
        }));
    };

    return {
        history,
        addToHistory,
        clearHistory,
        removeFromHistory
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