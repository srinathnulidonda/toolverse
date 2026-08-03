// features/dev/html-formatter/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useMemo, useRef } from "react";
import type { Tool } from "@/lib/tools";
import {
  processHTML,
  type FormattingOptions,
  type FormattingMode,
  type IndentStyle,
  DEFAULT_OPTIONS,
  SAMPLE_TEMPLATES,
  convertToMarkdown,
  convertToPlainText,
  formatBytes,
} from "./htmlEngine";
import HTMLValidation from "./HTMLValidation";
import HTMLPreview from "./HTMLPreview";
import HTMLBatch from "./HTMLBatch";
import { useHTMLStore } from "./htmlStore";
import "./style/HTMLBatch.css";
import "./style/HTMLPreview.css";
import "./style/HTMLValidation.css";
import "./style/Workspace.css";

type TabView = "single" | "batch" | "validation" | "preview" | "history";

export default function HTMLFormatterWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [tabView, setTabView] = useState<TabView>("single");
  const [options, setOptions] = useState<FormattingOptions>(DEFAULT_OPTIONS);
  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const rootRef = useRef<HTMLDivElement>(null);

  const { history, settings, addToHistory, clearHistory, updateSettings } = useHTMLStore();

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return processHTML(input, options);
    } catch (error) {
      logger.error("Processing failed:", error);
      return null;
    }
  }, [input, options]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const handleDownload = useCallback(
    (format: "html" | "markdown" | "txt" = "html") => {
      if (!result) return;

      let content = result.output;
      let mimeType = "text/html";
      let extension = "html";

      if (format === "markdown") {
        content = convertToMarkdown(input);
        mimeType = "text/markdown";
        extension = "md";
      } else if (format === "txt") {
        content = convertToPlainText(input);
        mimeType = "text/plain";
        extension = "txt";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${options.mode}_${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);

      if (settings.autoSave && format === "html") {
        addToHistory({
          title: `${options.mode} - ${new Date().toLocaleDateString()}`,
          input,
          result,
          options,
          tags: [options.mode],
          isFavorite: false,
        });
      }
    },
    [result, input, options, settings.autoSave, addToHistory]
  );

  const loadSample = useCallback((key: keyof typeof SAMPLE_TEMPLATES) => {
    setInput(SAMPLE_TEMPLATES[key].html);
    setMobilePanel("input");
  }, []);

  const clearAll = useCallback(() => {
    setInput("");
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

  const TAB_VIEWS = [
    {
      id: "single" as const,
      label: "Format",
      icon: "ti-code",
      description: "Format or minify HTML",
    },
    {
      id: "batch" as const,
      label: "Batch",
      icon: "ti-files",
      description: "Process multiple files",
    },
    {
      id: "validation" as const,
      label: "Validate",
      icon: "ti-shield-check",
      description: "Check HTML quality",
    },
    { id: "preview" as const, label: "Preview", icon: "ti-eye", description: "Live preview" },
    { id: "history" as const, label: "History", icon: "ti-history", description: "View history" },
  ];

  return (
    <>
      <div className="hf-root" ref={rootRef}>
        {/* ── Top Chrome ── */}
        <div className="hf-chrome">
          <div className="hf-chrome-left">
            <div className="hf-title">
              <i className="ti ti-brand-html5" />
              HTML Formatter
            </div>
          </div>
          <div className="hf-chrome-right">
            <button
              type="button"
              className="hf-chrome-btn"
              onClick={() => setShowSettings((s) => !s)}
            >
              <i className="ti ti-settings" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        {showSettings && (
          <div className="hf-settings">
            <div className="hf-settings-row">
              <div className="hf-setting-group">
                <label className="hf-setting-label">Mode</label>
                <div className="hf-pill-group">
                  {(["format", "minify", "compress"] as FormattingMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`hf-pill${options.mode === m ? " active" : ""}`}
                      onClick={() => setOptions((prev) => ({ ...prev, mode: m }))}
                    >
                      {m === "format" && <i className="ti ti-text-wrap" />}
                      {m === "minify" && <i className="ti ti-file-zip" />}
                      {m === "compress" && <i className="ti ti-minimize" />}
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {options.mode === "format" && (
                <>
                  <div className="hf-setting-group">
                    <label className="hf-setting-label">Indent Style</label>
                    <select
                      className="hf-select"
                      value={options.indentStyle}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          indentStyle: e.target.value as IndentStyle,
                        }))
                      }
                    >
                      <option value="2-spaces">2 Spaces</option>
                      <option value="4-spaces">4 Spaces</option>
                      <option value="tabs">Tabs</option>
                    </select>
                  </div>

                  <div className="hf-setting-group">
                    <label className="hf-setting-checkbox">
                      <input
                        type="checkbox"
                        checked={options.wrapAttributes}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            wrapAttributes: e.target.checked,
                          }))
                        }
                      />
                      <span>Wrap long attributes</span>
                    </label>
                  </div>

                  <div className="hf-setting-group">
                    <label className="hf-setting-checkbox">
                      <input
                        type="checkbox"
                        checked={options.sortAttributes}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            sortAttributes: e.target.checked,
                          }))
                        }
                      />
                      <span>Sort attributes</span>
                    </label>
                  </div>
                </>
              )}

              <div className="hf-setting-group">
                <label className="hf-setting-checkbox">
                  <input
                    type="checkbox"
                    checked={options.removeComments}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        removeComments: e.target.checked,
                      }))
                    }
                  />
                  <span>Remove comments</span>
                </label>
              </div>

              {options.mode !== "format" && (
                <div className="hf-setting-group">
                  <label className="hf-setting-checkbox">
                    <input
                      type="checkbox"
                      checked={options.removeOptionalTags}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          removeOptionalTags: e.target.checked,
                        }))
                      }
                    />
                    <span>Remove optional tags</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <div className="hf-tabs-bar">
          <nav className="hf-tabs">
            {TAB_VIEWS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`hf-tab${tabView === tab.id ? " active" : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.description}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className="hf-tab-badge">{history.length}</span>
                )}
                {tab.id === "validation" && result && !result.validation.isValid && (
                  <span className="hf-tab-indicator" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ── */}
        <div className="hf-tab-content">
          {/* Single Tab */}
          {tabView === "single" && (
            <div className="hf-single-view">
              {/* Command Bar */}
              <div className="hf-command-bar">
                <div className="hf-command-left">
                  <div className="hf-samples">
                    <span className="hf-samples-label">Examples:</span>
                    {Object.entries(SAMPLE_TEMPLATES).map(([key, sample]) => (
                      <button
                        key={key}
                        type="button"
                        className="hf-sample-btn"
                        onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                        title={sample.description}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hf-command-right">
                  {result && (
                    <div className="hf-export-chips">
                      <span className="hf-export-label">Export:</span>
                      <button
                        type="button"
                        className="hf-export-chip"
                        onClick={() => handleDownload("html")}
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        className="hf-export-chip"
                        onClick={() => handleDownload("markdown")}
                      >
                        MD
                      </button>
                      <button
                        type="button"
                        className="hf-export-chip"
                        onClick={() => handleDownload("txt")}
                      >
                        TXT
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Panel Switcher */}
              <div className="hf-mobile-switcher">
                <button
                  type="button"
                  className={`hf-switcher-tab${mobilePanel === "input" ? " active" : ""}`}
                  onClick={goToInput}
                >
                  <i className="ti ti-code" />
                  Input HTML
                </button>
                <div className="hf-switcher-divider" />
                <button
                  type="button"
                  className={`hf-switcher-tab${mobilePanel === "output" ? " active" : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-sparkles" />
                  Result
                  {result && mobilePanel !== "output" && <span className="hf-ready-indicator" />}
                </button>
              </div>

              {/* Body */}
              <div className="hf-body">
                {/* Input Panel */}
                <div
                  className={`hf-panel${mobilePanel === "input" ? " mobile-visible" : " mobile-hidden"}`}
                >
                  <div className="hf-panel-header">
                    <div className="hf-panel-title">
                      <i className="ti ti-code" />
                      Input HTML
                    </div>
                    <div className="hf-panel-actions">
                      {input && (
                        <span className="hf-char-count">{input.length.toLocaleString()} chars</span>
                      )}
                      <button
                        type="button"
                        className="hf-panel-btn"
                        onClick={clearAll}
                        disabled={!input}
                        title="Clear input"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="hf-textarea"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your HTML here..."
                    spellCheck={false}
                  />
                  {input && result && (
                    <div className="hf-mobile-cta">
                      <button type="button" className="hf-view-result-btn" onClick={goToOutput}>
                        <i className="ti ti-sparkles" />
                        View{" "}
                        {options.mode === "format"
                          ? "Formatted"
                          : options.mode === "minify"
                            ? "Minified"
                            : "Compressed"}{" "}
                        HTML
                        <i className="ti ti-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gutter */}
                <div className="hf-gutter">
                  <div className="hf-gutter-line" />
                  <div className="hf-gutter-icon">
                    <i className="ti ti-arrow-right" />
                  </div>
                  <div className="hf-gutter-line" />
                </div>

                {/* Output Panel */}
                <div
                  className={`hf-panel${mobilePanel === "output" ? " mobile-visible" : " mobile-hidden"}`}
                >
                  <div className="hf-panel-header">
                    <div className="hf-panel-title">
                      <i className="ti ti-sparkles" />
                      {options.mode === "format"
                        ? "Formatted"
                        : options.mode === "minify"
                          ? "Minified"
                          : "Compressed"}{" "}
                      HTML
                    </div>
                    <div className="hf-panel-actions">
                      {result && (
                        <button
                          type="button"
                          className={`hf-copy-btn${copiedKey === "output" ? " copied" : ""}`}
                          onClick={() => handleCopy(result.output, "output")}
                        >
                          <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "output" ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>

                  {!result && !input && (
                    <div className="hf-empty">
                      <div className="hf-empty-icon">
                        <i className="ti ti-brand-html5" />
                      </div>
                      <h3 className="hf-empty-title">Format or Minify HTML</h3>
                      <p className="hf-empty-description">
                        Paste HTML code on the left or try a sample to get started
                      </p>
                      <div className="hf-empty-samples">
                        {Object.entries(SAMPLE_TEMPLATES)
                          .slice(0, 2)
                          .map(([key, sample]) => (
                            <button
                              key={key}
                              type="button"
                              className="hf-empty-sample-btn"
                              onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                            >
                              Try {sample.name}
                            </button>
                          ))}
                      </div>
                      <button type="button" className="hf-go-input-btn" onClick={goToInput}>
                        <i className="ti ti-code" />
                        Go to input
                      </button>
                    </div>
                  )}

                  {result && (
                    <>
                      <pre className="hf-output">{result.output}</pre>
                      <div className="hf-stats-bar">
                        <div className="hf-stat">
                          <span className="hf-stat-label">Original</span>
                          <span className="hf-stat-value">
                            {formatBytes(result.stats.original)}
                          </span>
                        </div>
                        <div className="hf-stat">
                          <span className="hf-stat-label">Processed</span>
                          <span className="hf-stat-value">
                            {formatBytes(result.stats.processed)}
                          </span>
                        </div>
                        <div className="hf-stat">
                          <span className="hf-stat-label">
                            {result.stats.savings > 0 ? "Saved" : "Added"}
                          </span>
                          <span
                            className={`hf-stat-value ${result.stats.savings > 0 ? "success" : result.stats.savings < 0 ? "warning" : ""}`}
                          >
                            {formatBytes(Math.abs(result.stats.savings))}
                            {result.stats.savingsPercent !== 0 && (
                              <span className="hf-stat-percent">
                                ({Math.abs(result.stats.savingsPercent)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="hf-stat">
                          <span className="hf-stat-label">Elements</span>
                          <span className="hf-stat-value">
                            {result.stats.elements.toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="hf-download-btn"
                          onClick={() => handleDownload("html")}
                        >
                          <i className="ti ti-download" />
                          Download
                        </button>
                      </div>
                    </>
                  )}

                  {result && (
                    <div className="hf-mobile-actions">
                      <button
                        type="button"
                        className={`hf-mobile-action-btn${copiedKey === "mobile" ? " copied" : ""}`}
                        onClick={() => handleCopy(result.output, "mobile")}
                      >
                        <i className={`ti ${copiedKey === "mobile" ? "ti-check" : "ti-copy"}`} />
                        {copiedKey === "mobile" ? "Copied" : "Copy Result"}
                      </button>
                      <button
                        type="button"
                        className="hf-mobile-action-btn"
                        onClick={() => handleDownload("html")}
                      >
                        <i className="ti ti-download" />
                        Download HTML
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Batch Tab */}
          {tabView === "batch" && <HTMLBatch options={options} />}

          {/* Validation Tab */}
          {tabView === "validation" &&
            (result ? (
              <HTMLValidation validation={result.validation} metadata={result.metadata} />
            ) : (
              <div className="hf-tab-empty">
                <div className="hf-tab-empty-icon">
                  <i className="ti ti-shield-check" />
                </div>
                <h3 className="hf-tab-empty-title">HTML Validation</h3>
                <p className="hf-tab-empty-description">
                  Add HTML code to see validation results, accessibility score, and best practice
                  recommendations.
                </p>
                <button
                  type="button"
                  className="hf-tab-empty-btn"
                  onClick={() => setTabView("single")}
                >
                  Go to formatter
                </button>
              </div>
            ))}

          {/* ✅ Preview Tab — key change here */}
          {tabView === "preview" && (
            <div className="hf-preview-host">
              {input.trim() ? (
                <HTMLPreview html={input} />
              ) : (
                <div className="hf-tab-empty">
                  <div className="hf-tab-empty-icon">
                    <i className="ti ti-eye" />
                  </div>
                  <h3 className="hf-tab-empty-title">Live Preview</h3>
                  <p className="hf-tab-empty-description">
                    Add HTML code to see a live rendered preview with responsive viewport controls.
                  </p>
                  <button
                    type="button"
                    className="hf-tab-empty-btn"
                    onClick={() => setTabView("single")}
                  >
                    Go to formatter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {tabView === "history" && (
            <div className="hf-history-view">
              {history.length === 0 ? (
                <div className="hf-tab-empty">
                  <div className="hf-tab-empty-icon">
                    <i className="ti ti-history" />
                  </div>
                  <h3 className="hf-tab-empty-title">No History Yet</h3>
                  <p className="hf-tab-empty-description">
                    Your formatting history will appear here when auto-save is enabled.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hf-history-header">
                    <div className="hf-history-title">
                      <i className="ti ti-history" />
                      Formatting History
                      <span className="hf-history-count">{history.length}</span>
                    </div>
                    <button type="button" className="hf-action-btn" onClick={clearHistory}>
                      <i className="ti ti-trash" />
                      Clear History
                    </button>
                  </div>
                  <div className="hf-history-list">
                    {history.slice(0, 50).map((entry) => (
                      <div key={entry.id} className="hf-history-item">
                        <div className="hf-history-item-header">
                          <div className="hf-history-item-info">
                            <span className="hf-history-item-title">{entry.title}</span>
                            <span className="hf-history-item-time">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="hf-history-item-meta">
                            <span className="hf-history-mode-badge">{entry.options.mode}</span>
                            {entry.result.stats.savings !== 0 && (
                              <span
                                className={`hf-history-savings ${entry.result.stats.savings > 0 ? "positive" : "negative"}`}
                              >
                                {entry.result.stats.savings > 0 ? "↓" : "↑"}{" "}
                                {formatBytes(Math.abs(entry.result.stats.savings))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="hf-footer">
          <div className="hf-footer-info">
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {result && (
            <div className="hf-footer-stats">
              <span>{result.stats.elements} elements</span>
              <span>•</span>
              <span>{result.stats.lines} lines</span>
              {result.metadata.doctype && (
                <>
                  <span>•</span>
                  <span>HTML5</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
