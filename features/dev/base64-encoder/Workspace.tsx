// features/dev/base64-encoder/Workspace.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
    SAMPLE_BASE64,
    SAMPLE_TEXT,
    decodeBase64,
    encodeBase64,
    type InputSource,
    type Mode,
    type EncodingOptions,
} from "./utils";
import Base64History from "./Base64History";
import Base64Batch from "./Base64Batch";
import Base64Compare from "./Base64Compare";
import Base64Preview from "./Base64Preview";
import { useBase64Store, type HistoryEntry } from "./base64Store";

type ViewTab = "single" | "batch" | "compare" | "history";

export default function Base64Workspace({ tool }: { tool: Tool }) {
    const [viewTab, setViewTab] = useState<ViewTab>("single");
    const [mode, setMode] = useState<Mode>("encode");
    const [source, setSource] = useState<InputSource>("text");
    const [input, setInput] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [options, setOptions] = useState<EncodingOptions>({
        urlSafe: false,
        wrapLines: false,
        lineWidth: 76,
        asDataUri: false,
        charset: "UTF-8",
        padding: true,
    });

    const [copied, setCopied] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [mobileView, setMobileView] = useState<"input" | "output">("input");

    const fileRef = useRef<HTMLInputElement>(null);
    const { addToHistory, history, clearHistory } = useBase64Store();

    const rawEncoded = useMemo(() => {
        if (mode !== "encode") return "";
        if (source === "file" && file) {
            return encodeBase64(file, options);
        }
        if (!input) return "";
        return encodeBase64(input, options);
    }, [mode, source, file, input, options]);

    const decodeResult = useMemo(() => {
        if (mode !== "decode" || !input.trim()) return { text: "" };
        return decodeBase64(input, options);
    }, [mode, input, options]);

    const output = useMemo(() => {
        if (mode === "decode") return decodeResult.text;
        return rawEncoded;
    }, [mode, decodeResult.text, rawEncoded]);

    const handleProcess = useCallback(() => {
        if (!output) return;

        const entry: HistoryEntry = {
            id: Date.now().toString(),
            mode,
            input: input.substring(0, 100),
            output: output.substring(0, 100),
            timestamp: Date.now(),
            options: { ...options },
        };

        addToHistory(entry);
    }, [output, mode, input, options, addToHistory]);

    const handleCopy = useCallback(async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            handleProcess();
            setTimeout(() => setCopied(false), 1500);
        } catch { /* silent */ }
    }, [output, handleProcess]);

    const handleDownload = useCallback((content = output, filename = "encoded.txt") => {
        if (!content) return;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        handleProcess();
    }, [output, handleProcess]);

    const handleClear = useCallback(() => {
        setInput("");
        setFile(null);
    }, []);

    const handleSwap = useCallback(() => {
        if (!output) return;
        setMode(mode === "encode" ? "decode" : "encode");
        setSource("text");
        setInput(output);
        setFile(null);
        setMobileView("output");
    }, [mode, output]);

    const loadSample = useCallback(() => {
        setInput(mode === "encode" ? SAMPLE_TEXT : SAMPLE_BASE64);
        setSource("text");
        setFile(null);
    }, [mode]);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setSource("file");
            setFile(droppedFile);
        }
    }, []);

    const VIEW_TABS = [
        { id: "single" as const, label: "Single", icon: "ti-file" },
        { id: "batch" as const, label: "Batch", icon: "ti-files" },
        { id: "compare" as const, label: "Compare", icon: "ti-git-compare" },
        { id: "history" as const, label: "History", icon: "ti-history" },
    ];

    return (
        <>
            <div className="b64-root">
                {/* ── Top Chrome ── */}
                <div className="b64-chrome">
                    <div className="b64-chrome-left">
                        <div className="b64-pill-group">
                            <button
                                type="button"
                                className={`b64-pill${mode === "encode" ? " active" : ""}`}
                                onClick={() => setMode("encode")}
                            >
                                <i className="ti ti-lock" />
                                Encode
                            </button>
                            <button
                                type="button"
                                className={`b64-pill${mode === "decode" ? " active" : ""}`}
                                onClick={() => setMode("decode")}
                            >
                                <i className="ti ti-lock-open" />
                                Decode
                            </button>
                        </div>

                        {mode === "encode" && viewTab === "single" && (
                            <div className="b64-pill-group b64-pill-ghost">
                                <button
                                    type="button"
                                    className={`b64-pill${source === "text" ? " active" : ""}`}
                                    onClick={() => { setSource("text"); setFile(null); }}
                                >
                                    <i className="ti ti-typography" />
                                    Text
                                </button>
                                <button
                                    type="button"
                                    className={`b64-pill${source === "file" ? " active" : ""}`}
                                    onClick={() => { setSource("file"); setInput(""); }}
                                >
                                    <i className="ti ti-paperclip" />
                                    File
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            className="b64-icon-btn"
                            onClick={loadSample}
                            title="Load sample"
                        >
                            <i className="ti ti-wand" />
                            <span className="b64-label">Sample</span>
                        </button>

                        {viewTab === "single" && (
                            <button
                                type="button"
                                className="b64-icon-btn"
                                onClick={handleSwap}
                                disabled={!output}
                                title="Swap input/output"
                            >
                                <i className="ti ti-arrows-right-left" />
                                <span className="b64-label">Swap</span>
                            </button>
                        )}
                    </div>

                    <div className="b64-chrome-right">
                        {viewTab === "single" && output && (
                            <>
                                <button
                                    type="button"
                                    className={`b64-action-btn${copied ? " success" : ""}`}
                                    onClick={handleCopy}
                                >
                                    <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                                    {copied ? "Copied" : "Copy"}
                                </button>
                                <button
                                    type="button"
                                    className="b64-action-btn"
                                    onClick={() => handleDownload()}
                                >
                                    <i className="ti ti-download" />
                                    <span className="b64-label">Save</span>
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            className="b64-icon-btn b64-clear-btn"
                            onClick={handleClear}
                            disabled={!input && !file}
                            title="Clear all"
                        >
                            <i className="ti ti-trash" />
                        </button>
                    </div>
                </div>

                {/* ── View Tabs ── */}
                <div className="b64-tabs-bar">
                    <nav className="b64-tabs" role="tablist">
                        {VIEW_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                className={`b64-tab${viewTab === tab.id ? " active" : ""}`}
                                onClick={() => setViewTab(tab.id)}
                                aria-selected={viewTab === tab.id}
                            >
                                <i className={`ti ${tab.icon}`} />
                                {tab.label}
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="b64-badge">{history.length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── Options Bar (Single view only) ── */}
                {viewTab === "single" && (
                    <div className="b64-options-bar">
                        <label className="b64-toggle">
                            <input
                                type="checkbox"
                                checked={options.urlSafe}
                                onChange={(e) => setOptions({ ...options, urlSafe: e.target.checked })}
                            />
                            <span className="b64-toggle-track">
                                <span className="b64-toggle-thumb" />
                            </span>
                            <span className="b64-toggle-label">URL-safe</span>
                        </label>

                        {mode === "encode" && !(source === "file" && options.asDataUri) && (
                            <label className="b64-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.wrapLines}
                                    onChange={(e) => setOptions({ ...options, wrapLines: e.target.checked })}
                                />
                                <span className="b64-toggle-track">
                                    <span className="b64-toggle-thumb" />
                                </span>
                                <span className="b64-toggle-label">Wrap at {options.lineWidth} chars</span>
                            </label>
                        )}

                        {mode === "encode" && source === "file" && (
                            <label className="b64-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.asDataUri}
                                    onChange={(e) => setOptions({ ...options, asDataUri: e.target.checked })}
                                />
                                <span className="b64-toggle-track">
                                    <span className="b64-toggle-thumb" />
                                </span>
                                <span className="b64-toggle-label">Data URI</span>
                            </label>
                        )}

                        <label className="b64-toggle">
                            <input
                                type="checkbox"
                                checked={options.padding}
                                onChange={(e) => setOptions({ ...options, padding: e.target.checked })}
                            />
                            <span className="b64-toggle-track">
                                <span className="b64-toggle-thumb" />
                            </span>
                            <span className="b64-toggle-label">Padding (=)</span>
                        </label>

                        <div className="b64-select-wrap">
                            <label className="b64-select-label">Charset:</label>
                            <select
                                className="b64-select"
                                value={options.charset}
                                onChange={(e) => setOptions({ ...options, charset: e.target.value as any })}
                            >
                                <option value="UTF-8">UTF-8</option>
                                <option value="UTF-16">UTF-16</option>
                                <option value="ASCII">ASCII</option>
                                <option value="ISO-8859-1">ISO-8859-1</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* ── Tab Content ── */}
                <div className="b64-tab-content">
                    {viewTab === "single" && (
                        <Base64Preview
                            mode={mode}
                            source={source}
                            input={input}
                            output={output}
                            file={file}
                            decodeResult={decodeResult}
                            dragOver={dragOver}
                            mobileView={mobileView}
                            fileRef={fileRef}
                            onInputChange={setInput}
                            onFileChange={setFile}
                            onDragOver={(over) => setDragOver(over)}
                            onDrop={handleFileDrop}
                            onMobileViewChange={setMobileView}
                        />
                    )}

                    {viewTab === "batch" && (
                        <Base64Batch
                            mode={mode}
                            options={options}
                            onComplete={handleProcess}
                        />
                    )}

                    {viewTab === "compare" && (
                        <Base64Compare mode={mode} options={options} />
                    )}

                    {viewTab === "history" && (
                        <Base64History
                            history={history}
                            onClear={clearHistory}
                            onRestore={(entry) => {
                                setMode(entry.mode);
                                setInput(entry.input);
                                setOptions(entry.options);
                                setViewTab("single");
                            }}
                        />
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="b64-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .b64-root {
                    --b64-radius-sm: 6px;
                    --b64-radius-md: 8px;
                    --b64-radius-lg: 12px;
                    --b64-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--b64-radius-xl);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 600px;
                }

                /* ── Chrome ── */
                .b64-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 10px 14px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    flex-wrap: wrap;
                }

                .b64-chrome-left,
                .b64-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .b64-pill-group {
                    display: flex;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--b64-radius-md);
                    overflow: hidden;
                }

                .b64-pill-ghost {
                    background: transparent;
                    border-color: var(--border-faint);
                }

                .b64-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 12px;
                    border: none;
                    border-right: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .b64-pill:last-child {
                    border-right: none;
                }

                .b64-pill i {
                    font-size: 13px;
                }

                .b64-pill:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .b64-pill.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                }

                .b64-icon-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 11px;
                    border-radius: var(--b64-radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .b64-icon-btn i {
                    font-size: 13px;
                }

                .b64-icon-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .b64-icon-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .b64-clear-btn:hover:not(:disabled) {
                    color: #B91C1C;
                    border-color: currentColor;
                    background: var(--error-bg);
                }

                @media (prefers-color-scheme: dark) {
                    .b64-clear-btn:hover:not(:disabled) {
                        color: #F87171;
                    }
                }

                .b64-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 12px;
                    border-radius: var(--b64-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .b64-action-btn i {
                    font-size: 13px;
                }

                .b64-action-btn:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .b64-action-btn.success {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* ── Tabs Bar ── */
                .b64-tabs-bar {
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .b64-tabs {
                    display: flex;
                    padding: 0 14px;
                }

                .b64-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 38px;
                    padding: 0 14px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.12s;
                }

                .b64-tab i {
                    font-size: 13px;
                }

                .b64-tab:hover {
                    color: var(--text);
                }

                .b64-tab.active {
                    color: var(--text);
                }

                .b64-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 10px;
                    right: 10px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .b64-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 600;
                }

                /* ── Options Bar ── */
                .b64-options-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 10px 14px;
                    border-bottom: 0.5px solid var(--border-faint);
                    background: var(--bg-surface);
                    flex-wrap: wrap;
                }

                .b64-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    cursor: pointer;
                    user-select: none;
                }

                .b64-toggle input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .b64-toggle-track {
                    width: 32px;
                    height: 18px;
                    background: var(--border);
                    border-radius: 99px;
                    position: relative;
                    transition: background 0.15s;
                    flex-shrink: 0;
                }

                .b64-toggle input:checked + .b64-toggle-track {
                    background: var(--brand);
                }

                .b64-toggle-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border-radius: 50%;
                    transition: transform 0.15s;
                }

                .b64-toggle input:checked + .b64-toggle-track .b64-toggle-thumb {
                    transform: translateX(14px);
                }

                .b64-toggle-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .b64-select-wrap {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .b64-select-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .b64-select {
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--b64-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .b64-select:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                /* ── Tab Content ── */
                .b64-tab-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /* ── Footer ── */
                .b64-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .b64-footer i {
                    font-size: 13px;
                }

                /* ── Responsive ── */
                .b64-label {
                    display: inline;
                }

                @media (max-width: 768px) {
                    .b64-label {
                        display: none;
                    }

                    .b64-chrome {
                        padding: 8px 10px;
                    }

                    .b64-options-bar {
                        padding: 8px 10px;
                        gap: 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .b64-pill,
                    .b64-icon-btn,
                    .b64-action-btn,
                    .b64-tab,
                    .b64-toggle-track,
                    .b64-toggle-thumb {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}