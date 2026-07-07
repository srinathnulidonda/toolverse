// features/dev/css-minifier/CSSPreview.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { processCSS, SAMPLE_CSS } from "./utils";
import { formatBytes } from "@/utils";
import type { MinifyOptions } from "./utils";

interface CSSPreviewProps {
    onProcess?: (entry: any) => void;
}

export default function CSSPreview({ onProcess }: CSSPreviewProps) {
    const [input, setInput] = useState("");
    const [options, setOptions] = useState<MinifyOptions>({
        removeComments: true,
        removeWhitespace: true,
        removeLastSemicolon: true,
        preserveImportant: true,
    });
    const [copiedKey, setCopiedKey] = useState("");
    const [mobileView, setMobileView] = useState<"input" | "output">("input");

    const result = useMemo(() => {
        if (!input.trim()) return null;
        try {
            return processCSS(input, options);
        } catch {
            return null;
        }
    }, [input, options]);

    const handleCopy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1500);
    }, []);

    const handleDownload = useCallback(() => {
        if (!result) return;
        const blob = new Blob([result.output], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "minified.css";
        a.click();
        URL.revokeObjectURL(url);

        if (onProcess) {
            onProcess({
                id: Date.now().toString(),
                input: input.substring(0, 100),
                output: result.output.substring(0, 100),
                timestamp: Date.now(),
                stats: result.stats,
            });
        }
    }, [result, input, onProcess]);

    const loadSample = useCallback(() => {
        setInput(SAMPLE_CSS);
        setMobileView("input");
    }, []);

    return (
        <>
            <div className="cp-root">
                {/*  Options Bar  */}
                <div className="cp-options">
                    <div className="cp-options-label">Options:</div>
                    <label className="cp-toggle">
                        <input
                            type="checkbox"
                            checked={options.removeComments}
                            onChange={(e) =>
                                setOptions({ ...options, removeComments: e.target.checked })
                            }
                        />
                        <span className="cp-toggle-track">
                            <span className="cp-toggle-thumb" />
                        </span>
                        <span className="cp-toggle-label">Remove comments</span>
                    </label>

                    <label className="cp-toggle">
                        <input
                            type="checkbox"
                            checked={options.preserveImportant}
                            onChange={(e) =>
                                setOptions({ ...options, preserveImportant: e.target.checked })
                            }
                            disabled={!options.removeComments}
                        />
                        <span className="cp-toggle-track">
                            <span className="cp-toggle-thumb" />
                        </span>
                        <span className="cp-toggle-label">Preserve /*! */</span>
                    </label>

                    <label className="cp-toggle">
                        <input
                            type="checkbox"
                            checked={options.removeLastSemicolon}
                            onChange={(e) =>
                                setOptions({ ...options, removeLastSemicolon: e.target.checked })
                            }
                        />
                        <span className="cp-toggle-track">
                            <span className="cp-toggle-thumb" />
                        </span>
                        <span className="cp-toggle-label">Remove last semicolon</span>
                    </label>

                    <button type="button" className="cp-sample-btn" onClick={loadSample}>
                        <i className="ti ti-wand" />
                        Sample
                    </button>
                </div>

                {/*  Mobile Tabs  */}
                <div className="cp-mobile-tabs">
                    <button
                        type="button"
                        className={`cp-mobile-tab${mobileView === "input" ? " active" : ""}`}
                        onClick={() => setMobileView("input")}
                    >
                        <i className="ti ti-file-code" />
                        Input
                    </button>
                    <button
                        type="button"
                        className={`cp-mobile-tab${mobileView === "output" ? " active" : ""}`}
                        onClick={() => setMobileView("output")}
                    >
                        <i className="ti ti-file-zip" />
                        Output
                        {result && <span className="cp-mobile-dot" />}
                    </button>
                </div>

                {/*  Panels  */}
                <div className="cp-panels">
                    {/* Input */}
                    <div
                        className={`cp-panel${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}
                    >
                        <div className="cp-panel-header">
                            <div className="cp-panel-label">
                                <i className="ti ti-file-code" />
                                Original CSS
                            </div>
                            {input && (
                                <button
                                    className="cp-clear-btn"
                                    onClick={() => setInput("")}
                                    title="Clear"
                                >
                                    <i className="ti ti-x" />
                                </button>
                            )}
                        </div>
                        <textarea
                            className="cp-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your CSS here..."
                            spellCheck={false}
                        />
                    </div>

                    {/* Divider */}
                    <div className="cp-divider">
                        <div className="cp-divider-icon">
                            <i className="ti ti-arrow-right" />
                        </div>
                    </div>

                    {/* Output */}
                    <div
                        className={`cp-panel${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}
                    >
                        <div className="cp-panel-header">
                            <div className="cp-panel-label">
                                <i className="ti ti-file-zip" />
                                Minified CSS
                            </div>
                            {result && (
                                <div className="cp-panel-actions">
                                    <button
                                        className={`cp-copy-btn${
                                            copiedKey === "output" ? " copied" : ""
                                        }`}
                                        onClick={() => handleCopy(result.output, "output")}
                                    >
                                        <i
                                            className={`ti ${
                                                copiedKey === "output" ? "ti-check" : "ti-copy"
                                            }`}
                                        />
                                        {copiedKey === "output" ? "Copied" : "Copy"}
                                    </button>
                                    <button className="cp-download-btn" onClick={handleDownload}>
                                        <i className="ti ti-download" />
                                        Download
                                    </button>
                                </div>
                            )}
                        </div>

                        {result ? (
                            <>
                                <pre className="cp-output">{result.output}</pre>
                                <div className="cp-stats">
                                    <div className="cp-stat">
                                        <span className="cp-stat-label">Original:</span>
                                        <span className="cp-stat-value">
                                            {formatBytes(result.stats.original)}
                                        </span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-label">Minified:</span>
                                        <span className="cp-stat-value">
                                            {formatBytes(result.stats.minified)}
                                        </span>
                                    </div>
                                    <div className="cp-stat cp-stat-success">
                                        <span className="cp-stat-label">Saved:</span>
                                        <span className="cp-stat-value">
                                            {formatBytes(result.stats.savings)} (
                                            {result.stats.savingsPercent}%)
                                        </span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-label">Rules:</span>
                                        <span className="cp-stat-value">{result.stats.rules}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="cp-empty">
                                <div className="cp-empty-icon">
                                    <i className="ti ti-brand-css3" />
                                </div>
                                <p className="cp-empty-title">Minified CSS appears here</p>
                                <p className="cp-empty-desc">
                                    Paste CSS code on the left or load a sample to reduce file size
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .cp-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /* Options */
                .cp-options {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .cp-options-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .cp-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    cursor: pointer;
                    user-select: none;
                }

                .cp-toggle input {
                    position: absolute;
                    opacity: 0;
                }

                .cp-toggle-track {
                    width: 32px;
                    height: 18px;
                    background: var(--border);
                    border-radius: 99px;
                    position: relative;
                    transition: background 0.15s;
                }

                .cp-toggle input:checked + .cp-toggle-track {
                    background: var(--brand);
                }

                .cp-toggle input:disabled + .cp-toggle-track {
                    opacity: 0.5;
                }

                .cp-toggle-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 14px;
                    height: 14px;
                    background: white;
                    border-radius: 50%;
                    transition: transform 0.15s;
                }

                .cp-toggle input:checked + .cp-toggle-track .cp-toggle-thumb {
                    transform: translateX(14px);
                }

                .cp-toggle-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .cp-sample-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    margin-left: auto;
                }

                .cp-sample-btn i {
                    font-size: 12px;
                }

                .cp-sample-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* Mobile tabs */
                .cp-mobile-tabs {
                    display: none;
                }

                /* Panels */
                .cp-panels {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    min-height: 0;
                    overflow: hidden;
                }

                .cp-panel {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }

                .cp-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                }

                .cp-panel-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cp-panel-label i {
                    font-size: 12px;
                }

                .cp-panel-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .cp-clear-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cp-clear-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cp-copy-btn,
                .cp-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 9px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cp-copy-btn i,
                .cp-download-btn i {
                    font-size: 11px;
                }

                .cp-copy-btn:hover,
                .cp-download-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .cp-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .cp-textarea {
                    flex: 1;
                    padding: 14px 16px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.7;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: none;
                    overflow: auto;
                }

                .cp-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .cp-divider {
                    width: 1px;
                    background: var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .cp-divider-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .cp-output {
                    flex: 1;
                    margin: 0;
                    padding: 14px 16px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.7;
                    color: var(--text);
                    background: transparent;
                    border: none;
                    overflow: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .cp-stats {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .cp-stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11px;
                }

                .cp-stat-label {
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .cp-stat-value {
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .cp-stat-success .cp-stat-value {
                    color: #166534;
                }

                @media (prefers-color-scheme: dark) {
                    .cp-stat-success .cp-stat-value {
                        color: #4ade80;
                    }
                }

                .cp-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 8px;
                    text-align: center;
                }

                .cp-empty-icon {
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

                .cp-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .cp-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .cp-mobile-tabs {
                        display: flex;
                        background: var(--bg-surface);
                        border-bottom: 0.5px solid var(--border);
                    }

                    .cp-mobile-tab {
                        flex: 1;
                        height: 42px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        border: none;
                        background: transparent;
                        color: var(--text-tertiary);
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        position: relative;
                    }

                    .cp-mobile-tab.active {
                        color: var(--text);
                    }

                    .cp-mobile-tab.active::after {
                        content: "";
                        position: absolute;
                        bottom: 0;
                        left: 20%;
                        right: 20%;
                        height: 2px;
                        background: var(--brand);
                    }

                    .cp-mobile-dot {
                        position: absolute;
                        top: 10px;
                        right: calc(50% - 35px);
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: var(--brand);
                    }

                    .cp-panels {
                        display: block;
                    }

                    .cp-divider {
                        display: none;
                    }

                    .cp-panel {
                        min-height: 360px;
                    }

                    .cp-panel.mobile-hidden {
                        display: none;
                    }

                    .cp-panel.mobile-visible {
                        display: flex;
                    }
                }
            `}</style>
        </>
    );
}