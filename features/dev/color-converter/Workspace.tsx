// features/dev/color-converter/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import type { Tool } from "@/lib/tools";

interface ColorFormats {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    hsv: { h: number; s: number; v: number };
}

const PRESET_COLORS = [
    { id: "brand", name: "Brand Blue", hex: "#3B82F6" },
    { id: "success", name: "Success Green", hex: "#10B981" },
    { id: "warning", name: "Warning Amber", hex: "#F59E0B" },
    { id: "error", name: "Error Red", hex: "#EF4444" },
    { id: "purple", name: "Purple", hex: "#8B5CF6" },
    { id: "pink", name: "Pink", hex: "#EC4899" },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function parseColor(input: string): ColorFormats | null {
    input = input.trim();

    // Try HEX
    if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
        const hex = input.startsWith("#") ? input : "#" + input;
        const rgb = hexToRgb(hex);
        if (rgb) {
            return {
                hex,
                rgb,
                hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
                hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
            };
        }
    }

    // Try RGB
    const rgbMatch = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
        const rgb = { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
        return {
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            rgb,
            hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
            hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
        };
    }

    return null;
}

export default function ColorConverterWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("#3B82F6");
    const [copiedKey, setCopiedKey] = useState("");
    const [activePane, setActivePane] = useState<"input" | "output">("input");

    const rootRef = useRef<HTMLDivElement>(null);

    const color = useMemo(() => parseColor(input), [input]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadPreset = (preset: typeof PRESET_COLORS[0]) => {
        setInput(preset.hex);
        setActivePane("input");
    };

    const goOutput = () => {
        setActivePane("output");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    const goInput = () => {
        setActivePane("input");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    return (
        <>
            <div className="cc-root" ref={rootRef}>
                {/* Command Bar */}
                <div className="cc-cmd">
                    <div className="cc-cmd-left">
                        <span className="cc-cmd-label">Presets</span>
                        {PRESET_COLORS.map((p) => (
                            <button
                                key={p.id}
                                className="cc-preset-btn"
                                onClick={() => loadPreset(p)}
                                title={p.name}
                                style={{ borderColor: p.hex }}
                            >
                                <span className="cc-preset-swatch" style={{ background: p.hex }} />
                                <span className="cc-preset-label">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Switcher */}
                <div className="cc-switcher">
                    <button
                        className={`cc-switcher-tab${activePane === "input" ? " --on" : ""}`}
                        onClick={goInput}
                    >
                        <i className="ti ti-color-picker" />
                        Color Input
                    </button>
                    <div className="cc-switcher-div" />
                    <button
                        className={`cc-switcher-tab${activePane === "output" ? " --on" : ""}`}
                        onClick={goOutput}
                    >
                        <i className="ti ti-palette" />
                        Formats
                        {color && activePane !== "output" && <span className="cc-ready-dot" />}
                    </button>
                </div>

                {/* Main Body */}
                <div className="cc-body">
                    {/* Input Pane */}
                    <div className={`cc-pane cc-pane-in${activePane === "input" ? " --mob-show" : ""}`}>
                        <div className="cc-pane-bar">
                            <span className="cc-pane-bar-label">
                                <i className="ti ti-color-picker" />
                                Color Input
                            </span>
                            <div className="cc-pane-bar-actions">
                                <button className="cc-ghost" onClick={() => setInput("#000000")} title="Reset">
                                    <i className="ti ti-refresh" />
                                </button>
                            </div>
                        </div>

                        {/* Color Picker & Text Input */}
                        <div className="cc-input-section">
                            <div className="cc-picker-group">
                                <input
                                    type="color"
                                    className="cc-color-picker"
                                    value={color?.hex || "#000000"}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <div className="cc-picker-info">
                                    <span className="cc-picker-label">Color Picker</span>
                                    <span className="cc-picker-value">{color?.hex.toUpperCase() || "#000000"}</span>
                                </div>
                            </div>

                            <div className="cc-input-divider">
                                <span>or</span>
                            </div>

                            <div className="cc-text-group">
                                <label className="cc-text-label">Enter color value</label>
                                <input
                                    type="text"
                                    className="cc-text-input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="HEX (#3B82F6) or RGB (rgb(59, 130, 246))"
                                />
                                {!color && input && (
                                    <div className="cc-error">
                                        <i className="ti ti-alert-circle" />
                                        Invalid color format
                                    </div>
                                )}
                            </div>

                            {/* Preview Box */}
                            {color && (
                                <div className="cc-preview-box" style={{ background: color.hex }}>
                                    <div className="cc-preview-overlay">
                                        <span className="cc-preview-hex">{color.hex.toUpperCase()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {color && (
                            <div className="cc-mob-cta">
                                <button className="cc-view-result" onClick={goOutput}>
                                    <i className="ti ti-palette" />
                                    View All Formats
                                    <i className="ti ti-chevron-right" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gutter */}
                    <div className="cc-gutter">
                        <div className="cc-gutter-line" />
                        <div className="cc-gutter-icon">
                            <i className="ti ti-arrow-right" />
                        </div>
                        <div className="cc-gutter-line" />
                    </div>

                    {/* Output Pane */}
                    <div className={`cc-pane cc-pane-out${activePane === "output" ? " --mob-show" : ""}`}>
                        <div className="cc-pane-bar">
                            <span className="cc-pane-bar-label">
                                <i className="ti ti-palette" />
                                Color Formats
                            </span>
                        </div>

                        {!color && (
                            <div className="cc-empty">
                                <div className="cc-empty-ico">
                                    <i className="ti ti-palette" />
                                </div>
                                <p className="cc-empty-h">Convert Color Formats</p>
                                <p className="cc-empty-p">
                                    Pick a color or enter a value to see all format conversions
                                </p>
                                <button className="cc-go-input-mob" onClick={goInput}>
                                    <i className="ti ti-color-picker" />
                                    Go to input
                                </button>
                            </div>
                        )}

                        {color && (
                            <div className="cc-formats">
                                {/* HEX */}
                                <div className="cc-format-card">
                                    <div className="cc-format-header">
                                        <div className="cc-format-icon">
                                            <i className="ti ti-hash" />
                                        </div>
                                        <div className="cc-format-info">
                                            <span className="cc-format-title">HEX</span>
                                            <span className="cc-format-desc">Hexadecimal</span>
                                        </div>
                                        <button
                                            className={`cc-copy-btn${copiedKey === "hex" ? " --done" : ""}`}
                                            onClick={() => copy(color.hex, "hex")}
                                        >
                                            <i className={`ti ${copiedKey === "hex" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>
                                    <div className="cc-format-value">{color.hex.toUpperCase()}</div>
                                </div>

                                {/* RGB */}
                                <div className="cc-format-card">
                                    <div className="cc-format-header">
                                        <div className="cc-format-icon --rgb">
                                            <i className="ti ti-code" />
                                        </div>
                                        <div className="cc-format-info">
                                            <span className="cc-format-title">RGB</span>
                                            <span className="cc-format-desc">Red, Green, Blue</span>
                                        </div>
                                        <button
                                            className={`cc-copy-btn${copiedKey === "rgb" ? " --done" : ""}`}
                                            onClick={() => copy(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, "rgb")}
                                        >
                                            <i className={`ti ${copiedKey === "rgb" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>
                                    <div className="cc-format-value">
                                        rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                                    </div>
                                    <div className="cc-format-channels">
                                        <span className="cc-channel">R: {color.rgb.r}</span>
                                        <span className="cc-channel">G: {color.rgb.g}</span>
                                        <span className="cc-channel">B: {color.rgb.b}</span>
                                    </div>
                                </div>

                                {/* HSL */}
                                <div className="cc-format-card">
                                    <div className="cc-format-header">
                                        <div className="cc-format-icon --hsl">
                                            <i className="ti ti-adjustments" />
                                        </div>
                                        <div className="cc-format-info">
                                            <span className="cc-format-title">HSL</span>
                                            <span className="cc-format-desc">Hue, Saturation, Lightness</span>
                                        </div>
                                        <button
                                            className={`cc-copy-btn${copiedKey === "hsl" ? " --done" : ""}`}
                                            onClick={() => copy(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, "hsl")}
                                        >
                                            <i className={`ti ${copiedKey === "hsl" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>
                                    <div className="cc-format-value">
                                        hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                                    </div>
                                    <div className="cc-format-channels">
                                        <span className="cc-channel">H: {color.hsl.h}°</span>
                                        <span className="cc-channel">S: {color.hsl.s}%</span>
                                        <span className="cc-channel">L: {color.hsl.l}%</span>
                                    </div>
                                </div>

                                {/* HSV */}
                                <div className="cc-format-card">
                                    <div className="cc-format-header">
                                        <div className="cc-format-icon --hsv">
                                            <i className="ti ti-color-swatch" />
                                        </div>
                                        <div className="cc-format-info">
                                            <span className="cc-format-title">HSV</span>
                                            <span className="cc-format-desc">Hue, Saturation, Value</span>
                                        </div>
                                        <button
                                            className={`cc-copy-btn${copiedKey === "hsv" ? " --done" : ""}`}
                                            onClick={() => copy(`hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`, "hsv")}
                                        >
                                            <i className={`ti ${copiedKey === "hsv" ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>
                                    <div className="cc-format-value">
                                        hsv({color.hsv.h}, {color.hsv.s}%, {color.hsv.v}%)
                                    </div>
                                    <div className="cc-format-channels">
                                        <span className="cc-channel">H: {color.hsv.h}°</span>
                                        <span className="cc-channel">S: {color.hsv.s}%</span>
                                        <span className="cc-channel">V: {color.hsv.v}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="cc-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .cc-root {
                    --cc-radius-sm: 6px;
                    --cc-radius-md: 8px;
                    --cc-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .cc-cmd {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .cc-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .cc-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .cc-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cc-preset-btn:hover {
                    background: var(--bg-surface);
                }

                .cc-preset-swatch {
                    width: 14px;
                    height: 14px;
                    border-radius: 3px;
                    border: 0.5px solid rgba(0, 0, 0, 0.1);
                }

                .cc-switcher {
                    display: none;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .cc-switcher-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    height: 46px;
                    border: none;
                    border-bottom: 2px solid transparent;
                    background: transparent;
                    color: var(--text-tertiary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    position: relative;
                }

                .cc-switcher-tab:hover {
                    color: var(--text-secondary);
                }

                .cc-switcher-tab.--on {
                    color: var(--text);
                    border-bottom-color: var(--text);
                }

                .cc-switcher-tab i {
                    font-size: 15px;
                }

                .cc-switcher-div {
                    width: 0.5px;
                    background: var(--border);
                    align-self: stretch;
                    margin: 10px 0;
                }

                .cc-ready-dot {
                    position: absolute;
                    top: 11px;
                    right: calc(50% - 30px);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--brand);
                    border: 1.5px solid var(--bg-surface);
                }

                .cc-body {
                    display: grid;
                    grid-template-columns: 1fr 44px 1fr;
                    flex: 1;
                    min-height: 400px;
                }

                .cc-pane {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .cc-pane-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 40px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    gap: 8px;
                }

                .cc-pane-bar-label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .cc-pane-bar-label i {
                    font-size: 12px;
                }

                .cc-pane-bar-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .cc-ghost {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.1s;
                }

                .cc-ghost:hover {
                    background: var(--border);
                    color: var(--text);
                }

                .cc-input-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 20px 16px;
                    overflow-y: auto;
                }

                .cc-picker-group {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-md);
                }

                .cc-color-picker {
                    width: 64px;
                    height: 64px;
                    border: 2px solid var(--border);
                    border-radius: var(--cc-radius-md);
                    cursor: pointer;
                }

                .cc-picker-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .cc-picker-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .cc-picker-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .cc-input-divider {
                    position: relative;
                    height: 1px;
                    background: var(--border);
                    margin: 4px 0;
                }

                .cc-input-divider span {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 0 12px;
                    background: var(--bg-card);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                }

                .cc-text-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .cc-text-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .cc-text-input {
                    width: 100%;
                    height: 44px;
                    padding: 0 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    transition: border-color 0.12s;
                }

                .cc-text-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .cc-text-input::placeholder {
                    color: var(--text-disabled);
                    font-size: 12px;
                }

                .cc-error {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 10px;
                    background: #fef2f2;
                    border: 0.5px solid #fecaca;
                    border-radius: var(--cc-radius-sm);
                    color: #991b1b;
                    font-size: 11px;
                }

                @media (prefers-color-scheme: dark) {
                    .cc-error {
                        background: #1c0a0a;
                        border-color: #7f1d1d;
                        color: #f87171;
                    }
                }

                .cc-error i {
                    font-size: 13px;
                }

                .cc-preview-box {
                    height: 120px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    position: relative;
                    overflow: hidden;
                }

                .cc-preview-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.3);
                }

                .cc-preview-hex {
                    font-family: var(--font-mono);
                    font-size: 20px;
                    font-weight: 700;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .cc-mob-cta {
                    display: none;
                    padding: 10px 14px;
                    border-top: 0.5px solid var(--border);
                }

                .cc-view-result {
                    width: 100%;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cc-view-result:hover {
                    background: var(--bg-card);
                }

                .cc-view-result i:first-child {
                    color: var(--brand);
                }

                .cc-view-result i:last-child {
                    color: var(--text-tertiary);
                    margin-left: auto;
                }

                .cc-gutter {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-left: 0.5px solid var(--border);
                    border-right: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    padding: 16px 0;
                }

                .cc-gutter-line {
                    flex: 1;
                    width: 0.5px;
                    background: var(--border);
                }

                .cc-gutter-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 8px 0;
                }

                .cc-formats {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 16px;
                    overflow-y: auto;
                }

                .cc-format-card {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 14px 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-md);
                    transition: background 0.1s;
                }

                .cc-format-card:hover {
                    background: var(--bg-surface);
                }

                .cc-format-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .cc-format-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: var(--cc-radius-md);
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    color: var(--brand);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .cc-format-icon.--rgb {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                    color: #1d4ed8;
                }

                .cc-format-icon.--hsl {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                    color: #166534;
                }

                .cc-format-icon.--hsv {
                    background: #fef3c7;
                    border-color: #fde68a;
                    color: #92400e;
                }

                @media (prefers-color-scheme: dark) {
                    .cc-format-icon.--rgb {
                        background: #0a1628;
                        border-color: #1e3a5f;
                        color: #93c5fd;
                    }
                    .cc-format-icon.--hsl {
                        background: #052e16;
                        border-color: #166534;
                        color: #4ade80;
                    }
                    .cc-format-icon.--hsv {
                        background: #1c1400;
                        border-color: #78350f;
                        color: #fcd34d;
                    }
                }

                .cc-format-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .cc-format-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .cc-format-desc {
                    font-size: 10px;
                    color: var(--text-disabled);
                }

                .cc-copy-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .cc-copy-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .cc-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .cc-format-value {
                    font-family: var(--font-mono);
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border-radius: var(--cc-radius-sm);
                }

                .cc-format-channels {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .cc-channel {
                    font-size: 11px;
                    font-family: var(--font-mono);
                    color: var(--text-tertiary);
                    font-weight: 600;
                }

                .cc-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 24px;
                    gap: 8px;
                    text-align: center;
                }

                .cc-empty-ico {
                    width: 44px;
                    height: 44px;
                    border-radius: 13px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: var(--text-disabled);
                    margin-bottom: 4px;
                }

                .cc-empty-h {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .cc-empty-p {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 220px;
                    line-height: 1.55;
                }

                .cc-go-input-mob {
                    display: none;
                    align-items: center;
                    gap: 5px;
                    margin-top: 4px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cc-go-input-mob:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .cc-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 14px;
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    font-size: 11px;
                    color: var(--text-disabled);
                    line-height: 1;
                }

                .cc-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .cc-switcher {
                        display: flex;
                    }

                    .cc-gutter {
                        display: none;
                    }

                    .cc-body {
                        display: block;
                        min-height: unset;
                    }

                    .cc-pane {
                        display: none;
                        min-height: unset;
                    }

                    .cc-pane.--mob-show {
                        display: flex;
                    }

                    .cc-mob-cta {
                        display: block;
                    }

                    .cc-go-input-mob {
                        display: flex;
                    }

                    .cc-cmd-label {
                        display: none;
                    }

                    .cc-preset-label {
                        display: none;
                    }

                    .cc-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .cc-input-section {
                        padding: 16px 12px;
                    }

                    .cc-formats {
                        padding: 12px;
                    }
                }
            `}</style>
        </>
    );
}