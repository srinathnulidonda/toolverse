// features/dev/css-minifier/CSSBatch.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { processCSS } from "./utils";
import { formatBytes } from "@/utils";

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
  onComplete?: (count: number) => void;
}

export default function CSSBatch({ onComplete }: CSSBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: BatchItem[] = [];

    for (const file of files) {
      if (!file.name.endsWith(".css")) continue;

      try {
        const text = await file.text();
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          input: text,
          output: "",
          status: "pending",
        });
      } catch {
        // Skip files that can't be read
      }
    }

    setItems(newItems);
  }, []);

  const handleProcess = useCallback(async () => {
    if (items.length === 0) return;

    setProcessing(true);

    for (let i = 0; i < items.length; i++) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "processing" as const } : item))
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const result = processCSS(items[i].input);

        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
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
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
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
    if (onComplete) onComplete(items.length);
  }, [items, onComplete]);

  const handleDownloadAll = useCallback(() => {
    items
      .filter((item) => item.status === "done")
      .forEach((item) => {
        const blob = new Blob([item.output], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name.replace(".css", ".min.css");
        a.click();
        URL.revokeObjectURL(url);
      });
  }, [items]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  }, []);

  const doneCount = items.filter((i) => i.status === "done").length;
  const totalSavings = useMemo(() => {
    return items
      .filter((i) => i.status === "done")
      .reduce((acc, item) => acc + (item.stats?.savings || 0), 0);
  }, [items]);

  return (
    <>
      <div className="cb-root">
        {/*  Upload Section  */}
        <div className="cb-section">
          <div className="cb-section-header">
            <div className="cb-section-label">
              <i className="ti ti-upload" />
              Upload CSS Files
            </div>
            {items.length > 0 && (
              <button
                type="button"
                className="cb-btn"
                onClick={() => setItems([])}
                disabled={processing}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            )}
          </div>

          <div className="cb-upload-area">
            <input
              type="file"
              id="css-files"
              className="cb-file-input"
              multiple
              accept=".css"
              onChange={handleFilesChange}
              disabled={processing}
            />
            <label htmlFor="css-files" className="cb-upload-label">
              <div className="cb-upload-icon">
                <i className="ti ti-file-upload" />
              </div>
              <p className="cb-upload-title">Choose CSS files</p>
              <p className="cb-upload-desc">Select multiple .css files to minify</p>
            </label>
          </div>

          {items.length > 0 && (
            <div className="cb-upload-footer">
              <span className="cb-upload-count">
                {items.length} {items.length === 1 ? "file" : "files"} selected
              </span>
              <button
                type="button"
                className="cb-btn cb-btn-primary"
                onClick={handleProcess}
                disabled={processing}
              >
                <i className={`ti ${processing ? "ti-loader" : "ti-wand"}`} />
                {processing ? "Processing..." : "Minify All"}
              </button>
            </div>
          )}
        </div>

        {/*  Results Section  */}
        {items.length > 0 && (
          <div className="cb-section">
            <div className="cb-section-header">
              <div className="cb-section-label">
                <i className="ti ti-list-check" />
                Results
                {doneCount > 0 && (
                  <span className="cb-count-badge">
                    {doneCount}/{items.length}
                  </span>
                )}
              </div>
              <div className="cb-section-actions">
                {totalSavings > 0 && (
                  <span className="cb-savings-badge">
                    <i className="ti ti-discount-check" />
                    Saved {formatBytes(totalSavings)}
                  </span>
                )}
                <button
                  type="button"
                  className="cb-btn"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  Download All
                </button>
              </div>
            </div>

            <div className="cb-results">
              {items.map((item, idx) => (
                <div key={item.id} className="cb-result-item">
                  <div className="cb-result-header">
                    <div className="cb-result-index">#{idx + 1}</div>
                    <div className="cb-result-info">
                      <span className="cb-result-name">{item.name}</span>
                      {item.stats && (
                        <span className="cb-result-stats">
                          {formatBytes(item.stats.original)} → {formatBytes(item.stats.minified)} (
                          {item.stats.savingsPercent}% saved)
                        </span>
                      )}
                    </div>
                    <div className="cb-result-status">
                      {item.status === "pending" && (
                        <span className="cb-status-badge pending">
                          <i className="ti ti-clock" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="cb-status-badge processing">
                          <i className="ti ti-loader" />
                          Processing
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="cb-status-badge done">
                          <i className="ti ti-check" />
                          Done
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="cb-status-badge error">
                          <i className="ti ti-alert-circle" />
                          Error
                        </span>
                      )}
                    </div>
                    {item.status === "done" && (
                      <button
                        type="button"
                        className={`cb-copy-btn${copiedId === item.id ? " copied" : ""}`}
                        onClick={() => handleCopy(item.output, item.id)}
                      >
                        <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                      </button>
                    )}
                  </div>

                  {item.status === "error" && item.error && (
                    <div className="cb-result-error">
                      <i className="ti ti-alert-triangle" />
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/*  Empty State  */}
        {items.length === 0 && (
          <div className="cb-empty">
            <div className="cb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <p className="cb-empty-title">Batch CSS Minifier</p>
            <p className="cb-empty-desc">
              Upload multiple CSS files and minify them all at once. Results can be downloaded
              individually or as a batch.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .cb-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        .cb-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cm-radius-lg);
          overflow: hidden;
        }

        .cb-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .cb-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .cb-section-label i {
          font-size: 12px;
        }

        .cb-count-badge {
          display: inline-flex;
          align-items: center;
          height: 20px;
          padding: 0 7px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
        }

        .cb-section-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cb-savings-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 9px;
          border-radius: 99px;
          background: #dcfce7;
          color: #166534;
          border: 0.5px solid #bbf7d0;
          font-size: 11px;
          font-weight: 600;
        }

        @media (prefers-color-scheme: dark) {
          .cb-savings-badge {
            background: #052e16;
            color: #4ade80;
            border-color: #166534;
          }
        }

        .cb-savings-badge i {
          font-size: 12px;
        }

        .cb-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--cm-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .cb-btn i {
          font-size: 12px;
        }

        .cb-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .cb-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cb-btn-primary {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .cb-btn-primary:hover:not(:disabled) {
          background: var(--brand);
          color: white;
        }

        .cb-upload-area {
          padding: 14px;
        }

        .cb-file-input {
          display: none;
        }

        .cb-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 160px;
          padding: 24px;
          border: 1.5px dashed var(--border);
          border-radius: var(--cm-radius-lg);
          cursor: pointer;
          transition: all 0.12s;
        }

        .cb-upload-label:hover {
          border-color: var(--brand);
          background: var(--brand-light);
        }

        .cb-upload-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--text-tertiary);
          margin-bottom: 12px;
        }

        .cb-upload-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 4px;
        }

        .cb-upload-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
        }

        .cb-upload-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
        }

        .cb-upload-count {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .cb-results {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border-faint);
        }

        .cb-result-item {
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
        }

        .cb-result-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
        }

        .cb-result-index {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          min-width: 32px;
        }

        .cb-result-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .cb-result-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cb-result-stats {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .cb-result-status {
          flex-shrink: 0;
        }

        .cb-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
        }

        .cb-status-badge i {
          font-size: 11px;
        }

        .cb-status-badge.pending {
          background: var(--bg-surface);
          color: var(--text-disabled);
          border: 0.5px solid var(--border);
        }

        .cb-status-badge.processing {
          background: #eff6ff;
          color: #1d4ed8;
          border: 0.5px solid #bfdbfe;
        }

        @media (prefers-color-scheme: dark) {
          .cb-status-badge.processing {
            background: #0a1628;
            color: #93c5fd;
            border-color: #1e3a5f;
          }
        }

        .cb-status-badge.done {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .cb-status-badge.error {
          background: var(--error-bg);
          color: #b91c1c;
          border: 0.5px solid #f3d2d2;
        }

        @media (prefers-color-scheme: dark) {
          .cb-status-badge.error {
            color: #f87171;
            border-color: #5a2a2a;
          }
        }

        .cb-copy-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--cm-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          flex-shrink: 0;
        }

        .cb-copy-btn i {
          font-size: 12px;
        }

        .cb-copy-btn:hover {
          background: var(--bg-card);
          color: var(--text);
        }

        .cb-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .cb-result-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--error-bg);
          color: #b91c1c;
          font-size: 11px;
          border-top: 0.5px solid var(--border-faint);
        }

        @media (prefers-color-scheme: dark) {
          .cb-result-error {
            color: #f87171;
          }
        }

        .cb-result-error i {
          font-size: 12px;
          flex-shrink: 0;
        }

        .cb-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .cb-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-disabled);
          margin-bottom: 6px;
        }

        .cb-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .cb-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 360px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .cb-root {
            padding: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cb-btn,
          .cb-upload-label,
          .cb-copy-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
