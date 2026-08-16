// features/social/hashtag-generator/SavedSets.tsx
"use client";

import type { SavedSet, Platform } from "./ts/types";
import { PLATFORM_LIMITS } from "./ts/data";
import { formatHashtagsForExport } from "./ts/utils";
import styles from "./style/SavedSets.module.css";

type SavedSetsProps = {
  sets: SavedSet[];
  onRestore: (set: SavedSet) => void;
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

export default function SavedSets({ sets, onRestore, onDelete, onClear }: SavedSetsProps) {
  if (sets.length === 0) {
    return (
      <div className={styles.ssEmpty}>
        <i className="ti ti-bookmarks-off" aria-hidden="true" />
        <p>No saved sets yet</p>
        <span>Save your hashtag collections to reuse them later</span>
      </div>
    );
  }

  return (
    <div className={styles.ssRoot}>
      <div className={styles.ssHeader}>
        <div className={styles.ssTitle}>
          <i className="ti ti-bookmarks" aria-hidden="true" />
          <span>Saved Sets</span>
          <span className={styles.ssCount}>{sets.length}</span>
        </div>
        <button className={styles.ssClearBtn} onClick={onClear}>
          <i className="ti ti-trash" aria-hidden="true" />
          Clear All
        </button>
      </div>

      <div className={styles.ssList}>
        {sets.map((set) => {
          const platformConfig = PLATFORM_LIMITS[set.platform];
          return (
            <div key={set.id} className={styles.ssCard}>
              <div className={styles.ssCardHeader}>
                <div className={styles.ssCardTitleRow}>
                  <i className={`ti ${platformConfig.icon}`} aria-hidden="true" />
                  <span className={styles.ssCardName}>{set.name}</span>
                  <span className={styles.ssCardTime}>{relativeTime(set.timestamp)}</span>
                </div>
                <div className={styles.ssCardMeta}>
                  <span className={styles.ssCardPlatform}>{platformConfig.label}</span>
                  <span className={styles.ssCardTagCount}>{set.hashtags.length} hashtags</span>
                </div>
              </div>

              <div className={styles.ssCardPreview}>
                {set.hashtags.slice(0, 8).map((tag) => (
                  <span key={tag} className={styles.ssTagChip}>
                    #{tag}
                  </span>
                ))}
                {set.hashtags.length > 8 && (
                  <span className={styles.ssTagMore}>+{set.hashtags.length - 8} more</span>
                )}
              </div>

              <div className={styles.ssCardActions}>
                <button className={`${styles.ssBtn} ${styles.ssRestoreBtn}`} onClick={() => onRestore(set)}>
                  <i className="ti ti-refresh" aria-hidden="true" />
                  Restore
                </button>
                <button
                  className={`${styles.ssBtn} ${styles.ssCopyBtn}`}
                  onClick={async () => {
                    const text = formatHashtagsForExport(set.hashtags, "space");
                    await navigator.clipboard.writeText(text);
                  }}
                >
                  <i className="ti ti-copy" aria-hidden="true" />
                  Copy
                </button>
                <button className={`${styles.ssBtn} ${styles.ssDeleteBtn}`} onClick={() => onDelete(set.id)}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}