// features/dev/slug-generator/SlugBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { generateSlug, formatBytes, type SlugOptions } from "./ts/utils";
import styles from "./style/SlugBatch.module.css";

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
      <div className={styles.sbRoot}>
        {/*  Input Section  */}
        <div className={styles.sbSection}>
          <div className={styles.sbSectionHeader}>
            <div className={styles.sbSectionLabel}>
              <i className="ti ti-files" />
              Batch Input
            </div>
            <div className={styles.sbSectionActions}>
              <div className={styles.sbSeparatorGroup}>
                <span className={styles.sbSeparatorLabel}>Split by:</span>
                <select
                  className={styles.sbSelect}
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
                className={styles.sbBtn}
                onClick={handleClear}
                disabled={!batchInput && items.length === 0}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            className={styles.sbTextarea}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Enter multiple texts (one per line)...&#10;&#10;Example:&#10;How to Build Web Apps&#10;Product Launch 2024&#10;SEO Best Practices"
            rows={10}
            disabled={processing}
          />
          <div className={styles.sbInputFooter}>
            <span className={styles.sbInputCount}>
              {
                batchInput
                  .split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";")
                  .filter((s) => s.trim()).length
              }{" "}
              items
            </span>
            <button
              type="button"
              className={`${styles.sbBtn} ${styles.sbBtnPrimary}`}
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
          <div className={styles.sbSection}>
            <div className={styles.sbSectionHeader}>
              <div className={styles.sbSectionLabel}>
                <i className="ti ti-list-check" />
                Results
                <span className={styles.sbResultsBadge}>
                  {doneCount}/{items.length}
                </span>
              </div>
              <div className={styles.sbSectionActions}>
                <button
                  type="button"
                  className={styles.sbBtn}
                  onClick={handleCopyAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-copy" />
                  Copy All
                </button>
                <button
                  type="button"
                  className={styles.sbBtn}
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  Download
                </button>
              </div>
            </div>

            <div className={styles.sbResults}>
              {items.map((item, idx) => (
                <div key={item.id} className={`${styles.sbResultItem} ${styles[`status${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}`]}`}>
                  <div className={styles.sbResultHeader}>
                    <div className={styles.sbResultIndex}>#{idx + 1}</div>
                    <div className={styles.sbResultStatus}>
                      {item.status === "pending" && (
                        <span className={`${styles.sbStatusBadge} ${styles.pending}`}>
                          <i className="ti ti-clock" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className={`${styles.sbStatusBadge} ${styles.processing}`}>
                          <i className="ti ti-loader" />
                          Processing
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className={`${styles.sbStatusBadge} ${styles.done}`}>
                          <i className="ti ti-check" />
                          Done
                        </span>
                      )}
                    </div>
                    {item.status === "done" && (
                      <button
                        type="button"
                        className={styles.sbIconBtn}
                        onClick={() => navigator.clipboard.writeText(item.output)}
                        title="Copy result"
                      >
                        <i className="ti ti-copy" />
                      </button>
                    )}
                  </div>
                  <div className={styles.sbResultContent}>
                    <div className={styles.sbResultInput}>
                      <span className={styles.sbResultLabel}>Input:</span>
                      <div className={styles.sbResultText}>{item.input}</div>
                    </div>
                    {item.status === "done" && (
                      <div className={styles.sbResultOutput}>
                        <span className={styles.sbResultLabel}>Slug:</span>
                        <code className={styles.sbResultCode}>{item.output}</code>
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
          <div className={styles.sbEmpty}>
            <div className={styles.sbEmptyIcon}>
              <i className="ti ti-files" />
            </div>
            <p className={styles.sbEmptyTitle}>Batch Slug Generation</p>
            <p className={styles.sbEmptyDesc}>
              Process multiple texts at once. Enter one per line above.
            </p>
          </div>
        )}
      </div>
    </>
  );
}