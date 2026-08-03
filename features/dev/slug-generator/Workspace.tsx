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
} from "./utils";
import SlugPreview from "./SlugPreview";
import SlugBatch from "./SlugBatch";
import SlugCompare from "./SlugCompare";
import SlugHistory from "./SlugHistory";
import { useSlugStore, type HistoryEntry } from "./slugStore";
import "./style/SlugBatch.css";
import "./style/SlugCompare.css";
import "./style/SlugHistory.css";
import "./style/SlugPreview.css";
import "./style/Workspace.css";

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
      <div className="sg-root">
        {/*  Top Chrome  */}
        <div className="sg-chrome">
          <div className="sg-chrome-left">
            <span className="sg-cmd-label">Examples:</span>
            {SAMPLE_SLUGS.slice(0, 3).map((p) => (
              <button
                key={p.id}
                className="sg-preset-btn"
                onClick={() => loadSample(p)}
                aria-label={`Load ${p.label} example`}
              >
                <i className="ti ti-link" />
                <span className="sg-preset-label">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="sg-chrome-right">
            {viewTab === "single" && (
              <button
                type="button"
                className="sg-icon-btn sg-mobile-options-btn"
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
                  className={`sg-action-btn${copied ? " success" : ""}`}
                  onClick={() => handleCopy()}
                >
                  <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                  <span className="sg-label">{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  className="sg-action-btn sg-desktop-only"
                  onClick={handleDownload}
                >
                  <i className="ti ti-download" />
                  <span className="sg-label">Save</span>
                </button>
              </>
            )}
            <button
              type="button"
              className="sg-icon-btn sg-clear-btn"
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
        <div className="sg-tabs-bar">
          <nav className="sg-tabs" role="tablist" aria-label="Tool views">
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
                className={`sg-tab${viewTab === tab.id ? " active" : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
                aria-controls={`sg-panel-${tab.id}`}
              >
                <i className={`ti ${tab.icon}`} />
                <span className="sg-tab-label">{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className="sg-badge">{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Options Bar (Single view only)  */}
        {viewTab === "single" && (
          <div className={`sg-options-bar${showMobileOptions ? " mobile-visible" : ""}`}>
            <div className="sg-options-header">
              <span className="sg-options-title">
                <i className="ti ti-adjustments" />
                Options
              </span>
              <button
                type="button"
                className="sg-mobile-close-btn"
                onClick={() => setShowMobileOptions(false)}
                aria-label="Close options"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className="sg-options-scroll">
              <div className="sg-options-row">
                <span className="sg-options-label">Separator</span>
                <div className="sg-separator-group">
                  {(["-", "_", ".", ""] as Separator[]).map((sep) => (
                    <button
                      key={sep || "none"}
                      className={`sg-sep-btn${options.separator === sep ? " active" : ""}`}
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

              <div className="sg-options-row">
                <span className="sg-options-label">Case Style</span>
                <div className="sg-case-group">
                  {(["lowercase", "uppercase", "title", "camel", "pascal"] as CaseStyle[]).map(
                    (style) => (
                      <button
                        key={style}
                        className={`sg-case-btn${options.caseStyle === style ? " active" : ""}`}
                        onClick={() => setOptions((prev) => ({ ...prev, caseStyle: style }))}
                        aria-pressed={options.caseStyle === style}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="sg-options-row">
                <button
                  type="button"
                  className="sg-advanced-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-expanded={showAdvanced}
                >
                  <i className={`ti ti-chevron-${showAdvanced ? "down" : "right"}`} />
                  Advanced Options
                </button>
              </div>

              {showAdvanced && (
                <>
                  <div className="sg-options-row sg-advanced">
                    <label className="sg-toggle">
                      <input
                        type="checkbox"
                        checked={options.removeSpecial}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, removeSpecial: e.target.checked }))
                        }
                      />
                      <span className="sg-toggle-track">
                        <span className="sg-toggle-thumb" />
                      </span>
                      <span className="sg-toggle-label">Remove special characters</span>
                    </label>
                    <label className="sg-toggle">
                      <input
                        type="checkbox"
                        checked={options.removeDiacritics}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, removeDiacritics: e.target.checked }))
                        }
                      />
                      <span className="sg-toggle-track">
                        <span className="sg-toggle-thumb" />
                      </span>
                      <span className="sg-toggle-label">Remove diacritics (é → e)</span>
                    </label>
                    <label className="sg-toggle">
                      <input
                        type="checkbox"
                        checked={options.removeStopWords}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, removeStopWords: e.target.checked }))
                        }
                      />
                      <span className="sg-toggle-track">
                        <span className="sg-toggle-thumb" />
                      </span>
                      <span className="sg-toggle-label">Remove stop words (a, an, the...)</span>
                    </label>
                    <label className="sg-toggle">
                      <input
                        type="checkbox"
                        checked={!options.preserveNumbers}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, preserveNumbers: !e.target.checked }))
                        }
                      />
                      <span className="sg-toggle-track">
                        <span className="sg-toggle-thumb" />
                      </span>
                      <span className="sg-toggle-label">Remove numbers</span>
                    </label>
                  </div>

                  <div className="sg-options-row sg-advanced">
                    <span className="sg-options-label">Max Length</span>
                    <div className="sg-length-controls">
                      <input
                        type="number"
                        className="sg-number-input"
                        value={maxLengthInput}
                        onChange={(e) => updateMaxLength(e.target.value)}
                        placeholder="No limit"
                        min="1"
                        max="200"
                      />
                      {options.maxLength && (
                        <label className="sg-toggle sg-toggle-inline">
                          <input
                            type="checkbox"
                            checked={options.smartTruncate}
                            onChange={(e) =>
                              setOptions((prev) => ({ ...prev, smartTruncate: e.target.checked }))
                            }
                          />
                          <span className="sg-toggle-track">
                            <span className="sg-toggle-thumb" />
                          </span>
                          <span className="sg-toggle-label">Smart truncate</span>
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Alternative slugs */}
              {viewTab === "single" && alternatives.length > 0 && (
                <div className="sg-alternatives">
                  <span className="sg-alt-label">Alternative slugs:</span>
                  <div className="sg-alt-list">
                    {alternatives.slice(0, 5).map((alt, i) => (
                      <button
                        key={i}
                        className="sg-alt-chip"
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
        <div className="sg-tab-content" id={`sg-panel-${viewTab}`} role="tabpanel">
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
          <div className="sg-mobile-actions">
            <button
              type="button"
              className={`sg-mob-action${copied ? " success" : ""}`}
              onClick={() => handleCopy()}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" className="sg-mob-action" onClick={handleDownload}>
              <i className="ti ti-download" />
              Save
            </button>
            <button type="button" className="sg-mob-action" onClick={handleClear}>
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        )}

        {/*  Footer  */}
        <div className="sg-footer">
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}
