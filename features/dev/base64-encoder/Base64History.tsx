// features\dev\base64-encoder\Base64History.tsx
"use client";

import { formatBytes } from "@/utils";
import type { HistoryEntry, Mode, EncodingOptions } from "./ts/utils";
import styles from "./style/Base64History.module.css";

interface Base64HistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function Base64History({ history, onClear, onRestore }: Base64HistoryProps) {
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

  return (
    <div className={styles.root}>
      {history.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <i className="ti ti-history" />
          </div>
          <p className={styles.emptyTitle}>No History Yet</p>
          <p className={styles.emptyDesc}>
            Your conversion history will appear here. History is stored locally in your browser.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.headerLabel}>
              <i className="ti ti-history" />
              History
              <span className={styles.countBadge}>{history.length}</span>
            </div>
            <button type="button" className={styles.clearBtn} onClick={onClear}>
              <i className="ti ti-trash" />
              Clear All
            </button>
          </div>

          <div className={styles.list}>
            {history.map((entry) => (
              <div key={entry.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemMode}>
                    <i className={`ti ${entry.mode === "encode" ? "ti-lock" : "ti-lock-open"}`} />
                    <span>{entry.mode === "encode" ? "Encode" : "Decode"}</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemTime}>{formatTimestamp(entry.timestamp)}</span>
                    <button
                      type="button"
                      className={styles.restoreBtn}
                      onClick={() => onRestore(entry)}
                      title="Restore this conversion"
                    >
                      <i className="ti ti-arrow-back-up" />
                      Restore
                    </button>
                  </div>
                </div>

                <div className={styles.itemContent}>
                  <div className={styles.itemRow}>
                    <span className={styles.itemLabel}>Input:</span>
                    <code className={styles.itemCode}>
                      {entry.input}
                      {entry.input.length < entry.output.length && "..."}
                    </code>
                  </div>
                  <div className={styles.itemRow}>
                    <span className={styles.itemLabel}>Output:</span>
                    <code className={styles.itemCode}>
                      {entry.output}
                      {entry.output.length > 100 && "..."}
                    </code>
                  </div>
                </div>

                <div className={styles.itemFooter}>
                  <div className={styles.itemOptions}>
                    {entry.options.urlSafe && <span className={styles.optionTag}>URL-safe</span>}
                    {entry.options.wrapLines && <span className={styles.optionTag}>Wrapped</span>}
                    {entry.options.asDataUri && <span className={styles.optionTag}>Data URI</span>}
                    {!entry.options.padding && <span className={styles.optionTag}>No padding</span>}
                    {entry.options.charset !== "UTF-8" && (
                      <span className={styles.optionTag}>{entry.options.charset}</span>
                    )}
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