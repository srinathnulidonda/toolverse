// features/social/og-preview/HistoryPanel.tsx
"use client";

import type { HistoryItem } from "./types";

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
        <div className="hp-empty">
          <i className="ti ti-clock-off" aria-hidden="true" />
          <p>No history yet. Saved previews will appear here.</p>
        </div>
        <style>{`
          .hp-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 40px 20px;
            color: var(--text-disabled);
            text-align: center;
          }
          .hp-empty i { font-size: 32px; }
          .hp-empty p {
            margin: 0;
            color: var(--text-tertiary);
            font-size: 13px;
            max-width: 200px;
            line-height: 1.5;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="hp-root">
        <div className="hp-header">
          <span className="hp-count">
            {items.length} saved preview{items.length !== 1 ? "s" : ""}
          </span>
          <button className="hp-clear" onClick={onClear}>
            <i className="ti ti-trash" aria-hidden="true" />
            Clear all
          </button>
        </div>

        <div className="hp-list">
          {items.map((item) => (
            <div key={item.id} className="hp-item">
              <div className="hp-thumbnail">
                {item.image ? (
                  <img src={item.image} alt="" />
                ) : (
                  <div className="hp-thumbnail-placeholder">
                    <i className="ti ti-photo-off" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="hp-content">
                <div className="hp-title">{item.title || "Untitled"}</div>
                <div className="hp-description">{item.description || "No description"}</div>
                <div className="hp-meta">
                  <span className="hp-url">{item.url ? new URL(item.url).hostname : "No URL"}</span>
                  <span className="hp-dot">•</span>
                  <span className="hp-time">{relativeTime(item.timestamp)}</span>
                </div>
              </div>
              <div className="hp-actions">
                <button
                  className="hp-action-btn"
                  onClick={() => onRestore(item)}
                  title="Restore this preview"
                >
                  <i className="ti ti-refresh" aria-hidden="true" />
                </button>
                <button
                  className="hp-action-btn hp-delete-btn"
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

      <style>{`
        .hp-root {
          display: flex;
          flex-direction: column;
        }

        .hp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }
        .hp-count {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .hp-clear {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-tertiary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .hp-clear i { font-size: 13px; }
        .hp-clear:hover {
          background: var(--error-bg);
          color: #B91C1C;
        }

        .hp-list {
          display: flex;
          flex-direction: column;
        }

        .hp-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 0.5px solid var(--border);
          transition: background 0.12s;
        }
        .hp-item:hover { background: var(--bg-surface); }
        .hp-item:last-child { border-bottom: none; }

        .hp-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          flex-shrink: 0;
        }
        .hp-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hp-thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--text-disabled);
        }

        .hp-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 2px 0;
        }
        .hp-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hp-description {
          font-size: 12px;
          color: var(--text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          white-space: normal;
          line-height: 1.4;
        }
        .hp-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-disabled);
          margin-top: auto;
        }
        .hp-url {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hp-dot {
          flex-shrink: 0;
        }
        .hp-time {
          flex-shrink: 0;
        }

        .hp-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-shrink: 0;
        }
        .hp-action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-tertiary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.12s;
          font-size: 14px;
        }
        .hp-action-btn:hover {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .hp-delete-btn:hover {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }

        @media (max-width: 600px) {
          .hp-thumbnail {
            width: 60px;
            height: 60px;
          }
          .hp-actions {
            flex-direction: row;
          }
        }

        @media (prefers-color-scheme: dark) {
          .hp-clear:hover { color: #F87171; }
          .hp-delete-btn:hover {
            color: #F87171;
            border-color: #7F1D1D;
          }
        }
      `}</style>
    </>
  );
}
