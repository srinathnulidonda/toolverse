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
import "./style/TimestampBatch.css";
import "./style/TimestampCompare.css";
import "./style/TimestampHistory.css";
import "./style/TimestampPreview.css";
import "./style/Workspace.css";

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
    </>
  );
}
