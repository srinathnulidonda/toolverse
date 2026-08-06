// features/dev/timestamp-converter/TimestampCompare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { convertTimestamp, calculateDuration, type TimestampOptions } from "./ts/utils";
import styles from "./style/TimestampCompare.module.css";

interface TimestampCompareProps {
  options: TimestampOptions;
}

export default function TimestampCompare({ options }: TimestampCompareProps) {
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

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
    const temp = startInput;
    setStartInput(endInput);
    setEndInput(temp);
  }, [startInput, endInput]);

  const handleClear = useCallback(() => {
    setStartInput("");
    setEndInput("");
  }, []);

  const handleNow = useCallback((target: "start" | "end") => {
    const now = Math.floor(Date.now() / 1000).toString();
    if (target === "start") setStartInput(now);
    else setEndInput(now);
  }, []);

  return (
    <>
      <div className={styles.tcpRoot}>
        {/*  Controls  */}
        <div className={styles.tcpControls}>
          <div className={styles.tcpControlsTitle}>
            <i className="ti ti-calculator" />
            Duration Calculator
          </div>
          <div className={styles.tcpActions}>
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

        {/*  Duration Result  */}
        {duration && (
          <div className={`${styles.tcpResult}${!isEndAfterStart ? ` ${styles.reversed}` : ""}`}>
            <div className={styles.tcpResultIcon}>
              <i className={`ti ${isEndAfterStart ? "ti-clock-forward" : "ti-clock-back"}`} />
            </div>
            <div className={styles.tcpResultContent}>
              <div className={styles.tcpResultLabel}>
                {isEndAfterStart ? "Duration" : "Duration (End is before Start)"}
              </div>
              <div className={styles.tcpResultValue}>{duration.formatted}</div>
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

        {/*  Side-by-Side Inputs  */}
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

          <div className={styles.tcpArrow}>
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

        {/*  Empty State  */}
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
    </>
  );
}