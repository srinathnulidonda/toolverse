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

      <style jsx>{`
        .th-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .th-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-shrink: 0;
        }

        .th-header-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .th-header-label i {
          font-size: 12px;
        }

        .th-count-badge {
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

        .th-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--tc-radius-md, 8px);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .th-clear-btn i {
          font-size: 12px;
        }

        .th-clear-btn:hover {
          background: var(--error-bg);
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .th-clear-btn:hover {
            color: #f87171;
          }
        }

        .th-list {
          flex: 1;
          overflow: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .th-item {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--tc-radius-lg, 12px);
          overflow: hidden;
          transition: border-color 0.12s;
        }

        .th-item:hover {
          border-color: var(--brand-border);
        }

        .th-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
        }

        .th-item-time {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .th-item-time i {
          font-size: 12px;
        }

        .th-restore-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 8px;
          border-radius: var(--tc-radius-md, 8px);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .th-restore-btn i {
          font-size: 11px;
        }

        .th-restore-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .th-item-content {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .th-item-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
        }

        .th-item-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          min-width: 45px;
        }

        .th-item-content code {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text);
          background: var(--bg-surface);
          padding: 4px 8px;
          border-radius: 4px;
          word-break: break-all;
        }

        .th-item-footer {
          padding: 10px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border-faint);
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .th-option-tag {
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

        .th-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .th-empty-icon {
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

        .th-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .th-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 320px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .th-label-text {
            display: none;
          }

          .th-btn-text {
            display: none;
          }

          .th-list {
            padding: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .th-clear-btn,
          .th-restore-btn,
          .th-item {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
