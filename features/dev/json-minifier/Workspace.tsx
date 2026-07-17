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
                {tab.id === "history" && history.length > 0 && (
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
                          } catch {}
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
                          } catch {}
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
                      } catch {}
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
                      } catch {}
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

      <style jsx>{`
        .jw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          overflow: hidden;
        }

        /* Chrome */
        .jw-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .jw-chrome-left,
        .jw-chrome-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .jw-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .jw-title-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          transition: all 0.2s;
        }

        .jw-title-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 99px;
          background: var(--bg-card);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .jw-mode-pills {
          display: flex;
          gap: 3px;
          padding: 3px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 9px;
        }

        .jw-mode-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 9px;
          border: 0.5px solid transparent;
          border-radius: 6px;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .jw-mode-pill i {
          font-size: 12px;
        }
        .jw-mode-pill:hover {
          color: var(--text);
          background: var(--bg-surface);
        }

        .jw-settings-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jw-settings-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }
        .jw-settings-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }
        .jw-settings-btn i {
          font-size: 13px;
        }

        /* Settings */
        .jw-settings {
          padding: 14px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-settings-grid {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 24px;
        }

        .jw-setting-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .jw-setting-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jw-select {
          height: 30px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
        }

        /* Toggle */
        .jw-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .jw-toggle input {
          display: none;
        }

        .jw-toggle-track {
          width: 34px;
          height: 18px;
          border-radius: 99px;
          background: var(--border);
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .jw-toggle input:checked ~ .jw-toggle-track {
          background: var(--brand);
        }

        .jw-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .jw-toggle input:checked ~ .jw-toggle-track .jw-toggle-thumb {
          transform: translateX(16px);
        }
        .jw-toggle span {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /* Tabs */
        .jw-tabs-bar {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-tabs {
          display: flex;
          padding: 0 14px;
          overflow-x: auto;
        }

        .jw-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 40px;
          padding: 0 14px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .jw-tab i {
          font-size: 14px;
        }
        .jw-tab:hover {
          color: var(--text-secondary);
        }
        .jw-tab.active {
          color: var(--text);
        }

        .jw-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 10px;
          right: 10px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .jw-tab-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .jw-tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
        }

        /* Content */
        .jw-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Process View */
        .jw-process-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /* Toolbar */
        .jw-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .jw-toolbar-left,
        .jw-toolbar-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .jw-toolbar-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-disabled);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jw-sample-btn {
          height: 26px;
          padding: 0 9px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .jw-sample-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .jw-export-chips {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .jw-export-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-disabled);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jw-export-chip {
          height: 24px;
          padding: 0 8px;
          border: 0.5px solid var(--border);
          border-radius: 99px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.12s;
          font-family: var(--font-mono);
        }

        .jw-export-chip:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /* Mobile switcher */
        .jw-mobile-switcher {
          display: none;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-sw-tab {
          flex: 1;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
        }

        .jw-sw-tab.active {
          color: var(--text);
        }

        .jw-sw-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
        }

        .jw-sw-divider {
          width: 0.5px;
          background: var(--border);
          align-self: stretch;
          margin: 10px 0;
        }

        .jw-sw-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        /* Body */
        .jw-body {
          display: grid;
          grid-template-columns: 1fr 40px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .jw-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .jw-panel-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 38px;
          padding: 0 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 8px;
          flex-shrink: 0;
        }

        .jw-panel-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .jw-panel-label i {
          font-size: 12px;
        }

        .jw-panel-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .jw-char-count {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-disabled);
        }

        .jw-error-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 600;
          color: #dc2626;
          background: #fef2f2;
          padding: 2px 7px;
          border-radius: 99px;
        }

        @media (prefers-color-scheme: dark) {
          .jw-error-badge {
            background: #1f1517;
            color: #f87171;
          }
        }

        .jw-valid-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 600;
          color: #16a34a;
          background: #dcfce7;
          padding: 2px 7px;
          border-radius: 99px;
        }

        @media (prefers-color-scheme: dark) {
          .jw-valid-badge {
            background: #022c22;
            color: #4ade80;
          }
        }

        .jw-icon-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 0.5px solid transparent;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jw-icon-btn:hover:not(:disabled) {
          background: var(--bg-card);
          border-color: var(--border);
          color: var(--text);
        }

        .jw-icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .jw-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 9px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jw-copy-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }
        .jw-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }
        .jw-copy-btn i {
          font-size: 11px;
        }

        .jw-textarea {
          flex: 1;
          padding: 14px 16px;
          border: none;
          border-left: 2px solid transparent;
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-mono);
          line-height: 1.7;
          resize: none;
          outline: none;
          min-height: 0;
          transition: border-color 0.15s;
        }

        .jw-textarea--error {
          border-left-color: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .jw-textarea--error {
            border-left-color: #f87171;
          }
        }

        .jw-textarea::placeholder {
          color: var(--text-disabled);
        }

        .jw-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 12px;
          border-top: 0.5px solid #fecaca;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .jw-error-banner {
            background: #1f1517;
            color: #f87171;
            border-color: #3c1518;
          }
        }

        .jw-error-banner i {
          font-size: 14px;
          flex-shrink: 0;
        }

        .jw-mob-cta {
          display: none;
          padding: 12px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-cta-btn {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: none;
          border-radius: 10px;
          background: var(--brand);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.12s;
        }

        .jw-cta-btn:hover {
          background: var(--brand-hover);
        }
        .jw-cta-btn i {
          font-size: 15px;
        }
        .jw-cta-btn i:last-child {
          margin-left: auto;
          opacity: 0.7;
        }

        /* Gutter */
        .jw-gutter {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-surface);
          border-left: 0.5px solid var(--border);
          border-right: 0.5px solid var(--border);
        }

        .jw-gutter-line {
          flex: 1;
          width: 0.5px;
          background: var(--border);
        }

        .jw-gutter-node {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        /* Output */
        .jw-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 40px 24px;
          text-align: center;
          background: var(--bg-card);
        }

        .jw-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--text-disabled);
        }

        .jw-empty-icon--error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .jw-empty-icon--error {
            background: #1f1517;
            border-color: #3c1518;
            color: #f87171;
          }
        }

        .jw-empty-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }
        .jw-empty-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 300px;
          line-height: 1.6;
        }

        .jw-empty-samples {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .jw-empty-sample-btn {
          height: 32px;
          padding: 0 14px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jw-empty-sample-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .jw-output {
          flex: 1;
          margin: 0;
          padding: 14px 16px;
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-mono);
          line-height: 1.7;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-all;
          min-height: 0;
        }

        /* Stats bar */
        .jw-stats-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          flex-shrink: 0;
          overflow-x: auto;
        }

        .jw-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .jw-stat i {
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .jw-stat-label {
          color: var(--text-tertiary);
          font-weight: 500;
        }
        .jw-stat-value {
          color: var(--text);
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .jw-stat-value.good {
          color: #16a34a;
        }
        .jw-stat-value.warn {
          color: #d97706;
        }

        @media (prefers-color-scheme: dark) {
          .jw-stat-value.good {
            color: #4ade80;
          }
          .jw-stat-value.warn {
            color: #fbbf24;
          }
        }

        .jw-stat--highlight {
          padding: 3px 8px;
          border-radius: 6px;
        }

        .jw-stat--highlight.good {
          background: #dcfce7;
        }
        .jw-stat--highlight.warn {
          background: #fef3c7;
        }

        @media (prefers-color-scheme: dark) {
          .jw-stat--highlight.good {
            background: #022c22;
          }
          .jw-stat--highlight.warn {
            background: #451a03;
          }
        }

        .jw-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--brand);
          color: white;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.12s;
          margin-left: auto;
          flex-shrink: 0;
        }

        .jw-download-btn:hover {
          background: var(--brand-hover);
        }
        .jw-download-btn i {
          font-size: 12px;
        }

        .jw-mob-actions {
          display: none;
          gap: 8px;
          padding: 12px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-mob-btn {
          flex: 1;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0.5px solid var(--border);
          border-radius: 10px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jw-mob-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }
        .jw-mob-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }
        .jw-mob-btn i {
          font-size: 15px;
        }

        /* Tab Empty */
        .jw-tab-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 60px 24px;
          text-align: center;
          background: var(--bg-surface);
        }

        .jw-tab-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: var(--text-disabled);
        }

        .jw-tab-empty h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }
        .jw-tab-empty p {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 380px;
          line-height: 1.6;
        }

        .jw-tab-empty-btn {
          height: 40px;
          padding: 0 20px;
          border: 0.5px solid var(--border);
          border-radius: 10px;
          background: var(--brand);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.12s;
        }

        .jw-tab-empty-btn:hover {
          background: var(--brand-hover);
        }

        /* Transform View */
        .jw-transform-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: auto;
          background: var(--bg-surface);
          min-height: 0;
        }

        .jw-transform-header {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-transform-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .jw-transform-title i {
          font-size: 15px;
          color: var(--text-secondary);
        }

        .jw-transform-section {
          padding: 16px;
          border-bottom: 0.5px solid var(--border);
        }

        .jw-transform-section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }

        .jw-transform-section-title i {
          font-size: 13px;
        }

        /* JSONPath */
        .jw-jsonpath-row {
          display: flex;
          gap: 8px;
        }

        .jw-jsonpath-input {
          flex: 1;
          height: 38px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-mono);
          outline: none;
          transition: border-color 0.12s;
        }

        .jw-jsonpath-input:focus {
          border-color: var(--brand);
        }
        .jw-jsonpath-input::placeholder {
          color: var(--text-disabled);
        }

        .jw-jsonpath-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 14px;
          border: 0.5px solid var(--brand);
          border-radius: 8px;
          background: var(--brand);
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.12s;
          flex-shrink: 0;
        }

        .jw-jsonpath-btn:hover:not(:disabled) {
          background: var(--brand-hover);
        }
        .jw-jsonpath-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .jw-jsonpath-btn i {
          font-size: 13px;
        }

        .jw-jsonpath-result {
          margin-top: 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .jw-jsonpath-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .jw-jsonpath-pre {
          margin: 0;
          padding: 12px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text);
          overflow: auto;
          max-height: 200px;
          white-space: pre-wrap;
          word-break: break-all;
        }

        /* Convert Grid */
        .jw-convert-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .jw-convert-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.12s;
          text-align: left;
        }

        .jw-convert-card:hover:not(:disabled) {
          border-color: var(--brand-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .jw-convert-card:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .jw-convert-card-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .jw-convert-card-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .jw-convert-card-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }

        .jw-convert-card-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--brand);
          margin-top: 4px;
        }

        .jw-convert-card-action i {
          font-size: 12px;
        }

        .jw-transform-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 40px 24px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 14px;
        }

        .jw-transform-empty i {
          font-size: 40px;
          color: var(--text-disabled);
        }

        .jw-transform-empty p {
          margin: 0;
          max-width: 320px;
          line-height: 1.6;
        }

        /* History */
        .jw-history {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
          background: var(--bg-surface);
        }

        .jw-history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-history-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .jw-history-title i {
          font-size: 15px;
          color: var(--text-secondary);
        }

        .jw-history-count {
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .jw-ghost-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jw-ghost-btn:hover {
          background: var(--bg-card);
          color: var(--text);
        }
        .jw-ghost-btn i {
          font-size: 13px;
        }

        .jw-history-list {
          flex: 1;
          overflow: auto;
          padding: 8px;
          min-height: 0;
        }

        .jw-history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          margin-bottom: 6px;
          transition: all 0.12s;
        }

        .jw-history-item:hover {
          border-color: var(--brand-border);
        }

        .jw-history-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .jw-history-item-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .jw-history-item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 2px;
        }

        .jw-history-item-meta {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .jw-history-item-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .jw-history-mode {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 99px;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .jw-history-savings {
          font-size: 12px;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .jw-history-savings.good {
          color: #16a34a;
        }
        .jw-history-savings.warn {
          color: #d97706;
        }

        @media (prefers-color-scheme: dark) {
          .jw-history-savings.good {
            color: #4ade80;
          }
          .jw-history-savings.warn {
            color: #fbbf24;
          }
        }

        /* Footer */
        .jw-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 16px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          font-size: 11px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .jw-footer-left {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-tertiary);
        }
        .jw-footer-left i {
          font-size: 13px;
          color: var(--brand);
        }

        .jw-footer-right {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          flex-wrap: wrap;
        }

        .jw-valid {
          color: #16a34a;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .jw-invalid {
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        @media (prefers-color-scheme: dark) {
          .jw-valid {
            color: #4ade80;
          }
          .jw-invalid {
            color: #f87171;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .jw-root {
            border-radius: 0;
            border-left: none;
            border-right: none;
            min-height: 100dvh;
          }

          .jw-chrome {
            gap: 8px;
          }
          .jw-settings-btn span {
            display: none;
          }

          .jw-mode-pills {
            gap: 2px;
          }
          .jw-mode-pill {
            padding: 0 6px;
          }
          .jw-mode-label {
            display: none;
          }

          .jw-settings-grid {
            flex-direction: column;
            gap: 10px;
          }

          .jw-tabs {
            padding: 0 8px;
          }
          .jw-tab span {
            display: none;
          }
          .jw-tab {
            padding: 0 10px;
          }

          .jw-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .jw-toolbar-left {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .jw-mobile-switcher {
            display: flex;
          }

          .jw-body {
            grid-template-columns: 1fr;
            position: relative;
            overflow: hidden;
          }

          .jw-gutter {
            display: none;
          }

          .jw-panel {
            grid-column: 1;
            grid-row: 1;
            position: absolute;
            inset: 0;
          }

          .jw-panel.mob-visible {
            z-index: 1;
            visibility: visible;
          }
          .jw-panel.mob-hidden {
            z-index: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .jw-mob-cta {
            display: block;
          }
          .jw-mob-actions {
            display: flex;
          }
          .jw-download-btn {
            display: none;
          }

          .jw-stats-bar {
            flex-wrap: wrap;
            gap: 8px;
          }

          .jw-convert-grid {
            grid-template-columns: 1fr 1fr;
          }

          .jw-footer {
            flex-direction: column;
            text-align: center;
            gap: 6px;
          }
          .jw-footer-right {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .jw-convert-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jw-mode-pill,
          .jw-settings-btn,
          .jw-tab,
          .jw-sample-btn,
          .jw-sw-tab,
          .jw-icon-btn,
          .jw-copy-btn,
          .jw-cta-btn,
          .jw-mob-btn,
          .jw-download-btn,
          .jw-history-item,
          .jw-convert-card,
          .jw-toggle-track,
          .jw-toggle-thumb,
          .jw-title-icon,
          .jw-textarea {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
