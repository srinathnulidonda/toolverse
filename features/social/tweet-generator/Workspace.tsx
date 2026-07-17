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
} from "./types";
import { THEME_PRESETS, generateDefaultAvatar } from "./utils";
import TweetEditor from "./TweetEditor";
import StylePanel from "./StylePanel";
import TweetPreview from "./TweetPreview";
import HistoryPanel from "./HistoryPanel";
import PreviewFab from "./PreviewFab";

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

  // Tweet data
  const [profile, setProfile] = useState<TweetProfile>({
    ...DEFAULT_PROFILE,
    avatar: generateDefaultAvatar("John Doe"),
  });
  const [content, setContent] = useState<TweetContent>(DEFAULT_CONTENT);
  const [engagement, setEngagement] = useState<TweetEngagement>(DEFAULT_ENGAGEMENT);

  // Style
  const [style, setStyle] = useState<TweetStyle>(DEFAULT_STYLE);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Mobile preview
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Compose full tweet data
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
        // Prevent duplicates
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
    <>
      <div className="tgw-root">
        {/* Layout selector */}
        <div className="tgw-layout-bar" role="tablist" aria-label="Tweet layout">
          <div className="tgw-layout-scroll">
            {(["single", "quote", "thread", "reply"] as TweetLayout[]).map((l) => (
              <button
                key={l}
                role="tab"
                aria-selected={layout === l}
                className={`tgw-layout-btn${layout === l ? " active" : ""}`}
                onClick={() => {
                  setLayout(l);
                  setStyle((s) => ({ ...s, layout: l }));
                }}
              >
                <i
                  className={`ti ${
                    l === "single"
                      ? "ti-message"
                      : l === "quote"
                        ? "ti-quote"
                        : l === "thread"
                          ? "ti-list"
                          : "ti-arrow-back-up"
                  }`}
                  aria-hidden="true"
                />
                <span className="tgw-layout-label">
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

        {/* Main workspace */}
        <div className="tgw-workspace">
          {/* Left: config panel */}
          <div className="tgw-config">
            <div className="tgw-panel-tabs" role="tablist">
              {PANEL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`tgw-panel-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.id === "history" && history.length > 0 && (
                    <span className="tgw-badge">{history.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="tgw-panel-body">
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

            {/* Mobile FAB */}
            <PreviewFab
              tweetData={tweetData}
              style={style}
              isOpen={mobilePreviewOpen}
              onOpen={() => setMobilePreviewOpen(true)}
              onClose={() => setMobilePreviewOpen(false)}
              onSave={saveToHistory}
            />
          </div>

          {/* Right: preview (desktop) */}
          <div className="tgw-preview-col">
            <div className="tgw-preview-header">
              <span className="tgw-preview-eyebrow">Preview</span>
              {hasContent && (
                <span className="tgw-live-pill">
                  <span className="tgw-live-dot" aria-hidden="true" />
                  Live
                </span>
              )}
            </div>
            <TweetPreview tweetData={tweetData} style={style} onSave={saveToHistory} />
          </div>
        </div>

        {/* Footer */}
        <div className="tgw-footer">
          <div className="tgw-footer-item">
            <i className="ti ti-lock" aria-hidden="true" />
            <span>Everything stays in your browser</span>
          </div>
          <div className="tgw-footer-item">
            <i className="ti ti-download" aria-hidden="true" />
            <span>Export as PNG, JPG, or SVG</span>
          </div>
          <div className="tgw-footer-item">
            <i className="ti ti-palette" aria-hidden="true" />
            <span>Fully customizable themes</span>
          </div>
        </div>
      </div>

      <style>{`
        .tgw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Layout bar */
        .tgw-layout-bar {
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-card);
        }
        .tgw-layout-scroll {
          display: flex;
          padding: 0 4px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .tgw-layout-scroll::-webkit-scrollbar { display: none; }

        .tgw-layout-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 16px;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          color: var(--text-tertiary);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          white-space: nowrap;
          margin-bottom: -0.5px;
          transition: color 0.15s, border-color 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .tgw-layout-btn i { font-size: 16px; flex-shrink: 0; }
        .tgw-layout-btn:hover { color: var(--text-secondary); }
        .tgw-layout-btn.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
        }

        /* Workspace */
        .tgw-workspace {
          display: grid;
          grid-template-columns: 1fr 420px;
          min-height: 600px;
          flex: 1;
        }

        /* Config panel */
        .tgw-config {
          border-right: 0.5px solid var(--border);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .tgw-panel-tabs {
          display: flex;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-shrink: 0;
        }
        .tgw-panel-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .tgw-panel-tab i { font-size: 14px; }
        .tgw-panel-tab:hover {
          color: var(--text-secondary);
          background: var(--border-faint);
        }
        .tgw-panel-tab.active {
          color: var(--text);
          background: var(--bg-card);
          box-shadow: inset 0 -2px 0 var(--brand);
        }
        .tgw-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 999px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
        }

        .tgw-panel-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          overscroll-behavior: contain;
        }

        /* Preview column */
        .tgw-preview-col {
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          padding: 0;
        }
        .tgw-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px 0;
          flex-shrink: 0;
        }
        .tgw-preview-eyebrow {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: var(--font-sans);
        }
        .tgw-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          font-size: 11px;
          font-weight: 500;
          color: var(--brand-text);
          font-family: var(--font-sans);
        }
        .tgw-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--brand);
          animation: tgw-pulse 2s ease-in-out infinite;
        }
        @keyframes tgw-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        /* Footer */
        .tgw-footer {
          display: flex;
          align-items: center;
          border-top: 0.5px solid var(--border);
          padding: 10px 20px;
          flex-wrap: wrap;
          gap: 10px 24px;
          background: var(--bg-card);
        }
        .tgw-footer-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
        .tgw-footer-item i { font-size: 12px; }

        /* Tablet */
        @media (max-width: 1024px) {
          .tgw-workspace { grid-template-columns: 1fr 360px; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .tgw-root { border-radius: 12px; }
          .tgw-workspace {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .tgw-preview-col { display: none; }
          .tgw-config { border-right: none; }
          .tgw-panel-body {
            padding: 16px;
            padding-bottom: 80px;
          }
          .tgw-layout-btn {
            padding: 10px 14px;
            font-size: 12.5px;
            min-height: 44px;
          }
          .tgw-footer { padding: 10px 16px; }
          .tgw-footer-item:not(:first-child) { display: none; }
        }

        @media (max-width: 400px) {
          .tgw-layout-label { display: none; }
          .tgw-layout-btn { padding: 10px; flex: 1; justify-content: center; }
          .tgw-panel-tab span:not(.tgw-badge) { display: none; }
          .tgw-panel-tab { padding: 12px; }
        }
      `}</style>
    </>
  );
}
