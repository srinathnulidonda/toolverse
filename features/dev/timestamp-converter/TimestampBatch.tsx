// features/dev/timestamp-converter/TimestampBatch.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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

function escapeCsvField(value: string | number): string {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export default function TimestampBatch({ options, onComplete }: TimestampBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [batchInput, setBatchInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const lineCount = useMemo(
    () => batchInput.split("\n").filter((s) => s.trim()).length,
    [batchInput]
  );

  const handleProcess = useCallback(async () => {
    if (!batchInput.trim() || processing) return;
    setProcessing(true);

    const inputs = batchInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newItems: BatchItem[] = inputs.map((input, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      input,
      unix: null,
      iso: "",
      relative: "",
      status: "pending",
    }));

    if (isMountedRef.current) setItems(newItems);

    for (let i = 0; i < newItems.length; i++) {
      if (!isMountedRef.current) return;

      setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, status: "processing" } : item)));

      await new Promise((resolve) => setTimeout(resolve, 20));

      let result: ReturnType<typeof convertTimestamp> = null;
      try {
        result = convertTimestamp(newItems[i].input, options);
      } catch {
        result = null;
      }

      if (!isMountedRef.current) return;

      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i
            ? {
              ...item,
              unix: result?.unix ?? null,
              iso: result?.iso ?? "",
              relative: result?.relative ?? "",
              status: result ? "done" : "error",
            }
            : item
        )
      );
    }

    if (isMountedRef.current) setProcessing(false);
    onComplete?.();
  }, [batchInput, options, processing, onComplete]);

  const handleCopyAll = useCallback(async () => {
    const outputs = items.filter((i) => i.status === "done").map((i) => `${i.input} → ${i.iso}`);
    if (!outputs.length) return;
    try {
      await navigator.clipboard.writeText(outputs.join("\n"));
    } catch {
      logger.error("Failed to copy batch results to clipboard");
    }
  }, [items]);

  const handleDownloadCsv = useCallback(() => {
    const doneItems = items.filter((i) => i.status === "done");
    if (!doneItems.length) return;
    const header = "Input,Unix,ISO,Relative\n";
    const rows = doneItems.map(
      (i) =>
        `${escapeCsvField(i.input)},${escapeCsvField(i.unix ?? "")},${escapeCsvField(i.iso)},${escapeCsvField(i.relative)}`
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timestamps_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const handleClear = useCallback(() => {
    if (processing) return;
    setBatchInput("");
    setItems([]);
  }, [processing]);

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  const statusMeta: Record<BatchItem["status"], { label: string; icon: string; cls: string }> = {
    pending: { label: "Pending", icon: "ti-clock", cls: styles.tbStatusPending },
    processing: { label: "Processing", icon: `ti-loader ${styles.tbSpin}`, cls: styles.tbStatusProcessing },
    done: { label: "Done", icon: "ti-check", cls: styles.tbStatusDone },
    error: { label: "Error", icon: "ti-alert-circle", cls: styles.tbStatusError },
  };

  return (
    <div className={styles.tbRoot}>
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
            disabled={(!batchInput && items.length === 0) || processing}
          >
            <i className="ti ti-trash" />
            <span className={styles.tbBtnText}>Clear</span>
          </button>
        </div>
        <textarea
          className={styles.tbTextarea}
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          placeholder={"Enter multiple timestamps or dates (one per line)...\n\n1704067200\n2024-01-15\n2024-06-01T10:30:00Z"}
          rows={8}
          disabled={processing}
          spellCheck={false}
          aria-label="Batch timestamp input"
        />
        <div className={styles.tbInputFooter}>
          <span className={styles.tbInputCount}>
            {lineCount} item{lineCount !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            className={`${styles.tbBtn} ${styles.tbBtnPrimary}`}
            onClick={handleProcess}
            disabled={!batchInput.trim() || processing}
            aria-busy={processing}
          >
            <i className={`ti ${processing ? `ti-loader ${styles.tbSpin}` : "ti-player-play"}`} />
            {processing ? "Processing…" : "Convert All"}
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className={styles.tbSection}>
          <div className={styles.tbSectionHeader}>
            <div className={styles.tbSectionLabel}>
              <i className="ti ti-list-check" />
              <span className={styles.tbLabelText}>Results</span>
              <span className={styles.tbResultsBadge}>
                {doneCount}/{items.length}
              </span>
              {errorCount > 0 && (
                <span className={styles.tbErrorBadge}>
                  {errorCount} error{errorCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className={styles.tbSectionActions}>
              <button type="button" className={styles.tbBtn} onClick={handleCopyAll} disabled={doneCount === 0}>
                <i className="ti ti-copy" />
                <span className={styles.tbBtnText}>Copy</span>
              </button>
              <button type="button" className={styles.tbBtn} onClick={handleDownloadCsv} disabled={doneCount === 0}>
                <i className="ti ti-download" />
                <span className={styles.tbBtnText}>CSV</span>
              </button>
            </div>
          </div>

          <div className={styles.tbResults}>
            {items.map((item, idx) => {
              const meta = statusMeta[item.status];
              return (
                <div key={item.id} className={styles.tbResultItem}>
                  <div className={styles.tbResultHeader}>
                    <div className={styles.tbResultIndex}>#{idx + 1}</div>
                    <span className={`${styles.tbStatusBadge} ${meta.cls}`}>
                      <i className={`ti ${meta.icon}`} />
                      {meta.label}
                    </span>
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
              );
            })}
          </div>
        </div>
      )}

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
  );
}