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
} from "./ts/validatorEngine";
import ValidationPanel from "./ValidationPanel";
import SchemaValidator from "./SchemaValidator";
import CompareMode from "./CompareMode";
import { useValidatorStore } from "./ts/validatorStore";
import styles from "./style/CompareMode.module.css";
import schemaStyles from "./style/SchemaValidator.module.css";
import validationStyles from "./style/ValidationPanel.module.css";
import workspaceStyles from "./style/Workspace.module.css";

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
      <div className={workspaceStyles.jvwRoot} ref={rootRef}>
        {/* ── Top Chrome ── */}
        <div className={workspaceStyles.jvwChrome}>
          <div className={workspaceStyles.jvwChromeLeft}>
            <div className={workspaceStyles.jvwTitle}>
              <i className="ti ti-braces" />
              JSON Validator
            </div>
          </div>
          <div className={workspaceStyles.jvwChromeRight}>
            <button
              type="button"
              className={workspaceStyles.jvwChromeBtn}
              onClick={() => setShowSettings((s) => !s)}
            >
              <i className="ti ti-settings" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        {showSettings && (
          <div className={workspaceStyles.jvwSettings}>
            <div className={workspaceStyles.jvwSettingsRow}>
              <div className={workspaceStyles.jvwSettingGroup}>
                <label className={workspaceStyles.jvwSettingLabel}>Validation Mode</label>
                <div className={workspaceStyles.jvwPillGroup}>
                  {(["standard", "strict", "permissive"] as ValidationMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`${workspaceStyles.jvwPill}${options.mode === m ? " active" : ""}`}
                      onClick={() => setOptions((prev) => ({ ...prev, mode: m }))}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {options.mode === "permissive" && (
                <>
                  <div className={workspaceStyles.jvwSettingGroup}>
                    <label className={workspaceStyles.jvwSettingCheckbox}>
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

                  <div className={workspaceStyles.jvwSettingGroup}>
                    <label className={workspaceStyles.jvwSettingCheckbox}>
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

                  <div className={workspaceStyles.jvwSettingGroup}>
                    <label className={workspaceStyles.jvwSettingCheckbox}>
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

              <div className={workspaceStyles.jvwSettingGroup}>
                <label className={workspaceStyles.jvwSettingCheckbox}>
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
        <div className={workspaceStyles.jvwTabsBar}>
          <nav className={workspaceStyles.jvwTabs}>
            {TAB_VIEWS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${workspaceStyles.jvwTab}${tabView === tab.id ? " active" : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.description}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className={workspaceStyles.jvwTabBadge}>{history.length}</span>
                )}
                {tab.id === "validate" && result && !result.valid && (
                  <span className={workspaceStyles.jvwTabIndicator} />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ── */}
        <div className={workspaceStyles.jvwTabContent}>
          {/* Validate Tab */}
          {tabView === "validate" && (
            <div className={workspaceStyles.jvwValidateView}>
              {/* Command Bar */}
              <div className={workspaceStyles.jvwCommandBar}>
                <div className={workspaceStyles.jvwCommandLeft}>
                  <div className={workspaceStyles.jvwSamples}>
                    <span className={workspaceStyles.jvwSamplesLabel}>Examples:</span>
                    {Object.entries(SAMPLE_TEMPLATES).map(([key, sample]) => (
                      <button
                        key={key}
                        type="button"
                        className={workspaceStyles.jvwSampleBtn}
                        onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                        title={sample.description}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={workspaceStyles.jvwCommandRight}>
                  {result?.valid && (
                    <button type="button" className={workspaceStyles.jvwActionBtn} onClick={formatJSON}>
                      <i className="ti ti-text-wrap" />
                      Format
                    </button>
                  )}
                  {result?.repaired && (
                    <button
                      type="button"
                      className={`${workspaceStyles.jvwActionBtn} ${workspaceStyles.jvwActionBtnBrand}`}
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
                <div className={`${workspaceStyles.jvwStatus} ${workspaceStyles[`jvwStatus${result.valid ? "Valid" : "Invalid"}`]}`}>
                  <div className={workspaceStyles.jvwStatusLeft}>
                    <i className={`ti ${result.valid ? "ti-circle-check" : "ti-alert-circle"}`} />
                    <span className={workspaceStyles.jvwStatusLabel}>
                      {result.valid ? "Valid JSON" : "Invalid JSON"}
                    </span>
                    {result.errors.length > 0 && (
                      <span className={workspaceStyles.jvwStatusCount}>
                        {result.errors.length} error{result.errors.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {result.valid && (
                    <div className={workspaceStyles.jvwStatusRight}>
                      <span className={workspaceStyles.jvwStatusStat}>{formatBytes(result.stats.size)}</span>
                      <span className={workspaceStyles.jvwStatusStat}>{result.stats.lines} lines</span>
                      <span className={workspaceStyles.jvwStatusStat}>Depth: {result.stats.depth}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Panel Switcher */}
              <div className={workspaceStyles.jvwMobileSwitcher}>
                <button
                  type="button"
                  className={`${workspaceStyles.jvwSwitcherTab}${mobilePanel === "input" ? " active" : ""}`}
                  onClick={goToInput}
                >
                  <i className="ti ti-code" />
                  Input JSON
                </button>
                <div className={workspaceStyles.jvwSwitcherDivider} />
                <button
                  type="button"
                  className={`${workspaceStyles.jvwSwitcherTab}${mobilePanel === "output" ? " active" : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-list-details" />
                  Results
                  {result && mobilePanel !== "output" && <span className={workspaceStyles.jvwReadyIndicator} />}
                </button>
              </div>

              {/* Body */}
              <div className={workspaceStyles.jvwBody}>
                {/* Input Panel */}
                <div
                  className={`${workspaceStyles.jvwPanel}${mobilePanel === "input" ? ` ${workspaceStyles.mobileVisible}` : ` ${workspaceStyles.mobileHidden}`}`}
                >
                  <div className={workspaceStyles.jvwPanelHeader}>
                    <div className={workspaceStyles.jvwPanelTitle}>
                      <i className="ti ti-braces" />
                      JSON Input
                    </div>
                    <div className={workspaceStyles.jvwPanelActions}>
                      {input && (
                        <>
                          <span className={workspaceStyles.jvwCharCount}>
                            {input.length.toLocaleString()} chars
                          </span>
                          <button
                            type="button"
                            className={`${workspaceStyles.jvwCopyBtn}${copiedKey === "input" ? " copied" : ""}`}
                            onClick={() => handleCopy(input, "input")}
                          >
                            <i className={`ti ${copiedKey === "input" ? "ti-check" : "ti-copy"}`} />
                          </button>
                          <button
                            type="button"
                            className={workspaceStyles.jvwClearBtn}
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
                    className={`${workspaceStyles.jvwTextarea}${result && !result.valid ? ` ${workspaceStyles.jvwTextareaError}` : ""}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    spellCheck={false}
                  />
                  {input && result && (
                    <div className={workspaceStyles.jvwMobileCta}>
                      <button type="button" className={workspaceStyles.jvwViewResultBtn} onClick={goToOutput}>
                        <i className="ti ti-list-details" />
                        View Validation Results
                        <i className="ti ti-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gutter */}
                <div className={workspaceStyles.jvwGutter}>
                  <div className={workspaceStyles.jvwGutterLine} />
                  <div className={workspaceStyles.jvwGutterIcon}>
                    <i className="ti ti-arrow-right" />
                  </div>
                  <div className={workspaceStyles.jvwGutterLine} />
                </div>

                {/* Output Panel */}
                <div
                  className={`${workspaceStyles.jvwPanel}${mobilePanel === "output" ? ` ${workspaceStyles.mobileVisible}` : ` ${workspaceStyles.mobileHidden}`}`}
                >
                  {!result && !input && (
                    <div className={workspaceStyles.jvwEmpty}>
                      <div className={workspaceStyles.jvwEmptyIcon}>
                        <i className="ti ti-braces" />
                      </div>
                      <h3 className={workspaceStyles.jvwEmptyTitle}>Validate JSON Syntax</h3>
                      <p className={workspaceStyles.jvwEmptyDescription}>
                        Paste JSON to check for syntax errors, structural issues, and security
                        concerns
                      </p>
                      <div className={workspaceStyles.jvwEmptySamples}>
                        {Object.entries(SAMPLE_TEMPLATES)
                          .slice(0, 2)
                          .map(([key, sample]) => (
                            <button
                              key={key}
                              type="button"
                              className={workspaceStyles.jvwEmptySampleBtn}
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
            <div className={workspaceStyles.jvwHistoryView}>
              {history.length === 0 ? (
                <div className={workspaceStyles.jvwTabEmpty}>
                  <div className={workspaceStyles.jvwTabEmptyIcon}>
                    <i className="ti ti-history" />
                  </div>
                  <h3 className={workspaceStyles.jvwTabEmptyTitle}>No History Yet</h3>
                  <p className={workspaceStyles.jvwTabEmptyDescription}>
                    Your validation history will appear here when auto-save is enabled.
                  </p>
                </div>
              ) : (
                <>
                  <div className={workspaceStyles.jvwHistoryHeader}>
                    <div className={workspaceStyles.jvwHistoryTitle}>
                      <i className="ti ti-history" />
                      Validation History
                      <span className={workspaceStyles.jvwHistoryCount}>{history.length}</span>
                    </div>
                    <button type="button" className={workspaceStyles.jvwActionBtn} onClick={clearHistory}>
                      <i className="ti ti-trash" />
                      Clear History
                    </button>
                  </div>
                  <div className={workspaceStyles.jvwHistoryList}>
                    {history.slice(0, 50).map((entry) => (
                      <div key={entry.id} className={workspaceStyles.jvwHistoryItem}>
                        <div className={workspaceStyles.jvwHistoryItemHeader}>
                          <div className={workspaceStyles.jvwHistoryItemInfo}>
                            <span className={workspaceStyles.jvwHistoryItemTitle}>{entry.title}</span>
                            <span className={workspaceStyles.jvwHistoryItemTime}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className={workspaceStyles.jvwHistoryItemMeta}>
                            <span
                              className={`${workspaceStyles.jvwHistoryBadge} ${entry.result.valid ? "valid" : "invalid"}`}
                            >
                              <i className={`ti ${entry.result.valid ? "ti-check" : "ti-x"}`} />
                              {entry.result.valid ? "Valid" : "Invalid"}
                            </span>
                            <span className={workspaceStyles.jvwHistoryStat}>
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
        <div className={workspaceStyles.jvwFooter}>
          <div className={workspaceStyles.jvwFooterInfo}>
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {result && (
            <div className={workspaceStyles.jvwFooterStats}>
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