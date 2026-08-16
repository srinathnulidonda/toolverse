/* features/dev/uuid-generator/UuidBatch.tsx */
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useMemo } from "react";
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
} from "./ts/utils";
import styles from "./style/UuidBatch.module.css";

interface UuidBatchProps {
  version: UuidVersion;
  format: UuidFormat;
  uuidCase: UuidCase;
  onComplete?: (uuids: string[]) => void;
}

type ExportFormat = "json" | "csv" | "sql" | "js" | "python" | "go" | "java" | "txt";

const MAX_BULK = 10000;
const QUICK_COUNTS = [10, 50, 100, 1000];

function clampCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_BULK, Math.max(1, Math.floor(value)));
}

export default function UuidBatch({ version, format, uuidCase, onComplete }: UuidBatchProps) {
  const [count, setCount] = useState(10);
  const [countDraft, setCountDraft] = useState("10");
  const [uuids, setUuids] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");

  const applyCount = useCallback((n: number) => {
    const clamped = clampCount(n);
    setCount(clamped);
    setCountDraft(String(clamped));
  }, []);

  const handleGenerate = useCallback(async () => {
    const n = clampCount(Number(countDraft) || count);
    applyCount(n);
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

        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setUuids(results);
      onComplete?.(results);
    } catch (err) {
      logger.error("Batch generation failed:", err);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }, [countDraft, count, version, format, uuidCase, onComplete, applyCount]);

  const handleCopyAll = useCallback(async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      setCopiedAll(false);
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
    applyCount(10);
  }, [applyCount]);

  const collisionProb = useMemo(
    () => calculateCollisionProbability(uuids.length || count, version),
    [uuids.length, count, version]
  );

  return (
    <div className={styles.ubRoot}>
      <div className={styles.ubControls}>
        <div className={styles.ubControlsLeft}>
          <div className={styles.ubCountGroup}>
            <label className={styles.ubCountLabel} htmlFor="uuid-batch-count">
              Quantity:
            </label>
            <div className={styles.ubCountStepper}>
              <button
                type="button"
                className={styles.ubCountBtn}
                onClick={() => applyCount(count - 10)}
                disabled={generating}
                aria-label="Decrease quantity by 10"
              >
                <i className="ti ti-minus" />
              </button>
              <input
                id="uuid-batch-count"
                type="number"
                className={styles.ubCountInput}
                value={countDraft}
                onChange={(e) => setCountDraft(e.target.value)}
                onBlur={() => applyCount(Number(countDraft))}
                min={1}
                max={MAX_BULK}
                disabled={generating}
              />
              <button
                type="button"
                className={styles.ubCountBtn}
                onClick={() => applyCount(count + 10)}
                disabled={generating}
                aria-label="Increase quantity by 10"
              >
                <i className="ti ti-plus" />
              </button>
            </div>
          </div>

          <div className={styles.ubQuickBtns}>
            {QUICK_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.ubQuickBtn}${count === n ? ` ${styles.active}` : ""}`}
                onClick={() => applyCount(n)}
                disabled={generating}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.ubControlsRight}>
          <button
            type="button"
            className={styles.ubGenerateBtn}
            onClick={handleGenerate}
            disabled={generating}
          >
            <i className={`ti ${generating ? `ti-loader ${styles.ubSpinning}` : "ti-play"}`} />
            {generating ? `${progress}%` : "Generate"}
          </button>
        </div>
      </div>

      {uuids.length > 0 && (
        <div className={styles.ubStats}>
          <div className={styles.ubStat}>
            <i className="ti ti-hash" />
            <span className={styles.ubStatValue}>{uuids.length.toLocaleString()}</span>
            <span className={styles.ubStatLabel}>UUIDs</span>
          </div>
          <div className={styles.ubStat}>
            <i className="ti ti-binary" />
            <span className={styles.ubStatValue}>{Math.round(uuids.join("").length / 1024)}KB</span>
            <span className={styles.ubStatLabel}>Size</span>
          </div>
          <div className={styles.ubStat}>
            <i className="ti ti-info-circle" />
            <span className={styles.ubStatValue} title={collisionProb}>
              {collisionProb}
            </span>
            <span className={styles.ubStatLabel}>Collision Risk</span>
          </div>
        </div>
      )}

      {uuids.length > 0 && (
        <div className={styles.ubExport}>
          <div className={styles.ubExportLeft}>
            <span className={styles.ubExportLabel}>Export as:</span>
            <select
              className={styles.ubExportSelect}
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

          <div className={styles.ubExportActions}>
            <button
              type="button"
              className={`${styles.ubActionBtn}${copiedAll ? ` ${styles.success}` : ""}`}
              onClick={handleCopyAll}
            >
              <i className={`ti ${copiedAll ? "ti-check" : "ti-copy"}`} />
              {copiedAll ? "Copied" : "Copy All"}
            </button>
            <button type="button" className={styles.ubActionBtn} onClick={handleDownload}>
              <i className="ti ti-download" />
              Download
            </button>
            <button
              type="button"
              className={`${styles.ubActionBtn} ${styles.ubClearBtn}`}
              onClick={handleClear}
              aria-label="Clear results"
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>
      )}

      <div className={styles.ubResults}>
        {uuids.length === 0 ? (
          <div className={styles.ubEmpty}>
            <div className={styles.ubEmptyIcon}>
              <i className="ti ti-stack" />
            </div>
            <p className={styles.ubEmptyTitle}>Bulk Generation</p>
            <p className={styles.ubEmptyDesc}>
              Generate up to {MAX_BULK.toLocaleString()} UUIDs at once. Perfect for database
              seeding, testing, or batch operations.
            </p>
          </div>
        ) : (
          <div className={styles.ubListWrap}>
            <div className={styles.ubListHeader}>
              <span className={styles.ubListHeaderLabel}>Generated UUIDs</span>
            </div>
            <div className={styles.ubList}>
              {uuids.slice(0, 1000).map((uuid, i) => (
                <div key={i} className={styles.ubListItem}>
                  <span className={styles.ubListNum}>{i + 1}</span>
                  <code className={styles.ubListUuid}>{uuid}</code>
                </div>
              ))}
              {uuids.length > 1000 && (
                <div className={styles.ubListMore}>
                  + {(uuids.length - 1000).toLocaleString()} more (download to see all)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {generating && (
        <div className={styles.ubProgressOverlay}>
          <div className={styles.ubProgressCard}>
            <div className={styles.ubProgressLabel}>Generating {count} UUIDs...</div>
            <div className={styles.ubProgressBar}>
              <div className={styles.ubProgressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.ubProgressText}>{progress}%</div>
          </div>
        </div>
      )}
    </div>
  );
}