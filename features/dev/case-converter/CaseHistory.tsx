// features/dev/case-converter/CaseHistory.tsx
"use client";

import type { HistoryEntry, CaseType } from "./ts/utils";
import styles from "./style/CaseHistory.module.css";

interface CaseHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function CaseHistory({ history, onClear, onRestore }: CaseHistoryProps) {
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
      <div className={styles.chRoot}>
        {history.length === 0 ? (
          <div className={styles.chEmpty}>
            <div className={styles.chEmptyIcon}>
              <i className="ti ti-history" />
            </div>
            <p className={styles.chEmptyTitle}>No History Yet</p>
            <p className={styles.chEmptyDesc}>
              Your conversion history will appear here. History is stored locally in your browser.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.chHeader}>
              <div className={styles.chHeaderLabel}>
                <i className="ti ti-history" />
                Conversion History
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
                    <div className={styles.chItemConversion}>
                      <span className={styles.chItemCase}>{entry.toCase}</span>
                      <i className="ti ti-arrow-right" />
                    </div>
                    <div className={styles.chItemMeta}>
                      <span className={styles.chItemTime}>{formatTimestamp(entry.timestamp)}</span>
                      <button
                        type="button"
                        className={styles.chRestoreBtn}
                        onClick={() => onRestore(entry)}
                        title="Restore this conversion"
                      >
                        <i className="ti ti-arrow-back-up" />
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className={styles.chItemContent}>
                    <div className={styles.chItemRow}>
                      <span className={styles.chItemLabel}>Input:</span>
                      <code className={styles.chItemCode}>{entry.input}</code>
                    </div>
                    <div className={styles.chItemRow}>
                      <span className={styles.chItemLabel}>Output:</span>
                      <code className={styles.chItemCode}>{entry.output}</code>
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