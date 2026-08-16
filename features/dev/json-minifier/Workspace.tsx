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
} from "./ts/jsonEngine";
import JSONAnalysis from "./JSONAnalysis";
import JSONBatch from "./JSONBatch";
import { useJSONStore } from "./ts/jsonStore";
import workspaceStyles from "./style/Workspace.module.css";

type TabView = "process" | "batch" | "analysis" | "transform" | "history";

const TABS: { id: TabView; label: string; icon: string; desc: string }[] = [
  {
    id: "process",
    label: "Process",
    icon: "ti-braces",
    desc: "Minify or beautify JSON",
  },
  { id: "batch", label: "Batch", icon: "ti-files", desc: "Process multiple files" },
  {
    id: "analysis",
    label: "Analysis",
    icon: "ti-chart-bar",
    desc: "JSON analysis & issues",
  },
  {
    id: "transform",
    label: "Transform",
    icon: "ti-transform",
    desc: "Convert to CSV/YAML",
  },
  { id: "history", label: "History", icon: "ti-history", desc: "Past operations" },
];

const MODE_CONFIG: Record<ProcessMode, { color: string; icon: string }> = {
  minify: { color: "#10b981", icon: "ti-file-zip" },
  beautify: { color: "#3b82f6", icon: "ti-text-wrap" },
  sort: { color: "#8b5cf6", icon: "ti-sort-ascending" },
  validate: { color: "#f59e0b", icon: "ti-shield-check" },
};

export default function JSONWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [tabView, setTabView] = useState<TabView>("process");
  const [options, setOptions] = useState<ProcessOptions>(DEFAULT_OPTIONS);
  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [jsonPath, setJsonPath] = useState("");
  const [pathResult, setPathResult] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const { history, settings, addToHistory, clearHistory } = useJSONStore();

  const { result, error } = useMemo(() => {
    if (!input.trim()) {
      return { result: null, error: "" };
    }
    try {
      const r = processJSON(input, options);
      return { result: r, error: "" };
    } catch (e: any) {
      return { result: null, error: e?.message || "Invalid JSON" };
    }
  }, [input, options]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
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
  }, []);

  const goToOutput = useCallback(() => {
    setMobilePanel("output");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const goToInput = useCallback(() => {
    setMobilePanel("input");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const restoreFromHistory = useCallback((entryInput: string, entryOptions: ProcessOptions) => {
    setInput(entryInput);
    setOptions(entryOptions);
    setTabView("process");
  }, []);

  return (
    <>
      <div className={workspaceStyles.jwRoot} ref={rootRef}>
        <div className={workspaceStyles.jwChrome}>
          <div className={workspaceStyles.jwChromeLeft}>
            <div className={workspaceStyles.jwTitle}>
              <div
                className={workspaceStyles.jwTitleIcon}
                style={{
                  background: MODE_CONFIG[options.mode].color + "20",
                  color: MODE_CONFIG[options.mode].color,
                }}
              >
                <i className="ti ti-braces" />
              </div>
              JSON Tools
              <span className={workspaceStyles.jwTitleBadge}>{options.mode}</span>
            </div>
          </div>
          <div className={workspaceStyles.jwChromeRight}>
            <div className={workspaceStyles.jwModePills}>
              {(["minify", "beautify", "sort", "validate"] as ProcessMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${workspaceStyles.jwModePill} ${options.mode === m ? workspaceStyles.active : ""}`}
                  style={
                    options.mode === m
                      ? {
                        background: MODE_CONFIG[m].color + "20",
                        color: MODE_CONFIG[m].color,
                        borderColor: MODE_CONFIG[m].color + "40",
                      }
                      : {}
                  }
                  onClick={() => setOptions((p) => ({ ...p, mode: m }))}
                >
                  <i className={`ti ${MODE_CONFIG[m].icon}`} />
                  <span className={workspaceStyles.jwModeLabel}>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`${workspaceStyles.jwSettingsBtn} ${showSettings ? workspaceStyles.active : ""}`}
              onClick={() => setShowSettings((s) => !s)}
              aria-label="Toggle options"
              aria-expanded={showSettings}
            >
              <i className="ti ti-settings" />
              <span>Options</span>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className={workspaceStyles.jwSettings}>
            <div className={workspaceStyles.jwSettingsGrid}>
              {(options.mode === "beautify" ||
                options.mode === "sort" ||
                options.mode === "validate") && (
                  <div className={workspaceStyles.jwSettingGroup}>
                    <label className={workspaceStyles.jwSettingLabel} htmlFor="jw-indent-style">
                      Indent Style
                    </label>
                    <select
                      id="jw-indent-style"
                      className={workspaceStyles.jwSelect}
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

              <div className={workspaceStyles.jwSettingGroup}>
                <label className={workspaceStyles.jwSettingLabel} htmlFor="jw-sort-order">
                  Sort Order
                </label>
                <select
                  id="jw-sort-order"
                  className={workspaceStyles.jwSelect}
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
                <label key={key} className={workspaceStyles.jwToggle}>
                  <input
                    type="checkbox"
                    checked={options[key as keyof ProcessOptions] as boolean}
                    onChange={(e) => setOptions((p) => ({ ...p, [key]: e.target.checked }))}
                  />
                  <div className={workspaceStyles.jwToggleTrack}>
                    <div className={workspaceStyles.jwToggleThumb} />
                  </div>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={workspaceStyles.jwTabsBar}>
          <nav className={workspaceStyles.jwTabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${workspaceStyles.jwTab} ${tabView === tab.id ? workspaceStyles.active : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.desc}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && history.length > 0 && (
                  <span className={workspaceStyles.jwTabBadge}>{history.length}</span>
                )}
                {tab.id === "analysis" && result && result.issues.length > 0 && (
                  <span className={workspaceStyles.jwTabDot} />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className={workspaceStyles.jwContent}>
          {tabView === "process" && (
            <div className={workspaceStyles.jwProcessView}>
              <div className={workspaceStyles.jwToolbar}>
                <div className={workspaceStyles.jwToolbarLeft}>
                  <span className={workspaceStyles.jwToolbarLabel}>Samples:</span>
                  {Object.entries(SAMPLE_TEMPLATES).map(([key, s]) => (
                    <button
                      key={key}
                      type="button"
                      className={workspaceStyles.jwSampleBtn}
                      onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                      title={s.description}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <div className={workspaceStyles.jwToolbarRight}>
                  {result && (
                    <div className={workspaceStyles.jwExportChips}>
                      <span className={workspaceStyles.jwExportLabel}>Export:</span>
                      <button
                        type="button"
                        className={workspaceStyles.jwExportChip}
                        onClick={() => handleDownload(result.output, "json", "application/json")}
                      >
                        JSON
                      </button>
                      <button
                        type="button"
                        className={workspaceStyles.jwExportChip}
                        onClick={() => {
                          try {
                            const csv = convertToCSV(JSON.parse(input));
                            handleDownload(csv, "csv", "text/csv");
                          } catch {
                            return;
                          }
                        }}
                      >
                        CSV
                      </button>
                      <button
                        type="button"
                        className={workspaceStyles.jwExportChip}
                        onClick={() => {
                          try {
                            const yaml = convertToYAML(JSON.parse(input));
                            handleDownload(yaml, "yaml", "text/yaml");
                          } catch {
                            return;
                          }
                        }}
                      >
                        YAML
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={workspaceStyles.jwMobileSwitcher}>
                <button
                  type="button"
                  className={`${workspaceStyles.jwSwTab} ${mobilePanel === "input" ? workspaceStyles.active : ""}`}
                  onClick={goToInput}
                >
                  <i className="ti ti-braces" />
                  Input JSON
                </button>
                <div className={workspaceStyles.jwSwDivider} />
                <button
                  type="button"
                  className={`${workspaceStyles.jwSwTab} ${mobilePanel === "output" ? workspaceStyles.active : ""}`}
                  onClick={goToOutput}
                >
                  <i className="ti ti-sparkles" />
                  Result
                  {result && mobilePanel !== "output" && <span className={workspaceStyles.jwSwDot} />}
                </button>
              </div>

              <div className={workspaceStyles.jwBody}>
                <div
                  className={`${workspaceStyles.jwPanel} ${mobilePanel === "input" ? workspaceStyles.mobVisible : workspaceStyles.mobHidden}`}
                >
                  <div className={workspaceStyles.jwPanelBar}>
                    <div className={workspaceStyles.jwPanelLabel}>
                      <i className="ti ti-braces" />
                      Input JSON
                    </div>
                    <div className={workspaceStyles.jwPanelActions}>
                      {input && (
                        <>
                          <span className={workspaceStyles.jwCharCount}>{input.length.toLocaleString()} ch</span>
                          {error ? (
                            <span className={workspaceStyles.jwErrorBadge}>
                              <i className="ti ti-alert-circle" /> Invalid
                            </span>
                          ) : (
                            result && (
                              <span className={workspaceStyles.jwValidBadge}>
                                <i className="ti ti-check" /> Valid
                              </span>
                            )
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        className={workspaceStyles.jwIconBtn}
                        onClick={() => setInput("")}
                        disabled={!input}
                        title="Clear"
                        aria-label="Clear input"
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className={`${workspaceStyles.jwTextarea} ${error ? workspaceStyles.jwTextareaError : ""}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JSON here…"
                    spellCheck={false}
                    aria-label="JSON input"
                  />
                  {error && (
                    <div className={workspaceStyles.jwErrorBanner}>
                      <i className="ti ti-alert-triangle" />
                      <span>{error}</span>
                    </div>
                  )}
                  {input && result && (
                    <div className={workspaceStyles.jwMobCta}>
                      <button type="button" className={workspaceStyles.jwCtaBtn} onClick={goToOutput}>
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

                <div className={workspaceStyles.jwGutter}>
                  <div className={workspaceStyles.jwGutterLine} />
                  <div className={workspaceStyles.jwGutterNode}>
                    <i
                      className={`ti ${MODE_CONFIG[options.mode].icon}`}
                      style={{ color: MODE_CONFIG[options.mode].color }}
                    />
                  </div>
                  <div className={workspaceStyles.jwGutterLine} />
                </div>

                <div
                  className={`${workspaceStyles.jwPanel} ${mobilePanel === "output" ? workspaceStyles.mobVisible : workspaceStyles.mobHidden}`}
                >
                  <div className={workspaceStyles.jwPanelBar}>
                    <div className={workspaceStyles.jwPanelLabel}>
                      <i className={`ti ${MODE_CONFIG[options.mode].icon}`} />
                      {options.mode === "minify"
                        ? "Minified"
                        : options.mode === "beautify"
                          ? "Beautified"
                          : options.mode === "sort"
                            ? "Sorted"
                            : "Validated"}{" "}
                      JSON
                    </div>
                    <div className={workspaceStyles.jwPanelActions}>
                      {result && (
                        <button
                          type="button"
                          className={`${workspaceStyles.jwCopyBtn} ${copiedKey === "out" ? workspaceStyles.copied : ""}`}
                          onClick={() => handleCopy(result.output, "out")}
                        >
                          <i className={`ti ${copiedKey === "out" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "out" ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>

                  {!result && !error && (
                    <div className={workspaceStyles.jwEmpty}>
                      <div className={workspaceStyles.jwEmptyIcon}>
                        <i className="ti ti-braces" />
                      </div>
                      <h3 className={workspaceStyles.jwEmptyTitle}>JSON Tools</h3>
                      <p className={workspaceStyles.jwEmptyDesc}>
                        Paste JSON on the left, load a sample, or drop a file to get started
                      </p>
                      <div className={workspaceStyles.jwEmptySamples}>
                        {Object.entries(SAMPLE_TEMPLATES)
                          .slice(0, 2)
                          .map(([key, s]) => (
                            <button
                              key={key}
                              type="button"
                              className={workspaceStyles.jwEmptySampleBtn}
                              onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                            >
                              Try {s.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {!result && error && (
                    <div className={workspaceStyles.jwEmpty}>
                      <div className={`${workspaceStyles.jwEmptyIcon} ${workspaceStyles.jwEmptyIconError}`}>
                        <i className="ti ti-alert-triangle" />
                      </div>
                      <h3 className={workspaceStyles.jwEmptyTitle}>Invalid JSON</h3>
                      <p className={workspaceStyles.jwEmptyDesc}>{error}</p>
                    </div>
                  )}

                  {result && (
                    <>
                      <pre className={workspaceStyles.jwOutput}>{result.output}</pre>

                      <div className={workspaceStyles.jwStatsBar}>
                        <div className={workspaceStyles.jwStat}>
                          <i className="ti ti-file" />
                          <span className={workspaceStyles.jwStatLabel}>Original</span>
                          <span className={workspaceStyles.jwStatValue}>
                            {formatBytes(result.stats.original)}
                          </span>
                        </div>
                        <div className={workspaceStyles.jwStat}>
                          <i className="ti ti-sparkles" />
                          <span className={workspaceStyles.jwStatLabel}>Result</span>
                          <span className={workspaceStyles.jwStatValue}>
                            {formatBytes(result.stats.processed)}
                          </span>
                        </div>
                        {result.stats.savings !== 0 && (
                          <div
                            className={`${workspaceStyles.jwStat} ${workspaceStyles.jwStatHighlight} ${result.stats.savings > 0 ? workspaceStyles.good : workspaceStyles.warn}`}
                          >
                            <i
                              className={`ti ${result.stats.savings > 0 ? "ti-trending-down" : "ti-trending-up"}`}
                            />
                            <span className={workspaceStyles.jwStatLabel}>
                              {result.stats.savings > 0 ? "Saved" : "Added"}
                            </span>
                            <span
                              className={`${workspaceStyles.jwStatValue} ${result.stats.savings > 0 ? workspaceStyles.good : workspaceStyles.warn}`}
                            >
                              {formatBytes(Math.abs(result.stats.savings))} (
                              {Math.abs(result.stats.savingsPercent)}%)
                            </span>
                          </div>
                        )}
                        <div className={workspaceStyles.jwStat}>
                          <i className="ti ti-key" />
                          <span className={workspaceStyles.jwStatLabel}>Keys</span>
                          <span className={workspaceStyles.jwStatValue}>{result.stats.keys}</span>
                        </div>
                        <div className={workspaceStyles.jwStat}>
                          <i className="ti ti-layers" />
                          <span className={workspaceStyles.jwStatLabel}>Depth</span>
                          <span className={workspaceStyles.jwStatValue}>{result.stats.depth}</span>
                        </div>
                        <button
                          type="button"
                          className={workspaceStyles.jwDownloadBtn}
                          onClick={() => handleDownload(result.output, "json", "application/json")}
                        >
                          <i className="ti ti-download" />
                          Download .json
                        </button>
                      </div>

                      <div className={workspaceStyles.jwMobActions}>
                        <button
                          type="button"
                          className={`${workspaceStyles.jwMobBtn} ${copiedKey === "mob" ? workspaceStyles.copied : ""}`}
                          onClick={() => handleCopy(result.output, "mob")}
                        >
                          <i className={`ti ${copiedKey === "mob" ? "ti-check" : "ti-copy"}`} />
                          {copiedKey === "mob" ? "Copied!" : "Copy"}
                        </button>
                        <button
                          type="button"
                          className={workspaceStyles.jwMobBtn}
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

          {tabView === "batch" && <JSONBatch options={options} />}

          {tabView === "analysis" &&
            (result ? (
              <JSONAnalysis
                analysis={result.analysis}
                issues={result.issues}
                stats={result.stats}
              />
            ) : (
              <div className={workspaceStyles.jwTabEmpty}>
                <div className={workspaceStyles.jwTabEmptyIcon}>
                  <i className="ti ti-chart-bar" />
                </div>
                <h3>JSON Analysis</h3>
                <p>
                  Add valid JSON to see structure analysis, type distribution, schema inference, and
                  issue detection.
                </p>
                <button
                  type="button"
                  className={workspaceStyles.jwTabEmptyBtn}
                  onClick={() => setTabView("process")}
                >
                  Go to Processor
                </button>
              </div>
            ))}

          {tabView === "transform" && (
            <div className={workspaceStyles.jwTransformView}>
              <div className={workspaceStyles.jwTransformHeader}>
                <div className={workspaceStyles.jwTransformTitle}>
                  <i className="ti ti-transform" />
                  Transform & Query
                </div>
              </div>

              <div className={workspaceStyles.jwTransformSection}>
                <div className={workspaceStyles.jwTransformSectionTitle}>
                  <i className="ti ti-search" />
                  JSONPath Query
                </div>
                <div className={workspaceStyles.jwJsonpathRow}>
                  <input
                    type="text"
                    className={workspaceStyles.jwJsonpathInput}
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                    placeholder="e.g. $.data.users[0].name"
                    spellCheck={false}
                    aria-label="JSONPath query"
                    onKeyDown={(e) => e.key === "Enter" && runJsonPath()}
                  />
                  <button
                    type="button"
                    className={workspaceStyles.jwJsonpathBtn}
                    onClick={runJsonPath}
                    disabled={!input.trim() || !jsonPath.trim()}
                  >
                    <i className="ti ti-player-play" />
                    Run
                  </button>
                </div>
                {pathResult && (
                  <div className={workspaceStyles.jwJsonpathResult}>
                    <div className={workspaceStyles.jwJsonpathResultHeader}>
                      <span>Result</span>
                      <button
                        type="button"
                        className={`${workspaceStyles.jwCopyBtn} ${copiedKey === "path" ? workspaceStyles.copied : ""}`}
                        onClick={() => handleCopy(pathResult, "path")}
                      >
                        <i className={`ti ${copiedKey === "path" ? "ti-check" : "ti-copy"}`} />
                        {copiedKey === "path" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className={workspaceStyles.jwJsonpathPre}>{pathResult}</pre>
                  </div>
                )}
              </div>

              <div className={workspaceStyles.jwTransformSection}>
                <div className={workspaceStyles.jwTransformSectionTitle}>
                  <i className="ti ti-arrows-exchange" />
                  Convert Format
                </div>
                <div className={workspaceStyles.jwConvertGrid}>
                  <button
                    type="button"
                    className={workspaceStyles.jwConvertCard}
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      try {
                        const csv = convertToCSV(JSON.parse(input));
                        handleDownload(csv, "csv", "text/csv");
                      } catch {
                        return;
                      }
                    }}
                  >
                    <div
                      className={workspaceStyles.jwConvertCardIcon}
                      style={{ background: "#eff6ff", color: "#2563eb" }}
                    >
                      <i className="ti ti-table" />
                    </div>
                    <div className={workspaceStyles.jwConvertCardLabel}>CSV</div>
                    <div className={workspaceStyles.jwConvertCardDesc}>Export as comma-separated values</div>
                    <div className={workspaceStyles.jwConvertCardAction}>
                      <i className="ti ti-download" />
                      Download CSV
                    </div>
                  </button>

                  <button
                    type="button"
                    className={workspaceStyles.jwConvertCard}
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      try {
                        const yaml = convertToYAML(JSON.parse(input));
                        handleDownload(yaml, "yaml", "text/yaml");
                      } catch {
                        return;
                      }
                    }}
                  >
                    <div
                      className={workspaceStyles.jwConvertCardIcon}
                      style={{ background: "#faf5ff", color: "#7c3aed" }}
                    >
                      <i className="ti ti-file-code" />
                    </div>
                    <div className={workspaceStyles.jwConvertCardLabel}>YAML</div>
                    <div className={workspaceStyles.jwConvertCardDesc}>Convert to human-readable YAML</div>
                    <div className={workspaceStyles.jwConvertCardAction}>
                      <i className="ti ti-download" />
                      Download YAML
                    </div>
                  </button>

                  <button
                    type="button"
                    className={workspaceStyles.jwConvertCard}
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      handleCopy(result.output, "json-copy");
                    }}
                  >
                    <div
                      className={workspaceStyles.jwConvertCardIcon}
                      style={{ background: "#f0fdf4", color: "#16a34a" }}
                    >
                      <i className="ti ti-copy" />
                    </div>
                    <div className={workspaceStyles.jwConvertCardLabel}>Copy JSON</div>
                    <div className={workspaceStyles.jwConvertCardDesc}>Copy processed JSON to clipboard</div>
                    <div className={workspaceStyles.jwConvertCardAction}>
                      <i className={`ti ${copiedKey === "json-copy" ? "ti-check" : "ti-copy"}`} />
                      {copiedKey === "json-copy" ? "Copied!" : "Copy"}
                    </div>
                  </button>

                  <button
                    type="button"
                    className={workspaceStyles.jwConvertCard}
                    disabled={!result}
                    onClick={() => {
                      if (!result) return;
                      const ts = `const data = ${result.output} as const;\nexport type Data = typeof data;\nexport default data;`;
                      handleDownload(ts, "ts", "text/typescript");
                    }}
                  >
                    <div
                      className={workspaceStyles.jwConvertCardIcon}
                      style={{ background: "#eff6ff", color: "#0284c7" }}
                    >
                      <i className="ti ti-brand-typescript" />
                    </div>
                    <div className={workspaceStyles.jwConvertCardLabel}>TypeScript</div>
                    <div className={workspaceStyles.jwConvertCardDesc}>Export as typed TypeScript const</div>
                    <div className={workspaceStyles.jwConvertCardAction}>
                      <i className="ti ti-download" />
                      Download .ts
                    </div>
                  </button>
                </div>
              </div>

              {!result && (
                <div className={workspaceStyles.jwTransformEmpty}>
                  <i className="ti ti-transform" />
                  <p>Add valid JSON in the Process tab to enable transformations.</p>
                  <button
                    type="button"
                    className={workspaceStyles.jwTabEmptyBtn}
                    onClick={() => setTabView("process")}
                  >
                    Go to Processor
                  </button>
                </div>
              )}
            </div>
          )}

          {tabView === "history" && (
            <div className={workspaceStyles.jwHistory}>
              {history.length === 0 ? (
                <div className={workspaceStyles.jwTabEmpty}>
                  <div className={workspaceStyles.jwTabEmptyIcon}>
                    <i className="ti ti-history" />
                  </div>
                  <h3>No History Yet</h3>
                  <p>Your processing history will appear here after you download a result.</p>
                </div>
              ) : (
                <>
                  <div className={workspaceStyles.jwHistoryHeader}>
                    <div className={workspaceStyles.jwHistoryTitle}>
                      <i className="ti ti-history" />
                      History
                      <span className={workspaceStyles.jwHistoryCount}>{history.length}</span>
                    </div>
                    <button type="button" className={workspaceStyles.jwGhostBtn} onClick={clearHistory}>
                      <i className="ti ti-trash" />
                      Clear
                    </button>
                  </div>
                  <div className={workspaceStyles.jwHistoryList}>
                    {history.map((entry) => (
                      <div key={entry.id} className={workspaceStyles.jwHistoryItem}>
                        <div className={workspaceStyles.jwHistoryItemLeft}>
                          <div
                            className={workspaceStyles.jwHistoryItemIcon}
                            style={{
                              background: MODE_CONFIG[entry.options.mode]?.color + "20",
                              color: MODE_CONFIG[entry.options.mode]?.color,
                            }}
                          >
                            <i className="ti ti-braces" />
                          </div>
                          <div>
                            <div className={workspaceStyles.jwHistoryItemTitle}>{entry.title}</div>
                            <div className={workspaceStyles.jwHistoryItemMeta}>
                              {new Date(entry.timestamp).toLocaleString()} ·{" "}
                              {formatBytes(entry.result.stats.original)} →{" "}
                              {formatBytes(entry.result.stats.processed)}
                            </div>
                          </div>
                        </div>
                        <div className={workspaceStyles.jwHistoryItemRight}>
                          <span className={workspaceStyles.jwHistoryMode}>{entry.options.mode}</span>
                          {entry.result.stats.savingsPercent !== 0 && (
                            <span
                              className={`${workspaceStyles.jwHistorySavings} ${entry.result.stats.savings > 0 ? workspaceStyles.good : workspaceStyles.warn}`}
                            >
                              {entry.result.stats.savings > 0 ? "-" : "+"}
                              {Math.abs(entry.result.stats.savingsPercent)}%
                            </span>
                          )}
                          <button
                            type="button"
                            className={workspaceStyles.jwIconBtn}
                            onClick={() => restoreFromHistory(entry.input, entry.options)}
                            title="Restore"
                            aria-label="Restore this entry"
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

        <div className={workspaceStyles.jwFooter}>
          <div className={workspaceStyles.jwFooterLeft}>
            <i className="ti ti-shield-lock" />
            <span>Runs entirely in your browser — nothing is sent to any server.</span>
          </div>
          {result && (
            <div className={workspaceStyles.jwFooterRight}>
              <span>{result.stats.keys} keys</span>
              <span>·</span>
              <span>depth {result.stats.depth}</span>
              <span>·</span>
              <span className={result.analysis.isValid ? workspaceStyles.jwValid : workspaceStyles.jwInvalid}>
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