// features/dev/js-minifier/JSBatch.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef } from "react";
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

export default function JSBatch({ options, onComplete }: JSBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems: BatchItem[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["js", "mjs", "cjs", "ts", "jsx", "tsx"].includes(ext || "")) continue;

      try {
        const text = await file.text();
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          content: text,
          size: file.size,
          status: "pending",
        });
      } catch {
        logger.error(`Failed to read ${file.name}`);
      }
    }

    setItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const processAll = useCallback(async () => {
    if (!items.length || isProcessing) return;

    setIsProcessing(true);
    setProgress(0);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "processing" as const } : p))
      );

      await new Promise((r) => setTimeout(r, 0)); // yield to UI

      try {
        const result = processJS(item.content, options);
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "completed" as const, result } : p))
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

      setProgress(Math.round(((i + 1) / items.length) * 100));
    }

    setIsProcessing(false);
    onComplete?.(items.filter((i) => i.status === "completed"));
  }, [items, options, isProcessing, onComplete]);

  const downloadItem = useCallback((item: BatchItem) => {
    if (!item.result) return;
    const blob = new Blob([item.result.output], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name.replace(/\.(js|mjs|cjs|ts|jsx|tsx)$/i, `.min.js`);
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(() => {
    items.filter((i) => i.status === "completed").forEach(downloadItem);
  }, [items, downloadItem]);

  const copyItem = useCallback(async (item: BatchItem) => {
    if (!item.result) return;
    await navigator.clipboard.writeText(item.result.output);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(""), 1500);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const completedCount = items.filter((i) => i.status === "completed").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const totalSavings = items.reduce((acc, i) => acc + (i.result?.stats.savings || 0), 0);

  return (
    <>
      <div className={styles.jbRoot}>
        {/* Upload */}
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
                onClick={() => {
                  setItems([]);
                  setProgress(0);
                }}
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
              accept=".js,.mjs,.cjs,.ts,.jsx,.tsx"
              onChange={handleFilesChange}
              disabled={isProcessing}
            />
            <label htmlFor="jb-files" className={styles.jbDropZone}>
              <div className={styles.jbDropIcon}>
                <i className="ti ti-cloud-upload" />
              </div>
              <div>
                <p className={styles.jbDropTitle}>Drop JS files here or click to browse</p>
                <p className={styles.jbDropSub}>
                  .js · .mjs · .cjs · .ts · .jsx · .tsx · Multiple files
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
                  {formatBytes(items.reduce((s, i) => s + i.size, 0))}
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
                <i className={`ti ${isProcessing ? `ti-loader ${styles.jbSpin}` : "ti-play"}`} />
                {isProcessing ? `Processing… ${progress}%` : "Process All"}
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className={styles.jbProgressWrap}>
            <div className={styles.jbProgressTop}>
              <span className={styles.jbProgressLabel}>Processing {progress}%</span>
              <span className={styles.jbProgressSub}>
                {completedCount} of {items.length} done
              </span>
            </div>
            <div className={styles.jbProgressTrack}>
              <div className={styles.jbProgressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Results */}
        {items.length > 0 && (
          <div className={styles.jbSection}>
            <div className={styles.jbSectionHeader}>
              <div className={styles.jbSectionTitle}>
                <i className="ti ti-list-check" />
                Results
                {completedCount > 0 && (
                  <span className={`${styles.jbBadge} ${styles.jbBadgeSuccess}`}>{completedCount} done</span>
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
                      <span className={styles.jbResultName}>{item.name}</span>
                      <span className={styles.jbResultSize}>{formatBytes(item.size)}</span>
                    </div>
                    {item.result && (
                      <span
                        className={`${styles.jbResultSavings} ${item.result.stats.savings > 0 ? "positive" : ""}`}
                      >
                        {item.result.stats.savings > 0
                          ? `↓ ${formatBytes(item.result.stats.savings)} (${item.result.stats.savingsPercent}%)`
                          : "No change"}
                      </span>
                    )}
                  </div>

                  <div className={styles.jbResultActions}>
                    <div className={`${styles.jbStatus} ${styles[`jbStatus${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                      <i
                        className={`ti ${item.status === "pending"
                          ? "ti-clock"
                          : item.status === "processing"
                            ? `ti-loader ${styles.jbSpin}`
                            : item.status === "completed"
                              ? "ti-check"
                              : "ti-alert-circle"
                          }`}
                      />
                      <span>{item.status}</span>
                    </div>

                    {item.status === "completed" && (
                      <>
                        <button
                          type="button"
                          className={`${styles.jbIconBtn} ${copiedId === item.id ? "copied" : ""}`}
                          onClick={() => copyItem(item)}
                          title="Copy"
                        >
                          <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                        </button>
                        <button
                          type="button"
                          className={styles.jbIconBtn}
                          onClick={() => downloadItem(item)}
                          title="Download"
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
                      title="Remove"
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>

                  {item.status === "error" && item.error && (
                    <div className={styles.jbErrorRow}>
                      <i className="ti ti-alert-triangle" />
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {items.length === 0 && (
          <div className={styles.jbEmpty}>
            <div className={styles.jbEmptyIcon}>
              <i className="ti ti-files" />
            </div>
            <h3 className={styles.jbEmptyTitle}>Batch JS Minification</h3>
            <p className={styles.jbEmptyDesc}>
              Upload multiple JavaScript files to minify them all at once with the same settings.
            </p>
          </div>
        )}
      </div>
    </>
  );
}