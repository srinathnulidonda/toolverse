// features/dev/diff-checker/diffStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { DiffResult, DiffOptions } from "./diffEngine";

export interface DiffHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    originalText: string;
    modifiedText: string;
    result: DiffResult;
    options: DiffOptions;
    fileType?: string;
    originalFilename?: string;
    modifiedFilename?: string;
}

export interface DiffBookmark {
    id: string;
    entryId: string;
    title: string;
    timestamp: number;
    lineNumber: number;
    note?: string;
}

export interface DiffSettings {
    // Assuming the original settings shape; we need to know what it is.
    // From the original code, it seems there was no settings interface defined in the file.
    // We'll have to infer from the usage. Since we don't have the original, we'll keep it as any for now.
    // But to be safe, we'll look at the original file if we can. Since we cannot read, we'll assume it's an object.
    // We'll make it generic: Record<string, any> but that's not ideal.
    // However, the original code had a settings object that was saved and loaded.
    // We'll define it as an empty interface and then we can adjust if needed.
    // Actually, looking at the original code, there was no settings interface; it was just stored as is.
    // We'll use `any` for now and then later we can fix if we get the original.
    [key: string]: any;
}

const STORAGE_KEYS = {
    history: "diff-checker-history",
    bookmarks: "diff-checker-bookmarks",
    settings: "diff-checker-settings",
};

const MAX_HISTORY_ITEMS = 100;
const MAX_BOOKMARKS = 50;

// Storage wrappers
interface HistoryStorage {
    v: number;
    data: DiffHistoryEntry[];
}
interface BookmarksStorage {
    v: number;
    data: DiffBookmark[];
}
interface SettingsStorage {
    v: number;
    data: DiffSettings;
}

// Validation functions
function validateHistory(raw: HistoryStorage | null): DiffHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: DiffHistoryEntry[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.title === "string" &&
            typeof item.originalText === "string" &&
            typeof item.modifiedText === "string" &&
            item.result &&
            typeof item.result === "object" &&
            item.options &&
            typeof item.options === "object"
        ) {
            // We could do deeper validation of result and options, but we'll trust them for now.
            valid.push(item as DiffHistoryEntry);
        }
    }
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateBookmarks(raw: BookmarksStorage | null): DiffBookmark[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: DiffBookmark[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.entryId === "string" &&
            typeof item.title === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.lineNumber === "number"
        ) {
            valid.push(item as DiffBookmark);
        }
    }
    if (valid.length > MAX_BOOKMARKS) {
        return valid.slice(0, MAX_BOOKMARKS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): DiffSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return {} as DiffSettings;
    }
    // We could validate the settings object, but for simplicity we'll just return the data.
    // In a real scenario, we would define the shape of DiffSettings and validate accordingly.
    return raw.data;
}

export function useDiffStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEYS.history,
        { v: 1, data: [] }
    );
    const [bookmarksRaw, setBookmarksRaw] = useLocalStorage<BookmarksStorage>(
        STORAGE_KEYS.bookmarks,
        { v: 1, data: [] }
    );
    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(
        STORAGE_KEYS.settings,
        { v: 1, data: {} }
    );

    const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);
    const bookmarks = useMemo(() => validateBookmarks(bookmarksRaw), [bookmarksRaw]);
    const settings = useMemo(() => validateSettings(settingsRaw), [settingsRaw]);

    // Sync back to storage if validation changes the data
    useEffect(() => {
        if (!JSON_equal(history, historyRaw?.data)) {
            setHistoryRaw({ v: 1, data: history });
        }
    }, [history, historyRaw]);

    useEffect(() => {
        if (!JSON_equal(bookmarks, bookmarksRaw?.data)) {
            setBookmarksRaw({ v: 1, data: bookmarks });
        }
    }, [bookmarks, bookmarksRaw]);

    useEffect(() => {
        if (!JSON_equal(settings, settingsRaw?.data)) {
            setSettingsRaw({ v: 1, data: settings });
        }
    }, [settings, settingsRaw]);

    const addToHistory = (entry: Omit<DiffHistoryEntry, "id" | "timestamp">) => {
        const newEntry: DiffHistoryEntry = {
            ...entry,
            id: `diff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistoryRaw((prev) => {
            // Check for recent duplicate
            const isDuplicate = (prev?.data ?? []).slice(0, 5).some(item =>
                item.originalText === newEntry.originalText &&
                item.modifiedText === newEntry.modifiedText
            );

            if (isDuplicate) return prev;

            const newData = [...(prev?.data ?? []), newEntry].slice(0, MAX_HISTORY_ITEMS);
            return { v: 1, data: newData };
        });
    };

    const removeFromHistory = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(item => item.id !== id)
        }));
    };

    const clearHistory = () => {
        setHistoryRaw({ v: 1, data: [] });
        setBookmarksRaw({ v: 1, data: [] }); // Also clear bookmarks when history is cleared
    };

    const addBookmark = (bookmark: Omit<DiffBookmark, "id" | "timestamp">) => {
        const newBookmark: DiffBookmark = {
            ...bookmark,
            id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setBookmarksRaw((prev) => {
            const newData = [...(prev?.data ?? []), newBookmark].slice(0, MAX_BOOKMARKS);
            return { v: 1, data: newData };
        });
    };

    const removeBookmark = (id: string) => {
        setBookmarksRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(b => b.id !== id)
        }));
    };

    const searchHistory = (query: string): DiffHistoryEntry[] => {
        if (!query.trim()) return history;
        const lowerQuery = query.toLowerCase();
        return history.filter(entry =>
            entry.title.toLowerCase().includes(lowerQuery) ||
            entry.originalText.toLowerCase().includes(lowerQuery) ||
            entry.modifiedText.toLowerCase().includes(lowerQuery) ||
            entry.originalFilename?.toLowerCase().includes(lowerQuery) ||
            entry.modifiedFilename?.toLowerCase().includes(lowerQuery)
        );
    };

    return {
        history,
        bookmarks,
        settings,
        addToHistory,
        removeFromHistory,
        clearHistory,
        addBookmark,
        removeBookmark,
        searchHistory
        // Note: we are not returning a setter for settings because the original didn't have one.
        // If needed, we can add an updateSettings function.
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