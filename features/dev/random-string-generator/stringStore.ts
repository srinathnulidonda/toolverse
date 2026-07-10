// features/dev/random-string-generator/stringStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { GeneratorOptions, GeneratedString } from "./utils";

const HISTORY_KEY = "rsg-history";
const FAVORITES_KEY = "rsg-favorites";
const MAX_HISTORY = 100;
const MAX_FAVORITES = 50;

// Storage wrappers
interface HistoryStorage {
    v: number;
    data: GeneratedString[];
}
interface FavoritesStorage {
    v: number;
    data: string[];
}

// Validation functions
function validateHistory(raw: HistoryStorage | null): GeneratedString[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: GeneratedString[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.value === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.options === "object" &&
            typeof item.entropy === "number" &&
            typeof item.strength === "string"
        ) {
            valid.push(item as GeneratedString);
        }
    }
    if (valid.length > MAX_HISTORY) {
        return valid.slice(0, MAX_HISTORY);
    }
    return valid;
}

function validateFavorites(raw: FavoritesStorage | null): string[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: string[] = [];
    for (const item of raw.data) {
        if (typeof item === "string") {
            valid.push(item);
        }
    }
    if (valid.length > MAX_FAVORITES) {
        return valid.slice(0, MAX_FAVORITES);
    }
    return valid;
}

export function useStringStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        HISTORY_KEY,
        { v: 1, data: [] }
    );
    const [favoritesRaw, setFavoritesRaw] = useLocalStorage<FavoritesStorage>(
        FAVORITES_KEY,
        { v: 1, data: [] }
    );

    const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);
    const favorites = useMemo(() => validateFavorites(favoritesRaw), [favoritesRaw]);

    // Sync back to storage if validation changes the data
    useEffect(() => {
        if (!JSON_equal(history, historyRaw?.data)) {
            setHistoryRaw({ v: 1, data: history });
        }
    }, [history, historyRaw]);

    useEffect(() => {
        if (!JSON_equal(favorites, favoritesRaw?.data)) {
            setFavoritesRaw({ v: 1, data: favorites });
        }
    }, [favorites, favoritesRaw]);

    const addToHistory = (entry: GeneratedString) => {
        // Validate entry before adding
        if (
            !entry ||
            typeof entry !== "object" ||
            typeof entry.id !== "string" ||
            typeof entry.value !== "string" ||
            typeof entry.timestamp !== "number" ||
            typeof entry.options !== "object" ||
            typeof entry.entropy !== "number" ||
            typeof entry.strength !== "string"
        ) {
            console.warn("Invalid history entry:", entry);
            return;
        }

        setHistoryRaw((prev) => {
            // Don't add exact duplicates
            const duplicate = (prev?.data ?? []).find(h => h.value === entry.value);
            if (duplicate) return prev;

            const newHistory = [...(prev?.data ?? []), entry].slice(0, MAX_HISTORY);
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

    const addToFavorites = (value: string) => {
        if (typeof value !== "string") return;

        setFavoritesRaw((prev) => ({
            v: 1,
            data: [...(new Set([...(prev?.data ?? []), value]))].slice(0, MAX_FAVORITES)
        }));
    };

    const removeFromFavorites = (value: string) => {
        setFavoritesRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(f => f !== value)
        }));
    };

    const clearFavorites = () => {
        setFavoritesRaw({ v: 1, data: [] });
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

// Helper for deep equality (since we don't have lodash)
function JSON_equal(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}