// features/dev/js-minifier/JSBatch.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef } from "react";
import { processJS, type MinifyOptions, formatBytes } from "./jsEngine";
import type { MinifyResult } from "./jsEngine";

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
      <div className="jb-root">
        {/* Upload */}
        <div className="jb-section">
          <div className="jb-section-header">
            <div className="jb-section-title">
              <i className="ti ti-upload" />
              Upload JavaScript Files
            </div>
            {items.length > 0 && (
              <button
                type="button"
                className="jb-action-btn jb-action-btn--ghost"
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

          <div className="jb-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              id="jb-files"
              className="jb-file-input"
              multiple
              accept=".js,.mjs,.cjs,.ts,.jsx,.tsx"
              onChange={handleFilesChange}
              disabled={isProcessing}
            />
            <label htmlFor="jb-files" className="jb-drop-zone">
              <div className="jb-drop-icon">
                <i className="ti ti-cloud-upload" />
              </div>
              <div>
                <p className="jb-drop-title">Drop JS files here or click to browse</p>
                <p className="jb-drop-sub">
                  .js · .mjs · .cjs · .ts · .jsx · .tsx · Multiple files
                </p>
              </div>
            </label>
          </div>

          {items.length > 0 && (
            <div className="jb-summary-bar">
              <div className="jb-summary-stats">
                <span className="jb-summary-stat">
                  <i className="ti ti-files" />
                  {items.length} file{items.length !== 1 ? "s" : ""}
                </span>
                <span className="jb-summary-stat">
                  <i className="ti ti-database" />
                  {formatBytes(items.reduce((s, i) => s + i.size, 0))}
                </span>
                <span className="jb-summary-stat">
                  <i className="ti ti-adjustments" />
                  {options.mode}
                </span>
              </div>
              <button
                type="button"
                className="jb-action-btn jb-action-btn--primary"
                onClick={processAll}
                disabled={isProcessing}
              >
                <i className={`ti ${isProcessing ? "ti-loader jb-spin" : "ti-play"}`} />
                {isProcessing ? `Processing… ${progress}%` : "Process All"}
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="jb-progress-wrap">
            <div className="jb-progress-top">
              <span className="jb-progress-label">Processing {progress}%</span>
              <span className="jb-progress-sub">
                {completedCount} of {items.length} done
              </span>
            </div>
            <div className="jb-progress-track">
              <div className="jb-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Results */}
        {items.length > 0 && (
          <div className="jb-section">
            <div className="jb-section-header">
              <div className="jb-section-title">
                <i className="ti ti-list-check" />
                Results
                {completedCount > 0 && (
                  <span className="jb-badge jb-badge--success">{completedCount} done</span>
                )}
                {errorCount > 0 && (
                  <span className="jb-badge jb-badge--error">
                    {errorCount} error{errorCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="jb-header-right">
                {totalSavings > 0 && (
                  <span className="jb-savings-badge">
                    <i className="ti ti-discount-check" />
                    Saved {formatBytes(totalSavings)}
                  </span>
                )}
                {completedCount > 0 && (
                  <button
                    type="button"
                    className="jb-action-btn jb-action-btn--ghost"
                    onClick={downloadAll}
                  >
                    <i className="ti ti-download" />
                    Download All
                  </button>
                )}
              </div>
            </div>

            <div className="jb-results">
              {items.map((item) => (
                <div key={item.id} className="jb-result-row">
                  <div className="jb-result-info">
                    <i className="ti ti-file-code" />
                    <div className="jb-result-name-wrap">
                      <span className="jb-result-name">{item.name}</span>
                      <span className="jb-result-size">{formatBytes(item.size)}</span>
                    </div>
                    {item.result && (
                      <span
                        className={`jb-result-savings ${item.result.stats.savings > 0 ? "positive" : ""}`}
                      >
                        {item.result.stats.savings > 0
                          ? `↓ ${formatBytes(item.result.stats.savings)} (${item.result.stats.savingsPercent}%)`
                          : "No change"}
                      </span>
                    )}
                  </div>

                  <div className="jb-result-actions">
                    <div className={`jb-status jb-status--${item.status}`}>
                      <i
                        className={`ti ${
                          item.status === "pending"
                            ? "ti-clock"
                            : item.status === "processing"
                              ? "ti-loader jb-spin"
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
                          className={`jb-icon-btn ${copiedId === item.id ? "copied" : ""}`}
                          onClick={() => copyItem(item)}
                          title="Copy"
                        >
                          <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                        </button>
                        <button
                          type="button"
                          className="jb-icon-btn"
                          onClick={() => downloadItem(item)}
                          title="Download"
                        >
                          <i className="ti ti-download" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="jb-remove-btn"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                      title="Remove"
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>

                  {item.status === "error" && item.error && (
                    <div className="jb-error-row">
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
          <div className="jb-empty">
            <div className="jb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <h3 className="jb-empty-title">Batch JS Minification</h3>
            <p className="jb-empty-desc">
              Upload multiple JavaScript files to minify them all at once with the same settings.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .jb-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
          background: var(--bg-surface);
        }

        .jb-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .jb-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .jb-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jb-section-title i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .jb-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .jb-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          border: 0.5px solid var(--border);
        }

        .jb-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .jb-action-btn i {
          font-size: 13px;
        }

        .jb-action-btn--primary {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        .jb-action-btn--primary:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .jb-action-btn--ghost {
          background: var(--bg-card);
          color: var(--text-secondary);
        }

        .jb-action-btn--ghost:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        /* Upload */
        .jb-upload-area {
          padding: 16px;
        }
        .jb-file-input {
          display: none;
        }

        .jb-drop-zone {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border: 2px dashed var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          background: var(--bg-surface);
        }

        .jb-drop-zone:hover {
          border-color: var(--brand);
          background: var(--brand-light);
        }

        .jb-drop-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .jb-drop-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 4px;
        }

        .jb-drop-sub {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
        }

        /* Summary bar */
        .jb-summary-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .jb-summary-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .jb-summary-stat {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .jb-summary-stat i {
          font-size: 12px;
        }

        /* Progress */
        .jb-progress-wrap {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }

        .jb-progress-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .jb-progress-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .jb-progress-sub {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .jb-progress-track {
          height: 8px;
          background: var(--bg-surface);
          border-radius: 99px;
          overflow: hidden;
        }

        .jb-progress-fill {
          height: 100%;
          background: var(--brand);
          border-radius: 99px;
          transition: width 0.3s ease;
        }

        /* Badges */
        .jb-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .jb-badge--success {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }
        .jb-badge--error {
          background: #fef2f2;
          color: #dc2626;
          border: 0.5px solid #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .jb-badge--error {
            background: #1f1517;
            color: #f87171;
            border-color: #3c1518;
          }
        }

        .jb-savings-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #166534;
        }

        @media (prefers-color-scheme: dark) {
          .jb-savings-badge {
            color: #4ade80;
          }
        }

        /* Results */
        .jb-results {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
        }

        .jb-result-row {
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
        }

        .jb-result-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
        }

        .jb-result-info > i {
          font-size: 16px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .jb-result-name-wrap {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .jb-result-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .jb-result-size {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          flex-shrink: 0;
        }

        .jb-result-savings {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .jb-result-savings.positive {
          color: #16a34a;
        }

        @media (prefers-color-scheme: dark) {
          .jb-result-savings.positive {
            color: #4ade80;
          }
        }

        .jb-result-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px 12px;
          flex-wrap: wrap;
        }

        .jb-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .jb-status i {
          font-size: 11px;
        }

        .jb-status--pending {
          background: var(--bg-surface);
          color: var(--text-disabled);
          border: 0.5px solid var(--border);
        }
        .jb-status--processing {
          background: #eff6ff;
          color: #1d4ed8;
          border: 0.5px solid #bfdbfe;
        }
        .jb-status--completed {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }
        .jb-status--error {
          background: #fef2f2;
          color: #dc2626;
          border: 0.5px solid #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .jb-status--processing {
            background: #0a1628;
            color: #93c5fd;
            border-color: #1e3a5f;
          }
          .jb-status--error {
            background: #1f1517;
            color: #f87171;
            border-color: #3c1518;
          }
        }

        .jb-icon-btn,
        .jb-remove-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-tertiary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jb-icon-btn:hover,
        .jb-remove-btn:hover:not(:disabled) {
          background: var(--bg-card);
          color: var(--text);
        }

        .jb-icon-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .jb-remove-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .jb-error-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 12px;
          border-top: 0.5px solid var(--border);
        }

        @media (prefers-color-scheme: dark) {
          .jb-error-row {
            background: #1f1517;
            color: #f87171;
          }
        }

        .jb-error-row i {
          font-size: 14px;
          flex-shrink: 0;
        }

        /* Empty */
        .jb-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 60px 24px;
          text-align: center;
        }

        .jb-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--text-disabled);
        }

        .jb-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }
        .jb-empty-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 380px;
          line-height: 1.6;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .jb-spin {
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .jb-root {
            padding: 12px;
          }

          .jb-drop-zone {
            flex-direction: column;
            text-align: center;
          }

          .jb-summary-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .jb-summary-stats {
            justify-content: space-around;
          }

          .jb-result-info {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
}
