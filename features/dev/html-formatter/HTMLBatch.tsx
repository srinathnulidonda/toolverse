// features/dev/html-formatter/HTMLBatch.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef } from "react";
import { processHTML, type FormattingOptions, type ProcessResult, formatBytes } from "./htmlEngine";

interface BatchItem {
  id: string;
  name: string;
  content: string;
  size: number;
  status: "pending" | "processing" | "completed" | "error";
  result?: ProcessResult;
  error?: string;
}

interface HTMLBatchProps {
  options: FormattingOptions;
  onComplete?: (items: BatchItem[]) => void;
}

export default function HTMLBatch({ options, onComplete }: HTMLBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: BatchItem[] = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm")) {
        continue;
      }

      try {
        const text = await file.text();
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          content: text,
          size: file.size,
          status: "pending",
        });
      } catch (error) {
        logger.error(`Failed to read file ${file.name}:`, error);
      }
    }

    setItems((prev) => [...prev, ...newItems]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const processAll = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProgress(0);

    const totalItems = items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      setItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id ? { ...prevItem, status: "processing" as const } : prevItem
        )
      );

      try {
        const result = processHTML(item.content, options);

        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  status: "completed" as const,
                  result,
                }
              : prevItem
          )
        );
      } catch (error) {
        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : "Unknown error",
                }
              : prevItem
          )
        );
      }

      setProgress(Math.round(((i + 1) / totalItems) * 100));
    }

    setIsProcessing(false);

    if (onComplete) {
      onComplete(items.filter((item) => item.status === "completed"));
    }
  }, [items, options, isProcessing, onComplete]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const copyResult = useCallback(async (item: BatchItem) => {
    if (!item.result) return;

    await navigator.clipboard.writeText(item.result.output);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(""), 1500);
  }, []);

  const downloadResult = useCallback(
    (item: BatchItem) => {
      if (!item.result) return;

      const blob = new Blob([item.result.output], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name.replace(/\.html?$/i, `_${options.mode}.html`);
      a.click();
      URL.revokeObjectURL(url);
    },
    [options.mode]
  );

  const downloadAll = useCallback(() => {
    const completed = items.filter((item) => item.status === "completed");
    completed.forEach((item) => downloadResult(item));
  }, [items, downloadResult]);

  const clearAll = useCallback(() => {
    setItems([]);
    setProgress(0);
  }, []);

  const completedCount = items.filter((item) => item.status === "completed").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const totalSavings = items
    .filter((item) => item.result)
    .reduce((sum, item) => sum + (item.result?.stats.savings || 0), 0);

  return (
    <>
      <div className="hb-root">
        {/* Upload Section */}
        <div className="hb-section">
          <div className="hb-section-header">
            <div className="hb-section-title">
              <i className="ti ti-upload" />
              Upload HTML Files
            </div>
            {items.length > 0 && (
              <button
                type="button"
                className="hb-action-btn hb-action-btn--secondary"
                onClick={clearAll}
                disabled={isProcessing}
              >
                <i className="ti ti-trash" />
                Clear All
              </button>
            )}
          </div>

          <div className="hb-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              id="batch-files"
              className="hb-file-input"
              multiple
              accept=".html,.htm"
              onChange={handleFilesChange}
              disabled={isProcessing}
            />
            <label htmlFor="batch-files" className="hb-upload-zone">
              <div className="hb-upload-icon">
                <i className="ti ti-cloud-upload" />
              </div>
              <div className="hb-upload-content">
                <p className="hb-upload-title">Drop HTML files here or click to browse</p>
                <p className="hb-upload-subtitle">
                  Supports .html and .htm files • Multiple files allowed
                </p>
              </div>
            </label>
          </div>

          {items.length > 0 && (
            <div className="hb-batch-summary">
              <div className="hb-summary-stats">
                <span className="hb-summary-stat">
                  <i className="ti ti-files" />
                  {items.length} file{items.length !== 1 ? "s" : ""}
                </span>
                <span className="hb-summary-stat">
                  <i className="ti ti-database" />
                  {formatBytes(items.reduce((sum, item) => sum + item.size, 0))}
                </span>
                <span className="hb-summary-stat">
                  <i className="ti ti-adjustments" />
                  {options.mode}
                </span>
              </div>
              <button
                type="button"
                className="hb-action-btn hb-action-btn--primary"
                onClick={processAll}
                disabled={isProcessing || items.length === 0}
              >
                <i className={`ti ${isProcessing ? "ti-loader hb-spin" : "ti-play"}`} />
                {isProcessing ? `Processing... ${progress}%` : "Process All"}
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="hb-progress-section">
            <div className="hb-progress-header">
              <span className="hb-progress-label">Processing {progress}%</span>
              <span className="hb-progress-detail">
                {completedCount} of {items.length} completed
              </span>
            </div>
            <div className="hb-progress-bar">
              <div className="hb-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Results */}
        {items.length > 0 && (
          <div className="hb-section">
            <div className="hb-section-header">
              <div className="hb-section-title">
                <i className="ti ti-list-check" />
                Results
                {completedCount > 0 && (
                  <span className="hb-result-badge hb-result-badge--success">
                    {completedCount} completed
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="hb-result-badge hb-result-badge--error">
                    {errorCount} error{errorCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="hb-section-actions">
                {totalSavings !== 0 && (
                  <span className="hb-savings-badge">
                    <i className="ti ti-discount-check" />
                    {totalSavings > 0 ? "Saved" : "Added"} {formatBytes(Math.abs(totalSavings))}
                  </span>
                )}
                {completedCount > 0 && (
                  <button
                    type="button"
                    className="hb-action-btn hb-action-btn--secondary"
                    onClick={downloadAll}
                  >
                    <i className="ti ti-download" />
                    Download All
                  </button>
                )}
              </div>
            </div>

            <div className="hb-results">
              {items.map((item) => (
                <div key={item.id} className="hb-result-item">
                  <div className="hb-result-header">
                    <div className="hb-result-info">
                      <div className="hb-result-name">
                        <i className="ti ti-file-code" />
                        <span className="hb-result-title">{item.name}</span>
                        <span className="hb-result-size">{formatBytes(item.size)}</span>
                      </div>
                      {item.result && (
                        <div className="hb-result-savings">
                          {item.result.stats.savings > 0 ? (
                            <span className="hb-savings-positive">
                              ↓ {formatBytes(item.result.stats.savings)} (
                              {item.result.stats.savingsPercent}%)
                            </span>
                          ) : item.result.stats.savings < 0 ? (
                            <span className="hb-savings-negative">
                              ↑ {formatBytes(Math.abs(item.result.stats.savings))} (
                              {Math.abs(item.result.stats.savingsPercent)}%)
                            </span>
                          ) : (
                            <span className="hb-savings-neutral">No change</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="hb-result-actions">
                      <div className={`hb-result-status hb-result-status--${item.status}`}>
                        {item.status === "pending" && <i className="ti ti-clock" />}
                        {item.status === "processing" && <i className="ti ti-loader hb-spin" />}
                        {item.status === "completed" && <i className="ti ti-check" />}
                        {item.status === "error" && <i className="ti ti-alert-circle" />}
                        <span>{item.status}</span>
                      </div>

                      {item.status === "completed" && (
                        <>
                          <button
                            type="button"
                            className={`hb-icon-btn ${copiedId === item.id ? "copied" : ""}`}
                            onClick={() => copyResult(item)}
                            title="Copy output"
                          >
                            <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                          </button>
                          <button
                            type="button"
                            className="hb-icon-btn"
                            onClick={() => downloadResult(item)}
                            title="Download"
                          >
                            <i className="ti ti-download" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className="hb-remove-btn"
                        onClick={() => removeItem(item.id)}
                        disabled={isProcessing}
                        title="Remove"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>

                  {item.status === "error" && item.error && (
                    <div className="hb-result-error">
                      <i className="ti ti-alert-triangle" />
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <div className="hb-empty">
            <div className="hb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <h3 className="hb-empty-title">Batch HTML Processing</h3>
            <p className="hb-empty-description">
              Upload multiple HTML files to process them all at once with the same settings.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .hb-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        /* Section styles */
        .hb-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .hb-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .hb-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .hb-section-title i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .hb-section-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Action buttons */
        .hb-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          border: 0.5px solid var(--border);
        }

        .hb-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hb-action-btn i {
          font-size: 13px;
        }

        .hb-action-btn--primary {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        .hb-action-btn--primary:hover:not(:disabled) {
          background: var(--brand-hover);
          border-color: var(--brand-hover);
        }

        .hb-action-btn--secondary {
          background: var(--bg-card);
          color: var(--text-secondary);
        }

        .hb-action-btn--secondary:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        /* Upload area */
        .hb-upload-area {
          padding: 16px;
        }

        .hb-file-input {
          display: none;
        }

        .hb-upload-zone {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.15s;
          background: var(--bg-surface);
        }

        .hb-upload-zone:hover {
          border-color: var(--brand);
          background: var(--brand-light);
        }

        .hb-upload-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .hb-upload-content {
          flex: 1;
        }

        .hb-upload-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 4px;
        }

        .hb-upload-subtitle {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
        }

        /* Batch summary */
        .hb-batch-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .hb-summary-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hb-summary-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .hb-summary-stat i {
          font-size: 12px;
        }

        /* Progress */
        .hb-progress-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
        }

        .hb-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 8px;
        }

        .hb-progress-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .hb-progress-detail {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .hb-progress-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-surface);
          border-radius: 4px;
          overflow: hidden;
        }

        .hb-progress-fill {
          height: 100%;
          background: var(--brand);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* Badges */
        .hb-result-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hb-result-badge--success {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .hb-result-badge--error {
          background: #fef2f2;
          color: #dc2626;
          border: 0.5px solid #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .hb-result-badge--error {
            background: #1f1517;
            color: #f87171;
            border-color: #3c1518;
          }
        }

        .hb-savings-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #166534;
        }

        @media (prefers-color-scheme: dark) {
          .hb-savings-badge {
            color: #4ade80;
          }
        }

        .hb-savings-badge i {
          font-size: 12px;
        }

        /* Results list */
        .hb-results {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
        }

        .hb-result-item {
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
        }

        .hb-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          gap: 12px;
        }

        .hb-result-info {
          flex: 1;
          min-width: 0;
        }

        .hb-result-name {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .hb-result-name i {
          font-size: 14px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .hb-result-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .hb-result-size {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          flex-shrink: 0;
        }

        .hb-result-savings {
          font-size: 11px;
          font-family: var(--font-mono);
        }

        .hb-savings-positive {
          color: #166534;
        }

        .hb-savings-negative {
          color: #d97706;
        }

        .hb-savings-neutral {
          color: var(--text-tertiary);
        }

        @media (prefers-color-scheme: dark) {
          .hb-savings-positive {
            color: #4ade80;
          }
          .hb-savings-negative {
            color: #fbbf24;
          }
        }

        .hb-result-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .hb-result-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hb-result-status i {
          font-size: 11px;
        }

        .hb-result-status--pending {
          background: var(--bg-surface);
          color: var(--text-disabled);
          border: 0.5px solid var(--border);
        }

        .hb-result-status--processing {
          background: #eff6ff;
          color: #1d4ed8;
          border: 0.5px solid #bfdbfe;
        }

        .hb-result-status--completed {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .hb-result-status--error {
          background: #fef2f2;
          color: #dc2626;
          border: 0.5px solid #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .hb-result-status--processing {
            background: #0a1628;
            color: #93c5fd;
            border-color: #1e3a5f;
          }

          .hb-result-status--error {
            background: #1f1517;
            color: #f87171;
            border-color: #3c1518;
          }
        }

        .hb-icon-btn,
        .hb-remove-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-tertiary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .hb-icon-btn:hover,
        .hb-remove-btn:hover:not(:disabled) {
          background: var(--bg-card);
          color: var(--text);
        }

        .hb-icon-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .hb-remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hb-result-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 12px;
          border-top: 0.5px solid var(--border);
        }

        @media (prefers-color-scheme: dark) {
          .hb-result-error {
            background: #1f1517;
            color: #f87171;
          }
        }

        .hb-result-error i {
          font-size: 14px;
          flex-shrink: 0;
        }

        /* Empty state */
        .hb-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 24px;
          text-align: center;
        }

        .hb-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--text-disabled);
        }

        .hb-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .hb-empty-description {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 400px;
          line-height: 1.6;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .hb-spin {
          animation: spin 1s linear infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hb-root {
            padding: 12px;
          }

          .hb-upload-zone {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .hb-batch-summary {
            flex-direction: column;
            align-items: stretch;
          }

          .hb-summary-stats {
            justify-content: space-around;
          }

          .hb-result-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .hb-result-actions {
            justify-content: flex-end;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-action-btn,
          .hb-upload-zone,
          .hb-progress-fill,
          .hb-icon-btn,
          .hb-remove-btn {
            transition: none;
          }

          .hb-spin {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
