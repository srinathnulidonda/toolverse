// features/dev/regex-tester/Workspace.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { Tool } from "@/lib/tools";
import { FLAG_DEFINITIONS, SAMPLE_PATTERNS, type RegexFlags, type ViewTab, type RegexPattern } from "./utils";
import { useRegexStore } from "./regexStore";
import RegexTest from "./RegexTest";
import RegexReplace from "./RegexReplace";
import RegexLibrary from "./RegexLibrary";
import RegexExplainer from "./RegexExplainer";
import RegexHistory from "./RegexHistory";

export default function RegexTesterWorkspace({ tool }: { tool: Tool }) {
    const [viewTab, setViewTab] = useState<ViewTab>("test");
    const [pattern, setPattern] = useState("");
    const [flags, setFlags] = useState<RegexFlags>({
        g: true,
        i: false,
        m: false,
        s: false,
        u: false,
        y: false,
    });

    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveForm, setSaveForm] = useState({
        name: "",
        description: "",
        category: "custom" as const,
        tags: "",
    });

    // Add state for pending test string
    const [pendingTestString, setPendingTestString] = useState<string | null>(null);

    const {
        patterns,
        history,
        savePattern,
        updatePattern,
        deletePattern,
        toggleFavorite,
        addToHistory,
        clearHistory,
        deleteHistoryEntry,
        importPatterns,
        exportPatterns,
    } = useRegexStore();

    const VIEW_TABS = [
        { id: "test" as const, label: "Test", icon: "ti-play" },
        { id: "replace" as const, label: "Replace", icon: "ti-replace" },
        { id: "library" as const, label: "Library", icon: "ti-bookmark" },
        { id: "explainer" as const, label: "Explainer", icon: "ti-bulb" },
        { id: "history" as const, label: "History", icon: "ti-history" },
    ];

    const toggleFlag = useCallback((flag: keyof RegexFlags) => {
        setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
    }, []);

    const handleLoadPattern = useCallback((loadedPattern: RegexPattern) => {
        setPattern(loadedPattern.pattern);
        setFlags(loadedPattern.flags);
        setViewTab("test");
    }, []);

    // Add handleLoadExample callback
    const handleLoadExample = useCallback(
        (examplePattern: string, testString: string, exampleFlags?: Partial<RegexFlags>) => {
            setPattern(examplePattern);
            if (exampleFlags) {
                setFlags((prev) => ({
                    g: exampleFlags.g ?? false,
                    i: exampleFlags.i ?? false,
                    m: exampleFlags.m ?? false,
                    s: exampleFlags.s ?? false,
                    u: exampleFlags.u ?? false,
                    y: exampleFlags.y ?? false,
                }));
            }
            setViewTab("test");
            // Store test string temporarily so RegexTest can pick it up
            setPendingTestString(testString);
        },
        []
    );

    const handleSavePattern = useCallback(() => {
        if (!pattern) return;

        const newPattern = savePattern({
            name: saveForm.name || `Pattern ${Date.now()}`,
            pattern,
            flags,
            description: saveForm.description || "Custom regex pattern",
            category: saveForm.category,
            tags: saveForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        });

        setShowSaveDialog(false);
        setSaveForm({ name: "", description: "", category: "custom", tags: "" });
    }, [pattern, flags, saveForm, savePattern]);

    const handleRestoreHistory = useCallback((entry: typeof history[0]) => {
        setPattern(entry.pattern);
        setFlags(entry.flags);
        setViewTab("test");
    }, []);

    const handleAddToHistory = useCallback((testString: string, matchCount: number) => {
        if (!pattern || !testString) return;
        addToHistory({
            pattern,
            flags,
            testString,
            matchCount,
        });
    }, [pattern, flags, addToHistory]);
    

    const quickActions = useMemo(() => {
        return SAMPLE_PATTERNS.slice(0, 4);
    }, []);

    return (
        <>
            <div className="rxt-workspace">
                {/* Top Command Bar */}
                <div className="rxt-command-bar">
                    <div className="rxt-cmd-left">
                        <div className="rxt-quick-actions">
                            <span className="rxt-quick-label">Quick:</span>
                            {quickActions.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    className="rxt-quick-btn"
                                    onClick={() => handleLoadPattern(preset)}
                                    title={preset.description}
                                >
                                    <i className={`ti ${
                                        preset.id === "email" ? "ti-mail" :
                                        preset.id === "url" ? "ti-link" :
                                        preset.id === "phone-us" ? "ti-phone" :
                                        "ti-palette"
                                    }`} />
                                    <span>{preset.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rxt-cmd-right">
                        {pattern && (
                            <span className="rxt-pattern-indicator">
                                <code>/{pattern.substring(0, 30)}{pattern.length > 30 ? "..." : ""}/</code>
                            </span>
                        )}
                    </div>
                </div>

                {/* Flags Bar */}
                <div className="rxt-flags-bar">
                    <div className="rxt-flags-label">
                        <i className="ti ti-flag" />
                        Flags
                    </div>
                    <div className="rxt-flags-list">
                        {FLAG_DEFINITIONS.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                className={`rxt-flag-toggle${flags[f.id] ? " active" : ""}`}
                                onClick={() => toggleFlag(f.id)}
                                title={f.desc}
                            >
                                <i className={`ti ${f.icon}`} />
                                <span className="rxt-flag-id">{f.id}</span>
                                <span className="rxt-flag-name">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Tabs */}
                <div className="rxt-tabs-bar">
                    <nav className="rxt-tabs" role="tablist">
                        {VIEW_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                className={`rxt-tab${viewTab === tab.id ? " active" : ""}`}
                                onClick={() => setViewTab(tab.id)}
                                aria-selected={viewTab === tab.id}
                            >
                                <i className={`ti ${tab.icon}`} />
                                {tab.label}
                                {tab.id === "library" && patterns.length > 0 && (
                                    <span className="rxt-tab-badge">{patterns.length}</span>
                                )}
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="rxt-tab-badge">{history.length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="rxt-tab-content">
                    {viewTab === "test" && (
                        <RegexTest
                            pattern={pattern}
                            flags={flags}
                            onPatternChange={setPattern}
                            onFlagsChange={setFlags}
                            onSave={() => setShowSaveDialog(true)}
                            initialTestString={pendingTestString}
                            onTestStringConsumed={() => setPendingTestString(null)}
                        />
                    )}

                    {viewTab === "replace" && (
                        <RegexReplace pattern={pattern} flags={flags} />
                    )}

                    {viewTab === "library" && (
                        <RegexLibrary
                            patterns={patterns}
                            onLoadPattern={handleLoadPattern}
                            onDeletePattern={deletePattern}
                            onToggleFavorite={toggleFavorite}
                            onImport={importPatterns}
                            onExport={exportPatterns}
                        />
                    )}

                    {viewTab === "explainer" && (
                        <RegexExplainer 
                            pattern={pattern} 
                            flags={flags} 
                            onLoadExample={handleLoadExample}
                        />
                    )}

                    {viewTab === "history" && (
                        <RegexHistory
                            history={history}
                            onRestore={handleRestoreHistory}
                            onClear={clearHistory}
                            onDelete={deleteHistoryEntry}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="rxt-footer">
                    <div className="rxt-footer-left">
                        <i className="ti ti-shield-lock" />
                        <span>Everything runs in your browser — no data ever leaves this page.</span>
                    </div>
                    {pattern && (
                        <div className="rxt-footer-right">
                            <span className="rxt-footer-info">
                                Pattern length: <strong>{pattern.length}</strong>
                            </span>
                        </div>
                    )}
                </div>

                {/* Save Pattern Dialog */}
                {showSaveDialog && (
                    <div className="rxt-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
                        <div className="rxt-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="rxt-dialog-header">
                                <h3 className="rxt-dialog-title">
                                    <i className="ti ti-bookmark-plus" />
                                    Save Pattern to Library
                                </h3>
                                <button
                                    type="button"
                                    className="rxt-dialog-close"
                                    onClick={() => setShowSaveDialog(false)}
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>

                            <div className="rxt-dialog-body">
                                <div className="rxt-form-group">
                                    <label className="rxt-form-label" htmlFor="pattern-name">
                                        Name
                                    </label>
                                    <input
                                        id="pattern-name"
                                        type="text"
                                        className="rxt-form-input"
                                        value={saveForm.name}
                                        onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Email Validator"
                                        autoFocus
                                    />
                                </div>

                                <div className="rxt-form-group">
                                    <label className="rxt-form-label" htmlFor="pattern-desc">
                                        Description
                                    </label>
                                    <textarea
                                        id="pattern-desc"
                                        className="rxt-form-textarea"
                                        value={saveForm.description}
                                        onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe what this pattern does..."
                                        rows={3}
                                    />
                                </div>

                                <div className="rxt-form-group">
                                    <label className="rxt-form-label" htmlFor="pattern-category">
                                        Category
                                    </label>
                                    <select
                                        id="pattern-category"
                                        className="rxt-form-select"
                                        value={saveForm.category}
                                        onChange={(e) => setSaveForm(prev => ({ ...prev, category: e.target.value as any }))}
                                    >
                                        <option value="validation">Validation</option>
                                        <option value="extraction">Extraction</option>
                                        <option value="web">Web</option>
                                        <option value="datetime">Date & Time</option>
                                        <option value="formatting">Formatting</option>
                                        <option value="security">Security</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>

                                <div className="rxt-form-group">
                                    <label className="rxt-form-label" htmlFor="pattern-tags">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        id="pattern-tags"
                                        type="text"
                                        className="rxt-form-input"
                                        value={saveForm.tags}
                                        onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                                        placeholder="e.g., email, validation, contact"
                                    />
                                </div>

                                <div className="rxt-pattern-preview">
                                    <div className="rxt-preview-label">Pattern Preview</div>
                                    <code className="rxt-preview-code">
                                        /{pattern}/
                                        {Object.entries(flags)
                                            .filter(([, v]) => v)
                                            .map(([k]) => k)
                                            .join("")}
                                    </code>
                                </div>
                            </div>

                            <div className="rxt-dialog-footer">
                                <button
                                    type="button"
                                    className="rxt-dialog-btn rxt-cancel-btn"
                                    onClick={() => setShowSaveDialog(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="rxt-dialog-btn rxt-save-btn"
                                    onClick={handleSavePattern}
                                    disabled={!saveForm.name.trim()}
                                >
                                    <i className="ti ti-check" />
                                    Save Pattern
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .rxt-workspace {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 680px;
                }

                /* Command Bar */
                .rxt-command-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .rxt-cmd-left,
                .rxt-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .rxt-quick-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .rxt-quick-label {
                    font-size: 10.5px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .rxt-quick-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 11px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxt-quick-btn i {
                    font-size: 14px;
                }

                .rxt-quick-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .rxt-pattern-indicator {
                    display: flex;
                    align-items: center;
                    height: 30px;
                    padding: 0 12px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                }

                .rxt-pattern-indicator code {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--brand);
                    font-weight: 600;
                    background: none;
                    border: none;
                    padding: 0;
                }

                /* Flags Bar */
                .rxt-flags-bar {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    overflow-x: auto;
                }

                .rxt-flags-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                    flex-shrink: 0;
                }

                .rxt-flags-label i {
                    font-size: 13px;
                }

                .rxt-flags-list {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .rxt-flag-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 11px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .rxt-flag-toggle i {
                    font-size: 13px;
                }

                .rxt-flag-toggle:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxt-flag-toggle.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .rxt-flag-id {
                    font-family: var(--font-mono);
                    font-weight: 700;
                    font-size: 11px;
                }

                .rxt-flag-name {
                    font-weight: 500;
                }

                /* Tabs Bar */
                .rxt-tabs-bar {
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .rxt-tabs {
                    display: flex;
                    padding: 0 16px;
                    overflow-x: auto;
                }

                .rxt-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 42px;
                    padding: 0 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.12s;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .rxt-tab i {
                    font-size: 14px;
                }

                .rxt-tab:hover {
                    color: var(--text);
                }

                .rxt-tab.active {
                    color: var(--text);
                }

                .rxt-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 12px;
                    right: 12px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .rxt-tab-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 700;
                    border: 0.5px solid var(--brand-border);
                }

                /* Tab Content */
                .rxt-tab-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /* Footer */
                .rxt-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 10px 16px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .rxt-footer-left {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .rxt-footer-left i {
                    font-size: 13px;
                }

                .rxt-footer-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .rxt-footer-info {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .rxt-footer-info strong {
                    color: var(--text);
                    font-weight: 700;
                }

                /* Save Dialog */
                .rxt-dialog-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    backdrop-filter: blur(4px);
                }

                .rxt-dialog {
                    width: 100%;
                    max-width: 560px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-xl);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                                0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    overflow: hidden;
                }

                .rxt-dialog-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 20px 22px;
                    border-bottom: 0.5px solid var(--border);
                }

                .rxt-dialog-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                }

                .rxt-dialog-title i {
                    font-size: 22px;
                    color: var(--brand);
                }

                .rxt-dialog-close {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxt-dialog-close:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxt-dialog-close i {
                    font-size: 20px;
                }

                .rxt-dialog-body {
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    max-height: 60vh;
                    overflow-y: auto;
                }

                .rxt-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .rxt-form-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .rxt-form-input,
                .rxt-form-textarea,
                .rxt-form-select {
                    width: 100%;
                    padding: 11px 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    font-size: 14px;
                    color: var(--text);
                    font-family: var(--font-sans);
                    transition: border-color 0.12s;
                }

                .rxt-form-input:focus,
                .rxt-form-textarea:focus,
                .rxt-form-select:focus {
                    outline: none;
                    border-color: var(--brand);
                    box-shadow: 0 0 0 3px var(--brand-light);
                }

                .rxt-form-input::placeholder,
                .rxt-form-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .rxt-form-textarea {
                    resize: vertical;
                    font-family: var(--font-sans);
                    line-height: 1.6;
                }

                .rxt-form-select {
                    cursor: pointer;
                }

                .rxt-pattern-preview {
                    padding: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .rxt-preview-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .rxt-preview-code {
                    font-family: var(--font-mono);
                    font-size: 14px;
                    color: var(--brand);
                    font-weight: 700;
                    background: var(--brand-light);
                    padding: 10px 12px;
                    border-radius: 6px;
                    border: 0.5px solid var(--brand-border);
                    word-break: break-all;
                }

                .rxt-dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 18px 22px;
                    border-top: 0.5px solid var(--border);
                }

                .rxt-dialog-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    height: 40px;
                    padding: 0 20px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxt-dialog-btn i {
                    font-size: 16px;
                }

                .rxt-cancel-btn {
                    border-color: var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                }

                .rxt-cancel-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxt-save-btn {
                    border-color: var(--brand-border);
                    background: var(--brand);
                    color: white;
                }

                .rxt-save-btn:hover:not(:disabled) {
                    background: var(--brand-hover);
                }

                .rxt-save-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .rxt-command-bar {
                        padding: 10px 12px;
                    }

                    .rxt-quick-label {
                        display: none;
                    }

                    .rxt-quick-btn span {
                        display: none;
                    }

                    .rxt-quick-btn {
                        min-width: 36px;
                        justify-content: center;
                        padding: 0 8px;
                    }

                    .rxt-flags-bar {
                        padding: 10px 12px;
                    }

                    .rxt-flag-name {
                        display: none;
                    }

                    .rxt-tabs {
                        padding: 0 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .rxt-quick-btn,
                    .rxt-flag-toggle,
                    .rxt-tab,
                    .rxt-dialog-close,
                    .rxt-dialog-btn,
                    .rxt-form-input,
                    .rxt-form-textarea,
                    .rxt-form-select {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}