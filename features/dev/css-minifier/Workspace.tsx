// features/dev/css-minifier/Workspace.tsx
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
        rules: number;
    };
}

const SAMPLE_CSS = `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
}

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #3b82f6;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`;

function minifyCSS(css: string): string {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove space around delimiters
        .replace(/;}/g, '}') // Remove last semicolon
        .trim();
}

function countCSSRules(css: string): number {
    return (css.match(/\{/g) || []).length;
}

function processCSS(input: string): ProcessResult {
    const output = minifyCSS(input);
    const original = new Blob([input]).size;
    const minified = new Blob([output]).size;
    const savings = original - minified;
    const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;
    const rules = countCSSRules(input);

    return {
        output,
        stats: { original, minified, savings, savingsPercent, rules },
    };
}

export default function CSSMinifierWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [copiedKey, setCopiedKey] = useState("");
    const [activePane, setActivePane] = useState<"input" | "output">("input");

    const rootRef = useRef<HTMLDivElement>(null);

    const result = useMemo(() => {
        if (!input.trim()) return null;
        try {
            return processCSS(input);
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
        setInput(SAMPLE_CSS);
        setActivePane("input");
    };

    const downloadOutput = () => {
        if (!result) return;
        const blob = new Blob([result.output], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minified.css';
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
            <div className="cm-root" ref={rootRef}>
                {/* Command Bar */}
                <div className="cm-cmd">
                    <div className="cm-cmd-left">
                        <div className="cm-title">
                            <i className="ti ti-brand-css3" />
                            CSS Minifier
                        </div>
                    </div>
                    <div className="cm-cmd-right">
                        <button className="cm-example-btn" onClick={loadSample}>
                            <i className="ti ti-code" />
                            <span className="cm-example-label">Load Sample</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Switcher */}
                <div className="cm-switcher">
                    <button
                        className={`cm-switcher-tab${activePane === "input" ? " --on" : ""}`}
                        onClick={goInput}
                    >
                        <i className="ti ti-file-code" />
                        Original CSS
                    </button>
                    <div className="cm-switcher-div" />
                    <button
                        className={`cm-switcher-tab${activePane === "output" ? " --on" : ""}`}
                        onClick={goOutput}
                    >
                        <i className="ti ti-file-zip" />
                        Minified
                        {result && activePane !== "output" && <span className="cm-ready-dot" />}
                    </button>
                </div>

                {/* Main Body */}
                <div className="cm-body">
                    {/* Input Pane */}
                    <div className={`cm-pane cm-pane-in${activePane === "input" ? " --mob-show" : ""}`}>
                        <div className="cm-pane-bar">
                            <span className="cm-pane-bar-label">
                                <i className="ti ti-file-code" />
                                Original CSS
                            </span>
                            <div className="cm-pane-bar-actions">
                                {input && <span className="cm-len">{input.length.toLocaleString()} ch</span>}
                                <button className="cm-ghost" onClick={() => setInput("")} disabled={!input}>
                                    <i className="ti ti-x" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="cm-ta"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your CSS here..."
                            spellCheck={false}
                        />
                        {input && result && (
                            <div className="cm-mob-cta">
                                <button className="cm-view-result" onClick={goOutput}>
                                    <i className="ti ti-file-zip" />
                                    View Minified CSS
                                    <i className="ti ti-chevron-right" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gutter */}
                    <div className="cm-gutter">
                        <div className="cm-gutter-line" />
                        <div className="cm-gutter-icon">
                            <i className="ti ti-arrow-right" />
                        </div>
                        <div className="cm-gutter-line" />
                    </div>

                    {/* Output Pane */}
                    <div className={`cm-pane cm-pane-out${activePane === "output" ? " --mob-show" : ""}`}>
                        <div className="cm-pane-bar">
                            <span className="cm-pane-bar-label">
                                <i className="ti ti-file-zip" />
                                Minified CSS
                            </span>
                            <div className="cm-pane-bar-actions">
                                {result && (
                                    <button
                                        className={`cm-copy-btn${copiedKey === "output" ? " --done" : ""}`}
                                        onClick={() => copy(result.output, "output")}
                                    >
                                        <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "output" ? "Copied" : "Copy"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {!result && !input && (
                            <div className="cm-empty">
                                <div className="cm-empty-ico">
                                    <i className="ti ti-brand-css3" />
                                </div>
                                <p className="cm-empty-h">Minify CSS Code</p>
                                <p className="cm-empty-p">
                                    Paste CSS code on the left or load a sample to reduce file size
                                </p>
                                <button className="cm-go-input-mob" onClick={goInput}>
                                    <i className="ti ti-file-code" />
                                    Go to input
                                </button>
                            </div>
                        )}

                        {result && (
                            <>
                                <pre className="cm-pre">{result.output}</pre>
                                <div className="cm-stats">
                                    <div className="cm-stat">
                                        <span className="cm-stat-k">Original</span>
                                        <span className="cm-stat-v">{result.stats.original.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="cm-stat">
                                        <span className="cm-stat-k">Minified</span>
                                        <span className="cm-stat-v">{result.stats.minified.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="cm-stat">
                                        <span className="cm-stat-k">Saved</span>
                                        <span className="cm-stat-v --good">
                                            {result.stats.savings.toLocaleString()} bytes ({result.stats.savingsPercent}%)
                                        </span>
                                    </div>
                                    <div className="cm-stat">
                                        <span className="cm-stat-k">Rules</span>
                                        <span className="cm-stat-v">{result.stats.rules}</span>
                                    </div>
                                    <button className="cm-download-btn" onClick={downloadOutput}>
                                        <i className="ti ti-download" />
                                        Download
                                    </button>
                                </div>
                            </>
                        )}

                        {result && (
                            <div className="cm-mob-swap">
                                <button
                                    className={`cm-copy-btn-mob${copiedKey === "output-mob" ? " --done" : ""}`}
                                    onClick={() => copy(result.output, "output-mob")}
                                >
                                    <i className={`ti ${copiedKey === "output-mob" ? "ti-check" : "ti-copy"}`} />
                                    {copiedKey === "output-mob" ? "Copied" : "Copy Result"}
                                </button>
                                <button className="cm-download-btn-mob" onClick={downloadOutput}>
                                    <i className="ti ti-download" />
                                    Download CSS
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="cm-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .cm-root {
                    --cm-radius-sm: 6px;
                    --cm-radius-md: 8px;
                    --cm-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cm-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .cm-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .cm-cmd-left, .cm-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .cm-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .cm-title i {
                    font-size: 16px;
                }

                .cm-example-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 8px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11.5px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cm-example-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .cm-example-btn i {
                    font-size: 12px;
                }

                .cm-switcher {
                    display: none;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .cm-switcher-tab {
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

                .cm-switcher-tab:hover {
                    color: var(--text-secondary);
                }

                .cm-switcher-tab.--on {
                    color: var(--text);
                    border-bottom-color: var(--text);
                }

                .cm-switcher-tab i {
                    font-size: 15px;
                }

                .cm-switcher-div {
                    width: 0.5px;
                    background: var(--border);
                    align-self: stretch;
                    margin: 10px 0;
                }

                .cm-ready-dot {
                    position: absolute;
                    top: 11px;
                    right: calc(50% - 30px);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--brand);
                    border: 1.5px solid var(--bg-surface);
                }

                .cm-body {
                    display: grid;
                    grid-template-columns: 1fr 44px 1fr;
                    flex: 1;
                    min-height: 400px;
                }

                .cm-pane {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .cm-pane-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    gap: 8px;
                }

                .cm-pane-bar-label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .cm-pane-bar-label i {
                    font-size: 12px;
                }

                .cm-pane-bar-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .cm-len {
                    font-size: 10.5px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .cm-ghost {
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

                .cm-ghost:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .cm-ghost:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .cm-ta {
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

                .cm-ta::placeholder {
                    color: var(--text-disabled);
                }

                .cm-mob-cta {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                }

                .cm-view-result {
                    width: 100%;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cm-view-result:hover {
                    background: var(--bg-card);
                }

                .cm-view-result i:first-child {
                    color: var(--brand);
                }

                .cm-view-result i:last-child {
                    color: var(--text-tertiary);
                    margin-left: auto;
                }

                .cm-gutter {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    padding: 16px 0;
                }

                .cm-gutter-line {
                    flex: 1;
                    width: 0.5px;
                    background: var(--border);
                }

                .cm-gutter-icon {
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

                .cm-pre {
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

                .cm-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 24px;
                    gap: 8px;
                    text-align: center;
                }

                .cm-empty-ico {
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

                .cm-empty-h {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .cm-empty-p {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 220px;
                    line-height: 1.55;
                }

                .cm-go-input-mob {
                    display: none;
                    align-items: center;
                    gap: 5px;
                    margin-top: 4px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cm-go-input-mob:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .cm-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    height: 22px;
                    padding: 0 7px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .cm-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .cm-copy-btn.--done {
                    color: var(--brand);
                    border-color: var(--brand-border);
                    background: var(--brand-light);
                }

                .cm-copy-btn i {
                    font-size: 10px;
                }

                .cm-stats {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                    padding: 8px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .cm-stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 9px;
                    border-radius: 99px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                }

                .cm-stat-k {
                    font-size: 9.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-disabled);
                }

                .cm-stat-v {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .cm-stat-v.--good {
                    color: #166534;
                }

                @media (prefers-color-scheme: dark) {
                    .cm-stat-v.--good {
                        color: #4ade80;
                    }
                }

                .cm-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 24px;
                    padding: 0 9px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    margin-left: auto;
                }

                .cm-download-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .cm-download-btn i {
                    font-size: 11px;
                }

                .cm-mob-swap {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                    gap: 8px;
                }

                .cm-copy-btn-mob,
                .cm-download-btn-mob {
                    flex: 1;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    border-radius: var(--cm-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cm-copy-btn-mob:hover,
                .cm-download-btn-mob:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cm-copy-btn-mob.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .cm-footer {
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

                .cm-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .cm-switcher {
                        display: flex;
                    }

                    .cm-gutter {
                        display: none;
                    }

                    .cm-body {
                        display: block;
                        min-height: unset;
                    }

                    .cm-pane {
                        display: none;
                        min-height: unset;
                    }

                    .cm-pane.--mob-show {
                        display: flex;
                    }

                    .cm-mob-cta {
                        display: block;
                    }

                    .cm-mob-swap {
                        display: flex;
                    }

                    .cm-go-input-mob {
                        display: flex;
                    }

                    .cm-example-label {
                        display: none;
                    }

                    .cm-example-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .cm-pane-bar-actions .cm-copy-btn {
                        display: none;
                    }

                    .cm-stats {
                        gap: 5px;
                    }

                    .cm-download-btn {
                        margin-left: 0;
                    }
                }
            `}</style>
        </>
    );
}