// features/dev/url-encoder/urlStore.ts

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

const STORAGE_KEY = "url-encoder-history";
const MAX_HISTORY = 50;

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
        // Silent fail
    }
}

export function useUrlStore() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        setHistory(loadHistory());
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveHistory(history);
        }
    }, [history]);

    const addToHistory = (entry: HistoryEntry) => {
        setHistory(prev => {
            // Check for recent duplicates
            const isDuplicate = prev.slice(0, 5).some(
                h => h.input === entry.input && h.output === entry.output
            );
            
            if (isDuplicate) return prev;
            
            return [entry, ...prev].slice(0, MAX_HISTORY);
        });
    };

    const clearHistory = () => {
        setHistory([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const removeEntry = (id: string) => {
        setHistory(prev => prev.filter(h => h.id !== id));
    };

    return {
        history,
        addToHistory,
        clearHistory,
        removeEntry
    };
}