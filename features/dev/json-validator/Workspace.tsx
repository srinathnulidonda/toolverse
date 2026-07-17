// features/dev/json-validator/Workspace.tsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { Tool } from "@/lib/tools";
import {
  validateJSON,
  formatBytes,
  type ValidationOptions,
  type ValidationMode,
  DEFAULT_OPTIONS,
  SAMPLE_TEMPLATES,
} from "./validatorEngine";
import ValidationPanel from "./ValidationPanel";
import SchemaValidator from "./SchemaValidator";
import CompareMode from "./CompareMode";
import { useValidatorStore } from "./validatorStore";

type TabView = "validate" | "schema" | "compare" | "history";

export default function JSONValidatorWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [tabView, setTabView] = useState<TabView>("validate");
  const [options, setOptions] = useState<ValidationOptions>(DEFAULT_OPTIONS);
  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const rootRef = useRef<HTMLDivElement>(null);

  const { history, settings, addToHistory, clearHistory } = useValidatorStore();

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return validateJSON(input, options);
  }, [input, options]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const handleDownload = useCallback(
    (content: string, filename: string) => {
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      if (settings.autoSave && result) {
        addToHistory({
          title: `Validation - ${new Date().toLocaleDateString()}`,
          input,
          result,
          options,
          tags: [result.valid ? "valid" : "invalid"],
          isFavorite: false,
        });
      }
    },
    [result, input, options, settings.autoSave, addToHistory]
  );

  const loadSample = useCallback((key: keyof typeof SAMPLE_TEMPLATES) => {
    setInput(SAMPLE_TEMPLATES[key].json);
    setMobilePanel("input");
  }, []);

  const formatJSON = useCallback(() => {
    if (!result?.valid) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
    } catch {
      // Ignore
    }
  }, [input, result]);

  const useRepaired = useCallback(() => {
    if (result?.repaired) {
      setInput(result.repaired);
    }
  }, [result]);

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
      id: "validate" as const,
      label: "Validate",
      icon: "ti-circle-check",
      description: "Validate JSON syntax",
    },
    {
      id: "schema" as const,
      label: "Schema",
      icon: "ti-shield-check",
      description: "Schema validation",
    },
    {
      id: "compare" as const,
      label: "Compare",
      icon: "ti-git-compare",
      description: "Compare documents",
    },
    { id: "history" as const, label: "History", icon: "ti-history", description: "View history" },
  ];

  return (
    <>
      <div className="jvw-root" ref={rootRef}>
        {/* ── Top Chrome ── */}
        <div className="jvw-chrome">
          <div className="jvw-chrome-left">
            <div className="jvw-title">
              <i className="ti ti-braces" />
              JSON Validator
            </div>
          </div>
          <div className="jvw-chrome-right">
            <button
              type="button"
              className="jvw-chrome-btn"
              onClick={() => setShowSettings((s) => !s)}
            >
              <i className="ti ti-settings" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        {showSettings && (
          <div className="jvw-settings">
            <div className="jvw-settings-row">
              <div className="jvw-setting-group">
                <label className="jvw-setting-label">Validation Mode</label>
                <div className="jvw-pill-group">
                  {(["standard", "strict", "permissive"] as ValidationMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`jvw-pill${options.mode === m ? " active" : ""}`}
                      onClick={() => setOptions((prev) => ({ ...prev, mode: m }))}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {options.mode === "permissive" && (
                <>
                  <div className="jvw-setting-group">
                    <label className="jvw-setting-checkbox">
                      <input
                        type="checkbox"
                        checked={options.allowComments}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            allowComments: e.target.checked,
                          }))
                        }
                      />
                      <span>Allow comments</span>
                    </label>
                  </div>

                  <div className="jvw-setting-group">
                    <label className="jvw-setting-checkbox">
                      <input
                        type="checkbox"
                        checked={options.allowTrailingCommas}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            allowTrailingCommas: e.target.checked,
                          }))
                        }
                      />
                      <span>Allow trailing commas</span>
                    </label>
                  </div>

                  <div className="jvw-setting-group">
                    <label className="jvw-setting-checkbox">
                      <input
                        type="checkbox"
                        checked={options.allowSingleQuotes}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            allowSingleQuotes: e.target.checked,
                          }))
                        }
                      />
                      <span>Allow single quotes</span>
                    </label>
                  </div>
                </>
              )}

              <div className="jvw-setting-group">
                <label className="jvw-setting-checkbox">
                  <input
                    type="checkbox"
                    checked={options.checkDuplicateKeys}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        checkDuplicateKeys: e.target.checked,
                      }))
                    }
                  />
                  <span>Check duplicate keys</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <div className="jvw-tabs-bar">
          <nav className="jvw-tabs">
            {TAB_VIEWS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`jvw-tab${tabView === tab.id ? " active" : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.description}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && history.length > 0 && (
                  <span className="jvw-tab-badge">{history.length}</span>
                )}
                {tab.id === "validate" && result && !result.valid && (
                  <span className="jvw-tab-indicator" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ── */}
        <div className="jvw-tab-content">
          {/* Validate Tab */}
          {tabView === "validate" && (
            <div className="jvw-validate-view">
              {/* Command Bar */}
              <div className="jvw-command-bar">
                <div className="jvw-command-left">
                  <div className="jvw-samples">
                    <span className="jvw-samples-label">Examples:</span>
                    {Object.entries(SAMPLE_TEMPLATES).map(([key, sample]) => (
                      <button
                        key={key}
                        type="button"
                        className="jvw-sample-btn"
                        onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                        title={sample.description}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="jvw-command-right">
                  {result?.valid && (
                    <button type="button" className="jvw-action-btn" onClick={formatJSON}>
                      <i className="ti ti-text-wrap" />
                      Format
                    </button>
                  )}
                  {result?.repaired && (
                    <button
                      type="button"
                      className="jvw-action-btn jvw-action-btn--brand"
                      onClick={useRepaired}
                    >
                      <i className="ti ti-wand" />
                      Use Repaired
                    </button>
                  )}
                </div>
              </div>

              {/* Status Bar */}
              {result && (
                <div className={`jvw-status jvw-status--${result.valid ? "valid" : "invalid"}`}>
                  <div className="jvw-status-left">
                    <i className={`ti ${result.valid ? "ti-circle-check" : "ti-alert-circle"}`} />
                    <span className="jvw-status-label">
                      {result.valid ? "Valid JSON" : "Invalid JSON"}
                    </span>
                    {result.errors.length > 0 && (
                      <span className="jvw-status-count">
                        {result.errors.length} error{result.errors.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {result.valid && (
                    <div className="jvw-status-right">
                      <span className="jvw-status-stat">{formatBytes(result.stats.size)}</span>
                      <span className="jvw-status-stat">{result.stats.lines} lines</span>
                      <span className="jvw-status-stat">Depth: {result.stats.depth}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Panel Switcher */}
              <div className="jvw-mobile-switcher">
                <button
                  type="button"
                  className={`jvw-switcher-tab${mobilePanel === "input" ? " active" : ""}`}
                  onClick={goToInput}
                >
                  <i className="ti ti-code" />
                  Input JSON
                </button>
                <div className="jvw-switcher-divider" />
                <button
                  type="button"
                  className={`jvw-switcher-tab${mobilePanel === "output" ? " active" : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-list-details" />
                  Results
                  {result && mobilePanel !== "output" && <span className="jvw-ready-indicator" />}
                </button>
              </div>

              {/* Body */}
              <div className="jvw-body">
                {/* Input Panel */}
                <div
                  className={`jvw-panel${mobilePanel === "input" ? " mobile-visible" : " mobile-hidden"}`}
                >
                  <div className="jvw-panel-header">
                    <div className="jvw-panel-title">
                      <i className="ti ti-braces" />
                      JSON Input
                    </div>
                    <div className="jvw-panel-actions">
                      {input && (
                        <>
                          <span className="jvw-char-count">
                            {input.length.toLocaleString()} chars
                          </span>
                          <button
                            type="button"
                            className={`jvw-copy-btn${copiedKey === "input" ? " copied" : ""}`}
                            onClick={() => handleCopy(input, "input")}
                          >
                            <i className={`ti ${copiedKey === "input" ? "ti-check" : "ti-copy"}`} />
                          </button>
                          <button
                            type="button"
                            className="jvw-clear-btn"
                            onClick={clearAll}
                            title="Clear input"
                          >
                            <i className="ti ti-x" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <textarea
                    className={`jvw-textarea${result && !result.valid ? " jvw-textarea--error" : ""}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    spellCheck={false}
                  />
                  {input && result && (
                    <div className="jvw-mobile-cta">
                      <button type="button" className="jvw-view-result-btn" onClick={goToOutput}>
                        <i className="ti ti-list-details" />
                        View Validation Results
                        <i className="ti ti-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gutter */}
                <div className="jvw-gutter">
                  <div className="jvw-gutter-line" />
                  <div className="jvw-gutter-icon">
                    <i className="ti ti-arrow-right" />
                  </div>
                  <div className="jvw-gutter-line" />
                </div>

                {/* Output Panel */}
                <div
                  className={`jvw-panel${mobilePanel === "output" ? " mobile-visible" : " mobile-hidden"}`}
                >
                  {!result && !input && (
                    <div className="jvw-empty">
                      <div className="jvw-empty-icon">
                        <i className="ti ti-braces" />
                      </div>
                      <h3 className="jvw-empty-title">Validate JSON Syntax</h3>
                      <p className="jvw-empty-description">
                        Paste JSON to check for syntax errors, structural issues, and security
                        concerns
                      </p>
                      <div className="jvw-empty-samples">
                        {Object.entries(SAMPLE_TEMPLATES)
                          .slice(0, 2)
                          .map(([key, sample]) => (
                            <button
                              key={key}
                              type="button"
                              className="jvw-empty-sample-btn"
                              onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                            >
                              Try {sample.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {result && <ValidationPanel result={result} />}
                </div>
              </div>
            </div>
          )}

          {/* Schema Tab */}
          {tabView === "schema" && <SchemaValidator jsonInput={input} options={options} />}

          {/* Compare Tab */}
          {tabView === "compare" && <CompareMode leftDefault={input} />}

          {/* History Tab */}
          {tabView === "history" && (
            <div className="jvw-history-view">
              {history.length === 0 ? (
                <div className="jvw-tab-empty">
                  <div className="jvw-tab-empty-icon">
                    <i className="ti ti-history" />
                  </div>
                  <h3 className="jvw-tab-empty-title">No History Yet</h3>
                  <p className="jvw-tab-empty-description">
                    Your validation history will appear here when auto-save is enabled.
                  </p>
                </div>
              ) : (
                <>
                  <div className="jvw-history-header">
                    <div className="jvw-history-title">
                      <i className="ti ti-history" />
                      Validation History
                      <span className="jvw-history-count">{history.length}</span>
                    </div>
                    <button type="button" className="jvw-action-btn" onClick={clearHistory}>
                      <i className="ti ti-trash" />
                      Clear History
                    </button>
                  </div>
                  <div className="jvw-history-list">
                    {history.slice(0, 50).map((entry) => (
                      <div key={entry.id} className="jvw-history-item">
                        <div className="jvw-history-item-header">
                          <div className="jvw-history-item-info">
                            <span className="jvw-history-item-title">{entry.title}</span>
                            <span className="jvw-history-item-time">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="jvw-history-item-meta">
                            <span
                              className={`jvw-history-badge ${entry.result.valid ? "valid" : "invalid"}`}
                            >
                              <i className={`ti ${entry.result.valid ? "ti-check" : "ti-x"}`} />
                              {entry.result.valid ? "Valid" : "Invalid"}
                            </span>
                            <span className="jvw-history-stat">
                              {formatBytes(entry.result.stats.size)}
                            </span>
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
        <div className="jvw-footer">
          <div className="jvw-footer-info">
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {result && (
            <div className="jvw-footer-stats">
              <span>{result.stats.keys} keys</span>
              <span>•</span>
              <span>{result.stats.objects} objects</span>
              <span>•</span>
              <span>{result.stats.arrays} arrays</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .jvw-root {
          --jvw-radius-sm: 6px;
          --jvw-radius-md: 8px;
          --jvw-radius-lg: 12px;
          --jvw-radius-xl: 16px;

          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--jvw-radius-xl);
          display: flex;
          flex-direction: column;
          min-height: 700px;
          overflow: hidden;
        }

        /* Chrome */
        .jvw-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jvw-chrome-left,
        .jvw-chrome-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .jvw-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .jvw-title i {
          font-size: 16px;
          color: var(--brand);
        }

        .jvw-chrome-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: var(--jvw-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jvw-chrome-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .jvw-chrome-btn i {
          font-size: 13px;
        }

        /* Settings */
        .jvw-settings {
          padding: 14px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jvw-settings-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .jvw-setting-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .jvw-setting-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jvw-pill-group {
          display: inline-flex;
          gap: 2px;
          padding: 2px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--jvw-radius-md);
        }

        .jvw-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 10px;
          border: none;
          border-radius: 5px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .jvw-pill:hover {
          background: var(--bg-surface);
          color: var(--text);
        }
        .jvw-pill.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .jvw-setting-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .jvw-setting-checkbox input {
          cursor: pointer;
        }
        .jvw-setting-checkbox span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Tabs */
        .jvw-tabs-bar {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jvw-tabs {
          display: flex;
          padding: 0 16px;
          overflow-x: auto;
        }

        .jvw-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 40px;
          padding: 0 16px;
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

        .jvw-tab:hover {
          color: var(--text);
        }
        .jvw-tab.active {
          color: var(--text);
        }

        .jvw-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 12px;
          right: 12px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .jvw-tab i {
          font-size: 14px;
        }

        .jvw-tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
        }

        .jvw-tab-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
        }

        /* Tab Content */
        .jvw-tab-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* Validate View */
        .jvw-validate-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        /* Command Bar */
        .jvw-command-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .jvw-command-left,
        .jvw-command-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .jvw-samples {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .jvw-samples-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-disabled);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jvw-sample-btn {
          height: 26px;
          padding: 0 8px;
          border: 0.5px solid var(--border);
          border-radius: var(--jvw-radius-md);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .jvw-sample-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .jvw-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border-radius: var(--jvw-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jvw-action-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .jvw-action-btn i {
          font-size: 13px;
        }

        .jvw-action-btn--brand {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        .jvw-action-btn--brand:hover {
          background: var(--brand-hover);
          border-color: var(--brand-hover);
        }

        /* Status Bar */
        .jvw-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-shrink: 0;
        }

        .jvw-status--valid {
          background: #f0fdf4;
          color: #166534;
        }

        .jvw-status--invalid {
          background: #fef2f2;
          color: #991b1b;
        }

        @media (prefers-color-scheme: dark) {
          .jvw-status--valid {
            background: #052e16;
            color: #4ade80;
          }
          .jvw-status--invalid {
            background: #1c0a0a;
            color: #f87171;
          }
        }

        .jvw-status-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .jvw-status-left i {
          font-size: 16px;
        }

        .jvw-status-label {
          font-size: 13px;
          font-weight: 600;
        }

        .jvw-status-count {
          font-size: 11px;
          font-weight: 500;
          opacity: 0.8;
        }

        .jvw-status-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .jvw-status-stat {
          font-size: 11px;
          font-weight: 500;
          font-family: var(--font-mono);
        }

        /* Mobile Switcher */
        .jvw-mobile-switcher {
          display: none;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jvw-switcher-tab {
          flex: 1;
          height: 42px;
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

        .jvw-switcher-tab.active {
          color: var(--text);
        }

        .jvw-switcher-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
        }

        .jvw-switcher-divider {
          width: 0.5px;
          background: var(--border);
          align-self: stretch;
          margin: 10px 0;
        }

        .jvw-ready-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        /* Body */
        .jvw-body {
          display: grid;
          grid-template-columns: 1fr 44px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .jvw-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .jvw-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 40px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 8px;
          flex-shrink: 0;
        }

        .jvw-panel-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jvw-panel-title i {
          font-size: 13px;
        }

        .jvw-panel-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .jvw-char-count {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-disabled);
        }

        .jvw-copy-btn,
        .jvw-clear-btn {
          width: 28px;
          height: 28px;
          border: 0.5px solid var(--border);
          border-radius: var(--jvw-radius-md);
          background: var(--bg-card);
          color: var(--text-tertiary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jvw-copy-btn:hover:not(:disabled),
        .jvw-clear-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .jvw-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .jvw-textarea {
          flex: 1;
          padding: 14px 16px;
          border: none;
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-mono);
          line-height: 1.6;
          resize: none;
          outline: none;
          min-height: 0;
        }

        .jvw-textarea::placeholder {
          color: var(--text-disabled);
        }

        .jvw-textarea--error {
          border-left: 3px solid #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .jvw-textarea--error {
            border-color: #f87171;
          }
        }

        .jvw-mobile-cta {
          display: none;
          padding: 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jvw-view-result-btn {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: var(--jvw-radius-lg);
          background: var(--brand);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jvw-view-result-btn:hover {
          background: var(--brand-hover);
        }
        .jvw-view-result-btn i {
          font-size: 16px;
        }

        /* Gutter */
        .jvw-gutter {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border-left: 0.5px solid var(--border);
          border-right: 0.5px solid var(--border);
        }

        .jvw-gutter-line {
          flex: 1;
          width: 0.5px;
          background: var(--border);
        }

        .jvw-gutter-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-disabled);
          font-size: 14px;
        }

        /* Empty State */
        .jvw-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px 24px;
          text-align: center;
          background: var(--bg-card);
        }

        .jvw-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: var(--text-disabled);
        }

        .jvw-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }
        .jvw-empty-description {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 400px;
          line-height: 1.6;
        }

        .jvw-empty-samples {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .jvw-empty-sample-btn {
          height: 32px;
          padding: 0 14px;
          border: 0.5px solid var(--border);
          border-radius: var(--jvw-radius-md);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .jvw-empty-sample-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /* Tab Empty */
        .jvw-tab-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 24px;
          text-align: center;
          background: var(--bg-surface);
        }

        .jvw-tab-empty-icon {
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

        .jvw-tab-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }
        .jvw-tab-empty-description {
          font-size: 14px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 400px;
          line-height: 1.6;
        }

        /* History */
        .jvw-history-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          overflow: hidden;
          min-height: 0;
        }

        .jvw-history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .jvw-history-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .jvw-history-title i {
          font-size: 15px;
          color: var(--text-secondary);
        }

        .jvw-history-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 600;
        }

        .jvw-history-list {
          flex: 1;
          overflow: auto;
          padding: 8px;
          min-height: 0;
        }

        .jvw-history-item {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--jvw-radius-lg);
          padding: 12px 14px;
          margin-bottom: 8px;
          transition: all 0.12s;
        }

        .jvw-history-item:hover {
          border-color: var(--brand-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .jvw-history-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .jvw-history-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .jvw-history-item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .jvw-history-item-time {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .jvw-history-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .jvw-history-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 22px;
          padding: 0 8px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .jvw-history-badge.valid {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .jvw-history-badge.invalid {
          background: #fef2f2;
          color: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .jvw-history-badge.invalid {
            background: #1f1517;
            color: #f87171;
          }
        }

        .jvw-history-badge i {
          font-size: 9px;
        }

        .jvw-history-stat {
          font-size: 11px;
          font-weight: 500;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
        }

        /* Footer */
        .jvw-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 16px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          font-size: 11px;
          flex-shrink: 0;
        }

        .jvw-footer-info {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-tertiary);
        }
        .jvw-footer-info i {
          font-size: 13px;
          color: var(--brand);
        }
        .jvw-footer-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          flex-wrap: wrap;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .jvw-root {
            border-radius: 0;
            border-left: none;
            border-right: none;
            min-height: 100dvh;
          }

          .jvw-chrome-btn span,
          .jvw-samples-label {
            display: none;
          }

          .jvw-settings-row {
            flex-direction: column;
            align-items: stretch;
          }
          .jvw-setting-group {
            width: 100%;
          }

          .jvw-tab span {
            display: none;
          }
          .jvw-tab {
            padding: 0 12px;
          }

          .jvw-command-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .jvw-command-left,
          .jvw-command-right {
            width: 100%;
            justify-content: space-between;
          }

          .jvw-mobile-switcher {
            display: flex;
          }

          .jvw-body {
            grid-template-columns: 1fr;
            position: relative;
            overflow: hidden;
          }

          .jvw-gutter {
            display: none;
          }

          .jvw-panel {
            grid-column: 1;
            grid-row: 1;
            position: absolute;
            inset: 0;
          }

          .jvw-panel.mobile-visible {
            z-index: 1;
            visibility: visible;
          }

          .jvw-panel.mobile-hidden {
            z-index: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .jvw-mobile-cta {
            display: block;
          }

          .jvw-footer {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jvw-chrome-btn,
          .jvw-pill,
          .jvw-tab,
          .jvw-sample-btn,
          .jvw-action-btn,
          .jvw-copy-btn,
          .jvw-clear-btn,
          .jvw-view-result-btn,
          .jvw-empty-sample-btn,
          .jvw-history-item {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
