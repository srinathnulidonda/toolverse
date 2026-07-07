// features/dev/html-formatter/Workspace.tsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { Tool } from "@/lib/tools";
import { 
    processHTML, 
    type FormattingOptions, 
    type FormattingMode,
    type IndentStyle,
    DEFAULT_OPTIONS,
    SAMPLE_TEMPLATES,
    convertToMarkdown,
    convertToPlainText,
    formatBytes
} from "./htmlEngine";
import HTMLValidation from "./HTMLValidation";
import HTMLPreview from "./HTMLPreview";
import HTMLBatch from "./HTMLBatch";
import { useHTMLStore } from "./htmlStore";

type TabView = "single" | "batch" | "validation" | "preview" | "history";

export default function HTMLFormatterWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [tabView, setTabView] = useState<TabView>("single");
    const [options, setOptions] = useState<FormattingOptions>(DEFAULT_OPTIONS);
    const [copiedKey, setCopiedKey] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
    const rootRef = useRef<HTMLDivElement>(null);
    
    const { history, settings, addToHistory, clearHistory, updateSettings } = useHTMLStore();

    const result = useMemo(() => {
        if (!input.trim()) return null;
        try {
            return processHTML(input, options);
        } catch (error) {
            console.error("Processing failed:", error);
            return null;
        }
    }, [input, options]);

    const handleCopy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1500);
    }, []);

    const handleDownload = useCallback((format: "html" | "markdown" | "txt" = "html") => {
        if (!result) return;

        let content = result.output;
        let mimeType = "text/html";
        let extension = "html";

        if (format === "markdown") {
            content = convertToMarkdown(input);
            mimeType = "text/markdown";
            extension = "md";
        } else if (format === "txt") {
            content = convertToPlainText(input);
            mimeType = "text/plain";
            extension = "txt";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${options.mode}_${Date.now()}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);

        if (settings.autoSave && format === "html") {
            addToHistory({
                title: `${options.mode} - ${new Date().toLocaleDateString()}`,
                input,
                result,
                options,
                tags: [options.mode],
                isFavorite: false,
            });
        }
    }, [result, input, options, settings.autoSave, addToHistory]);

    const loadSample = useCallback((key: keyof typeof SAMPLE_TEMPLATES) => {
        setInput(SAMPLE_TEMPLATES[key].html);
        setMobilePanel("input");
    }, []);

    const clearAll = useCallback(() => {
        setInput("");
        setMobilePanel("input");
    }, []);

    const goToOutput = useCallback(() => {
        setMobilePanel("output");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    }, []);

    const goToInput = useCallback(() => {
        setMobilePanel("input");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    }, []);

    const TAB_VIEWS = [
        { id: "single"     as const, label: "Format",   icon: "ti-code",         description: "Format or minify HTML" },
        { id: "batch"      as const, label: "Batch",    icon: "ti-files",        description: "Process multiple files" },
        { id: "validation" as const, label: "Validate", icon: "ti-shield-check", description: "Check HTML quality" },
        { id: "preview"    as const, label: "Preview",  icon: "ti-eye",          description: "Live preview" },
        { id: "history"    as const, label: "History",  icon: "ti-history",      description: "View history" },
    ];

    return (
        <>
            <div className="hf-root" ref={rootRef}>

                {/* ── Top Chrome ── */}
                <div className="hf-chrome">
                    <div className="hf-chrome-left">
                        <div className="hf-title">
                            <i className="ti ti-brand-html5" />
                            HTML Formatter
                        </div>
                    </div>
                    <div className="hf-chrome-right">
                        <button
                            type="button"
                            className="hf-chrome-btn"
                            onClick={() => setShowSettings(s => !s)}
                        >
                            <i className="ti ti-settings" />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>

                {/* ── Settings Panel ── */}
                {showSettings && (
                    <div className="hf-settings">
                        <div className="hf-settings-row">
                            <div className="hf-setting-group">
                                <label className="hf-setting-label">Mode</label>
                                <div className="hf-pill-group">
                                    {(["format", "minify", "compress"] as FormattingMode[]).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`hf-pill${options.mode === m ? " active" : ""}`}
                                            onClick={() => setOptions(prev => ({ ...prev, mode: m }))}
                                        >
                                            {m === "format"   && <i className="ti ti-text-wrap" />}
                                            {m === "minify"   && <i className="ti ti-file-zip"  />}
                                            {m === "compress" && <i className="ti ti-minimize"  />}
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {options.mode === "format" && (
                                <>
                                    <div className="hf-setting-group">
                                        <label className="hf-setting-label">Indent Style</label>
                                        <select
                                            className="hf-select"
                                            value={options.indentStyle}
                                            onChange={(e) => setOptions(prev => ({ 
                                                ...prev, 
                                                indentStyle: e.target.value as IndentStyle 
                                            }))}
                                        >
                                            <option value="2-spaces">2 Spaces</option>
                                            <option value="4-spaces">4 Spaces</option>
                                            <option value="tabs">Tabs</option>
                                        </select>
                                    </div>

                                    <div className="hf-setting-group">
                                        <label className="hf-setting-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={options.wrapAttributes}
                                                onChange={(e) => setOptions(prev => ({ 
                                                    ...prev, 
                                                    wrapAttributes: e.target.checked 
                                                }))}
                                            />
                                            <span>Wrap long attributes</span>
                                        </label>
                                    </div>

                                    <div className="hf-setting-group">
                                        <label className="hf-setting-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={options.sortAttributes}
                                                onChange={(e) => setOptions(prev => ({ 
                                                    ...prev, 
                                                    sortAttributes: e.target.checked 
                                                }))}
                                            />
                                            <span>Sort attributes</span>
                                        </label>
                                    </div>
                                </>
                            )}

                            <div className="hf-setting-group">
                                <label className="hf-setting-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.removeComments}
                                        onChange={(e) => setOptions(prev => ({ 
                                            ...prev, 
                                            removeComments: e.target.checked 
                                        }))}
                                    />
                                    <span>Remove comments</span>
                                </label>
                            </div>

                            {options.mode !== "format" && (
                                <div className="hf-setting-group">
                                    <label className="hf-setting-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={options.removeOptionalTags}
                                            onChange={(e) => setOptions(prev => ({ 
                                                ...prev, 
                                                removeOptionalTags: e.target.checked 
                                            }))}
                                        />
                                        <span>Remove optional tags</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tab Navigation ── */}
                <div className="hf-tabs-bar">
                    <nav className="hf-tabs">
                        {TAB_VIEWS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`hf-tab${tabView === tab.id ? " active" : ""}`}
                                onClick={() => setTabView(tab.id)}
                                title={tab.description}
                            >
                                <i className={`ti ${tab.icon}`} />
                                <span>{tab.label}</span>
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="hf-tab-badge">{history.length}</span>
                                )}
                                {tab.id === "validation" && result && !result.validation.isValid && (
                                    <span className="hf-tab-indicator" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── Tab Content ── */}
                <div className="hf-tab-content">

                    {/* Single Tab */}
                    {tabView === "single" && (
                        <div className="hf-single-view">
                            {/* Command Bar */}
                            <div className="hf-command-bar">
                                <div className="hf-command-left">
                                    <div className="hf-samples">
                                        <span className="hf-samples-label">Examples:</span>
                                        {Object.entries(SAMPLE_TEMPLATES).map(([key, sample]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                className="hf-sample-btn"
                                                onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                                                title={sample.description}
                                            >
                                                {sample.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="hf-command-right">
                                    {result && (
                                        <div className="hf-export-chips">
                                            <span className="hf-export-label">Export:</span>
                                            <button type="button" className="hf-export-chip" onClick={() => handleDownload("html")}>HTML</button>
                                            <button type="button" className="hf-export-chip" onClick={() => handleDownload("markdown")}>MD</button>
                                            <button type="button" className="hf-export-chip" onClick={() => handleDownload("txt")}>TXT</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Panel Switcher */}
                            <div className="hf-mobile-switcher">
                                <button
                                    type="button"
                                    className={`hf-switcher-tab${mobilePanel === "input" ? " active" : ""}`}
                                    onClick={goToInput}
                                >
                                    <i className="ti ti-code" />
                                    Input HTML
                                </button>
                                <div className="hf-switcher-divider" />
                                <button
                                    type="button"
                                    className={`hf-switcher-tab${mobilePanel === "output" ? " active" : ""}`}
                                    onClick={goToOutput}
                                >
                                    <i className="ti ti-sparkles" />
                                    Result
                                    {result && mobilePanel !== "output" && <span className="hf-ready-indicator" />}
                                </button>
                            </div>

                            {/* Body */}
                            <div className="hf-body">
                                {/* Input Panel */}
                                <div className={`hf-panel${mobilePanel === "input" ? " mobile-visible" : " mobile-hidden"}`}>
                                    <div className="hf-panel-header">
                                        <div className="hf-panel-title">
                                            <i className="ti ti-code" />
                                            Input HTML
                                        </div>
                                        <div className="hf-panel-actions">
                                            {input && (
                                                <span className="hf-char-count">
                                                    {input.length.toLocaleString()} chars
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="hf-panel-btn"
                                                onClick={clearAll}
                                                disabled={!input}
                                                title="Clear input"
                                            >
                                                <i className="ti ti-x" />
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        className="hf-textarea"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Paste your HTML here..."
                                        spellCheck={false}
                                    />
                                    {input && result && (
                                        <div className="hf-mobile-cta">
                                            <button
                                                type="button"
                                                className="hf-view-result-btn"
                                                onClick={goToOutput}
                                            >
                                                <i className="ti ti-sparkles" />
                                                View {options.mode === "format" ? "Formatted" : options.mode === "minify" ? "Minified" : "Compressed"} HTML
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

                                {/* Output Panel */}
                                <div className={`hf-panel${mobilePanel === "output" ? " mobile-visible" : " mobile-hidden"}`}>
                                    <div className="hf-panel-header">
                                        <div className="hf-panel-title">
                                            <i className="ti ti-sparkles" />
                                            {options.mode === "format" ? "Formatted" : options.mode === "minify" ? "Minified" : "Compressed"} HTML
                                        </div>
                                        <div className="hf-panel-actions">
                                            {result && (
                                                <button
                                                    type="button"
                                                    className={`hf-copy-btn${copiedKey === "output" ? " copied" : ""}`}
                                                    onClick={() => handleCopy(result.output, "output")}
                                                >
                                                    <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                                                    {copiedKey === "output" ? "Copied" : "Copy"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {!result && !input && (
                                        <div className="hf-empty">
                                            <div className="hf-empty-icon">
                                                <i className="ti ti-brand-html5" />
                                            </div>
                                            <h3 className="hf-empty-title">Format or Minify HTML</h3>
                                            <p className="hf-empty-description">
                                                Paste HTML code on the left or try a sample to get started
                                            </p>
                                            <div className="hf-empty-samples">
                                                {Object.entries(SAMPLE_TEMPLATES).slice(0, 2).map(([key, sample]) => (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        className="hf-empty-sample-btn"
                                                        onClick={() => loadSample(key as keyof typeof SAMPLE_TEMPLATES)}
                                                    >
                                                        Try {sample.name}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                className="hf-go-input-btn"
                                                onClick={goToInput}
                                            >
                                                <i className="ti ti-code" />
                                                Go to input
                                            </button>
                                        </div>
                                    )}

                                    {result && (
                                        <>
                                            <pre className="hf-output">{result.output}</pre>
                                            <div className="hf-stats-bar">
                                                <div className="hf-stat">
                                                    <span className="hf-stat-label">Original</span>
                                                    <span className="hf-stat-value">{formatBytes(result.stats.original)}</span>
                                                </div>
                                                <div className="hf-stat">
                                                    <span className="hf-stat-label">Processed</span>
                                                    <span className="hf-stat-value">{formatBytes(result.stats.processed)}</span>
                                                </div>
                                                <div className="hf-stat">
                                                    <span className="hf-stat-label">{result.stats.savings > 0 ? "Saved" : "Added"}</span>
                                                    <span className={`hf-stat-value ${result.stats.savings > 0 ? "success" : result.stats.savings < 0 ? "warning" : ""}`}>
                                                        {formatBytes(Math.abs(result.stats.savings))}
                                                        {result.stats.savingsPercent !== 0 && (
                                                            <span className="hf-stat-percent">({Math.abs(result.stats.savingsPercent)}%)</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="hf-stat">
                                                    <span className="hf-stat-label">Elements</span>
                                                    <span className="hf-stat-value">{result.stats.elements.toLocaleString()}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="hf-download-btn"
                                                    onClick={() => handleDownload("html")}
                                                >
                                                    <i className="ti ti-download" />
                                                    Download
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {result && (
                                        <div className="hf-mobile-actions">
                                            <button
                                                type="button"
                                                className={`hf-mobile-action-btn${copiedKey === "mobile" ? " copied" : ""}`}
                                                onClick={() => handleCopy(result.output, "mobile")}
                                            >
                                                <i className={`ti ${copiedKey === "mobile" ? "ti-check" : "ti-copy"}`} />
                                                {copiedKey === "mobile" ? "Copied" : "Copy Result"}
                                            </button>
                                            <button
                                                type="button"
                                                className="hf-mobile-action-btn"
                                                onClick={() => handleDownload("html")}
                                            >
                                                <i className="ti ti-download" />
                                                Download HTML
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Batch Tab */}
                    {tabView === "batch" && (
                        <HTMLBatch options={options} />
                    )}

                    {/* Validation Tab */}
                    {tabView === "validation" && (
                        result ? (
                            <HTMLValidation
                                validation={result.validation}
                                metadata={result.metadata}
                            />
                        ) : (
                            <div className="hf-tab-empty">
                                <div className="hf-tab-empty-icon"><i className="ti ti-shield-check" /></div>
                                <h3 className="hf-tab-empty-title">HTML Validation</h3>
                                <p className="hf-tab-empty-description">
                                    Add HTML code to see validation results, accessibility score, and best practice recommendations.
                                </p>
                                <button type="button" className="hf-tab-empty-btn" onClick={() => setTabView("single")}>
                                    Go to formatter
                                </button>
                            </div>
                        )
                    )}

                    {/* ✅ Preview Tab — key change here */}
                    {tabView === "preview" && (
                        <div className="hf-preview-host">
                            {input.trim() ? (
                                <HTMLPreview html={input} />
                            ) : (
                                <div className="hf-tab-empty">
                                    <div className="hf-tab-empty-icon"><i className="ti ti-eye" /></div>
                                    <h3 className="hf-tab-empty-title">Live Preview</h3>
                                    <p className="hf-tab-empty-description">
                                        Add HTML code to see a live rendered preview with responsive viewport controls.
                                    </p>
                                    <button type="button" className="hf-tab-empty-btn" onClick={() => setTabView("single")}>
                                        Go to formatter
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* History Tab */}
                    {tabView === "history" && (
                        <div className="hf-history-view">
                            {history.length === 0 ? (
                                <div className="hf-tab-empty">
                                    <div className="hf-tab-empty-icon"><i className="ti ti-history" /></div>
                                    <h3 className="hf-tab-empty-title">No History Yet</h3>
                                    <p className="hf-tab-empty-description">
                                        Your formatting history will appear here when auto-save is enabled.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="hf-history-header">
                                        <div className="hf-history-title">
                                            <i className="ti ti-history" />
                                            Formatting History
                                            <span className="hf-history-count">{history.length}</span>
                                        </div>
                                        <button type="button" className="hf-action-btn" onClick={clearHistory}>
                                            <i className="ti ti-trash" />
                                            Clear History
                                        </button>
                                    </div>
                                    <div className="hf-history-list">
                                        {history.slice(0, 50).map((entry) => (
                                            <div key={entry.id} className="hf-history-item">
                                                <div className="hf-history-item-header">
                                                    <div className="hf-history-item-info">
                                                        <span className="hf-history-item-title">{entry.title}</span>
                                                        <span className="hf-history-item-time">
                                                            {new Date(entry.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="hf-history-item-meta">
                                                        <span className="hf-history-mode-badge">{entry.options.mode}</span>
                                                        {entry.result.stats.savings !== 0 && (
                                                            <span className={`hf-history-savings ${entry.result.stats.savings > 0 ? "positive" : "negative"}`}>
                                                                {entry.result.stats.savings > 0 ? "↓" : "↑"} {formatBytes(Math.abs(entry.result.stats.savings))}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="hf-footer">
                    <div className="hf-footer-info">
                        <i className="ti ti-shield-lock" />
                        <span>Everything runs in your browser — no data ever leaves this page.</span>
                    </div>
                    {result && (
                        <div className="hf-footer-stats">
                            <span>{result.stats.elements} elements</span>
                            <span>•</span>
                            <span>{result.stats.lines} lines</span>
                            {result.metadata.doctype && <><span>•</span><span>HTML5</span></>}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .hf-root {
                    --hf-radius-sm: 6px;
                    --hf-radius-md: 8px;
                    --hf-radius-lg: 12px;
                    --hf-radius-xl: 16px;

                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-xl);
                    display: flex;
                    flex-direction: column;
                    min-height: 700px;
                    overflow: hidden;
                }

                /* Chrome */
                .hf-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .hf-chrome-left,
                .hf-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .hf-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .hf-title i {
                    font-size: 16px;
                    color: #e44d26;
                }

                .hf-chrome-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--hf-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-chrome-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hf-chrome-btn i { font-size: 13px; }

                /* Settings */
                .hf-settings {
                    padding: 14px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .hf-settings-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .hf-setting-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .hf-setting-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hf-pill-group {
                    display: inline-flex;
                    gap: 2px;
                    padding: 2px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                }

                .hf-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
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
                    white-space: nowrap;
                }

                .hf-pill:hover { background: var(--bg-surface); color: var(--text); }
                .hf-pill.active { background: var(--brand-light); color: var(--brand-text); }
                .hf-pill i { font-size: 12px; }

                .hf-select {
                    height: 32px;
                    padding: 0 10px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 12px;
                    cursor: pointer;
                }

                .hf-setting-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    user-select: none;
                }

                .hf-setting-checkbox input { cursor: pointer; }
                .hf-setting-checkbox span { font-size: 12px; color: var(--text-secondary); }

                /* Tabs */
                .hf-tabs-bar {
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .hf-tabs {
                    display: flex;
                    padding: 0 16px;
                    overflow-x: auto;
                }

                .hf-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 40px;
                    padding: 0 16px;
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

                .hf-tab:hover { color: var(--text); }
                .hf-tab.active { color: var(--text); }

                .hf-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 12px;
                    right: 12px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .hf-tab i { font-size: 14px; }

                .hf-tab-badge {
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

                .hf-tab-indicator {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #ef4444;
                }

                /* ── Tab Content ── */
                .hf-tab-content {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Preview Host — this is the key ── */
                .hf-preview-host {
                    position: relative;
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }

                /* Single View */
                .hf-single-view {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 0;
                }

                /* Command Bar */
                .hf-command-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                    flex-shrink: 0;
                }

                .hf-command-left,
                .hf-command-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .hf-samples {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .hf-samples-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hf-sample-btn {
                    height: 26px;
                    padding: 0 8px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .hf-sample-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .hf-export-chips {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .hf-export-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hf-export-chip {
                    height: 24px;
                    padding: 0 7px;
                    border: 0.5px solid var(--border);
                    border-radius: 99px;
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                    font-family: var(--font-mono);
                }

                .hf-export-chip:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* Mobile Switcher */
                .hf-mobile-switcher {
                    display: none;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .hf-switcher-tab {
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
                    transition: color 0.12s;
                }

                .hf-switcher-tab.active { color: var(--text); }

                .hf-switcher-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: var(--brand);
                }

                .hf-switcher-divider {
                    width: 0.5px;
                    background: var(--border);
                    align-self: stretch;
                    margin: 10px 0;
                }

                .hf-ready-indicator {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--brand);
                }

                /* Body */
                .hf-body {
                    display: grid;
                    grid-template-columns: 1fr 44px 1fr;
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }

                .hf-panel {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 0;
                }

                .hf-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 8px;
                    flex-shrink: 0;
                }

                .hf-panel-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hf-panel-title i { font-size: 13px; }

                .hf-panel-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hf-char-count {
                    font-size: 10px;
                    font-family: var(--font-mono);
                    color: var(--text-disabled);
                }

                .hf-panel-btn {
                    width: 28px;
                    height: 28px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-panel-btn:hover:not(:disabled) { background: var(--bg-surface); color: var(--text); }
                .hf-panel-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                .hf-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-copy-btn:hover { background: var(--bg-surface); color: var(--text); }
                .hf-copy-btn.copied { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }
                .hf-copy-btn i { font-size: 12px; }

                .hf-textarea {
                    flex: 1;
                    padding: 16px;
                    border: none;
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 13px;
                    font-family: var(--font-mono);
                    line-height: 1.6;
                    resize: none;
                    outline: none;
                    min-height: 0;
                }

                .hf-textarea::placeholder { color: var(--text-disabled); }

                .hf-mobile-cta {
                    display: none;
                    padding: 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .hf-view-result-btn {
                    width: 100%;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    border-radius: var(--hf-radius-lg);
                    background: var(--brand);
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-view-result-btn:hover { background: var(--brand-hover); }
                .hf-view-result-btn i { font-size: 16px; }

                /* Gutter */
                .hf-gutter {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-surface);
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                }

                .hf-gutter-line { flex: 1; width: 0.5px; background: var(--border); }

                .hf-gutter-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-disabled);
                    font-size: 14px;
                }

                /* Empty State */
                .hf-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 40px 24px;
                    text-align: center;
                    background: var(--bg-card);
                }

                .hf-empty-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: var(--text-disabled);
                }

                .hf-empty-title { font-size: 16px; font-weight: 600; color: var(--text); margin: 0; }
                .hf-empty-description { font-size: 13px; color: var(--text-tertiary); margin: 0; max-width: 400px; line-height: 1.6; }

                .hf-empty-samples { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }

                .hf-empty-sample-btn {
                    height: 32px;
                    padding: 0 14px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-empty-sample-btn:hover { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }

                .hf-go-input-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 36px;
                    padding: 0 16px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-go-input-btn:hover { background: var(--bg-card); color: var(--text); }
                .hf-go-input-btn i { font-size: 14px; }

                /* Output */
                .hf-output {
                    flex: 1;
                    margin: 0;
                    padding: 16px;
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 13px;
                    font-family: var(--font-mono);
                    line-height: 1.6;
                    overflow: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                    min-height: 0;
                }

                /* Stats Bar */
                .hf-stats-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    overflow-x: auto;
                    flex-shrink: 0;
                }

                .hf-stat { display: flex; align-items: center; gap: 6px; font-size: 11px; white-space: nowrap; }
                .hf-stat-label { color: var(--text-tertiary); font-weight: 500; }
                .hf-stat-value { color: var(--text); font-weight: 600; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px; }
                .hf-stat-value.success { color: #16a34a; }
                .hf-stat-value.warning { color: #d97706; }

                @media (prefers-color-scheme: dark) {
                    .hf-stat-value.success { color: #4ade80; }
                    .hf-stat-value.warning { color: #fbbf24; }
                }

                .hf-stat-percent { font-size: 10px; opacity: 0.7; }

                .hf-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--brand);
                    color: white;
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    margin-left: auto;
                }

                .hf-download-btn:hover { background: var(--brand-hover); }
                .hf-download-btn i { font-size: 12px; }

                /* Mobile Actions */
                .hf-mobile-actions {
                    display: none;
                    flex-direction: column;
                    gap: 8px;
                    padding: 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .hf-mobile-action-btn {
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-lg);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-mobile-action-btn:hover { background: var(--bg-surface); color: var(--text); }
                .hf-mobile-action-btn.copied { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }
                .hf-mobile-action-btn i { font-size: 16px; }

                /* Tab Empty States */
                .hf-tab-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 60px 24px;
                    text-align: center;
                    background: var(--bg-surface);
                }

                .hf-tab-empty-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: var(--text-disabled);
                }

                .hf-tab-empty-title { font-size: 18px; font-weight: 600; color: var(--text); margin: 0; }
                .hf-tab-empty-description { font-size: 14px; color: var(--text-tertiary); margin: 0; max-width: 400px; line-height: 1.6; }

                .hf-tab-empty-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 40px;
                    padding: 0 20px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-lg);
                    background: var(--brand);
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-tab-empty-btn:hover { background: var(--brand-hover); }

                /* History */
                .hf-history-view {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-surface);
                    overflow: hidden;
                    min-height: 0;
                }

                .hf-history-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 14px 16px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .hf-history-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .hf-history-title i { font-size: 15px; color: var(--text-secondary); }

                .hf-history-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    border-radius: 99px;
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 11px;
                    font-weight: 600;
                }

                .hf-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 12px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-md);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hf-action-btn:hover { background: var(--bg-card); color: var(--text); }
                .hf-action-btn i { font-size: 13px; }

                .hf-history-list {
                    flex: 1;
                    overflow: auto;
                    padding: 8px;
                    min-height: 0;
                }

                .hf-history-item {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hf-radius-lg);
                    padding: 12px 14px;
                    margin-bottom: 8px;
                    transition: all 0.12s;
                }

                .hf-history-item:hover { border-color: var(--brand-border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

                .hf-history-item-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

                .hf-history-item-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }

                .hf-history-item-title { font-size: 13px; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .hf-history-item-time { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); }

                .hf-history-item-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

                .hf-history-mode-badge {
                    display: inline-flex;
                    align-items: center;
                    height: 22px;
                    padding: 0 8px;
                    border-radius: 99px;
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .hf-history-savings { font-size: 11px; font-weight: 600; font-family: var(--font-mono); }
                .hf-history-savings.positive { color: #16a34a; }
                .hf-history-savings.negative { color: #d97706; }

                @media (prefers-color-scheme: dark) {
                    .hf-history-savings.positive { color: #4ade80; }
                    .hf-history-savings.negative { color: #fbbf24; }
                }

                /* Footer */
                .hf-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 16px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .hf-footer-info { display: flex; align-items: center; gap: 6px; color: var(--text-tertiary); }
                .hf-footer-info i { font-size: 13px; color: var(--brand); }
                .hf-footer-stats { display: flex; align-items: center; gap: 8px; color: var(--text-disabled); font-family: var(--font-mono); flex-wrap: wrap; }

                /* ── Mobile ── */
                @media (max-width: 768px) {
                    .hf-root {
                        border-radius: 0;
                        border-left: none;
                        border-right: none;
                        min-height: 100dvh;
                    }

                    .hf-chrome-btn span,
                    .hf-samples-label,
                    .hf-export-label { display: none; }

                    .hf-settings-row { flex-direction: column; align-items: stretch; }
                    .hf-setting-group { width: 100%; }

                    .hf-tab span { display: none; }
                    .hf-tab { padding: 0 12px; }

                    .hf-command-bar { flex-direction: column; align-items: stretch; }
                    .hf-command-left,
                    .hf-command-right { width: 100%; justify-content: space-between; }

                    .hf-mobile-switcher { display: flex; }

                    .hf-body {
                        grid-template-columns: 1fr;
                        position: relative;
                        overflow: hidden;
                    }

                    .hf-gutter { display: none; }

                    .hf-panel {
                        grid-column: 1;
                        grid-row: 1;
                        position: absolute;
                        inset: 0;
                    }

                    .hf-panel.mobile-visible {
                        z-index: 1;
                        visibility: visible;
                    }

                    .hf-panel.mobile-hidden {
                        z-index: 0;
                        visibility: hidden;
                        pointer-events: none;
                    }

                    .hf-mobile-cta { display: block; }
                    .hf-stats-bar { flex-wrap: wrap; }
                    .hf-download-btn { display: none; }
                    .hf-mobile-actions { display: flex; }

                    .hf-footer { flex-direction: column; text-align: center; }

                    /* Preview host on mobile must fill available space */
                    .hf-preview-host {
                        position: relative;
                        flex: 1;
                        min-height: 0;
                        overflow: hidden;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .hf-chrome-btn,
                    .hf-pill,
                    .hf-tab,
                    .hf-sample-btn,
                    .hf-export-chip,
                    .hf-switcher-tab,
                    .hf-panel-btn,
                    .hf-copy-btn,
                    .hf-view-result-btn,
                    .hf-empty-sample-btn,
                    .hf-go-input-btn,
                    .hf-download-btn,
                    .hf-mobile-action-btn,
                    .hf-tab-empty-btn,
                    .hf-action-btn,
                    .hf-history-item { transition: none; }
                }
            `}</style>
        </>
    );
}