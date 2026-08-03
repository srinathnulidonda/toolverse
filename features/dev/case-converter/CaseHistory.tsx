// features/dev/case-converter/CaseHistory.tsx
"use client";

import type { HistoryEntry, CaseType } from "./utils";

interface CaseHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function CaseHistory({ history, onClear, onRestore }: CaseHistoryProps) {
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
              Your conversion history will appear here. History is stored locally in your browser.
            </p>
          </div>
        ) : (
          <>
            <div className="ch-header">
              <div className="ch-header-label">
                <i className="ti ti-history" />
                Conversion History
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
                    <div className="ch-item-conversion">
                      <span className="ch-item-case">{entry.toCase}</span>
                      <i className="ti ti-arrow-right" />
                    </div>
                    <div className="ch-item-meta">
                      <span className="ch-item-time">{formatTimestamp(entry.timestamp)}</span>
                      <button
                        type="button"
                        className="ch-restore-btn"
                        onClick={() => onRestore(entry)}
                        title="Restore this conversion"
                      >
                        <i className="ti ti-arrow-back-up" />
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className="ch-item-content">
                    <div className="ch-item-row">
                      <span className="ch-item-label">Input:</span>
                      <code className="ch-item-code">{entry.input}</code>
                    </div>
                    <div className="ch-item-row">
                      <span className="ch-item-label">Output:</span>
                      <code className="ch-item-code">{entry.output}</code>
                    </div>
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
