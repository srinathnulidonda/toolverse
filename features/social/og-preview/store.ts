// features/social/og-preview/store.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { MetaData, HistoryItem, Template } from "./types";

export interface OgPreviewStore {
    meta: MetaData;
    setMeta: (meta: MetaData) => void;
    activeTab: "input" | "validation" | "code" | "templates" | "history";
    setActiveTab: (tab: "input" | "validation" | "code" | "templates" | "history") => void;
    previewPanelOpen: boolean;
    setPreviewPanelOpen: (open: boolean) => void;
    history: HistoryItem[];
    setHistory: (history: HistoryItem[]) => void;
    handleSaveToHistory: () => void;
    handleRestoreFromHistory: (item: HistoryItem) => void;
    handleTemplateSelect: (template: Template) => void;
}

export function useOgPreviewStore() {
    const [meta, setMeta] = useState<MetaData>({
        title: "",
        description: "",
        image: "",
        url: "",
        type: "website",
        siteName: "",
        twitterCard: "summary_large_image",
        twitterSite: "",
        twitterCreator: "",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        locale: "en_US",
        author: "",
        publishedTime: "",
        modifiedTime: "",
        section: "",
        tags: [],
        articleAuthor: "",
        articleSection: "",
        articlePublishedTime: "",
        articleModifiedTime: "",
        videoUrl: "",
        videoType: "",
        videoWidth: "",
        videoHeight: "",
        audioUrl: "",
        audioType: "",
        imageAlt: "",
        imageWidth: "",
        imageHeight: "",
        imageType: "",
        keywords: "",
        canonical: "",
        robots: "",
        themeColor: "",
        favicon: "",
    });

    const [activeTab, setActiveTab] = useState<"input" | "validation" | "code" | "templates" | "history">("input");
    const [previewPanelOpen, setPreviewPanelOpen] = useState(false);

    // Storage wrapper for history
    interface HistoryStorage {
        v: number;
        data: HistoryItem[];
    }

    // Validation function for history
    function validateHistory(raw: HistoryStorage | null): HistoryItem[] {
        if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
            return [];
        }
        const valid: HistoryItem[] = [];
        for (const item of raw.data) {
            if (
                item &&
                typeof item === "object" &&
                typeof item.id === "string" &&
                typeof item.url === "string" &&
                typeof item.title === "string" &&
                typeof item.description === "string" &&
                typeof item.image === "string" &&
                typeof item.timestamp === "number" &&
                item.metadata &&
                typeof item.metadata === "object"
            ) {
                valid.push(item as HistoryItem);
            }
        }
        return valid;
    }

    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        "og-preview-history",
        { v: 1, data: [] }
    );

    const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);

    // Sync back to storage if validation changes the data
    useEffect(() => {
        if (!JSON_equal(history, historyRaw?.data)) {
            setHistoryRaw({ v: 1, data: history });
        }
    }, [history, historyRaw]);

    const handleSaveToHistory = () => {
        if (!meta.title && !meta.url) return;

        const item: HistoryItem = {
            id: `${Date.now()}-${Math.random()}`,
            url: meta.url,
            title: meta.title,
            description: meta.description,
            image: meta.image,
            timestamp: Date.now(),
            metadata: meta,
        };

        setHistoryRaw(prev => {
            const validated = validateHistory(prev);
            return { v: 1, data: [item, ...validated].slice(0, 15) }; // Keep last 15
        });
    };

    const handleRestoreFromHistory = (item: HistoryItem) => {
        setMeta(item.metadata);
        setActiveTab("input");
    };

    const handleTemplateSelect = (template: Template) => {
        // Merge template.data with current meta to ensure all properties are present
        const updatedMeta = { ...meta, ...template.data };
        setMeta(updatedMeta);
        setActiveTab("input");
    };

    return {
        meta,
        setMeta,
        activeTab,
        setActiveTab,
        previewPanelOpen,
        setPreviewPanelOpen,
        history,
        setHistory: setHistoryRaw,
        handleSaveToHistory,
        handleRestoreFromHistory,
        handleTemplateSelect
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