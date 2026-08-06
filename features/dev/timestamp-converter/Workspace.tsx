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
} from "./ts/utils";
import TimestampPreview from "./TimestampPreview";
import TimestampBatch from "./TimestampBatch";
import TimestampCompare from "./TimestampCompare";
import TimestampHistory from "./TimestampHistory";
import { useTimestampStore, type HistoryEntry } from "./ts/timestampStore";
import styles from "./style/Workspace.module.css";

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
      <div className={styles.tcvRoot}>
        {/*  Top Chrome  */}
        <div className={styles.tcvChrome}>
          <div className={styles.tcvChromeLeft}>
            <button className={`${styles.tcvPresetBtn} ${styles.tcvPresetPrimary}`} onClick={loadCurrent}>
              <i className="ti ti-clock" />
              <span className={styles.tcvPresetLabel}>Now</span>
            </button>
            <span className={styles.tcvCmdLabel}>Quick:</span>
            {SAMPLE_TIMESTAMPS.slice(1, 4).map((p) => (
              <button key={p.id} className={styles.tcvPresetBtn} onClick={() => loadSample(p)}>
                <span className={styles.tcvPresetLabel}>{p.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.tcvChromeRight}>
            {viewTab === "single" && (
              <button
                type="button"
                className={`${styles.tcvIconBtn} ${styles.tcvMobileOptionsBtn}`}
                onClick={() => setShowMobileOptions(!showMobileOptions)}
                aria-label="Toggle options"
              >
                <i className="ti ti-settings" />
              </button>
            )}
            <button
              type="button"
              className={`${styles.tcvIconBtn} ${styles.tcvClearBtn}`}
              onClick={handleClear}
              disabled={!input}
              title="Clear all"
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>

        {/*  Live Current Time Banner  */}
        <div className={styles.tcvLive}>
          <div className={styles.tcvLiveHeader}>
            <div className={styles.tcvLiveTitle}>
              <i className="ti ti-clock-hour-4" />
              <span className={styles.tcvLiveTitleText}>Current Unix Timestamp</span>
            </div>
            <button
              className={`${styles.tcvCopyBtn}${copied ? ` ${styles.done}` : ""}`}
              disabled={currentTime === null}
              onClick={() => {
                if (currentTime !== null) {
                  handleCopy(currentTime.toString());
                }
              }}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
              <span className={styles.tcvCopyText}>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className={styles.tcvLiveTime} suppressHydrationWarning>
            {currentTime !== null ? currentTime : "--"}
          </div>
          <div className={styles.tcvLiveLocal}>{currentTimeResult?.local}</div>
        </div>

        {/*  View Tabs  */}
        <div className={styles.tcvTabsBar}>
          <nav className={styles.tcvTabs} role="tablist">
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
                className={`${styles.tcvTab}${viewTab === tab.id ? ` ${styles.active}` : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                <span className={styles.tcvTabLabel}>{tab.label}</span>
                {tab.id === "history" && history.length > 0 && (
                  <span className={styles.tcvBadge}>{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Options Bar (Single view only)  */}
        {viewTab === "single" && (
          <div className={`${styles.tcvOptionsBar}${showMobileOptions ? ` ${styles.mobileVisible}` : ""}`}>
            <div className={styles.tcvOptionsHeader}>
              <span className={styles.tcvOptionsTitle}>
                <i className="ti ti-adjustments" />
                Options
              </span>
              <button
                type="button"
                className={styles.tcvMobileCloseBtn}
                onClick={() => setShowMobileOptions(false)}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className={styles.tcvOptionsScroll}>
              <div className={styles.tcvOptionsRow}>
                <span className={styles.tcvOptionsLabel}>Input Unit</span>
                <div className={styles.tcvUnitGroup}>
                  {(["seconds", "milliseconds", "microseconds", "nanoseconds"] as TimeUnit[]).map(
                    (u) => (
                      <button
                        key={u}
                        className={`${styles.tcvUnitBtn}${options.unit === u ? ` ${styles.active}` : ""}`}
                        onClick={() => setOptions((prev) => ({ ...prev, unit: u }))}
                      >
                        {u}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className={styles.tcvOptionsRow}>
                <span className={styles.tcvOptionsLabel}>Timezone</span>
                <select
                  className={styles.tcvSelect}
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

              <div className={styles.tcvOptionsRow}>
                <label className={styles.tcvToggle}>
                  <input
                    type="checkbox"
                    checked={options.use24Hour}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, use24Hour: e.target.checked }))
                    }
                  />
                  <span className={styles.tcvToggleTrack}>
                    <span className={styles.tcvToggleThumb} />
                  </span>
                  <span className={styles.tcvToggleLabel}>24-hour format</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/*  Tab Content  */}
        <div className={styles.tcvTabContent}>
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
          <div className={styles.tcvMobileActions}>
            <button
              type="button"
              className={`${styles.tcvMobAction}${copied ? ` ${styles.success}` : ""}`}
              onClick={() => handleCopy(result.iso)}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
              {copied ? "Copied" : "Copy ISO"}
            </button>
            <button
              type="button"
              className={styles.tcvMobAction}
              onClick={() => handleCopy(result.unix.toString())}
            >
              <i className="ti ti-hash" />
              Copy Unix
            </button>
            <button type="button" className={styles.tcvMobAction} onClick={handleClear}>
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        )}

        {/*  Footer  */}
        <div className={styles.tcvFooter}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}