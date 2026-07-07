// features/dev/random-string-generator/stringStore.ts

import { useState, useEffect } from "react";
import type { GeneratorOptions, GeneratedString } from "./utils";

const HISTORY_KEY = "rsg-history";
const FAVORITES_KEY = "rsg-favorites";
const MAX_HISTORY = 100;
const MAX_FAVORITES = 50;

// Validate that an object matches GeneratedString structure
function isValidGeneratedString(obj: any): obj is GeneratedString {
    return (
        obj &&
        typeof obj === "object" &&
        typeof obj.id === "string" &&
        typeof obj.value === "string" &&
        typeof obj.timestamp === "number" &&
        typeof obj.options === "object" &&
        typeof obj.entropy === "number" &&
        typeof obj.strength === "string"
    );
}

// Load from localStorage with validation
const loadHistory = (): GeneratedString[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (!stored) return [];
        
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        
        // Filter out invalid entries
        return parsed.filter(isValidGeneratedString);
    } catch (err) {
        console.warn("Failed to load history:", err);
        return [];
    }
};

const saveHistory = (history: GeneratedString[]) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
        console.warn("Failed to save history:", err);
    }
};

const loadFavorites = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (!stored) return [];
        
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        
        // Ensure all items are strings
        return parsed.filter(item => typeof item === "string");
    } catch (err) {
        console.warn("Failed to load favorites:", err);
        return [];
    }
};

const saveFavorites = (favorites: string[]) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (err) {
        console.warn("Failed to save favorites:", err);
    }
};

export function useStringStore() {
    const [history, setHistory] = useState<GeneratedString[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load on mount
    useEffect(() => {
        setHistory(loadHistory());
        setFavorites(loadFavorites());
    }, []);

    // Save history whenever it changes
    useEffect(() => {
        if (history.length > 0) {
            saveHistory(history);
        }
    }, [history]);

    // Save favorites whenever they change
    useEffect(() => {
        if (favorites.length > 0) {
            saveFavorites(favorites);
        }
    }, [favorites]);

    const addToHistory = (entry: GeneratedString) => {
        // Validate entry before adding
        if (!isValidGeneratedString(entry)) {
            console.warn("Invalid history entry:", entry);
            return;
        }

        setHistory(prev => {
            // Don't add exact duplicates
            const duplicate = prev.find(h => h.value === entry.value);
            if (duplicate) return prev;

            const newHistory = [entry, ...prev].slice(0, MAX_HISTORY);
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(HISTORY_KEY);
        }
    };

    const removeFromHistory = (id: string) => {
        setHistory(prev => prev.filter(h => h.id !== id));
    };

    const addToFavorites = (value: string) => {
        if (typeof value !== "string") return;
        
        setFavorites(prev => {
            if (prev.includes(value)) return prev;
            return [value, ...prev].slice(0, MAX_FAVORITES);
        });
    };

    const removeFromFavorites = (value: string) => {
        setFavorites(prev => prev.filter(f => f !== value));
    };

    const clearFavorites = () => {
        setFavorites([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(FAVORITES_KEY);
        }
    };

    const isFavorite = (value: string) => favorites.includes(value);

    return {
        history,
        favorites,
        addToHistory,
        clearHistory,
        removeFromHistory,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
        isFavorite,
    };
}