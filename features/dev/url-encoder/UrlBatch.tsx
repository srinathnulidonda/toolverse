// features/dev/url-encoder/UrlBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { encodeUrl, decodeUrl, type Mode, type EncodingOptions } from "./utils";
import { formatBytes } from "@/utils";

interface BatchItem {
  id: string;
  input: string;
  output: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
  inputSize: number;
  outputSize: number;
}

interface UrlBatchProps {
  mode: Mode;
  options: EncodingOptions;
}

export default function UrlBatch({ mode, options }: UrlBatchProps) {
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
      inputSize: new Blob([input]).size,
      outputSize: 0,
    }));

    setItems(newItems);

    // Process each item
    for (let i = 0; i < newItems.length; i++) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "processing" as const } : item))
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        let output: string;
        if (mode === "encode") {
          output = encodeUrl(newItems[i].input, options);
        } else {
          const result = decodeUrl(newItems[i].input, options);
          if (result.error) throw new Error(result.error);
          output = result.result;
        }

        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                ...item,
                output,
                outputSize: new Blob([output]).size,
                status: "done" as const,
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
                error: err instanceof Error ? err.message : "Failed",
              }
              : item
          )
        );
      }
    }

    setProcessing(false);
  }, [batchInput, separator, mode, options]);

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
    a.download = `batch-${mode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items, mode]);

  const handleClear = useCallback(() => {
    setBatchInput("");
    setItems([]);
  }, []);

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  const inputCount = batchInput
    .split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";")
    .filter((s) => s.trim()).length;

  return (
    <>
      <div className="ubt-root">
        {/*  Input Section  */}
        <div className="ubt-section">
          <div className="ubt-section-header">
            <div className="ubt-section-label">
              <i className="ti ti-files" />
              Batch Input
            </div>
            <div className="ubt-section-actions">
              <div className="ubt-separator-group">
                <span className="ubt-separator-label">Split by:</span>
                <select
                  className="ubt-select"
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
                className="ubt-btn"
                onClick={handleClear}
                disabled={!batchInput && items.length === 0}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="ubt-textarea"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder={`Enter multiple ${mode === "encode" ? "URLs" : "encoded strings"} (one per line)...`}
            rows={8}
            disabled={processing}
            spellCheck={false}
          />
          <div className="ubt-input-footer">
            <span className="ubt-input-count">
              {inputCount} {inputCount === 1 ? "item" : "items"}
            </span>
            <button
              type="button"
              className="ubt-btn ubt-btn-primary"
              onClick={handleProcess}
              disabled={!batchInput.trim() || processing}
            >
              <i className={`ti ${processing ? "ti-loader" : "ti-player-play"}`} />
              {processing ? "Processing..." : `${mode === "encode" ? "Encode" : "Decode"} All`}
            </button>
          </div>
        </div>

        {/*  Results Section  */}
        {items.length > 0 && (
          <div className="ubt-section">
            <div className="ubt-section-header">
              <div className="ubt-section-label">
                <i className="ti ti-list-check" />
                Results
                <span className="ubt-results-badge">
                  {doneCount}/{items.length}
                </span>
                {errorCount > 0 && <span className="ubt-error-badge">{errorCount} errors</span>}
              </div>
              <div className="ubt-section-actions">
                <button
                  type="button"
                  className="ubt-btn"
                  onClick={handleCopyAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-copy" />
                  Copy All
                </button>
                <button
                  type="button"
                  className="ubt-btn"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  Download
                </button>
              </div>
            </div>

            <div className="ubt-results">
              {items.map((item, idx) => (
                <div key={item.id} className={`ubt-result-item status-${item.status}`}>
                  <div className="ubt-result-header">
                    <div className="ubt-result-index">#{idx + 1}</div>
                    <div className="ubt-result-status">
                      {item.status === "pending" && (
                        <span className="ubt-status-badge pending">
                          <i className="ti ti-clock" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="ubt-status-badge processing">
                          <i className="ti ti-loader" />
                          Processing
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="ubt-status-badge done">
                          <i className="ti ti-check" />
                          Done
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="ubt-status-badge error">
                          <i className="ti ti-alert-circle" />
                          Error
                        </span>
                      )}
                    </div>
                    <div className="ubt-result-sizes">
                      {formatBytes(item.inputSize)} → {formatBytes(item.outputSize)}
                    </div>
                    {item.status === "done" && (
                      <button
                        type="button"
                        className="ubt-icon-btn"
                        onClick={() => navigator.clipboard.writeText(item.output)}
                        title="Copy result"
                      >
                        <i className="ti ti-copy" />
                      </button>
                    )}
                  </div>
                  <div className="ubt-result-content">
                    <div className="ubt-result-input">
                      <span className="ubt-result-label">Input:</span>
                      <code className="ubt-result-code">
                        {item.input.substring(0, 80)}
                        {item.input.length > 80 ? "..." : ""}
                      </code>
                    </div>
                    {item.status === "done" && (
                      <div className="ubt-result-output">
                        <span className="ubt-result-label">Output:</span>
                        <code className="ubt-result-code">
                          {item.output.substring(0, 80)}
                          {item.output.length > 80 ? "..." : ""}
                        </code>
                      </div>
                    )}
                    {item.status === "error" && item.error && (
                      <div className="ubt-result-error">
                        <i className="ti ti-alert-triangle" />
                        {item.error}
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
          <div className="ubt-empty">
            <div className="ubt-empty-icon">
              <i className="ti ti-files" />
            </div>
            <p className="ubt-empty-title">Batch {mode === "encode" ? "Encode" : "Decode"}</p>
            <p className="ubt-empty-desc">
              Process multiple {mode === "encode" ? "URLs" : "encoded strings"} at once. Enter one
              per line above.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
