// features/social/hashtag-generator/SavedSets.tsx
"use client";

import type { SavedSet, Platform } from "./types";
import { PLATFORM_LIMITS } from "./data";
import { formatHashtagsForExport } from "./utils";

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

export default function SavedSets({
  sets,
  onRestore,
  onDelete,
  onClear,
}: SavedSetsProps) {
  if (sets.length === 0) {
    return (
      <>
        <div className="ss-empty">
          <i className="ti ti-bookmarks-off" aria-hidden="true" />
          <p>No saved sets yet</p>
          <span>Save your hashtag collections to reuse them later</span>
        </div>
        <style>{`
          .ss-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 48px 24px;
            text-align: center;
          }
          .ss-empty i { font-size: 36px; color: var(--text-disabled); }
          .ss-empty p {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 0;
          }
          .ss-empty span {
            font-size: 12px;
            color: var(--text-tertiary);
            max-width: 200px;
            line-height: 1.5;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="ss-root">
        <div className="ss-header">
          <div className="ss-title">
            <i className="ti ti-bookmarks" aria-hidden="true" />
            <span>Saved Sets</span>
            <span className="ss-count">{sets.length}</span>
          </div>
          <button className="ss-clear-btn" onClick={onClear}>
            <i className="ti ti-trash" aria-hidden="true" />
            Clear All
          </button>
        </div>

        <div className="ss-list">
          {sets.map((set) => {
            const platformConfig = PLATFORM_LIMITS[set.platform];
            return (
              <div key={set.id} className="ss-card">
                <div className="ss-card-header">
                  <div className="ss-card-title-row">
                    <i
                      className={`ti ${platformConfig.icon}`}
                      aria-hidden="true"
                    />
                    <span className="ss-card-name">{set.name}</span>
                    <span className="ss-card-time">{relativeTime(set.timestamp)}</span>
                  </div>
                  <div className="ss-card-meta">
                    <span className="ss-card-platform">{platformConfig.label}</span>
                    <span className="ss-card-tag-count">
                      {set.hashtags.length} hashtags
                    </span>
                  </div>
                </div>

                <div className="ss-card-preview">
                  {set.hashtags.slice(0, 8).map((tag) => (
                    <span key={tag} className="ss-tag-chip">
                      #{tag}
                    </span>
                  ))}
                  {set.hashtags.length > 8 && (
                    <span className="ss-tag-more">
                      +{set.hashtags.length - 8} more
                    </span>
                  )}
                </div>

                <div className="ss-card-actions">
                  <button
                    className="ss-btn ss-restore-btn"
                    onClick={() => onRestore(set)}
                  >
                    <i className="ti ti-refresh" aria-hidden="true" />
                    Restore
                  </button>
                  <button
                    className="ss-btn ss-copy-btn"
                    onClick={async () => {
                      const text = formatHashtagsForExport(set.hashtags, "space");
                      await navigator.clipboard.writeText(text);
                    }}
                  >
                    <i className="ti ti-copy" aria-hidden="true" />
                    Copy
                  </button>
                  <button
                    className="ss-btn ss-delete-btn"
                    onClick={() => onDelete(set.id)}
                  >
                    <i className="ti ti-trash" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .ss-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ss-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .ss-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ss-title i { font-size: 16px; color: var(--text-secondary); }
        .ss-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--brand-light);
          color: var(--brand-text);
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
        }

        .ss-clear-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          background: transparent;
          border: 0.5px solid var(--border);
          border-radius: 6px;
          color: var(--text-tertiary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .ss-clear-btn i { font-size: 13px; }
        .ss-clear-btn:hover {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }

        .ss-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ss-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          transition: box-shadow 0.15s;
        }
        .ss-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .ss-card-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ss-card-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ss-card-title-row i {
          font-size: 15px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .ss-card-name {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ss-card-time {
          font-size: 10.5px;
          color: var(--text-disabled);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ss-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 23px;
        }
        .ss-card-platform {
          font-size: 10.5px;
          font-weight: 500;
          color: var(--brand-text);
          padding: 2px 6px;
          background: var(--brand-light);
          border-radius: 4px;
        }
        .ss-card-tag-count {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .ss-card-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .ss-tag-chip {
          display: inline-flex;
          padding: 3px 7px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 4px;
          font-size: 10.5px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
        }
        .ss-tag-more {
          display: inline-flex;
          padding: 3px 7px;
          background: var(--bg-surface);
          border: 0.5px dashed var(--border);
          border-radius: 4px;
          font-size: 10.5px;
          color: var(--text-disabled);
          font-style: italic;
        }

        .ss-card-actions {
          display: flex;
          gap: 6px;
        }
        .ss-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 6px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .ss-btn i { font-size: 13px; }
        .ss-btn:hover { background: var(--border); color: var(--text); }

        .ss-restore-btn {
          flex: 1;
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .ss-restore-btn:hover { background: var(--brand); color: white; }

        .ss-copy-btn { flex: 1; }

        .ss-delete-btn {
          width: 34px;
          padding: 7px;
        }
        .ss-delete-btn:hover {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }

        @media (prefers-color-scheme: dark) {
          .ss-clear-btn:hover { color: #F87171; }
          .ss-delete-btn:hover {
            color: #F87171;
            border-color: #7F1D1D;
          }
        }
      `}</style>
    </>
  );
}