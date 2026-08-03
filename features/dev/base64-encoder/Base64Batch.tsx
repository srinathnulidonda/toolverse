// features/dev/base64-encoder/Base64Batch.tsx
"use client";

import { useState, useCallback } from "react";
import { encodeBase64, decodeBase64, type Mode, type EncodingOptions } from "./utils";
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

interface Base64BatchProps {
  mode: Mode;
  options: EncodingOptions;
  onComplete?: () => void;
}

export default function Base64Batch({ mode, options, onComplete }: Base64BatchProps) {
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

      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing

      try {
        let output: string;
        if (mode === "encode") {
          output = encodeBase64(newItems[i].input, options);
        } else {
          const result = decodeBase64(newItems[i].input, options);
          if (result.error) throw new Error(result.error);
          output = result.text;
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
    if (onComplete) onComplete();
  }, [batchInput, separator, mode, options, onComplete]);

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

  return (
    <>
      <div className="bb-root">
        {/*  Input Section  */}
        <div className="bb-section">
          <div className="bb-section-header">
            <div className="bb-section-label">
              <i className="ti ti-files" />
              Batch Input
            </div>
            <div className="bb-section-actions">
              <div className="bb-separator-group">
                <span className="bb-separator-label">Split by:</span>
                <select
                  className="bb-select"
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
                className="bb-btn"
                onClick={handleClear}
                disabled={!batchInput && items.length === 0}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="bb-textarea"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder={`Enter multiple ${mode === "encode" ? "strings" : "Base64 strings"} (one per line)...`}
            rows={8}
            disabled={processing}
          />
          <div className="bb-input-footer">
            <span className="bb-input-count">
              {
                batchInput
                  .split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";")
                  .filter((s) => s.trim()).length
              }{" "}
              items
            </span>
            <button
              type="button"
              className="bb-btn bb-btn-primary"
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
          <div className="bb-section">
            <div className="bb-section-header">
              <div className="bb-section-label">
                <i className="ti ti-list-check" />
                Results
                <span className="bb-results-badge">
                  {doneCount}/{items.length}
                </span>
                {errorCount > 0 && <span className="bb-error-badge">{errorCount} errors</span>}
              </div>
              <div className="bb-section-actions">
                <button
                  type="button"
                  className="bb-btn"
                  onClick={handleCopyAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-copy" />
                  Copy All
                </button>
                <button
                  type="button"
                  className="bb-btn"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  Download
                </button>
              </div>
            </div>

            <div className="bb-results">
              {items.map((item, idx) => (
                <div key={item.id} className={`bb-result-item status-${item.status}`}>
                  <div className="bb-result-header">
                    <div className="bb-result-index">#{idx + 1}</div>
                    <div className="bb-result-status">
                      {item.status === "pending" && (
                        <span className="bb-status-badge pending">
                          <i className="ti ti-clock" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="bb-status-badge processing">
                          <i className="ti ti-loader" />
                          Processing
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="bb-status-badge done">
                          <i className="ti ti-check" />
                          Done
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="bb-status-badge error">
                          <i className="ti ti-alert-circle" />
                          Error
                        </span>
                      )}
                    </div>
                    <div className="bb-result-sizes">
                      {formatBytes(item.inputSize)} → {formatBytes(item.outputSize)}
                    </div>
                    {item.status === "done" && (
                      <button
                        type="button"
                        className="bb-icon-btn"
                        onClick={() => navigator.clipboard.writeText(item.output)}
                        title="Copy result"
                      >
                        <i className="ti ti-copy" />
                      </button>
                    )}
                  </div>
                  <div className="bb-result-content">
                    <div className="bb-result-input">
                      <span className="bb-result-label">Input:</span>
                      <code className="bb-result-code">
                        {item.input.substring(0, 60)}
                        {item.input.length > 60 ? "..." : ""}
                      </code>
                    </div>
                    {item.status === "done" && (
                      <div className="bb-result-output">
                        <span className="bb-result-label">Output:</span>
                        <code className="bb-result-code">
                          {item.output.substring(0, 60)}
                          {item.output.length > 60 ? "..." : ""}
                        </code>
                      </div>
                    )}
                    {item.status === "error" && item.error && (
                      <div className="bb-result-error">
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
          <div className="bb-empty">
            <div className="bb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <p className="bb-empty-title">Batch {mode === "encode" ? "Encode" : "Decode"}</p>
            <p className="bb-empty-desc">
              Process multiple {mode === "encode" ? "strings" : "Base64 strings"} at once. Enter one
              per line above.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
