//features/social/qr-generator/HistoryPanel.tsx
"use client";

import type { HistoryItem, QrType } from "./types";
import { getTypeIcon, getTypeLabel } from "./encode";

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
                    <p>No history yet. Generated QR codes will appear here.</p>
                </div>
                <style>{`
          .hp-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 32px 20px;
            color: var(--text-disabled);
            font-size: 12.5px;
            font-family: var(--font-sans);
            text-align: center;
          }
          .hp-empty i { font-size: 28px; }
          .hp-empty p { margin: 0; color: var(--text-tertiary); max-width: 180px; line-height: 1.5; }
        `}</style>
            </>
        );
    }

    return (
        <>
            <div className="hp-root">
                <div className="hp-header">
                    <span className="hp-count">{items.length} saved</span>
                    <button className="hp-clear" onClick={onClear}>Clear all</button>
                </div>
                <div className="hp-list">
                    {items.map(item => (
                        <div key={item.id} className="hp-item">
                            <div className="hp-thumb">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.label ? `${item.label} preview` : "QR code preview"} width={36} height={36} />
                                ) : (
                                    <i className={`ti ${getTypeIcon(item.type)}`} aria-hidden="true" />
                                )}
                            </div>
                            <div className="hp-info">
                                <span className="hp-type">{getTypeLabel(item.type)}</span>
                                <span className="hp-label">{item.label}</span>
                                <span className="hp-time">{relativeTime(item.timestamp)}</span>
                            </div>
                            <div className="hp-item-actions">
                                <button className="hp-restore" onClick={() => onRestore(item)} title="Restore this QR">
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

            <style>{`
        .hp-root {
          display: flex;
          flex-direction: column;
        }
        .hp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
        }
        .hp-count {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
        .hp-clear {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: color 0.12s, background 0.12s;
        }
        .hp-clear:hover { color: #B91C1C; background: var(--error-bg); }

        .hp-list {
          display: flex;
          flex-direction: column;
        }
        .hp-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          transition: background 0.12s;
        }
        .hp-item:hover { background: var(--bg-surface); }
        .hp-item:last-child { border-bottom: none; }

        .hp-thumb {
          width: 36px; height: 36px;
          border-radius: 7px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          font-size: 16px;
          color: var(--text-tertiary);
        }
        .hp-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .hp-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hp-type {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: var(--font-sans);
        }
        .hp-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hp-time {
          font-size: 10.5px;
          color: var(--text-disabled);
          font-family: var(--font-sans);
        }

        .hp-item-actions {
          display: flex;
          gap: 4px;
        }
        .hp-restore, .hp-delete {
          width: 28px; height: 28px;
          border-radius: 6px;
          background: none;
          border: 0.5px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-disabled);
          transition: all 0.12s;
        }
        .hp-restore:hover { color: var(--brand); background: var(--brand-light); border-color: var(--brand-border); }
        .hp-delete:hover { color: #B91C1C; background: var(--error-bg); border-color: #FECACA; }
        @media (prefers-color-scheme: dark) {
          .hp-delete:hover { color: #F87171; border-color: #7F1D1D; }
        }
      `}</style>
            </>
        );
}