// features/social/qr-generator/HistoryPanel.tsx
"use client";

import type { HistoryItem, QrType } from "./ts/types";
import { getTypeIcon, getTypeLabel } from "./ts/encode";
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
        <p>No history yet. Generated QR codes will appear here.</p>
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
                <img
                  src={item.thumbnail}
                  alt={item.label ? `${item.label} preview` : "QR code preview"}
                  width={36}
                  height={36}
                />
              ) : (
                <i className={`ti ${getTypeIcon(item.type)}`} aria-hidden="true" />
              )}
            </div>
            <div className={styles.hpInfo}>
              <span className={styles.hpType}>{getTypeLabel(item.type)}</span>
              <span className={styles.hpLabel}>{item.label}</span>
              <span className={styles.hpTime}>{relativeTime(item.timestamp)}</span>
            </div>
            <div className={styles.hpItemActions}>
              <button
                className={styles.hpRestore}
                onClick={() => onRestore(item)}
                title="Restore this QR"
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