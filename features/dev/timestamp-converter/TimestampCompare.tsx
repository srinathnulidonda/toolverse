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
                            <button
                                type="button"
                                className="tcp-now-btn"
                                onClick={() => handleNow("start")}
                            >
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
                            <button
                                type="button"
                                className="tcp-now-btn"
                                onClick={() => handleNow("end")}
                            >
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

            <style jsx>{`
                .tcp-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                .tcp-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--tc-radius-lg, 12px);
                    flex-wrap: wrap;
                }

                .tcp-controls-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                }

                .tcp-controls-title i {
                    font-size: 14px;
                    color: var(--brand);
                }

                .tcp-actions {
                    display: flex;
                    gap: 6px;
                }

                .tcp-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--tc-radius-md, 8px);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .tcp-btn i {
                    font-size: 12px;
                }

                .tcp-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .tcp-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /*  Result  */
                .tcp-result {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    padding: 20px;
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    border-radius: var(--tc-radius-lg, 12px);
                }

                .tcp-result.reversed {
                    background: #FEF3C7;
                    border-color: #FDE68A;
                }

                @media (prefers-color-scheme: dark) {
                    .tcp-result.reversed {
                        background: #451A03;
                        border-color: #78350F;
                    }
                }

                .tcp-result-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--brand);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                }

                .tcp-result.reversed .tcp-result-icon {
                    background: #D97706;
                }

                .tcp-result-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .tcp-result-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--brand-text);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .tcp-result.reversed .tcp-result-label {
                    color: #92400E;
                }

                @media (prefers-color-scheme: dark) {
                    .tcp-result.reversed .tcp-result-label {
                        color: #FCD34D;
                    }
                }

                .tcp-result-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--brand-text);
                    letter-spacing: -0.5px;
                }

                .tcp-result.reversed .tcp-result-value {
                    color: #92400E;
                }

                @media (prefers-color-scheme: dark) {
                    .tcp-result.reversed .tcp-result-value {
                        color: #FCD34D;
                    }
                }

                .tcp-result-breakdown {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .tcp-breakdown-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 8px 14px;
                    background: var(--bg-card);
                    border-radius: var(--tc-radius-md, 8px);
                    min-width: 60px;
                }

                .tcp-breakdown-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                }

                .tcp-breakdown-label {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .tcp-total-seconds {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-top: 10px;
                    border-top: 0.5px solid var(--brand-border);
                }

                .tcp-total-label {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .tcp-total-seconds code {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    background: var(--bg-card);
                    padding: 3px 8px;
                    border-radius: 4px;
                }

                /*  Inputs  */
                .tcp-inputs {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 12px;
                }

                .tcp-input-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--tc-radius-lg, 12px);
                }

                .tcp-input-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .tcp-input-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .tcp-input-label i {
                    font-size: 12px;
                    color: var(--brand);
                }

                .tcp-now-btn {
                    height: 24px;
                    padding: 0 10px;
                    border-radius: 99px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .tcp-now-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .tcp-input {
                    width: 100%;
                    height: 40px;
                    padding: 0 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--tc-radius-md, 8px);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    transition: border-color 0.12s;
                }

                .tcp-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .tcp-input::placeholder {
                    color: var(--text-disabled);
                }

                .tcp-input-preview {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 10px;
                    background: var(--brand-light);
                    border-radius: var(--tc-radius-md, 8px);
                    font-size: 11px;
                    color: var(--brand-text);
                }

                .tcp-input-preview i {
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .tcp-input-error {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 10px;
                    background: var(--error-bg);
                    border-radius: var(--tc-radius-md, 8px);
                    font-size: 11px;
                    color: #B91C1C;
                }

                @media (prefers-color-scheme: dark) {
                    .tcp-input-error {
                        color: #F87171;
                    }
                }

                .tcp-input-error i {
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .tcp-arrow {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-disabled);
                    font-size: 20px;
                }

                /*  Empty State  */
                .tcp-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .tcp-empty-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 13px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: var(--text-disabled);
                    margin-bottom: 6px;
                }

                .tcp-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .tcp-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 900px) {
                    .tcp-inputs {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .tcp-arrow {
                        transform: rotate(90deg);
                        padding: 4px 0;
                    }
                }

                @media (max-width: 768px) {
                    .tcp-root {
                        padding: 12px;
                    }

                    .tcp-btn-text {
                        display: none;
                    }

                    .tcp-controls {
                        padding: 8px 12px;
                    }

                    .tcp-result {
                        padding: 16px;
                    }

                    .tcp-result-value {
                        font-size: 22px;
                    }

                    .tcp-breakdown-item {
                        padding: 6px 10px;
                        min-width: 50px;
                    }

                    .tcp-breakdown-value {
                        font-size: 16px;
                    }

                    .tcp-input-panel {
                        padding: 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .tcp-btn,
                    .tcp-now-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}