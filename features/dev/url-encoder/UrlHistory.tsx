// features/dev/url-encoder/UrlHistory.tsx
"use client";

import { formatBytes } from "@/utils";
import * as store from "./ts/urlStore";
import styles from "./style/UrlHistory.module.css";

interface UrlHistoryProps {
  history: store.HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: store.HistoryEntry) => void;
  onRemove: (id: string) => void;
}

export default function UrlHistory({ history, onClear, onRestore, onRemove }: UrlHistoryProps) {
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
    <>
      <div className={styles.uhRoot}>
        {history.length === 0 ? (
          <div className={styles.uhEmpty}>
            <div className={styles.uhEmptyIcon}>
              <i className="ti ti-history" />
            </div>
            <p className={styles.uhEmptyTitle}>No History Yet</p>
            <p className={styles.uhEmptyDesc}>
              Your conversion history will appear here. History is stored locally in your browser.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.uhHeader}>
              <div className={styles.uhHeaderLabel}>
                <i className="ti ti-history" />
                History
                <span className={styles.uhCountBadge}>{history.length}</span>
              </div>
              <button type="button" className={styles.uhClearBtn} onClick={onClear}>
                <i className="ti ti-trash" />
                Clear All
              </button>
            </div>

            <div className={styles.uhList}>
              {history.map((entry) => (
                <div key={entry.id} className={styles.uhItem}>
                  <div className={styles.uhItemHeader}>
                    <div className={styles.uhItemMode}>
                      <i className={`ti ${entry.mode === "encode" ? "ti-lock" : "ti-lock-open"}`} />
                      <span>{entry.mode === "encode" ? "Encode" : "Decode"}</span>
                    </div>
                    <div className={styles.uhItemMeta}>
                      <span className={styles.uhItemTime}>{formatTimestamp(entry.timestamp)}</span>
                      <button
                        type="button"
                        className={styles.uhRestoreBtn}
                        onClick={() => onRestore(entry)}
                        title="Restore this conversion"
                      >
                        <i className="ti ti-arrow-back-up" />
                        Restore
                      </button>
                      <button
                        type="button"
                        className={styles.uhRemoveBtn}
                        onClick={() => onRemove(entry.id)}
                        title="Remove from history"
                        aria-label="Remove from history"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>

                  <div className={styles.uhItemContent}>
                    <div className={styles.uhItemRow}>
                      <span className={styles.uhItemLabel}>Input:</span>
                      <code className={styles.uhItemCode}>
                        {entry.input.substring(0, 100)}
                        {entry.input.length > 100 && "..."}
                      </code>
                    </div>
                    <div className={styles.uhItemRow}>
                      <span className={styles.uhItemLabel}>Output:</span>
                      <code className={styles.uhItemCode}>
                        {entry.output.substring(0, 100)}
                        {entry.output.length > 100 && "..."}
                      </code>
                    </div>
                  </div>

                  <div className={styles.uhItemFooter}>
                    <div className={styles.uhItemOptions}>
                      <span className={styles.uhOptionTag}>{entry.options.method.toUpperCase()}</span>
                      {entry.options.spaceAsPlus && (
                        <span className={styles.uhOptionTag}>Space as +</span>
                      )}
                      {entry.options.encoding !== "UTF-8" && (
                        <span className={styles.uhOptionTag}>{entry.options.encoding}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}