// features/dev/color-converter/ColorHistory.tsx
"use client";

import { useState, useCallback } from "react";
import type { HistoryEntry } from "./ts/colorStore";
import styles from "./style/ColorHistory.module.css";

interface ColorHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function ColorHistory({ history, onClear, onRestore }: ColorHistoryProps) {
  const [copiedId, setCopiedId] = useState("");

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

  const handleCopy = useCallback(async (color: string, id: string) => {
    try {
      await navigator.clipboard.writeText(color.toUpperCase());
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  }, []);

  return (
    <div className={styles.chRoot}>
      {history.length === 0 ? (
        <div className={styles.chEmpty}>
          <div className={styles.chEmptyIcon}>
            <i className="ti ti-history" />
          </div>
          <h3 className={styles.chEmptyTitle}>No History Yet</h3>
          <p className={styles.chEmptyDesc}>
            Your color conversion history will appear here. History is stored locally in your
            browser.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.chHeader}>
            <div className={styles.chHeaderLabel}>
              <i className="ti ti-history" />
              Color History
              <span className={styles.chCountBadge}>{history.length}</span>
            </div>
            <button type="button" className={styles.chClearBtn} onClick={onClear}>
              <i className="ti ti-trash" />
              Clear All
            </button>
          </div>

          <div className={styles.chList}>
            {history.map((entry) => (
              <div key={entry.id} className={styles.chItem}>
                <div className={styles.chItemHeader}>
                  <div className={styles.chItemLeft}>
                    <div className={styles.chItemSwatch} style={{ background: entry.color }} />
                    <div className={styles.chItemInfo}>
                      <code className={styles.chItemColor}>{entry.color.toUpperCase()}</code>
                      <span className={styles.chItemMeta}>
                        <span className={styles.chFormatBadge}>{entry.format}</span>
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.chItemActions}>
                    <button
                      type="button"
                      className={`${styles.chIconBtn} ${copiedId === entry.id ? styles.copied : ""}`}
                      onClick={() => handleCopy(entry.color, entry.id)}
                      title="Copy color"
                      aria-label="Copy color value"
                    >
                      <i className={`ti ${copiedId === entry.id ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className={styles.chRestoreBtn}
                      onClick={() => onRestore(entry)}
                      title="Restore this color"
                    >
                      <i className="ti ti-arrow-back-up" />
                      Restore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}