// features/dev/timestamp-converter/TimestampCompare.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useMemo, useCallback } from "react";
import { convertTimestamp, calculateDuration, type TimestampOptions, type TimeUnit } from "./ts/utils";
import styles from "./style/TimestampCompare.module.css";

interface TimestampCompareProps {
  options: TimestampOptions;
}

function nowForUnit(unit: TimeUnit): string {
  const ms = Date.now();
  switch (unit) {
    case "milliseconds":
      return ms.toString();
    case "microseconds":
      return (ms * 1000).toString();
    case "nanoseconds":
      return (ms * 1e6).toString();
    case "seconds":
    default:
      return Math.floor(ms / 1000).toString();
  }
}

export default function TimestampCompare({ options }: TimestampCompareProps) {
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [copied, setCopied] = useState(false);

  const startResult = useMemo(() => {
    if (!startInput.trim()) return null;
    return convertTimestamp(startInput, options);
  }, [startInput, options]);

  const endResult = useMemo(() => {
    if (!endInput.trim()) return null;
    return convertTimestamp(endInput, options);
  }, [endInput, options]);

  const duration = useMemo(() => {
    if (!startResult || !endResult) return null;
    return calculateDuration(startResult.unix, endResult.unix);
  }, [startResult, endResult]);

  const isEndAfterStart = useMemo(() => {
    if (!startResult || !endResult) return true;
    return endResult.unix >= startResult.unix;
  }, [startResult, endResult]);

  const handleSwap = useCallback(() => {
    setStartInput(endInput);
    setEndInput(startInput);
  }, [startInput, endInput]);

  const handleClear = useCallback(() => {
    setStartInput("");
    setEndInput("");
  }, []);

  const handleNow = useCallback(
    (target: "start" | "end") => {
      const value = nowForUnit(options.unit);
      if (target === "start") setStartInput(value);
      else setEndInput(value);
    },
    [options.unit]
  );

  const handleCopyResult = useCallback(async () => {
    if (!duration) return;
    const text = `${duration.formatted} (${duration.total.toLocaleString()} seconds)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      logger.error("Failed to copy duration to clipboard");
    }
  }, [duration]);

  return (
    <div className={styles.tcpRoot}>
      <div className={styles.tcpControls}>
        <div className={styles.tcpControlsTitle}>
          <i className="ti ti-calculator" />
          Duration Calculator
        </div>
        <div className={styles.tcpActions}>
          <button
            type="button"
            className={styles.tcpBtn}
            onClick={handleCopyResult}
            disabled={!duration}
          >
            <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
            <span className={styles.tcpBtnText}>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            type="button"
            className={styles.tcpBtn}
            onClick={handleSwap}
            disabled={!startInput || !endInput}
          >
            <i className="ti ti-arrows-left-right" />
            <span className={styles.tcpBtnText}>Swap</span>
          </button>
          <button
            type="button"
            className={styles.tcpBtn}
            onClick={handleClear}
            disabled={!startInput && !endInput}
          >
            <i className="ti ti-trash" />
            <span className={styles.tcpBtnText}>Clear</span>
          </button>
        </div>
      </div>

      {duration && (
        <div
          className={`${styles.tcpResult}${!isEndAfterStart ? ` ${styles.reversed}` : ""}`}
          role="status"
          aria-live="polite"
        >
          <div className={styles.tcpResultTop}>
            <div className={styles.tcpResultIcon}>
              <i className={`ti ${isEndAfterStart ? "ti-clock-forward" : "ti-clock-back"}`} />
            </div>
            <div className={styles.tcpResultContent}>
              <div className={styles.tcpResultLabel}>
                {isEndAfterStart ? "Duration" : "Duration (End is before Start)"}
              </div>
              <div className={styles.tcpResultValue}>{duration.formatted}</div>
            </div>
          </div>
          <div className={styles.tcpResultBreakdown}>
            {duration.days > 0 && (
              <div className={styles.tcpBreakdownItem}>
                <span className={styles.tcpBreakdownValue}>{duration.days}</span>
                <span className={styles.tcpBreakdownLabel}>days</span>
              </div>
            )}
            <div className={styles.tcpBreakdownItem}>
              <span className={styles.tcpBreakdownValue}>{duration.hours}</span>
              <span className={styles.tcpBreakdownLabel}>hrs</span>
            </div>
            <div className={styles.tcpBreakdownItem}>
              <span className={styles.tcpBreakdownValue}>{duration.minutes}</span>
              <span className={styles.tcpBreakdownLabel}>min</span>
            </div>
            <div className={styles.tcpBreakdownItem}>
              <span className={styles.tcpBreakdownValue}>{duration.seconds}</span>
              <span className={styles.tcpBreakdownLabel}>sec</span>
            </div>
          </div>
          <div className={styles.tcpTotalSeconds}>
            <span className={styles.tcpTotalLabel}>Total seconds:</span>
            <code>{duration.total.toLocaleString()}</code>
          </div>
        </div>
      )}

      <div className={styles.tcpInputs}>
        <div className={styles.tcpInputPanel}>
          <div className={styles.tcpInputHeader}>
            <div className={styles.tcpInputLabel}>
              <i className="ti ti-player-play" />
              Start Time
            </div>
            <button type="button" className={styles.tcpNowBtn} onClick={() => handleNow("start")}>
              Now
            </button>
          </div>
          <input
            type="text"
            className={styles.tcpInput}
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            placeholder="Enter timestamp or date..."
            spellCheck={false}
            aria-label="Start time"
          />
          {startResult && (
            <div className={styles.tcpInputPreview}>
              <i className="ti ti-check" />
              <span>{startResult.local}</span>
            </div>
          )}
          {startInput && !startResult && (
            <div className={styles.tcpInputError}>
              <i className="ti ti-alert-circle" />
              Invalid format
            </div>
          )}
        </div>

        <div className={styles.tcpArrow} aria-hidden="true">
          <i className="ti ti-arrow-right" />
        </div>

        <div className={styles.tcpInputPanel}>
          <div className={styles.tcpInputHeader}>
            <div className={styles.tcpInputLabel}>
              <i className="ti ti-player-stop" />
              End Time
            </div>
            <button type="button" className={styles.tcpNowBtn} onClick={() => handleNow("end")}>
              Now
            </button>
          </div>
          <input
            type="text"
            className={styles.tcpInput}
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            placeholder="Enter timestamp or date..."
            spellCheck={false}
            aria-label="End time"
          />
          {endResult && (
            <div className={styles.tcpInputPreview}>
              <i className="ti ti-check" />
              <span>{endResult.local}</span>
            </div>
          )}
          {endInput && !endResult && (
            <div className={styles.tcpInputError}>
              <i className="ti ti-alert-circle" />
              Invalid format
            </div>
          )}
        </div>
      </div>

      {!startInput && !endInput && (
        <div className={styles.tcpEmpty}>
          <div className={styles.tcpEmptyIcon}>
            <i className="ti ti-calculator" />
          </div>
          <p className={styles.tcpEmptyTitle}>Calculate Duration Between Dates</p>
          <p className={styles.tcpEmptyDesc}>
            Enter start and end timestamps to calculate the duration between them
          </p>
        </div>
      )}
    </div>
  );
}