// features/dev/js-minifier/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import type { Tool } from "@/lib/tools";
import {
  processJS,
  type MinifyOptions,
  type MinifyMode,
  DEFAULT_OPTIONS,
  SAMPLE_TEMPLATES,
  formatBytes,
  estimateGzipSize,
} from "./jsEngine";
import JSAnalysis from "./JSAnalysis";
import JSBatch from "./JSBatch";
import { useJSStore } from "./jsStore";
import "./style/JSAnalysis.css";
import "./style/JSBatch.css";
import "./style/Workspace.css";

type TabView = "minify" | "batch" | "analysis" | "history";

export default function JSMinifierWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [tabView, setTabView] = useState<TabView>("minify");
  const [options, setOptions] = useState<MinifyOptions>(DEFAULT_OPTIONS);
  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const rootRef = useRef<HTMLDivElement>(null);

  const { history, settings, addToHistory, clearHistory } = useJSStore();

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return processJS(input, options);
    } catch {
      return null;
    }
  }, [input, options]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.output], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minified_${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);

    if (settings.autoSave) {
      addToHistory({
        title: `${options.mode} — ${new Date().toLocaleDateString()}`,
        input,
        result,
        options,
        isFavorite: false,
        tags: [options.mode],
      });
    }
  }, [result, input, options, settings.autoSave, addToHistory]);

  const loadSample = useCallback((key: keyof typeof SAMPLE_TEMPLATES) => {
    setInput(SAMPLE_TEMPLATES[key].code);
    setMobilePanel("input");
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
    { id: "minify" as const, label: "Minify", icon: "ti-file-zip", desc: "Minify JS code" },
    { id: "batch" as const, label: "Batch", icon: "ti-files", desc: "Process multiple files" },
    {
      id: "analysis" as const,
      label: "Analysis",
      icon: "ti-chart-bar",
      desc: "Code analysis & lint",
    },
    { id: "history" as const, label: "History", icon: "ti-history", desc: "Past minifications" },
  ];

  const modeColor: Record<MinifyMode, string> = {
    minify: "#f59e0b",
    compress: "#3b82f6",
    mangle: "#8b5cf6",
  };

  return (
    <>
      <div className="jw-root" ref={rootRef}>
        {/*  Chrome  */}
        <div className="jw-chrome">
          <div className="jw-chrome-left">
            <div className="jw-title">
              <div className="jw-title-icon">
                <i className="ti ti-brand-javascript" />
              </div>
              JS Minifier
              <span className="jw-title-badge">{options.mode}</span>
            </div>
          </div>
          <div className="jw-chrome-right">
            {/* Mode quick-switcher */}
            <div className="jw-mode-pills">
              {(["minify", "compress", "mangle"] as MinifyMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`jw-mode-pill ${options.mode === m ? "active" : ""}`}
                  style={
                    options.mode === m
                      ? {
                        background: modeColor[m] + "20",
                        color: modeColor[m],
                        borderColor: modeColor[m] + "40",
                      }
                      : {}
                  }
                  onClick={() => setOptions((p) => ({ ...p, mode: m }))}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
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

        {/*  Settings Panel  */}
        {showSettings && (
          <div className="jw-settings">
            <div className="jw-settings-grid">
              <label className="jw-toggle">
                <input
                  type="checkbox"
                  checked={options.removeComments}
                  onChange={(e) => setOptions((p) => ({ ...p, removeComments: e.target.checked }))}
                />
                <div className="jw-toggle-track">
                  <div className="jw-toggle-thumb" />
                </div>
                <span>Remove Comments</span>
              </label>

              <label className="jw-toggle">
                <input
                  type="checkbox"
                  checked={options.removeConsole}
                  onChange={(e) => setOptions((p) => ({ ...p, removeConsole: e.target.checked }))}
                />
                <div className="jw-toggle-track">
                  <div className="jw-toggle-thumb" />
                </div>
                <span>Remove console.*</span>
              </label>

              <label className="jw-toggle">
                <input
                  type="checkbox"
                  checked={options.removeDebugger}
                  onChange={(e) => setOptions((p) => ({ ...p, removeDebugger: e.target.checked }))}
                />
                <div className="jw-toggle-track">
                  <div className="jw-toggle-thumb" />
                </div>
                <span>Remove debugger</span>
              </label>

              <label className="jw-toggle">
                <input
                  type="checkbox"
                  checked={options.collapseWhitespace}
                  onChange={(e) =>
                    setOptions((p) => ({ ...p, collapseWhitespace: e.target.checked }))
                  }
                />
                <div className="jw-toggle-track">
                  <div className="jw-toggle-thumb" />
                </div>
                <span>Collapse Whitespace</span>
              </label>

              <label className="jw-toggle">
                <input
                  type="checkbox"
                  checked={options.mangle}
                  onChange={(e) => setOptions((p) => ({ ...p, mangle: e.target.checked }))}
                />
                <div className="jw-toggle-track">
                  <div className="jw-toggle-thumb" />
                </div>
                <span>Mangle Variables</span>
              </label>

              <label className="jw-toggle">
                <input
                  type="checkbox"
                  checked={options.deadCodeElimination}
                  onChange={(e) =>
                    setOptions((p) => ({ ...p, deadCodeElimination: e.target.checked }))
                  }
                />
                <div className="jw-toggle-track">
                  <div className="jw-toggle-thumb" />
                </div>
                <span>Dead Code Elimination</span>
              </label>
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

        {/*  Tab Content  */}
        <div className="jw-content">
          {/*  Minify Tab  */}
          {tabView === "minify" && (
            <div className="jw-minify-view">
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
                    <div className="jw-gzip-badge">
                      <i className="ti ti-circle-filled" />~
                      {formatBytes(estimateGzipSize(result.output))} gzip
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
                  <i className="ti ti-file-code" />
                  Original
                </button>
                <div className="jw-sw-divider" />
                <button
                  type="button"
                  className={`jw-sw-tab ${mobilePanel === "output" ? "active" : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-file-zip" />
                  Minified
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
                      <i className="ti ti-file-code" />
                      Original JavaScript
                    </div>
                    <div className="jw-panel-actions">
                      {input && (
                        <>
                          <span className="jw-char-count">{input.length.toLocaleString()} ch</span>
                          <span className="jw-char-count">{input.split("\n").length} lines</span>
                        </>
                      )}
                      <button
                        type="button"
                        className="jw-icon-btn"
                        onClick={() => setInput("")}
                        disabled={!input}
                        title="Clear"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="jw-textarea"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JavaScript here…"
                    spellCheck={false}
                  />
                  {input && result && (
                    <div className="jw-mob-cta">
                      <button type="button" className="jw-cta-btn" onClick={goToOutput}>
                        <i className="ti ti-file-zip" />
                        View Minified Output
                        <i className="ti ti-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gutter */}
                <div className="jw-gutter">
                  <div className="jw-gutter-line" />
                  <div className="jw-gutter-node">
                    <i className="ti ti-chevrons-right" />
                  </div>
                  <div className="jw-gutter-line" />
                </div>

                {/* Output */}
                <div
                  className={`jw-panel ${mobilePanel === "output" ? "mob-visible" : "mob-hidden"}`}
                >
                  <div className="jw-panel-bar">
                    <div className="jw-panel-label">
                      <i className="ti ti-file-zip" />
                      {options.mode === "minify"
                        ? "Minified"
                        : options.mode === "compress"
                          ? "Compressed"
                          : "Mangled"}{" "}
                      JavaScript
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

                  {!result && (
                    <div className="jw-empty">
                      <div className="jw-empty-icon">
                        <i className="ti ti-brand-javascript" />
                      </div>
                      <h3 className="jw-empty-title">Minify JavaScript</h3>
                      <p className="jw-empty-desc">
                        Paste code on the left, load a sample, or drop a file to reduce bundle size
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
                          <i className="ti ti-file-zip" />
                          <span className="jw-stat-label">Minified</span>
                          <span className="jw-stat-value">
                            {formatBytes(result.stats.minified)}
                          </span>
                        </div>
                        <div className="jw-stat jw-stat--highlight">
                          <i className="ti ti-trending-down" />
                          <span className="jw-stat-label">Saved</span>
                          <span className="jw-stat-value jw-stat-value--good">
                            {formatBytes(result.stats.savings)} ({result.stats.savingsPercent}%)
                          </span>
                        </div>
                        <div className="jw-stat">
                          <i className="ti ti-layers" />
                          <span className="jw-stat-label">Lines</span>
                          <span className="jw-stat-value">
                            {result.stats.originalLines} → {result.stats.minifiedLines}
                          </span>
                        </div>
                        <button type="button" className="jw-download-btn" onClick={handleDownload}>
                          <i className="ti ti-download" />
                          Download .js
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
                        <button type="button" className="jw-mob-btn" onClick={handleDownload}>
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
          {tabView === "batch" && <JSBatch options={options} />}

          {/*  Analysis Tab  */}
          {tabView === "analysis" &&
            (result ? (
              <JSAnalysis analysis={result.analysis} issues={result.issues} stats={result.stats} />
            ) : (
              <div className="jw-tab-empty">
                <div className="jw-tab-empty-icon">
                  <i className="ti ti-chart-bar" />
                </div>
                <h3>Code Analysis</h3>
                <p>
                  Add JavaScript code to see detailed analysis, code quality metrics, and linting
                  results.
                </p>
                <button
                  type="button"
                  className="jw-tab-empty-btn"
                  onClick={() => setTabView("minify")}
                >
                  Go to Minifier
                </button>
              </div>
            ))}

          {/*  History Tab  */}
          {tabView === "history" && (
            <div className="jw-history">
              {history.length === 0 ? (
                <div className="jw-tab-empty">
                  <div className="jw-tab-empty-icon">
                    <i className="ti ti-history" />
                  </div>
                  <h3>No History Yet</h3>
                  <p>Your minification history will appear here after you download a result.</p>
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
                          <div className="jw-history-item-icon">
                            <i className="ti ti-brand-javascript" />
                          </div>
                          <div>
                            <div className="jw-history-item-title">{entry.title}</div>
                            <div className="jw-history-item-meta">
                              {new Date(entry.timestamp).toLocaleString()} ·{" "}
                              {formatBytes(entry.result.stats.original)} →{" "}
                              {formatBytes(entry.result.stats.minified)}
                            </div>
                          </div>
                        </div>
                        <div className="jw-history-item-right">
                          <span className="jw-history-mode">{entry.options.mode}</span>
                          <span className="jw-history-savings">
                            -{entry.result.stats.savingsPercent}%
                          </span>
                          <button
                            type="button"
                            className="jw-icon-btn"
                            onClick={() => {
                              setInput(entry.input);
                              setTabView("minify");
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
              <span>{result.stats.functions} functions</span>
              <span>·</span>
              <span>{result.stats.variables} variables</span>
              <span>·</span>
              <span className={result.analysis.syntaxValid ? "jw-valid" : "jw-invalid"}>
                <i className={`ti ${result.analysis.syntaxValid ? "ti-check" : "ti-x"}`} />
                {result.analysis.syntaxValid ? "Valid" : "Errors"}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
