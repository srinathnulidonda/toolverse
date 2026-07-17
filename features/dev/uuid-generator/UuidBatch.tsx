// features/dev/uuid-generator/UuidBatch.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback } from "react";
import {
  generate,
  calculateCollisionProbability,
  exportAsJson,
  exportAsCsv,
  exportAsSql,
  exportAsArray,
  type UuidVersion,
  type UuidFormat,
  type UuidCase,
} from "./utils";

interface UuidBatchProps {
  version: UuidVersion;
  format: UuidFormat;
  uuidCase: UuidCase;
  onComplete?: (uuids: string[]) => void;
}

type ExportFormat = "json" | "csv" | "sql" | "js" | "python" | "go" | "java" | "txt";

const MAX_BULK = 10000;

export default function UuidBatch({ version, format, uuidCase, onComplete }: UuidBatchProps) {
  const [count, setCount] = useState(10);
  const [uuids, setUuids] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");

  const handleGenerate = useCallback(async () => {
    const n = Math.min(Math.max(1, count), MAX_BULK);
    setGenerating(true);
    setProgress(0);

    try {
      const results: string[] = [];
      const chunkSize = 100;

      for (let i = 0; i < n; i += chunkSize) {
        const chunk = Math.min(chunkSize, n - i);
        const promises = Array.from({ length: chunk }, () =>
          generate({ version, format, case: uuidCase })
        );

        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
        setProgress(Math.round((results.length / n) * 100));

        // Allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setUuids(results);
      if (onComplete) onComplete(results);
    } catch (err) {
      logger.error("Batch generation failed:", err);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }, [count, version, format, uuidCase, onComplete]);

  const handleCopyAll = useCallback(async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      /* silent */
    }
  }, [uuids]);

  const handleDownload = useCallback(() => {
    if (!uuids.length) return;

    let content: string;
    let filename: string;
    let mimeType = "text/plain";

    switch (exportFormat) {
      case "json":
        content = exportAsJson(uuids);
        filename = "uuids.json";
        mimeType = "application/json";
        break;
      case "csv":
        content = exportAsCsv(uuids, true);
        filename = "uuids.csv";
        mimeType = "text/csv";
        break;
      case "sql":
        content = exportAsSql(uuids);
        filename = "uuids.sql";
        mimeType = "application/sql";
        break;
      case "js":
        content = exportAsArray(uuids, "js");
        filename = "uuids.js";
        mimeType = "text/javascript";
        break;
      case "python":
        content = exportAsArray(uuids, "python");
        filename = "uuids.py";
        mimeType = "text/x-python";
        break;
      case "go":
        content = exportAsArray(uuids, "go");
        filename = "uuids.go";
        break;
      case "java":
        content = exportAsArray(uuids, "java");
        filename = "uuids.java";
        mimeType = "text/x-java";
        break;
      default:
        content = uuids.join("\n");
        filename = "uuids.txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [uuids, exportFormat]);

  const handleClear = useCallback(() => {
    setUuids([]);
    setCount(10);
  }, []);

  const collisionProb = calculateCollisionProbability(count, version);

  return (
    <>
      <div className="ub-root">
        {/*  Controls  */}
        <div className="ub-controls">
          <div className="ub-controls-left">
            <div className="ub-count-group">
              <label className="ub-count-label">Quantity:</label>
              <div className="ub-count-stepper">
                <button
                  type="button"
                  className="ub-count-btn"
                  onClick={() => setCount((c) => Math.max(1, c - 10))}
                  disabled={generating}
                >
                  <i className="ti ti-minus" />
                </button>
                <input
                  type="number"
                  className="ub-count-input"
                  value={count}
                  onChange={(e) =>
                    setCount(Math.min(MAX_BULK, Math.max(1, Number(e.target.value))))
                  }
                  min={1}
                  max={MAX_BULK}
                  disabled={generating}
                />
                <button
                  type="button"
                  className="ub-count-btn"
                  onClick={() => setCount((c) => Math.min(MAX_BULK, c + 10))}
                  disabled={generating}
                >
                  <i className="ti ti-plus" />
                </button>
              </div>
            </div>

            <div className="ub-quick-btns">
              {[10, 50, 100, 1000].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ub-quick-btn${count === n ? " active" : ""}`}
                  onClick={() => setCount(n)}
                  disabled={generating}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="ub-controls-right">
            <button
              type="button"
              className="ub-generate-btn"
              onClick={handleGenerate}
              disabled={generating}
            >
              <i className={`ti ${generating ? "ti-loader ub-spinning" : "ti-play"}`} />
              {generating ? `${progress}%` : "Generate"}
            </button>
          </div>
        </div>

        {/*  Stats Bar  */}
        {uuids.length > 0 && (
          <div className="ub-stats">
            <div className="ub-stat">
              <i className="ti ti-hash" />
              <span className="ub-stat-value">{uuids.length.toLocaleString()}</span>
              <span className="ub-stat-label">UUIDs</span>
            </div>
            <div className="ub-stat">
              <i className="ti ti-binary" />
              <span className="ub-stat-value">{Math.round(uuids.join("").length / 1024)}KB</span>
              <span className="ub-stat-label">Size</span>
            </div>
            <div className="ub-stat">
              <i className="ti ti-info-circle" />
              <span className="ub-stat-value" title={collisionProb}>
                {collisionProb}
              </span>
              <span className="ub-stat-label">Collision Risk</span>
            </div>
          </div>
        )}

        {/*  Export Controls  */}
        {uuids.length > 0 && (
          <div className="ub-export">
            <div className="ub-export-left">
              <span className="ub-export-label">Export as:</span>
              <select
                className="ub-export-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              >
                <option value="txt">Text (.txt)</option>
                <option value="json">JSON (.json)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="sql">SQL (.sql)</option>
                <option value="js">JavaScript (.js)</option>
                <option value="python">Python (.py)</option>
                <option value="go">Go (.go)</option>
                <option value="java">Java (.java)</option>
              </select>
            </div>

            <div className="ub-export-actions">
              <button
                type="button"
                className={`ub-action-btn${copiedAll ? " success" : ""}`}
                onClick={handleCopyAll}
              >
                <i className={`ti ${copiedAll ? "ti-check" : "ti-copy"}`} />
                {copiedAll ? "Copied" : "Copy All"}
              </button>
              <button type="button" className="ub-action-btn" onClick={handleDownload}>
                <i className="ti ti-download" />
                Download
              </button>
              <button type="button" className="ub-action-btn ub-clear-btn" onClick={handleClear}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        )}

        {/*  Results  */}
        <div className="ub-results">
          {uuids.length === 0 ? (
            <div className="ub-empty">
              <div className="ub-empty-icon">
                <i className="ti ti-stack" />
              </div>
              <p className="ub-empty-title">Bulk Generation</p>
              <p className="ub-empty-desc">
                Generate up to {MAX_BULK.toLocaleString()} UUIDs at once. Perfect for database
                seeding, testing, or batch operations.
              </p>
            </div>
          ) : (
            <div className="ub-list-wrap">
              <div className="ub-list-header">
                <span className="ub-list-header-label">Generated UUIDs</span>
              </div>
              <div className="ub-list">
                {uuids.slice(0, 1000).map((uuid, i) => (
                  <div key={i} className="ub-list-item">
                    <span className="ub-list-num">{i + 1}</span>
                    <code className="ub-list-uuid">{uuid}</code>
                  </div>
                ))}
                {uuids.length > 1000 && (
                  <div className="ub-list-more">
                    + {(uuids.length - 1000).toLocaleString()} more (download to see all)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/*  Progress Bar  */}
        {generating && (
          <div className="ub-progress-overlay">
            <div className="ub-progress-card">
              <div className="ub-progress-label">Generating {count} UUIDs...</div>
              <div className="ub-progress-bar">
                <div className="ub-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="ub-progress-text">{progress}%</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ub-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          overflow: hidden;
          position: relative;
        }

        /*  Controls  */
        .ub-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          flex-wrap: wrap;
        }

        .ub-controls-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .ub-count-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ub-count-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .ub-count-stepper {
          display: flex;
          align-items: center;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-card);
        }

        .ub-count-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.12s;
        }

        .ub-count-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ub-count-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ub-count-input {
          width: 80px;
          height: 32px;
          border: none;
          border-left: 0.5px solid var(--border);
          border-right: 0.5px solid var(--border);
          background: transparent;
          color: var(--text);
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-mono);
          text-align: center;
          outline: none;
        }

        .ub-count-input::-webkit-outer-spin-button,
        .ub-count-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }

        .ub-quick-btns {
          display: flex;
          gap: 4px;
        }

        .ub-quick-btn {
          height: 28px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 600;
          font-family: var(--font-mono);
          cursor: pointer;
          transition: all 0.12s;
        }

        .ub-quick-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ub-quick-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .ub-quick-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ub-controls-right {
          display: flex;
          gap: 6px;
        }

        .ub-generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 16px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--brand-border);
          background: var(--brand);
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ub-generate-btn:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .ub-generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .ub-generate-btn i {
          font-size: 14px;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .ub-spinning {
          animation: spin 1s linear infinite;
        }

        /*  Stats  */
        .ub-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px;
        }

        .ub-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
        }

        .ub-stat i {
          font-size: 16px;
          color: var(--brand);
          flex-shrink: 0;
        }

        .ub-stat-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .ub-stat-label {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-left: auto;
        }

        /*  Export  */
        .ub-export {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          flex-wrap: wrap;
        }

        .ub-export-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ub-export-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .ub-export-select {
          height: 28px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
        }

        .ub-export-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ub-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ub-action-btn i {
          font-size: 12px;
        }

        .ub-action-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ub-action-btn.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .ub-clear-btn:hover {
          color: #b91c1c;
          border-color: currentColor;
          background: var(--error-bg);
        }

        @media (prefers-color-scheme: dark) {
          .ub-clear-btn:hover {
            color: #f87171;
          }
        }

        /*  Results  */
        .ub-results {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .ub-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 48px 24px;
          text-align: center;
        }

        .ub-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--text-disabled);
          margin-bottom: 6px;
        }

        .ub-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .ub-empty-desc {
          font-size: 12.5px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 380px;
          line-height: 1.6;
        }

        .ub-list-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .ub-list-header {
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .ub-list-header-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ub-list {
          flex: 1;
          overflow: auto;
        }

        .ub-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          height: 34px;
          border-bottom: 0.5px solid var(--border-faint);
          transition: background 0.1s;
        }

        .ub-list-item:hover {
          background: var(--bg-surface);
        }

        .ub-list-num {
          width: 48px;
          font-size: 10.5px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          text-align: right;
          flex-shrink: 0;
        }

        .ub-list-uuid {
          flex: 1;
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--text);
          letter-spacing: 0.01em;
        }

        .ub-list-more {
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: var(--text-tertiary);
          font-style: italic;
        }

        /*  Progress  */
        .ub-progress-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .ub-progress-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px 32px;
          min-width: 300px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .ub-progress-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          text-align: center;
        }

        .ub-progress-bar {
          height: 8px;
          background: var(--border);
          border-radius: 99px;
          overflow: hidden;
        }

        .ub-progress-fill {
          height: 100%;
          background: var(--brand);
          border-radius: 99px;
          transition: width 0.2s ease;
        }

        .ub-progress-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
          text-align: center;
          font-family: var(--font-mono);
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .ub-root {
            padding: 12px;
          }

          .ub-controls {
            padding: 10px 12px;
          }

          .ub-controls-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .ub-list-num {
            display: none;
          }

          .ub-list-uuid {
            font-size: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ub-count-btn,
          .ub-quick-btn,
          .ub-generate-btn,
          .ub-action-btn,
          .ub-list-item,
          .ub-progress-fill {
            transition: none;
          }

          .ub-spinning {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
