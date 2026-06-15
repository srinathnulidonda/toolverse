// features/dev/json-minifier/Workspace.tsx
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
        keys: number;
    };
}

const SAMPLE_JSON = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "roles": ["user", "admin"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "US"
  },
  "metadata": {
    "createdAt": "2024-01-15",
    "lastLogin": "2024-01-20",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  }
}`;

type Mode = "minify" | "beautify";

function countKeys(obj: any): number {
    if (typeof obj !== "object" || obj === null) return 0;
    let count = Object.keys(obj).length;
    Object.values(obj).forEach((val) => { count += countKeys(val); });
    return count;
}

function processJSON(input: string, mode: Mode): ProcessResult {
    const parsed = JSON.parse(input);
    const output = mode === "minify"
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);

    const original = new Blob([input]).size;
    const minified = new Blob([output]).size;
    const savings = original - minified;
    const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;
    const keys = countKeys(parsed);

    return {
        output,
        stats: { original, minified, savings, savingsPercent, keys },
    };
}

export default function JSONMinifierWorkspace({ tool }: { tool: Tool }) {
    const [mode, setMode] = useState<Mode>("minify");
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [copiedKey, setCopiedKey] = useState("");
    const [activePane, setActivePane] = useState<"input" | "output">("input");

    const rootRef = useRef<HTMLDivElement>(null);

    const result = useMemo(() => {
        if (!input.trim()) { setError(""); return null; }
        try {
            const res = processJSON(input, mode);
            setError("");
            return res;
        } catch (e: any) {
            setError(e.message);
            return null;
        }
    }, [input, mode]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadSample = () => {
        setInput(SAMPLE_JSON);
        setActivePane("input");
    };

    const downloadOutput = () => {
        if (!result) return;
        const blob = new Blob([result.output], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${mode === "minify" ? "minified" : "formatted"}.json`;
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
            <div className="jn-root" ref={rootRef}>
                {/* Command Bar */}
                <div className="jn-cmd">
                    <div className="jn-cmd-left">
                        <div className="jn-pill-group">
                            <button
                                className={`jn-pill${mode === "minify" ? " --on" : ""}`}
                                onClick={() => setMode("minify")}
                            >
                                <i className="ti ti-file-zip" />
                                Minify
                            </button>
                            <button
                                className={`jn-pill${mode === "beautify" ? " --on" : ""}`}
                                onClick={() => setMode("beautify")}
                            >
                                <i className="ti ti-text-wrap" />
                                Beautify
                            </button>
                        </div>
                    </div>
                    <div className="jn-cmd-right">
                        <button className="jn-example-btn" onClick={loadSample}>
                            <i className="ti ti-braces" />
                            <span className="jn-example-label">Load Sample</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Switcher */}
                <div className="jn-switcher">
                    <button
                        className={`jn-switcher-tab${activePane === "input" ? " --on" : ""}`}
                        onClick={goInput}
                    >
                        <i className="ti ti-braces" />
                        Input JSON
                    </button>
                    <div className="jn-switcher-div" />
                    <button
                        className={`jn-switcher-tab${activePane === "output" ? " --on" : ""}`}
                        onClick={goOutput}
                    >
                        <i className="ti ti-sparkles" />
                        Result
                        {result && activePane !== "output" && <span className="jn-ready-dot" />}
                    </button>
                </div>

                {/* Main Body */}
                <div className="jn-body">
                    {/* Input Pane */}
                    <div className={`jn-pane jn-pane-in${activePane === "input" ? " --mob-show" : ""}`}>
                        <div className="jn-pane-bar">
                            <span className="jn-pane-bar-label">
                                <i className="ti ti-braces" />
                                Input JSON
                            </span>
                            <div className="jn-pane-bar-actions">
                                {input && <span className="jn-len">{input.length.toLocaleString()} ch</span>}
                                <button className="jn-ghost" onClick={() => setInput("")} disabled={!input}>
                                    <i className="ti ti-x" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            className={`jn-ta${error ? " jn-ta--error" : ""}`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='Paste your JSON here...'
                            spellCheck={false}
                        />
                        {error && (
                            <div className="jn-error">
                                <i className="ti ti-alert-triangle" />
                                {error}
                            </div>
                        )}
                        {input && result && (
                            <div className="jn-mob-cta">
                                <button className="jn-view-result" onClick={goOutput}>
                                    <i className="ti ti-sparkles" />
                                    View {mode === "minify" ? "Minified" : "Beautified"} JSON
                                    <i className="ti ti-chevron-right" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gutter */}
                    <div className="jn-gutter">
                        <div className="jn-gutter-line" />
                        <div className="jn-gutter-icon">
                            <i className="ti ti-arrow-right" />
                        </div>
                        <div className="jn-gutter-line" />
                    </div>

                    {/* Output Pane */}
                    <div className={`jn-pane jn-pane-out${activePane === "output" ? " --mob-show" : ""}`}>
                        <div className="jn-pane-bar">
                            <span className="jn-pane-bar-label">
                                <i className="ti ti-sparkles" />
                                {mode === "minify" ? "Minified" : "Beautified"} JSON
                            </span>
                            <div className="jn-pane-bar-actions">
                                {result && (
                                    <button
                                        className={`jn-copy-btn${copiedKey === "output" ? " --done" : ""}`}
                                        onClick={() => copy(result.output, "output")}
                                    >
                                        <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "output" ? "Copied" : "Copy"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {!result && !input && (
                            <div className="jn-empty">
                                <div className="jn-empty-ico">
                                    <i className="ti ti-braces" />
                                </div>
                                <p className="jn-empty-h">
                                    {mode === "minify" ? "Minify" : "Beautify"} JSON
                                </p>
                                <p className="jn-empty-p">
                                    Paste JSON on the left or load a sample to get started
                                </p>
                                <button className="jn-go-input-mob" onClick={goInput}>
                                    <i className="ti ti-braces" />
                                    Go to input
                                </button>
                            </div>
                        )}

                        {!result && error && (
                            <div className="jn-empty">
                                <div className="jn-empty-ico jn-empty-ico--error">
                                    <i className="ti ti-alert-triangle" />
                                </div>
                                <p className="jn-empty-h">Invalid JSON</p>
                                <p className="jn-empty-p">Fix the errors in the input pane to see the result</p>
                            </div>
                        )}

                        {result && (
                            <>
                                <pre className="jn-pre">{result.output}</pre>
                                <div className="jn-stats">
                                    <div className="jn-stat">
                                        <span className="jn-stat-k">Original</span>
                                        <span className="jn-stat-v">{result.stats.original.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="jn-stat">
                                        <span className="jn-stat-k">Result</span>
                                        <span className="jn-stat-v">{result.stats.minified.toLocaleString()} bytes</span>
                                    </div>
                                    <div className="jn-stat">
                                        <span className="jn-stat-k">
                                            {mode === "minify" ? "Saved" : "Added"}
                                        </span>
                                        <span className={`jn-stat-v${mode === "minify" && result.stats.savings > 0 ? " --good" : mode === "beautify" ? " --warn" : ""}`}>
                                            {Math.abs(result.stats.savings).toLocaleString()} bytes
                                            {result.stats.savingsPercent !== 0 && ` (${Math.abs(result.stats.savingsPercent)}%)`}
                                        </span>
                                    </div>
                                    <div className="jn-stat">
                                        <span className="jn-stat-k">Keys</span>
                                        <span className="jn-stat-v">{result.stats.keys}</span>
                                    </div>
                                    <button className="jn-download-btn" onClick={downloadOutput}>
                                        <i className="ti ti-download" />
                                        Download
                                    </button>
                                </div>
                            </>
                        )}

                        {result && (
                            <div className="jn-mob-swap">
                                <button
                                    className={`jn-copy-btn-mob${copiedKey === "output-mob" ? " --done" : ""}`}
                                    onClick={() => copy(result.output, "output-mob")}
                                >
                                    <i className={`ti ${copiedKey === "output-mob" ? "ti-check" : "ti-copy"}`} />
                                    {copiedKey === "output-mob" ? "Copied" : "Copy Result"}
                                </button>
                                <button className="jn-download-btn-mob" onClick={downloadOutput}>
                                    <i className="ti ti-download" />
                                    Download JSON
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="jn-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .jn-root {
                    --jn-radius-sm: 6px;
                    --jn-radius-md: 8px;
                    --jn-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jn-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .jn-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .jn-cmd-left,
                .jn-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .jn-pill-group {
                    display: inline-flex;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jn-radius-md);
                    padding: 2px;
                    gap: 2px;
                }

                .jn-pill {
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

                .jn-pill:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jn-pill.--on {
                    background: var(--bg-card);
                    color: var(--text);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px var(--border);
                }

                .jn-pill i {
                    font-size: 13px;
                }

                .jn-example-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 8px;
                    border-radius: var(--jn-radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 11.5px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jn-example-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .jn-example-btn i {
                    font-size: 12px;
                }

                .jn-switcher {
                    display: none;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .jn-switcher-tab {
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

                .jn-switcher-tab:hover {
                    color: var(--text-secondary);
                }

                .jn-switcher-tab.--on {
                    color: var(--text);
                    border-bottom-color: var(--text);
                }

                .jn-switcher-tab i {
                    font-size: 15px;
                }

                .jn-switcher-div {
                    width: 0.5px;
                    background: var(--border);
                    align-self: stretch;
                    margin: 10px 0;
                }

                .jn-ready-dot {
                    position: absolute;
                    top: 11px;
                    right: calc(50% - 30px);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--brand);
                    border: 1.5px solid var(--bg-surface);
                }

                .jn-body {
                    display: grid;
                    grid-template-columns: 1fr 44px 1fr;
                    flex: 1;
                    min-height: 400px;
                }

                .jn-pane {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .jn-pane-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    gap: 8px;
                }

                .jn-pane-bar-label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .jn-pane-bar-label i {
                    font-size: 12px;
                }

                .jn-pane-bar-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .jn-len {
                    font-size: 10.5px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .jn-ghost {
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

                .jn-ghost:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .jn-ghost:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .jn-ta {
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

                .jn-ta--error {
                    border-left: 2px solid #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .jn-ta--error {
                        border-left-color: #f87171;
                    }
                }

                .jn-ta::placeholder {
                    color: var(--text-disabled);
                }

                .jn-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 7px;
                    margin: 0 14px 12px;
                    padding: 10px 12px;
                    background: #fef2f2;
                    border: 0.5px solid #fecaca;
                    border-radius: var(--jn-radius-md);
                    color: #991b1b;
                    font-size: 12px;
                    line-height: 1.5;
                }

                @media (prefers-color-scheme: dark) {
                    .jn-error {
                        background: #1c0a0a;
                        border-color: #7f1d1d;
                        color: #f87171;
                    }
                }

                .jn-error i {
                    font-size: 14px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .jn-mob-cta {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                }

                .jn-view-result {
                    width: 100%;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border-radius: var(--jn-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jn-view-result:hover {
                    background: var(--bg-card);
                }

                .jn-view-result i:first-child {
                    color: var(--brand);
                }

                .jn-view-result i:last-child {
                    color: var(--text-tertiary);
                    margin-left: auto;
                }

                .jn-gutter {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    padding: 16px 0;
                }

                .jn-gutter-line {
                    flex: 1;
                    width: 0.5px;
                    background: var(--border);
                }

                .jn-gutter-icon {
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

                .jn-pre {
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

                .jn-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 24px;
                    gap: 8px;
                    text-align: center;
                }

                .jn-empty-ico {
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

                .jn-empty-ico--error {
                    background: #fef2f2;
                    border-color: #fecaca;
                    color: #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .jn-empty-ico--error {
                        background: #1c0a0a;
                        border-color: #7f1d1d;
                        color: #f87171;
                    }
                }

                .jn-empty-h {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .jn-empty-p {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 240px;
                    line-height: 1.55;
                }

                .jn-go-input-mob {
                    display: none;
                    align-items: center;
                    gap: 5px;
                    margin-top: 4px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--jn-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jn-go-input-mob:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jn-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    height: 22px;
                    padding: 0 7px;
                    border-radius: var(--jn-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .jn-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jn-copy-btn.--done {
                    color: var(--brand);
                    border-color: var(--brand-border);
                    background: var(--brand-light);
                }

                .jn-copy-btn i {
                    font-size: 10px;
                }

                .jn-stats {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                    padding: 8px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .jn-stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 9px;
                    border-radius: 99px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                }

                .jn-stat-k {
                    font-size: 9.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-disabled);
                }

                .jn-stat-v {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .jn-stat-v.--good {
                    color: #166534;
                }

                .jn-stat-v.--warn {
                    color: #92400e;
                }

                @media (prefers-color-scheme: dark) {
                    .jn-stat-v.--good { color: #4ade80; }
                    .jn-stat-v.--warn { color: #fcd34d; }
                }

                .jn-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 24px;
                    padding: 0 9px;
                    border-radius: var(--jn-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    margin-left: auto;
                }

                .jn-download-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jn-download-btn i {
                    font-size: 11px;
                }

                .jn-mob-swap {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                    gap: 8px;
                }

                .jn-copy-btn-mob,
                .jn-download-btn-mob {
                    flex: 1;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    border-radius: var(--jn-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jn-copy-btn-mob:hover,
                .jn-download-btn-mob:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .jn-copy-btn-mob.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jn-footer {
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

                .jn-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .jn-switcher { display: flex; }
                    .jn-gutter { display: none; }
                    .jn-body { display: block; min-height: unset; }
                    .jn-pane { display: none; min-height: unset; }
                    .jn-pane.--mob-show { display: flex; }
                    .jn-mob-cta { display: block; }
                    .jn-mob-swap { display: flex; }
                    .jn-go-input-mob { display: flex; }
                    .jn-example-label { display: none; }
                    .jn-example-btn { padding: 0 8px; min-width: 32px; justify-content: center; }
                    .jn-pane-bar-actions .jn-copy-btn { display: none; }
                    .jn-stats { gap: 5px; }
                    .jn-download-btn { margin-left: 0; }
                }
            `}</style>
        </>
    );
}