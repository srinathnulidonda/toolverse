// features/dev/css-minifier/CSSBatch.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { processCSS } from "./utils";
import { formatBytes } from "@/utils";

interface BatchItem {
  id: string;
  name: string;
  input: string;
  output: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
  stats?: {
    original: number;
    minified: number;
    savings: number;
    savingsPercent: number;
  };
}

interface CSSBatchProps {
  onComplete?: (count: number) => void;
}

export default function CSSBatch({ onComplete }: CSSBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: BatchItem[] = [];

    for (const file of files) {
      if (!file.name.endsWith(".css")) continue;

      try {
        const text = await file.text();
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          input: text,
          output: "",
          status: "pending",
        });
      } catch {
        // Skip files that can't be read
      }
    }

    setItems(newItems);
  }, []);

  const handleProcess = useCallback(async () => {
    if (items.length === 0) return;

    setProcessing(true);

    for (let i = 0; i < items.length; i++) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "processing" as const } : item))
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const result = processCSS(items[i].input);

        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                ...item,
                output: result.output,
                status: "done" as const,
                stats: {
                  original: result.stats.original,
                  minified: result.stats.minified,
                  savings: result.stats.savings,
                  savingsPercent: result.stats.savingsPercent,
                },
              }
              : item
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                ...item,
                status: "error" as const,
                error: err instanceof Error ? err.message : "Failed to minify",
              }
              : item
          )
        );
      }
    }

    setProcessing(false);
    if (onComplete) onComplete(items.length);
  }, [items, onComplete]);

  const handleDownloadAll = useCallback(() => {
    items
      .filter((item) => item.status === "done")
      .forEach((item) => {
        const blob = new Blob([item.output], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name.replace(".css", ".min.css");
        a.click();
        URL.revokeObjectURL(url);
      });
  }, [items]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  }, []);

  const doneCount = items.filter((i) => i.status === "done").length;
  const totalSavings = useMemo(() => {
    return items
      .filter((i) => i.status === "done")
      .reduce((acc, item) => acc + (item.stats?.savings || 0), 0);
  }, [items]);

  return (
    <>
      <div className="cb-root">
        {/*  Upload Section  */}
        <div className="cb-section">
          <div className="cb-section-header">
            <div className="cb-section-label">
              <i className="ti ti-upload" />
              Upload CSS Files
            </div>
            {items.length > 0 && (
              <button
                type="button"
                className="cb-btn"
                onClick={() => setItems([])}
                disabled={processing}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            )}
          </div>

          <div className="cb-upload-area">
            <input
              type="file"
              id="css-files"
              className="cb-file-input"
              multiple
              accept=".css"
              onChange={handleFilesChange}
              disabled={processing}
            />
            <label htmlFor="css-files" className="cb-upload-label">
              <div className="cb-upload-icon">
                <i className="ti ti-file-upload" />
              </div>
              <p className="cb-upload-title">Choose CSS files</p>
              <p className="cb-upload-desc">Select multiple .css files to minify</p>
            </label>
          </div>

          {items.length > 0 && (
            <div className="cb-upload-footer">
              <span className="cb-upload-count">
                {items.length} {items.length === 1 ? "file" : "files"} selected
              </span>
              <button
                type="button"
                className="cb-btn cb-btn-primary"
                onClick={handleProcess}
                disabled={processing}
              >
                <i className={`ti ${processing ? "ti-loader" : "ti-wand"}`} />
                {processing ? "Processing..." : "Minify All"}
              </button>
            </div>
          )}
        </div>

        {/*  Results Section  */}
        {items.length > 0 && (
          <div className="cb-section">
            <div className="cb-section-header">
              <div className="cb-section-label">
                <i className="ti ti-list-check" />
                Results
                {doneCount > 0 && (
                  <span className="cb-count-badge">
                    {doneCount}/{items.length}
                  </span>
                )}
              </div>
              <div className="cb-section-actions">
                {totalSavings > 0 && (
                  <span className="cb-savings-badge">
                    <i className="ti ti-discount-check" />
                    Saved {formatBytes(totalSavings)}
                  </span>
                )}
                <button
                  type="button"
                  className="cb-btn"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  Download All
                </button>
              </div>
            </div>

            <div className="cb-results">
              {items.map((item, idx) => (
                <div key={item.id} className="cb-result-item">
                  <div className="cb-result-header">
                    <div className="cb-result-index">#{idx + 1}</div>
                    <div className="cb-result-info">
                      <span className="cb-result-name">{item.name}</span>
                      {item.stats && (
                        <span className="cb-result-stats">
                          {formatBytes(item.stats.original)} → {formatBytes(item.stats.minified)} (
                          {item.stats.savingsPercent}% saved)
                        </span>
                      )}
                    </div>
                    <div className="cb-result-status">
                      {item.status === "pending" && (
                        <span className="cb-status-badge pending">
                          <i className="ti ti-clock" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="cb-status-badge processing">
                          <i className="ti ti-loader" />
                          Processing
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="cb-status-badge done">
                          <i className="ti ti-check" />
                          Done
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="cb-status-badge error">
                          <i className="ti ti-alert-circle" />
                          Error
                        </span>
                      )}
                    </div>
                    {item.status === "done" && (
                      <button
                        type="button"
                        className={`cb-copy-btn${copiedId === item.id ? " copied" : ""}`}
                        onClick={() => handleCopy(item.output, item.id)}
                      >
                        <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                      </button>
                    )}
                  </div>

                  {item.status === "error" && item.error && (
                    <div className="cb-result-error">
                      <i className="ti ti-alert-triangle" />
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/*  Empty State  */}
        {items.length === 0 && (
          <div className="cb-empty">
            <div className="cb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <p className="cb-empty-title">Batch CSS Minifier</p>
            <p className="cb-empty-desc">
              Upload multiple CSS files and minify them all at once. Results can be downloaded
              individually or as a batch.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
