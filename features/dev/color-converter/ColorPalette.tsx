// features/dev/color-converter/ColorPalette.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import {
    generateComplementary,
    generateTriadic,
    generateTetradic,
    generateAnalogous,
    generateMonochromatic,
} from "./utils";

interface ColorPaletteProps {
    baseColor: string;
    onColorSelect: (color: string) => void;
}

type PaletteType = "complementary" | "triadic" | "tetradic" | "analogous" | "monochromatic";

const PALETTE_TYPES: Array<{
    id: PaletteType;
    label: string;
    description: string;
    icon: string;
}> = [
        {
            id: "complementary",
            label: "Complementary",
            description: "Colors opposite on the color wheel",
            icon: "ti-arrows-split-2",
        },
        {
            id: "triadic",
            label: "Triadic",
            description: "Three colors evenly spaced",
            icon: "ti-triangle",
        },
        {
            id: "tetradic",
            label: "Tetradic",
            description: "Four colors in two complementary pairs",
            icon: "ti-box",
        },
        {
            id: "analogous",
            label: "Analogous",
            description: "Colors adjacent on the color wheel",
            icon: "ti-arrows-horizontal",
        },
        {
            id: "monochromatic",
            label: "Monochromatic",
            description: "Variations of a single hue",
            icon: "ti-palette",
        },
    ];

export default function ColorPalette({ baseColor, onColorSelect }: ColorPaletteProps) {
    const [selectedType, setSelectedType] = useState<PaletteType>("complementary");
    const [copiedColor, setCopiedColor] = useState("");

    const palette = useMemo(() => {
        switch (selectedType) {
            case "complementary":
                return generateComplementary(baseColor);
            case "triadic":
                return generateTriadic(baseColor);
            case "tetradic":
                return generateTetradic(baseColor);
            case "analogous":
                return generateAnalogous(baseColor);
            case "monochromatic":
                return generateMonochromatic(baseColor);
            default:
                return [baseColor];
        }
    }, [baseColor, selectedType]);

    const handleCopyColor = useCallback(async (color: string) => {
        await navigator.clipboard.writeText(color.toUpperCase());
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(""), 1500);
    }, []);

    const selectedInfo = PALETTE_TYPES.find((t) => t.id === selectedType);

    return (
        <>
            <div className="cpal-root">
                {/* ── Palette Type Selector ── */}
                <div className="cpal-selector">
                    <div className="cpal-selector-header">
                        <div className="cpal-selector-label">
                            <i className="ti ti-color-swatch" />
                            Color Scheme
                        </div>
                        {selectedInfo && (
                            <span className="cpal-selector-desc">{selectedInfo.description}</span>
                        )}
                    </div>
                    <div className="cpal-types">
                        {PALETTE_TYPES.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                className={`cpal-type-btn${selectedType === type.id ? " active" : ""}`}
                                onClick={() => setSelectedType(type.id)}
                            >
                                <i className={`ti ${type.icon}`} />
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Palette Display ── */}
                <div className="cpal-display">
                    <div className="cpal-colors">
                        {palette.map((color, idx) => (
                            <div key={idx} className="cpal-color-card">
                                <div
                                    className="cpal-color-swatch"
                                    style={{ background: color }}
                                    onClick={() => onColorSelect(color)}
                                    role="button"
                                    tabIndex={0}
                                    title="Click to select this color"
                                >
                                    {idx === 0 && (
                                        <div className="cpal-base-badge">
                                            <i className="ti ti-star-filled" />
                                            Base
                                        </div>
                                    )}
                                </div>
                                <div className="cpal-color-info">
                                    <code className="cpal-color-hex">{color.toUpperCase()}</code>
                                    <div className="cpal-color-actions">
                                        <button
                                            type="button"
                                            className={`cpal-action-btn${copiedColor === color ? " copied" : ""
                                                }`}
                                            onClick={() => handleCopyColor(color)}
                                            title="Copy HEX"
                                        >
                                            <i
                                                className={`ti ${copiedColor === color ? "ti-check" : "ti-copy"
                                                    }`}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="cpal-action-btn"
                                            onClick={() => onColorSelect(color)}
                                            title="Use this color"
                                        >
                                            <i className="ti ti-arrow-right" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Export Options ── */}
                <div className="cpal-export">
                    <div className="cpal-export-header">
                        <i className="ti ti-download" />
                        Export Palette
                    </div>
                    <div className="cpal-export-actions">
                        <button
                            type="button"
                            className="cpal-export-btn"
                            onClick={() => {
                                const css = palette
                                    .map((c, i) => `--color-${i + 1}: ${c};`)
                                    .join("\n");
                                navigator.clipboard.writeText(`:root {\n  ${css}\n}`);
                            }}
                        >
                            <i className="ti ti-file-code" />
                            CSS Variables
                        </button>
                        <button
                            type="button"
                            className="cpal-export-btn"
                            onClick={() => {
                                const json = JSON.stringify(
                                    palette.reduce(
                                        (acc, c, i) => ({ ...acc, [`color${i + 1}`]: c }),
                                        {}
                                    ),
                                    null,
                                    2
                                );
                                navigator.clipboard.writeText(json);
                            }}
                        >
                            <i className="ti ti-braces" />
                            JSON
                        </button>
                        <button
                            type="button"
                            className="cpal-export-btn"
                            onClick={() => {
                                const scss = palette
                                    .map((c, i) => `$color-${i + 1}: ${c};`)
                                    .join("\n");
                                navigator.clipboard.writeText(scss);
                            }}
                        >
                            <i className="ti ti-brand-sass" />
                            SCSS
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .cpal-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /* ── Selector ── */
                .cpal-selector {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .cpal-selector-header {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .cpal-selector-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cpal-selector-label i {
                    font-size: 12px;
                }

                .cpal-selector-desc {
                    font-size: 12px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .cpal-types {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 8px;
                }

                .cpal-type-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px 14px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cpal-type-btn i {
                    font-size: 20px;
                }

                .cpal-type-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                    border-color: var(--brand-border);
                }

                .cpal-type-btn.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* ── Display ── */
                .cpal-display {
                    flex: 1;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    padding: 16px;
                }

                .cpal-colors {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                }

                .cpal-color-card {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .cpal-color-swatch {
                    height: 120px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    cursor: pointer;
                    transition: all 0.12s;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .cpal-color-swatch:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .cpal-base-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border-radius: 99px;
                    background: rgba(255, 255, 255, 0.9);
                    color: var(--brand);
                    font-size: 10px;
                    font-weight: 700;
                    backdrop-filter: blur(4px);
                }

                .cpal-base-badge i {
                    font-size: 10px;
                }

                .cpal-color-info {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .cpal-color-hex {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-align: center;
                }

                .cpal-color-actions {
                    display: flex;
                    gap: 4px;
                }

                .cpal-action-btn {
                    flex: 1;
                    height: 32px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cpal-action-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cpal-action-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* ── Export ── */
                .cpal-export {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .cpal-export-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cpal-export-header i {
                    font-size: 12px;
                }

                .cpal-export-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .cpal-export-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 36px;
                    padding: 0 14px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cpal-export-btn i {
                    font-size: 14px;
                }

                .cpal-export-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .cpal-root {
                        padding: 12px;
                    }

                    .cpal-types {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .cpal-colors {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 480px) {
                    .cpal-colors {
                        grid-template-columns: 1fr;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cpal-type-btn,
                    .cpal-color-swatch,
                    .cpal-action-btn,
                    .cpal-export-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}