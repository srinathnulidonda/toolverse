// features/dev/base64-encoder/Base64History.tsx
"use client";

import { formatBytes } from "@/utils";
import type { HistoryEntry, Mode, EncodingOptions } from "./utils";

interface Base64HistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function Base64History({ history, onClear, onRestore }: Base64HistoryProps) {
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
      <div className="bh-root">
        {history.length === 0 ? (
          <div className="bh-empty">
            <div className="bh-empty-icon">
              <i className="ti ti-history" />
            </div>
            <p className="bh-empty-title">No History Yet</p>
            <p className="bh-empty-desc">
              Your conversion history will appear here. History is stored locally in your browser.
            </p>
          </div>
        ) : (
          <>
            <div className="bh-header">
              <div className="bh-header-label">
                <i className="ti ti-history" />
                History
                <span className="bh-count-badge">{history.length}</span>
              </div>
              <button type="button" className="bh-clear-btn" onClick={onClear}>
                <i className="ti ti-trash" />
                Clear All
              </button>
            </div>

            <div className="bh-list">
              {history.map((entry) => (
                <div key={entry.id} className="bh-item">
                  <div className="bh-item-header">
                    <div className="bh-item-mode">
                      <i className={`ti ${entry.mode === "encode" ? "ti-lock" : "ti-lock-open"}`} />
                      <span>{entry.mode === "encode" ? "Encode" : "Decode"}</span>
                    </div>
                    <div className="bh-item-meta">
                      <span className="bh-item-time">{formatTimestamp(entry.timestamp)}</span>
                      <button
                        type="button"
                        className="bh-restore-btn"
                        onClick={() => onRestore(entry)}
                        title="Restore this conversion"
                      >
                        <i className="ti ti-arrow-back-up" />
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className="bh-item-content">
                    <div className="bh-item-row">
                      <span className="bh-item-label">Input:</span>
                      <code className="bh-item-code">
                        {entry.input}
                        {entry.input.length < entry.output.length && "..."}
                      </code>
                    </div>
                    <div className="bh-item-row">
                      <span className="bh-item-label">Output:</span>
                      <code className="bh-item-code">
                        {entry.output}
                        {entry.output.length > 100 && "..."}
                      </code>
                    </div>
                  </div>

                  <div className="bh-item-footer">
                    <div className="bh-item-options">
                      {entry.options.urlSafe && <span className="bh-option-tag">URL-safe</span>}
                      {entry.options.wrapLines && <span className="bh-option-tag">Wrapped</span>}
                      {entry.options.asDataUri && <span className="bh-option-tag">Data URI</span>}
                      {!entry.options.padding && <span className="bh-option-tag">No padding</span>}
                      {entry.options.charset !== "UTF-8" && (
                        <span className="bh-option-tag">{entry.options.charset}</span>
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
