// features/dev/css-minifier/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import CSSPreview from "./CSSPreview";
import CSSBatch from "./CSSBatch";
import HistoryList from "@/components/shared/HistoryList";
import { useHistoryStore } from "@/lib/useHistoryStore";
import { formatBytes } from "@/utils";
import styles from "./style/Workspace.module.css";

interface HistoryEntry {
  id: string;
  input: string;
  output: string;
  timestamp: number;
  stats?: {
    original: number;
    minified: number;
    savings: number;
    savingsPercent: number;
  };
}

const formatTimestamp = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

type ViewTab = "single" | "batch" | "history";

export default function CSSMinifierWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");

  const historyStore = useHistoryStore<HistoryEntry>({
    key: "css-minifier-history",
    maxItems: 50,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).input === "string" &&
        typeof (raw as any).output === "string" &&
        typeof (raw as any).timestamp === "number" &&
        ((raw as any).stats === undefined ||
          (typeof (raw as any).stats === "object" &&
            (raw as any).stats !== null &&
            typeof (raw as any).stats.original === "number" &&
            typeof (raw as any).stats.minified === "number" &&
            typeof (raw as any).stats.savings === "number" &&
            typeof (raw as any).stats.savingsPercent === "number"))
      ) {
        return raw as HistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HistoryEntry, recentItems: HistoryEntry[]) => {
      return recentItems.some(
        (h) => h.input === newItem.input && h.output === newItem.output
      );
    },
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const { history, addToHistory, clearHistory, removeFromHistory } = historyStore;

  const VIEW_TABS = [
    { id: "single" as const, label: "Single", icon: "ti-file-code" },
    { id: "batch" as const, label: "Batch", icon: "ti-files" },
    { id: "history" as const, label: "History", icon: "ti-history" },
  ];

  return (
    <>
      <div className={styles.cmRoot}>
        {/*  Top Chrome  */}
        <div className={styles.cmChrome}>
          <div className={styles.cmChromeLeft}>
            <div className={styles.cmTitle}>
              <i className="ti ti-brand-css3" />
              CSS Minifier
            </div>
          </div>
          <div className={styles.cmChromeRight}>
            {/* No extra buttons in the chrome for now */}
          </div>
        </div>

        {/*  View Tabs  */}
        <div className={styles.cmTabsBar}>
          <nav className={styles.cmTabs} role="tablist">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`${styles.cmTab}${viewTab === tab.id ? ` ${styles.active}` : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                {tab.label}
                {typeof window !== 'undefined' && tab.id === "history" && history.length > 0 && (
                  <span className={styles.cmBadge}>{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Tab Content  */}
        <div className={styles.cmTabContent}>
          {viewTab === "single" && (
            <CSSPreview onProcess={addToHistory} />
          )}

          {viewTab === "batch" && (
            <CSSBatch onComplete={() => { }} />
          )}

          {viewTab === "history" && (
            <HistoryList<HistoryEntry>
              history={history}
              onClear={clearHistory}
              onDelete={removeFromHistory}
              onUse={(entry) => {
                setViewTab("single");
              }}
              renderItemContent={(entry) => (
                <div className="ch-item">
                  <div className="ch-item-header">
                    <div className="ch-item-info">
                      <span className="ch-item-time">{formatTimestamp(entry.timestamp)}</span>
                      {entry.stats && (
                        <span className="ch-item-savings">
                          Saved {formatBytes(entry.stats.savings)} ({entry.stats.savingsPercent}%)
                        </span>
                      )}
                    </div>
                    <div className="ch-item-actions">
                      <button
                        type="button"
                        className="ch-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(entry.output);
                        }}
                        title="Copy output"
                      >
                        <i className="ti ti-copy" />
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="ch-item-content">
                    <div className="ch-item-row">
                      <span className="ch-item-label">Input:</span>
                      <code className="ch-item-code">{entry.input}...</code>
                    </div>
                    <div className="ch-item-row">
                      <span className="ch-item-label">Output:</span>
                      <code className="ch-item-code">{entry.output}...</code>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>

        {/*  Footer  */}
        <div className={styles.cmFooter}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}
