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
} from "./ts/htmlEngine";
import HTMLValidation from "./HTMLValidation";
import HTMLPreview from "./HTMLPreview";
import HTMLBatch from "./HTMLBatch";
import { useHTMLStore } from "./ts/htmlStore";
import styles from "./style/Workspace.module.css";

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
      <div className={styles.hfRoot} ref={rootRef}>
        {/* ── Top Chrome ── */}
        <div className={styles.hfChrome}>
          <div className={styles.hfChromeLeft}>
            <div className={styles.hfTitle}>
              <i className="ti ti-brand-html5" />
              HTML Formatter
            </div>
          </div>
          <div className={styles.hfChromeRight}>
            <button
              type="button"
              className={styles.hfChromeBtn}
              onClick={() => setShowSettings((s) => !s)}
            >
              <i className="ti ti-settings" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        {showSettings && (
          <div className={styles.hfSettings}>
            <div className={styles.hfSettingsRow}>
              <div className={styles.hfSettingGroup}>
                <label className={styles.hfSettingLabel}>Mode</label>
                <div className={styles.hfPillGroup}>
                  {(["format", "minify", "compress"] as FormattingMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`${styles.hfPill}${options.mode === m ? ` ${styles.active}` : ""}`}
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
                  <div className={styles.hfSettingGroup}>
                    <label className={styles.hfSettingLabel}>Indent Style</label>
                    <select
                      className={styles.hfSelect}
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

                  <div className={styles.hfSettingGroup}>
                    <label className={styles.hfSettingCheckbox}>
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

                  <div className={styles.hfSettingGroup}>
                    <label className={styles.hfSettingCheckbox}>
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

              <div className={styles.hfSettingGroup}>
                <label className={styles.hfSettingCheckbox}>
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
                <div className={styles.hfSettingGroup}>
                  <label className={styles.hfSettingCheckbox}>
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
        <div className={styles.hfTabsBar}>
          <nav className={styles.hfTabs}>
            {TAB_VIEWS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.hfTab}${tabView === tab.id ? ` ${styles.active}` : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.description}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className={styles.hfTabBadge}>{history.length}</span>
                )}
                {tab.id === "validation" && result && !result.validation.isValid && (
                  <span className={styles.hfTabIndicator} />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ── */}
        <div className={styles.hfTabContent}>
          {/* Single Tab */}
          {tabView === "single" && (
            <div className={styles.hfSingleView}>
              {/* Command Bar */}
              <div className={styles.hfCommandBar}>
                <div className={styles.hfCommandLeft}>
                  <div className={styles.hfSamples}>
                    <span className={styles.hfSamplesLabel}>Examples:</span>
                    {Object.entries(SAMPLE_TEMPLATES).map(([key, sample]) => (
                      <button
                        key={key}
                        type="button"
                        className={styles.hfSampleBtn}
                        onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                        title={sample.description}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.hfCommandRight}>
                  {result && (
                    <div className={styles.hfExportChips}>
                      <span className={styles.hfExportLabel}>Export:</span>
                      <button
                        type="button"
                        className={styles.hfExportChip}
                        onClick={() => handleDownload("html")}
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        className={styles.hfExportChip}
                        onClick={() => handleDownload("markdown")}
                      >
                        MD
                      </button>
                      <button
                        type="button"
                        className={styles.hfExportChip}
                        onClick={() => handleDownload("txt")}
                      >
                        TXT
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Panel Switcher */}
              <div className={styles.hfMobileSwitcher}>
                <button
                  type="button"
                  className={`${styles.hfSwitcherTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
                  onClick={goToInput}
                >
                  <i className="ti ti-code" />
                  Input HTML
                </button>
                <div className={styles.hfSwitcherDivider} />
                <button
                  type="button"
                  className={`${styles.hfSwitcherTab}${mobilePanel === "output" ? ` ${styles.active}` : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-sparkles" />
                  Result
                  {result && mobilePanel !== "output" && <span className={styles.hfReadyIndicator} />}
                </button>
              </div>

              {/* Body */}
              <div className={styles.hfBody}>
                {/* Input Panel */}
                <div
                  className={`${styles.hfPanel}${mobilePanel === "input" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
                >
                  <div className={styles.hfPanelHeader}>
                    <div className={styles.hfPanelTitle}>
                      <i className="ti ti-code" />
                      Input HTML
                    </div>
                    <div className={styles.hfPanelActions}>
                      {input && (
                        <span className={styles.hfCharCount}>{input.length.toLocaleString()} chars</span>
                      )}
                      <button
                        type="button"
                        className={styles.hfPanelBtn}
                        onClick={clearAll}
                        disabled={!input}
                        title="Clear input"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className={styles.hfTextarea}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your HTML here..."
                    spellCheck={false}
                  />
                  {input && result && (
                    <div className={styles.hfMobileCta}>
                      <button type="button" className={styles.hfViewResultBtn} onClick={goToOutput}>
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
                <div className={styles.hfGutter}>
                  <div className={styles.hfGutterLine} />
                  <div className={styles.hfGutterIcon}>
                    <i className="ti ti-arrow-right" />
                  </div>
                  <div className={styles.hfGutterLine} />
                </div>

                {/* Output Panel */}
                <div
                  className={`${styles.hfPanel}${mobilePanel === "output" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
                >
                  <div className={styles.hfPanelHeader}>
                    <div className={styles.hfPanelTitle}>
                      <i className="ti ti-sparkles" />
                      {options.mode === "format"
                        ? "Formatted"
                        : options.mode === "minify"
                          ? "Minified"
                          : "Compressed"}{" "}
                      HTML
                    </div>
                    <div className={styles.hfPanelActions}>
                      {result && (
                        <button
                          type="button"
                          className={`${styles.hfCopyBtn}${copiedKey === "output" ? ` ${styles.copied}` : ""}`}
                          onClick={() => handleCopy(result.output, "output")}
                        >
                          <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "output" ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>

                  {!result && !input && (
                    <div className={styles.hfEmpty}>
                      <div className={styles.hfEmptyIcon}>
                        <i className="ti ti-brand-html5" />
                      </div>
                      <h3 className={styles.hfEmptyTitle}>Format or Minify HTML</h3>
                      <p className={styles.hfEmptyDescription}>
                        Paste HTML code on the left or try a sample to get started
                      </p>
                      <div className={styles.hfEmptySamples}>
                        {Object.entries(SAMPLE_TEMPLATES)
                          .slice(0, 2)
                          .map(([key, sample]) => (
                            <button
                              key={key}
                              type="button"
                              className={styles.hfEmptySampleBtn}
                              onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                            >
                              Try {sample.name}
                            </button>
                          ))}
                      </div>
                      <button type="button" className={styles.hfGoInputBtn} onClick={goToInput}>
                        <i className="ti ti-code" />
                        Go to input
                      </button>
                    </div>
                  )}

                  {result && (
                    <>
                      <pre className={styles.hfOutput}>{result.output}</pre>
                      <div className={styles.hfStatsBar}>
                        <div className={styles.hfStat}>
                          <span className={styles.hfStatLabel}>Original</span>
                          <span className={styles.hfStatValue}>
                            {formatBytes(result.stats.original)}
                          </span>
                        </div>
                        <div className={styles.hfStat}>
                          <span className={styles.hfStatLabel}>Processed</span>
                          <span className={styles.hfStatValue}>
                            {formatBytes(result.stats.processed)}
                          </span>
                        </div>
                        <div className={styles.hfStat}>
                          <span className={styles.hfStatLabel}>
                            {result.stats.savings > 0 ? "Saved" : "Added"}
                          </span>
                          <span
                            className={`${styles.hfStatValue} ${result.stats.savings > 0 ? styles.success : result.stats.savings < 0 ? styles.warning : ""}`}
                          >
                            {formatBytes(Math.abs(result.stats.savings))}
                            {result.stats.savingsPercent !== 0 && (
                              <span className={styles.hfStatPercent}>
                                ({Math.abs(result.stats.savingsPercent)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className={styles.hfStat}>
                          <span className={styles.hfStatLabel}>Elements</span>
                          <span className={styles.hfStatValue}>
                            {result.stats.elements.toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.hfDownloadBtn}
                          onClick={() => handleDownload("html")}
                        >
                          <i className="ti ti-download" />
                          Download
                        </button>
                      </div>
                    </>
                  )}

                  {result && (
                    <div className={styles.hfMobileActions}>
                      <button
                        type="button"
                        className={`${styles.hfMobileActionBtn}${copiedKey === "mobile" ? ` ${styles.copied}` : ""}`}
                        onClick={() => handleCopy(result.output, "mobile")}
                      >
                        <i className={`ti ${copiedKey === "mobile" ? "ti-check" : "ti-copy"}`} />
                        {copiedKey === "mobile" ? "Copied" : "Copy Result"}
                      </button>
                      <button
                        type="button"
                        className={styles.hfMobileActionBtn}
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
              <div className={styles.hfTabEmpty}>
                <div className={styles.hfTabEmptyIcon}>
                  <i className="ti ti-shield-check" />
                </div>
                <h3 className={styles.hfTabEmptyTitle}>HTML Validation</h3>
                <p className={styles.hfTabEmptyDescription}>
                  Add HTML code to see validation results, accessibility score, and best practice
                  recommendations.
                </p>
                <button
                  type="button"
                  className={styles.hfTabEmptyBtn}
                  onClick={() => setTabView("single")}
                >
                  Go to formatter
                </button>
              </div>
            ))}

          {/* ✅ Preview Tab — key change here */}
          {tabView === "preview" && (
            <div className={styles.hfPreviewHost}>
              {input.trim() ? (
                <HTMLPreview html={input} />
              ) : (
                <div className={styles.hfTabEmpty}>
                  <div className={styles.hfTabEmptyIcon}>
                    <i className="ti ti-eye" />
                  </div>
                  <h3 className={styles.hfTabEmptyTitle}>Live Preview</h3>
                  <p className={styles.hfTabEmptyDescription}>
                    Add HTML code to see a live rendered preview with responsive viewport controls.
                  </p>
                  <button
                    type="button"
                    className={styles.hfTabEmptyBtn}
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
            <div className={styles.hfHistoryView}>
              {history.length === 0 ? (
                <div className={styles.hfTabEmpty}>
                  <div className={styles.hfTabEmptyIcon}>
                    <i className="ti ti-history" />
                  </div>
                  <h3 className={styles.hfTabEmptyTitle}>No History Yet</h3>
                  <p className={styles.hfTabEmptyDescription}>
                    Your formatting history will appear here when auto-save is enabled.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.hfHistoryHeader}>
                    <div className={styles.hfHistoryTitle}>
                      <i className="ti ti-history" />
                      Formatting History
                      <span className={styles.hfHistoryCount}>{history.length}</span>
                    </div>
                    <button type="button" className={styles.hfActionBtn} onClick={clearHistory}>
                      <i className="ti ti-trash" />
                      Clear History
                    </button>
                  </div>
                  <div className={styles.hfHistoryList}>
                    {history.slice(0, 50).map((entry) => (
                      <div key={entry.id} className={styles.hfHistoryItem}>
                        <div className={styles.hfHistoryItemHeader}>
                          <div className={styles.hfHistoryItemInfo}>
                            <span className={styles.hfHistoryItemTitle}>{entry.title}</span>
                            <span className={styles.hfHistoryItemTime}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className={styles.hfHistoryItemMeta}>
                            <span className={styles.hfHistoryModeBadge}>{entry.options.mode}</span>
                            {entry.result.stats.savings !== 0 && (
                              <span
                                className={`${styles.hfHistorySavings} ${styles[entry.result.stats.savings > 0 ? "positive" : "negative"]}`}
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
        <div className={styles.hfFooter}>
          <div className={styles.hfFooterInfo}>
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {result && (
            <div className={styles.hfFooterStats}>
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