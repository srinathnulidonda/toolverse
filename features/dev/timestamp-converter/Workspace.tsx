// features/dev/timestamp-converter/Workspace.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
  SAMPLE_TIMESTAMPS,
  DEFAULT_OPTIONS,
  POPULAR_TIMEZONES,
  convertTimestamp,
  validateTimestamp,
  getCurrentTimestamp,
  type TimestampOptions,
  type TimeUnit,
} from "./utils";
import TimestampPreview from "./TimestampPreview";
import TimestampBatch from "./TimestampBatch";
import TimestampCompare from "./TimestampCompare";
import TimestampHistory from "./TimestampHistory";
import { useTimestampStore, type HistoryEntry } from "./timestampStore";

type ViewTab = "single" | "batch" | "compare" | "history";

export default function TimestampConverterWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<TimestampOptions>(DEFAULT_OPTIONS);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [mobileView, setMobileView] = useState<"input" | "output">("input");
  const [showMobileOptions, setShowMobileOptions] = useState(false);

  const { addToHistory, history, clearHistory } = useTimestampStore();

  // Update current time every second
  useEffect(() => {
    // Set to current client time immediately to minimize stale UI
    setCurrentTime(getCurrentTimestamp());
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return convertTimestamp(input, options);
  }, [input, options]);

  const validation = useMemo(() => {
    if (!input.trim()) return { valid: true };
    return validateTimestamp(input, options.unit);
  }, [input, options.unit]);

  const currentTimeResult = useMemo(() => {
    if (currentTime === null) return null;
    return convertTimestamp(currentTime.toString(), { ...options, unit: "seconds" });
  }, [currentTime, options]);

  const handleProcess = useCallback(() => {
    if (!result || currentTime === null) return;

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      input: input.substring(0, 100),
      output: result.iso,
      timestamp: result.unix,
      options: { ...options },
      createdAt: Date.now(),
    };

    addToHistory(entry);
  }, [result, input, options, addToHistory, currentTime]);

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        handleProcess();
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* silent */
      }
    },
    [handleProcess]
  );

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const loadSample = useCallback((preset: (typeof SAMPLE_TIMESTAMPS)[0]) => {
    setInput(preset.getValue().toString());
    setOptions((prev) => ({ ...prev, unit: "seconds" }));
    setViewTab("single");
    setMobileView("input");
  }, []);

  const loadCurrent = useCallback(() => {
    if (currentTime === null) return;
    setInput(currentTime.toString());
    setOptions((prev) => ({ ...prev, unit: "seconds" }));
    setViewTab("single");
    setMobileView("input");
  }, [currentTime, setInput, setOptions, setViewTab, setMobileView]);

  return (
    <>
      <div className="tcv-root">
        {/*  Top Chrome  */}
        <div className="tcv-chrome">
          <div className="tcv-chrome-left">
            <button className="tcv-preset-btn tcv-preset-primary" onClick={loadCurrent}>
              <i className="ti ti-clock" />
              <span className="tcv-preset-label">Now</span>
            </button>
            <span className="tcv-cmd-label">Quick:</span>
            {SAMPLE_TIMESTAMPS.slice(1, 4).map((p) => (
              <button key={p.id} className="tcv-preset-btn" onClick={() => loadSample(p)}>
                <span className="tcv-preset-label">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="tcv-chrome-right">
            {viewTab === "single" && (
              <button
                type="button"
                className="tcv-icon-btn tcv-mobile-options-btn"
                onClick={() => setShowMobileOptions(!showMobileOptions)}
                aria-label="Toggle options"
              >
                <i className="ti ti-settings" />
              </button>
            )}
            <button
              type="button"
              className="tcv-icon-btn tcv-clear-btn"
              onClick={handleClear}
              disabled={!input}
              title="Clear all"
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>

        {/*  Live Current Time Banner  */}
        <div className="tcv-live">
          <div className="tcv-live-header">
            <div className="tcv-live-title">
              <i className="ti ti-clock-hour-4" />
              <span className="tcv-live-title-text">Current Unix Timestamp</span>
            </div>
            <button
              className={`tcv-copy-btn${copied ? " done" : ""}`}
              disabled={currentTime === null}
              onClick={() => {
                if (currentTime !== null) {
                  handleCopy(currentTime.toString());
                }
              }}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
              <span className="tcv-copy-text">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="tcv-live-time" suppressHydrationWarning>
            {currentTime !== null ? currentTime : "--"}
          </div>
          <div className="tcv-live-local">{currentTimeResult?.local}</div>
        </div>

        {/*  View Tabs  */}
        <div className="tcv-tabs-bar">
          <nav className="tcv-tabs" role="tablist">
            {[
              { id: "single" as const, label: "Convert", icon: "ti-arrows-transfer-up" },
              { id: "batch" as const, label: "Batch", icon: "ti-files" },
              { id: "compare" as const, label: "Duration", icon: "ti-calculator" },
              { id: "history" as const, label: "History", icon: "ti-history" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`tcv-tab${viewTab === tab.id ? " active" : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                <span className="tcv-tab-label">{tab.label}</span>
                {tab.id === "history" && history.length > 0 && (
                  <span className="tcv-badge">{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Options Bar (Single view only)  */}
        {viewTab === "single" && (
          <div className={`tcv-options-bar${showMobileOptions ? " mobile-visible" : ""}`}>
            <div className="tcv-options-header">
              <span className="tcv-options-title">
                <i className="ti ti-adjustments" />
                Options
              </span>
              <button
                type="button"
                className="tcv-mobile-close-btn"
                onClick={() => setShowMobileOptions(false)}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className="tcv-options-scroll">
              <div className="tcv-options-row">
                <span className="tcv-options-label">Input Unit</span>
                <div className="tcv-unit-group">
                  {(["seconds", "milliseconds", "microseconds", "nanoseconds"] as TimeUnit[]).map(
                    (u) => (
                      <button
                        key={u}
                        className={`tcv-unit-btn${options.unit === u ? " active" : ""}`}
                        onClick={() => setOptions((prev) => ({ ...prev, unit: u }))}
                      >
                        {u}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="tcv-options-row">
                <span className="tcv-options-label">Timezone</span>
                <select
                  className="tcv-select"
                  value={options.timezone}
                  onChange={(e) => setOptions((prev) => ({ ...prev, timezone: e.target.value }))}
                >
                  {POPULAR_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tcv-options-row">
                <label className="tcv-toggle">
                  <input
                    type="checkbox"
                    checked={options.use24Hour}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, use24Hour: e.target.checked }))
                    }
                  />
                  <span className="tcv-toggle-track">
                    <span className="tcv-toggle-thumb" />
                  </span>
                  <span className="tcv-toggle-label">24-hour format</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/*  Tab Content  */}
        <div className="tcv-tab-content">
          {viewTab === "single" && (
            <TimestampPreview
              input={input}
              result={result}
              options={options}
              error={!validation.valid ? validation.error || null : null}
              mobileView={mobileView}
              onInputChange={setInput}
              onMobileViewChange={setMobileView}
            />
          )}

          {viewTab === "batch" && <TimestampBatch options={options} onComplete={handleProcess} />}

          {viewTab === "compare" && <TimestampCompare options={options} />}

          {viewTab === "history" && (
            <TimestampHistory
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
        {viewTab === "single" && result && (
          <div className="tcv-mobile-actions">
            <button
              type="button"
              className={`tcv-mob-action${copied ? " success" : ""}`}
              onClick={() => handleCopy(result.iso)}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
              {copied ? "Copied" : "Copy ISO"}
            </button>
            <button
              type="button"
              className="tcv-mob-action"
              onClick={() => handleCopy(result.unix.toString())}
            >
              <i className="ti ti-hash" />
              Copy Unix
            </button>
            <button type="button" className="tcv-mob-action" onClick={handleClear}>
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        )}

        {/*  Footer  */}
        <div className="tcv-footer">
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>

      <style jsx>{`
        .tcv-root {
          --tc-radius-sm: 6px;
          --tc-radius-md: 8px;
          --tc-radius-lg: 12px;
          --tc-radius-xl: 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--tc-radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 600px;
        }

        /*  Chrome  */
        .tcv-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .tcv-chrome-left,
        .tcv-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tcv-cmd-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--text-disabled);
        }

        .tcv-preset-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 28px;
          padding: 0 10px;
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .tcv-preset-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .tcv-preset-primary {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .tcv-preset-btn i {
          font-size: 12px;
        }

        .tcv-mobile-options-btn {
          display: none;
        }

        .tcv-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 11px;
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .tcv-icon-btn i {
          font-size: 13px;
        }

        .tcv-icon-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .tcv-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .tcv-clear-btn:hover:not(:disabled) {
          color: #b91c1c;
          border-color: currentColor;
          background: var(--error-bg);
        }

        @media (prefers-color-scheme: dark) {
          .tcv-clear-btn:hover:not(:disabled) {
            color: #f87171;
          }
        }

        /*  Live Banner  */
        .tcv-live {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 16px;
          background: linear-gradient(135deg, var(--brand-light) 0%, var(--bg-surface) 100%);
          border-bottom: 0.5px solid var(--border);
        }

        .tcv-live-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .tcv-live-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--brand);
        }

        .tcv-live-title i {
          font-size: 14px;
        }

        .tcv-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 26px;
          padding: 0 10px;
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .tcv-copy-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .tcv-copy-btn.done {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .tcv-copy-btn i {
          font-size: 12px;
        }

        .tcv-live-time {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 700;
          color: var(--brand);
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .tcv-live-local {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /*  Tabs Bar  */
        .tcv-tabs-bar {
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .tcv-tabs {
          display: flex;
          padding: 0 14px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tcv-tab {
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

        .tcv-tab i {
          font-size: 13px;
        }

        .tcv-tab:hover {
          color: var(--text);
        }

        .tcv-tab.active {
          color: var(--text);
        }

        .tcv-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 10px;
          right: 10px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .tcv-badge {
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
        .tcv-options-bar {
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
        }

        .tcv-options-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-card);
        }

        .tcv-options-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }

        .tcv-mobile-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: var(--bg-surface);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .tcv-options-scroll {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px 14px;
        }

        .tcv-options-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tcv-options-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 80px;
        }

        .tcv-unit-group {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          flex: 1;
        }

        .tcv-unit-btn {
          height: 28px;
          padding: 0 10px;
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 10.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          text-transform: capitalize;
        }

        .tcv-unit-btn:hover {
          background: var(--bg-surface);
        }

        .tcv-unit-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .tcv-select {
          flex: 1;
          height: 32px;
          padding: 0 10px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--tc-radius-md);
          font-size: 12px;
          color: var(--text);
          cursor: pointer;
          min-width: 200px;
        }

        .tcv-select:focus {
          outline: none;
          border-color: var(--brand-border);
        }

        .tcv-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          user-select: none;
        }

        .tcv-toggle input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .tcv-toggle-track {
          width: 32px;
          height: 18px;
          background: var(--border);
          border-radius: 99px;
          position: relative;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .tcv-toggle input:checked + .tcv-toggle-track {
          background: var(--brand);
        }

        .tcv-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.15s;
        }

        .tcv-toggle input:checked + .tcv-toggle-track .tcv-toggle-thumb {
          transform: translateX(14px);
        }

        .tcv-toggle-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /*  Tab Content  */
        .tcv-tab-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Mobile Bottom Actions  */
        .tcv-mobile-actions {
          display: none;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          padding: 8px 12px;
          gap: 6px;
        }

        .tcv-mob-action {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 36px;
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .tcv-mob-action i {
          font-size: 14px;
        }

        .tcv-mob-action:hover {
          background: var(--border);
          color: var(--text);
        }

        .tcv-mob-action.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /*  Footer  */
        .tcv-footer {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          font-size: 11px;
          color: var(--text-disabled);
        }

        .tcv-footer i {
          font-size: 13px;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .tcv-root {
            min-height: auto;
            border-radius: var(--tc-radius-lg);
          }

          .tcv-chrome {
            padding: 8px 10px;
          }

          .tcv-cmd-label {
            display: none;
          }

          .tcv-preset-primary .tcv-preset-label {
            display: inline;
          }

          .tcv-preset-btn {
            padding: 0 8px;
            min-width: 32px;
            justify-content: center;
          }

          .tcv-preset-primary {
            padding: 0 10px;
            min-width: auto;
          }

          .tcv-mobile-options-btn {
            display: inline-flex;
          }

          .tcv-live {
            padding: 14px 12px;
          }

          .tcv-live-title-text {
            display: none;
          }

          .tcv-copy-text {
            display: none;
          }

          .tcv-live-time {
            font-size: 26px;
          }

          .tcv-options-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            transform: translateY(100%);
            transition: transform 0.3s ease;
          }

          .tcv-options-bar.mobile-visible {
            transform: translateY(0);
          }

          .tcv-options-header {
            display: flex;
          }

          .tcv-options-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .tcv-options-label {
            min-width: auto;
          }

          .tcv-unit-group,
          .tcv-select {
            width: 100%;
          }

          .tcv-mobile-actions {
            display: flex;
          }

          .tcv-tab-label {
            display: none;
          }

          .tcv-tab {
            padding: 0 10px;
          }

          .tcv-tabs {
            padding: 0 10px;
          }
        }

        @media (max-width: 480px) {
          .tcv-live-time {
            font-size: 22px;
          }

          .tcv-live-local {
            font-size: 11px;
          }

          .tcv-footer span {
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tcv-preset-btn,
          .tcv-icon-btn,
          .tcv-tab,
          .tcv-copy-btn,
          .tcv-unit-btn,
          .tcv-toggle-track,
          .tcv-toggle-thumb,
          .tcv-mob-action,
          .tcv-options-bar {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
