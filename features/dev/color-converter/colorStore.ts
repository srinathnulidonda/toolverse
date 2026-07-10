// features/dev/color-converter/colorStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";

export interface HistoryEntry {
    id: string;
    color: string;
    format: string;
    timestamp: number;
}

const STORAGE_KEY = "color-converter-history";
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
            typeof item.color === "string" &&
            typeof item.format === "string" &&
            typeof item.timestamp === "number"
        ) {
            valid.push(item as HistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

export function useColorStore() {
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
                .find((h) => h.color.toLowerCase() === entry.color.toLowerCase());
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

function JSON_equal(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}