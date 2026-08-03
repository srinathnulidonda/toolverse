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
    </>
  );
}
