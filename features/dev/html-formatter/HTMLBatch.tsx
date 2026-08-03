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
    </>
  );
}
