// features/dev/url-encoder/Workspace.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
  SAMPLE_URLS,
  ENCODE_METHODS,
  encodeUrl,
  decodeUrl,
  parseUrl,
  analyzeUrl,
  copyToClipboard,
  downloadAsFile,
  type Mode,
  type EncodeMethod,
  type EncodingOptions,
} from "./utils";
import UrlPreview from "./UrlPreview";
import UrlBreakdown from "./UrlBreakdown";
import UrlDiff from "./UrlDiff";
import UrlBatch from "./UrlBatch";
import UrlCompare from "./UrlCompare";
import UrlHistory from "./UrlHistory";
import UrlSecurity from "./UrlSecurity";
import { useUrlStore, type HistoryEntry } from "./urlStore";
import "./style/UrlBatch.css";
import "./style/UrlBreakdown.css";
import "./style/UrlCompare.css";
import "./style/UrlDiff.css";
import "./style/UrlHistory.css";
import "./style/UrlPreview.css";
import "./style/UrlSecurity.css";
import "./style/Workspace.css";

type ViewTab = "single" | "batch" | "compare" | "security" | "history";
type OutputTab = "result" | "breakdown" | "diff";

export default function UrlEncoderWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [outputTab, setOutputTab] = useState<OutputTab>("result");
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileView, setMobileView] = useState<"input" | "output">("input");
  const [showMethodInfo, setShowMethodInfo] = useState(false);

  const [options, setOptions] = useState<EncodingOptions>({
    method: "component",
    spaceAsPlus: false,
    preserveCase: true,
    encoding: "UTF-8",
  });

  const { addToHistory, history, clearHistory, removeEntry } = useUrlStore();

  /* Computed values */
  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return mode === "encode" ? encodeUrl(input, options) : decodeUrl(input, options).result;
    } catch {
      return "";
    }
  }, [mode, input, options]);

  const decodeError = useMemo(() => {
    if (mode !== "decode" || !input.trim()) return "";
    return decodeUrl(input, options).error ?? "";
  }, [mode, input, options]);

  const parsedUrl = useMemo(() => {
    const source = mode === "decode" ? output : input;
    return source.trim() ? parseUrl(source) : null;
  }, [mode, output, input]);

  const stats = useMemo(() => analyzeUrl(input, output, mode), [input, output, mode]);

  const currentMethod = ENCODE_METHODS.find((m) => m.id === options.method)!;

  /* Actions */
  const handleProcess = useCallback(() => {
    if (!output) return;

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      mode,
      input: input.substring(0, 200),
      output: output.substring(0, 200),
      timestamp: Date.now(),
      options: { ...options },
    };

    addToHistory(entry);
  }, [output, mode, input, options, addToHistory]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    const success = await copyToClipboard(output);
    if (success) {
      setCopied(true);
      handleProcess();
      setTimeout(() => setCopied(false), 1500);
    }
  }, [output, handleProcess]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    downloadAsFile(output, `url-${mode}.txt`);
    handleProcess();
  }, [output, mode, handleProcess]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setInput("");
    setOutputTab("result");
    setMobileView("input");
  }, []);

  const handleSwap = useCallback(() => {
    if (!output) return;
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output);
    setMobileView("input");
  }, [output]);

  const loadSample = useCallback(
    (preset: keyof typeof SAMPLE_URLS) => {
      const sample = SAMPLE_URLS[preset];
      setInput(mode === "encode" ? sample.plain : sample.encoded);
      setMobileView("input");
    },
    [mode]
  );

  const handleRestoreHistory = useCallback((entry: HistoryEntry) => {
    setMode(entry.mode);
    setInput(entry.input);
    setOptions(entry.options);
    setViewTab("single");
  }, []);

  const VIEW_TABS = [
    { id: "single" as const, label: "Single", icon: "ti-link" },
    { id: "batch" as const, label: "Batch", icon: "ti-files" },
    { id: "compare" as const, label: "Compare", icon: "ti-git-compare" },
    { id: "security" as const, label: "Security", icon: "ti-shield-check" },
    { id: "history" as const, label: "History", icon: "ti-history" },
  ];

  const OUTPUT_TABS = [
    { id: "result" as const, icon: "ti-eye", label: "Result" },
    { id: "breakdown" as const, icon: "ti-layout-list", label: "Breakdown" },
    { id: "diff" as const, icon: "ti-git-compare", label: "Diff" },
  ];

  return (
    <>
      <div className="uew-root">
        {/*  Top Chrome  */}
        <div className="uew-chrome">
          <div className="uew-chrome-left">
            {/* Mode Toggle */}
            <div className="uew-pill-group" role="group" aria-label="Mode">
              <button
                type="button"
                className={`uew-pill${mode === "encode" ? " active" : ""}`}
                onClick={() => switchMode("encode")}
              >
                <i className="ti ti-lock" />
                Encode
              </button>
              <button
                type="button"
                className={`uew-pill${mode === "decode" ? " active" : ""}`}
                onClick={() => switchMode("decode")}
              >
                <i className="ti ti-lock-open" />
                Decode
              </button>
            </div>

            {/* Method Selector - Encode only */}
            {mode === "encode" && viewTab === "single" && (
              <div className="uew-method-cluster">
                <div className="uew-pill-group">
                  {ENCODE_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`uew-pill${options.method === m.id ? " active" : ""}`}
                      onClick={() => setOptions((prev) => ({ ...prev, method: m.id }))}
                      title={m.desc}
                    >
                      <i className={`ti ${m.icon}`} />
                      <span className="uew-method-full">{m.label}</span>
                      <span className="uew-method-short">{m.short}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={`uew-icon-btn${showMethodInfo ? " active" : ""}`}
                  onClick={() => setShowMethodInfo((v) => !v)}
                  title="Method details"
                >
                  <i className="ti ti-info-circle" />
                </button>
              </div>
            )}

            {viewTab === "single" && (
              <button
                type="button"
                className="uew-icon-btn"
                onClick={handleSwap}
                disabled={!output}
                title="Swap input/output"
              >
                <i className="ti ti-arrows-right-left" />
                <span className="uew-label">Swap</span>
              </button>
            )}
          </div>

          <div className="uew-chrome-right">
            {viewTab === "single" && (
              <div className="uew-examples">
                <span className="uew-examples-label">Try:</span>
                {Object.keys(SAMPLE_URLS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="uew-example-btn"
                    onClick={() => loadSample(key as keyof typeof SAMPLE_URLS)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {viewTab === "single" && output && (
              <>
                <button
                  type="button"
                  className={`uew-action-btn${copied ? " success" : ""}`}
                  onClick={handleCopy}
                >
                  <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className="uew-action-btn" onClick={handleDownload}>
                  <i className="ti ti-download" />
                  <span className="uew-label">Save</span>
                </button>
              </>
            )}

            <button
              type="button"
              className="uew-icon-btn uew-clear-btn"
              onClick={handleClear}
              disabled={!input}
              title="Clear"
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>

        {/*  Method Info Panel  */}
        {showMethodInfo && mode === "encode" && viewTab === "single" && (
          <div className="uew-method-info">
            {ENCODE_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`uew-method-card${options.method === m.id ? " active" : ""}`}
                onClick={() => {
                  setOptions((prev) => ({ ...prev, method: m.id }));
                  setShowMethodInfo(false);
                }}
              >
                <div className="uew-method-card-header">
                  <div className="uew-method-card-icon">
                    <i className={`ti ${m.icon}`} />
                  </div>
                  <span className="uew-method-card-name">{m.label}</span>
                </div>
                <p className="uew-method-card-desc">{m.desc}</p>
                <code className="uew-method-card-example">{m.example}</code>
              </button>
            ))}
          </div>
        )}

        {/*  View Tabs  */}
        <div className="uew-tabs-bar">
          <nav className="uew-tabs" role="tablist">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`uew-tab${viewTab === tab.id ? " active" : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                {tab.label}
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className="uew-badge">{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Options Bar - Single view only  */}
        {viewTab === "single" && (
          <div className="uew-options-bar">
            {mode === "encode" && options.method === "query" && (
              <label className="uew-toggle">
                <input
                  type="checkbox"
                  checked={options.spaceAsPlus}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, spaceAsPlus: e.target.checked }))
                  }
                />
                <span className="uew-toggle-track">
                  <span className="uew-toggle-thumb" />
                </span>
                <span className="uew-toggle-label">Space as +</span>
              </label>
            )}

            {mode === "decode" && (
              <label className="uew-toggle">
                <input
                  type="checkbox"
                  checked={options.spaceAsPlus}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, spaceAsPlus: e.target.checked }))
                  }
                />
                <span className="uew-toggle-track">
                  <span className="uew-toggle-thumb" />
                </span>
                <span className="uew-toggle-label">Treat + as space</span>
              </label>
            )}
          </div>
        )}

        {/*  Tab Content  */}
        <div className="uew-content">
          {viewTab === "single" && (
            <>
              {/* Sub-tabs for output view */}
              <div className="uew-output-tabs">
                {OUTPUT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`uew-output-tab${outputTab === tab.id ? " active" : ""}`}
                    onClick={() => setOutputTab(tab.id)}
                  >
                    <i className={`ti ${tab.icon}`} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {outputTab === "result" && (
                <UrlPreview
                  mode={mode}
                  input={input}
                  output={output}
                  options={options}
                  error={decodeError}
                  mobileView={mobileView}
                  onInputChange={setInput}
                  onMobileViewChange={setMobileView}
                  onViewOutput={() => setMobileView("output")}
                />
              )}

              {outputTab === "breakdown" && <UrlBreakdown urlParts={parsedUrl} />}

              {outputTab === "diff" && <UrlDiff input={input} output={output} />}

              {/* Stats Bar */}
              {output && (
                <div className="uew-stats-bar">
                  <div className="uew-stat">
                    <span className="uew-stat-label">Length</span>
                    <span className="uew-stat-value">{output.length} ch</span>
                  </div>
                  <div className="uew-stat">
                    <span className="uew-stat-label">Delta</span>
                    <span
                      className={`uew-stat-value${stats.delta > 0 ? " warn" : stats.delta < 0 ? " good" : ""}`}
                    >
                      {stats.delta >= 0 ? "+" : ""}
                      {stats.delta}
                    </span>
                  </div>
                  <div className="uew-stat">
                    <span className="uew-stat-label">Ratio</span>
                    <span className="uew-stat-value">{stats.ratio}%</span>
                  </div>
                  {mode === "encode" && (
                    <div className="uew-stat">
                      <span className="uew-stat-label">Method</span>
                      <span className="uew-stat-value mono">{currentMethod.short}</span>
                    </div>
                  )}
                  <div className={`uew-safety level-${stats.safety.level}`}>
                    <i className="ti ti-shield-check" />
                    <span>{stats.safety.score}/100</span>
                  </div>
                </div>
              )}
            </>
          )}

          {viewTab === "batch" && <UrlBatch mode={mode} options={options} />}

          {viewTab === "compare" && <UrlCompare options={options} />}

          {viewTab === "security" && (
            <UrlSecurity input={mode === "decode" ? output : input} mode={mode} />
          )}

          {viewTab === "history" && (
            <UrlHistory
              history={history}
              onClear={clearHistory}
              onRestore={handleRestoreHistory}
              onRemove={removeEntry}
            />
          )}
        </div>

        {/*  Footer  */}
        <div className="uew-footer">
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}
