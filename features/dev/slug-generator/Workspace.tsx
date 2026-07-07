// features/dev/slug-generator/Workspace.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
    SAMPLE_SLUGS,
    DEFAULT_OPTIONS,
    generateSlug,
    generateAlternatives,
    type SlugOptions,
    type CaseStyle,
    type Separator,
} from "./utils";
import SlugPreview from "./SlugPreview";
import SlugBatch from "./SlugBatch";
import SlugCompare from "./SlugCompare";
import SlugHistory from "./SlugHistory";
import { useSlugStore, type HistoryEntry } from "./slugStore";

type ViewTab = "single" | "batch" | "compare" | "history";

export default function SlugGeneratorWorkspace({ tool }: { tool: Tool }) {
    const [viewTab, setViewTab] = useState<ViewTab>("single");
    const [input, setInput] = useState("");
    const [options, setOptions] = useState<SlugOptions>(DEFAULT_OPTIONS);
    const [maxLengthInput, setMaxLengthInput] = useState("");
    const [copied, setCopied] = useState(false);
    const [mobileView, setMobileView] = useState<"input" | "output">("input");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showMobileOptions, setShowMobileOptions] = useState(false);

    const { addToHistory, history, clearHistory } = useSlugStore();

    const output = useMemo(() => {
        if (!input.trim()) return "";
        return generateSlug(input, options);
    }, [input, options]);

    const alternatives = useMemo(() => {
        if (!input.trim()) return [];
        return generateAlternatives(input, options);
    }, [input, options]);

    const handleProcess = useCallback(() => {
        if (!output) return;

        const entry: HistoryEntry = {
            id: Date.now().toString(),
            input: input.substring(0, 100),
            output: output.substring(0, 100),
            timestamp: Date.now(),
            options: { ...options },
        };

        addToHistory(entry);
    }, [output, input, options, addToHistory]);

    const handleCopy = useCallback(async (text: string = output) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            handleProcess();
            setTimeout(() => setCopied(false), 1500);
        } catch { /* silent */ }
    }, [output, handleProcess]);

    const handleDownload = useCallback(() => {
        if (!output) return;
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${output}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        handleProcess();
    }, [output, handleProcess]);

    const handleClear = useCallback(() => {
        setInput("");
    }, []);

    const loadSample = useCallback((preset: typeof SAMPLE_SLUGS[0]) => {
        setInput(preset.text);
        setViewTab("single");
        setMobileView("input");
    }, []);

    const updateMaxLength = useCallback((value: string) => {
        setMaxLengthInput(value);
        const num = parseInt(value);
        setOptions((prev) => ({
            ...prev,
            maxLength: value === "" || isNaN(num) ? null : num,
        }));
    }, []);

    return (
        <>
            <div className="sg-root">
                {/*  Top Chrome  */}
                <div className="sg-chrome">
                    <div className="sg-chrome-left">
                        <span className="sg-cmd-label">Examples:</span>
                        {SAMPLE_SLUGS.slice(0, 3).map((p) => (
                            <button 
                                key={p.id} 
                                className="sg-preset-btn" 
                                onClick={() => loadSample(p)}
                                aria-label={`Load ${p.label} example`}
                            >
                                <i className="ti ti-link" />
                                <span className="sg-preset-label">{p.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="sg-chrome-right">
                        {viewTab === "single" && (
                            <button
                                type="button"
                                className="sg-icon-btn sg-mobile-options-btn"
                                onClick={() => setShowMobileOptions(!showMobileOptions)}
                                aria-label="Toggle options"
                            >
                                <i className="ti ti-settings" />
                            </button>
                        )}
                        {viewTab === "single" && output && (
                            <>
                                <button
                                    type="button"
                                    className={`sg-action-btn${copied ? " success" : ""}`}
                                    onClick={() => handleCopy()}
                                >
                                    <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                                    <span className="sg-label">{copied ? "Copied" : "Copy"}</span>
                                </button>
                                <button
                                    type="button"
                                    className="sg-action-btn sg-desktop-only"
                                    onClick={handleDownload}
                                >
                                    <i className="ti ti-download" />
                                    <span className="sg-label">Save</span>
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            className="sg-icon-btn sg-clear-btn"
                            onClick={handleClear}
                            disabled={!input}
                            title="Clear all"
                            aria-label="Clear input"
                        >
                            <i className="ti ti-trash" />
                        </button>
                    </div>
                </div>

                {/*  View Tabs  */}
                <div className="sg-tabs-bar">
                    <nav className="sg-tabs" role="tablist" aria-label="Tool views">
                        {[
                            { id: "single" as const, label: "Single", icon: "ti-file" },
                            { id: "batch" as const, label: "Batch", icon: "ti-files" },
                            { id: "compare" as const, label: "Compare", icon: "ti-git-compare" },
                            { id: "history" as const, label: "History", icon: "ti-history" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                className={`sg-tab${viewTab === tab.id ? " active" : ""}`}
                                onClick={() => setViewTab(tab.id)}
                                aria-selected={viewTab === tab.id}
                                aria-controls={`sg-panel-${tab.id}`}
                            >
                                <i className={`ti ${tab.icon}`} />
                                <span className="sg-tab-label">{tab.label}</span>
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="sg-badge">{history.length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/*  Options Bar (Single view only)  */}
                {viewTab === "single" && (
                    <div className={`sg-options-bar${showMobileOptions ? " mobile-visible" : ""}`}>
                        <div className="sg-options-header">
                            <span className="sg-options-title">
                                <i className="ti ti-adjustments" />
                                Options
                            </span>
                            <button
                                type="button"
                                className="sg-mobile-close-btn"
                                onClick={() => setShowMobileOptions(false)}
                                aria-label="Close options"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>

                        <div className="sg-options-scroll">
                            <div className="sg-options-row">
                                <span className="sg-options-label">Separator</span>
                                <div className="sg-separator-group">
                                    {(["-", "_", ".", ""] as Separator[]).map((sep) => (
                                        <button
                                            key={sep || "none"}
                                            className={`sg-sep-btn${options.separator === sep ? " active" : ""}`}
                                            onClick={() => setOptions((prev) => ({ ...prev, separator: sep }))}
                                            aria-pressed={options.separator === sep}
                                        >
                                            {sep === "-" && "Hyphen"}
                                            {sep === "_" && "Underscore"}
                                            {sep === "." && "Dot"}
                                            {sep === "" && "None"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="sg-options-row">
                                <span className="sg-options-label">Case Style</span>
                                <div className="sg-case-group">
                                    {(["lowercase", "uppercase", "title", "camel", "pascal"] as CaseStyle[]).map((style) => (
                                        <button
                                            key={style}
                                            className={`sg-case-btn${options.caseStyle === style ? " active" : ""}`}
                                            onClick={() => setOptions((prev) => ({ ...prev, caseStyle: style }))}
                                            aria-pressed={options.caseStyle === style}
                                        >
                                            {style.charAt(0).toUpperCase() + style.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="sg-options-row">
                                <button
                                    type="button"
                                    className="sg-advanced-toggle"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    aria-expanded={showAdvanced}
                                >
                                    <i className={`ti ti-chevron-${showAdvanced ? "down" : "right"}`} />
                                    Advanced Options
                                </button>
                            </div>

                            {showAdvanced && (
                                <>
                                    <div className="sg-options-row sg-advanced">
                                        <label className="sg-toggle">
                                            <input
                                                type="checkbox"
                                                checked={options.removeSpecial}
                                                onChange={(e) => setOptions({ ...options, removeSpecial: e.target.checked })}
                                            />
                                            <span className="sg-toggle-track">
                                                <span className="sg-toggle-thumb" />
                                            </span>
                                            <span className="sg-toggle-label">Remove special characters</span>
                                        </label>
                                        <label className="sg-toggle">
                                            <input
                                                type="checkbox"
                                                checked={options.removeDiacritics}
                                                onChange={(e) => setOptions({ ...options, removeDiacritics: e.target.checked })}
                                            />
                                            <span className="sg-toggle-track">
                                                <span className="sg-toggle-thumb" />
                                            </span>
                                            <span className="sg-toggle-label">Remove diacritics (é → e)</span>
                                        </label>
                                        <label className="sg-toggle">
                                            <input
                                                type="checkbox"
                                                checked={options.removeStopWords}
                                                onChange={(e) => setOptions({ ...options, removeStopWords: e.target.checked })}
                                            />
                                            <span className="sg-toggle-track">
                                                <span className="sg-toggle-thumb" />
                                            </span>
                                            <span className="sg-toggle-label">Remove stop words (a, an, the...)</span>
                                        </label>
                                        <label className="sg-toggle">
                                            <input
                                                type="checkbox"
                                                checked={!options.preserveNumbers}
                                                onChange={(e) => setOptions({ ...options, preserveNumbers: !e.target.checked })}
                                            />
                                            <span className="sg-toggle-track">
                                                <span className="sg-toggle-thumb" />
                                            </span>
                                            <span className="sg-toggle-label">Remove numbers</span>
                                        </label>
                                    </div>

                                    <div className="sg-options-row sg-advanced">
                                        <span className="sg-options-label">Max Length</span>
                                        <div className="sg-length-controls">
                                            <input
                                                type="number"
                                                className="sg-number-input"
                                                value={maxLengthInput}
                                                onChange={(e) => updateMaxLength(e.target.value)}
                                                placeholder="No limit"
                                                min="1"
                                                max="200"
                                            />
                                            {options.maxLength && (
                                                <label className="sg-toggle sg-toggle-inline">
                                                    <input
                                                        type="checkbox"
                                                        checked={options.smartTruncate}
                                                        onChange={(e) => setOptions({ ...options, smartTruncate: e.target.checked })}
                                                    />
                                                    <span className="sg-toggle-track">
                                                        <span className="sg-toggle-thumb" />
                                                    </span>
                                                    <span className="sg-toggle-label">Smart truncate</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Alternative slugs */}
                            {viewTab === "single" && alternatives.length > 0 && (
                                <div className="sg-alternatives">
                                    <span className="sg-alt-label">Alternative slugs:</span>
                                    <div className="sg-alt-list">
                                        {alternatives.slice(0, 5).map((alt, i) => (
                                            <button
                                                key={i}
                                                className="sg-alt-chip"
                                                onClick={() => handleCopy(alt)}
                                                title="Click to copy"
                                            >
                                                {alt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/*  Tab Content  */}
                <div className="sg-tab-content" id={`sg-panel-${viewTab}`} role="tabpanel">
                    {viewTab === "single" && (
                        <SlugPreview
                            input={input}
                            output={output}
                            options={options}
                            mobileView={mobileView}
                            onInputChange={setInput}
                            onMobileViewChange={setMobileView}
                        />
                    )}

                    {viewTab === "batch" && (
                        <SlugBatch
                            options={options}
                            onComplete={handleProcess}
                        />
                    )}

                    {viewTab === "compare" && (
                        <SlugCompare options={options} />
                    )}

                    {viewTab === "history" && (
                        <SlugHistory
                            history={history}
                            onClear={clearHistory}
                            onRestore={(entry) => {
                                setInput(entry.input);
                                setOptions(entry.options);
                                setViewTab("single");
                            }}
                        />
                    )}
                </div>

                {/*  Mobile Bottom Actions  */}
                {viewTab === "single" && output && (
                    <div className="sg-mobile-actions">
                        <button
                            type="button"
                            className={`sg-mob-action${copied ? " success" : ""}`}
                            onClick={() => handleCopy()}
                        >
                            <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                            {copied ? "Copied" : "Copy"}
                        </button>
                        <button
                            type="button"
                            className="sg-mob-action"
                            onClick={handleDownload}
                        >
                            <i className="ti ti-download" />
                            Save
                        </button>
                        <button
                            type="button"
                            className="sg-mob-action"
                            onClick={handleClear}
                        >
                            <i className="ti ti-trash" />
                            Clear
                        </button>
                    </div>
                )}

                {/*  Footer  */}
                <div className="sg-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .sg-root {
                    --sg-radius-sm: 6px;
                    --sg-radius-md: 8px;
                    --sg-radius-lg: 12px;
                    --sg-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-xl);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 600px;
                }

                /*  Chrome  */
                .sg-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 10px 14px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    flex-wrap: wrap;
                }

                .sg-chrome-left,
                .sg-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .sg-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .sg-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .sg-preset-btn i {
                    font-size: 12px;
                }

                .sg-mobile-options-btn {
                    display: none;
                }

                .sg-icon-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 11px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-icon-btn i {
                    font-size: 13px;
                }

                .sg-icon-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .sg-icon-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .sg-clear-btn:hover:not(:disabled) {
                    color: #B91C1C;
                    border-color: currentColor;
                    background: var(--error-bg);
                }

                @media (prefers-color-scheme: dark) {
                    .sg-clear-btn:hover:not(:disabled) {
                        color: #F87171;
                    }
                }

                .sg-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 12px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-action-btn i {
                    font-size: 13px;
                }

                .sg-action-btn:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .sg-action-btn.success {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /*  Tabs Bar  */
                .sg-tabs-bar {
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .sg-tabs {
                    display: flex;
                    padding: 0 14px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .sg-tab {
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
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .sg-tab i {
                    font-size: 13px;
                }

                .sg-tab:hover {
                    color: var(--text);
                }

                .sg-tab.active {
                    color: var(--text);
                }

                .sg-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 10px;
                    right: 10px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .sg-tab-label {
                    display: inline;
                }

                .sg-badge {
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

                /*  Options Bar  */
                .sg-options-bar {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                    max-height: 300px;
                    overflow: hidden;
                }

                .sg-options-header {
                    display: none;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-card);
                }

                .sg-options-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                }

                .sg-options-title i {
                    font-size: 14px;
                }

                .sg-mobile-close-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: none;
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .sg-mobile-close-btn i {
                    font-size: 16px;
                }

                .sg-options-scroll {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 12px 14px;
                    overflow-y: auto;
                }

                .sg-options-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .sg-options-row.sg-advanced {
                    padding-left: 20px;
                    border-left: 2px solid var(--brand-border);
                    background: var(--brand-light);
                    padding: 10px 12px 10px 20px;
                    border-radius: var(--sg-radius-md);
                }

                .sg-options-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    min-width: 80px;
                }

                .sg-separator-group,
                .sg-case-group {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                    flex: 1;
                }

                .sg-sep-btn,
                .sg-case-btn {
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex: 1;
                    min-width: fit-content;
                }

                .sg-sep-btn:hover,
                .sg-case-btn:hover {
                    background: var(--bg-surface);
                }

                .sg-sep-btn.active,
                .sg-case-btn.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .sg-advanced-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-advanced-toggle:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .sg-advanced-toggle i {
                    font-size: 12px;
                }

                .sg-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    cursor: pointer;
                    user-select: none;
                }

                .sg-toggle input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .sg-toggle-track {
                    width: 32px;
                    height: 18px;
                    background: var(--border);
                    border-radius: 99px;
                    position: relative;
                    transition: background 0.15s;
                    flex-shrink: 0;
                }

                .sg-toggle input:checked + .sg-toggle-track {
                    background: var(--brand);
                }

                .sg-toggle-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border-radius: 50%;
                    transition: transform 0.15s;
                }

                .sg-toggle input:checked + .sg-toggle-track .sg-toggle-thumb {
                    transform: translateX(14px);
                }

                .sg-toggle-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .sg-length-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                    flex: 1;
                }

                .sg-number-input {
                    width: 100px;
                    height: 28px;
                    padding: 0 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-md);
                    font-size: 12px;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .sg-number-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .sg-toggle-inline {
                    padding: 4px 8px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-md);
                    background: var(--bg-card);
                }

                /*  Alternatives  */
                .sg-alternatives {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-top: 8px;
                    border-top: 0.5px solid var(--border-faint);
                    flex-wrap: wrap;
                }

                .sg-alt-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .sg-alt-list {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                    flex: 1;
                }

                .sg-alt-chip {
                    display: inline-flex;
                    align-items: center;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: 99px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10.5px;
                    font-weight: 500;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-alt-chip:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /*  Tab Content  */
                .sg-tab-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Mobile Bottom Actions  */
                .sg-mobile-actions {
                    display: none;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    padding: 8px 12px;
                    gap: 6px;
                    align-items: center;
                }

                .sg-mob-action {
                    flex: 1;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    height: 36px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-mob-action i {
                    font-size: 14px;
                }

                .sg-mob-action:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .sg-mob-action.success {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /*  Footer  */
                .sg-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .sg-footer i {
                    font-size: 13px;
                }

                /*  Responsive  */
                .sg-label {
                    display: inline;
                }

                @media (max-width: 768px) {
                    .sg-root {
                        min-height: auto;
                        border-radius: var(--sg-radius-lg);
                    }

                    .sg-label {
                        display: none;
                    }

                    .sg-preset-label {
                        display: none;
                    }

                    .sg-chrome {
                        padding: 8px 10px;
                    }

                    .sg-cmd-label {
                        display: none;
                    }

                    .sg-mobile-options-btn {
                        display: inline-flex;
                    }

                    .sg-desktop-only {
                        display: none;
                    }

                    .sg-options-bar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 1000;
                        max-height: none;
                        transform: translateY(100%);
                        transition: transform 0.3s ease;
                    }

                    .sg-options-bar.mobile-visible {
                        transform: translateY(0);
                    }

                    .sg-options-header {
                        display: flex;
                    }

                    .sg-options-scroll {
                        padding: 12px;
                    }

                    .sg-options-row {
                        flex-direction: column;
                        align-items: flex-start;
                        width: 100%;
                    }

                    .sg-options-label {
                        min-width: auto;
                    }

                    .sg-separator-group,
                    .sg-case-group {
                        width: 100%;
                    }

                    .sg-mobile-actions {
                        display: flex;
                    }

                    .sg-tab-label {
                        display: none;
                    }

                    .sg-tab {
                        padding: 0 10px;
                    }

                    .sg-tabs {
                        padding: 0 10px;
                    }
                }

                @media (max-width: 480px) {
                    .sg-preset-btn {
                        min-width: 32px;
                        justify-content: center;
                        padding: 0 8px;
                    }

                    .sg-alt-chip {
                        font-size: 10px;
                    }

                    .sg-score-circle {
                        width: 48px;
                        height: 48px;
                    }

                    .sg-score-inner {
                        width: 40px;
                        height: 40px;
                    }

                    .sg-footer span {
                        font-size: 10px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sg-preset-btn,
                    .sg-icon-btn,
                    .sg-action-btn,
                    .sg-tab,
                    .sg-sep-btn,
                    .sg-case-btn,
                    .sg-advanced-toggle,
                    .sg-toggle-track,
                    .sg-toggle-thumb,
                    .sg-alt-chip,
                    .sg-mob-action,
                    .sg-options-bar {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}