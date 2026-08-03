// features/dev/color-converter/ColorHistory.tsx
"use client";

import type { HistoryEntry } from "./colorStore";

interface ColorHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function ColorHistory({ history, onClear, onRestore }: ColorHistoryProps) {
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <>
      <div className="ch-root">
        {history.length === 0 ? (
          <div className="ch-empty">
            <div className="ch-empty-icon">
              <i className="ti ti-history" />
            </div>
            <p className="ch-empty-title">No History Yet</p>
            <p className="ch-empty-desc">
              Your color conversion history will appear here. History is stored locally in your
              browser.
            </p>
          </div>
        ) : (
          <>
            <div className="ch-header">
              <div className="ch-header-label">
                <i className="ti ti-history" />
                Color History
                <span className="ch-count-badge">{history.length}</span>
              </div>
              <button type="button" className="ch-clear-btn" onClick={onClear}>
                <i className="ti ti-trash" />
                Clear All
              </button>
            </div>

            <div className="ch-list">
              {history.map((entry) => (
                <div key={entry.id} className="ch-item">
                  <div className="ch-item-header">
                    <div className="ch-item-left">
                      <div className="ch-item-swatch" style={{ background: entry.color }} />
                      <div className="ch-item-info">
                        <code className="ch-item-color">{entry.color.toUpperCase()}</code>
                        <span className="ch-item-meta">
                          {entry.format} • {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ch-restore-btn"
                      onClick={() => onRestore(entry)}
                      title="Restore this color"
                    >
                      <i className="ti ti-arrow-back-up" />
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
