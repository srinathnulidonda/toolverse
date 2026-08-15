// features/dev/js-minifier/JSBatch.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { logger } from "@/lib/logger";
import { processJS, type MinifyOptions, formatBytes } from "./ts/jsEngine";
import type { MinifyResult } from "./ts/jsEngine";
import styles from "./style/JSBatch.module.css";

interface BatchItem {
  id: string;
  name: string;
  content: string;
  size: number;
  status: "pending" | "processing" | "completed" | "error";
  result?: MinifyResult;
  error?: string;
}

interface JSBatchProps {
  options: MinifyOptions;
  onComplete?: (items: BatchItem[]) => void;
}

const ACCEPTED_EXTENSIONS = ["js", "mjs", "cjs", "ts", "jsx", "tsx"];
const ACCEPT_STRING = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",");

function getStatusClass(status: BatchItem["status"]): string {
  switch (status) {
    case "pending":
      return styles.jbStatusPending;
    case "processing":
      return styles.jbStatusProcessing;
    case "completed":
      return styles.jbStatusCompleted;
    case "error":
      return styles.jbStatusError;
  }
}

function getStatusIcon(status: BatchItem["status"], spinClass: string): string {
  switch (status) {
    case "pending":
      return "ti-clock";
    case "processing":
      return `ti-loader ${spinClass}`;
    case "completed":
      return "ti-check";
    case "error":
      return "ti-alert-circle";
  }
}

export default function JSBatch({ options, onComplete }: JSBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      const newItems: BatchItem[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!ACCEPTED_EXTENSIONS.includes(ext)) continue;

        try {
          const text = await file.text();
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            content: text,
            size: file.size,
            status: "pending",
          });
        } catch {
          logger.error(`Failed to read ${file.name}`);
        }
      }

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const processAll = useCallback(async () => {
    const pendingItems = items.filter((i) => i.status === "pending");
    if (!pendingItems.length || isProcessing) return;

    setIsProcessing(true);
    setProgress(0);

    const total = items.length;
    let completed = 0;

    for (const item of items) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, status: "processing" as const } : p
        )
      );

      await new Promise<void>((r) => setTimeout(r, 0));

      try {
        const result = processJS(item.content, options);
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "completed" as const, result } : p
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : p
          )
        );
      }

      completed += 1;
      setProgress(Math.round((completed / total) * 100));
    }

    setIsProcessing(false);

    setItems((current) => {
      onComplete?.(current.filter((i) => i.status === "completed"));
      return current;
    });
  }, [items, options, isProcessing, onComplete]);

  const downloadItem = useCallback((item: BatchItem) => {
    if (!item.result) return;
    const blob = new Blob([item.result.output], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name.replace(/\.(js|mjs|cjs|ts|jsx|tsx)$/i, ".min.js");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(() => {
    items.filter((i) => i.status === "completed").forEach(downloadItem);
  }, [items, downloadItem]);

  const copyItem = useCallback(async (item: BatchItem) => {
    if (!item.result) return;
    try {
      await navigator.clipboard.writeText(item.result.output);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      logger.error("Clipboard write failed");
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    setProgress(0);
  }, []);

  const completedCount = items.filter((i) => i.status === "completed").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const totalSavings = items.reduce(
    (acc, i) => acc + (i.result?.stats.savings ?? 0),
    0
  );
  const totalOriginalSize = items.reduce((acc, i) => acc + i.size, 0);

  return (
    <div className={styles.jbRoot}>
      <div className={styles.jbSection}>
        <div className={styles.jbSectionHeader}>
          <div className={styles.jbSectionTitle}>
            <i className="ti ti-upload" />
            Upload JavaScript Files
          </div>
          {items.length > 0 && (
            <button
              type="button"
              className={`${styles.jbActionBtn} ${styles.jbActionBtnGhost}`}
              onClick={clearAll}
              disabled={isProcessing}
            >
              <i className="ti ti-trash" />
              Clear All
            </button>
          )}
        </div>

        <div className={styles.jbUploadArea}>
          <input
            ref={fileInputRef}
            type="file"
            id="jb-files"
            className={styles.jbFileInput}
            multiple
            accept={ACCEPT_STRING}
            onChange={handleFilesChange}
            disabled={isProcessing}
          />
          <label htmlFor="jb-files" className={styles.jbDropZone}>
            <div className={styles.jbDropIcon}>
              <i className="ti ti-cloud-upload" />
            </div>
            <div>
              <p className={styles.jbDropTitle}>
                Drop JS files here or click to browse
              </p>
              <p className={styles.jbDropSub}>
                .js · .mjs · .cjs · .ts · .jsx · .tsx · Multiple files supported
              </p>
            </div>
          </label>
        </div>

        {items.length > 0 && (
          <div className={styles.jbSummaryBar}>
            <div className={styles.jbSummaryStats}>
              <span className={styles.jbSummaryStat}>
                <i className="ti ti-files" />
                {items.length} file{items.length !== 1 ? "s" : ""}
              </span>
              <span className={styles.jbSummaryStat}>
                <i className="ti ti-database" />
                {formatBytes(totalOriginalSize)}
              </span>
              <span className={styles.jbSummaryStat}>
                <i className="ti ti-adjustments" />
                {options.mode}
              </span>
            </div>
            <button
              type="button"
              className={`${styles.jbActionBtn} ${styles.jbActionBtnPrimary}`}
              onClick={processAll}
              disabled={isProcessing}
            >
              <i
                className={`ti ${
                  isProcessing
                    ? `ti-loader ${styles.jbSpin}`
                    : "ti-play"
                }`}
              />
              {isProcessing ? `Processing… ${progress}%` : "Process All"}
            </button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className={styles.jbProgressWrap}>
          <div className={styles.jbProgressTop}>
            <span className={styles.jbProgressLabel}>
              Processing {progress}%
            </span>
            <span className={styles.jbProgressSub}>
              {completedCount} of {items.length} done
            </span>
          </div>
          <div className={styles.jbProgressTrack}>
            <div
              className={styles.jbProgressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className={styles.jbSection}>
          <div className={styles.jbSectionHeader}>
            <div className={styles.jbSectionTitle}>
              <i className="ti ti-list-check" />
              Results
              {completedCount > 0 && (
                <span className={`${styles.jbBadge} ${styles.jbBadgeSuccess}`}>
                  {completedCount} done
                </span>
              )}
              {errorCount > 0 && (
                <span className={`${styles.jbBadge} ${styles.jbBadgeError}`}>
                  {errorCount} error{errorCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className={styles.jbHeaderRight}>
              {totalSavings > 0 && (
                <span className={styles.jbSavingsBadge}>
                  <i className="ti ti-discount-check" />
                  Saved {formatBytes(totalSavings)}
                </span>
              )}
              {completedCount > 0 && (
                <button
                  type="button"
                  className={`${styles.jbActionBtn} ${styles.jbActionBtnGhost}`}
                  onClick={downloadAll}
                  disabled={isProcessing}
                >
                  <i className="ti ti-download" />
                  Download All
                </button>
              )}
            </div>
          </div>

          <div className={styles.jbResults}>
            {items.map((item) => (
              <div key={item.id} className={styles.jbResultRow}>
                <div className={styles.jbResultInfo}>
                  <i className="ti ti-file-code" />
                  <div className={styles.jbResultNameWrap}>
                    <span className={styles.jbResultName} title={item.name}>
                      {item.name}
                    </span>
                    <span className={styles.jbResultSize}>
                      {formatBytes(item.size)}
                    </span>
                  </div>
                  {item.result && (
                    <span
                      className={`${styles.jbResultSavings} ${
                        item.result.stats.savings > 0 ? "positive" : ""
                      }`}
                    >
                      {item.result.stats.savings > 0
                        ? `↓ ${formatBytes(item.result.stats.savings)} (${item.result.stats.savingsPercent}%)`
                        : "No change"}
                    </span>
                  )}
                </div>

                <div className={styles.jbResultActions}>
                  <div
                    className={`${styles.jbStatus} ${getStatusClass(item.status)}`}
                  >
                    <i
                      className={`ti ${getStatusIcon(item.status, styles.jbSpin)}`}
                    />
                    <span>{item.status}</span>
                  </div>

                  {item.status === "completed" && (
                    <>
                      <button
                        type="button"
                        className={`${styles.jbIconBtn} ${
                          copiedId === item.id ? styles.copied : ""
                        }`}
                        onClick={() => copyItem(item)}
                        title="Copy minified code"
                        aria-label="Copy minified code"
                      >
                        <i
                          className={`ti ${
                            copiedId === item.id ? "ti-check" : "ti-copy"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className={styles.jbIconBtn}
                        onClick={() => downloadItem(item)}
                        title="Download minified file"
                        aria-label="Download minified file"
                      >
                        <i className="ti ti-download" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className={styles.jbRemoveBtn}
                    onClick={() => removeItem(item.id)}
                    disabled={isProcessing}
                    title="Remove file"
                    aria-label="Remove file"
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>

                {item.status === "error" && item.error && (
                  <div className={styles.jbErrorRow}>
                    <i className="ti ti-alert-triangle" />
                    <span>{item.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className={styles.jbEmpty}>
          <div className={styles.jbEmptyIcon}>
            <i className="ti ti-files" />
          </div>
          <h3 className={styles.jbEmptyTitle}>Batch JS Minification</h3>
          <p className={styles.jbEmptyDesc}>
            Upload multiple JavaScript files to minify them all at once using
            the same settings configured in the Minify tab.
          </p>
        </div>
      )}
    </div>
  );
}