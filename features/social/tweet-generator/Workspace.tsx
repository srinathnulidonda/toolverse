// features/social/tweet-generator/Workspace.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { Tool } from "@/lib/tools";
import type {
  TweetData,
  TweetStyle,
  TweetLayout,
  ThemePreset,
  HistoryItem,
  TweetProfile,
  TweetContent,
  TweetEngagement,
} from "./ts/types";
import { THEME_PRESETS, generateDefaultAvatar } from "./ts/utils";
import TweetEditor from "./TweetEditor";
import StylePanel from "./StylePanel";
import TweetPreview from "./TweetPreview";
import HistoryPanel from "./HistoryPanel";
import PreviewFab from "./PreviewFab";
import styles from "./style/Workspace.module.css";

type PanelTab = "content" | "profile" | "style" | "history";

const PANEL_TABS: { id: PanelTab; icon: string; label: string }[] = [
  { id: "content", icon: "ti-edit", label: "Content" },
  { id: "profile", icon: "ti-user", label: "Profile" },
  { id: "style", icon: "ti-palette", label: "Style" },
  { id: "history", icon: "ti-history", label: "History" },
];

const DEFAULT_PROFILE: TweetProfile = {
  displayName: "John Doe",
  handle: "johndoe",
  avatar: "",
  verified: false,
  verifiedType: "blue",
};

const DEFAULT_CONTENT: TweetContent = {
  text: "",
  timestamp: new Date().toISOString(),
  timestampFormat: "relative",
  source: "Twitter Web App",
  showSource: true,
};

const DEFAULT_ENGAGEMENT: TweetEngagement = {
  replies: 0,
  retweets: 0,
  likes: 0,
  bookmarks: 0,
  views: 0,
  showMetrics: true,
  showViews: false,
};

const DEFAULT_STYLE: TweetStyle = {
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
};

export default function TweetGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [activeTab, setActiveTab] = useState<PanelTab>("content");
  const [layout, setLayout] = useState<TweetLayout>("single");

  const [profile, setProfile] = useState<TweetProfile>({
    ...DEFAULT_PROFILE,
    avatar: generateDefaultAvatar("John Doe"),
  });
  const [content, setContent] = useState<TweetContent>(DEFAULT_CONTENT);
  const [engagement, setEngagement] = useState<TweetEngagement>(DEFAULT_ENGAGEMENT);

  const [style, setStyle] = useState<TweetStyle>(DEFAULT_STYLE);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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

      setHistory((prev) => {
        if (prev.some((h) => h.tweetData.content.text === content.text)) {
          return prev;
        }

        return [
          {
            id: `${Date.now()}-${Math.random()}`,
            name,
            tweetData,
            style,
            timestamp: Date.now(),
            thumbnail,
          },
          ...prev,
        ].slice(0, 20);
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
      setHistory([]);
    }
  }, []);

  return (
    <div className={styles.tgwRoot}>
      <div className={styles.tgwLayoutBar} role="tablist" aria-label="Tweet layout">
        <div className={styles.tgwLayoutScroll}>
          {(["single", "quote", "thread", "reply"] as TweetLayout[]).map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={layout === l}
              className={`${styles.tgwLayoutBtn}${layout === l ? ` ${styles.active}` : ""}`}
              onClick={() => {
                setLayout(l);
                setStyle((s) => ({ ...s, layout: l }));
              }}
            >
              <i
                className={`ti ${l === "single"
                  ? "ti-message"
                  : l === "quote"
                    ? "ti-quote"
                    : l === "thread"
                      ? "ti-list"
                      : "ti-arrow-back-up"
                  }`}
                aria-hidden="true"
              />
              <span className={styles.tgwLayoutLabel}>
                {l === "single"
                  ? "Single"
                  : l === "quote"
                    ? "Quote Tweet"
                    : l === "thread"
                      ? "Thread"
                      : "Reply"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tgwWorkspace}>
        <div className={styles.tgwConfig}>
          <div className={styles.tgwPanelTabs} role="tablist">
            {PANEL_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`${styles.tgwPanelTab}${activeTab === tab.id ? ` ${styles.active}` : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`ti ${tab.icon}`} aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.id === "history" && history.length > 0 && (
                  <span className={styles.tgwBadge}>{history.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.tgwPanelBody}>
            {activeTab === "content" && (
              <TweetEditor
                layout={layout}
                content={content}
                onChange={setContent}
                engagement={engagement}
                onEngagementChange={setEngagement}
              />
            )}

            {activeTab === "profile" && (
              <TweetEditor
                layout={layout}
                content={content}
                onChange={setContent}
                engagement={engagement}
                onEngagementChange={setEngagement}
                profile={profile}
                onProfileChange={setProfile}
                showProfileEditor
              />
            )}

            {activeTab === "style" && <StylePanel style={style} onChange={setStyle} />}

            {activeTab === "history" && (
              <HistoryPanel
                items={history}
                onRestore={handleRestore}
                onDelete={(id) => setHistory((p) => p.filter((h) => h.id !== id))}
                onClear={handleClearHistory}
              />
            )}
          </div>

          <PreviewFab
            tweetData={tweetData}
            style={style}
            isOpen={mobilePreviewOpen}
            onOpen={() => setMobilePreviewOpen(true)}
            onClose={() => setMobilePreviewOpen(false)}
            onSave={saveToHistory}
          />
        </div>

        <div className={styles.tgwPreviewCol}>
          <div className={styles.tgwPreviewHeader}>
            <span className={styles.tgwPreviewEyebrow}>Preview</span>
            {hasContent && (
              <span className={styles.tgwLivePill}>
                <span className={styles.tgwLiveDot} aria-hidden="true" />
                Live
              </span>
            )}
          </div>
          <TweetPreview tweetData={tweetData} style={style} onSave={saveToHistory} />
        </div>
      </div>

      <div className={styles.tgwFooter}>
        <div className={styles.tgwFooterItem}>
          <i className="ti ti-lock" aria-hidden="true" />
          <span>Everything stays in your browser</span>
        </div>
        <div className={styles.tgwFooterItem}>
          <i className="ti ti-download" aria-hidden="true" />
          <span>Export as PNG, JPG, or SVG</span>
        </div>
        <div className={styles.tgwFooterItem}>
          <i className="ti ti-palette" aria-hidden="true" />
          <span>Fully customizable themes</span>
        </div>
      </div>
    </div>
  );
}