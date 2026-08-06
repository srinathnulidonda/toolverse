// features/social/tweet-generator/HistoryPanel.tsx
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
      <div className={styles.hpEmpty}>
        <i className="ti ti-history" aria-hidden="true" />
        <p>No saved tweets yet. Generated tweets will appear here.</p>
      </div>
    );
  }

  return (
    <div className={styles.hpRoot}>
      <div className={styles.hpHeader}>
        <span className={styles.hpCount}>{items.length} saved</span>
        <button className={styles.hpClear} onClick={onClear}>
          Clear all
        </button>
      </div>

      <div className={styles.hpList}>
        {items.map((item) => (
          <div key={item.id} className={styles.hpItem}>
            <div className={styles.hpThumb}>
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.name} width={64} height={64} />
              ) : (
                <i className="ti ti-message" aria-hidden="true" />
              )}
            </div>

            <div className={styles.hpInfo}>
              <span className={styles.hpName}>{item.name}</span>
              <div className={styles.hpMeta}>
                <span className={styles.hpLayout}>
                  {item.style.layout === "single"
                    ? "Single"
                    : item.style.layout === "quote"
                      ? "Quote"
                      : item.style.layout === "thread"
                        ? "Thread"
                        : "Reply"}
                </span>
                <span className={styles.hpDot}>·</span>
                <span className={styles.hpTheme}>{item.style.theme}</span>
                <span className={styles.hpDot}>·</span>
                <span className={styles.hpTime}>{relativeTime(item.timestamp)}</span>
              </div>
            </div>

            <div className={styles.hpActions}>
              <button
                className={styles.hpRestore}
                onClick={() => onRestore(item)}
                title="Restore this tweet"
              >
                <i className="ti ti-refresh" aria-hidden="true" />
              </button>
              <button className={styles.hpDelete} onClick={() => onDelete(item.id)} title="Delete">
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}