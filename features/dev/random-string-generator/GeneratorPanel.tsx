// features/dev/random-string-generator/GeneratorPanel.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { GeneratorOptions, GeneratedString, StrengthLevel } from "./utils";
import {
    generateString,
    calculateEntropy,
    getStrengthLevel,
    estimateCrackTime,
    analyzeString,
} from "./utils";

interface GeneratorPanelProps {
    options: GeneratorOptions;
    onOptionsChange: (options: GeneratorOptions) => void;
    onGenerate?: (result: GeneratedString) => void;
}

type MobileView = "options" | "results";

export default function GeneratorPanel({ options, onOptionsChange, onGenerate }: GeneratorPanelProps) {
    const [results, setResults] = useState<string[]>([]);
    const [count, setCount] = useState(5);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [autoGenerate, setAutoGenerate] = useState(false);
    const [mobileView, setMobileView] = useState<MobileView>("options");

    const entropy = useMemo(() => calculateEntropy(options), [options]);
    const strength = useMemo(() => getStrengthLevel(entropy), [entropy]);
    const crackTime = useMemo(() => estimateCrackTime(entropy), [entropy]);

    const handleGenerate = useCallback(() => {
        const newResults = Array.from({ length: count }, () => generateString(options));
        setResults(newResults);

        // Auto-switch to results view on mobile after generating
        setMobileView("results");

        // Add to history
        if (onGenerate && newResults.length > 0 && newResults[0]) {
            const entry: GeneratedString = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                value: newResults[0],
                timestamp: Date.now(),
                options: { ...options },
                entropy,
                strength,
            };
            onGenerate(entry);
        }
    }, [options, count, entropy, strength, onGenerate]);

    const handleCopy = useCallback(async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 1500);
        } catch {
            // Silent fail
        }
    }, []);

    // Auto-generate when options change
    useMemo(() => {
        if (autoGenerate && results.length > 0) {
            const timeoutId = setTimeout(handleGenerate, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [options, autoGenerate, results.length, handleGenerate]);

    const strengthColor = {
        weak: "#dc2626",
        fair: "#f59e0b",
        good: "#10b981",
        strong: "#059669",
        excellent: "#047857",
    }[strength];

    const updateOptions = useCallback((updates: Partial<GeneratorOptions>) => {
        onOptionsChange({ ...options, ...updates });
    }, [options, onOptionsChange]);

    return (
        <>
            <div className="gp-root">
                {/*  Mobile Tab Switcher  */}
                <div className="gp-mobile-tabs">
                    <button
                        type="button"
                        className={`gp-mobile-tab${mobileView === "options" ? " active" : ""}`}
                        onClick={() => setMobileView("options")}
                    >
                        <i className="ti ti-adjustments" />
                        Options
                    </button>
                    <button
                        type="button"
                        className={`gp-mobile-tab${mobileView === "results" ? " active" : ""}`}
                        onClick={() => setMobileView("results")}
                    >
                        <i className="ti ti-list-check" />
                        Results
                        {results.length > 0 && (
                            <span className="gp-mobile-badge">{results.length}</span>
                        )}
                    </button>
                </div>

                <div className="gp-panels">
                    {/*  Options Panel  */}
                    <div className={`gp-options${mobileView === "options" ? " mobile-visible" : " mobile-hidden"}`}>
                        {/* Length Control */}
                        <div className="gp-section">
                            <div className="gp-section-header">
                                <label className="gp-label">Length</label>
                                <div className="gp-length-display">
                                    <input
                                        type="number"
                                        className="gp-length-input"
                                        value={options.length}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            updateOptions({ length: Math.max(1, Math.min(10000, val)) });
                                        }}
                                        min="1"
                                        max="10000"
                                    />
                                    <span className="gp-length-unit">chars</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                className="gp-slider"
                                min="1"
                                max="128"
                                value={Math.min(options.length, 128)}
                                onChange={(e) => updateOptions({ length: parseInt(e.target.value) })}
                            />
                            <div className="gp-slider-marks">
                                <span>1</span>
                                <span>32</span>
                                <span>64</span>
                                <span>128</span>
                            </div>
                        </div>

                        {/* Character Sets */}
                        <div className="gp-section">
                            <label className="gp-label">Character Sets</label>
                            <div className="gp-checkboxes">
                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.uppercase}
                                        onChange={(e) => updateOptions({ uppercase: e.target.checked, hex: false, binary: false })}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Uppercase</span>
                                        <span className="gp-checkbox-hint">A-Z (26)</span>
                                    </div>
                                </label>

                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.lowercase}
                                        onChange={(e) => updateOptions({ lowercase: e.target.checked, hex: false, binary: false })}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Lowercase</span>
                                        <span className="gp-checkbox-hint">a-z (26)</span>
                                    </div>
                                </label>

                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.numbers}
                                        onChange={(e) => updateOptions({ numbers: e.target.checked, hex: false, binary: false })}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Numbers</span>
                                        <span className="gp-checkbox-hint">0-9 (10)</span>
                                    </div>
                                </label>

                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.symbols}
                                        onChange={(e) => updateOptions({ symbols: e.target.checked, hex: false, binary: false })}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Symbols</span>
                                        <span className="gp-checkbox-hint">!@#$... (28)</span>
                                    </div>
                                </label>

                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.hex}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                updateOptions({
                                                    hex: true,
                                                    binary: false,
                                                    uppercase: false,
                                                    lowercase: false,
                                                    numbers: false,
                                                    symbols: false,
                                                });
                                            } else {
                                                updateOptions({ hex: false });
                                            }
                                        }}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Hexadecimal</span>
                                        <span className="gp-checkbox-hint">0-9, A-F (16)</span>
                                    </div>
                                </label>

                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.binary}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                updateOptions({
                                                    binary: true,
                                                    hex: false,
                                                    uppercase: false,
                                                    lowercase: false,
                                                    numbers: false,
                                                    symbols: false,
                                                });
                                            } else {
                                                updateOptions({ binary: false });
                                            }
                                        }}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Binary</span>
                                        <span className="gp-checkbox-hint">0, 1 (2)</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Advanced Options */}
                        <div className="gp-section">
                            <label className="gp-label">Advanced</label>
                            <div className="gp-checkboxes">
                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.excludeSimilar}
                                        onChange={(e) => updateOptions({ excludeSimilar: e.target.checked })}
                                        disabled={options.hex || options.binary || !!options.customChars}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Exclude similar</span>
                                        <span className="gp-checkbox-hint">i, l, 1, L, o, 0, O</span>
                                    </div>
                                </label>

                                <label className="gp-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.excludeAmbiguous}
                                        onChange={(e) => updateOptions({ excludeAmbiguous: e.target.checked })}
                                        disabled={options.hex || options.binary || !!options.customChars}
                                    />
                                    <div className="gp-checkbox-content">
                                        <span className="gp-checkbox-label">Exclude ambiguous</span>
                                        <span className="gp-checkbox-hint">{`{ } [ ] ( ) / \\ ' " \` ~ , ; : . < >`}</span>
                                    </div>
                                </label>
                            </div>

                            {/* Custom Characters */}
                            <div className="gp-input-group">
                                <label className="gp-input-label">Custom character set</label>
                                <input
                                    type="text"
                                    className="gp-input"
                                    value={options.customChars}
                                    onChange={(e) => updateOptions({ customChars: e.target.value })}
                                    placeholder="e.g., abc123XYZ (overrides above)"
                                />
                            </div>

                            {/* Prefix/Suffix */}
                            <div className="gp-input-row">
                                <div className="gp-input-group">
                                    <label className="gp-input-label">Prefix</label>
                                    <input
                                        type="text"
                                        className="gp-input"
                                        value={options.prefix}
                                        onChange={(e) => updateOptions({ prefix: e.target.value })}
                                        placeholder="e.g., user_"
                                    />
                                </div>
                                <div className="gp-input-group">
                                    <label className="gp-input-label">Suffix</label>
                                    <input
                                        type="text"
                                        className="gp-input"
                                        value={options.suffix}
                                        onChange={(e) => updateOptions({ suffix: e.target.value })}
                                        placeholder="e.g., _2024"
                                    />
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="gp-input-row">
                                <div className="gp-input-group">
                                    <label className="gp-input-label">Separator</label>
                                    <input
                                        type="text"
                                        className="gp-input"
                                        value={options.separator}
                                        onChange={(e) => updateOptions({ separator: e.target.value.slice(0, 1) })}
                                        placeholder="e.g., -"
                                        maxLength={1}
                                    />
                                </div>
                                <div className="gp-input-group">
                                    <label className="gp-input-label">Every N chars</label>
                                    <input
                                        type="number"
                                        className="gp-input"
                                        value={options.separatorInterval || ""}
                                        onChange={(e) => updateOptions({ separatorInterval: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Strength Meter */}
                        <div className="gp-strength">
                            <div className="gp-strength-header">
                                <div className="gp-strength-label">
                                    <i className="ti ti-shield-check" />
                                    Security Strength
                                </div>
                                <span className="gp-strength-badge" style={{ background: strengthColor }}>
                                    {strength}
                                </span>
                            </div>
                            
                            <div className="gp-strength-bar">
                                <div
                                    className="gp-strength-fill"
                                    style={{
                                        width: `${Math.min((entropy / 150) * 100, 100)}%`,
                                        background: strengthColor,
                                    }}
                                />
                            </div>

                            <div className="gp-strength-stats">
                                <div className="gp-stat">
                                    <span className="gp-stat-value">{entropy.toFixed(1)}</span>
                                    <span className="gp-stat-label">bits entropy</span>
                                </div>
                                <div className="gp-stat">
                                    <span className="gp-stat-value">{crackTime}</span>
                                    <span className="gp-stat-label">to crack</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile-only Generate Button */}
                        <button className="gp-generate-btn gp-generate-btn-mobile" onClick={handleGenerate}>
                            <i className="ti ti-refresh" />
                            Generate {count} String{count !== 1 ? "s" : ""}
                        </button>
                    </div>

                    {/*  Results Panel  */}
                    <div className={`gp-results-panel${mobileView === "results" ? " mobile-visible" : " mobile-hidden"}`}>
                        {/* Controls */}
                        <div className="gp-controls">
                            <div className="gp-controls-left">
                                <label className="gp-count-label">
                                    Generate
                                    <input
                                        type="number"
                                        className="gp-count-input"
                                        value={count}
                                        onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                        min="1"
                                        max="100"
                                    />
                                    strings
                                </label>

                                <label className="gp-auto-toggle">
                                    <input
                                        type="checkbox"
                                        checked={autoGenerate}
                                        onChange={(e) => setAutoGenerate(e.target.checked)}
                                    />
                                    <span>Auto-generate</span>
                                </label>
                            </div>

                            <button className="gp-generate-btn" onClick={handleGenerate}>
                                <i className="ti ti-refresh" />
                                Generate
                            </button>
                        </div>

                        {/* Results */}
                        {results.length === 0 ? (
                            <div className="gp-empty">
                                <div className="gp-empty-icon">
                                    <i className="ti ti-click" />
                                </div>
                                <p className="gp-empty-title">Ready to generate</p>
                                <p className="gp-empty-desc">
                                    Configure your options and click "Generate" to create secure random strings
                                </p>
                                <button className="gp-empty-cta" onClick={() => setMobileView("options")}>
                                    <i className="ti ti-adjustments" />
                                    Configure Options
                                </button>
                            </div>
                        ) : (
                            <div className="gp-results">
                                {results.map((result, idx) => {
                                    const analysis = analyzeString(result);
                                    return (
                                        <div key={idx} className="gp-result-card">
                                            <div className="gp-result-header">
                                                <span className="gp-result-index">#{idx + 1}</span>
                                                <div className="gp-result-meta">
                                                    <span className="gp-result-length">{result.length} chars</span>
                                                    {analysis.hasRepeats && (
                                                        <span className="gp-result-warn" title="Contains repeated characters">
                                                            <i className="ti ti-alert-triangle" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="gp-result-value">{result}</div>
                                            <div className="gp-result-actions">
                                                <button
                                                    className={`gp-result-btn${copiedIndex === idx ? " copied" : ""}`}
                                                    onClick={() => handleCopy(result, idx)}
                                                >
                                                    <i className={`ti ${copiedIndex === idx ? "ti-check" : "ti-copy"}`} />
                                                    {copiedIndex === idx ? "Copied" : "Copy"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .gp-root {
                    display: flex;
                    flex-direction: column;
                    min-height: 600px;
                    overflow: hidden;
                }

                /*  Mobile Tab Switcher  */
                .gp-mobile-tabs {
                    display: none;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    flex-shrink: 0;
                }

                .gp-mobile-tab {
                    flex: 1;
                    height: 44px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.12s;
                }

                .gp-mobile-tab i {
                    font-size: 15px;
                }

                .gp-mobile-tab.active {
                    color: var(--text);
                }

                .gp-mobile-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .gp-mobile-badge {
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
                    font-weight: 700;
                    font-family: var(--font-mono);
                }

                /*  Panels Container  */
                .gp-panels {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 1px;
                    background: var(--border);
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Options Panel  */
                .gp-options {
                    background: var(--bg-surface);
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    overflow-y: auto;
                    min-height: 0;
                }

                .gp-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .gp-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .gp-label {
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .gp-length-display {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .gp-length-input {
                    width: 70px;
                    height: 26px;
                    padding: 0 8px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--brand);
                    font-family: var(--font-mono);
                    text-align: center;
                }

                .gp-length-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .gp-length-unit {
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .gp-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 99px;
                    background: var(--border);
                    outline: none;
                    -webkit-appearance: none;
                    cursor: pointer;
                }

                .gp-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--brand);
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                }

                .gp-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--brand);
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                }

                .gp-slider-marks {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                    margin-top: -4px;
                }

                .gp-checkboxes {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .gp-checkbox {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .gp-checkbox:hover:not(:has(input:disabled)) {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .gp-checkbox:has(input:checked) {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .gp-checkbox:has(input:disabled) {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .gp-checkbox input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    margin-top: 2px;
                    cursor: pointer;
                    accent-color: var(--brand);
                    flex-shrink: 0;
                }

                .gp-checkbox input[type="checkbox"]:disabled {
                    cursor: not-allowed;
                }

                .gp-checkbox-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    flex: 1;
                }

                .gp-checkbox-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text);
                }

                .gp-checkbox-hint {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .gp-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .gp-input-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .gp-input-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .gp-input {
                    width: 100%;
                    height: 34px;
                    padding: 0 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 6px;
                    font-size: 12px;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .gp-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .gp-input::placeholder {
                    color: var(--text-disabled);
                }

                /*  Strength Meter  */
                .gp-strength {
                    padding: 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .gp-strength-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .gp-strength-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .gp-strength-label i {
                    font-size: 14px;
                }

                .gp-strength-badge {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 99px;
                }

                .gp-strength-bar {
                    height: 8px;
                    background: var(--border);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .gp-strength-fill {
                    height: 100%;
                    border-radius: 99px;
                    transition: width 0.3s, background 0.3s;
                }

                .gp-strength-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .gp-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .gp-stat-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .gp-stat-label {
                    font-size: 10px;
                    color: var(--text-tertiary);
                }

                /*  Mobile Generate Button (hidden on desktop)  */
                .gp-generate-btn-mobile {
                    display: none;
                    width: 100%;
                }

                /*  Results Panel  */
                .gp-results-panel {
                    background: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 0;
                }

                .gp-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                    flex-shrink: 0;
                }

                .gp-controls-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .gp-count-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .gp-count-input {
                    width: 50px;
                    height: 26px;
                    padding: 0 8px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-align: center;
                }

                .gp-auto-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .gp-auto-toggle input {
                    cursor: pointer;
                    accent-color: var(--brand);
                }

                .gp-generate-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    height: 34px;
                    padding: 0 18px;
                    border-radius: 8px;
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand);
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .gp-generate-btn:hover {
                    background: var(--brand-hover);
                }

                .gp-generate-btn i {
                    font-size: 15px;
                }

                .gp-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .gp-empty-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    color: var(--text-disabled);
                    margin-bottom: 8px;
                }

                .gp-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .gp-empty-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 380px;
                    line-height: 1.6;
                }

                .gp-empty-cta {
                    display: none;
                    align-items: center;
                    gap: 6px;
                    height: 38px;
                    padding: 0 18px;
                    border-radius: 8px;
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: all 0.12s;
                }

                .gp-empty-cta:hover {
                    background: var(--brand);
                    color: white;
                }

                .gp-results {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .gp-result-card {
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 10px;
                    overflow: hidden;
                }

                .gp-result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border-faint);
                }

                .gp-result-index {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .gp-result-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .gp-result-length {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .gp-result-warn {
                    color: #f59e0b;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                }

                .gp-result-value {
                    padding: 14px 12px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.7;
                }

                .gp-result-actions {
                    padding: 8px 12px;
                    background: var(--bg-card);
                    border-top: 0.5px solid var(--border-faint);
                    display: flex;
                    gap: 6px;
                }

                .gp-result-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 12px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .gp-result-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .gp-result-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .gp-result-btn i {
                    font-size: 12px;
                }

                /*  Responsive - Mobile Breakpoint  */
                @media (max-width: 900px) {
                    .gp-mobile-tabs {
                        display: flex;
                    }

                    .gp-panels {
                        display: block;
                        overflow: visible;
                    }

                    .gp-options,
                    .gp-results-panel {
                        min-height: 400px;
                        max-height: none;
                    }

                    .gp-options.mobile-hidden,
                    .gp-results-panel.mobile-hidden {
                        display: none;
                    }

                    .gp-options.mobile-visible {
                        display: flex;
                    }

                    .gp-results-panel.mobile-visible {
                        display: flex;
                    }

                    .gp-generate-btn-mobile {
                        display: flex;
                    }

                    .gp-controls-left {
                        flex: 1;
                    }

                    .gp-empty-cta {
                        display: inline-flex;
                    }
                }

                @media (max-width: 480px) {
                    .gp-controls {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .gp-controls-left {
                        justify-content: space-between;
                    }

                    .gp-generate-btn {
                        width: 100%;
                    }

                    .gp-input-row {
                        grid-template-columns: 1fr;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .gp-checkbox,
                    .gp-generate-btn,
                    .gp-result-btn,
                    .gp-strength-fill,
                    .gp-mobile-tab,
                    .gp-empty-cta {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}