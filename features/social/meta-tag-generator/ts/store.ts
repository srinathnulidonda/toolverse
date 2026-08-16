// features/social/meta-tag-generator/ts/store.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { MetaTags, HistoryItem, Template } from "./types";

export interface MetaTagGeneratorStore {
  tags: MetaTags;
  setTags: (tags: MetaTags) => void;
  activeTab:
  "basic" | "social" | "advanced" | "preview" | "validation" | "code" | "templates" | "history";
  setActiveTab: (
    tab:
      "basic" | "social" | "advanced" | "preview" | "validation" | "code" | "templates" | "history"
  ) => void;
  mobileOutputOpen: boolean;
  setMobileOutputOpen: (open: boolean) => void;
  history: HistoryItem[];
  setHistory: (history: HistoryItem[]) => void;
  handleSaveToHistory: () => void;
  handleRestoreFromHistory: (item: HistoryItem) => void;
  handleTemplateSelect: (template: Template) => void;
  handleReset: () => void;
}

export function useMetaTagGeneratorStore() {
  const [tags, setTags] = useState<MetaTags>({
    title: "",
    description: "",
    keywords: "",
    author: "",
    viewport: "width=device-width, initial-scale=1",
    charset: "UTF-8",
    language: "en",
    canonical: "",
    baseUrl: "",
    robots: "index, follow",
    googlebot: "",
    bingbot: "",
    ogType: "website",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogImageAlt: "",
    ogImageWidth: "1200",
    ogImageHeight: "630",
    ogUrl: "",
    ogSiteName: "",
    ogLocale: "en_US",
    twitterCard: "summary_large_image",
    twitterSite: "",
    twitterCreator: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    twitterImageAlt: "",
    articlePublishedTime: "",
    articleModifiedTime: "",
    articleAuthor: "",
    articleSection: "",
    articleTag: "",
    themeColor: "",
    msapplicationTileColor: "",
    appleMobileWebAppCapable: "",
    appleMobileWebAppStatusBarStyle: "default",
    appleMobileWebAppTitle: "",
    favicon: "",
    appleTouchIcon: "",
    icon32: "",
    icon16: "",
    enableSchema: false,
    schemaType: "Article",
    schemaData: {},
  });

  const [activeTab, setActiveTab] = useState<
    "basic" | "social" | "advanced" | "preview" | "validation" | "code" | "templates" | "history"
  >("basic");
  const [mobileOutputOpen, setMobileOutputOpen] = useState(false);

  // Storage wrapper for history
  interface HistoryStorage {
    v: number;
    data: HistoryItem[];
  }

  // Validation function for history
  function validateHistory(raw: HistoryStorage | null): HistoryItem[] {
    if (
      !raw ||
      typeof raw !== "object" ||
      !("v" in raw) ||
      !("data" in raw) ||
      !Array.isArray(raw.data)
    ) {
      return [];
    }
    const valid: HistoryItem[] = [];
    for (const item of raw.data) {
      if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.description === "string" &&
        typeof item.timestamp === "number" &&
        item.tags &&
        typeof item.tags === "object"
      ) {
        valid.push(item as HistoryItem);
      }
    }
    return valid;
  }

  const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
    "meta-tag-generator-history",
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
    if (!tags.title && !tags.description) return;

    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      title: tags.title,
      description: tags.description,
      timestamp: Date.now(),
      tags,
    };

    setHistoryRaw((prev) => {
      const validated = validateHistory(prev);
      return { v: 1, data: [item, ...validated].slice(0, 15) }; // Keep last 15
    });
  };

  const handleRestoreFromHistory = (item: HistoryItem) => {
    setTags(item.tags);
    setActiveTab("basic");
  };

  const handleTemplateSelect = (template: Template) => {
    // Use the tags property from Template
    setTags(template.tags);
    setActiveTab("basic");
  };

  const handleReset = () => {
    setTags({
      title: "",
      description: "",
      keywords: "",
      author: "",
      viewport: "width=device-width, initial-scale=1",
      charset: "UTF-8",
      language: "en",
      canonical: "",
      baseUrl: "",
      robots: "index, follow",
      googlebot: "",
      bingbot: "",
      ogType: "website",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      ogImageAlt: "",
      ogImageWidth: "1200",
      ogImageHeight: "630",
      ogUrl: "",
      ogSiteName: "",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "",
      twitterCreator: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageAlt: "",
      articlePublishedTime: "",
      articleModifiedTime: "",
      articleAuthor: "",
      articleSection: "",
      articleTag: "",
      themeColor: "",
      msapplicationTileColor: "",
      appleMobileWebAppCapable: "",
      appleMobileWebAppStatusBarStyle: "default",
      appleMobileWebAppTitle: "",
      favicon: "",
      appleTouchIcon: "",
      icon32: "",
      icon16: "",
      enableSchema: false,
      schemaType: "Article",
      schemaData: {},
    });
  };

  return {
    tags,
    setTags,
    activeTab,
    setActiveTab,
    mobileOutputOpen,
    setMobileOutputOpen,
    history,
    setHistory: setHistoryRaw,
    handleSaveToHistory,
    handleRestoreFromHistory,
    handleTemplateSelect,
    handleReset,
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
