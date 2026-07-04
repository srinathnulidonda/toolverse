// features/dev/base64-encoder/base64Store.ts
import { useState, useEffect } from "react";
import type { Mode, EncodingOptions } from "./utils";

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

// Helper functions for localStorage
const loadHistory = (): HistoryEntry[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveHistory = (history: HistoryEntry[]) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
        // Silent fail
    }
};

export function useBase64Store() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        setHistory(loadHistory());
    }, []);

    // Save to localStorage whenever history changes
    useEffect(() => {
        if (history.length > 0) {
            saveHistory(history);
        }
    }, [history]);

    const addToHistory = (entry: HistoryEntry) => {
        setHistory((prev) => {
            // Don't add duplicates (same input/output within last 5 items)
            const recentDuplicate = prev.slice(0, 5).find(
                (h) => h.input === entry.input && h.output === entry.output
            );

            if (recentDuplicate) return prev;

            const newHistory = [entry, ...prev].slice(0, MAX_HISTORY_ITEMS);
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