// features/social/meta-tag-generator/HistoryPanel.tsx
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
        <i className="ti ti-history-off" aria-hidden="true" />
        <p>No saved meta tags yet</p>
        <span>Your saved configurations will appear here</span>
      </div>
    );
  }

  return (
    <div className={styles.hpRoot}>
      <div className={styles.hpHeader}>
        <span className={styles.hpCount}>
          <i className="ti ti-database" aria-hidden="true" />
          {items.length} saved configuration{items.length !== 1 ? "s" : ""}
        </span>
        <button className={styles.hpClearBtn} onClick={onClear}>
          <i className="ti ti-trash" aria-hidden="true" />
          Clear All
        </button>
      </div>

      <div className={styles.hpGrid}>
        {items.map((item) => (
          <div key={item.id} className={styles.hpCard}>
            <div className={styles.hpCardHeader}>
              <div className={styles.hpCardTitle}>{item.title || "Untitled"}</div>
              <span className={styles.hpCardTime}>{relativeTime(item.timestamp)}</span>
            </div>
            <div className={styles.hpCardDescription}>
              {item.description || "No description provided"}
            </div>
            <div className={styles.hpCardMeta}>
              <span className={styles.hpMetaTag}>
                <i className="ti ti-tag" aria-hidden="true" />
                {item.tags.ogType}
              </span>
              {item.tags.enableSchema && (
                <span className={`${styles.hpMetaTag} ${styles.hpMetaSchema}`}>
                  <i className="ti ti-code" aria-hidden="true" />
                  {item.tags.schemaType}
                </span>
              )}
            </div>
            <div className={styles.hpCardActions}>
              <button className={`${styles.hpBtn} ${styles.hpRestoreBtn}`} onClick={() => onRestore(item)}>
                <i className="ti ti-refresh" aria-hidden="true" />
                Restore
              </button>
              <button className={`${styles.hpBtn} ${styles.hpDeleteBtn}`} onClick={() => onDelete(item.id)}>
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
