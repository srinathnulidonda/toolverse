// features/dev/random-string-generator/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";

interface GeneratorOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeSimilar: boolean;
    customChars: string;
}

const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    similar: "il1Lo0O",
};

const PRESETS = [
    { id: "password", label: "Strong Password", icon: "ti-key", options: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeSimilar: true, customChars: "" } },
    { id: "apikey", label: "API Key", icon: "ti-api", options: { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: false, customChars: "" } },
    { id: "token", label: "Token", icon: "ti-shield", options: { length: 64, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: false, customChars: "" } },
    { id: "pin", label: "PIN Code", icon: "ti-lock", options: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false, excludeSimilar: true, customChars: "" } },
];

function generateString(options: GeneratorOptions): string {
    let charset = options.customChars || "";

    if (!options.customChars) {
        if (options.uppercase) charset += CHARSETS.uppercase;
        if (options.lowercase) charset += CHARSETS.lowercase;
        if (options.numbers) charset += CHARSETS.numbers;
        if (options.symbols) charset += CHARSETS.symbols;
    }

    if (!charset) return "";

    if (options.excludeSimilar && !options.customChars) {
        charset = charset.split("").filter(char => !CHARSETS.similar.includes(char)).join("");
    }

    let result = "";
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < options.length; i++) {
        result += charset[array[i] % charset.length];
    }

    return result;
}

function calculateEntropy(options: GeneratorOptions): number {
    let charsetSize = 0;
    if (options.customChars) {
        charsetSize = new Set(options.customChars).size;
    } else {
        if (options.uppercase) charsetSize += 26;
        if (options.lowercase) charsetSize += 26;
        if (options.numbers) charsetSize += 10;
        if (options.symbols) charsetSize += CHARSETS.symbols.length;
        if (options.excludeSimilar) charsetSize -= CHARSETS.similar.length;
    }
    return Math.log2(Math.pow(charsetSize, options.length));
}

export default function RandomStringGeneratorWorkspace({ tool }: { tool: Tool }) {
    const [options, setOptions] = useState<GeneratorOptions>({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        excludeSimilar: false,
        customChars: "",
    });
    const [results, setResults] = useState<string[]>([]);
    const [copiedKey, setCopiedKey] = useState("");

    const generate = useCallback(() => {
        const newResults = Array.from({ length: 5 }, () => generateString(options));
        setResults(newResults);
    }, [options]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadPreset = (preset: typeof PRESETS[0]) => {
        setOptions(preset.options);
        setResults([]);
    };

    const entropy = calculateEntropy(options);
    const strength = entropy < 50 ? "weak" : entropy < 80 ? "medium" : entropy < 120 ? "strong" : "very-strong";

    return (
        <>
            <div className="rsg-root">
                {/* Command Bar */}
                <div className="rsg-cmd">
                    <div className="rsg-cmd-left">
                        <span className="rsg-cmd-label">Presets</span>
                        {PRESETS.map((p) => (
                            <button key={p.id} className="rsg-preset-btn" onClick={() => loadPreset(p)}>
                                <i className={`ti ${p.icon}`} />
                                <span className="rsg-preset-label">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    <button className="rsg-generate-btn" onClick={generate}>
                        <i className="ti ti-refresh" />
                        Generate
                    </button>
                </div>

                {/* Options Panel */}
                <div className="rsg-options">
                    <div className="rsg-options-section">
                        <div className="rsg-options-header">
                            <span className="rsg-options-title">Length</span>
                            <span className="rsg-length-value">{options.length}</span>
                        </div>
                        <input
                            type="range"
                            className="rsg-slider"
                            min="4"
                            max="128"
                            value={options.length}
                            onChange={(e) => setOptions((prev) => ({ ...prev, length: parseInt(e.target.value) }))}
                        />
                        <div className="rsg-slider-labels">
                            <span>4</span>
                            <span>128</span>
                        </div>
                    </div>

                    <div className="rsg-options-section">
                        <span className="rsg-options-title">Character Sets</span>
                        <div className="rsg-checkboxes">
                            <label className="rsg-checkbox">
                                <input
                                    type="checkbox"
                                    checked={options.uppercase}
                                    onChange={(e) => setOptions((prev) => ({ ...prev, uppercase: e.target.checked }))}
                                />
                                <span className="rsg-checkbox-label">
                                    Uppercase (A-Z)
                                    <span className="rsg-checkbox-count">26 chars</span>
                                </span>
                            </label>
                            <label className="rsg-checkbox">
                                <input
                                    type="checkbox"
                                    checked={options.lowercase}
                                    onChange={(e) => setOptions((prev) => ({ ...prev, lowercase: e.target.checked }))}
                                />
                                <span className="rsg-checkbox-label">
                                    Lowercase (a-z)
                                    <span className="rsg-checkbox-count">26 chars</span>
                                </span>
                            </label>
                            <label className="rsg-checkbox">
                                <input
                                    type="checkbox"
                                    checked={options.numbers}
                                    onChange={(e) => setOptions((prev) => ({ ...prev, numbers: e.target.checked }))}
                                />
                                <span className="rsg-checkbox-label">
                                    Numbers (0-9)
                                    <span className="rsg-checkbox-count">10 chars</span>
                                </span>
                            </label>
                            <label className="rsg-checkbox">
                                <input
                                    type="checkbox"
                                    checked={options.symbols}
                                    onChange={(e) => setOptions((prev) => ({ ...prev, symbols: e.target.checked }))}
                                />
                                <span className="rsg-checkbox-label">
                                    Symbols (!@#$...)
                                    <span className="rsg-checkbox-count">{CHARSETS.symbols.length} chars</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="rsg-options-section">
                        <span className="rsg-options-title">Advanced</span>
                        <label className="rsg-checkbox">
                            <input
                                type="checkbox"
                                checked={options.excludeSimilar}
                                onChange={(e) => setOptions((prev) => ({ ...prev, excludeSimilar: e.target.checked }))}
                            />
                            <span className="rsg-checkbox-label">
                                Exclude similar characters (i, l, 1, L, o, 0, O)
                            </span>
                        </label>
                        <div className="rsg-custom-input">
                            <label className="rsg-custom-label">Custom character set (overrides above)</label>
                            <input
                                type="text"
                                className="rsg-custom-field"
                                value={options.customChars}
                                onChange={(e) => setOptions((prev) => ({ ...prev, customChars: e.target.value }))}
                                placeholder="e.g., abc123XYZ"
                            />
                        </div>
                    </div>

                    {/* Strength Meter */}
                    <div className="rsg-strength">
                        <div className="rsg-strength-header">
                            <span className="rsg-strength-label">Entropy</span>
                            <span className="rsg-strength-value">{entropy.toFixed(1)} bits</span>
                        </div>
                        <div className="rsg-strength-bar">
                            <div
                                className={`rsg-strength-fill rsg-strength-fill--${strength}`}
                                style={{ width: `${Math.min((entropy / 150) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="rsg-strength-labels">
                            <span className={strength === "weak" ? "rsg-strength-active" : ""}>Weak</span>
                            <span className={strength === "medium" ? "rsg-strength-active" : ""}>Medium</span>
                            <span className={strength === "strong" ? "rsg-strength-active" : ""}>Strong</span>
                            <span className={strength === "very-strong" ? "rsg-strength-active" : ""}>Very Strong</span>
                        </div>
                    </div>
                </div>

                <div className="rsg-body">
                    {/* Empty State */}
                    {results.length === 0 && (
                        <div className="rsg-empty">
                            <div className="rsg-empty-icon">
                                <i className="ti ti-abc" />
                            </div>
                            <p className="rsg-empty-title">Generate Random Strings</p>
                            <p className="rsg-empty-desc">
                                Click "Generate" to create secure random strings for passwords, API keys, or tokens
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="rsg-section">
                            <div className="rsg-section-header">
                                <div className="rsg-section-title">
                                    <i className="ti ti-sparkles" />
                                    Generated Strings
                                </div>
                            </div>
                            <div className="rsg-results">
                                {results.map((result, idx) => (
                                    <div key={idx} className="rsg-result">
                                        <div className="rsg-result-value">{result}</div>
                                        <button
                                            className={`rsg-copy-btn${copiedKey === `r${idx}` ? " --done" : ""}`}
                                            onClick={() => copy(result, `r${idx}`)}
                                        >
                                            <i className={`ti ${copiedKey === `r${idx}` ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="rsg-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Generated using cryptographically secure random values in your browser.</span>
                </div>
            </div>

            <style jsx>{`
                .rsg-root {
                    --rsg-radius-sm: 6px;
                    --rsg-radius-md: 8px;
                    --rsg-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rsg-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .rsg-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .rsg-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .rsg-cmd-label {
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
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--rsg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rsg-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .rsg-preset-btn i {
                    font-size: 13px;
                }

                .rsg-generate-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 16px;
                    border-radius: var(--rsg-radius-md);
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand);
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rsg-generate-btn:hover {
                    background: var(--brand-hover);
                }

                .rsg-generate-btn i {
                    font-size: 14px;
                }

                .rsg-options {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .rsg-options-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .rsg-options-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .rsg-options-title {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .rsg-length-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--brand);
                    font-family: var(--font-mono);
                }

                .rsg-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 99px;
                    background: var(--border);
                    outline: none;
                    -webkit-appearance: none;
                }

                .rsg-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--brand);
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .rsg-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--brand);
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .rsg-slider-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .rsg-checkboxes {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .rsg-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .rsg-checkbox input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: var(--brand);
                }

                .rsg-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .rsg-checkbox-count {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .rsg-custom-input {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-top: 4px;
                }

                .rsg-custom-label {
                    font-size: 11px;
                    color: var(--text-secondary);
                }

                .rsg-custom-field {
                    width: 100%;
                    height: 32px;
                    padding: 0 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rsg-radius-md);
                    font-size: 12px;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .rsg-custom-field:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .rsg-strength {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rsg-radius-md);
                }

                .rsg-strength-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .rsg-strength-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .rsg-strength-value {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--brand);
                    font-family: var(--font-mono);
                }

                .rsg-strength-bar {
                    height: 6px;
                    background: var(--border);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .rsg-strength-fill {
                    height: 100%;
                    border-radius: 99px;
                    transition: width 0.3s, background 0.3s;
                }

                .rsg-strength-fill--weak {
                    background: #dc2626;
                }

                .rsg-strength-fill--medium {
                    background: #f59e0b;
                }

                .rsg-strength-fill--strong {
                    background: #10b981;
                }

                .rsg-strength-fill--very-strong {
                    background: #059669;
                }

                .rsg-strength-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 9px;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    font-weight: 600;
                }

                .rsg-strength-active {
                    color: var(--brand);
                }

                .rsg-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    min-height: 200px;
                }

                .rsg-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    padding: 40px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .rsg-empty-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: var(--text-disabled);
                    margin-bottom: 6px;
                }

                .rsg-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .rsg-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 360px;
                    line-height: 1.6;
                }

                .rsg-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .rsg-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .rsg-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .rsg-section-title i {
                    font-size: 14px;
                }

                .rsg-results {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .rsg-result {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rsg-radius-md);
                    transition: background 0.1s;
                }

                .rsg-result:hover {
                    background: var(--bg-surface);
                }

                .rsg-result-value {
                    flex: 1;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    word-break: break-all;
                }

                .rsg-copy-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--rsg-radius-md);
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

                .rsg-copy-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .rsg-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .rsg-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .rsg-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .rsg-cmd {
                        padding: 10px 12px;
                    }

                    .rsg-cmd-label {
                        display: none;
                    }

                    .rsg-preset-label {
                        display: none;
                    }

                    .rsg-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .rsg-options {
                        padding: 12px;
                    }

                    .rsg-body {
                        padding: 12px;
                    }
                }
            `}</style>
        </>
    );
}