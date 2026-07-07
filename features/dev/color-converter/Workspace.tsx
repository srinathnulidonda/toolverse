// features/dev/color-converter/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import ColorPreview from "./ColorPreview";
import ColorPalette from "./ColorPalette";
import ColorHistory from "./ColorHistory";
import ColorShades from "./ColorShades";
import { useColorStore } from "./colorStore";

type ViewTab = "convert" | "palette" | "shades" | "history";

const PRESET_COLORS = [
    { id: "brand", name: "Brand Blue", hex: "#3B82F6" },
    { id: "success", name: "Success", hex: "#10B981" },
    { id: "warning", name: "Warning", hex: "#F59E0B" },
    { id: "error", name: "Error", hex: "#EF4444" },
    { id: "purple", name: "Purple", hex: "#8B5CF6" },
    { id: "pink", name: "Pink", hex: "#EC4899" },
    { id: "cyan", name: "Cyan", hex: "#06B6D4" },
    { id: "lime", name: "Lime", hex: "#84CC16" },
];

export default function ColorConverterWorkspace({ tool }: { tool: Tool }) {
    const [viewTab, setViewTab] = useState<ViewTab>("convert");
    const [currentColor, setCurrentColor] = useState("#3B82F6");
    const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex");

    const { history, addToHistory, clearHistory } = useColorStore();

    const handleColorChange = useCallback(
        (color: string, fromFormat: string) => {
            setCurrentColor(color);
            addToHistory({
                id: Date.now().toString(),
                color,
                format: fromFormat,
                timestamp: Date.now(),
            });
        },
        [addToHistory]
    );

    const loadPreset = useCallback((preset: typeof PRESET_COLORS[0]) => {
        setCurrentColor(preset.hex);
        setViewTab("convert");
    }, []);

    const VIEW_TABS = [
        { id: "convert" as const, label: "Convert", icon: "ti-palette" },
        { id: "palette" as const, label: "Palette", icon: "ti-color-swatch" },
        { id: "shades" as const, label: "Shades", icon: "ti-adjust" },
        { id: "history" as const, label: "History", icon: "ti-history" },
    ];

    return (
        <>
            <div className="cc-root">
                {/*  Top Chrome  */}
                <div className="cc-chrome">
                    <div className="cc-chrome-left">
                        <div className="cc-title">
                            <i className="ti ti-palette" />
                            Color Converter
                        </div>
                        <div
                            className="cc-current-color"
                            style={{ background: currentColor }}
                            title={currentColor}
                        />
                    </div>

                    <div className="cc-chrome-right">
                        <div className="cc-preset-group">
                            <span className="cc-preset-label">Presets:</span>
                            {PRESET_COLORS.slice(0, 4).map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    className="cc-preset-btn"
                                    onClick={() => loadPreset(preset)}
                                    title={preset.name}
                                    style={{ background: preset.hex }}
                                />
                            ))}
                        </div>
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

                {/*  Tab Content  */}
                <div className="cc-tab-content">
                    {viewTab === "convert" && (
                        <ColorPreview
                            color={currentColor}
                            onColorChange={handleColorChange}
                        />
                    )}

                    {viewTab === "palette" && (
                        <ColorPalette
                            baseColor={currentColor}
                            onColorSelect={setCurrentColor}
                        />
                    )}

                    {viewTab === "shades" && (
                        <ColorShades
                            baseColor={currentColor}
                            onColorSelect={setCurrentColor}
                        />
                    )}

                    {viewTab === "history" && (
                        <ColorHistory
                            history={history}
                            onClear={clearHistory}
                            onRestore={(entry) => {
                                setCurrentColor(entry.color);
                                setViewTab("convert");
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
                    gap: 12px;
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

                .cc-current-color {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: transform 0.12s;
                }

                .cc-current-color:hover {
                    transform: scale(1.08);
                }

                .cc-preset-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .cc-preset-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .cc-preset-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 0.5px solid var(--border);
                    cursor: pointer;
                    transition: all 0.12s;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .cc-preset-btn:hover {
                    transform: scale(1.12);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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
                @media (max-width: 768px) {
                    .cc-chrome {
                        padding: 10px 12px;
                    }

                    .cc-preset-label {
                        display: none;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cc-tab,
                    .cc-current-color,
                    .cc-preset-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}