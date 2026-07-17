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

      <style jsx>{`
        .uh-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /*  Header  */
        .uh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-shrink: 0;
        }

        .uh-header-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .uh-header-label i {
          font-size: 12px;
        }

        .uh-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
        }

        .uh-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .uh-clear-btn i {
          font-size: 12px;
        }

        .uh-clear-btn:hover {
          background: var(--error-bg);
          color: #b91c1c;
          border-color: #f3d2d2;
        }

        @media (prefers-color-scheme: dark) {
          .uh-clear-btn:hover {
            color: #f87171;
            border-color: #5a2a2a;
          }
        }

        /*  List  */
        .uh-list {
          flex: 1;
          overflow: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .uh-item {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color 0.12s;
        }

        .uh-item:hover {
          border-color: var(--brand-border);
        }

        .uh-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          gap: 12px;
        }

        .uh-item-mode {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }

        .uh-item-mode i {
          font-size: 13px;
          color: var(--brand);
        }

        .uh-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .uh-item-time {
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .uh-restore-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 8px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .uh-restore-btn i {
          font-size: 11px;
        }

        .uh-restore-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .uh-remove-btn {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-disabled);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          font-size: 12px;
        }

        .uh-remove-btn:hover {
          background: var(--error-bg);
          color: #b91c1c;
          border-color: #f3d2d2;
        }

        @media (prefers-color-scheme: dark) {
          .uh-remove-btn:hover {
            color: #f87171;
            border-color: #5a2a2a;
          }
        }

        .uh-item-content {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .uh-item-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .uh-item-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .uh-item-code {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text);
          background: var(--bg-surface);
          padding: 6px 10px;
          border-radius: 5px;
          border: 0.5px solid var(--border-faint);
          word-break: break-all;
          line-height: 1.6;
        }

        .uh-item-footer {
          padding: 10px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border-faint);
        }

        .uh-item-options {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .uh-option-tag {
          display: inline-flex;
          align-items: center;
          height: 20px;
          padding: 0 8px;
          border-radius: 99px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          color: var(--text-tertiary);
          font-size: 10px;
          font-weight: 500;
        }

        /*  Empty State  */
        .uh-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .uh-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-disabled);
          margin-bottom: 6px;
        }

        .uh-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .uh-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 320px;
          line-height: 1.6;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .uh-list {
            padding: 10px;
          }

          .uh-item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .uh-item-meta {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .uh-clear-btn,
          .uh-restore-btn,
          .uh-remove-btn,
          .uh-item {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
