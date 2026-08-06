// features/social/og-preview/HistoryPanel.tsx
"use client";

import type { HistoryItem } from "./ts/types";
import styles from "./style/HistoryPanel.module.css";

type HistoryPanelProps = {
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function HistoryPanel({ items, onRestore, onDelete, onClear }: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <>
        <div className={styles.hpEmpty}>
          <i className="ti ti-clock-off" aria-hidden="true" />
          <p>No history yet. Saved previews will appear here.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.hpRoot}>
        <div className={styles.hpHeader}>
          <span className={styles.hpCount}>
            {items.length} saved preview{items.length !== 1 ? "s" : ""}
          </span>
          <button className={styles.hpClear} onClick={onClear}>
            <i className="ti ti-trash" aria-hidden="true" />
            Clear all
          </button>
        </div>

        <div className={styles.hpList}>
          {items.map((item) => (
            <div key={item.id} className={styles.hpItem}>
              <div className={styles.hpThumbnail}>
                {item.image ? (
                  <img src={item.image} alt="" />
                ) : (
                  <div className={styles.hpThumbnailPlaceholder}>
                    <i className="ti ti-photo-off" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className={styles.hpContent}>
                <div className={styles.hpTitle}>{item.title || "Untitled"}</div>
                <div className={styles.hpDescription}>{item.description || "No description"}</div>
                <div className={styles.hpMeta}>
                  <span className={styles.hpUrl}>
                    {item.url ? new URL(item.url).hostname : "No URL"}
                  </span>
                  <span className={styles.hpDot}>•</span>
                  <span className={styles.hpTime}>{relativeTime(item.timestamp)}</span>
                </div>
              </div>
              <div className={styles.hpActions}>
                <button
                  className={styles.hpActionBtn}
                  onClick={() => onRestore(item)}
                  title="Restore this preview"
                >
                  <i className="ti ti-refresh" aria-hidden="true" />
                </button>
                <button
                  className={`${styles.hpActionBtn} ${styles.hpDeleteBtn}`}
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                >
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
