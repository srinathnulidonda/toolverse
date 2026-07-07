// features/social/meta-tag-generator/HistoryPanel.tsx
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

export default function HistoryPanel({
  items,
  onRestore,
  onDelete,
  onClear,
}: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <>
        <div className="hp-empty">
          <i className="ti ti-history-off" aria-hidden="true" />
          <p>No saved meta tags yet</p>
          <span>Your saved configurations will appear here</span>
        </div>
        <style>{`
          .hp-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 48px 24px;
            text-align: center;
          }
          .hp-empty i {
            font-size: 36px;
            color: var(--text-disabled);
          }
          .hp-empty p {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 0;
          }
          .hp-empty span {
            font-size: 12.5px;
            color: var(--text-tertiary);
            max-width: 220px;
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
            <i className="ti ti-database" aria-hidden="true" />
            {items.length} saved configuration{items.length !== 1 ? "s" : ""}
          </span>
          <button className="hp-clear-btn" onClick={onClear}>
            <i className="ti ti-trash" aria-hidden="true" />
            Clear All
          </button>
        </div>

        <div className="hp-grid">
          {items.map((item) => (
            <div key={item.id} className="hp-card">
              <div className="hp-card-header">
                <div className="hp-card-title">{item.title || "Untitled"}</div>
                <span className="hp-card-time">{relativeTime(item.timestamp)}</span>
              </div>
              <div className="hp-card-description">
                {item.description || "No description provided"}
              </div>
              <div className="hp-card-meta">
                <span className="hp-meta-tag">
                  <i className="ti ti-tag" aria-hidden="true" />
                  {item.tags.ogType}
                </span>
                {item.tags.enableSchema && (
                  <span className="hp-meta-tag hp-meta-schema">
                    <i className="ti ti-code" aria-hidden="true" />
                    {item.tags.schemaType}
                  </span>
                )}
              </div>
              <div className="hp-card-actions">
                <button
                  className="hp-btn hp-restore-btn"
                  onClick={() => onRestore(item)}
                >
                  <i className="ti ti-refresh" aria-hidden="true" />
                  Restore
                </button>
                <button
                  className="hp-btn hp-delete-btn"
                  onClick={() => onDelete(item.id)}
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
          gap: 16px;
        }

        .hp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 4px;
        }
        .hp-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .hp-count i { font-size: 15px; }

        .hp-clear-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: transparent;
          border: 0.5px solid var(--border);
          border-radius: 6px;
          color: var(--text-tertiary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .hp-clear-btn i { font-size: 13px; }
        .hp-clear-btn:hover {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }

        .hp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .hp-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          transition: all 0.15s;
        }
        .hp-card:hover {
          border-color: var(--text-disabled);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .hp-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .hp-card-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .hp-card-time {
          font-size: 10.5px;
          color: var(--text-disabled);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .hp-card-description {
          font-size: 11.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .hp-card-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .hp-meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: var(--bg-surface);
          border-radius: 5px;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: capitalize;
        }
        .hp-meta-tag i { font-size: 11px; }
        .hp-meta-schema {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .hp-card-actions {
          display: flex;
          gap: 6px;
          margin-top: auto;
        }
        .hp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 10px;
          border-radius: 6px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .hp-btn i { font-size: 13px; }
        .hp-restore-btn {
          flex: 1;
          color: var(--brand-text);
          background: var(--brand-light);
          border-color: var(--brand-border);
        }
        .hp-restore-btn:hover {
          background: var(--brand);
          color: white;
        }
        .hp-delete-btn {
          color: var(--text-tertiary);
          width: 32px;
        }
        .hp-delete-btn:hover {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }

        @media (max-width: 600px) {
          .hp-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-color-scheme: dark) {
          .hp-clear-btn:hover { color: #F87171; }
          .hp-delete-btn:hover {
            color: #F87171;
            border-color: #7F1D1D;
          }
        }
      `}</style>
    </>
  );
}