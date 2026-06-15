// features/dev/timestamp-converter/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Tool } from "@/lib/tools";

type TimeUnit = "seconds" | "milliseconds";

interface ConversionResult {
    unix: number;
    unixMs: number;
    iso: string;
    utc: string;
    local: string;
    relative: string;
}

const PRESETS = [
    { id: "now", label: "Now", getValue: () => Math.floor(Date.now() / 1000) },
    { id: "yesterday", label: "Yesterday", getValue: () => Math.floor((Date.now() - 86400000) / 1000) },
    { id: "week", label: "Week Ago", getValue: () => Math.floor((Date.now() - 604800000) / 1000) },
    { id: "year", label: "Year Ago", getValue: () => Math.floor((Date.now() - 31536000000) / 1000) },
];

function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const absDiff = Math.abs(diff);
    const isFuture = diff < 0;

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (weeks > 0) return `${weeks} week${weeks !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    return `${seconds} second${seconds !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
}

function convertTimestamp(input: string, unit: TimeUnit): ConversionResult | null {
    try {
        let unix: number;

        if (input.trim() === "") return null;

        // Try parsing as Unix timestamp
        const num = parseFloat(input);
        if (!isNaN(num)) {
            unix = unit === "milliseconds" ? Math.floor(num / 1000) : num;
        } else {
            // Try parsing as date string
            const date = new Date(input);
            if (isNaN(date.getTime())) return null;
            unix = Math.floor(date.getTime() / 1000);
        }

        const date = new Date(unix * 1000);
        if (isNaN(date.getTime())) return null;

        return {
            unix,
            unixMs: unix * 1000,
            iso: date.toISOString(),
            utc: date.toUTCString(),
            local: date.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short",
            }),
            relative: formatRelativeTime(unix),
        };
    } catch {
        return null;
    }
}

export default function TimestampConverterWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [unit, setUnit] = useState<TimeUnit>("seconds");
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
    const [copiedKey, setCopiedKey] = useState("");

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const result = useMemo(() => {
        return convertTimestamp(input, unit);
    }, [input, unit]);

    const currentTimeResult = useMemo(() => {
        return convertTimestamp(currentTime.toString(), "seconds");
    }, [currentTime]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadPreset = (preset: typeof PRESETS[0]) => {
        const value = preset.getValue();
        setInput(value.toString());
        setUnit("seconds");
    };

    const loadCurrent = () => {
        setInput(currentTime.toString());
        setUnit("seconds");
    };

    return (
        <>
            <div className="tc-root">
                {/* Command Bar */}
                <div className="tc-cmd">
                    <div className="tc-cmd-left">
                        <span className="tc-cmd-label">Quick</span>
                        <button className="tc-preset-btn tc-preset-btn--primary" onClick={loadCurrent}>
                            <i className="ti ti-clock" />
                            <span className="tc-preset-label">Current Time</span>
                        </button>
                        {PRESETS.map((p) => (
                            <button key={p.id} className="tc-preset-btn" onClick={() => loadPreset(p)}>
                                <span className="tc-preset-label">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live Current Time */}
                <div className="tc-live">
                    <div className="tc-live-header">
                        <div className="tc-live-title">
                            <i className="ti ti-clock-hour-4" />
                            Current Unix Timestamp
                        </div>
                        <button
                            className={`tc-copy-btn${copiedKey === "current" ? " --done" : ""}`}
                            onClick={() => copy(currentTime.toString(), "current")}
                        >
                            <i className={`ti ${copiedKey === "current" ? "ti-check" : "ti-copy"}`} />
                            {copiedKey === "current" ? "Copied" : "Copy"}
                        </button>
                    </div>
                    <div className="tc-live-time">{currentTime}</div>
                    <div className="tc-live-local">{currentTimeResult?.local}</div>
                </div>

                <div className="tc-body">
                    {/* Input */}
                    <div className="tc-section">
                        <div className="tc-section-header">
                            <div className="tc-section-title">
                                <i className="ti ti-pencil" />
                                Convert Timestamp
                            </div>
                            <div className="tc-unit-toggle">
                                <button
                                    className={`tc-unit${unit === "seconds" ? " --on" : ""}`}
                                    onClick={() => setUnit("seconds")}
                                >
                                    Seconds
                                </button>
                                <button
                                    className={`tc-unit${unit === "milliseconds" ? " --on" : ""}`}
                                    onClick={() => setUnit("milliseconds")}
                                >
                                    Milliseconds
                                </button>
                            </div>
                        </div>
                        <input
                            type="text"
                            className="tc-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter Unix timestamp or date string (e.g., 2024-01-15)"
                            spellCheck={false}
                        />
                        {input && !result && (
                            <div className="tc-error">
                                <i className="ti ti-alert-circle" />
                                Invalid timestamp or date format
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    {result && (
                        <>
                            {/* Formats Grid */}
                            <div className="tc-section">
                                <div className="tc-section-header">
                                    <div className="tc-section-title">
                                        <i className="ti ti-calendar" />
                                        Date Formats
                                    </div>
                                </div>
                                <div className="tc-formats">
                                    <div className="tc-format">
                                        <div className="tc-format-label">
                                            <i className="ti ti-hash" />
                                            Unix Timestamp (seconds)
                                        </div>
                                        <div className="tc-format-value">{result.unix}</div>
                                        <button
                                            className={`tc-mini-copy${copiedKey === "unix" ? " --ok" : ""}`}
                                            onClick={() => copy(result.unix.toString(), "unix")}
                                        >
                                            <i className={`ti ${copiedKey === "unix" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>

                                    <div className="tc-format">
                                        <div className="tc-format-label">
                                            <i className="ti ti-hash" />
                                            Unix Timestamp (milliseconds)
                                        </div>
                                        <div className="tc-format-value">{result.unixMs}</div>
                                        <button
                                            className={`tc-mini-copy${copiedKey === "unixMs" ? " --ok" : ""}`}
                                            onClick={() => copy(result.unixMs.toString(), "unixMs")}
                                        >
                                            <i className={`ti ${copiedKey === "unixMs" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>

                                    <div className="tc-format">
                                        <div className="tc-format-label">
                                            <i className="ti ti-calendar-time" />
                                            ISO 8601
                                        </div>
                                        <div className="tc-format-value">{result.iso}</div>
                                        <button
                                            className={`tc-mini-copy${copiedKey === "iso" ? " --ok" : ""}`}
                                            onClick={() => copy(result.iso, "iso")}
                                        >
                                            <i className={`ti ${copiedKey === "iso" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>

                                    <div className="tc-format">
                                        <div className="tc-format-label">
                                            <i className="ti ti-world" />
                                            UTC
                                        </div>
                                        <div className="tc-format-value">{result.utc}</div>
                                        <button
                                            className={`tc-mini-copy${copiedKey === "utc" ? " --ok" : ""}`}
                                            onClick={() => copy(result.utc, "utc")}
                                        >
                                            <i className={`ti ${copiedKey === "utc" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>

                                    <div className="tc-format">
                                        <div className="tc-format-label">
                                            <i className="ti ti-map-pin" />
                                            Local Time
                                        </div>
                                        <div className="tc-format-value">{result.local}</div>
                                        <button
                                            className={`tc-mini-copy${copiedKey === "local" ? " --ok" : ""}`}
                                            onClick={() => copy(result.local, "local")}
                                        >
                                            <i className={`ti ${copiedKey === "local" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>

                                    <div className="tc-format">
                                        <div className="tc-format-label">
                                            <i className="ti ti-history" />
                                            Relative Time
                                        </div>
                                        <div className="tc-format-value">{result.relative}</div>
                                        <button
                                            className={`tc-mini-copy${copiedKey === "relative" ? " --ok" : ""}`}
                                            onClick={() => copy(result.relative, "relative")}
                                        >
                                            <i className={`ti ${copiedKey === "relative" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!input && (
                        <div className="tc-empty">
                            <div className="tc-empty-icon">
                                <i className="ti ti-clock-edit" />
                            </div>
                            <p className="tc-empty-title">Convert Timestamps & Dates</p>
                            <p className="tc-empty-desc">
                                Enter a Unix timestamp or date string to convert between different formats
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="tc-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .tc-root {
                    --tc-radius-sm: 6px;
                    --tc-radius-md: 8px;
                    --tc-radius-lg: 12px;
                    --tc-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--tc-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .tc-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .tc-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .tc-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .tc-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--tc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .tc-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .tc-preset-btn--primary {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .tc-preset-btn i {
                    font-size: 13px;
                }

                .tc-live {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 16px;
                    background: linear-gradient(135deg, var(--brand-light) 0%, var(--bg-surface) 100%);
                    border-bottom: 0.5px solid var(--border);
                }

                .tc-live-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .tc-live-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--brand);
                }

                .tc-live-title i {
                    font-size: 14px;
                }

                .tc-live-time {
                    font-family: var(--font-mono);
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--brand);
                    letter-spacing: -0.5px;
                    line-height: 1;
                }

                .tc-live-local {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .tc-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .tc-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .tc-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .tc-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .tc-section-title i {
                    font-size: 14px;
                }

                .tc-unit-toggle {
                    display: inline-flex;
                    gap: 2px;
                    padding: 2px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--tc-radius-md);
                }

                .tc-unit {
                    height: 26px;
                    padding: 0 10px;
                    border: none;
                    border-radius: 5px;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .tc-unit:hover {
                    background: var(--bg-surface);
                }

                .tc-unit.--on {
                    background: var(--brand-light);
                    color: var(--brand);
                }

                .tc-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--tc-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    transition: border-color 0.12s;
                }

                .tc-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .tc-input::placeholder {
                    color: var(--text-disabled);
                }

                .tc-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 7px;
                    padding: 10px 12px;
                    background: #fef2f2;
                    border: 0.5px solid #fecaca;
                    border-radius: var(--tc-radius-md);
                    color: #991b1b;
                    font-size: 12px;
                    line-height: 1.5;
                }

                @media (prefers-color-scheme: dark) {
                    .tc-error {
                        background: #1c0a0a;
                        border-color: #7f1d1d;
                        color: #f87171;
                    }
                }

                .tc-error i {
                    font-size: 14px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .tc-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .tc-empty-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: var(--text-disabled);
                    margin-bottom: 6px;
                }

                .tc-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .tc-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                    line-height: 1.6;
                }

                .tc-copy-btn {
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

                .tc-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .tc-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .tc-copy-btn i {
                    font-size: 12px;
                }

                .tc-formats {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .tc-format {
                    display: grid;
                    grid-template-columns: 200px 1fr auto;
                    gap: 12px;
                    align-items: center;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--tc-radius-md);
                    transition: background 0.1s;
                }

                .tc-format:hover {
                    background: var(--bg-surface);
                }

                .tc-format-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .tc-format-label i {
                    font-size: 13px;
                    color: var(--brand);
                }

                .tc-format-value {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    word-break: break-all;
                }

                .tc-mini-copy {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.1s;
                    flex-shrink: 0;
                }

                .tc-format:hover .tc-mini-copy {
                    opacity: 1;
                }

                .tc-mini-copy:hover {
                    background: var(--bg-card);
                    color: var(--brand);
                }

                .tc-mini-copy.--ok {
                    opacity: 1;
                    color: var(--brand);
                }

                .tc-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .tc-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .tc-cmd {
                        padding: 10px 12px;
                    }

                    .tc-cmd-label {
                        display: none;
                    }

                    .tc-preset-label {
                        display: none;
                    }

                    .tc-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .tc-preset-btn--primary {
                        padding: 0 10px;
                    }

                    .tc-preset-btn--primary .tc-preset-label {
                        display: inline;
                    }

                    .tc-live {
                        padding: 14px 12px;
                    }

                    .tc-live-time {
                        font-size: 28px;
                    }

                    .tc-body {
                        padding: 12px;
                    }

                    .tc-format {
                        grid-template-columns: 1fr auto;
                        gap: 8px;
                    }

                    .tc-format-label {
                        grid-column: 1 / -1;
                    }

                    .tc-empty {
                        padding: 40px 20px;
                    }
                }
            `}</style>
        </>
    );
}