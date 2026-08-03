// features/dev/random-string-generator/BatchGenerator.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { GeneratorOptions, GeneratedString } from "./utils";
import {
  generateString,
  calculateEntropy,
  getStrengthLevel,
  exportToCSV,
  exportToJSON,
  exportToText,
} from "./utils";

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
      <div className="bg-root">
        {/*  Mobile Tab Switcher  */}
        <div className="bg-mobile-tabs">
          <button
            type="button"
            className={`bg-mobile-tab${mobileView === "config" ? " active" : ""}`}
            onClick={() => setMobileView("config")}
          >
            <i className="ti ti-settings" />
            Configure
          </button>
          <button
            type="button"
            className={`bg-mobile-tab${mobileView === "results" ? " active" : ""}`}
            onClick={() => setMobileView("results")}
          >
            <i className="ti ti-list-check" />
            Results
            {results.length > 0 && <span className="bg-mobile-badge">{results.length}</span>}
          </button>
        </div>

        <div
          className={`bg-config${mobileView === "config" ? " mobile-visible" : " mobile-hidden"}`}
        >
          <div className="bg-config-section">
            <label className="bg-label">Quantity</label>
            <div className="bg-quantity-control">
              <button
                type="button"
                className="bg-quantity-btn"
                onClick={() => setCount(Math.max(1, count - 10))}
                disabled={generating}
              >
                <i className="ti ti-minus" />
              </button>
              <input
                type="number"
                className="bg-quantity-input"
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
                className="bg-quantity-btn"
                onClick={() => setCount(Math.min(10000, count + 10))}
                disabled={generating}
              >
                <i className="ti ti-plus" />
              </button>
            </div>
            <div className="bg-quick-amounts">
              {[10, 50, 100, 500, 1000].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`bg-quick-btn${count === n ? " active" : ""}`}
                  onClick={() => setCount(n)}
                  disabled={generating}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-config-section">
            <label className="bg-label">Options</label>
            <div className="bg-options">
              <label className="bg-checkbox">
                <input
                  type="checkbox"
                  checked={uniqueOnly}
                  onChange={(e) => setUniqueOnly(e.target.checked)}
                  disabled={generating}
                />
                <span className="bg-checkbox-label">
                  Generate unique strings only
                  <span className="bg-checkbox-hint">Skip duplicates</span>
                </span>
              </label>
              <label className="bg-checkbox">
                <input
                  type="checkbox"
                  checked={addIndex}
                  onChange={(e) => setAddIndex(e.target.checked)}
                  disabled={generating}
                />
                <span className="bg-checkbox-label">
                  Add numeric index prefix
                  <span className="bg-checkbox-hint">e.g., 1_abc123</span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            className="bg-generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            <i className={`ti ${generating ? "ti-loader" : "ti-rocket"}`} />
            {generating ? `Generating... ${Math.round(progress)}%` : `Generate ${count} Strings`}
          </button>
        </div>

        {generating && (
          <div className="bg-progress-bar">
            <div className="bg-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div
          className={`bg-results-container${mobileView === "results" ? " mobile-visible" : " mobile-hidden"}`}
        >
          {results.length > 0 && (
            <div className="bg-results-header">
              <div className="bg-results-info">
                <i className="ti ti-list-check" />
                <span className="bg-results-count">{results.length} strings generated</span>
                {duplicateCount > 0 && (
                  <span className="bg-duplicate-badge">
                    <i className="ti ti-copy" />
                    {duplicateCount} duplicate{duplicateCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="bg-results-actions">
                <button
                  type="button"
                  className={`bg-action-btn${copiedId === "all" ? " copied" : ""}`}
                  onClick={handleCopyAll}
                >
                  <i className={`ti ${copiedId === "all" ? "ti-check" : "ti-copy"}`} />
                  {copiedId === "all" ? "Copied" : "Copy All"}
                </button>
                <div className="bg-export-dropdown">
                  <button type="button" className="bg-action-btn">
                    <i className="ti ti-download" />
                    Export
                    <i className="ti ti-chevron-down" style={{ fontSize: "10px" }} />
                  </button>
                  <div className="bg-export-menu">
                    <button
                      type="button"
                      className="bg-export-item"
                      onClick={() => handleExport("txt")}
                    >
                      <i className="ti ti-file-text" />
                      Plain Text (.txt)
                    </button>
                    <button
                      type="button"
                      className="bg-export-item"
                      onClick={() => handleExport("csv")}
                    >
                      <i className="ti ti-file-spreadsheet" />
                      CSV (.csv)
                    </button>
                    <button
                      type="button"
                      className="bg-export-item"
                      onClick={() => handleExport("json")}
                    >
                      <i className="ti ti-file-code" />
                      JSON (.json)
                    </button>
                  </div>
                </div>
                <button type="button" className="bg-action-btn bg-clear-btn" onClick={handleClear}>
                  <i className="ti ti-trash" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className="bg-empty">
              <div className="bg-empty-icon">
                <i className="ti ti-layers-linked" />
              </div>
              <p className="bg-empty-title">Batch Generation</p>
              <p className="bg-empty-desc">
                Generate hundreds or thousands of random strings at once. Perfect for testing, data
                seeding, or bulk password generation.
              </p>
              <button className="bg-empty-cta" onClick={() => setMobileView("config")}>
                <i className="ti ti-settings" />
                Configure Batch
              </button>
            </div>
          ) : (
            <div className="bg-results-grid">
              {results.map((result) => (
                <div key={result.id} className="bg-result-item">
                  <div className="bg-result-value">{result.value}</div>
                  <button
                    type="button"
                    className={`bg-copy-icon${copiedId === result.id ? " copied" : ""}`}
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
