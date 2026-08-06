// features/dev/slug-generator/SlugHistory.tsx
"use client";

import { formatBytes } from "./ts/utils";
import * as store from "./ts/slugStore";
import styles from "./style/SlugHistory.module.css";

interface SlugHistoryProps {
  history: store.HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: store.HistoryEntry) => void;
}

export default function SlugHistory({ history, onClear, onRestore }: SlugHistoryProps) {
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
      <div className={styles.shRoot}>
        {history.length === 0 ? (
          <div className={styles.shEmpty}>
            <div className={styles.shEmptyIcon}>
              <i className="ti ti-history" />
            </div>
            <p className={styles.shEmptyTitle}>No History Yet</p>
            <p className={styles.shEmptyDesc}>
              Your slug generation history will appear here. History is stored locally in your
              browser.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.shHeader}>
              <div className={styles.shHeaderLabel}>
                <i className="ti ti-history" />
                History
                <span className={styles.shCountBadge}>{history.length}</span>
              </div>
              <button type="button" className={styles.shClearBtn} onClick={onClear}>
                <i className="ti ti-trash" />
                Clear All
              </button>
            </div>

            <div className={styles.shList}>
              {history.map((entry) => (
                <div key={entry.id} className={styles.shItem}>
                  <div className={styles.shItemHeader}>
                    <div className={styles.shItemTime}>
                      <i className="ti ti-clock" />
                      {formatTimestamp(entry.timestamp)}
                    </div>
                    <button
                      type="button"
                      className={styles.shRestoreBtn}
                      onClick={() => onRestore(entry)}
                      title="Restore this slug"
                    >
                      <i className="ti ti-arrow-back-up" />
                      Restore
                    </button>
                  </div>

                  <div className={styles.shItemContent}>
                    <div className={styles.shItemRow}>
                      <span className={styles.shItemLabel}>Input:</span>
                      <div className={styles.shItemText}>{entry.input}</div>
                    </div>
                    <div className={styles.shItemRow}>
                      <span className={styles.shItemLabel}>Slug:</span>
                      <code className={styles.shItemCode}>{entry.output}</code>
                    </div>
                  </div>

                  <div className={styles.shItemFooter}>
                    <div className={styles.shItemOptions}>
                      <span className={styles.shOptionTag}>
                        {entry.options.separator === "-" && "Hyphen"}
                        {entry.options.separator === "_" && "Underscore"}
                        {entry.options.separator === "." && "Dot"}
                        {entry.options.separator === "" && "None"}
                      </span>
                      <span className={styles.shOptionTag}>{entry.options.caseStyle}</span>
                      {entry.options.removeStopWords && (
                        <span className={styles.shOptionTag}>No stop words</span>
                      )}
                      {entry.options.maxLength && (
                        <span className={styles.shOptionTag}>Max {entry.options.maxLength}</span>
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