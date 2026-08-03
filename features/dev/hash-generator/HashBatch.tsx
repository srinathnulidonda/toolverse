// features/dev/hash-generator/HashBatch.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef } from "react";
import {
  generateMultipleHashes,
  type HashAlgorithm,
  type HashOptions,
  type HashResult,
  formatBytes,
} from "./hashEngine";

interface BatchItem {
  id: string;
  name: string;
  content: string | ArrayBuffer;
  size: number;
  type: "text" | "file";
  status: "pending" | "processing" | "completed" | "error";
  results: HashResult[];
  error?: string;
  processingTime: number;
}

interface HashBatchProps {
  algorithms: HashAlgorithm[];
  options: Omit<HashOptions, "algorithm">;
  onComplete?: (results: BatchItem[]) => void;
}

export default function HashBatch({ algorithms, options, onComplete }: HashBatchProps) {
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
      try {
        const arrayBuffer = await file.arrayBuffer();
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          content: arrayBuffer,
          size: file.size,
          type: "file",
          status: "pending",
          results: [],
          processingTime: 0,
        });
      } catch (error) {
        logger.error(`Failed to read file ${file.name}:`, error);
      }
    }

    setItems((prev) => [...prev, ...newItems]);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const addTextItem = useCallback((text: string, name: string) => {
    const newItem: BatchItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: name || `Text ${Date.now()}`,
      content: text,
      size: new Blob([text]).size,
      type: "text",
      status: "pending",
      results: [],
      processingTime: 0,
    };

    setItems((prev) => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

      const startTime = performance.now();

      try {
        const results = await generateMultipleHashes(item.content, algorithms, options);
        const processingTime = performance.now() - startTime;

        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? {
                ...prevItem,
                status: "completed" as const,
                results,
                processingTime,
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
  }, [items, algorithms, options, isProcessing, onComplete]);

  const copyResults = useCallback(async (item: BatchItem, format: "single" | "all") => {
    let textToCopy = "";

    if (format === "single") {
      const hashesText = item.results
        .map((result) => `${result.algorithm}: ${result.hash}`)
        .join("\n");
      textToCopy = `File: ${item.name}\n${hashesText}`;
    } else {
      textToCopy = item.results.map((result) => result.hash).join("\n");
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(""), 1500);
  }, []);

  const downloadResults = useCallback(() => {
    const completedItems = items.filter((item) => item.status === "completed");
    if (completedItems.length === 0) return;

    const csvContent = [
      ["File Name", "Size", "Algorithm", "Hash", "Processing Time (ms)"],
      ...completedItems.flatMap((item) =>
        item.results.map((result) => [
          item.name,
          formatBytes(item.size),
          result.algorithm,
          result.hash,
          result.executionTime.toFixed(2),
        ])
      ),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hash_batch_results_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const clearAll = useCallback(() => {
    setItems([]);
    setProgress(0);
  }, []);

  const completedCount = items.filter((item) => item.status === "completed").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const totalProcessingTime = items.reduce((sum, item) => sum + item.processingTime, 0);

  return (
    <>
      <div className="hb-root">
        {/* Upload Section */}
        <div className="hb-section">
          <div className="hb-section-header">
            <div className="hb-section-title">
              <i className="ti ti-upload" />
              Add Files or Text
            </div>
            <div className="hb-section-actions">
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
          </div>

          <div className="hb-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              id="batch-files"
              className="hb-file-input"
              multiple
              onChange={handleFilesChange}
              disabled={isProcessing}
            />
            <label htmlFor="batch-files" className="hb-upload-zone">
              <div className="hb-upload-icon">
                <i className="ti ti-cloud-upload" />
              </div>
              <div className="hb-upload-content">
                <p className="hb-upload-title">Drop files here or click to browse</p>
                <p className="hb-upload-subtitle">
                  Support for any file type • Multiple files allowed
                </p>
              </div>
            </label>

            <div className="hb-text-input">
              <textarea
                className="hb-textarea"
                placeholder="Or paste text content here..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    const target = e.target as HTMLTextAreaElement;
                    if (target.value.trim()) {
                      addTextItem(target.value, `Text ${items.length + 1}`);
                      target.value = "";
                    }
                  }
                }}
                disabled={isProcessing}
              />
              <div className="hb-textarea-hint">
                <i className="ti ti-info-circle" />
                Press Ctrl+Enter to add text as batch item
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="hb-batch-summary">
              <div className="hb-summary-stats">
                <span className="hb-summary-stat">
                  <i className="ti ti-files" />
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
                <span className="hb-summary-stat">
                  <i className="ti ti-database" />
                  {formatBytes(items.reduce((sum, item) => sum + item.size, 0))}
                </span>
                <span className="hb-summary-stat">
                  <i className="ti ti-shield-check" />
                  {algorithms.length} algorithm{algorithms.length !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                type="button"
                className="hb-action-btn hb-action-btn--primary"
                onClick={processAll}
                disabled={isProcessing || items.length === 0}
              >
                <i className={`ti ${isProcessing ? "ti-loader" : "ti-play"}`} />
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
                {completedCount > 0 && (
                  <>
                    {totalProcessingTime > 0 && (
                      <span className="hb-processing-time">
                        Total: {totalProcessingTime.toFixed(2)}ms
                      </span>
                    )}
                    <button
                      type="button"
                      className="hb-action-btn hb-action-btn--secondary"
                      onClick={downloadResults}
                    >
                      <i className="ti ti-download" />
                      Download CSV
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="hb-results">
              {items.map((item) => (
                <div key={item.id} className="hb-result-item">
                  <div className="hb-result-header">
                    <div className="hb-result-info">
                      <div className="hb-result-name">
                        <i className={`ti ${item.type === "file" ? "ti-file" : "ti-file-text"}`} />
                        <span className="hb-result-title">{item.name}</span>
                        <span className="hb-result-size">{formatBytes(item.size)}</span>
                      </div>
                      <div className="hb-result-meta">
                        {item.status === "completed" && item.processingTime > 0 && (
                          <span className="hb-result-time">{item.processingTime.toFixed(2)}ms</span>
                        )}
                      </div>
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
                        <button
                          type="button"
                          className={`hb-copy-btn ${copiedId === item.id ? "copied" : ""}`}
                          onClick={() => copyResults(item, "single")}
                          title="Copy all hashes"
                        >
                          <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="hb-remove-btn"
                        onClick={() => removeItem(item.id)}
                        disabled={isProcessing}
                        title="Remove item"
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

                  {item.status === "completed" && item.results.length > 0 && (
                    <div className="hb-result-hashes">
                      {item.results.map((result) => (
                        <div key={result.algorithm} className="hb-hash-item">
                          <div className="hb-hash-header">
                            <span className="hb-hash-algorithm">{result.algorithm}</span>
                            <span className="hb-hash-time">
                              {result.executionTime.toFixed(2)}ms
                            </span>
                          </div>
                          <div className="hb-hash-value">{result.hash}</div>
                        </div>
                      ))}
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
            <h3 className="hb-empty-title">Batch Hash Processing</h3>
            <p className="hb-empty-description">
              Upload multiple files or add text items to generate hashes in bulk. All selected
              algorithms will be applied to each item.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
