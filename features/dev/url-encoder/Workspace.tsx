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
                {tab.id === "history" && history.length > 0 && (
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

      <style jsx>{`
        .uew-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 650px;
        }

        /*  Chrome  */
        .uew-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .uew-chrome-left,
        .uew-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .uew-pill-group {
          display: flex;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .uew-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 12px;
          border: none;
          border-right: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .uew-pill:last-child {
          border-right: none;
        }

        .uew-pill i {
          font-size: 13px;
        }

        .uew-pill:hover {
          background: var(--border);
          color: var(--text);
        }

        .uew-pill.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .uew-method-cluster {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .uew-method-full {
          display: inline;
        }

        .uew-method-short {
          display: none;
        }

        .uew-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 11px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .uew-icon-btn i {
          font-size: 13px;
        }

        .uew-icon-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .uew-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .uew-icon-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .uew-clear-btn:hover:not(:disabled) {
          color: #b91c1c;
          border-color: currentColor;
          background: var(--error-bg);
        }

        @media (prefers-color-scheme: dark) {
          .uew-clear-btn:hover:not(:disabled) {
            color: #f87171;
          }
        }

        .uew-examples {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .uew-examples-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-disabled);
          margin-right: 2px;
        }

        .uew-example-btn {
          height: 26px;
          padding: 0 10px;
          border-radius: 99px;
          border: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .uew-example-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .uew-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .uew-action-btn i {
          font-size: 13px;
        }

        .uew-action-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .uew-action-btn.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /*  Method Info Panel  */
        .uew-method-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .uew-method-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          text-align: left;
          transition: all 0.12s;
        }

        .uew-method-card:hover {
          border-color: var(--brand-border);
        }

        .uew-method-card.active {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .uew-method-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .uew-method-card-icon {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .uew-method-card-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .uew-method-card-desc {
          font-size: 11px;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin: 0;
        }

        .uew-method-card-example {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--brand);
          background: var(--bg-surface);
          padding: 4px 8px;
          border-radius: 4px;
        }

        /*  Tabs Bar  */
        .uew-tabs-bar {
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .uew-tabs {
          display: flex;
          padding: 0 14px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .uew-tabs::-webkit-scrollbar {
          display: none;
        }

        .uew-tab {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 38px;
          padding: 0 14px;
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

        .uew-tab i {
          font-size: 13px;
        }

        .uew-tab:hover {
          color: var(--text);
        }

        .uew-tab.active {
          color: var(--text);
        }

        .uew-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 10px;
          right: 10px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .uew-badge {
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

        /*  Options Bar  */
        .uew-options-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
        }

        .uew-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          user-select: none;
        }

        .uew-toggle input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .uew-toggle-track {
          width: 32px;
          height: 18px;
          background: var(--border);
          border-radius: 99px;
          position: relative;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .uew-toggle input:checked + .uew-toggle-track {
          background: var(--brand);
        }

        .uew-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.15s;
        }

        .uew-toggle input:checked + .uew-toggle-track .uew-toggle-thumb {
          transform: translateX(14px);
        }

        .uew-toggle-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /*  Content  */
        .uew-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .uew-output-tabs {
          display: flex;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          padding: 0 14px;
        }

        .uew-output-tab {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 36px;
          padding: 0 11px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
        }

        .uew-output-tab i {
          font-size: 12.5px;
        }

        .uew-output-tab:hover {
          color: var(--text-secondary);
        }

        .uew-output-tab.active {
          color: var(--text);
        }

        .uew-output-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 8px;
          right: 8px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        /*  Stats Bar  */
        .uew-stats-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .uew-stat {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 99px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
        }

        .uew-stat-label {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-disabled);
        }

        .uew-stat-value {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .uew-stat-value.mono {
          font-family: var(--font-mono);
          font-size: 10.5px;
        }

        .uew-stat-value.warn {
          color: #f59e0b;
        }

        .uew-stat-value.good {
          color: var(--brand);
        }

        .uew-safety {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
        }

        .uew-safety i {
          font-size: 13px;
        }

        .uew-safety.level-safe {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .uew-safety.level-caution {
          background: #fffbeb;
          color: #92400e;
        }

        @media (prefers-color-scheme: dark) {
          .uew-safety.level-caution {
            background: #1c1400;
            color: #fcd34d;
          }
        }

        .uew-safety.level-warning {
          background: #fff7ed;
          color: #9a3412;
        }

        @media (prefers-color-scheme: dark) {
          .uew-safety.level-warning {
            background: #1f1005;
            color: #fdba74;
          }
        }

        .uew-safety.level-danger {
          background: var(--error-bg);
          color: #991b1b;
        }

        @media (prefers-color-scheme: dark) {
          .uew-safety.level-danger {
            color: #f87171;
          }
        }

        /*  Footer  */
        .uew-footer {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          font-size: 11px;
          color: var(--text-disabled);
        }

        .uew-footer i {
          font-size: 13px;
        }

        /*  Responsive  */
        .uew-label {
          display: inline;
        }

        @media (max-width: 768px) {
          .uew-label {
            display: none;
          }

          .uew-chrome {
            padding: 8px 10px;
          }

          .uew-method-full {
            display: none;
          }

          .uew-method-short {
            display: inline;
          }

          .uew-examples-label {
            display: none;
          }

          .uew-method-info {
            grid-template-columns: 1fr;
          }

          .uew-options-bar {
            padding: 8px 10px;
            gap: 12px;
          }

          .uew-stats-bar {
            gap: 5px;
          }

          .uew-safety {
            margin-left: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .uew-pill,
          .uew-icon-btn,
          .uew-action-btn,
          .uew-tab,
          .uew-toggle-track,
          .uew-toggle-thumb,
          .uew-method-card {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
