// features/dev/uuid-generator/uuidStore.ts

import { useState, useEffect } from "react";
import type { UuidVersion, UuidFormat, UuidCase } from "./utils";

export interface HistoryEntry {
    id: string;
    uuids: string[];
    version: UuidVersion;
    format: UuidFormat;
    case: UuidCase;
    count: number;
    timestamp: number;
    namespace?: string;
    name?: string;
}

const STORAGE_KEY = "uuid-generator-history";
const MAX_HISTORY_ENTRIES = 50;
const MAX_UUIDS_PER_ENTRY = 100;

function loadHistory(): HistoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveHistory(history: HistoryEntry[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
        // Silent fail - localStorage might be full
    }
}

export function useUuidStore() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        setHistory(loadHistory());
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveHistory(history);
        }
    }, [history]);

    const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
        setHistory((prev) => {
            // Limit UUIDs stored per entry
            const limitedUuids = entry.uuids.slice(0, MAX_UUIDS_PER_ENTRY);
            
            const newEntry: HistoryEntry = {
                ...entry,
                uuids: limitedUuids,
                id: Date.now().toString(),
                timestamp: Date.now(),
            };
            
            const newHistory = [newEntry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const removeFromHistory = (id: string) => {
        setHistory((prev) => prev.filter((h) => h.id !== id));
    };

    return {
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
    };
}