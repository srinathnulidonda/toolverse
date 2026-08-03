// features/dev/slug-generator/SlugBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { generateSlug, formatBytes, type SlugOptions } from "./utils";

interface BatchItem {
  id: string;
  input: string;
  output: string;
  status: "pending" | "processing" | "done";
}

interface SlugBatchProps {
  options: SlugOptions;
  onComplete?: () => void;
}

export default function SlugBatch({ options, onComplete }: SlugBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [batchInput, setBatchInput] = useState("");
  const [separator, setSeparator] = useState<"newline" | "comma" | "semicolon">("newline");
  const [processing, setProcessing] = useState(false);

  const handleProcess = useCallback(async () => {
    if (!batchInput.trim()) return;

    setProcessing(true);

    const separatorMap = {
      newline: "\n",
      comma: ",",
      semicolon: ";",
    };

    const inputs = batchInput
      .split(separatorMap[separator])
      .map((s) => s.trim())
      .filter(Boolean);

    const newItems: BatchItem[] = inputs.map((input, i) => ({
      id: `${Date.now()}-${i}`,
      input,
      output: "",
      status: "pending" as const,
    }));

    setItems(newItems);

    // Process each item
    for (let i = 0; i < newItems.length; i++) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "processing" as const } : item))
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      const output = generateSlug(newItems[i].input, options);

      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i
            ? {
              ...item,
              output,
              status: "done" as const,
            }
            : item
        )
      );
    }

    setProcessing(false);
    if (onComplete) onComplete();
  }, [batchInput, separator, options, onComplete]);

  const handleCopyAll = useCallback(async () => {
    const outputs = items.filter((i) => i.status === "done").map((i) => i.output);
    await navigator.clipboard.writeText(outputs.join("\n"));
  }, [items]);

  const handleDownloadAll = useCallback(() => {
    const outputs = items.filter((i) => i.status === "done").map((i) => i.output);
    const blob = new Blob([outputs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch-slugs.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const handleClear = useCallback(() => {
    setBatchInput("");
    setItems([]);
  }, []);

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <>
      <div className="sb-root">
        {/*  Input Section  */}
        <div className="sb-section">
          <div className="sb-section-header">
            <div className="sb-section-label">
              <i className="ti ti-files" />
              Batch Input
            </div>
            <div className="sb-section-actions">
              <div className="sb-separator-group">
                <span className="sb-separator-label">Split by:</span>
                <select
                  className="sb-select"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value as any)}
                  disabled={processing}
                >
                  <option value="newline">New line</option>
                  <option value="comma">Comma (,)</option>
                  <option value="semicolon">Semicolon (;)</option>
                </select>
              </div>
              <button
                type="button"
                className="sb-btn"
                onClick={handleClear}
                disabled={!batchInput && items.length === 0}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="sb-textarea"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Enter multiple texts (one per line)...&#10;&#10;Example:&#10;How to Build Web Apps&#10;Product Launch 2024&#10;SEO Best Practices"
            rows={10}
            disabled={processing}
          />
          <div className="sb-input-footer">
            <span className="sb-input-count">
              {
                batchInput
                  .split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";")
                  .filter((s) => s.trim()).length
              }{" "}
              items
            </span>
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={handleProcess}
              disabled={!batchInput.trim() || processing}
            >
              <i className={`ti ${processing ? "ti-loader" : "ti-player-play"}`} />
              {processing ? "Processing..." : "Generate All Slugs"}
            </button>
          </div>
        </div>

        {/*  Results Section  */}
        {items.length > 0 && (
          <div className="sb-section">
            <div className="sb-section-header">
              <div className="sb-section-label">
                <i className="ti ti-list-check" />
                Results
                <span className="sb-results-badge">
                  {doneCount}/{items.length}
                </span>
              </div>
              <div className="sb-section-actions">
                <button
                  type="button"
                  className="sb-btn"
                  onClick={handleCopyAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-copy" />
                  Copy All
                </button>
                <button
                  type="button"
                  className="sb-btn"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  Download
                </button>
              </div>
            </div>

            <div className="sb-results">
              {items.map((item, idx) => (
                <div key={item.id} className={`sb-result-item status-${item.status}`}>
                  <div className="sb-result-header">
                    <div className="sb-result-index">#{idx + 1}</div>
                    <div className="sb-result-status">
                      {item.status === "pending" && (
                        <span className="sb-status-badge pending">
                          <i className="ti ti-clock" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="sb-status-badge processing">
                          <i className="ti ti-loader" />
                          Processing
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="sb-status-badge done">
                          <i className="ti ti-check" />
                          Done
                        </span>
                      )}
                    </div>
                    {item.status === "done" && (
                      <button
                        type="button"
                        className="sb-icon-btn"
                        onClick={() => navigator.clipboard.writeText(item.output)}
                        title="Copy result"
                      >
                        <i className="ti ti-copy" />
                      </button>
                    )}
                  </div>
                  <div className="sb-result-content">
                    <div className="sb-result-input">
                      <span className="sb-result-label">Input:</span>
                      <div className="sb-result-text">{item.input}</div>
                    </div>
                    {item.status === "done" && (
                      <div className="sb-result-output">
                        <span className="sb-result-label">Slug:</span>
                        <code className="sb-result-code">{item.output}</code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/*  Empty State  */}
        {items.length === 0 && !batchInput && (
          <div className="sb-empty">
            <div className="sb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <p className="sb-empty-title">Batch Slug Generation</p>
            <p className="sb-empty-desc">
              Process multiple texts at once. Enter one per line above.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
