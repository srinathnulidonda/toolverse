// features/social/og-preview/Workspace.tsx
"use client";

import { useState, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import type { MetaData, HistoryItem, Template } from "./types";
import MetaInputForm from "./MetaInputForm";
import PlatformPreviews from "./PlatformPreviews";
import ValidationPanel from "./ValidationPanel";
import CodeExport from "./CodeExport";
import HistoryPanel from "./HistoryPanel";
import Templates from "./Templates";

type TabId = "input" | "validation" | "code" | "templates" | "history";

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "input", icon: "ti-edit", label: "Input" },
  { id: "validation", icon: "ti-checkup-list", label: "Validation" },
  { id: "code", icon: "ti-code", label: "Code" },
  { id: "templates", icon: "ti-template", label: "Templates" },
  { id: "history", icon: "ti-history", label: "History" },
];

const DEFAULT_META: MetaData = {
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
};

export default function OgPreviewWorkspace({ tool }: { tool: Tool }) {
  const [meta, setMeta] = useState<MetaData>(DEFAULT_META);
  const [activeTab, setActiveTab] = useState<TabId>("input");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [previewPanelOpen, setPreviewPanelOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("og-preview-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("og-preview-history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  }, [history]);

  const handleSaveToHistory = () => {
    if (!meta.title && !meta.description) return;

    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      url: meta.url,
      title: meta.title,
      description: meta.description,
      image: meta.image,
      timestamp: Date.now(),
      metadata: meta,
    };

    setHistory((prev) => [item, ...prev].slice(0, 20));
  };

  const handleRestoreFromHistory = (item: HistoryItem) => {
    setMeta(item.metadata);
    setActiveTab("input");
  };

  const handleTemplateSelect = (template: Template) => {
    setMeta((prev: MetaData) => ({ ...prev, ...template.data }));
    setActiveTab("input");
  };

  const handleClearHistory = () => {
    if (confirm("Clear all history? This cannot be undone.")) {
      setHistory([]);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all fields? This will clear your current work.")) {
      setMeta(DEFAULT_META);
    }
  };

  return (
    <>
      <div className="ogw-root">
        {/* Main workspace grid */}
        <div className="ogw-workspace">
          {/* Left panel - Input & controls */}
          <div className="ogw-left-panel">
            {/* Tab navigation */}
            <div className="ogw-tabs" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`ogw-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} aria-hidden="true" />
                  <span className="ogw-tab-label">{tab.label}</span>
                  {tab.id === "history" && history.length > 0 && (
                    <span className="ogw-tab-badge">{history.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="ogw-tab-content">
              {activeTab === "input" && (
                <MetaInputForm meta={meta} onChange={setMeta} />
              )}
              {activeTab === "validation" && <ValidationPanel meta={meta} />}
              {activeTab === "code" && <CodeExport meta={meta} />}
              {activeTab === "templates" && (
                <Templates onSelect={handleTemplateSelect} />
              )}
              {activeTab === "history" && (
                <HistoryPanel
                  items={history}
                  onRestore={handleRestoreFromHistory}
                  onDelete={(id) => setHistory((h) => h.filter((i) => i.id !== id))}
                  onClear={handleClearHistory}
                />
              )}
            </div>

            {/* Action buttons (sticky footer) */}
            <div className="ogw-actions">
              <button className="ogw-action-btn ogw-save-btn" onClick={handleSaveToHistory}>
                <i className="ti ti-bookmark" aria-hidden="true" />
                Save to History
              </button>
              <button className="ogw-action-btn ogw-reset-btn" onClick={handleReset}>
                <i className="ti ti-refresh" aria-hidden="true" />
                Reset
              </button>
              <button
                className="ogw-action-btn ogw-preview-mobile-btn"
                onClick={() => setPreviewPanelOpen(true)}
              >
                <i className="ti ti-eye" aria-hidden="true" />
                Preview
              </button>
            </div>
          </div>

          {/* Right panel - Live preview (desktop only) */}
          <div className="ogw-right-panel">
            <div className="ogw-preview-header">
              <div className="ogw-preview-title">
                <i className="ti ti-eye" aria-hidden="true" />
                Live Preview
              </div>
              {(meta.title || meta.description || meta.image) && (
                <span className="ogw-live-badge">
                  <span className="ogw-live-dot" aria-hidden="true" />
                  Live
                </span>
              )}
            </div>
            <div className="ogw-preview-body">
              <PlatformPreviews meta={meta} />
            </div>
          </div>
        </div>

        {/* Mobile preview overlay */}
        {previewPanelOpen && (
          <>
            <div
              className="ogw-preview-backdrop"
              onClick={() => setPreviewPanelOpen(false)}
              aria-hidden="true"
            />
            <div className="ogw-preview-modal">
              <div className="ogw-preview-modal-header">
                <span className="ogw-preview-modal-title">Preview</span>
                <button
                  className="ogw-preview-modal-close"
                  onClick={() => setPreviewPanelOpen(false)}
                  aria-label="Close preview"
                >
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className="ogw-preview-modal-body">
                <PlatformPreviews meta={meta} />
              </div>
            </div>
          </>
        )}

        {/* Footer info */}
        <div className="ogw-footer">
          <div className="ogw-footer-item">
            <i className="ti ti-lock" aria-hidden="true" />
            <span>100% browser-side — data never leaves your device</span>
          </div>
          <div className="ogw-footer-item">
            <i className="ti ti-refresh" aria-hidden="true" />
            <span>Live preview updates as you type</span>
          </div>
          <div className="ogw-footer-item">
            <i className="ti ti-world" aria-hidden="true" />
            <span>Test across 8+ platforms</span>
          </div>
        </div>
      </div>

      <style>{`
        .ogw-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ogw-workspace {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 16px;
          min-height: 700px;
        }

        /* ═══════════════════ LEFT PANEL ═══════════════════ */
        .ogw-left-panel {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        .ogw-tabs {
          display: flex;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .ogw-tabs::-webkit-scrollbar { display: none; }

        .ogw-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 16px;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          position: relative;
          margin-bottom: -0.5px;
        }
        .ogw-tab i { font-size: 15px; }
        .ogw-tab:hover { color: var(--text-secondary); background: var(--border-faint); }
        .ogw-tab.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
          background: var(--bg-card);
        }
        .ogw-tab-label {
          display: inline;
        }
        .ogw-tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--brand-light);
          color: var(--brand-text);
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
        }

        .ogw-tab-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          overscroll-behavior: contain;
        }

        .ogw-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
        }
        .ogw-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.12s;
        }
        .ogw-action-btn i { font-size: 15px; }
        .ogw-action-btn:hover {
          background: var(--border);
          color: var(--text);
        }
        .ogw-save-btn {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .ogw-save-btn:hover {
          background: var(--brand);
          color: white;
        }
        .ogw-preview-mobile-btn {
          display: none;
        }

        /* ═══════════════════ RIGHT PANEL ═══════════════════ */
        .ogw-right-panel {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        .ogw-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }
        .ogw-preview-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ogw-preview-title i { font-size: 16px; color: var(--text-secondary); }

        .ogw-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          color: var(--brand-text);
        }
        .ogw-live-dot {
          width: 6px;
          height: 6px;
          background: var(--brand);
          border-radius: 50%;
          animation: ogw-pulse 2s ease-in-out infinite;
        }
        @keyframes ogw-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .ogw-preview-body {
          flex: 1;
          overflow: hidden;
        }

        /* ═══════════════════ FOOTER ═══════════════════ */
        .ogw-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 24px;
          padding: 12px 20px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
        }
        .ogw-footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-tertiary);
        }
        .ogw-footer-item i { font-size: 13px; }

        /* ═══════════════════ MOBILE PREVIEW MODAL ═══════════════════ */
        .ogw-preview-backdrop {
          display: none;
        }
        .ogw-preview-modal {
          display: none;
        }

        /* ═══════════════════ TABLET ≤ 1024px ═══════════════════ */
        @media (max-width: 1024px) {
          .ogw-workspace {
            grid-template-columns: 1fr 360px;
          }
        }

        /* ═══════════════════ MOBILE ≤ 768px ═══════════════════ */
        @media (max-width: 768px) {
          .ogw-workspace {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .ogw-right-panel {
            display: none;
          }

          .ogw-actions {
            grid-template-columns: 1fr 1fr 1fr;
          }
          .ogw-preview-mobile-btn {
            display: flex;
          }

          .ogw-tab-label {
            display: none;
          }
          .ogw-tab {
            flex: 1;
            padding: 14px 8px;
          }

          /* Mobile preview modal */
          .ogw-preview-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 99;
            animation: ogw-fade-in 0.2s;
          }
          .ogw-preview-modal {
            display: flex;
            flex-direction: column;
            position: fixed;
            inset: 0;
            background: var(--bg-card);
            z-index: 100;
            animation: ogw-slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          }
          .ogw-preview-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            background: var(--bg-surface);
            border-bottom: 0.5px solid var(--border);
          }
          .ogw-preview-modal-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text);
          }
          .ogw-preview-modal-close {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-card);
            border: 0.5px solid var(--border);
            border-radius: 50%;
            color: var(--text-secondary);
            font-size: 16px;
            cursor: pointer;
          }
          .ogw-preview-modal-body {
            flex: 1;
            overflow: hidden;
          }

          @keyframes ogw-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes ogw-slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }

          .ogw-footer {
            flex-direction: column;
            gap: 8px;
          }
          .ogw-footer-item:not(:first-child) {
            display: none;
          }
        }

        /* ═══════════════════ SMALL MOBILE ≤ 480px ═══════════════════ */
        @media (max-width: 480px) {
          .ogw-tab-content {
            padding: 16px;
          }
          .ogw-actions {
            padding: 12px;
          }
          .ogw-action-btn {
            font-size: 12px;
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
}