// features/dev/url-encoder/UrlHistory.tsx
"use client";

import { formatBytes } from "@/utils";
import * as store from "./urlStore";

interface UrlHistoryProps {
  history: store.HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: store.HistoryEntry) => void;
  onRemove: (id: string) => void;
}

export default function UrlHistory({ history, onClear, onRestore, onRemove }: UrlHistoryProps) {
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
      <div className="uh-root">
        {history.length === 0 ? (
          <div className="uh-empty">
            <div className="uh-empty-icon">
              <i className="ti ti-history" />
            </div>
            <p className="uh-empty-title">No History Yet</p>
            <p className="uh-empty-desc">
              Your conversion history will appear here. History is stored locally in your browser.
            </p>
          </div>
        ) : (
          <>
            <div className="uh-header">
              <div className="uh-header-label">
                <i className="ti ti-history" />
                History
                <span className="uh-count-badge">{history.length}</span>
              </div>
              <button type="button" className="uh-clear-btn" onClick={onClear}>
                <i className="ti ti-trash" />
                Clear All
              </button>
            </div>

            <div className="uh-list">
              {history.map((entry) => (
                <div key={entry.id} className="uh-item">
                  <div className="uh-item-header">
                    <div className="uh-item-mode">
                      <i className={`ti ${entry.mode === "encode" ? "ti-lock" : "ti-lock-open"}`} />
                      <span>{entry.mode === "encode" ? "Encode" : "Decode"}</span>
                    </div>
                    <div className="uh-item-meta">
                      <span className="uh-item-time">{formatTimestamp(entry.timestamp)}</span>
                      <button
                        type="button"
                        className="uh-restore-btn"
                        onClick={() => onRestore(entry)}
                        title="Restore this conversion"
                      >
                        <i className="ti ti-arrow-back-up" />
                        Restore
                      </button>
                      <button
                        type="button"
                        className="uh-remove-btn"
                        onClick={() => onRemove(entry.id)}
                        title="Remove from history"
                        aria-label="Remove from history"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>

                  <div className="uh-item-content">
                    <div className="uh-item-row">
                      <span className="uh-item-label">Input:</span>
                      <code className="uh-item-code">
                        {entry.input.substring(0, 100)}
                        {entry.input.length > 100 && "..."}
                      </code>
                    </div>
                    <div className="uh-item-row">
                      <span className="uh-item-label">Output:</span>
                      <code className="uh-item-code">
                        {entry.output.substring(0, 100)}
                        {entry.output.length > 100 && "..."}
                      </code>
                    </div>
                  </div>

                  <div className="uh-item-footer">
                    <div className="uh-item-options">
                      <span className="uh-option-tag">{entry.options.method.toUpperCase()}</span>
                      {entry.options.spaceAsPlus && (
                        <span className="uh-option-tag">Space as +</span>
                      )}
                      {entry.options.encoding !== "UTF-8" && (
                        <span className="uh-option-tag">{entry.options.encoding}</span>
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
