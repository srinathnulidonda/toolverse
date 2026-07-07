// features/dev/case-converter/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import { type CaseType, CASE_FORMATS } from "./utils";
import CasePreview from "./CasePreview";
import CaseBatch from "./CaseBatch";
import CaseHistory from "./CaseHistory";
import CaseAnalyzer from "./CaseAnalyzer";
import { useCaseStore } from "./caseStore";

type ViewTab = "single" | "batch" | "analyze" | "history";

export default function CaseConverterWorkspace({ tool }: { tool: Tool }) {
    const [viewTab, setViewTab] = useState<ViewTab>("single");
    const [input, setInput] = useState("");
    const [selectedCases, setSelectedCases] = useState<CaseType[]>([
        "camel",
        "pascal",
        "snake",
        "kebab",
    ]);
    const [autoDetect, setAutoDetect] = useState(true);
    const [preserveNumbers, setPreserveNumbers] = useState(true);
    const [preserveAcronyms, setPreserveAcronyms] = useState(false);
    const [customDelimiter, setCustomDelimiter] = useState("");

    const { history, addToHistory, clearHistory } = useCaseStore();

    const handleConvert = useCallback(
        (text: string, caseType: CaseType, result: string) => {
            addToHistory({
                id: Date.now().toString(),
                input: text,
                fromCase: "auto",
                toCase: caseType,
                output: result,
                timestamp: Date.now(),
            });
        },
        [addToHistory]
    );

    const handleClear = useCallback(() => {
        setInput("");
    }, []);

    const VIEW_TABS = [
        { id: "single" as const, label: "Single", icon: "ti-letter-case" },
        { id: "batch" as const, label: "Batch", icon: "ti-files" },
        { id: "analyze" as const, label: "Analyze", icon: "ti-chart-dots" },
        { id: "history" as const, label: "History", icon: "ti-history" },
    ];

    return (
        <>
            <div className="cc-root">
                {/*  Top Chrome  */}
                <div className="cc-chrome">
                    <div className="cc-chrome-left">
                        <div className="cc-title">
                            <i className="ti ti-letter-case" />
                            Case Converter
                        </div>
                        {input && viewTab === "single" && (
                            <span className="cc-input-badge">
                                {input.length} chars
                            </span>
                        )}
                    </div>

                    <div className="cc-chrome-right">
                        <button
                            type="button"
                            className="cc-btn"
                            onClick={handleClear}
                            disabled={!input}
                        >
                            <i className="ti ti-trash" />
                            <span className="cc-label">Clear</span>
                        </button>
                    </div>
                </div>

                {/*  View Tabs  */}
                <div className="cc-tabs-bar">
                    <nav className="cc-tabs" role="tablist">
                        {VIEW_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                className={`cc-tab${viewTab === tab.id ? " active" : ""}`}
                                onClick={() => setViewTab(tab.id)}
                                aria-selected={viewTab === tab.id}
                            >
                                <i className={`ti ${tab.icon}`} />
                                {tab.label}
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="cc-badge">{history.length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/*  Options Bar (Single view only)  */}
                {viewTab === "single" && (
                    <div className="cc-options-bar">
                        <div className="cc-options-group">
                            <span className="cc-options-label">Quick Formats:</span>
                            {CASE_FORMATS.slice(0, 6).map((format) => (
                                <label key={format.id} className="cc-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedCases.includes(format.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCases([...selectedCases, format.id]);
                                            } else {
                                                setSelectedCases(
                                                    selectedCases.filter((c) => c !== format.id)
                                                );
                                            }
                                        }}
                                    />
                                    <span className="cc-checkbox-label">{format.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="cc-options-divider" />

                        <label className="cc-toggle">
                            <input
                                type="checkbox"
                                checked={preserveNumbers}
                                onChange={(e) => setPreserveNumbers(e.target.checked)}
                            />
                            <span className="cc-toggle-track">
                                <span className="cc-toggle-thumb" />
                            </span>
                            <span className="cc-toggle-label">Preserve numbers</span>
                        </label>

                        <label className="cc-toggle">
                            <input
                                type="checkbox"
                                checked={preserveAcronyms}
                                onChange={(e) => setPreserveAcronyms(e.target.checked)}
                            />
                            <span className="cc-toggle-track">
                                <span className="cc-toggle-thumb" />
                            </span>
                            <span className="cc-toggle-label">Preserve acronyms</span>
                        </label>
                    </div>
                )}

                {/*  Tab Content  */}
                <div className="cc-tab-content">
                    {viewTab === "single" && (
                        <CasePreview
                            input={input}
                            onInputChange={setInput}
                            selectedCases={selectedCases}
                            preserveNumbers={preserveNumbers}
                            preserveAcronyms={preserveAcronyms}
                            onConvert={handleConvert}
                        />
                    )}

                    {viewTab === "batch" && (
                        <CaseBatch
                            preserveNumbers={preserveNumbers}
                            preserveAcronyms={preserveAcronyms}
                            onComplete={(count) => {
                                // Could show a toast notification
                            }}
                        />
                    )}

                    {viewTab === "analyze" && (
                        <CaseAnalyzer input={input} onInputChange={setInput} />
                    )}

                    {viewTab === "history" && (
                        <CaseHistory
                            history={history}
                            onClear={clearHistory}
                            onRestore={(entry) => {
                                setInput(entry.input);
                                setViewTab("single");
                            }}
                        />
                    )}
                </div>

                {/*  Footer  */}
                <div className="cc-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .cc-root {
                    --cc-radius-sm: 6px;
                    --cc-radius-md: 8px;
                    --cc-radius-lg: 12px;
                    --cc-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-xl);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 600px;
                }

                /*  Chrome  */
                .cc-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    flex-wrap: wrap;
                }

                .cc-chrome-left,
                .cc-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .cc-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .cc-title i {
                    font-size: 16px;
                    color: var(--brand);
                }

                .cc-input-badge {
                    display: inline-flex;
                    align-items: center;
                    height: 22px;
                    padding: 0 8px;
                    border-radius: 99px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    color: var(--text-tertiary);
                    font-size: 11px;
                    font-weight: 500;
                }

                .cc-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 12px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cc-btn i {
                    font-size: 13px;
                }

                .cc-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .cc-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /*  Tabs  */
                .cc-tabs-bar {
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .cc-tabs {
                    display: flex;
                    padding: 0 16px;
                }

                .cc-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 40px;
                    padding: 0 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    font-size: 12.5px;
                    font-weight: 500;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.12s;
                }

                .cc-tab i {
                    font-size: 14px;
                }

                .cc-tab:hover {
                    color: var(--text);
                }

                .cc-tab.active {
                    color: var(--text);
                }

                .cc-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 12px;
                    right: 12px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .cc-badge {
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
                .cc-options-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 16px;
                    border-bottom: 0.5px solid var(--border-faint);
                    background: var(--bg-surface);
                    flex-wrap: wrap;
                }

                .cc-options-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .cc-options-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .cc-checkbox {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    user-select: none;
                }

                .cc-checkbox input {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 0.5px solid var(--border);
                    cursor: pointer;
                    accent-color: var(--brand);
                }

                .cc-checkbox-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .cc-options-divider {
                    width: 1px;
                    height: 20px;
                    background: var(--border);
                }

                .cc-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    cursor: pointer;
                    user-select: none;
                }

                .cc-toggle input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .cc-toggle-track {
                    width: 32px;
                    height: 18px;
                    background: var(--border);
                    border-radius: 99px;
                    position: relative;
                    transition: background 0.15s;
                    flex-shrink: 0;
                }

                .cc-toggle input:checked + .cc-toggle-track {
                    background: var(--brand);
                }

                .cc-toggle-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 14px;
                    height: 14px;
                    background: white;
                    border-radius: 50%;
                    transition: transform 0.15s;
                }

                .cc-toggle input:checked + .cc-toggle-track .cc-toggle-thumb {
                    transform: translateX(14px);
                }

                .cc-toggle-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                /*  Tab Content  */
                .cc-tab-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Footer  */
                .cc-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 10px 16px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .cc-footer i {
                    font-size: 13px;
                }

                /*  Responsive  */
                .cc-label {
                    display: inline;
                }

                @media (max-width: 768px) {
                    .cc-label {
                        display: none;
                    }

                    .cc-chrome {
                        padding: 10px 12px;
                    }

                    .cc-options-bar {
                        padding: 10px 12px;
                    }

                    .cc-options-group {
                        gap: 8px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cc-btn,
                    .cc-tab,
                    .cc-toggle-track,
                    .cc-toggle-thumb {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}