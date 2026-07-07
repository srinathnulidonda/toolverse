// features/dev/css-minifier/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import CSSPreview from "./CSSPreview";
import CSSBatch from "./CSSBatch";
import CSSHistory from "./CSSHistory";
import { useCSSStore } from "./cssStore";

type ViewTab = "single" | "batch" | "history";

export default function CSSMinifierWorkspace({ tool }: { tool: Tool }) {
    const [viewTab, setViewTab] = useState<ViewTab>("single");
    const { history, addToHistory, clearHistory } = useCSSStore();

    const VIEW_TABS = [
        { id: "single" as const, label: "Single", icon: "ti-file-code" },
        { id: "batch" as const, label: "Batch", icon: "ti-files" },
        { id: "history" as const, label: "History", icon: "ti-history" },
    ];

    return (
        <>
            <div className="cm-root">
                {/*  Top Chrome  */}
                <div className="cm-chrome">
                    <div className="cm-chrome-left">
                        <div className="cm-title">
                            <i className="ti ti-brand-css3" />
                            CSS Minifier
                        </div>
                    </div>
                </div>

                {/*  View Tabs  */}
                <div className="cm-tabs-bar">
                    <nav className="cm-tabs" role="tablist">
                        {VIEW_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                className={`cm-tab${viewTab === tab.id ? " active" : ""}`}
                                onClick={() => setViewTab(tab.id)}
                                aria-selected={viewTab === tab.id}
                            >
                                <i className={`ti ${tab.icon}`} />
                                {tab.label}
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="cm-badge">{history.length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/*  Tab Content  */}
                <div className="cm-tab-content">
                    {viewTab === "single" && (
                        <CSSPreview onProcess={addToHistory} />
                    )}

                    {viewTab === "batch" && (
                        <CSSBatch onComplete={() => {}} />
                    )}

                    {viewTab === "history" && (
                        <CSSHistory
                            history={history}
                            onClear={clearHistory}
                            onRestore={(entry) => {
                                setViewTab("single");
                            }}
                        />
                    )}
                </div>

                {/*  Footer  */}
                <div className="cm-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .cm-root {
                    --cm-radius-sm: 6px;
                    --cm-radius-md: 8px;
                    --cm-radius-lg: 12px;
                    --cm-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cm-radius-xl);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 600px;
                }

                /*  Chrome  */
                .cm-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .cm-chrome-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .cm-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .cm-title i {
                    font-size: 16px;
                    color: var(--brand);
                }

                /*  Tabs  */
                .cm-tabs-bar {
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .cm-tabs {
                    display: flex;
                    padding: 0 16px;
                }

                .cm-tab {
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

                .cm-tab i {
                    font-size: 14px;
                }

                .cm-tab:hover {
                    color: var(--text);
                }

                .cm-tab.active {
                    color: var(--text);
                }

                .cm-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 12px;
                    right: 12px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .cm-badge {
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

                /*  Tab Content  */
                .cm-tab-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Footer  */
                .cm-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 10px 16px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .cm-footer i {
                    font-size: 13px;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .cm-chrome {
                        padding: 10px 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cm-tab {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}