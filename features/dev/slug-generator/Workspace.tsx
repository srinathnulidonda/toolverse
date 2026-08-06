// features/dev/slug-generator/Workspace.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
  SAMPLE_SLUGS,
  DEFAULT_OPTIONS,
  generateSlug,
  generateAlternatives,
  type SlugOptions,
  type CaseStyle,
  type Separator,
} from "./ts/utils";
import SlugPreview from "./SlugPreview";
import SlugBatch from "./SlugBatch";
import SlugCompare from "./SlugCompare";
import SlugHistory from "./SlugHistory";
import { useSlugStore, type HistoryEntry } from "./ts/slugStore";
import styles from "./style/Workspace.module.css";

type ViewTab = "single" | "batch" | "compare" | "history";

export default function SlugGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<SlugOptions>(DEFAULT_OPTIONS);
  const [maxLengthInput, setMaxLengthInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileView, setMobileView] = useState<"input" | "output">("input");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);

  const { addToHistory, history, clearHistory } = useSlugStore();

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return generateSlug(input, options);
  }, [input, options]);

  const alternatives = useMemo(() => {
    if (!input.trim()) return [];
    return generateAlternatives(input, options);
  }, [input, options]);

  const handleProcess = useCallback(() => {
    if (!output) return;

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      input: input.substring(0, 100),
      output: output.substring(0, 100),
      timestamp: Date.now(),
      options: { ...options },
    };

    addToHistory(entry);
  }, [output, input, options, addToHistory]);

  const handleCopy = useCallback(
    async (text: string = output) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        handleProcess();
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* silent */
      }
    },
    [output, handleProcess]
  );

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${output}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    handleProcess();
  }, [output, handleProcess]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const loadSample = useCallback((preset: (typeof SAMPLE_SLUGS)[0]) => {
    setInput(preset.text);
    setViewTab("single");
    setMobileView("input");
  }, []);

  const updateMaxLength = useCallback((value: string) => {
    setMaxLengthInput(value);
    const num = parseInt(value);
    setOptions((prev) => ({
      ...prev,
      maxLength: value === "" || isNaN(num) ? null : num,
    }));
  }, []);

  return (
    <>
      <div className={styles.sgRoot}>
        {/*  Top Chrome  */}
        <div className={styles.sgChrome}>
          <div className={styles.sgChromeLeft}>
            <span className={styles.sgCmdLabel}>Examples:</span>
            {SAMPLE_SLUGS.slice(0, 3).map((p) => (
              <button
                key={p.id}
                className={styles.sgPresetBtn}
                onClick={() => loadSample(p)}
                aria-label={`Load ${p.label} example`}
              >
                <i className="ti ti-link" />
                <span className={styles.sgPresetLabel}>{p.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.sgChromeRight}>
            {viewTab === "single" && (
              <button
                type="button"
                className={`${styles.sgIconBtn} ${styles.sgMobileOptionsBtn}`}
                onClick={() => setShowMobileOptions(!showMobileOptions)}
                aria-label="Toggle options"
              >
                <i className="ti ti-settings" />
              </button>
            )}
            {viewTab === "single" && output && (
              <>
                <button
                  type="button"
                  className={`${styles.sgActionBtn}${copied ? ` ${styles.success}` : ""}`}
                  onClick={() => handleCopy()}
                >
                  <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                  <span className={styles.sgLabel}>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.sgActionBtn} ${styles.sgDesktopOnly}`}
                  onClick={handleDownload}
                >
                  <i className="ti ti-download" />
                  <span className={styles.sgLabel}>Save</span>
                </button>
              </>
            )}
            <button
              type="button"
              className={`${styles.sgIconBtn} ${styles.sgClearBtn}`}
              onClick={handleClear}
              disabled={!input}
              title="Clear all"
              aria-label="Clear input"
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>

        {/*  View Tabs  */}
        <div className={styles.sgTabsBar}>
          <nav className={styles.sgTabs} role="tablist" aria-label="Tool views">
            {[
              { id: "single" as const, label: "Single", icon: "ti-file" },
              { id: "batch" as const, label: "Batch", icon: "ti-files" },
              { id: "compare" as const, label: "Compare", icon: "ti-git-compare" },
              { id: "history" as const, label: "History", icon: "ti-history" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`${styles.sgTab}${viewTab === tab.id ? ` ${styles.active}` : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
                aria-controls={`sg-panel-${tab.id}`}
              >
                <i className={`ti ${tab.icon}`} />
                <span className={styles.sgTabLabel}>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className={styles.sgBadge}>{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Options Bar (Single view only)  */}
        {viewTab === "single" && (
          <div className={`${styles.sgOptionsBar}${showMobileOptions ? ` ${styles.mobileVisible}` : ""}`}>
            <div className={styles.sgOptionsHeader}>
              <span className={styles.sgOptionsTitle}>
                <i className="ti ti-adjustments" />
                Options
              </span>
              <button
                type="button"
                className={styles.sgMobileCloseBtn}
                onClick={() => setShowMobileOptions(false)}
                aria-label="Close options"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className={styles.sgOptionsScroll}>
              <div className={styles.sgOptionsRow}>
                <span className={styles.sgOptionsLabel}>Separator</span>
                <div className={styles.sgSeparatorGroup}>
                  {(["-", "_", ".", ""] as Separator[]).map((sep) => (
                    <button
                      key={sep || "none"}
                      className={`${styles.sgSepBtn}${options.separator === sep ? ` ${styles.active}` : ""}`}
                      onClick={() => setOptions((prev) => ({ ...prev, separator: sep }))}
                      aria-pressed={options.separator === sep}
                    >
                      {sep === "-" && "Hyphen"}
                      {sep === "_" && "Underscore"}
                      {sep === "." && "Dot"}
                      {sep === "" && "None"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.sgOptionsRow}>
                <span className={styles.sgOptionsLabel}>Case Style</span>
                <div className={styles.sgCaseGroup}>
                  {(["lowercase", "uppercase", "title", "camel", "pascal"] as CaseStyle[]).map(
                    (style) => (
                      <button
                        key={style}
                        className={`${styles.sgCaseBtn}${options.caseStyle === style ? ` ${styles.active}` : ""}`}
                        onClick={() => setOptions((prev) => ({ ...prev, caseStyle: style }))}
                        aria-pressed={options.caseStyle === style}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className={styles.sgOptionsRow}>
                <button
                  type="button"
                  className={styles.sgAdvancedToggle}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-expanded={showAdvanced}
                >
                  <i className={`ti ti-chevron-${showAdvanced ? "down" : "right"}`} />
                  Advanced Options
                </button>
              </div>

              {showAdvanced && (
                <>
                  <div className={`${styles.sgOptionsRow} ${styles.sgAdvanced}`}>
                    <label className={styles.sgToggle}>
                      <input
                        type="checkbox"
                        checked={options.removeSpecial}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, removeSpecial: e.target.checked }))
                        }
                      />
                      <span className={styles.sgToggleTrack}>
                        <span className={styles.sgToggleThumb} />
                      </span>
                      <span className={styles.sgToggleLabel}>Remove special characters</span>
                    </label>
                    <label className={styles.sgToggle}>
                      <input
                        type="checkbox"
                        checked={options.removeDiacritics}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, removeDiacritics: e.target.checked }))
                        }
                      />
                      <span className={styles.sgToggleTrack}>
                        <span className={styles.sgToggleThumb} />
                      </span>
                      <span className={styles.sgToggleLabel}>Remove diacritics (é → e)</span>
                    </label>
                    <label className={styles.sgToggle}>
                      <input
                        type="checkbox"
                        checked={options.removeStopWords}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, removeStopWords: e.target.checked }))
                        }
                      />
                      <span className={styles.sgToggleTrack}>
                        <span className={styles.sgToggleThumb} />
                      </span>
                      <span className={styles.sgToggleLabel}>Remove stop words (a, an, the...)</span>
                    </label>
                    <label className={styles.sgToggle}>
                      <input
                        type="checkbox"
                        checked={!options.preserveNumbers}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, preserveNumbers: !e.target.checked }))
                        }
                      />
                      <span className={styles.sgToggleTrack}>
                        <span className={styles.sgToggleThumb} />
                      </span>
                      <span className={styles.sgToggleLabel}>Remove numbers</span>
                    </label>
                  </div>

                  <div className={`${styles.sgOptionsRow} ${styles.sgAdvanced}`}>
                    <span className={styles.sgOptionsLabel}>Max Length</span>
                    <div className={styles.sgLengthControls}>
                      <input
                        type="number"
                        className={styles.sgNumberInput}
                        value={maxLengthInput}
                        onChange={(e) => updateMaxLength(e.target.value)}
                        placeholder="No limit"
                        min="1"
                        max="200"
                      />
                      {options.maxLength && (
                        <label className={`${styles.sgToggle} ${styles.sgToggleInline}`}>
                          <input
                            type="checkbox"
                            checked={options.smartTruncate}
                            onChange={(e) =>
                              setOptions((prev) => ({ ...prev, smartTruncate: e.target.checked }))
                            }
                          />
                          <span className={styles.sgToggleTrack}>
                            <span className={styles.sgToggleThumb} />
                          </span>
                          <span className={styles.sgToggleLabel}>Smart truncate</span>
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Alternative slugs */}
              {viewTab === "single" && alternatives.length > 0 && (
                <div className={styles.sgAlternatives}>
                  <span className={styles.sgAltLabel}>Alternative slugs:</span>
                  <div className={styles.sgAltList}>
                    {alternatives.slice(0, 5).map((alt, i) => (
                      <button
                        key={i}
                        className={styles.sgAltChip}
                        onClick={() => handleCopy(alt)}
                        title="Click to copy"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/*  Tab Content  */}
        <div className={styles.sgTabContent} id={`sg-panel-${viewTab}`} role="tabpanel">
          {viewTab === "single" && (
            <SlugPreview
              input={input}
              output={output}
              options={options}
              mobileView={mobileView}
              onInputChange={setInput}
              onMobileViewChange={setMobileView}
            />
          )}

          {viewTab === "batch" && <SlugBatch options={options} onComplete={handleProcess} />}

          {viewTab === "compare" && <SlugCompare options={options} />}

          {viewTab === "history" && (
            <SlugHistory
              history={history}
              onClear={clearHistory}
              onRestore={(entry) => {
                setInput(entry.input);
                setOptions(entry.options);
                setViewTab("single");
              }}
            />
          )}
        </div>

        {/*  Mobile Bottom Actions  */}
        {viewTab === "single" && output && (
          <div className={styles.sgMobileActions}>
            <button
              type="button"
              className={`${styles.sgMobAction}${copied ? ` ${styles.success}` : ""}`}
              onClick={() => handleCopy()}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" className={styles.sgMobAction} onClick={handleDownload}>
              <i className="ti ti-download" />
              Save
            </button>
            <button type="button" className={styles.sgMobAction} onClick={handleClear}>
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        )}

        {/*  Footer  */}
        <div className={styles.sgFooter}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}