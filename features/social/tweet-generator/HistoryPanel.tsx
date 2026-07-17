// features/social/tweet-generator/HistoryPanel.tsx
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
          <i className="ti ti-history" aria-hidden="true" />
          <p>No saved tweets yet. Generated tweets will appear here.</p>
        </div>
        <style>{historyStyles}</style>
      </>
    );
  }

  return (
    <>
      <div className="hp-root">
        <div className="hp-header">
          <span className="hp-count">{items.length} saved</span>
          <button className="hp-clear" onClick={onClear}>
            Clear all
          </button>
        </div>

        <div className="hp-list">
          {items.map((item) => (
            <div key={item.id} className="hp-item">
              <div className="hp-thumb">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.name} width={64} height={64} />
                ) : (
                  <i className="ti ti-message" aria-hidden="true" />
                )}
              </div>

              <div className="hp-info">
                <span className="hp-name">{item.name}</span>
                <div className="hp-meta">
                  <span className="hp-layout">
                    {item.style.layout === "single"
                      ? "Single"
                      : item.style.layout === "quote"
                        ? "Quote"
                        : item.style.layout === "thread"
                          ? "Thread"
                          : "Reply"}
                  </span>
                  <span className="hp-dot">·</span>
                  <span className="hp-theme">{item.style.theme}</span>
                  <span className="hp-dot">·</span>
                  <span className="hp-time">{relativeTime(item.timestamp)}</span>
                </div>
              </div>

              <div className="hp-actions">
                <button
                  className="hp-restore"
                  onClick={() => onRestore(item)}
                  title="Restore this tweet"
                >
                  <i className="ti ti-refresh" aria-hidden="true" />
                </button>
                <button className="hp-delete" onClick={() => onDelete(item.id)} title="Delete">
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{historyStyles}</style>
    </>
  );
}

const historyStyles = `
  .hp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 20px;
    color: var(--text-disabled);
    font-size: 13px;
    font-family: var(--font-sans);
    text-align: center;
  }

  .hp-empty i {
    font-size: 32px;
  }

  .hp-empty p {
    margin: 0;
    color: var(--text-tertiary);
    max-width: 220px;
    line-height: 1.5;
  }

  .hp-root {
    display: flex;
    flex-direction: column;
  }

  .hp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 0.5px solid var(--border-faint);
  }

  .hp-count {
    font-size: 11.5px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
    font-weight: 500;
  }

  .hp-clear {
    font-size: 11.5px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px 8px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
    font-weight: 500;
  }

  .hp-clear:hover {
    color: #DC2626;
    background: var(--error-bg);
  }

  .hp-list {
    display: flex;
    flex-direction: column;
  }

  .hp-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 0.5px solid var(--border-faint);
    transition: background 0.12s;
  }

  .hp-item:hover {
    background: var(--bg-surface);
  }

  .hp-item:last-child {
    border-bottom: none;
  }

  .hp-thumb {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    font-size: 20px;
    color: var(--text-disabled);
  }

  .hp-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hp-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hp-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    font-family: var(--font-sans);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hp-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
  }

  .hp-layout,
  .hp-theme,
  .hp-time {
    font-size: 11px;
  }

  .hp-dot {
    font-size: 11px;
  }

  .hp-actions {
    display: flex;
    gap: 6px;
  }

  .hp-restore,
  .hp-delete {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    background: none;
    border: 0.5px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-disabled);
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .hp-restore:hover {
    color: var(--brand);
    background: var(--brand-light);
    border-color: var(--brand-border);
  }

  .hp-delete:hover {
    color: #DC2626;
    background: var(--error-bg);
    border-color: #FECACA;
  }

  @media (prefers-color-scheme: dark) {
    .hp-delete:hover {
      color: #F87171;
      border-color: #7F1D1D;
    }
  }

  @media (max-width: 768px) {
    .hp-item {
      padding: 10px 14px;
    }

    .hp-thumb {
      width: 56px;
      height: 56px;
    }
  }
`;
