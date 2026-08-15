// features/dev/css-minifier/CSSBatch.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { processCSS, validateCSS, createId } from "./ts/utils";
import { formatBytes } from "@/utils";
import styles from "./style/CSSBatch.module.css";

interface BatchItem {
  id: string;
  name: string;
  input: string;
  output: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
  stats?: {
    original: number;
    minified: number;
    savings: number;
    savingsPercent: number;
  };
}

interface CSSBatchProps {
  onComplete?: (successCount: number, failedCount: number) => void;
}

const MAX_FILES = 50;

export default function CSSBatch({ onComplete }: CSSBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter((file) =>
      file.name.toLowerCase().endsWith(".css")
    );

    if (incoming.length === 0) {
      setUploadError("No valid .css files found in your selection.");
      return;
    }

    const results = await Promise.all(
      incoming.map(async (file) => {
        try {
          const text = await file.text();
          return {
            id: createId(),
            name: file.name,
            input: text,
            output: "",
            status: "pending" as const,
          };
        } catch {
          return null;
        }
      })
    );

    const validItems = results.filter((item) => item !== null) as BatchItem[];
    let overflow = 0;

    setItems((prev) => {
      const combined = [...prev, ...validItems];
      overflow = Math.max(0, combined.length - MAX_FILES);
      return combined.slice(0, MAX_FILES);
    });

    setUploadError(
      overflow > 0 ? `Reached the ${MAX_FILES}-file limit. ${overflow} file(s) were skipped.` : ""
    );
  }, []);

  const handleFilesChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      await addFiles(files);
      e.target.value = "";
    },
    [addFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      if (!processing) setDragOver(true);
    },
    [processing]
  );

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (processing) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles, processing]
  );

  const handleProcess = useCallback(async () => {
    if (items.length === 0 || processing) return;

    setProcessing(true);
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < items.length; i++) {
      const current = items[i];

      setItems((prev) =>
        prev.map((item) =>
          item.id === current.id ? { ...item, status: "processing" as const } : item
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const validation = validateCSS(current.input);

      if (!validation.valid) {
        failedCount += 1;
        setItems((prev) =>
          prev.map((item) =>
            item.id === current.id
              ? { ...item, status: "error" as const, error: validation.error }
              : item
          )
        );
        continue;
      }

      try {
        const result = processCSS(current.input);
        successCount += 1;

        setItems((prev) =>
          prev.map((item) =>
            item.id === current.id
              ? {
                ...item,
                output: result.output,
                status: "done" as const,
                stats: {
                  original: result.stats.original,
                  minified: result.stats.minified,
                  savings: result.stats.savings,
                  savingsPercent: result.stats.savingsPercent,
                },
              }
              : item
          )
        );
      } catch (err) {
        failedCount += 1;
        setItems((prev) =>
          prev.map((item) =>
            item.id === current.id
              ? {
                ...item,
                status: "error" as const,
                error: err instanceof Error ? err.message : "Failed to minify",
              }
              : item
          )
        );
      }
    }

    setProcessing(false);
    onComplete?.(successCount, failedCount);
  }, [items, processing, onComplete]);

  const handleDownloadAll = useCallback(() => {
    items
      .filter((item) => item.status === "done")
      .forEach((item) => {
        const blob = new Blob([item.output], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name.replace(/\.css$/i, ".min.css");
        a.click();
        URL.revokeObjectURL(url);
      });
  }, [items]);

  const handleDownloadOne = useCallback((item: BatchItem) => {
    const blob = new Blob([item.output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name.replace(/\.css$/i, ".min.css");
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  }, []);

  const handleClear = useCallback(() => {
    setItems([]);
    setUploadError("");
  }, []);

  const doneCount = items.filter((i) => i.status === "done").length;
  const totalSavings = useMemo(() => {
    return items
      .filter((i) => i.status === "done")
      .reduce((acc, item) => acc + (item.stats?.savings || 0), 0);
  }, [items]);

  return (
    <div className={styles.cbRoot}>
      <div className={styles.cbSection}>
        <div className={styles.cbSectionHeader}>
          <div className={styles.cbSectionLabel}>
            <i className="ti ti-upload" />
            Upload CSS Files
          </div>
          {items.length > 0 && (
            <button
              type="button"
              className={styles.cbBtn}
              onClick={handleClear}
              disabled={processing}
            >
              <i className="ti ti-trash" />
              Clear
            </button>
          )}
        </div>

        <div className={styles.cbUploadArea}>
          <input
            type="file"
            id="css-files"
            className={styles.cbFileInput}
            multiple
            accept=".css"
            onChange={handleFilesChange}
            disabled={processing}
          />
          <label
            htmlFor="css-files"
            className={`${styles.cbUploadLabel}${dragOver ? ` ${styles.dragOver}` : ""}${processing ? ` ${styles.disabled}` : ""
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={styles.cbUploadIcon} aria-hidden="true">
              <i className="ti ti-file-upload" />
            </div>
            <p className={styles.cbUploadTitle}>
              {dragOver ? "Drop your files here" : "Choose or drop CSS files"}
            </p>
            <p className={styles.cbUploadDesc}>Select or drag multiple .css files to minify</p>
          </label>

          {uploadError && (
            <p className={styles.cbUploadError}>
              <i className="ti ti-alert-circle" />
              {uploadError}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.cbUploadFooter}>
            <span className={styles.cbUploadCount}>
              {items.length} {items.length === 1 ? "file" : "files"} selected
            </span>
            <button
              type="button"
              className={`${styles.cbBtn} ${styles.cbBtnPrimary}`}
              onClick={handleProcess}
              disabled={processing}
            >
              <i className={`ti ${processing ? "ti-loader" : "ti-wand"}${processing ? ` ${styles.cbSpin}` : ""}`} />
              {processing ? "Processing..." : "Minify All"}
            </button>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.cbSection}>
          <div className={styles.cbSectionHeader}>
            <div className={styles.cbSectionLabel}>
              <i className="ti ti-list-check" />
              Results
              {doneCount > 0 && (
                <span className={styles.cbCountBadge}>
                  {doneCount}/{items.length}
                </span>
              )}
            </div>
            <div className={styles.cbSectionActions}>
              {totalSavings > 0 && (
                <span className={styles.cbSavingsBadge}>
                  <i className="ti ti-discount-check" />
                  Saved {formatBytes(totalSavings)}
                </span>
              )}
              <button
                type="button"
                className={styles.cbBtn}
                onClick={handleDownloadAll}
                disabled={doneCount === 0}
              >
                <i className="ti ti-download" />
                Download All
              </button>
            </div>
          </div>

          <div className={styles.cbResults}>
            {items.map((item, idx) => (
              <div key={item.id} className={styles.cbResultItem}>
                <div className={styles.cbResultHeader}>
                  <div className={styles.cbResultIndex}>#{idx + 1}</div>
                  <div className={styles.cbResultInfo}>
                    <span className={styles.cbResultName} title={item.name}>
                      {item.name}
                    </span>
                    {item.stats && (
                      <span className={styles.cbResultStats}>
                        {formatBytes(item.stats.original)} → {formatBytes(item.stats.minified)} (
                        {item.stats.savingsPercent}% saved)
                      </span>
                    )}
                  </div>
                  <div className={styles.cbResultStatus}>
                    {item.status === "pending" && (
                      <span className={`${styles.cbStatusBadge} ${styles.pending}`}>
                        <i className="ti ti-clock" />
                        Pending
                      </span>
                    )}
                    {item.status === "processing" && (
                      <span className={`${styles.cbStatusBadge} ${styles.processing}`}>
                        <i className={`ti ti-loader ${styles.cbSpin}`} />
                        Processing
                      </span>
                    )}
                    {item.status === "done" && (
                      <span className={`${styles.cbStatusBadge} ${styles.done}`}>
                        <i className="ti ti-check" />
                        Done
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className={`${styles.cbStatusBadge} ${styles.error}`}>
                        <i className="ti ti-alert-circle" />
                        Error
                      </span>
                    )}
                  </div>
                  {item.status === "done" && (
                    <div className={styles.cbResultActions}>
                      <button
                        type="button"
                        className={styles.cbCopyBtn}
                        onClick={() => handleDownloadOne(item)}
                        title="Download file"
                        aria-label={`Download ${item.name}`}
                      >
                        <i className="ti ti-download" />
                      </button>
                      <button
                        type="button"
                        className={`${styles.cbCopyBtn}${copiedId === item.id ? ` ${styles.copied}` : ""}`}
                        onClick={() => handleCopy(item.output, item.id)}
                        title="Copy output"
                        aria-label={copiedId === item.id ? "Copied" : `Copy ${item.name} output`}
                      >
                        <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                      </button>
                    </div>
                  )}
                </div>

                {item.status === "error" && item.error && (
                  <div className={styles.cbResultError}>
                    <i className="ti ti-alert-triangle" />
                    {item.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className={styles.cbEmpty}>
          <div className={styles.cbEmptyIcon} aria-hidden="true">
            <i className="ti ti-files" />
          </div>
          <p className={styles.cbEmptyTitle}>Batch CSS Minifier</p>
          <p className={styles.cbEmptyDesc}>
            Upload multiple CSS files and minify them all at once. Results can be downloaded
            individually or as a batch.
          </p>
        </div>
      )}
    </div>
  );
}