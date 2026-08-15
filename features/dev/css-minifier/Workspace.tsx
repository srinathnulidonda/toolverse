// features/dev/css-minifier/Workspace.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import CSSPreview from "./CSSPreview";
import CSSBatch from "./CSSBatch";
import HistoryList from "@/components/shared/HistoryList";
import { useHistoryStore } from "@/lib/useHistoryStore";
import { formatBytes } from "@/utils";
import type { CSSHistoryEntry } from "./ts/utils";
import styles from "./style/Workspace.module.css";

const formatTimestamp = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const previewText = (text: string, max = 160) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

type ViewTab = "single" | "batch" | "history";

const VIEW_TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "single", label: "Single", icon: "ti-file-code" },
  { id: "batch", label: "Batch", icon: "ti-files" },
  { id: "history", label: "History", icon: "ti-history" },
];

export default function CSSMinifierWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [mounted, setMounted] = useState(false);
  const [presetInput, setPresetInput] = useState("");
  const [presetKey, setPresetKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const historyStore = useHistoryStore<CSSHistoryEntry>({
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
        return raw as CSSHistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem, recentItems) =>
      recentItems.some((h) => h.input === newItem.input && h.output === newItem.output),
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const { history, addToHistory, clearHistory, removeFromHistory } = historyStore;

  const handleUseEntry = useCallback((entry: CSSHistoryEntry) => {
    setPresetInput(entry.input);
    setPresetKey((k) => k + 1);
    setViewTab("single");
  }, []);

  return (
    <div className={styles.cmRoot}>
      <div className={styles.cmChrome}>
        <div className={styles.cmChromeLeft}>
          <div className={styles.cmTitle}>
            <i className="ti ti-brand-css3" />
            CSS Minifier
          </div>
        </div>
        <div className={styles.cmChromeRight} />
      </div>

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
              {mounted && tab.id === "history" && history.length > 0 && (
                <span className={styles.cmBadge}>{history.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.cmTabContent}>
        <div
          className={`${styles.cmPane}${viewTab === "single" ? ` ${styles.active}` : ""}`}
          aria-hidden={viewTab !== "single"}
        >
          <CSSPreview key={presetKey} initialInput={presetInput} onProcess={addToHistory} />
        </div>

        <div
          className={`${styles.cmPane}${viewTab === "batch" ? ` ${styles.active}` : ""}`}
          aria-hidden={viewTab !== "batch"}
        >
          <CSSBatch />
        </div>

        <div
          className={`${styles.cmPane}${viewTab === "history" ? ` ${styles.active}` : ""}`}
          aria-hidden={viewTab !== "history"}
        >
          <HistoryList<CSSHistoryEntry>
            history={history}
            onClear={clearHistory}
            onDelete={removeFromHistory}
            onUse={handleUseEntry}
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
                      onClick={() => navigator.clipboard.writeText(entry.output)}
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
                    <code className="ch-item-code">{previewText(entry.input)}</code>
                  </div>
                  <div className="ch-item-row">
                    <span className="ch-item-label">Output:</span>
                    <code className="ch-item-code">{previewText(entry.output)}</code>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <div className={styles.cmFooter}>
        <i className="ti ti-shield-lock" />
        <span>Everything runs in your browser — no data ever leaves this page.</span>
      </div>
    </div>
  );
}