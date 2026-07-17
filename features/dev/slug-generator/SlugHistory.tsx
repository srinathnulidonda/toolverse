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

      <style jsx>{`
        .sh-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /*  Header  */
        .sh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-shrink: 0;
        }

        .sh-header-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sh-header-label i {
          font-size: 12px;
        }

        .sh-count-badge {
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

        .sh-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--sg-radius-md, 8px);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .sh-clear-btn i {
          font-size: 12px;
        }

        .sh-clear-btn:hover {
          background: var(--error-bg);
          color: #b91c1c;
          border-color: #f3d2d2;
        }

        @media (prefers-color-scheme: dark) {
          .sh-clear-btn:hover {
            color: #f87171;
            border-color: #5a2a2a;
          }
        }

        /*  List  */
        .sh-list {
          flex: 1;
          overflow: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sh-item {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--sg-radius-lg, 12px);
          overflow: hidden;
          transition: border-color 0.12s;
        }

        .sh-item:hover {
          border-color: var(--brand-border);
        }

        .sh-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          gap: 12px;
        }

        .sh-item-time {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .sh-item-time i {
          font-size: 12px;
        }

        .sh-restore-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 8px;
          border-radius: var(--sg-radius-md, 8px);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .sh-restore-btn i {
          font-size: 11px;
        }

        .sh-restore-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .sh-item-content {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sh-item-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sh-item-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .sh-item-text {
          font-size: 12px;
          color: var(--text);
          line-height: 1.6;
        }

        .sh-item-code {
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--brand);
          background: var(--bg-surface);
          padding: 8px 12px;
          border-radius: 6px;
          border: 0.5px solid var(--border-faint);
          word-break: break-all;
          line-height: 1.6;
          font-weight: 500;
        }

        .sh-item-footer {
          padding: 10px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border-faint);
        }

        .sh-item-options {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sh-option-tag {
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
          text-transform: capitalize;
        }

        /*  Empty State  */
        .sh-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .sh-empty-icon {
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

        .sh-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .sh-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 320px;
          line-height: 1.6;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .sh-list {
            padding: 10px;
          }

          .sh-item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sh-clear-btn,
          .sh-restore-btn,
          .sh-item {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
