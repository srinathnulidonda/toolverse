// features/dev/timestamp-converter/TimestampBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { convertTimestamp, type TimestampOptions } from "./ts/utils";
import styles from "./style/TimestampBatch.module.css";

interface BatchItem {
  id: string;
  input: string;
  unix: number | null;
  iso: string;
  relative: string;
  status: "pending" | "processing" | "done" | "error";
}

interface TimestampBatchProps {
  options: TimestampOptions;
  onComplete?: () => void;
}

export default function TimestampBatch({ options, onComplete }: TimestampBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [batchInput, setBatchInput] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleProcess = useCallback(async () => {
    if (!batchInput.trim()) return;

    setProcessing(true);

    const inputs = batchInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newItems: BatchItem[] = inputs.map((input, i) => ({
      id: `${Date.now()}-${i}`,
      input,
      unix: null,
      iso: "",
      relative: "",
      status: "pending" as const,
    }));

    setItems(newItems);

    for (let i = 0; i < newItems.length; i++) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "processing" as const } : item))
      );

      await new Promise((resolve) => setTimeout(resolve, 30));

      const result = convertTimestamp(newItems[i].input, options);

      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i
            ? {
              ...item,
              unix: result?.unix ?? null,
              iso: result?.iso ?? "",
              relative: result?.relative ?? "",
              status: result ? ("done" as const) : ("error" as const),
            }
            : item
        )
      );
    }

    setProcessing(false);
    if (onComplete) onComplete();
  }, [batchInput, options, onComplete]);

  const handleCopyAll = useCallback(async () => {
    const outputs = items.filter((i) => i.status === "done").map((i) => `${i.input} → ${i.iso}`);
    await navigator.clipboard.writeText(outputs.join("\n"));
  }, [items]);

  const handleDownloadCsv = useCallback(() => {
    const header = "Input,Unix,ISO,Relative\n";
    const rows = items
      .filter((i) => i.status === "done")
      .map((i) => `"${i.input}",${i.unix},"${i.iso}","${i.relative}"`);
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timestamps.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const handleClear = useCallback(() => {
    setBatchInput("");
    setItems([]);
  }, []);

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return (
    <>
      <div className={styles.tbRoot}>
        {/*  Input Section  */}
        <div className={styles.tbSection}>
          <div className={styles.tbSectionHeader}>
            <div className={styles.tbSectionLabel}>
              <i className="ti ti-files" />
              Batch Input
            </div>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={handleClear}
              disabled={!batchInput && items.length === 0}
            >
              <i className="ti ti-trash" />
              <span className={styles.tbBtnText}>Clear</span>
            </button>
          </div>
          <textarea
            className={styles.tbTextarea}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Enter multiple timestamps or dates (one per line)...&#10;&#10;1704067200&#10;2024-01-15&#10;2024-06-01T10:30:00Z"
            rows={8}
            disabled={processing}
          />
          <div className={styles.tbInputFooter}>
            <span className={styles.tbInputCount}>
              {batchInput.split("\n").filter((s) => s.trim()).length} items
            </span>
            <button
              type="button"
              className={`${styles.tbBtn} ${styles.tbBtnPrimary}`}
              onClick={handleProcess}
              disabled={!batchInput.trim() || processing}
            >
              <i className={`ti ${processing ? "ti-loader" : "ti-player-play"}`} />
              {processing ? "Processing..." : "Convert All"}
            </button>
          </div>
        </div>

        {/*  Results Section  */}
        {items.length > 0 && (
          <div className={styles.tbSection}>
            <div className={styles.tbSectionHeader}>
              <div className={styles.tbSectionLabel}>
                <i className="ti ti-list-check" />
                <span className={styles.tbLabelText}>Results</span>
                <span className={styles.tbResultsBadge}>
                  {doneCount}/{items.length}
                </span>
                {errorCount > 0 && <span className={styles.tbErrorBadge}>{errorCount} errors</span>}
              </div>
              <div className={styles.tbSectionActions}>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={handleCopyAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-copy" />
                  <span className={styles.tbBtnText}>Copy</span>
                </button>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={handleDownloadCsv}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  <span className={styles.tbBtnText}>CSV</span>
                </button>
              </div>
            </div>

            <div className={styles.tbResults}>
              {items.map((item, idx) => (
                <div key={item.id} className={`${styles.tbResultItem} ${styles[`status-${item.status}`]}`}>
                  <div className={styles.tbResultHeader}>
                    <div className={styles.tbResultIndex}>#{idx + 1}</div>
                    {item.status === "pending" && (
                      <span className={`${styles.tbStatusBadge} ${styles.pending}`}>
                        <i className="ti ti-clock" />
                        Pending
                      </span>
                    )}
                    {item.status === "processing" && (
                      <span className={`${styles.tbStatusBadge} ${styles.processing}`}>
                        <i className="ti ti-loader" />
                        Processing
                      </span>
                    )}
                    {item.status === "done" && (
                      <span className={`${styles.tbStatusBadge} ${styles.done}`}>
                        <i className="ti ti-check" />
                        Done
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className={`${styles.tbStatusBadge} ${styles.error}`}>
                        <i className="ti ti-alert-circle" />
                        Error
                      </span>
                    )}
                  </div>
                  <div className={styles.tbResultContent}>
                    <div className={styles.tbResultInput}>
                      <span className={styles.tbResultLabel}>Input:</span>
                      <code>{item.input}</code>
                    </div>
                    {item.status === "done" && (
                      <>
                        <div className={styles.tbResultOutput}>
                          <span className={styles.tbResultLabel}>ISO:</span>
                          <code>{item.iso}</code>
                        </div>
                        <div className={styles.tbResultRelative}>
                          <i className="ti ti-history" />
                          {item.relative}
                        </div>
                      </>
                    )}
                    {item.status === "error" && (
                      <div className={styles.tbResultError}>
                        <i className="ti ti-alert-triangle" />
                        Invalid timestamp format
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
          <div className={styles.tbEmpty}>
            <div className={styles.tbEmptyIcon}>
              <i className="ti ti-files" />
            </div>
            <p className={styles.tbEmptyTitle}>Batch Timestamp Conversion</p>
            <p className={styles.tbEmptyDesc}>
              Convert multiple timestamps at once. Enter one per line above.
            </p>
          </div>
        )}
      </div>
    </>
  );
}