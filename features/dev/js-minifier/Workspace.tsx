// features/dev/js-minifier/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import type { Tool } from "@/lib/tools";

interface ProcessResult {
    output: string;
    stats: {
        original: number;
        minified: number;
        savings: number;
        savingsPercent: number;
        lines: number;
    };
}

const SAMPLE_JS = `function calculateTotal(items) {
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  
  return total;
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export { calculateTotal, formatCurrency };`;

function minifyJS(js: string): string {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\/\/.*/g, '') // Remove single-line comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}();:,=<>!&|+\-*\/])\s*/g, '$1') // Remove space around operators
        .replace(/;\s*}/g, '}') // Remove last semicolon before }
        .trim();
}

function countLines(str: string): number {
    return str.split('\n').length;
}

function processJS(input: string): ProcessResult {
    const output = minifyJS(input);
    const original = new Blob([input]).size;
    const minified = new Blob([output]).size;
    const savings = original - minified;
    const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;
    const lines = countLines(input);

    return {
        output,
        stats: { original, minified, savings, savingsPercent, lines },
    };
}

export default function JSMinifierWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [copiedKey, setCopiedKey] = useState("");
    const [activePane, setActivePane] = useState<"input" | "output">("input");

    const rootRef = useRef<HTMLDivElement>(null);

    const result = useMemo(() => {
        if (!input.trim()) return null;
        try {
            return processJS(input);
        } catch (e) {
            return null;
        }
    }, [input]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadSample = () => {
        setInput(SAMPLE_JS);
        setActivePane("input");
    };

    const downloadOutput = () => {
        if (!result) return;
        const blob = new Blob([result.output], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minified.js';
        a.click();
        URL.revokeObjectURL(url);
    };

    const goOutput = () => {
        setActivePane("output");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    const goInput = () => {
        setActivePane("input");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    return (
        <>
            <div className="jm-root" ref={rootRef}>
                {/* Command Bar */}
                <div className="jm-cmd">
                    <div className="jm-cmd-left">
                        <div className="jm-title">
                            <i className="ti ti-brand-javascript" />
                            JS Minifier
                        </div>
                    </div>
                    <div className="jm-cmd-right">
                        <button className="jm-example-btn" onClick={loadSample}>
                            <i className="ti ti-code" />
                            <span className="jm-example-label">Load Sample</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Switcher */}
                <div className="jm-switcher">
                    <button
                        className={`jm-switcher-tab${activePane === "input" ? " --on" : ""}`}
                        onClick={goInput}
                    >
                        <i className="ti ti-file-code" />
                        Original JS
                    </button>
                    <div className="jm-switcher-div" />
                    <button
                        className={`jm-switcher-tab${activePane === "output" ? " --on" : ""}`}
                        onClick={goOutput}
                    >
                        <i className="ti ti-file-zip" />
                        Minified
                        {result && activePane !== "output" && <span className="jm-ready-dot" />}
                    </button>
                </div>

                {/* Main Body */}
                <div className="jm-body">
                    {/* Input Pane */}
                    <div className={`jm-pane jm-pane-in${activePane === "input" ? " --mob-show" : ""}`}>
                        <div className="jm-pane-bar">
                            <span className="jm-pane-bar-label">
                                <i className="ti ti-file-code" />
                                Original JavaScript
                            </span>
                            <div className="jm-pane-bar-actions">
                                {input && <span className="jm-len">{input.length.toLocaleString()} ch</span>}
                                <button className="jm-ghost" onClick={() => setInput("")} disabled={!input}>
                                    <i className="ti ti-x" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="jm-ta"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your JavaScript here..."
                            spellCheck={false}
                        />
                        {input && result && (
                            <div className="jm-mob-cta">
                                <button className="jm-view-result" onClick={goOutput}>
                                    <i className="ti ti-file-zip" />
                                    View Minified JS
                                    <i className="ti ti-chevron-right" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gutter */}
                    <div className="jm-gutter">
                        <div className="jm-gutter-line" />
                        <div className="jm-gutter-icon">
                            <i className="ti ti-arrow-right" />
                        </div>
                        <div className="jm-gutter-line" />
                    </div>

                    {/* Output Pane */}
                    <div className={`jm-pane jm-pane-out${activePane === "output" ? " --mob-show" : ""}`}>
                        <div className="jm-pane-bar">
                            <span className="jm-pane-bar-label">
                                <i className="ti ti-file-zip" />
                                Minified JavaScript
                            </span>
                            <div className="jm-pane-bar-actions">
                                {result && (
                                    <button
                                        className={`jm-copy-btn${copiedKey === "output" ? " --done" : ""}`}
                                        onClick={() => copy(result.output, "output")}
                                    >
                                        <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "output" ? "Copied" : "Copy"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {!result && !input && (
                            <div className="jm-empty">
                                <div className="jm-empty-ico">
                                    <i className="ti ti-brand-javascript" />
                                </div>
                                <p className="jm-empty-h">Minify JavaScript Code</p>
                                <p className="jm-empty-p">
                                    Paste JavaScript code on the left or load a sample to reduce bundle size
                                </p>
                                <button className="jm-go-input-mob" onClick={goInput}>
                                    <i className="ti ti-file-code" />
                                    Go to input
                                </button>
                            </div>
                        )}

                        {result && (
                            <>
                                <pre className="jm-pre">{result.output}</pre>
                                <div className="jm-stats">
                                    <div className="jm-stat">
                                        <span className="jm-stat-k">Original</span>
                                        <span className="jm-stat-v">{result.stats.original.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="jm-stat">
                                        <span className="jm-stat-k">Minified</span>
                                        <span className="jm-stat-v">{result.stats.minified.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="jm-stat">
                                        <span className="jm-stat-k">Saved</span>
                                        <span className="jm-stat-v --good">
                                            {result.stats.savings.toLocaleString()} bytes ({result.stats.savingsPercent}%)
                                        </span>
                                    </div>
                                    <div className="jm-stat">
                                        <span className="jm-stat-k">Lines</span>
                                        <span className="jm-stat-v">{result.stats.lines}</span>
                                    </div>
                                    <button className="jm-download-btn" onClick={downloadOutput}>
                                        <i className="ti ti-download" />
                                        Download
                                    </button>
                                </div>
                            </>
                        )}

                        {result && (
                            <div className="jm-mob-swap">
                                <button
                                    className={`jm-copy-btn-mob${copiedKey === "output-mob" ? " --done" : ""}`}
                                    onClick={() => copy(result.output, "output-mob")}
                                >
                                    <i className={`ti ${copiedKey === "output-mob" ? "ti-check" : "ti-copy"}`} />
                                    {copiedKey === "output-mob" ? "Copied" : "Copy Result"}
                                </button>
                                <button className="jm-download-btn-mob" onClick={downloadOutput}>
                                    <i className="ti ti-download" />
                                    Download JS
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="jm-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                /* Same styles as CSS Minifier - just replace 'cm' prefix with 'jm' */
                .jm-root {
                    --jm-radius-sm: 6px;
                    --jm-radius-md: 8px;
                    --jm-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jm-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .jm-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .jm-cmd-left, .jm-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .jm-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .jm-title i {
                    font-size: 16px;
                }

                .jm-example-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 8px;
                    border-radius: var(--jm-radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11.5px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jm-example-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .jm-example-btn i {
                    font-size: 12px;
                }

                .jm-switcher {
                    display: none;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .jm-switcher-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    height: 46px;
                    border: none;
                    border-bottom: 2px solid transparent;
                    background: transparent;
                    color: var(--text-tertiary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    position: relative;
                }

                .jm-switcher-tab:hover {
                    color: var(--text-secondary);
                }

                .jm-switcher-tab.--on {
                    color: var(--text);
                    border-bottom-color: var(--text);
                }

                .jm-switcher-tab i {
                    font-size: 15px;
                }

                .jm-switcher-div {
                    width: 0.5px;
                    background: var(--border);
                    align-self: stretch;
                    margin: 10px 0;
                }

                .jm-ready-dot {
                    position: absolute;
                    top: 11px;
                    right: calc(50% - 30px);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--brand);
                    border: 1.5px solid var(--bg-surface);
                }

                .jm-body {
                    display: grid;
                    grid-template-columns: 1fr 44px 1fr;
                    flex: 1;
                    min-height: 400px;
                }

                .jm-pane {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .jm-pane-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    gap: 8px;
                }

                .jm-pane-bar-label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .jm-pane-bar-label i {
                    font-size: 12px;
                }

                .jm-pane-bar-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .jm-len {
                    font-size: 10.5px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .jm-ghost {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.1s;
                }

                .jm-ghost:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .jm-ghost:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .jm-ta {
                    flex: 1;
                    width: 100%;
                    padding: 14px 16px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.75;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: none;
                    overflow-y: auto;
                }

                .jm-ta::placeholder {
                    color: var(--text-disabled);
                }

                .jm-mob-cta {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                }

                .jm-view-result {
                    width: 100%;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border-radius: var(--jm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jm-view-result:hover {
                    background: var(--bg-card);
                }

                .jm-view-result i:first-child {
                    color: var(--brand);
                }

                .jm-view-result i:last-child {
                    color: var(--text-tertiary);
                    margin-left: auto;
                }

                .jm-gutter {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    padding: 16px 0;
                }

                .jm-gutter-line {
                    flex: 1;
                    width: 0.5px;
                    background: var(--border);
                }

                .jm-gutter-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 8px 0;
                }

                .jm-pre {
                    flex: 1;
                    margin: 0;
                    padding: 16px;
                    overflow: auto;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.75;
                    color: var(--text);
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .jm-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 24px;
                    gap: 8px;
                    text-align: center;
                }

                .jm-empty-ico {
                    width: 44px;
                    height: 44px;
                    border-radius: 13px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: var(--text-disabled);
                    margin-bottom: 4px;
                }

                .jm-empty-h {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .jm-empty-p {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 240px;
                    line-height: 1.55;
                }

                .jm-go-input-mob {
                    display: none;
                    align-items: center;
                    gap: 5px;
                    margin-top: 4px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--jm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jm-go-input-mob:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jm-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    height: 22px;
                    padding: 0 7px;
                    border-radius: var(--jm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .jm-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jm-copy-btn.--done {
                    color: var(--brand);
                    border-color: var(--brand-border);
                    background: var(--brand-light);
                }

                .jm-copy-btn i {
                    font-size: 10px;
                }

                .jm-stats {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                    padding: 8px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .jm-stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 9px;
                    border-radius: 99px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                }

                .jm-stat-k {
                    font-size: 9.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-disabled);
                }

                .jm-stat-v {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .jm-stat-v.--good {
                    color: #166534;
                }

                @media (prefers-color-scheme: dark) {
                    .jm-stat-v.--good {
                        color: #4ade80;
                    }
                }

                .jm-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 24px;
                    padding: 0 9px;
                    border-radius: var(--jm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    margin-left: auto;
                }

                .jm-download-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jm-download-btn i {
                    font-size: 11px;
                }

                .jm-mob-swap {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                    gap: 8px;
                }

                .jm-copy-btn-mob,
                .jm-download-btn-mob {
                    flex: 1;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    border-radius: var(--jm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jm-copy-btn-mob:hover,
                .jm-download-btn-mob:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .jm-copy-btn-mob.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jm-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    font-size: 11px;
                    color: var(--text-disabled);
                    line-height: 1;
                }

                .jm-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .jm-switcher {
                        display: flex;
                    }

                    .jm-gutter {
                        display: none;
                    }

                    .jm-body {
                        display: block;
                        min-height: unset;
                    }

                    .jm-pane {
                        display: none;
                        min-height: unset;
                    }

                    .jm-pane.--mob-show {
                        display: flex;
                    }

                    .jm-mob-cta {
                        display: block;
                    }

                    .jm-mob-swap {
                        display: flex;
                    }

                    .jm-go-input-mob {
                        display: flex;
                    }

                    .jm-example-label {
                        display: none;
                    }

                    .jm-example-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .jm-pane-bar-actions .jm-copy-btn {
                        display: none;
                    }

                    .jm-stats {
                        gap: 5px;
                    }

                    .jm-download-btn {
                        margin-left: 0;
                    }
                }
            `}</style>
        </>
    );
}