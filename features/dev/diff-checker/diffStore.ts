// features/dev/diff-checker/diffStore.ts
import { useState, useEffect } from "react";
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

const STORAGE_KEYS = {
    history: "diff-checker-history",
    bookmarks: "diff-checker-bookmarks",
    settings: "diff-checker-settings",
} as const;

const MAX_HISTORY_ITEMS = 100;
const MAX_BOOKMARKS = 50;

function loadFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Silent fail for quota exceeded
    }
}

export function useDiffStore() {
    const [history, setHistory] = useState<DiffHistoryEntry[]>([]);
    const [bookmarks, setBookmarks] = useState<DiffBookmark[]>([]);
    
    useEffect(() => {
        setHistory(loadFromStorage(STORAGE_KEYS.history, []));
        setBookmarks(loadFromStorage(STORAGE_KEYS.bookmarks, []));
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveToStorage(STORAGE_KEYS.history, history);
        }
    }, [history]);

    useEffect(() => {
        if (bookmarks.length > 0) {
            saveToStorage(STORAGE_KEYS.bookmarks, bookmarks);
        }
    }, [bookmarks]);

    const addToHistory = (entry: Omit<DiffHistoryEntry, "id" | "timestamp">) => {
        const newEntry: DiffHistoryEntry = {
            ...entry,
            id: `diff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setHistory(prev => {
            // Check for recent duplicate
            const isDuplicate = prev.slice(0, 5).some(item => 
                item.originalText === newEntry.originalText && 
                item.modifiedText === newEntry.modifiedText
            );

            if (isDuplicate) return prev;

            return [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
        });

        return newEntry.id;
    };

    const removeFromHistory = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
        // Also remove related bookmarks
        setBookmarks(prev => prev.filter(bookmark => bookmark.entryId !== id));
    };

    const clearHistory = () => {
        setHistory([]);
        setBookmarks([]);
        localStorage.removeItem(STORAGE_KEYS.history);
        localStorage.removeItem(STORAGE_KEYS.bookmarks);
    };

    const addBookmark = (bookmark: Omit<DiffBookmark, "id" | "timestamp">) => {
        const newBookmark: DiffBookmark = {
            ...bookmark,
            id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };

        setBookmarks(prev => [newBookmark, ...prev].slice(0, MAX_BOOKMARKS));
        return newBookmark.id;
    };

    const removeBookmark = (id: string) => {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
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
        addToHistory,
        removeFromHistory,
        clearHistory,
        addBookmark,
        removeBookmark,
        searchHistory,
    };
}