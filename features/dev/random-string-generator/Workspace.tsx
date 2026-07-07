// features/dev/random-string-generator/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import type { GeneratorOptions, GeneratedString, PresetType } from "./utils";
import { DEFAULT_OPTIONS, PRESETS } from "./utils";
import { useStringStore } from "./stringStore";
import GeneratorPanel from "./GeneratorPanel";
import BatchGenerator from "./BatchGenerator";
import PatternGenerator from "./PatternGenerator";
import HistoryView from "./HistoryView";

type ViewTab = "single" | "batch" | "pattern" | "history";

const VIEW_TABS = [
    { id: "single" as const, label: "Single", icon: "ti-file" },
    { id: "batch" as const, label: "Batch", icon: "ti-files" },
    { id: "pattern" as const, label: "Pattern", icon: "ti-template" },
    { id: "history" as const, label: "History", icon: "ti-history" },
];

export default function RandomStringGeneratorWorkspace({ tool }: { tool: Tool }) {
    const [viewTab, setViewTab] = useState<ViewTab>("single");
    const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
    
    const {
        history,
        favorites,
        addToHistory,
        clearHistory,
        removeFromHistory,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
        isFavorite,
    } = useStringStore();

    const handleGenerate = useCallback((result: GeneratedString) => {
        addToHistory(result);
    }, [addToHistory]);

    const handleBatchGenerate = useCallback((results: GeneratedString[]) => {
        results.forEach(result => addToHistory(result));
    }, [addToHistory]);

    const handlePatternGenerate = useCallback((value: string) => {
        const entry: GeneratedString = {
            id: Date.now().toString(),
            value,
            timestamp: Date.now(),
            options: { ...options },
            entropy: 0,
            strength: "good",
        };
        addToHistory(entry);
    }, [options, addToHistory]);

    const handleRestore = useCallback((entry: GeneratedString) => {
        setOptions(entry.options);
        setViewTab("single");
    }, []);

    const handleToggleFavorite = useCallback((value: string) => {
        if (isFavorite(value)) {
            removeFromFavorites(value);
        } else {
            addToFavorites(value);
        }
    }, [isFavorite, addToFavorites, removeFromFavorites]);

    const loadPreset = useCallback((presetKey: PresetType) => {
        const preset = PRESETS[presetKey];
        if (preset && preset.options) {
            setOptions(prev => ({ ...prev, ...preset.options }));
        }
    }, []);

    return (
        <>
            <div className="rsg-root">
                {/*  Top Chrome  */}
                <div className="rsg-chrome">
                    <div className="rsg-chrome-left">
                        <span className="rsg-preset-label">Presets:</span>
                        {Object.entries(PRESETS).slice(0, 4).map(([key, preset]) => (
                            <button
                                key={key}
                                type="button"
                                className="rsg-preset-btn"
                                onClick={() => loadPreset(key as PresetType)}
                                title={preset.label}
                            >
                                <i className={`ti ${preset.icon}`} />
                                <span className="rsg-preset-text">{preset.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="rsg-chrome-right">
                        {history.length > 0 && (
                            <div className="rsg-history-badge">
                                <i className="ti ti-history" />
                                {history.length}
                            </div>
                        )}
                    </div>
                </div>

                {/*  View Tabs  */}
                <div className="rsg-tabs-bar">
                    <nav className="rsg-tabs" role="tablist" aria-label="View selector">
                        {VIEW_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={viewTab === tab.id}
                                aria-controls={`rsg-panel-${tab.id}`}
                                className={`rsg-tab${viewTab === tab.id ? " active" : ""}`}
                                onClick={() => setViewTab(tab.id)}
                            >
                                <i className={`ti ${tab.icon}`} />
                                <span>{tab.label}</span>
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="rsg-tab-badge">{history.length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/*  Tab Content  */}
                <div className="rsg-tab-content">
                    {viewTab === "single" && (
                        <div id="rsg-panel-single" role="tabpanel" className="rsg-panel">
                            <GeneratorPanel 
                                options={options}
                                onOptionsChange={setOptions}
                                onGenerate={handleGenerate} 
                            />
                        </div>
                    )}

                    {viewTab === "batch" && (
                        <div id="rsg-panel-batch" role="tabpanel" className="rsg-panel">
                            <BatchGenerator options={options} onGenerate={handleBatchGenerate} />
                        </div>
                    )}

                    {viewTab === "pattern" && (
                        <div id="rsg-panel-pattern" role="tabpanel" className="rsg-panel">
                            <PatternGenerator onGenerate={handlePatternGenerate} />
                        </div>
                    )}

                    {viewTab === "history" && (
                        <div id="rsg-panel-history" role="tabpanel" className="rsg-panel">
                            <HistoryView
                                history={history}
                                favorites={favorites}
                                onClear={clearHistory}
                                onRemove={removeFromHistory}
                                onRestore={handleRestore}
                                onToggleFavorite={handleToggleFavorite}
                                onClearFavorites={clearFavorites}
                            />
                        </div>
                    )}
                </div>

                {/*  Footer  */}
                <div className="rsg-footer">
                    <i className="ti ti-shield-lock" />
                    <span>
                        Generated using cryptographically secure random values (crypto.getRandomValues). 
                        All processing happens in your browser — nothing is ever sent to a server.
                    </span>
                </div>
            </div>

            <style jsx>{`
                .rsg-root {
                    --rsg-radius-sm: 6px;
                    --rsg-radius-md: 8px;
                    --rsg-radius-lg: 12px;
                    --rsg-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rsg-radius-xl);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 650px;
                }

                /*  Top Chrome  */
                .rsg-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .rsg-chrome-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .rsg-preset-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .rsg-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 11px;
                    border-radius: var(--rsg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rsg-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .rsg-preset-btn i {
                    font-size: 13px;
                }

                .rsg-preset-text {
                    white-space: nowrap;
                }

                .rsg-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .rsg-history-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 11px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                }

                .rsg-history-badge i {
                    font-size: 12px;
                }

                /*  Tabs Bar  */
                .rsg-tabs-bar {
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .rsg-tabs {
                    display: flex;
                    padding: 0 14px;
                }

                .rsg-tab {
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
                }

                .rsg-tab i {
                    font-size: 14px;
                }

                .rsg-tab:hover {
                    color: var(--text);
                }

                .rsg-tab.active {
                    color: var(--text);
                }

                .rsg-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 12px;
                    right: 12px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .rsg-tab-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    border-radius: 99px;
                    background: var(--brand);
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                }

                /*  Tab Content  */
                .rsg-tab-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                .rsg-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Footer  */
                .rsg-footer {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                    line-height: 1.5;
                }

                .rsg-footer i {
                    font-size: 14px;
                    flex-shrink: 0;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .rsg-chrome {
                        padding: 8px 10px;
                    }

                    .rsg-preset-label {
                        display: none;
                    }

                    .rsg-preset-text {
                        display: none;
                    }

                    .rsg-preset-btn {
                        padding: 0 10px;
                        min-width: 36px;
                        justify-content: center;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .rsg-preset-btn,
                    .rsg-tab {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}