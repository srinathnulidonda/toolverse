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

      <style jsx>{`
        /*  Root  */
        .jw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          overflow: hidden;
        }

        /*  Chrome  */
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
          background: #f59e0b20;
          color: #f59e0b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
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

        /* Mode pills */
        .jw-mode-pills {
          display: flex;
          gap: 3px;
          padding: 3px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 9px;
        }

        .jw-mode-pill {
          height: 26px;
          padding: 0 10px;
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

        /*  Settings Panel  */
        .jw-settings {
          padding: 14px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jw-settings-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 24px;
        }

        /* Toggle switch */
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
          border: 0.5px solid var(--border);
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .jw-toggle input:checked ~ .jw-toggle-track {
          background: var(--brand);
          border-color: var(--brand);
        }

        .jw-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 13px;
          height: 13px;
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

        /*  Tabs  */
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

        /*  Content  */
        .jw-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /*  Minify View  */
        .jw-minify-view {
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

        .jw-gzip-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .jw-gzip-badge i {
          font-size: 8px;
          color: #22c55e;
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
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-mono);
          line-height: 1.7;
          resize: none;
          outline: none;
          min-height: 0;
        }

        .jw-textarea::placeholder {
          color: var(--text-disabled);
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
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-disabled);
          font-size: 13px;
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
          background: #f59e0b15;
          color: #f59e0b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
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
          gap: 12px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          flex-shrink: 0;
          overflow-x: auto;
        }

        .jw-stat {
          display: flex;
          align-items: center;
          gap: 5px;
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
        .jw-stat-value--good {
          color: #16a34a;
        }

        @media (prefers-color-scheme: dark) {
          .jw-stat-value--good {
            color: #4ade80;
          }
        }

        .jw-stat--highlight {
          padding: 3px 8px;
          background: #dcfce7;
          border-radius: 6px;
        }

        @media (prefers-color-scheme: dark) {
          .jw-stat--highlight {
            background: #022c22;
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

        /* Mobile actions */
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

        /* Tab empty */
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
          background: #f59e0b15;
          color: #f59e0b;
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
          color: #16a34a;
          font-family: var(--font-mono);
        }

        @media (prefers-color-scheme: dark) {
          .jw-history-savings {
            color: #4ade80;
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

        /*  Mobile  */
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
            padding: 0 7px;
            font-size: 10px;
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
            justify-content: flex-start;
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

          .jw-footer {
            flex-direction: column;
            text-align: center;
            gap: 6px;
          }
          .jw-footer-right {
            justify-content: center;
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
          .jw-toggle-track,
          .jw-toggle-thumb {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
