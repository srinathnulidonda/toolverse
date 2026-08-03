// features/dev/timestamp-converter/TimestampHistory.tsx
"use client";

import * as store from "./timestampStore";

interface TimestampHistoryProps {
  history: store.HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: store.HistoryEntry) => void;
}

export default function TimestampHistory({ history, onClear, onRestore }: TimestampHistoryProps) {
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
      <div className="th-root">
        {history.length === 0 ? (
          <div className="th-empty">
            <div className="th-empty-icon">
              <i className="ti ti-history" />
            </div>
            <p className="th-empty-title">No History Yet</p>
            <p className="th-empty-desc">
              Your conversion history will appear here, stored locally in your browser.
            </p>
          </div>
        ) : (
          <>
            <div className="th-header">
              <div className="th-header-label">
                <i className="ti ti-history" />
                <span className="th-label-text">History</span>
                <span className="th-count-badge">{history.length}</span>
              </div>
              <button type="button" className="th-clear-btn" onClick={onClear}>
                <i className="ti ti-trash" />
                <span className="th-btn-text">Clear All</span>
              </button>
            </div>

            <div className="th-list">
              {history.map((entry) => (
                <div key={entry.id} className="th-item">
                  <div className="th-item-header">
                    <div className="th-item-time">
                      <i className="ti ti-clock" />
                      {formatTimestamp(entry.createdAt)}
                    </div>
                    <button
                      type="button"
                      className="th-restore-btn"
                      onClick={() => onRestore(entry)}
                    >
                      <i className="ti ti-arrow-back-up" />
                      <span className="th-btn-text">Restore</span>
                    </button>
                  </div>

                  <div className="th-item-content">
                    <div className="th-item-row">
                      <span className="th-item-label">Input:</span>
                      <code>{entry.input}</code>
                    </div>
                    <div className="th-item-row">
                      <span className="th-item-label">Output:</span>
                      <code>{entry.output}</code>
                    </div>
                  </div>

                  <div className="th-item-footer">
                    <span className="th-option-tag">{entry.options.unit}</span>
                    <span className="th-option-tag">{entry.options.timezone}</span>
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
