// features/social/hashtag-generator/store.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { Platform, Hashtag, HashtagSize, SavedSet } from "./types";

export interface HashtagGeneratorStore {
    //Input
text: string;
    setText: (text: string) => void;
    platform: Platform;
    setPlatform: (platform: Platform) => void;

    // Results
    hashtags: Hashtag[];
    sets: SavedSet[];
    activeSet: string | null;
    setActiveSet: (setName: string | null) => void;

    // UI
    isGenerating: boolean;
    copyFeedback: { id: string; message: string } | null;
    setCopyFeedback: (feedback: { id: string; message: string } | null) => void;

    // Actions
    generateHashtags: () => void;
    addToSet: (hashtag: string) => void;
    removeFromSet: (hashtag: string) => void;
    saveSet: (name: string) => void;
    deleteSet: (name: string) => void;
    renameSet: (oldName: string, newName: string) => void;
    copyHashtags: (hashtags: string[]) => void;
}

// Storage wrapper for sets
interface SetsStorage {
    v: number;
    data: SavedSet[];
}

// Validation function for sets
function validateSets(raw: SetsStorage | null): SavedSet[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    const valid: SavedSet[] = [];
    for (const set of raw.data) {
        if (
            set &&
            typeof set === "object" &&
            typeof set.name === "string" &&
            typeof set.id === "string" &&
            typeof set.platform === "string" &&
            typeof set.timestamp === "number" &&
            Array.isArray(set.hashtags) &&
            set.hashtags.every(tag => typeof tag === "string")
        ) {
            valid.push(set as SavedSet);
        }
    }
    return valid;
}

export function useHashtagGeneratorStore() {
    // Input
    const [text, setText] = useState<string>("");
    const [platform, setPlatform] = useState<Platform>("instagram");

    // Results
    const [hashtags, setHashtags] = useState<Hashtag[]>([]);
    const [setsRaw, setSetsRaw] = useLocalStorage<SetsStorage>("hashtag-generator-sets", { v: 1, data: [] });
    const sets = useMemo(() => validateSets(setsRaw), [setsRaw]);
    const [activeSet, setActiveSet] = useState<string | null>(null);

    // UI
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [copyFeedback, setCopyFeedback] = useState<{ id: string; message: string } | null>(null);

    // Sync back to storage if validation changes the data
    useEffect(() => {
        if (!JSON_equal(sets, setsRaw?.data)) {
            setSetsRaw({ v: 1, data: sets });
        }
    }, [sets, setsRaw]);

    // Generate hashtags based on input text and platform
    const generateHashtags = useCallback(() => {
        if (!text.trim()) {
            setHashtags([]);
            return;
        }

        setIsGenerating(true);

        // Simulate async generation
        setTimeout(() => {
            // Generate hashtags based on text
            const words = text
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 2)
                .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates

            // Base hashtags from words
            const baseTags = words.map(word => `#${word}`);

            // Platform-specific popular hashtags (simplified)
            const platformTags: Record<Platform, string[]> = {
                instagram: ["#love", "#instagood", "#photooftheday", "#fashion", "#beautiful", "#happy", "#cute", "#tbt", "#followme", "#picoftheday"],
                twitter: ["#news", "#politics", "#tech", "#sports", "#entertainment", "#breaking", "#update", "#today", "#monday", "#friday"],
                linkedin: ["#business", "#leadership", "#innovation", "#technology", "#career", "#entrepreneurship", "#marketing", "#startup", "#management", "#success"],
                facebook: ["#family", "#friends", "#photo", "#vacation", "#celebration", "#holiday", "#birthday", "#weekend", "#party", "#celebrate"],
                tiktok: ["#fyp", "#foryou", "#viral", "#trending", "#dance", "#music", "#comedy", "#beauty", "#fashion", "#DIY"],
                youtube: ["#youtube", "#vlog", "#tutorial", "#review", "#gaming", "#music", "#howto", "#education", "#funny", "#challenge"],
                pinterest: ["#diy", "#crafts", "#home", "#fashion", "#food", "#wedding", "#interiordesign", "#diydécor", "#hair", "#makeup"]
            };

            // Combine base tags with platform tags (limit to 30 total)
            const allTags = [...baseTags, ...(platformTags[platform] || [])];
            const uniqueTags = [...new Set(allTags)];
            const limitedTags = uniqueTags.slice(0, 30);

            // Convert to Hashtag objects
            const hashtagObjects: Hashtag[] = limitedTags.map(tag => ({
                tag,
                size: Math.floor(Math.random() * 100) + 1 as unknown as HashtagSize, // Random size 1-100
                estimatedReach: Math.floor(Math.random() * 100000) + 1000, // Random reach 1k-100k
                category: getHashtagCategory(tag.replace('#', ''))
            }));

            setHashtags(hashtagObjects);
            setIsGenerating(false);
        }, 500);
    }, [text, platform]);

    // Helper function to categorize hashtags
    const getHashtagCategory = (tag: string): string => {
        const categories: Record<string, string[]> = {
            fashion: ['fashion', 'style', 'outfit', 'clothes', 'model', 'beauty', 'makeup', 'hair'],
            fitness: ['fitness', 'gym', 'workout', 'exercise', 'health', 'training', 'run', 'yoga'],
            food: ['food', 'recipe', 'cooking', 'dessert', 'drink', 'meal', 'breakfast', 'lunch', 'dinner'],
            travel: ['travel', 'trip', 'vacation', 'destination', 'hotel', 'flight', 'beach', 'mountain'],
            business: ['business', 'entrepreneur', 'startup', 'marketing', 'sales', 'finance', 'leadership', 'success'],
            technology: ['tech', 'technology', 'gad', 'software', 'app', 'ai', 'coding', 'programming'],
            lifestyle: ['life', 'lifestyle', 'daily', 'home', 'family', 'friends', 'party', 'fun']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => tag.includes(keyword))) {
                return category;
            }
        }
        return 'general';
    };

    // Add hashtag to active set
    const addToSet = useCallback((hashtag: string) => {
        if (!activeSet) return;

        setSetsRaw(prev => {
            const validated = validateSets(prev);
            const setIndex = validated.findIndex(set => set.name === activeSet);
            if (setIndex === -1) return prev;

            const updatedSets = [...validated];
            const set = updatedSets[setIndex];
            if (!set.hashtags.includes(hashtag)) {
                updatedSets[setIndex] = {
                    ...set,
                    hashtags: [...set.hashtags, hashtag]
                };
            }

            return { v: 1, data: updatedSets };
        });
    }, [activeSet]);

    // Remove hashtag from active set
    const removeFromSet = useCallback((hashtag: string) => {
        if (!activeSet) return;

        setSetsRaw(prev => {
            const validated = validateSets(prev);
            const setIndex = validated.findIndex(set => set.name === activeSet);
            if (setIndex === -1) return prev;

            const updatedSets = [...validated];
            const set = updatedSets[setIndex];
            updatedSets[setIndex] = {
                ...set,
                hashtags: set.hashtags.filter(tag => tag !== hashtag)
            };

            return { v: 1, data: updatedSets };
        });
    }, [activeSet]);

    // Save current hashtags as a new set
    const saveSet = useCallback((name: string) => {
        if (!name.trim() || hashtags.length === 0) return;

        setSetsRaw(prev => {
            const validated = validateSets(prev);
            // Check if set with this name already exists
            const exists = validated.some(set => set.name === name);
            if (exists) return prev;

            const newSet: SavedSet = {
                id: `${Date.now()}-${Math.random()}`,
                name: name.trim(),
                platform,
                timestamp: Date.now(),
                hashtags: hashtags.map(tag => tag.tag)
            };

            return {
                v: 1,
                data: [...validated, newSet]
            };
        });
    }, [hashtags, platform]);

    // Delete a set
    const deleteSet = useCallback((name: string) => {
        setSetsRaw(prev => {
            const validated = validateSets(prev);
            const filtered = validated.filter(set => set.name !== name);
            return { v: 1, data: filtered };
        });

        // If we deleted the active set, clear active set
        if (activeSet === name) {
            setActiveSet(null);
        }
    }, [activeSet]);

    // Rename a set
    const renameSet = useCallback((oldName: string, newName: string) => {
        if (!newName.trim()) return;

        setSetsRaw(prev => {
            const validated = validateSets(prev);
            const setIndex = validated.findIndex(set => set.name === oldName);
            if (setIndex === -1) return prev;

            // Check if new name already exists
            const nameExists = validated.some(set => set.name === newName);
            if (nameExists) return prev;

            const updatedSets = [...validated];
            updatedSets[setIndex] = {
                ...updatedSets[setIndex],
                name: newName.trim()
            };

            return { v: 1, data: updatedSets };
        });

        // Update active set if it was renamed
        if (activeSet === oldName) {
            setActiveSet(newName.trim());
        }
    }, [activeSet]);

    // Copy hashtags to clipboard
    const copyHashtags = useCallback((hashtagsToCopy: string[]) => {
        navigator.clipboard.writeText(hashtagsToCopy.join(' ')).then(() => {
            const id = Math.random().toString(36).substr(2, 9);
            setCopyFeedback({
                id,
                message: 'Hashtags copied to clipboard!'
            });

            // Clear feedback after 2 seconds
            setTimeout(() => {
                if (copyFeedback?.id === id) {
                    setCopyFeedback(null);
                }
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            const id = Math.random().toString(36).substr(2, 9);
            setCopyFeedback({
                id,
                message: 'Failed to copy hashtags'
            });

            setTimeout(() => {
                if (copyFeedback?.id === id) {
                    setCopyFeedback(null);
                }
            }, 2000);
        });
    }, [copyFeedback]);

    return {
        // Input
        text,
        setText,
        platform,
        setPlatform,

        // Results
        hashtags,
        sets,
        activeSet,
        setActiveSet,

        // UI
        isGenerating,
        copyFeedback,
        setCopyFeedback,

        // Actions
        generateHashtags,
        addToSet,
        removeFromSet,
        saveSet,
        deleteSet,
        renameSet,
        copyHashtags
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