// features/dev/slug-generator/SlugHistory.tsx
"use client";

import { formatBytes } from "./utils";
import * as store from "./slugStore";

interface SlugHistoryProps {
  history: store.HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: store.HistoryEntry) => void;
}

export default function SlugHistory({ history, onClear, onRestore }: SlugHistoryProps) {
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
      <div className="sh-root">
        {history.length === 0 ? (
          <div className="sh-empty">
            <div className="sh-empty-icon">
              <i className="ti ti-history" />
            </div>
            <p className="sh-empty-title">No History Yet</p>
            <p className="sh-empty-desc">
              Your slug generation history will appear here. History is stored locally in your
              browser.
            </p>
          </div>
        ) : (
          <>
            <div className="sh-header">
              <div className="sh-header-label">
                <i className="ti ti-history" />
                History
                <span className="sh-count-badge">{history.length}</span>
              </div>
              <button type="button" className="sh-clear-btn" onClick={onClear}>
                <i className="ti ti-trash" />
                Clear All
              </button>
            </div>

            <div className="sh-list">
              {history.map((entry) => (
                <div key={entry.id} className="sh-item">
                  <div className="sh-item-header">
                    <div className="sh-item-time">
                      <i className="ti ti-clock" />
                      {formatTimestamp(entry.timestamp)}
                    </div>
                    <button
                      type="button"
                      className="sh-restore-btn"
                      onClick={() => onRestore(entry)}
                      title="Restore this slug"
                    >
                      <i className="ti ti-arrow-back-up" />
                      Restore
                    </button>
                  </div>

                  <div className="sh-item-content">
                    <div className="sh-item-row">
                      <span className="sh-item-label">Input:</span>
                      <div className="sh-item-text">{entry.input}</div>
                    </div>
                    <div className="sh-item-row">
                      <span className="sh-item-label">Slug:</span>
                      <code className="sh-item-code">{entry.output}</code>
                    </div>
                  </div>

                  <div className="sh-item-footer">
                    <div className="sh-item-options">
                      <span className="sh-option-tag">
                        {entry.options.separator === "-" && "Hyphen"}
                        {entry.options.separator === "_" && "Underscore"}
                        {entry.options.separator === "." && "Dot"}
                        {entry.options.separator === "" && "None"}
                      </span>
                      <span className="sh-option-tag">{entry.options.caseStyle}</span>
                      {entry.options.removeStopWords && (
                        <span className="sh-option-tag">No stop words</span>
                      )}
                      {entry.options.maxLength && (
                        <span className="sh-option-tag">Max {entry.options.maxLength}</span>
                      )}
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
