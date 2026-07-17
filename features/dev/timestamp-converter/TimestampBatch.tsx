// features/dev/timestamp-converter/TimestampBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { convertTimestamp, type TimestampOptions } from "./utils";

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
      <div className="tb-root">
        {/*  Input Section  */}
        <div className="tb-section">
          <div className="tb-section-header">
            <div className="tb-section-label">
              <i className="ti ti-files" />
              Batch Input
            </div>
            <button
              type="button"
              className="tb-btn"
              onClick={handleClear}
              disabled={!batchInput && items.length === 0}
            >
              <i className="ti ti-trash" />
              <span className="tb-btn-text">Clear</span>
            </button>
          </div>
          <textarea
            className="tb-textarea"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Enter multiple timestamps or dates (one per line)...&#10;&#10;1704067200&#10;2024-01-15&#10;2024-06-01T10:30:00Z"
            rows={8}
            disabled={processing}
          />
          <div className="tb-input-footer">
            <span className="tb-input-count">
              {batchInput.split("\n").filter((s) => s.trim()).length} items
            </span>
            <button
              type="button"
              className="tb-btn tb-btn-primary"
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
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-label">
                <i className="ti ti-list-check" />
                <span className="tb-label-text">Results</span>
                <span className="tb-results-badge">
                  {doneCount}/{items.length}
                </span>
                {errorCount > 0 && <span className="tb-error-badge">{errorCount} errors</span>}
              </div>
              <div className="tb-section-actions">
                <button
                  type="button"
                  className="tb-btn"
                  onClick={handleCopyAll}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-copy" />
                  <span className="tb-btn-text">Copy</span>
                </button>
                <button
                  type="button"
                  className="tb-btn"
                  onClick={handleDownloadCsv}
                  disabled={doneCount === 0}
                >
                  <i className="ti ti-download" />
                  <span className="tb-btn-text">CSV</span>
                </button>
              </div>
            </div>

            <div className="tb-results">
              {items.map((item, idx) => (
                <div key={item.id} className={`tb-result-item status-${item.status}`}>
                  <div className="tb-result-header">
                    <div className="tb-result-index">#{idx + 1}</div>
                    {item.status === "pending" && (
                      <span className="tb-status-badge pending">
                        <i className="ti ti-clock" />
                        Pending
                      </span>
                    )}
                    {item.status === "processing" && (
                      <span className="tb-status-badge processing">
                        <i className="ti ti-loader" />
                        Processing
                      </span>
                    )}
                    {item.status === "done" && (
                      <span className="tb-status-badge done">
                        <i className="ti ti-check" />
                        Done
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="tb-status-badge error">
                        <i className="ti ti-alert-circle" />
                        Error
                      </span>
                    )}
                  </div>
                  <div className="tb-result-content">
                    <div className="tb-result-input">
                      <span className="tb-result-label">Input:</span>
                      <code>{item.input}</code>
                    </div>
                    {item.status === "done" && (
                      <>
                        <div className="tb-result-output">
                          <span className="tb-result-label">ISO:</span>
                          <code>{item.iso}</code>
                        </div>
                        <div className="tb-result-relative">
                          <i className="ti ti-history" />
                          {item.relative}
                        </div>
                      </>
                    )}
                    {item.status === "error" && (
                      <div className="tb-result-error">
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
          <div className="tb-empty">
            <div className="tb-empty-icon">
              <i className="ti ti-files" />
            </div>
            <p className="tb-empty-title">Batch Timestamp Conversion</p>
            <p className="tb-empty-desc">
              Convert multiple timestamps at once. Enter one per line above.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .tb-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        .tb-section {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--tc-radius-lg, 12px);
          overflow: hidden;
        }

        .tb-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .tb-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .tb-section-label i {
          font-size: 12px;
        }

        .tb-results-badge {
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

        .tb-error-badge {
          display: inline-flex;
          align-items: center;
          height: 20px;
          padding: 0 7px;
          border-radius: 99px;
          background: var(--error-bg);
          color: #b91c1c;
          font-size: 10px;
          font-weight: 600;
        }

        @media (prefers-color-scheme: dark) {
          .tb-error-badge {
            color: #f87171;
          }
        }

        .tb-section-actions {
          display: flex;
          gap: 6px;
        }

        .tb-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--tc-radius-md, 8px);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .tb-btn i {
          font-size: 12px;
        }

        .tb-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .tb-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .tb-btn-primary {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .tb-btn-primary:hover:not(:disabled) {
          background: var(--brand);
          color: white;
        }

        .tb-textarea {
          width: 100%;
          padding: 12px 14px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          resize: vertical;
          min-height: 150px;
        }

        .tb-textarea:disabled {
          opacity: 0.6;
        }

        .tb-textarea::placeholder {
          color: var(--text-disabled);
        }

        .tb-input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          gap: 12px;
        }

        .tb-input-count {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .tb-results {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border-faint);
          max-height: 500px;
          overflow-y: auto;
        }

        .tb-result-item {
          background: var(--bg-card);
        }

        .tb-result-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
        }

        .tb-result-index {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .tb-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          margin-left: auto;
        }

        .tb-status-badge i {
          font-size: 11px;
        }

        .tb-status-badge.pending {
          background: var(--bg-card);
          color: var(--text-disabled);
          border: 0.5px solid var(--border);
        }

        .tb-status-badge.processing {
          background: #eff6ff;
          color: #1d4ed8;
          border: 0.5px solid #bfdbfe;
        }

        @media (prefers-color-scheme: dark) {
          .tb-status-badge.processing {
            background: #0a1628;
            color: #93c5fd;
            border-color: #1e3a5f;
          }
        }

        .tb-status-badge.done {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .tb-status-badge.error {
          background: var(--error-bg);
          color: #b91c1c;
          border: 0.5px solid #f3d2d2;
        }

        @media (prefers-color-scheme: dark) {
          .tb-status-badge.error {
            color: #f87171;
            border-color: #5a2a2a;
          }
        }

        .tb-result-content {
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tb-result-input,
        .tb-result-output {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
        }

        .tb-result-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          min-width: 40px;
        }

        .tb-result-content code {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text);
          background: var(--bg-surface);
          padding: 4px 8px;
          border-radius: 4px;
          word-break: break-all;
        }

        .tb-result-relative {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--brand);
          font-weight: 500;
        }

        .tb-result-relative i {
          font-size: 12px;
        }

        .tb-result-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: var(--error-bg);
          border-radius: 5px;
          color: #b91c1c;
          font-size: 11px;
        }

        @media (prefers-color-scheme: dark) {
          .tb-result-error {
            color: #f87171;
          }
        }

        .tb-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .tb-empty-icon {
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

        .tb-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .tb-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 320px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .tb-root {
            padding: 12px;
          }

          .tb-label-text {
            display: none;
          }

          .tb-btn-text {
            display: none;
          }

          .tb-section-header {
            padding: 8px 12px;
          }

          .tb-textarea {
            padding: 10px 12px;
            min-height: 120px;
          }

          .tb-result-header {
            padding: 8px 12px;
          }

          .tb-result-content {
            padding: 8px 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tb-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
