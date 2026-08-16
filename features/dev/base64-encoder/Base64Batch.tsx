// features\dev\base64-encoder\Base64Batch.tsx
"use client";

import { useState, useCallback } from "react";
import { encodeBase64, decodeBase64, type Mode, type EncodingOptions } from "./ts/utils";
import { formatBytes } from "@/utils";
import styles from "./style/Base64Batch.module.css";

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
    <div className={styles.root}>
      {/*  Input Section  */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>
            <i className="ti ti-files" />
            Batch Input
          </div>
          <div className={styles.sectionActions}>
            <div className={styles.separatorGroup}>
              <span className={styles.separatorLabel}>Split by:</span>
              <select
                className={styles.select}
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
              className={styles.btn}
              onClick={handleClear}
              disabled={!batchInput && items.length === 0}
            >
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        </div>
        <textarea
          className={styles.textarea}
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          placeholder={`Enter multiple ${mode === "encode" ? "strings" : "Base64 strings"} (one per line)...`}
          rows={8}
          disabled={processing}
        />
        <div className={styles.inputFooter}>
          <span className={styles.inputCount}>
            {
              batchInput
                .split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";")
                .filter((s) => s.trim()).length
            }{" "}
            items
          </span>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
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
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              <i className="ti ti-list-check" />
              Results
              <span className={styles.resultsBadge}>
                {doneCount}/{items.length}
              </span>
              {errorCount > 0 && <span className={styles.errorBadge}>{errorCount} errors</span>}
            </div>
            <div className={styles.sectionActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={handleCopyAll}
                disabled={doneCount === 0}
              >
                <i className="ti ti-copy" />
                Copy All
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={handleDownloadAll}
                disabled={doneCount === 0}
              >
                <i className="ti ti-download" />
                Download
              </button>
            </div>
          </div>

          <div className={styles.results}>
            {items.map((item, idx) => (
              <div key={item.id} className={`${styles.resultItem} ${styles[`status-${item.status}`]}`}>
                <div className={styles.resultHeader}>
                  <div className={styles.resultIndex}>#{idx + 1}</div>
                  <div className={styles.resultStatus}>
                    {item.status === "pending" && (
                      <span className={`${styles.statusBadge} ${styles.pending}`}>
                        <i className="ti ti-clock" />
                        Pending
                      </span>
                    )}
                    {item.status === "processing" && (
                      <span className={`${styles.statusBadge} ${styles.processing}`}>
                        <i className="ti ti-loader" />
                        Processing
                      </span>
                    )}
                    {item.status === "done" && (
                      <span className={`${styles.statusBadge} ${styles.done}`}>
                        <i className="ti ti-check" />
                        Done
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className={`${styles.statusBadge} ${styles.error}`}>
                        <i className="ti ti-alert-circle" />
                        Error
                      </span>
                    )}
                  </div>
                  <div className={styles.resultSizes}>
                    {formatBytes(item.inputSize)} → {formatBytes(item.outputSize)}
                  </div>
                  {item.status === "done" && (
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => navigator.clipboard.writeText(item.output)}
                      title="Copy result"
                    >
                      <i className="ti ti-copy" />
                    </button>
                  )}
                </div>
                <div className={styles.resultContent}>
                  <div className={styles.resultInput}>
                    <span className={styles.resultLabel}>Input:</span>
                    <code className={styles.resultCode}>
                      {item.input.substring(0, 60)}
                      {item.input.length > 60 ? "..." : ""}
                    </code>
                  </div>
                  {item.status === "done" && (
                    <div className={styles.resultOutput}>
                      <span className={styles.resultLabel}>Output:</span>
                      <code className={styles.resultCode}>
                        {item.output.substring(0, 60)}
                        {item.output.length > 60 ? "..." : ""}
                      </code>
                    </div>
                  )}
                  {item.status === "error" && item.error && (
                    <div className={styles.resultError}>
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
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <i className="ti ti-files" />
          </div>
          <p className={styles.emptyTitle}>Batch {mode === "encode" ? "Encode" : "Decode"}</p>
          <p className={styles.emptyDesc}>
            Process multiple {mode === "encode" ? "strings" : "Base64 strings"} at once. Enter one
            per line above.
          </p>
        </div>
      )}
    </div>
  );
}