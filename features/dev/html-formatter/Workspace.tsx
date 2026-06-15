// features/dev/html-formatter/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import type { Tool } from "@/lib/tools";

type Mode = "format" | "minify";

interface ProcessResult {
    output: string;
    stats: {
        original: number;
        processed: number;
        savings: number;
        savingsPercent: number;
    };
}

const SAMPLE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sample Page</title></head><body><div class="container"><h1>Hello World</h1><p>This is a sample HTML document.</p><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></div></body></html>`;

function formatHTML(html: string): string {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    // Split by tags and process
    const tokens = html.split(/(<[^>]+>)/g).filter(Boolean);

    tokens.forEach(token => {
        const trimmed = token.trim();
        if (!trimmed) return;

        // Closing tag
        if (trimmed.match(/^<\/\w/)) {
            indent = Math.max(0, indent - 1);
            formatted += tab.repeat(indent) + trimmed + '\n';
        }
        // Self-closing or single-line tag
        else if (trimmed.match(/\/>$/) || trimmed.match(/^<(img|input|br|hr|meta|link)/)) {
            formatted += tab.repeat(indent) + trimmed + '\n';
        }
        // Opening tag
        else if (trimmed.match(/^<\w/)) {
            formatted += tab.repeat(indent) + trimmed + '\n';
            // Don't indent for inline elements
            if (!trimmed.match(/^<(span|a|strong|em|b|i|code)/)) {
                indent++;
            }
        }
        // Text content
        else {
            formatted += tab.repeat(indent) + trimmed + '\n';
        }
    });

    return formatted.trim();
}

function minifyHTML(html: string): string {
    return html
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/\s+>/g, '>')
        .replace(/>\s+/g, '>')
        .trim();
}

function processHTML(input: string, mode: Mode): ProcessResult {
    const output = mode === "format" ? formatHTML(input) : minifyHTML(input);
    const original = new Blob([input]).size;
    const processed = new Blob([output]).size;
    const savings = original - processed;
    const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;

    return {
        output,
        stats: { original, processed, savings, savingsPercent },
    };
}

export default function HTMLFormatterWorkspace({ tool }: { tool: Tool }) {
    const [mode, setMode] = useState<Mode>("format");
    const [input, setInput] = useState("");
    const [copiedKey, setCopiedKey] = useState("");
    const [activePane, setActivePane] = useState<"input" | "output">("input");

    const rootRef = useRef<HTMLDivElement>(null);

    const result = useMemo(() => {
        if (!input.trim()) return null;
        try {
            return processHTML(input, mode);
        } catch (e) {
            return null;
        }
    }, [input, mode]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadSample = () => {
        setInput(SAMPLE_HTML);
        setActivePane("input");
    };

    const downloadOutput = () => {
        if (!result) return;
        const blob = new Blob([result.output], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${mode === 'format' ? 'formatted' : 'minified'}.html`;
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
            <div className="hf-root" ref={rootRef}>
                {/* Command Bar */}
                <div className="hf-cmd">
                    <div className="hf-cmd-left">
                        <div className="hf-pill-group">
                            <button
                                className={`hf-pill${mode === "format" ? " --on" : ""}`}
                                onClick={() => setMode("format")}
                            >
                                <i className="ti ti-text-wrap" />
                                Format
                            </button>
                            <button
                                className={`hf-pill${mode === "minify" ? " --on" : ""}`}
                                onClick={() => setMode("minify")}
                            >
                                <i className="ti ti-file-zip" />
                                Minify
                            </button>
                        </div>
                    </div>
                    <div className="hf-cmd-right">
                        <button className="hf-example-btn" onClick={loadSample}>
                            <i className="ti ti-code" />
                            <span className="hf-example-label">Load Sample</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Switcher */}
                <div className="hf-switcher">
                    <button
                        className={`hf-switcher-tab${activePane === "input" ? " --on" : ""}`}
                        onClick={goInput}
                    >
                        <i className="ti ti-code" />
                        Input HTML
                    </button>
                    <div className="hf-switcher-div" />
                    <button
                        className={`hf-switcher-tab${activePane === "output" ? " --on" : ""}`}
                        onClick={goOutput}
                    >
                        <i className="ti ti-sparkles" />
                        Result
                        {result && activePane !== "output" && <span className="hf-ready-dot" />}
                    </button>
                </div>

                {/* Main Body */}
                <div className="hf-body">
                    {/* Input Pane */}
                    <div className={`hf-pane hf-pane-in${activePane === "input" ? " --mob-show" : ""}`}>
                        <div className="hf-pane-bar">
                            <span className="hf-pane-bar-label">
                                <i className="ti ti-code" />
                                Input HTML
                            </span>
                            <div className="hf-pane-bar-actions">
                                {input && <span className="hf-len">{input.length.toLocaleString()} ch</span>}
                                <button className="hf-ghost" onClick={() => setInput("")} disabled={!input}>
                                    <i className="ti ti-x" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="hf-ta"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your HTML here..."
                            spellCheck={false}
                        />
                        {input && result && (
                            <div className="hf-mob-cta">
                                <button className="hf-view-result" onClick={goOutput}>
                                    <i className="ti ti-sparkles" />
                                    View {mode === 'format' ? 'Formatted' : 'Minified'} HTML
                                    <i className="ti ti-chevron-right" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gutter */}
                    <div className="hf-gutter">
                        <div className="hf-gutter-line" />
                        <div className="hf-gutter-icon">
                            <i className="ti ti-arrow-right" />
                        </div>
                        <div className="hf-gutter-line" />
                    </div>

                    {/* Output Pane */}
                    <div className={`hf-pane hf-pane-out${activePane === "output" ? " --mob-show" : ""}`}>
                        <div className="hf-pane-bar">
                            <span className="hf-pane-bar-label">
                                <i className="ti ti-sparkles" />
                                {mode === 'format' ? 'Formatted' : 'Minified'} HTML
                            </span>
                            <div className="hf-pane-bar-actions">
                                {result && (
                                    <button
                                        className={`hf-copy-btn${copiedKey === "output" ? " --done" : ""}`}
                                        onClick={() => copy(result.output, "output")}
                                    >
                                        <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "output" ? "Copied" : "Copy"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {!result && !input && (
                            <div className="hf-empty">
                                <div className="hf-empty-ico">
                                    <i className="ti ti-brand-html5" />
                                </div>
                                <p className="hf-empty-h">Format or Minify HTML</p>
                                <p className="hf-empty-p">
                                    Paste HTML code on the left or load a sample to get started
                                </p>
                                <button className="hf-go-input-mob" onClick={goInput}>
                                    <i className="ti ti-code" />
                                    Go to input
                                </button>
                            </div>
                        )}

                        {result && (
                            <>
                                <pre className="hf-pre">{result.output}</pre>
                                <div className="hf-stats">
                                    <div className="hf-stat">
                                        <span className="hf-stat-k">Original</span>
                                        <span className="hf-stat-v">{result.stats.original.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="hf-stat">
                                        <span className="hf-stat-k">Processed</span>
                                        <span className="hf-stat-v">{result.stats.processed.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="hf-stat">
                                        <span className="hf-stat-k">
                                            {mode === 'minify' ? 'Saved' : 'Added'}
                                        </span>
                                        <span className={`hf-stat-v${mode === 'minify' && result.stats.savings > 0 ? ' --good' : mode === 'format' && result.stats.savings < 0 ? ' --warn' : ''}`}>
                                            {mode === 'minify' ? result.stats.savings : Math.abs(result.stats.savings)} bytes
                                            {result.stats.savingsPercent !== 0 && ` (${Math.abs(result.stats.savingsPercent)}%)`}
                                        </span>
                                    </div>
                                    <button className="hf-download-btn" onClick={downloadOutput}>
                                        <i className="ti ti-download" />
                                        Download
                                    </button>
                                </div>
                            </>
                        )}

                        {result && (
                            <div className="hf-mob-swap">
                                <button
                                    className={`hf-copy-btn-mob${copiedKey === "output-mob" ? " --done" : ""}`}
                                    onClick={() => copy(result.output, "output-mob")}
                                >
                                    <i className={`ti ${copiedKey === "output-mob" ? "ti-check" : "ti-copy"}`} />
                                    {copiedKey === "output-mob" ? "Copied" : "Copy Result"}
                                </button>
                                <button className="hf-download-btn-mob" onClick={downloadOutput}>
                                    <i className="ti ti-download" />
                                    Download HTML
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="hf-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .hf-root {
                    --hf-radius-sm: 6px;
                    --hf-radius-md: 8px;
                    --hf-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .hf-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .hf-cmd-left, .hf-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hf-pill-group {
                    display: inline-flex;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    padding: 2px;
                    gap: 2px;
                }

                .hf-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-pill:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hf-pill.--on {
                    background: var(--bg-card);
                    color: var(--text);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px var(--border);
                }

                .hf-pill i {
                    font-size: 13px;
                }

                .hf-example-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 8px;
                    border-radius: var(--hf-radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11.5px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-example-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .hf-example-btn i {
                    font-size: 12px;
                }

                .hf-switcher {
                    display: none;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hf-switcher-tab {
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

                .hf-switcher-tab:hover {
                    color: var(--text-secondary);
                }

                .hf-switcher-tab.--on {
                    color: var(--text);
                    border-bottom-color: var(--text);
                }

                .hf-switcher-tab i {
                    font-size: 15px;
                }

                .hf-switcher-div {
                    width: 0.5px;
                    background: var(--border);
                    align-self: stretch;
                    margin: 10px 0;
                }

                .hf-ready-dot {
                    position: absolute;
                    top: 11px;
                    right: calc(50% - 30px);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--brand);
                    border: 1.5px solid var(--bg-surface);
                }

                .hf-body {
                    display: grid;
                    grid-template-columns: 1fr 44px 1fr;
                    flex: 1;
                    min-height: 400px;
                }

                .hf-pane {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .hf-pane-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    gap: 8px;
                }

                .hf-pane-bar-label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .hf-pane-bar-label i {
                    font-size: 12px;
                }

                .hf-pane-bar-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hf-len {
                    font-size: 10.5px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .hf-ghost {
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

                .hf-ghost:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .hf-ghost:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .hf-ta {
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

                .hf-ta::placeholder {
                    color: var(--text-disabled);
                }

                .hf-mob-cta {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                }

                .hf-view-result {
                    width: 100%;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border-radius: var(--hf-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-view-result:hover {
                    background: var(--bg-card);
                }

                .hf-view-result i:first-child {
                    color: var(--brand);
                }

                .hf-view-result i:last-child {
                    color: var(--text-tertiary);
                    margin-left: auto;
                }

                .hf-gutter {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    padding: 16px 0;
                }

                .hf-gutter-line {
                    flex: 1;
                    width: 0.5px;
                    background: var(--border);
                }

                .hf-gutter-icon {
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

                .hf-pre {
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

                .hf-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 24px;
                    gap: 8px;
                    text-align: center;
                }

                .hf-empty-ico {
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

                .hf-empty-h {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .hf-empty-p {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 220px;
                    line-height: 1.55;
                }

                .hf-go-input-mob {
                    display: none;
                    align-items: center;
                    gap: 5px;
                    margin-top: 4px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--hf-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-go-input-mob:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hf-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    height: 22px;
                    padding: 0 7px;
                    border-radius: var(--hf-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .hf-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hf-copy-btn.--done {
                    color: var(--brand);
                    border-color: var(--brand-border);
                    background: var(--brand-light);
                }

                .hf-copy-btn i {
                    font-size: 10px;
                }

                .hf-stats {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                    padding: 8px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .hf-stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 9px;
                    border-radius: 99px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                }

                .hf-stat-k {
                    font-size: 9.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-disabled);
                }

                .hf-stat-v {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .hf-stat-v.--good {
                    color: #166534;
                }

                .hf-stat-v.--warn {
                    color: #92400e;
                }

                @media (prefers-color-scheme: dark) {
                    .hf-stat-v.--good {
                        color: #4ade80;
                    }
                    .hf-stat-v.--warn {
                        color: #fcd34d;
                    }
                }

                .hf-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 24px;
                    padding: 0 9px;
                    border-radius: var(--hf-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    margin-left: auto;
                }

                .hf-download-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .hf-download-btn i {
                    font-size: 11px;
                }

                .hf-mob-swap {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                    gap: 8px;
                }

                .hf-copy-btn-mob,
                .hf-download-btn-mob {
                    flex: 1;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    border-radius: var(--hf-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-copy-btn-mob:hover,
                .hf-download-btn-mob:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .hf-copy-btn-mob.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .hf-footer {
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

                .hf-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .hf-switcher {
                        display: flex;
                    }

                    .hf-gutter {
                        display: none;
                    }

                    .hf-body {
                        display: block;
                        min-height: unset;
                    }

                    .hf-pane {
                        display: none;
                        min-height: unset;
                    }

                    .hf-pane.--mob-show {
                        display: flex;
                    }

                    .hf-mob-cta {
                        display: block;
                    }

                    .hf-mob-swap {
                        display: flex;
                    }

                    .hf-go-input-mob {
                        display: flex;
                    }

                    .hf-example-label {
                        display: none;
                    }

                    .hf-example-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .hf-pane-bar-actions .hf-copy-btn {
                        display: none;
                    }

                    .hf-stats {
                        gap: 5px;
                    }

                    .hf-download-btn {
                        margin-left: 0;
                    }
                }
            `}</style>
        </>
    );
}