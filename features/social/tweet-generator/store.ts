// features/social/tweet-generator/store.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type {
  TweetData,
  TweetStyle,
  TweetLayout,
  ThemePreset,
  HistoryItem,
  TweetProfile,
  TweetContent,
  TweetEngagement,
} from "./types";
import { THEME_PRESETS, generateDefaultAvatar } from "./utils";

export interface TweetGeneratorStore {
  // Tabs & UI
  activeTab: "content" | "profile" | "style" | "history";
  setActiveTab: (tab: "content" | "profile" | "style" | "history") => void;
  layout: TweetLayout;
  setLayout: (layout: TweetLayout) => void;
  mobilePreviewOpen: boolean;
  setMobilePreviewOpen: (open: boolean) => void;

  // Tweet data
  profile: TweetProfile;
  setProfile: (profile: TweetProfile) => void;
  content: TweetContent;
  setContent: (content: TweetContent) => void;
  engagement: TweetEngagement;
  setEngagement: (engagement: TweetEngagement) => void;

  // Style
  style: TweetStyle;
  setStyle: (style: TweetStyle) => void;

  // History
  history: HistoryItem[];
  setHistory: (history: HistoryItem[]) => void;

  // Derived values
  tweetData: TweetData;
  hasContent: boolean;
  saveToHistory: (thumbnail: string) => void;
  handleRestore: (item: HistoryItem) => void;
  handleClearHistory: () => void;
}

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
            typeof item.name === "string" &&
            item.tweetData &&
            typeof item.tweetData === "object" &&
            typeof item.style === "object" &&
            typeof item.timestamp === "number" &&
            typeof item.thumbnail === "string"
        ) {
            valid.push(item as HistoryItem);
        }
    }
    return valid;
}

export function useTweetGeneratorStore() {
  // Tabs & UI
  const [activeTab, setActiveTab] = useState<"content" | "profile" | "style" | "history">("content");
  const [layout, setLayout] = useState<TweetLayout>("single");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState<boolean>(false);

  // Tweet data
  const [profile, setProfile] = useState<TweetProfile>({
    displayName: "John Doe",
    handle: "johndoe",
    avatar: "", // Will be set by generateDefaultAvatar in component
    verified: false,
    verifiedType: "blue",
  });

  const [content, setContent] = useState<TweetContent>({
    text: "",
    timestamp: new Date().toISOString(),
    timestampFormat: "relative",
    source: "Twitter Web App",
    showSource: true,
  });

  const [engagement, setEngagement] = useState<TweetEngagement>({
    replies: 0,
    retweets: 0,
    likes: 0,
    bookmarks: 0,
    views: 0,
    showMetrics: true,
    showViews: false,
  });

  // Style
  const [style, setStyle] = useState<TweetStyle>({
    theme: "twitter-light",
    layout: "single",
    aspectRatio: "16:9",
    fontFamily: "system",
    fontSize: 15,
    lineHeight: 1.5,
    cornerStyle: "rounded",
    showBorder: true,
    borderWidth: 1,
    borderColor: "#EFF3F4",
    shadowIntensity: 2,
    backgroundType: "solid",
    padding: 40,
    watermark: {
      enabled: false,
      text: "Made with Toolverse",
      position: "bottom-right",
      opacity: 0.3,
    },
  });

  // History
  const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
    "tweet-generator-history",
    { v: 1, data: [] }
  );

  const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);

  // Sync back to storage if validation changes the data
  useEffect(() => {
    if (!JSON_equal(history, historyRaw?.data)) {
      setHistoryRaw({ v: 1, data: history });
    }
  }, [history, historyRaw]);

  // Derived values
  const tweetData: TweetData = useMemo(
    () => ({
      profile,
      content,
      engagement,
    }),
    [profile, content, engagement]
  );

  const hasContent = content.text.trim().length > 0;

  const saveToHistory = useCallback(
    (thumbnail: string) => {
      if (!hasContent) return;

      const name = content.text.slice(0, 50) || "Untitled Tweet";

      setHistoryRaw((prev) => {
        // Prevent duplicates
        const exists = (prev?.data ?? []).some((h) => h.tweetData.content.text === content.text);
        if (exists) return prev;

        return {
          v: 1,
          data: [
            {
              id: `${Date.now()}-${Math.random()}`,
              name,
              tweetData,
              style,
              timestamp: Date.now(),
              thumbnail,
            },
            ...(prev?.data ?? []),
          ].slice(0, 20)
        };
      });
    },
    [hasContent, content.text, tweetData, style]
  );

  const handleRestore = useCallback((item: HistoryItem) => {
    setProfile(item.tweetData.profile);
    setContent(item.tweetData.content);
    setEngagement(item.tweetData.engagement);
    setStyle(item.style);
    setLayout(item.style.layout);
    setActiveTab("content");
  }, []);

  const handleClearHistory = useCallback(() => {
    if (confirm("Clear all saved tweets? This cannot be undone.")) {
      setHistoryRaw({ v: 1, data: [] });
    }
  }, []);

  return {
    // Tabs & UI
    activeTab,
    setActiveTab,
    layout,
    setLayout,
    mobilePreviewOpen,
    setMobilePreviewOpen,

    // Tweet data
    profile,
    setProfile,
    content,
    setContent,
    engagement,
    setEngagement,

    // Style
    style,
    setStyle,

    // History
    history,
    setHistory: setHistoryRaw,

    // Derived values
    tweetData,
    hasContent,
    saveToHistory,
    handleRestore,
    handleClearHistory
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