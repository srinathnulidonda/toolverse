// features/dev/url-encoder/UrlBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { encodeUrl, decodeUrl, type Mode, type EncodingOptions } from "./ts/utils";
import { formatBytes } from "@/utils";
import styles from "./style/UrlBatch.module.css";

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
      <div className={styles.ubtRoot}>
        {/*  Input Section  */}
        <div className={styles.ubtSection}>
          <div className={styles.ubtSectionHeader}>
            <div className={styles.ubtSectionLabel}>
              <i className="ti ti-files" />
              Batch Input
            </div>
            <div className={styles.ubtSectionActions}>
              <div className={styles.ubtSeparatorGroup}>
                <span className={styles.ubtSeparatorLabel}>Split by:</span>
                <select
                  className={styles.ubtSelect}
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
                className={styles.ubtBtn}
                onClick={handleClear}
                disabled={!batchInput && items.length === 0}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            className={styles.ubtTextarea}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder={`Enter multiple ${mode === "encode" ? "URLs" : "encoded strings"} (one per line)...`}
            rows={8}
            disabled={processing}
            spellCheck={false}
          />
          <div className={styles.ubtInputFooter}>
            <span className={styles.ubtInputCount}>
              {inputCount} {inputCount === 1 ? "item" : "items"}
            </span>
            <button
              type="button"
              className={`${styles.ubtBtn} ${styles.ubtBtnPrimary}`}
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
          <div className={styles.ubtSection}>
            <div className={styles.ubtSectionHeader}>
              <div className={styles.ubtSectionLabel}>
                <i className="ti ti-list-check" />
                Results
                <span className={styles.ubtResultsBadge}>
                  {doneCount}/{items.length}
                </span>
                {errorCount > 0 && <span className={styles.ubtErrorBadge}>{errorCount} errors</span>}
              </div>
              <div className={styles.ubtSectionActions}>
                <button
                  type="button"
                  className={styles.ubtBtn}
                  onClick={handleCopyAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-copy" />
                  Copy All
                </button>
                <button
                  type="button"
                  className={styles.ubtBtn}
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  Download
                </button>
              </div>
            </div>

            <div className={styles.ubtResults}>
              {items.map((item, idx) => (
                <div key={item.id} className={`${styles.ubtResultItem} ${styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                  <div className={styles.ubtResultHeader}>
                    <div className={styles.ubtResultIndex}>#{idx + 1}</div>
                    <div className={styles.ubtResultStatus}>
                      {item.status === "pending" && (
                        <span className={`${styles.ubtStatusBadge} ${styles.pending}`}>
                          <i className="ti ti-clock" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className={`${styles.ubtStatusBadge} ${styles.processing}`}>
                          <i className="ti ti-loader" />
                          Processing
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className={`${styles.ubtStatusBadge} ${styles.done}`}>
                          <i className="ti ti-check" />
                          Done
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className={`${styles.ubtStatusBadge} ${styles.error}`}>
                          <i className="ti ti-alert-circle" />
                          Error
                        </span>
                      )}
                    </div>
                    <div className={styles.ubtResultSizes}>
                      {formatBytes(item.inputSize)} → {formatBytes(item.outputSize)}
                    </div>
                    {item.status === "done" && (
                      <button
                        type="button"
                        className={styles.ubtIconBtn}
                        onClick={() => navigator.clipboard.writeText(item.output)}
                        title="Copy result"
                      >
                        <i className="ti ti-copy" />
                      </button>
                    )}
                  </div>
                  <div className={styles.ubtResultContent}>
                    <div className={styles.ubtResultInput}>
                      <span className={styles.ubtResultLabel}>Input:</span>
                      <code className={styles.ubtResultCode}>
                        {item.input.substring(0, 80)}
                        {item.input.length > 80 ? "..." : ""}
                      </code>
                    </div>
                    {item.status === "done" && (
                      <div className={styles.ubtResultOutput}>
                        <span className={styles.ubtResultLabel}>Output:</span>
                        <code className={styles.ubtResultCode}>
                          {item.output.substring(0, 80)}
                          {item.output.length > 80 ? "..." : ""}
                        </code>
                      </div>
                    )}
                    {item.status === "error" && item.error && (
                      <div className={styles.ubtResultError}>
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
          <div className={styles.ubtEmpty}>
            <div className={styles.ubtEmptyIcon}>
              <i className="ti ti-files" />
            </div>
            <p className={styles.ubtEmptyTitle}>Batch {mode === "encode" ? "Encode" : "Decode"}</p>
            <p className={styles.ubtEmptyDesc}>
              Process multiple {mode === "encode" ? "URLs" : "encoded strings"} at once. Enter one
              per line above.
            </p>
          </div>
        )}
      </div>
    </>
  );
}