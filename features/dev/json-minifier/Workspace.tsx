// features/dev/json-minifier/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import type { Tool } from "@/lib/tools";
import {
  processJSON,
  type ProcessOptions,
  type ProcessMode,
  type IndentStyle,
  DEFAULT_OPTIONS,
  SAMPLE_TEMPLATES,
  formatBytes,
  convertToCSV,
  convertToYAML,
  jsonPathQuery,
} from "./jsonEngine";
import JSONAnalysis from "./JSONAnalysis";
import JSONBatch from "./JSONBatch";
import { useJSONStore } from "./jsonStore";
import "./style/JSONAnalysis.css";
import "./style/JSONBatch.css";
import "./style/Workspace.css";

type TabView = "process" | "batch" | "analysis" | "transform" | "history";

export default function JSONWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [tabView, setTabView] = useState<TabView>("process");
  const [options, setOptions] = useState<ProcessOptions>(DEFAULT_OPTIONS);
  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [error, setError] = useState("");
  const [jsonPath, setJsonPath] = useState("");
  const [pathResult, setPathResult] = useState<string>("");
  const rootRef = useRef<HTMLDivElement>(null);

  const { history, settings, addToHistory, clearHistory } = useJSONStore();

  const result = useMemo(() => {
    if (!input.trim()) {
      setError("");
      return null;
    }
    try {
      const r = processJSON(input, options);
      setError("");
      return r;
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
      return null;
    }
  }, [input, options]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const handleDownload = useCallback(
    (content: string, ext: string, mime: string) => {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${options.mode}_${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      if (settings.autoSave && result) {
        addToHistory({
          title: `${options.mode} — ${new Date().toLocaleDateString()}`,
          input,
          result,
          options,
          isFavorite: false,
          tags: [options.mode],
        });
      }
    },
    [result, input, options, settings.autoSave, addToHistory]
  );

  const runJsonPath = useCallback(() => {
    if (!input.trim() || !jsonPath.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const res = jsonPathQuery(parsed, jsonPath);
      setPathResult(JSON.stringify(res, null, 2));
    } catch {
      setPathResult("Invalid query or JSON");
    }
  }, [input, jsonPath]);

  const loadSample = useCallback((key: keyof typeof SAMPLE_TEMPLATES) => {
    setInput(SAMPLE_TEMPLATES[key].json);
    setMobilePanel("input");
    setError("");
  }, []);

  const goToOutput = useCallback(() => {
    setMobilePanel("output");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const goToInput = useCallback(() => {
    setMobilePanel("input");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const TABS = [
    {
      id: "process" as const,
      label: "Process",
      icon: "ti-braces",
      desc: "Minify or beautify JSON",
    },
    { id: "batch" as const, label: "Batch", icon: "ti-files", desc: "Process multiple files" },
    {
      id: "analysis" as const,
      label: "Analysis",
      icon: "ti-chart-bar",
      desc: "JSON analysis & issues",
    },
    {
      id: "transform" as const,
      label: "Transform",
      icon: "ti-transform",
      desc: "Convert to CSV/YAML",
    },
    { id: "history" as const, label: "History", icon: "ti-history", desc: "Past operations" },
  ];

  const modeConfig: Record<ProcessMode, { color: string; icon: string }> = {
    minify: { color: "#10b981", icon: "ti-file-zip" },
    beautify: { color: "#3b82f6", icon: "ti-text-wrap" },
    sort: { color: "#8b5cf6", icon: "ti-sort-ascending" },
    validate: { color: "#f59e0b", icon: "ti-shield-check" },
  };

  return (
    <>
      <div className="jw-root" ref={rootRef}>
        {/*  Chrome  */}
        <div className="jw-chrome">
          <div className="jw-chrome-left">
            <div className="jw-title">
              <div
                className="jw-title-icon"
                style={{
                  background: modeConfig[options.mode].color + "20",
                  color: modeConfig[options.mode].color,
                }}
              >
                <i className="ti ti-braces" />
              </div>
              JSON Tools
              <span className="jw-title-badge">{options.mode}</span>
            </div>
          </div>
          <div className="jw-chrome-right">
            {/* Mode pills */}
            <div className="jw-mode-pills">
              {(["minify", "beautify", "sort", "validate"] as ProcessMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`jw-mode-pill ${options.mode === m ? "active" : ""}`}
                  style={
                    options.mode === m
                      ? {
                        background: modeConfig[m].color + "20",
                        color: modeConfig[m].color,
                        borderColor: modeConfig[m].color + "40",
                      }
                      : {}
                  }
                  onClick={() => setOptions((p) => ({ ...p, mode: m }))}
                >
                  <i className={`ti ${modeConfig[m].icon}`} />
                  <span className="jw-mode-label">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`jw-settings-btn ${showSettings ? "active" : ""}`}
              onClick={() => setShowSettings((s) => !s)}
            >
              <i className="ti ti-settings" />
              <span>Options</span>
            </button>
          </div>
        </div>

        {/*  Settings  */}
        {showSettings && (
          <div className="jw-settings">
            <div className="jw-settings-grid">
              {(options.mode === "beautify" ||
                options.mode === "sort" ||
                options.mode === "validate") && (
                  <div className="jw-setting-group">
                    <label className="jw-setting-label">Indent Style</label>
                    <select
                      className="jw-select"
                      value={options.indentStyle}
                      onChange={(e) =>
                        setOptions((p) => ({ ...p, indentStyle: e.target.value as IndentStyle }))
                      }
                    >
                      <option value="2-spaces">2 Spaces</option>
                      <option value="4-spaces">4 Spaces</option>
                      <option value="tabs">Tabs</option>
                    </select>
                  </div>
                )}

              <div className="jw-setting-group">
                <label className="jw-setting-label">Sort Order</label>
                <select
                  className="jw-select"
                  value={options.sortOrder}
                  onChange={(e) =>
                    setOptions((p) => ({ ...p, sortOrder: e.target.value as "asc" | "desc" }))
                  }
                >
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </select>
              </div>

              {[
                { key: "sortKeys", label: "Sort Keys" },
                { key: "removeNulls", label: "Remove Nulls" },
                { key: "removeEmptyStrings", label: "Remove Empty Strings" },
                { key: "removeEmptyArrays", label: "Remove Empty Arrays" },
                { key: "removeEmptyObjects", label: "Remove Empty Objects" },
                { key: "escapedUnicode", label: "Escape Unicode" },
              ].map(({ key, label }) => (
                <label key={key} className="jw-toggle">
                  <input
                    type="checkbox"
                    checked={options[key as keyof ProcessOptions] as boolean}
                    onChange={(e) => setOptions((p) => ({ ...p, [key]: e.target.checked }))}
                  />
                  <div className="jw-toggle-track">
                    <div className="jw-toggle-thumb" />
                  </div>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/*  Tabs  */}
        <div className="jw-tabs-bar">
          <nav className="jw-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`jw-tab ${tabView === tab.id ? "active" : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.desc}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className="jw-tab-badge">{history.length}</span>
                )}
                {tab.id === "analysis" && result && result.issues.length > 0 && (
                  <span className="jw-tab-dot" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Content  */}
        <div className="jw-content">
          {/*  Process Tab  */}
          {tabView === "process" && (
            <div className="jw-process-view">
              {/* Toolbar */}
              <div className="jw-toolbar">
                <div className="jw-toolbar-left">
                  <span className="jw-toolbar-label">Samples:</span>
                  {Object.entries(SAMPLE_TEMPLATES).map(([key, s]) => (
                    <button
                      key={key}
                      type="button"
                      className="jw-sample-btn"
                      onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                      title={s.description}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <div className="jw-toolbar-right">
                  {result && (
                    <div className="jw-export-chips">
                      <span className="jw-export-label">Export:</span>
                      <button
                        type="button"
                        className="jw-export-chip"
                        onClick={() => handleDownload(result.output, "json", "application/json")}
                      >
                        JSON
                      </button>
                      <button
                        type="button"
                        className="jw-export-chip"
                        onClick={() => {
                          try {
                            const csv = convertToCSV(JSON.parse(input));
                            handleDownload(csv, "csv", "text/csv");
                          } catch { }
                        }}
                      >
                        CSV
                      </button>
                      <button
                        type="button"
                        className="jw-export-chip"
                        onClick={() => {
                          try {
                            const yaml = convertToYAML(JSON.parse(input));
                            handleDownload(yaml, "yaml", "text/yaml");
                          } catch { }
                        }}
                      >
                        YAML
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile switcher */}
              <div className="jw-mobile-switcher">
                <button
                  type="button"
                  className={`jw-sw-tab ${mobilePanel === "input" ? "active" : ""}`}
                  onClick={goToInput}
                >
                  <i className="ti ti-braces" />
                  Input JSON
                </button>
                <div className="jw-sw-divider" />
                <button
                  type="button"
                  className={`jw-sw-tab ${mobilePanel === "output" ? "active" : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-sparkles" />
                  Result
                  {result && mobilePanel !== "output" && <span className="jw-sw-dot" />}
                </button>
              </div>

              {/* Body */}
              <div className="jw-body">
                {/* Input */}
                <div
                  className={`jw-panel ${mobilePanel === "input" ? "mob-visible" : "mob-hidden"}`}
                >
                  <div className="jw-panel-bar">
                    <div className="jw-panel-label">
                      <i className="ti ti-braces" />
                      Input JSON
                    </div>
                    <div className="jw-panel-actions">
                      {input && (
                        <>
                          <span className="jw-char-count">{input.length.toLocaleString()} ch</span>
                          {error ? (
                            <span className="jw-error-badge">
                              <i className="ti ti-alert-circle" /> Invalid
                            </span>
                          ) : (
                            result && (
                              <span className="jw-valid-badge">
                                <i className="ti ti-check" /> Valid
                              </span>
                            )
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        className="jw-icon-btn"
                        onClick={() => {
                          setInput("");
                          setError("");
                        }}
                        disabled={!input}
                        title="Clear"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className={`jw-textarea ${error ? "jw-textarea--error" : ""}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JSON here…"
                    spellCheck={false}
                  />
                  {error && (
                    <div className="jw-error-banner">
                      <i className="ti ti-alert-triangle" />
                      <span>{error}</span>
                    </div>
                  )}
                  {input && result && (
                    <div className="jw-mob-cta">
                      <button type="button" className="jw-cta-btn" onClick={goToOutput}>
                        <i className="ti ti-sparkles" />
                        View{" "}
                        {options.mode === "minify"
                          ? "Minified"
                          : options.mode === "beautify"
                            ? "Beautified"
                            : options.mode === "sort"
                              ? "Sorted"
                              : "Validated"}{" "}
                        JSON
                        <i className="ti ti-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gutter */}
                <div className="jw-gutter">
                  <div className="jw-gutter-line" />
                  <div className="jw-gutter-node">
                    <i
                      className={`ti ${modeConfig[options.mode].icon}`}
                      style={{ color: modeConfig[options.mode].color }}
                    />
                  </div>
                  <div className="jw-gutter-line" />
                </div>

                {/* Output */}
                <div
                  className={`jw-panel ${mobilePanel === "output" ? "mob-visible" : "mob-hidden"}`}
                >
                  <div className="jw-panel-bar">
                    <div className="jw-panel-label">
                      <i className={`ti ${modeConfig[options.mode].icon}`} />
                      {options.mode === "minify"
                        ? "Minified"
                        : options.mode === "beautify"
                          ? "Beautified"
                          : options.mode === "sort"
                            ? "Sorted"
                            : "Validated"}{" "}
                      JSON
                    </div>
                    <div className="jw-panel-actions">
                      {result && (
                        <button
                          type="button"
                          className={`jw-copy-btn ${copiedKey === "out" ? "copied" : ""}`}
                          onClick={() => handleCopy(result.output, "out")}
                        >
                          <i className={`ti ${copiedKey === "out" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "out" ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>

                  {!result && !error && (
                    <div className="jw-empty">
                      <div className="jw-empty-icon">
                        <i className="ti ti-braces" />
                      </div>
                      <h3 className="jw-empty-title">JSON Tools</h3>
                      <p className="jw-empty-desc">
                        Paste JSON on the left, load a sample, or drop a file to get started
                      </p>
                      <div className="jw-empty-samples">
                        {Object.entries(SAMPLE_TEMPLATES)
                          .slice(0, 2)
                          .map(([key, s]) => (
                            <button
                              key={key}
                              type="button"
                              className="jw-empty-sample-btn"
                              onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                            >
                              Try {s.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {!result && error && (
                    <div className="jw-empty">
                      <div className="jw-empty-icon jw-empty-icon--error">
                        <i className="ti ti-alert-triangle" />
                      </div>
                      <h3 className="jw-empty-title">Invalid JSON</h3>
                      <p className="jw-empty-desc">{error}</p>
                    </div>
                  )}

                  {result && (
                    <>
                      <pre className="jw-output">{result.output}</pre>

                      <div className="jw-stats-bar">
                        <div className="jw-stat">
                          <i className="ti ti-file" />
                          <span className="jw-stat-label">Original</span>
                          <span className="jw-stat-value">
                            {formatBytes(result.stats.original)}
                          </span>
                        </div>
                        <div className="jw-stat">
                          <i className="ti ti-sparkles" />
                          <span className="jw-stat-label">Result</span>
                          <span className="jw-stat-value">
                            {formatBytes(result.stats.processed)}
                          </span>
                        </div>
                        {result.stats.savings !== 0 && (
                          <div
                            className={`jw-stat jw-stat--highlight ${result.stats.savings > 0 ? "good" : "warn"}`}
                          >
                            <i
                              className={`ti ${result.stats.savings > 0 ? "ti-trending-down" : "ti-trending-up"}`}
                            />
                            <span className="jw-stat-label">
                              {result.stats.savings > 0 ? "Saved" : "Added"}
                            </span>
                            <span
                              className={`jw-stat-value ${result.stats.savings > 0 ? "good" : "warn"}`}
                            >
                              {formatBytes(Math.abs(result.stats.savings))} (
                              {Math.abs(result.stats.savingsPercent)}%)
                            </span>
                          </div>
                        )}
                        <div className="jw-stat">
                          <i className="ti ti-key" />
                          <span className="jw-stat-label">Keys</span>
                          <span className="jw-stat-value">{result.stats.keys}</span>
                        </div>
                        <div className="jw-stat">
                          <i className="ti ti-layers" />
                          <span className="jw-stat-label">Depth</span>
                          <span className="jw-stat-value">{result.stats.depth}</span>
                        </div>
                        <button
                          type="button"
                          className="jw-download-btn"
                          onClick={() => handleDownload(result.output, "json", "application/json")}
                        >
                          <i className="ti ti-download" />
                          Download .json
                        </button>
                      </div>

                      {/* Mobile actions */}
                      <div className="jw-mob-actions">
                        <button
                          type="button"
                          className={`jw-mob-btn ${copiedKey === "mob" ? "copied" : ""}`}
                          onClick={() => handleCopy(result.output, "mob")}
                        >
                          <i className={`ti ${copiedKey === "mob" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "mob" ? "Copied!" : "Copy"}
                        </button>
                        <button
                          type="button"
                          className="jw-mob-btn"
                          onClick={() => handleDownload(result.output, "json", "application/json")}
                        >
                          <i className="ti ti-download" />
                          Download
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/*  Batch Tab  */}
          {tabView === "batch" && <JSONBatch options={options} />}

          {/*  Analysis Tab  */}
          {tabView === "analysis" &&
            (result ? (
              <JSONAnalysis
                analysis={result.analysis}
                issues={result.issues}
                stats={result.stats}
              />
            ) : (
              <div className="jw-tab-empty">
                <div className="jw-tab-empty-icon">
                  <i className="ti ti-chart-bar" />
                </div>
                <h3>JSON Analysis</h3>
                <p>
                  Add valid JSON to see structure analysis, type distribution, schema inference, and
                  issue detection.
                </p>
                <button
                  type="button"
                  className="jw-tab-empty-btn"
                  onClick={() => setTabView("process")}
                >
                  Go to Processor
                </button>
              </div>
            ))}

          {/*  Transform Tab  */}
          {tabView === "transform" && (
            <div className="jw-transform-view">
              <div className="jw-transform-header">
                <div className="jw-transform-title">
                  <i className="ti ti-transform" />
                  Transform & Query
                </div>
              </div>

              {/* JSONPath Query */}
              <div className="jw-transform-section">
                <div className="jw-transform-section-title">
                  <i className="ti ti-search" />
                  JSONPath Query
                </div>
                <div className="jw-jsonpath-row">
                  <input
                    type="text"
                    className="jw-jsonpath-input"
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                    placeholder="e.g. $.data.users[0].name"
                    spellCheck={false}
                    onKeyDown={(e) => e.key === "Enter" && runJsonPath()}
                  />
                  <button
                    type="button"
                    className="jw-jsonpath-btn"
                    onClick={runJsonPath}
                    disabled={!input.trim() || !jsonPath.trim()}
                  >
                    <i className="ti ti-player-play" />
                    Run
                  </button>
                </div>
                {pathResult && (
                  <div className="jw-jsonpath-result">
                    <div className="jw-jsonpath-result-header">
                      <span>Result</span>
                      <button
                        type="button"
                        className={`jw-copy-btn ${copiedKey === "path" ? "copied" : ""}`}
                        onClick={() => handleCopy(pathResult, "path")}
                      >
                        <i className={`ti ${copiedKey === "path" ? "ti-check" : "ti-copy"}`} />
                        {copiedKey === "path" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className="jw-jsonpath-pre">{pathResult}</pre>
                  </div>
                )}
              </div>

              {/* Convert */}
              <div className="jw-transform-section">
                <div className="jw-transform-section-title">
                  <i className="ti ti-arrows-exchange" />
                  Convert Format
                </div>
                <div className="jw-convert-grid">
                  <button
                    type="button"
                    className="jw-convert-card"
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      try {
                        const csv = convertToCSV(JSON.parse(input));
                        handleDownload(csv, "csv", "text/csv");
                      } catch { }
                    }}
                  >
                    <div
                      className="jw-convert-card-icon"
                      style={{ background: "#eff6ff", color: "#2563eb" }}
                    >
                      <i className="ti ti-table" />
                    </div>
                    <div className="jw-convert-card-label">CSV</div>
                    <div className="jw-convert-card-desc">Export as comma-separated values</div>
                    <div className="jw-convert-card-action">
                      <i className="ti ti-download" />
                      Download CSV
                    </div>
                  </button>

                  <button
                    type="button"
                    className="jw-convert-card"
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      try {
                        const yaml = convertToYAML(JSON.parse(input));
                        handleDownload(yaml, "yaml", "text/yaml");
                      } catch { }
                    }}
                  >
                    <div
                      className="jw-convert-card-icon"
                      style={{ background: "#faf5ff", color: "#7c3aed" }}
                    >
                      <i className="ti ti-file-code" />
                    </div>
                    <div className="jw-convert-card-label">YAML</div>
                    <div className="jw-convert-card-desc">Convert to human-readable YAML</div>
                    <div className="jw-convert-card-action">
                      <i className="ti ti-download" />
                      Download YAML
                    </div>
                  </button>

                  <button
                    type="button"
                    className="jw-convert-card"
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      handleCopy(result.output, "json-copy");
                    }}
                  >
                    <div
                      className="jw-convert-card-icon"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}
                    >
                      <i className="ti ti-copy" />
                    </div>
                    <div className="jw-convert-card-label">Copy JSON</div>
                    <div className="jw-convert-card-desc">Copy processed JSON to clipboard</div>
                    <div className="jw-convert-card-action">
                      <i className={`ti ${copiedKey === "json-copy" ? "ti-check" : "ti-copy"}`} />
                      {copiedKey === "json-copy" ? "Copied!" : "Copy"}
                    </div>
                  </button>

                  <button
                    type="button"
                    className="jw-convert-card"
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      const ts = `const data = ${result.output} as const;\nexport type Data = typeof data;\nexport default data;`;
                      handleDownload(ts, "ts", "text/typescript");
                    }}
                  >
                    <div
                      className="jw-convert-card-icon"
                      style={{ background: "#eff6ff", color: "#0284c7" }}
                    >
                      <i className="ti ti-brand-typescript" />
                    </div>
                    <div className="jw-convert-card-label">TypeScript</div>
                    <div className="jw-convert-card-desc">Export as typed TypeScript const</div>
                    <div className="jw-convert-card-action">
                      <i className="ti ti-download" />
                      Download .ts
                    </div>
                  </button>
                </div>
              </div>

              {!result && (
                <div className="jw-transform-empty">
                  <i className="ti ti-transform" />
                  <p>Add valid JSON in the Process tab to enable transformations.</p>
                  <button
                    type="button"
                    className="jw-tab-empty-btn"
                    onClick={() => setTabView("process")}
                  >
                    Go to Processor
                  </button>
                </div>
              )}
            </div>
          )}

          {/*  History Tab  */}
          {tabView === "history" && (
            <div className="jw-history">
              {history.length === 0 ? (
                <div className="jw-tab-empty">
                  <div className="jw-tab-empty-icon">
                    <i className="ti ti-history" />
                  </div>
                  <h3>No History Yet</h3>
                  <p>Your processing history will appear here after you download a result.</p>
                </div>
              ) : (
                <>
                  <div className="jw-history-header">
                    <div className="jw-history-title">
                      <i className="ti ti-history" />
                      History
                      <span className="jw-history-count">{history.length}</span>
                    </div>
                    <button type="button" className="jw-ghost-btn" onClick={clearHistory}>
                      <i className="ti ti-trash" />
                      Clear
                    </button>
                  </div>
                  <div className="jw-history-list">
                    {history.map((entry) => (
                      <div key={entry.id} className="jw-history-item">
                        <div className="jw-history-item-left">
                          <div
                            className="jw-history-item-icon"
                            style={{
                              background: modeConfig[entry.options.mode]?.color + "20",
                              color: modeConfig[entry.options.mode]?.color,
                            }}
                          >
                            <i className="ti ti-braces" />
                          </div>
                          <div>
                            <div className="jw-history-item-title">{entry.title}</div>
                            <div className="jw-history-item-meta">
                              {new Date(entry.timestamp).toLocaleString()} ·{" "}
                              {formatBytes(entry.result.stats.original)} →{" "}
                              {formatBytes(entry.result.stats.processed)}
                            </div>
                          </div>
                        </div>
                        <div className="jw-history-item-right">
                          <span className="jw-history-mode">{entry.options.mode}</span>
                          {entry.result.stats.savingsPercent !== 0 && (
                            <span
                              className={`jw-history-savings ${entry.result.stats.savings > 0 ? "good" : "warn"}`}
                            >
                              {entry.result.stats.savings > 0 ? "-" : "+"}
                              {Math.abs(entry.result.stats.savingsPercent)}%
                            </span>
                          )}
                          <button
                            type="button"
                            className="jw-icon-btn"
                            onClick={() => {
                              setInput(entry.input);
                              setTabView("process");
                            }}
                            title="Restore"
                          >
                            <i className="ti ti-restore" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/*  Footer  */}
        <div className="jw-footer">
          <div className="jw-footer-left">
            <i className="ti ti-shield-lock" />
            <span>Runs entirely in your browser — nothing is sent to any server.</span>
          </div>
          {result && (
            <div className="jw-footer-right">
              <span>{result.stats.keys} keys</span>
              <span>·</span>
              <span>depth {result.stats.depth}</span>
              <span>·</span>
              <span className={result.analysis.isValid ? "jw-valid" : "jw-invalid"}>
                <i className={`ti ${result.analysis.isValid ? "ti-check" : "ti-x"}`} />
                {result.analysis.isValid ? "Valid" : "Invalid"}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
