// features/dev/color-converter/ColorShades.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { generateShades, generateTints, generateTones, hexToRgb, rgbToHsl } from "./utils";

interface ColorShadesProps {
    baseColor: string;
    onColorSelect: (color: string) => void;
}

type ShadeType = "shades" | "tints" | "tones";

export default function ColorShades({ baseColor, onColorSelect }: ColorShadesProps) {
    const [selectedType, setSelectedType] = useState<ShadeType>("shades");
    const [count, setCount] = useState(10);
    const [copiedColor, setCopiedColor] = useState("");

    const colors = useMemo(() => {
        switch (selectedType) {
            case "shades":
                return generateShades(baseColor, count);
            case "tints":
                return generateTints(baseColor, count);
            case "tones":
                return generateTones(baseColor, count);
            default:
                return [baseColor];
        }
    }, [baseColor, selectedType, count]);

    const handleCopyColor = useCallback(async (color: string) => {
        await navigator.clipboard.writeText(color.toUpperCase());
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(""), 1500);
    }, []);

    const handleCopyAll = useCallback(async () => {
        const text = colors.map((c) => c.toUpperCase()).join("\n");
        await navigator.clipboard.writeText(text);
    }, [colors]);

    const TYPES = [
        {
            id: "shades" as const,
            label: "Shades",
            description: "Mix with black (lightness variation)",
            icon: "ti-moon",
        },
        {
            id: "tints" as const,
            label: "Tints",
            description: "Mix with white (lighter variations)",
            icon: "ti-sun",
        },
        {
            id: "tones" as const,
            label: "Tones",
            description: "Mix with gray (saturation variation)",
            icon: "ti-adjustments",
        },
    ];

    return (
        <>
            <div className="cs-root">
                {/* ── Controls ── */}
                <div className="cs-controls">
                    <div className="cs-type-selector">
                        {TYPES.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                className={`cs-type-btn${selectedType === type.id ? " active" : ""}`}
                                onClick={() => setSelectedType(type.id)}
                            >
                                <i className={`ti ${type.icon}`} />
                                <div className="cs-type-text">
                                    <span className="cs-type-label">{type.label}</span>
                                    <span className="cs-type-desc">{type.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="cs-count-control">
                        <label className="cs-count-label">
                            <i className="ti ti-adjustments-horizontal" />
                            Count: {count}
                        </label>
                        <input
                            type="range"
                            className="cs-range"
                            min="5"
                            max="15"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                        />
                        <div className="cs-range-marks">
                            <span>5</span>
                            <span>10</span>
                            <span>15</span>
                        </div>
                    </div>
                </div>

                {/* ── Color Grid ── */}
                <div className="cs-display">
                    <div className="cs-display-header">
                        <div className="cs-display-label">
                            <i className="ti ti-palette" />
                            {colors.length} Colors
                        </div>
                        <button type="button" className="cs-copy-all-btn" onClick={handleCopyAll}>
                            <i className="ti ti-copy" />
                            Copy All
                        </button>
                    </div>

                    <div className="cs-grid">
                        {colors.map((color, idx) => {
                            const rgb = hexToRgb(color);
                            const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
                            const isBase =
                                color.toUpperCase() === baseColor.toUpperCase() ||
                                (selectedType === "shades" && idx === Math.floor(count / 2));

                            return (
                                <div key={idx} className="cs-color-item">
                                    <div
                                        className="cs-color-swatch"
                                        style={{ background: color }}
                                        onClick={() => onColorSelect(color)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        {isBase && (
                                            <div className="cs-base-badge">
                                                <i className="ti ti-star-filled" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="cs-color-details">
                                        <code className="cs-color-hex">{color.toUpperCase()}</code>
                                        {hsl && (
                                            <div className="cs-color-hsl">
                                                {selectedType === "shades" && `L: ${hsl.l}%`}
                                                {selectedType === "tints" && `L: ${hsl.l}%`}
                                                {selectedType === "tones" && `S: ${hsl.s}%`}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className={`cs-copy-btn${copiedColor === color ? " copied" : ""
                                                }`}
                                            onClick={() => handleCopyColor(color)}
                                        >
                                            <i
                                                className={`ti ${copiedColor === color ? "ti-check" : "ti-copy"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── CSS Export ── */}
                <div className="cs-export">
                    <div className="cs-export-header">
                        <i className="ti ti-file-code" />
                        CSS Variables
                    </div>
                    <div className="cs-export-code">
                        <code>
                            {`:root {\n`}
                            {colors.map((c, i) => `  --shade-${i + 1}: ${c};\n`).join("")}
                            {`}`}
                        </code>
                    </div>
                    <button
                        type="button"
                        className="cs-export-copy-btn"
                        onClick={() => {
                            const css = `:root {\n${colors.map((c, i) => `  --shade-${i + 1}: ${c};`).join("\n")}\n}`;
                            navigator.clipboard.writeText(css);
                        }}
                    >
                        <i className="ti ti-copy" />
                        Copy CSS
                    </button>
                </div>
            </div>

            <style jsx>{`
                .cs-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /* ── Controls ── */
                .cs-controls {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .cs-type-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 10px;
                }

                .cs-type-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.12s;
                    text-align: left;
                }

                .cs-type-btn i {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .cs-type-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                    border-color: var(--brand-border);
                }

                .cs-type-btn.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .cs-type-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .cs-type-label {
                    font-size: 13px;
                    font-weight: 600;
                }

                .cs-type-desc {
                    font-size: 11px;
                    opacity: 0.8;
                    line-height: 1.4;
                }

                .cs-count-control {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-top: 10px;
                    border-top: 0.5px solid var(--border-faint);
                }

                .cs-count-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .cs-count-label i {
                    font-size: 14px;
                }

                .cs-range {
                    width: 100%;
                    height: 6px;
                    border-radius: 99px;
                    background: var(--border);
                    outline: none;
                    appearance: none;
                    cursor: pointer;
                }

                .cs-range::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--brand);
                    cursor: pointer;
                    transition: transform 0.12s;
                }

                .cs-range::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                }

                .cs-range::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--brand);
                    border: none;
                    cursor: pointer;
                    transition: transform 0.12s;
                }

                .cs-range::-moz-range-thumb:hover {
                    transform: scale(1.15);
                }

                .cs-range-marks {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: var(--text-disabled);
                    padding: 0 2px;
                }

                /* ── Display ── */
                .cs-display {
                    flex: 1;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    overflow: hidden;
                }

                .cs-display-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .cs-display-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cs-display-label i {
                    font-size: 12px;
                }

                .cs-copy-all-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cs-copy-all-btn i {
                    font-size: 12px;
                }

                .cs-copy-all-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .cs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 12px;
                    padding: 14px;
                }

                .cs-color-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .cs-color-swatch {
                    height: 80px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    cursor: pointer;
                    transition: all 0.12s;
                    position: relative;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .cs-color-swatch:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .cs-base-badge {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.95);
                    color: var(--brand);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    backdrop-filter: blur(4px);
                }

                .cs-color-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    align-items: center;
                }

                .cs-color-hex {
                    font-family: var(--font-mono);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text);
                }

                .cs-color-hsl {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .cs-copy-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cs-copy-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cs-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* ── Export ── */
                .cs-export {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-lg);
                    overflow: hidden;
                }

                .cs-export-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .cs-export-header i {
                    font-size: 12px;
                }

                .cs-export-code {
                    padding: 14px 16px;
                    background: var(--bg-surface);
                    overflow-x: auto;
                }

                .cs-export-code code {
                    font-family: var(--font-mono);
                    font-size: 11.5px;
                    line-height: 1.8;
                    color: var(--text);
                    white-space: pre;
                }

                .cs-export-copy-btn {
                    width: 100%;
                    height: 40px;
                    border: none;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cs-export-copy-btn i {
                    font-size: 14px;
                }

                .cs-export-copy-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .cs-root {
                        padding: 12px;
                    }

                    .cs-type-selector {
                        grid-template-columns: 1fr;
                    }

                    .cs-grid {
                        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cs-type-btn,
                    .cs-copy-all-btn,
                    .cs-color-swatch,
                    .cs-copy-btn,
                    .cs-export-copy-btn,
                    .cs-range::-webkit-slider-thumb,
                    .cs-range::-moz-range-thumb {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}