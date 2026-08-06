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
} from "./ts/jsEngine";
import JSAnalysis from "./JSAnalysis";
import JSBatch from "./JSBatch";
import { useJSStore } from "./ts/jsStore";
import styles from "./style/Workspace.module.css";

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
      <div className={styles.jwRoot} ref={rootRef}>
        {/*  Chrome  */}
        <div className={styles.jwChrome}>
          <div className={styles.jwChromeLeft}>
            <div className={styles.jwTitle}>
              <div className={styles.jwTitleIcon}>
                <i className="ti ti-brand-javascript" />
              </div>
              JS Minifier
              <span className={styles.jwTitleBadge}>{options.mode}</span>
            </div>
          </div>
          <div className={styles.jwChromeRight}>
            {/* Mode quick-switcher */}
            <div className={styles.jwModePills}>
              {(["minify", "compress", "mangle"] as MinifyMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.jwModePill} ${options.mode === m ? "active" : ""}`}
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
              className={`${styles.jwSettingsBtn} ${showSettings ? "active" : ""}`}
              onClick={() => setShowSettings((s) => !s)}
            >
              <i className="ti ti-settings" />
              <span>Options</span>
            </button>
          </div>
        </div>

        {/*  Settings Panel  */}
        {showSettings && (
          <div className={styles.jwSettings}>
            <div className={styles.jwSettingsGrid}>
              <label className={styles.jwToggle}>
                <input
                  type="checkbox"
                  checked={options.removeComments}
                  onChange={(e) => setOptions((p) => ({ ...p, removeComments: e.target.checked }))}
                />
                <div className={styles.jwToggleTrack}>
                  <div className={styles.jwToggleThumb} />
                </div>
                <span>Remove Comments</span>
              </label>

              <label className={styles.jwToggle}>
                <input
                  type="checkbox"
                  checked={options.removeConsole}
                  onChange={(e) => setOptions((p) => ({ ...p, removeConsole: e.target.checked }))}
                />
                <div className={styles.jwToggleTrack}>
                  <div className={styles.jwToggleThumb} />
                </div>
                <span>Remove console.*</span>
              </label>

              <label className={styles.jwToggle}>
                <input
                  type="checkbox"
                  checked={options.removeDebugger}
                  onChange={(e) => setOptions((p) => ({ ...p, removeDebugger: e.target.checked }))}
                />
                <div className={styles.jwToggleTrack}>
                  <div className={styles.jwToggleThumb} />
                </div>
                <span>Remove debugger</span>
              </label>

              <label className={styles.jwToggle}>
                <input
                  type="checkbox"
                  checked={options.collapseWhitespace}
                  onChange={(e) =>
                    setOptions((p) => ({ ...p, collapseWhitespace: e.target.checked }))
                  }
                />
                <div className={styles.jwToggleTrack}>
                  <div className={styles.jwToggleThumb} />
                </div>
                <span>Collapse Whitespace</span>
              </label>

              <label className={styles.jwToggle}>
                <input
                  type="checkbox"
                  checked={options.mangle}
                  onChange={(e) => setOptions((p) => ({ ...p, mangle: e.target.checked }))}
                />
                <div className={styles.jwToggleTrack}>
                  <div className={styles.jwToggleThumb} />
                </div>
                <span>Mangle Variables</span>
              </label>

              <label className={styles.jwToggle}>
                <input
                  type="checkbox"
                  checked={options.deadCodeElimination}
                  onChange={(e) =>
                    setOptions((p) => ({ ...p, deadCodeElimination: e.target.checked }))
                  }
                />
                <div className={styles.jwToggleTrack}>
                  <div className={styles.jwToggleThumb} />
                </div>
                <span>Dead Code Elimination</span>
              </label>
            </div>
          </div>
        )}

        {/*  Tabs  */}
        <div className={styles.jwTabsBar}>
          <nav className={styles.jwTabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.jwTab} ${tabView === tab.id ? "active" : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.desc}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className={styles.jwTabBadge}>{history.length}</span>
                )}
                {tab.id === "analysis" && result && result.issues.length > 0 && (
                  <span className={styles.jwTabDot} />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Tab Content  */}
        <div className={styles.jwContent}>
          {/*  Minify Tab  */}
          {tabView === "minify" && (
            <div className={styles.jwMinifyView}>
              {/* Toolbar */}
              <div className={styles.jwToolbar}>
                <div className={styles.jwToolbarLeft}>
                  <span className={styles.jwToolbarLabel}>Samples:</span>
                  {Object.entries(SAMPLE_TEMPLATES).map(([key, s]) => (
                    <button
                      key={key}
                      type="button"
                      className={styles.jwSampleBtn}
                      onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                      title={s.description}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <div className={styles.jwToolbarRight}>
                  {result && (
                    <div className={styles.jwGzipBadge}>
                      <i className="ti ti-circle-filled" />~
                      {formatBytes(estimateGzipSize(result.output))} gzip
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile switcher */}
              <div className={styles.jwMobileSwitcher}>
                <button
                  type="button"
                  className={`${styles.jwSwTab} ${mobilePanel === "input" ? "active" : ""}`}
                  onClick={goToInput}
                >
                  <i className="ti ti-file-code" />
                  Original
                </button>
                <div className={styles.jwSwDivider} />
                <button
                  type="button"
                  className={`${styles.jwSwTab} ${mobilePanel === "output" ? "active" : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-file-zip" />
                  Minified
                  {result && mobilePanel !== "output" && <span className={styles.jwSwDot} />}
                </button>
              </div>

              {/* Body */}
              <div className={styles.jwBody}>
                {/* Input */}
                <div
                  className={`${styles.jwPanel} ${mobilePanel === "input" ? styles.mobVisible : styles.mobHidden}`}
                >
                  <div className={styles.jwPanelBar}>
                    <div className={styles.jwPanelLabel}>
                      <i className="ti ti-file-code" />
                      Original JavaScript
                    </div>
                    <div className={styles.jwPanelActions}>
                      {input && (
                        <>
                          <span className={styles.jwCharCount}>{input.length.toLocaleString()} ch</span>
                          <span className={styles.jwCharCount}>{input.split("\n").length} lines</span>
                        </>
                      )}
                      <button
                        type="button"
                        className={styles.jwIconBtn}
                        onClick={() => setInput("")}
                        disabled={!input}
                        title="Clear"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className={styles.jwTextarea}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JavaScript here…"
                    spellCheck={false}
                  />
                  {input && result && (
                    <div className={styles.jwMobCta}>
                      <button type="button" className={styles.jwCtaBtn} onClick={goToOutput}>
                        <i className="ti ti-file-zip" />
                        View Minified Output
                        <i className="ti ti-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gutter */}
                <div className={styles.jwGutter}>
                  <div className={styles.jwGutterLine} />
                  <div className={styles.jwGutterNode}>
                    <i className="ti ti-chevrons-right" />
                  </div>
                  <div className={styles.jwGutterLine} />
                </div>

                {/* Output */}
                <div
                  className={`${styles.jwPanel} ${mobilePanel === "output" ? styles.mobVisible : styles.mobHidden}`}
                >
                  <div className={styles.jwPanelBar}>
                    <div className={styles.jwPanelLabel}>
                      <i className="ti ti-file-zip" />
                      {options.mode === "minify"
                        ? "Minified"
                        : options.mode === "compress"
                          ? "Compressed"
                          : "Mangled"}{" "}
                      JavaScript
                    </div>
                    <div className={styles.jwPanelActions}>
                      {result && (
                        <button
                          type="button"
                          className={`${styles.jwCopyBtn} ${copiedKey === "out" ? "copied" : ""}`}
                          onClick={() => handleCopy(result.output, "out")}
                        >
                          <i className={`ti ${copiedKey === "out" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "out" ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>

                  {!result && (
                    <div className={styles.jwEmpty}>
                      <div className={styles.jwEmptyIcon}>
                        <i className="ti ti-brand-javascript" />
                      </div>
                      <h3 className={styles.jwEmptyTitle}>Minify JavaScript</h3>
                      <p className={styles.jwEmptyDesc}>
                        Paste code on the left, load a sample, or drop a file to reduce bundle size
                      </p>
                      <div className={styles.jwEmptySamples}>
                        {Object.entries(SAMPLE_TEMPLATES)
                          .slice(0, 2)
                          .map(([key, s]) => (
                            <button
                              key={key}
                              type="button"
                              className={styles.jwEmptySampleBtn}
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
                      <pre className={styles.jwOutput}>{result.output}</pre>

                      <div className={styles.jwStatsBar}>
                        <div className={styles.jwStat}>
                          <i className="ti ti-file" />
                          <span className={styles.jwStatLabel}>Original</span>
                          <span className={styles.jwStatValue}>
                            {formatBytes(result.stats.original)}
                          </span>
                        </div>
                        <div className={styles.jwStat}>
                          <i className="ti ti-file-zip" />
                          <span className={styles.jwStatLabel}>Minified</span>
                          <span className={styles.jwStatValue}>
                            {formatBytes(result.stats.minified)}
                          </span>
                        </div>
                        <div className={`${styles.jwStat} ${styles.jwStatHighlight}`}>
                          <i className="ti ti-trending-down" />
                          <span className={styles.jwStatLabel}>Saved</span>
                          <span className={`${styles.jwStatValue} ${styles.jwStatValueGood}`}>
                            {formatBytes(result.stats.savings)} ({result.stats.savingsPercent}%)
                          </span>
                        </div>
                        <div className={styles.jwStat}>
                          <i className="ti ti-layers" />
                          <span className={styles.jwStatLabel}>Lines</span>
                          <span className={styles.jwStatValue}>
                            {result.stats.originalLines} → {result.stats.minifiedLines}
                          </span>
                        </div>
                        <button type="button" className={styles.jwDownloadBtn} onClick={handleDownload}>
                          <i className="ti ti-download" />
                          Download .js
                        </button>
                      </div>

                      {/* Mobile actions */}
                      <div className={styles.jwMobActions}>
                        <button
                          type="button"
                          className={`${styles.jwMobBtn} ${copiedKey === "mob" ? "copied" : ""}`}
                          onClick={() => handleCopy(result.output, "mob")}
                        >
                          <i className={`ti ${copiedKey === "mob" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "mob" ? "Copied!" : "Copy"}
                        </button>
                        <button type="button" className={styles.jwMobBtn} onClick={handleDownload}>
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
              <div className={styles.jwTabEmpty}>
                <div className={styles.jwTabEmptyIcon}>
                  <i className="ti ti-chart-bar" />
                </div>
                <h3>Code Analysis</h3>
                <p>
                  Add JavaScript code to see detailed analysis, code quality metrics, and linting
                  results.
                </p>
                <button
                  type="button"
                  className={styles.jwTabEmptyBtn}
                  onClick={() => setTabView("minify")}
                >
                  Go to Minifier
                </button>
              </div>
            ))}

          {/*  History Tab  */}
          {tabView === "history" && (
            <div className={styles.jwHistory}>
              {history.length === 0 ? (
                <div className={styles.jwTabEmpty}>
                  <div className={styles.jwTabEmptyIcon}>
                    <i className="ti ti-history" />
                  </div>
                  <h3>No History Yet</h3>
                  <p>Your minification history will appear here after you download a result.</p>
                </div>
              ) : (
                <>
                  <div className={styles.jwHistoryHeader}>
                    <div className={styles.jwHistoryTitle}>
                      <i className="ti ti-history" />
                      History
                      <span className={styles.jwHistoryCount}>{history.length}</span>
                    </div>
                    <button type="button" className={styles.jwGhostBtn} onClick={clearHistory}>
                      <i className="ti ti-trash" />
                      Clear
                    </button>
                  </div>
                  <div className={styles.jwHistoryList}>
                    {history.map((entry) => (
                      <div key={entry.id} className={styles.jwHistoryItem}>
                        <div className={styles.jwHistoryItemLeft}>
                          <div className={styles.jwHistoryItemIcon}>
                            <i className="ti ti-brand-javascript" />
                          </div>
                          <div>
                            <div className={styles.jwHistoryItemTitle}>{entry.title}</div>
                            <div className={styles.jwHistoryItemMeta}>
                              {new Date(entry.timestamp).toLocaleString()} ·{" "}
                              {formatBytes(entry.result.stats.original)} →{" "}
                              {formatBytes(entry.result.stats.minified)}
                            </div>
                          </div>
                        </div>
                        <div className={styles.jwHistoryItemRight}>
                          <span className={styles.jwHistoryMode}>{entry.options.mode}</span>
                          <span className={styles.jwHistorySavings}>
                            -{entry.result.stats.savingsPercent}%
                          </span>
                          <button
                            type="button"
                            className={styles.jwIconBtn}
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
        <div className={styles.jwFooter}>
          <div className={styles.jwFooterLeft}>
            <i className="ti ti-shield-lock" />
            <span>Runs entirely in your browser — nothing is sent to any server.</span>
          </div>
          {result && (
            <div className={styles.jwFooterRight}>
              <span>{result.stats.functions} functions</span>
              <span>·</span>
              <span>{result.stats.variables} variables</span>
              <span>·</span>
              <span className={result.analysis.syntaxValid ? styles.jwValid : styles.jwInvalid}>
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