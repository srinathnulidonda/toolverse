// features/dev/timestamp-converter/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

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
  type ConversionResult,
} from "./ts/utils";
import TimestampPreview from "./TimestampPreview";
import TimestampBatch from "./TimestampBatch";
import TimestampCompare from "./TimestampCompare";
import TimestampHistory from "./TimestampHistory";
import { useTimestampStore, type HistoryEntry } from "./ts/timestampStore";
import styles from "./style/Workspace.module.css";

type ViewTab = "single" | "batch" | "compare" | "history";

const TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "single", label: "Convert", icon: "ti-arrows-transfer-up" },
  { id: "batch", label: "Batch", icon: "ti-files" },
  { id: "compare", label: "Duration", icon: "ti-calculator" },
  { id: "history", label: "History", icon: "ti-history" },
];

export default function TimestampConverterWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<TimestampOptions>(DEFAULT_OPTIONS);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [liveCopied, setLiveCopied] = useState(false);
  const [mobileCopiedKey, setMobileCopiedKey] = useState("");
  const [mobileView, setMobileView] = useState<"input" | "output">("input");
  const [showSettings, setShowSettings] = useState(false);

  const { addToHistory, history, clearHistory } = useTimestampStore();

  useEffect(() => {
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

  const addHistoryEntry = useCallback(
    (entryInput: string, entryResult: ConversionResult, entryOptions: TimestampOptions) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        input: entryInput.substring(0, 100),
        output: entryResult.iso,
        timestamp: entryResult.unix,
        options: { ...entryOptions },
        createdAt: Date.now(),
      };
      addToHistory(entry);
    },
    [addToHistory]
  );

  const handleCopy = useCallback(
    async (text: string, historySource?: { input: string; result: ConversionResult }) => {
      try {
        await navigator.clipboard.writeText(text);
        if (historySource) {
          addHistoryEntry(historySource.input, historySource.result, options);
        }
        return true;
      } catch {
        logger.error("Failed to copy to clipboard");
        return false;
      }
    },
    [addHistoryEntry, options]
  );

  const handleLiveCopy = useCallback(async () => {
    if (currentTime === null || !currentTimeResult) return;
    const ok = await handleCopy(currentTime.toString(), {
      input: currentTime.toString(),
      result: currentTimeResult,
    });
    if (ok) {
      setLiveCopied(true);
      setTimeout(() => setLiveCopied(false), 1500);
    }
  }, [currentTime, currentTimeResult, handleCopy]);

  const handleMobileCopy = useCallback(
    async (text: string, key: string) => {
      if (!result) return;
      const ok = await handleCopy(text, { input, result });
      if (ok) {
        setMobileCopiedKey(key);
        setTimeout(() => setMobileCopiedKey(""), 1500);
      }
    },
    [handleCopy, input, result]
  );

  const handleClearInput = useCallback(() => {
    setInput("");
  }, []);

  const loadSample = useCallback((preset: (typeof SAMPLE_TIMESTAMPS)[number]) => {
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
  }, [currentTime]);

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setInput(entry.input);
    setOptions(entry.options);
    setViewTab("single");
    setMobileView("input");
  }, []);

  const quickSamples = useMemo(() => SAMPLE_TIMESTAMPS.slice(1, 5), []);

  return (
    <div className={styles.tcvRoot}>
      <div className={styles.tcvChrome}>
        <div className={styles.tcvChromeLeft}>
          <div className={styles.tcvTitle}>
            <div className={styles.tcvTitleIcon}>
              <i className="ti ti-clock-hour-4" />
            </div>
            Timestamp Converter
            <span className={styles.tcvTitleBadge}>{options.unit}</span>
          </div>
        </div>
        <div className={styles.tcvChromeRight}>
          <button type="button" className={styles.tcvNowBtn} onClick={loadCurrent}>
            <i className="ti ti-clock" />
            <span>Now</span>
          </button>
          <button
            type="button"
            className={`${styles.tcvSettingsBtn} ${showSettings ? styles.active : ""}`}
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            aria-label="Toggle options"
          >
            <i className="ti ti-settings" />
            <span>Options</span>
          </button>
        </div>
      </div>

      <div className={styles.tcvLive}>
        <div className={styles.tcvLiveHeader}>
          <div className={styles.tcvLiveTitle}>
            <i className="ti ti-clock-hour-4" />
            <span className={styles.tcvLiveTitleText}>Current Unix Timestamp</span>
          </div>
          <button
            type="button"
            className={`${styles.tcvCopyBtn}${liveCopied ? ` ${styles.copied}` : ""}`}
            disabled={currentTime === null}
            onClick={handleLiveCopy}
          >
            <i className={`ti ${liveCopied ? "ti-check" : "ti-copy"}`} />
            <span className={styles.tcvCopyText}>{liveCopied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <div className={styles.tcvLiveTime} suppressHydrationWarning>
          {currentTime !== null ? currentTime : "—"}
        </div>
        <div className={styles.tcvLiveLocal}>{currentTimeResult?.local ?? ""}</div>
      </div>

      <div className={styles.tcvTabsBar}>
        <nav className={styles.tcvTabs} role="tablist">
          {TABS.map((tab) => (
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
                <span className={styles.tcvTabBadge}>{history.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {showSettings && (
        <div className={styles.tcvSettings}>
          <div className={styles.tcvSettingsGrid}>
            <div className={styles.tcvSettingGroup}>
              <label className={styles.tcvSettingLabel} htmlFor="tcv-input-unit">
                Input Unit
              </label>
              <div className={styles.tcvUnitGroup} id="tcv-input-unit">
                {(["seconds", "milliseconds", "microseconds", "nanoseconds"] as TimeUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={`${styles.tcvUnitBtn}${options.unit === u ? ` ${styles.active}` : ""}`}
                    onClick={() => setOptions((prev) => ({ ...prev, unit: u }))}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.tcvSettingGroup}>
              <label className={styles.tcvSettingLabel} htmlFor="tcv-timezone">
                Timezone
              </label>
              <select
                id="tcv-timezone"
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

            <div className={styles.tcvSettingGroup}>
              <span className={styles.tcvSettingLabel}>Format</span>
              <label className={styles.tcvToggle}>
                <input
                  type="checkbox"
                  checked={options.use24Hour}
                  onChange={(e) => setOptions((prev) => ({ ...prev, use24Hour: e.target.checked }))}
                />
                <span className={styles.tcvToggleTrack}>
                  <span className={styles.tcvToggleThumb} />
                </span>
                <span>24-hour format</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tcvContent}>
        {viewTab === "single" && (
          <TimestampPreview
            input={input}
            result={result}
            options={options}
            error={!validation.valid ? validation.error || null : null}
            mobileView={mobileView}
            samples={quickSamples}
            onInputChange={setInput}
            onMobileViewChange={setMobileView}
            onLoadSample={loadSample}
          />
        )}

        {viewTab === "batch" && <TimestampBatch options={options} />}

        {viewTab === "compare" && <TimestampCompare options={options} />}

        {viewTab === "history" && (
          <TimestampHistory history={history} onClear={clearHistory} onRestore={restoreFromHistory} />
        )}
      </div>

      {viewTab === "single" && result && (
        <div className={styles.tcvMobActions}>
          <button
            type="button"
            className={`${styles.tcvMobBtn}${mobileCopiedKey === "iso" ? ` ${styles.success}` : ""}`}
            onClick={() => handleMobileCopy(result.iso, "iso")}
          >
            <i className={`ti ${mobileCopiedKey === "iso" ? "ti-check" : "ti-copy"}`} />
            {mobileCopiedKey === "iso" ? "Copied" : "Copy ISO"}
          </button>
          <button
            type="button"
            className={`${styles.tcvMobBtn}${mobileCopiedKey === "unix" ? ` ${styles.success}` : ""}`}
            onClick={() => handleMobileCopy(result.unix.toString(), "unix")}
          >
            <i className={`ti ${mobileCopiedKey === "unix" ? "ti-check" : "ti-hash"}`} />
            {mobileCopiedKey === "unix" ? "Copied" : "Copy Unix"}
          </button>
          <button type="button" className={styles.tcvMobBtn} onClick={handleClearInput}>
            <i className="ti ti-trash" />
            Clear
          </button>
        </div>
      )}

      <div className={styles.tcvFooter}>
        <div className={styles.tcvFooterLeft}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
        {viewTab === "single" && result && (
          <div className={styles.tcvFooterRight}>
            <span className={styles.tcvFooterUnit}>{options.unit}</span>
            <span>·</span>
            <span>{options.timezone}</span>
            <span>·</span>
            <span className={validation.valid ? styles.tcvValid : styles.tcvInvalid}>
              <i className={`ti ${validation.valid ? "ti-check" : "ti-x"}`} />
              {validation.valid ? "Valid" : "Invalid"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}