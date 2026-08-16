// features/dev/random-string-generator/BatchGenerator.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { GeneratorOptions, GeneratedString } from "./ts/utils";
import {
  generateString,
  calculateEntropy,
  getStrengthLevel,
  exportToCSV,
  exportToJSON,
  exportToText,
} from "./ts/utils";
import styles from "./style/BatchGenerator.module.css";

interface BatchGeneratorProps {
  options: GeneratorOptions;
  onGenerate?: (results: GeneratedString[]) => void;
}

type ExportFormat = "csv" | "json" | "txt";
type MobileView = "config" | "results";

export default function BatchGenerator({ options, onGenerate }: BatchGeneratorProps) {
  const [count, setCount] = useState(10);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [addIndex, setAddIndex] = useState(false);
  const [results, setResults] = useState<GeneratedString[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("config");

  const entropy = useMemo(() => calculateEntropy(options), [options]);
  const strength = useMemo(() => getStrengthLevel(entropy), [entropy]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setProgress(0);
    const generated = new Set<string>();
    const newResults: GeneratedString[] = [];
    const batchSize = 50;

    for (let i = 0; i < count; i += batchSize) {
      const chunk = Math.min(batchSize, count - i);

      for (let j = 0; j < chunk; j++) {
        let value = generateString(options);

        if (addIndex) {
          value = `${i + j + 1}_${value}`;
        }

        if (uniqueOnly) {
          let attempts = 0;
          while (generated.has(value) && attempts < 100) {
            value = generateString(options);
            if (addIndex) {
              value = `${i + j + 1}_${value}`;
            }
            attempts++;
          }
        }

        generated.add(value);
        newResults.push({
          id: `${Date.now()}-${i + j}`,
          value,
          timestamp: Date.now(),
          options: { ...options },
          entropy,
          strength,
        });
      }

      setProgress(((i + chunk) / count) * 100);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setResults(newResults);
    setGenerating(false);
    setProgress(100);

    // Auto-switch to results on mobile
    setMobileView("results");

    if (onGenerate) {
      onGenerate(newResults);
    }
  }, [count, uniqueOnly, addIndex, options, entropy, strength, onGenerate]);

  const handleCopy = useCallback(async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Silent fail
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = results.map((r) => r.value).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId("all");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Silent fail
    }
  }, [results]);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      let content = "";
      let filename = "";

      switch (format) {
        case "csv":
          content = exportToCSV(results);
          filename = "random-strings.csv";
          break;
        case "json":
          content = exportToJSON(results);
          filename = "random-strings.json";
          break;
        case "txt":
          content = exportToText(results);
          filename = "random-strings.txt";
          break;
      }

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [results]
  );

  const handleClear = useCallback(() => {
    setResults([]);
    setProgress(0);
    setMobileView("config");
  }, []);

  const uniqueCount = useMemo(() => new Set(results.map((r) => r.value)).size, [results]);
  const duplicateCount = results.length - uniqueCount;

  return (
    <>
      <div className={styles.bgRoot}>
        {/*  Mobile Tab Switcher  */}
        <div className={styles.bgMobileTabs}>
          <button
            type="button"
            className={`${styles.bgMobileTab}${mobileView === "config" ? ` ${styles.active}` : ""}`}
            onClick={() => setMobileView("config")}
          >
            <i className="ti ti-settings" />
            Configure
          </button>
          <button
            type="button"
            className={`${styles.bgMobileTab}${mobileView === "results" ? ` ${styles.active}` : ""}`}
            onClick={() => setMobileView("results")}
          >
            <i className="ti ti-list-check" />
            Results
            {results.length > 0 && <span className={styles.bgMobileBadge}>{results.length}</span>}
          </button>
        </div>

        <div
          className={`${styles.bgConfig}${mobileView === "config" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
        >
          <div className={styles.bgConfigSection}>
            <label className={styles.bgLabel}>Quantity</label>
            <div className={styles.bgQuantityControl}>
              <button
                type="button"
                className={styles.bgQuantityBtn}
                onClick={() => setCount(Math.max(1, count - 10))}
                disabled={generating}
              >
                <i className="ti ti-minus" />
              </button>
              <input
                type="number"
                className={styles.bgQuantityInput}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))
                }
                min="1"
                max="10000"
                disabled={generating}
              />
              <button
                type="button"
                className={styles.bgQuantityBtn}
                onClick={() => setCount(Math.min(10000, count + 10))}
                disabled={generating}
              >
                <i className="ti ti-plus" />
              </button>
            </div>
            <div className={styles.bgQuickAmounts}>
              {[10, 50, 100, 500, 1000].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.bgQuickBtn}${count === n ? ` ${styles.active}` : ""}`}
                  onClick={() => setCount(n)}
                  disabled={generating}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.bgConfigSection}>
            <label className={styles.bgLabel}>Options</label>
            <div className={styles.bgOptions}>
              <label className={styles.bgCheckbox}>
                <input
                  type="checkbox"
                  checked={uniqueOnly}
                  onChange={(e) => setUniqueOnly(e.target.checked)}
                  disabled={generating}
                />
                <span className={styles.bgCheckboxLabel}>
                  Generate unique strings only
                  <span className={styles.bgCheckboxHint}>Skip duplicates</span>
                </span>
              </label>
              <label className={styles.bgCheckbox}>
                <input
                  type="checkbox"
                  checked={addIndex}
                  onChange={(e) => setAddIndex(e.target.checked)}
                  disabled={generating}
                />
                <span className={styles.bgCheckboxLabel}>
                  Add numeric index prefix
                  <span className={styles.bgCheckboxHint}>e.g., 1_abc123</span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            className={styles.bgGenerateBtn}
            onClick={handleGenerate}
            disabled={generating}
          >
            <i className={`ti ${generating ? "ti-loader" : "ti-rocket"}`} />
            {generating ? `Generating... ${Math.round(progress)}%` : `Generate ${count} Strings`}
          </button>
        </div>

        {generating && (
          <div className={styles.bgProgressBar}>
            <div className={styles.bgProgressFill} style={{ width: `${progress}%` }} />
          </div>
        )}

        <div
          className={`${styles.bgResultsContainer}${mobileView === "results" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
        >
          {results.length > 0 && (
            <div className={styles.bgResultsHeader}>
              <div className={styles.bgResultsInfo}>
                <i className="ti ti-list-check" />
                <span className={styles.bgResultsCount}>{results.length} strings generated</span>
                {duplicateCount > 0 && (
                  <span className={styles.bgDuplicateBadge}>
                    <i className="ti ti-copy" />
                    {duplicateCount} duplicate{duplicateCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className={styles.bgResultsActions}>
                <button
                  type="button"
                  className={`${styles.bgActionBtn}${copiedId === "all" ? ` ${styles.copied}` : ""}`}
                  onClick={handleCopyAll}
                >
                  <i className={`ti ${copiedId === "all" ? "ti-check" : "ti-copy"}`} />
                  {copiedId === "all" ? "Copied" : "Copy All"}
                </button>
                <div className={styles.bgExportDropdown}>
                  <button type="button" className={styles.bgActionBtn}>
                    <i className="ti ti-download" />
                    Export
                    <i className="ti ti-chevron-down" style={{ fontSize: "10px" }} />
                  </button>
                  <div className={styles.bgExportMenu}>
                    <button
                      type="button"
                      className={styles.bgExportItem}
                      onClick={() => handleExport("txt")}
                    >
                      <i className="ti ti-file-text" />
                      Plain Text (.txt)
                    </button>
                    <button
                      type="button"
                      className={styles.bgExportItem}
                      onClick={() => handleExport("csv")}
                    >
                      <i className="ti ti-file-spreadsheet" />
                      CSV (.csv)
                    </button>
                    <button
                      type="button"
                      className={styles.bgExportItem}
                      onClick={() => handleExport("json")}
                    >
                      <i className="ti ti-file-code" />
                      JSON (.json)
                    </button>
                  </div>
                </div>
                <button type="button" className={`${styles.bgActionBtn} ${styles.bgClearBtn}`} onClick={handleClear}>
                  <i className="ti ti-trash" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className={styles.bgEmpty}>
              <div className={styles.bgEmptyIcon}>
                <i className="ti ti-layers-linked" />
              </div>
              <p className={styles.bgEmptyTitle}>Batch Generation</p>
              <p className={styles.bgEmptyDesc}>
                Generate hundreds or thousands of random strings at once. Perfect for testing, data
                seeding, or bulk password generation.
              </p>
              <button className={styles.bgEmptyCta} onClick={() => setMobileView("config")}>
                <i className="ti ti-settings" />
                Configure Batch
              </button>
            </div>
          ) : (
            <div className={styles.bgResultsGrid}>
              {results.map((result) => (
                <div key={result.id} className={styles.bgResultItem}>
                  <div className={styles.bgResultValue}>{result.value}</div>
                  <button
                    type="button"
                    className={`${styles.bgCopyIcon}${copiedId === result.id ? ` ${styles.copied}` : ""}`}
                    onClick={() => handleCopy(result.value, result.id)}
                    title="Copy to clipboard"
                  >
                    <i className={`ti ${copiedId === result.id ? "ti-check" : "ti-copy"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}