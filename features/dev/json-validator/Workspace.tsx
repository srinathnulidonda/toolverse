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
import "./style/CompareMode.css";
import "./style/SchemaValidator.css";
import "./style/ValidationPanel.css";
import "./style/Workspace.css";

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
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
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
    </>
  );
}
