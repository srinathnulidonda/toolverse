// features/dev/timestamp-converter/TimestampHistory.tsx
"use client";

import * as store from "./ts/timestampStore";
import styles from "./style/TimestampHistory.module.css";

interface TimestampHistoryProps {
  history: store.HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: store.HistoryEntry) => void;
}

function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function TimestampHistory({ history, onClear, onRestore }: TimestampHistoryProps) {
  const handleClear = () => {
    if (history.length === 0) return;
    if (window.confirm("Clear all conversion history? This cannot be undone.")) {
      onClear();
    }
  };

  return (
    <div className={styles.thRoot}>
      {history.length === 0 ? (
        <div className={styles.thEmpty}>
          <div className={styles.thEmptyIcon}>
            <i className="ti ti-history" />
          </div>
          <p className={styles.thEmptyTitle}>No History Yet</p>
          <p className={styles.thEmptyDesc}>
            Your conversion history will appear here, stored locally in your browser.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.thHeader}>
            <div className={styles.thHeaderLabel}>
              <i className="ti ti-history" />
              <span className={styles.thLabelText}>History</span>
              <span className={styles.thCountBadge}>{history.length}</span>
            </div>
            <button type="button" className={styles.thClearBtn} onClick={handleClear}>
              <i className="ti ti-trash" />
              <span className={styles.thBtnText}>Clear All</span>
            </button>
          </div>

          <div className={styles.thList}>
            {history.map((entry) => (
              <div key={entry.id} className={styles.thItem}>
                <div className={styles.thItemHeader}>
                  <div className={styles.thItemIcon}>
                    <i className="ti ti-clock" />
                  </div>
                  <div className={styles.thItemTime} title={new Date(entry.createdAt).toLocaleString()}>
                    {formatTimestamp(entry.createdAt)}
                  </div>
                  <button
                    type="button"
                    className={styles.thRestoreBtn}
                    onClick={() => onRestore(entry)}
                  >
                    <i className="ti ti-arrow-back-up" />
                    <span className={styles.thBtnText}>Restore</span>
                  </button>
                </div>

                <div className={styles.thItemContent}>
                  <div className={styles.thItemRow}>
                    <span className={styles.thItemLabel}>Input:</span>
                    <code>{entry.input}</code>
                  </div>
                  <div className={styles.thItemRow}>
                    <span className={styles.thItemLabel}>Output:</span>
                    <code>{entry.output}</code>
                  </div>
                </div>

                <div className={styles.thItemFooter}>
                  <span className={styles.thOptionTag}>{entry.options.unit}</span>
                  <span className={styles.thOptionTag}>{entry.options.timezone}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}