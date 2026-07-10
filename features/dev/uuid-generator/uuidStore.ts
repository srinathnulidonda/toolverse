// features/dev/uuid-generator/uuidStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
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

// Storage wrapper
interface HistoryStorage {
    v: number;
    data: HistoryEntry[];
}

// Validation function
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
            Array.isArray(item.uuids) &&
            item.uuids.every(uuid => typeof uuid === "string") &&
            typeof item.version === "string" && // UuidVersion is a union, trust it
            typeof item.format === "string" && // UuidFormat is a union, trust it
            typeof item.case === "string" && // UuidCase is a union, trust it
            typeof item.count === "number" &&
            typeof item.timestamp === "number" &&
            (item.namespace === undefined || typeof item.namespace === "string") &&
            (item.name === undefined || typeof item.name === "string")
        ) {
            // Limit UUIDs stored per entry
            const limitedUuids = item.uuids.slice(0, MAX_UUIDS_PER_ENTRY);
            valid.push({
                ...item,
                uuids: limitedUuids
            } as HistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ENTRIES) {
        return valid.slice(0, MAX_HISTORY_ENTRIES);
    }
    return valid;
}

export function useUuidStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEY,
        { v: 1, data: [] }
    );

    const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);

    // Sync back to storage if validation changes the data
    useEffect(() => {
        if (!JSON_equal(history, historyRaw?.data)) {
            setHistoryRaw({ v: 1, data: history });
        }
    }, [history, historyRaw]);

    const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
        setHistoryRaw((prev) => {
            // Limit UUIDs stored per entry
            const limitedUuids = entry.uuids.slice(0, MAX_UUIDS_PER_ENTRY);
            const newEntry: HistoryEntry = {
                ...entry,
                uuids: limitedUuids,
                id: Date.now().toString(),
                timestamp: Date.now(),
            };

            const newHistory = [...(prev?.data ?? []), newEntry].slice(0, MAX_HISTORY_ENTRIES);
            return { v: 1, data: newHistory };
        });
    };

    const clearHistory = () => {
        setHistoryRaw({ v: 1, data: [] });
    };

    const removeFromHistory = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(h => h.id !== id)
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