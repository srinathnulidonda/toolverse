// features/dev/timestamp-converter/TimestampCompare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { convertTimestamp, calculateDuration, type TimestampOptions } from "./utils";

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
      <div className="tcp-root">
        {/*  Controls  */}
        <div className="tcp-controls">
          <div className="tcp-controls-title">
            <i className="ti ti-calculator" />
            Duration Calculator
          </div>
          <div className="tcp-actions">
            <button
              type="button"
              className="tcp-btn"
              onClick={handleSwap}
              disabled={!startInput || !endInput}
            >
              <i className="ti ti-arrows-left-right" />
              <span className="tcp-btn-text">Swap</span>
            </button>
            <button
              type="button"
              className="tcp-btn"
              onClick={handleClear}
              disabled={!startInput && !endInput}
            >
              <i className="ti ti-trash" />
              <span className="tcp-btn-text">Clear</span>
            </button>
          </div>
        </div>

        {/*  Duration Result  */}
        {duration && (
          <div className={`tcp-result${!isEndAfterStart ? " reversed" : ""}`}>
            <div className="tcp-result-icon">
              <i className={`ti ${isEndAfterStart ? "ti-clock-forward" : "ti-clock-back"}`} />
            </div>
            <div className="tcp-result-content">
              <div className="tcp-result-label">
                {isEndAfterStart ? "Duration" : "Duration (End is before Start)"}
              </div>
              <div className="tcp-result-value">{duration.formatted}</div>
            </div>
            <div className="tcp-result-breakdown">
              {duration.days > 0 && (
                <div className="tcp-breakdown-item">
                  <span className="tcp-breakdown-value">{duration.days}</span>
                  <span className="tcp-breakdown-label">days</span>
                </div>
              )}
              <div className="tcp-breakdown-item">
                <span className="tcp-breakdown-value">{duration.hours}</span>
                <span className="tcp-breakdown-label">hrs</span>
              </div>
              <div className="tcp-breakdown-item">
                <span className="tcp-breakdown-value">{duration.minutes}</span>
                <span className="tcp-breakdown-label">min</span>
              </div>
              <div className="tcp-breakdown-item">
                <span className="tcp-breakdown-value">{duration.seconds}</span>
                <span className="tcp-breakdown-label">sec</span>
              </div>
            </div>
            <div className="tcp-total-seconds">
              <span className="tcp-total-label">Total seconds:</span>
              <code>{duration.total.toLocaleString()}</code>
            </div>
          </div>
        )}

        {/*  Side-by-Side Inputs  */}
        <div className="tcp-inputs">
          <div className="tcp-input-panel">
            <div className="tcp-input-header">
              <div className="tcp-input-label">
                <i className="ti ti-player-play" />
                Start Time
              </div>
              <button type="button" className="tcp-now-btn" onClick={() => handleNow("start")}>
                Now
              </button>
            </div>
            <input
              type="text"
              className="tcp-input"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              placeholder="Enter timestamp or date..."
              spellCheck={false}
            />
            {startResult && (
              <div className="tcp-input-preview">
                <i className="ti ti-check" />
                <span>{startResult.local}</span>
              </div>
            )}
            {startInput && !startResult && (
              <div className="tcp-input-error">
                <i className="ti ti-alert-circle" />
                Invalid format
              </div>
            )}
          </div>

          <div className="tcp-arrow">
            <i className="ti ti-arrow-right" />
          </div>

          <div className="tcp-input-panel">
            <div className="tcp-input-header">
              <div className="tcp-input-label">
                <i className="ti ti-player-stop" />
                End Time
              </div>
              <button type="button" className="tcp-now-btn" onClick={() => handleNow("end")}>
                Now
              </button>
            </div>
            <input
              type="text"
              className="tcp-input"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              placeholder="Enter timestamp or date..."
              spellCheck={false}
            />
            {endResult && (
              <div className="tcp-input-preview">
                <i className="ti ti-check" />
                <span>{endResult.local}</span>
              </div>
            )}
            {endInput && !endResult && (
              <div className="tcp-input-error">
                <i className="ti ti-alert-circle" />
                Invalid format
              </div>
            )}
          </div>
        </div>

        {/*  Empty State  */}
        {!startInput && !endInput && (
          <div className="tcp-empty">
            <div className="tcp-empty-icon">
              <i className="ti ti-calculator" />
            </div>
            <p className="tcp-empty-title">Calculate Duration Between Dates</p>
            <p className="tcp-empty-desc">
              Enter start and end timestamps to calculate the duration between them
            </p>
          </div>
        )}
      </div>
    </>
  );
}
