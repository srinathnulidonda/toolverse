// features/dev/json-minifier/JSONBatch.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef } from "react";
import { processJSON, type ProcessOptions, type ProcessResult, formatBytes } from "./jsonEngine";

interface BatchItem {
  id: string;
  name: string;
  content: string;
  size: number;
  status: "pending" | "processing" | "completed" | "error";
  result?: ProcessResult;
  error?: string;
}

interface JSONBatchProps {
  options: ProcessOptions;
  onComplete?: (items: BatchItem[]) => void;
}

export default function JSONBatch({ options, onComplete }: JSONBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems: BatchItem[] = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".json")) continue;
      try {
        const text = await file.text();
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          content: text,
          size: file.size,
          status: "pending",
        });
      } catch {
        logger.error(`Failed to read ${file.name}`);
      }
    }

    setItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const processAll = useCallback(async () => {
    if (!items.length || isProcessing) return;
    setIsProcessing(true);
    setProgress(0);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "processing" as const } : p))
      );
      await new Promise((r) => setTimeout(r, 0));

      try {
        const result = processJSON(item.content, options);
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "completed" as const, result } : p))
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                ...p,
                status: "error" as const,
                error: err instanceof Error ? err.message : "Parse error",
              }
              : p
          )
        );
      }

      setProgress(Math.round(((i + 1) / items.length) * 100));
    }

    setIsProcessing(false);
    onComplete?.(items.filter((i) => i.status === "completed"));
  }, [items, options, isProcessing, onComplete]);

  const downloadItem = useCallback(
    (item: BatchItem) => {
      if (!item.result) return;
      const blob = new Blob([item.result.output], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name.replace(/\.json$/i, `_${options.mode}.json`);
      a.click();
      URL.revokeObjectURL(url);
    },
    [options.mode]
  );

  const downloadAll = useCallback(() => {
    items.filter((i) => i.status === "completed").forEach(downloadItem);
  }, [items, downloadItem]);

  const copyItem = useCallback(async (item: BatchItem) => {
    if (!item.result) return;
    await navigator.clipboard.writeText(item.result.output);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(""), 1500);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const completedCount = items.filter((i) => i.status === "completed").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const totalSavings = items.reduce((acc, i) => acc + (i.result?.stats.savings || 0), 0);

  return (
    <>
      <div className="jb-root">
        {/* Upload */}
        <div className="jb-section">
          <div className="jb-section-header">
            <div className="jb-section-title">
              <i className="ti ti-upload" />
              Upload JSON Files
            </div>
            {items.length > 0 && (
              <button
                type="button"
                className="jb-action-btn jb-action-btn--ghost"
                onClick={() => {
                  setItems([]);
                  setProgress(0);
                }}
                disabled={isProcessing}
              >
                <i className="ti ti-trash" />
                Clear All
              </button>
            )}
          </div>

          <div className="jb-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              id="jb-json-files"
              className="jb-file-input"
              multiple
              accept=".json"
              onChange={handleFiles}
              disabled={isProcessing}
            />
            <label htmlFor="jb-json-files" className="jb-drop-zone">
              <div className="jb-drop-icon">
                <i className="ti ti-cloud-upload" />
              </div>
              <div>
                <p className="jb-drop-title">Drop JSON files here or click to browse</p>
                <p className="jb-drop-sub">.json files only · Multiple files supported</p>
              </div>
            </label>
          </div>

          {items.length > 0 && (
            <div className="jb-summary-bar">
              <div className="jb-summary-stats">
                <span className="jb-summary-stat">
                  <i className="ti ti-files" />
                  {items.length} file{items.length !== 1 ? "s" : ""}
                </span>
                <span className="jb-summary-stat">
                  <i className="ti ti-database" />
                  {formatBytes(items.reduce((s, i) => s + i.size, 0))}
                </span>
                <span className="jb-summary-stat">
                  <i className="ti ti-adjustments" />
                  {options.mode}
                </span>
              </div>
              <button
                type="button"
                className="jb-action-btn jb-action-btn--primary"
                onClick={processAll}
                disabled={isProcessing}
              >
                <i className={`ti ${isProcessing ? "ti-loader jb-spin" : "ti-play"}`} />
                {isProcessing ? `Processing… ${progress}%` : "Process All"}
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="jb-progress-wrap">
            <div className="jb-progress-top">
              <span className="jb-progress-label">Processing {progress}%</span>
              <span className="jb-progress-sub">
                {completedCount} of {items.length} done
              </span>
            </div>
            <div className="jb-progress-track">
              <div className="jb-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Results */}
        {items.length > 0 && (
          <div className="jb-section">
            <div className="jb-section-header">
              <div className="jb-section-title">
                <i className="ti ti-list-check" />
                Results
                {completedCount > 0 && (
                  <span className="jb-badge jb-badge--success">{completedCount} done</span>
                )}
                {errorCount > 0 && (
                  <span className="jb-badge jb-badge--error">
                    {errorCount} error{errorCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="jb-header-right">
                {totalSavings > 0 && (
                  <span className="jb-savings-badge">
                    <i className="ti ti-discount-check" />
                    Saved {formatBytes(totalSavings)}
                  </span>
                )}
                {completedCount > 0 && (
                  <button
                    type="button"
                    className="jb-action-btn jb-action-btn--ghost"
                    onClick={downloadAll}
                  >
                    <i className="ti ti-download" />
                    Download All
                  </button>
                )}
              </div>
            </div>

            <div className="jb-results">
              {items.map((item) => (
                <div key={item.id} className="jb-result-row">
                  <div className="jb-result-info">
                    <i className="ti ti-file-code" />
                    <div className="jb-result-name-wrap">
                      <span className="jb-result-name">{item.name}</span>
                      <span className="jb-result-size">{formatBytes(item.size)}</span>
                    </div>
                    {item.result && (
                      <span
                        className={`jb-result-savings ${item.result.stats.savings > 0 ? "positive" : ""}`}
                      >
                        {item.result.stats.savings > 0
                          ? `↓ ${formatBytes(item.result.stats.savings)} (${item.result.stats.savingsPercent}%)`
                          : item.result.stats.savings < 0
                            ? `↑ ${formatBytes(Math.abs(item.result.stats.savings))}`
                            : "No change"}
                      </span>
                    )}
                  </div>

                  <div className="jb-result-actions">
                    <div className={`jb-status jb-status--${item.status}`}>
                      <i
                        className={`ti ${item.status === "pending"
                            ? "ti-clock"
                            : item.status === "processing"
                              ? "ti-loader jb-spin"
                              : item.status === "completed"
                                ? "ti-check"
                                : "ti-alert-circle"
                          }`}
                      />
                      <span>{item.status}</span>
                    </div>

                    {item.status === "completed" && (
                      <>
                        <button
                          type="button"
                          className={`jb-icon-btn ${copiedId === item.id ? "copied" : ""}`}
                          onClick={() => copyItem(item)}
                          title="Copy"
                        >
                          <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                        </button>
                        <button
                          type="button"
                          className="jb-icon-btn"
                          onClick={() => downloadItem(item)}
                          title="Download"
                        >
                          <i className="ti ti-download" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="jb-remove-btn"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>

                  {item.status === "error" && item.error && (
                    <div className="jb-error-row">
                      <i className="ti ti-alert-triangle" />
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {items.length === 0 && (
          <div className="jb-empty">
            <div className="jb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <h3 className="jb-empty-title">Batch JSON Processing</h3>
            <p className="jb-empty-desc">Upload multiple JSON files to process them all at once.</p>
          </div>
        )}
      </div>
    </>
  );
}
