// features/dev/slug-generator/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";

type Separator = "-" | "_" | ".";

interface SlugOptions {
    separator: Separator;
    lowercase: boolean;
    removeSpecial: boolean;
    removeDiacritics: boolean;
    maxLength: number | null;
}

const PRESETS = [
    { id: "blog", label: "Blog Post", text: "How to Build a Modern Web Application in 2024" },
    { id: "product", label: "Product Name", text: "MacBook Pro 16-inch (2024 Model)" },
    { id: "unicode", label: "Unicode", text: "Café façade: naïve résumé" },
];

function removeDiacritics(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function generateSlug(text: string, options: SlugOptions): string {
    if (!text) return "";

    let slug = text.trim();

    // Remove diacritics
    if (options.removeDiacritics) {
        slug = removeDiacritics(slug);
    }

    // Convert to lowercase
    if (options.lowercase) {
        slug = slug.toLowerCase();
    }

    // Remove special characters
    if (options.removeSpecial) {
        slug = slug.replace(/[^\w\s-]/g, "");
    }

    // Replace spaces with separator
    slug = slug.replace(/\s+/g, options.separator);

    // Remove multiple consecutive separators
    const separatorRegex = new RegExp(`\\${options.separator}+`, "g");
    slug = slug.replace(separatorRegex, options.separator);

    // Remove leading/trailing separators
    const trimRegex = new RegExp(`^\\${options.separator}+|\\${options.separator}+$`, "g");
    slug = slug.replace(trimRegex, "");

    // Limit length
    if (options.maxLength && slug.length > options.maxLength) {
        slug = slug.substring(0, options.maxLength);
        // Remove trailing separator after truncation
        slug = slug.replace(new RegExp(`\\${options.separator}+$`), "");
    }

    return slug;
}

export default function SlugGeneratorWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [options, setOptions] = useState<SlugOptions>({
        separator: "-",
        lowercase: true,
        removeSpecial: true,
        removeDiacritics: true,
        maxLength: null,
    });
    const [maxLengthInput, setMaxLengthInput] = useState("");
    const [copiedKey, setCopiedKey] = useState("");

    const slug = useMemo(() => {
        return generateSlug(input, options);
    }, [input, options]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadPreset = (preset: typeof PRESETS[0]) => {
        setInput(preset.text);
    };

    const updateMaxLength = (value: string) => {
        setMaxLengthInput(value);
        const num = parseInt(value);
        setOptions((prev) => ({
            ...prev,
            maxLength: value === "" || isNaN(num) ? null : num,
        }));
    };

    return (
        <>
            <div className="sg-root">
                {/* Command Bar */}
                <div className="sg-cmd">
                    <div className="sg-cmd-left">
                        <span className="sg-cmd-label">Examples</span>
                        {PRESETS.map((p) => (
                            <button key={p.id} className="sg-preset-btn" onClick={() => loadPreset(p)}>
                                <i className="ti ti-link" />
                                <span className="sg-preset-label">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    {slug && (
                        <div className="sg-cmd-right">
                            <span className="sg-stats">
                                <i className="ti ti-check" />
                                {slug.length} chars
                            </span>
                        </div>
                    )}
                </div>

                {/* Options Panel */}
                <div className="sg-options">
                    <div className="sg-options-row">
                        <span className="sg-options-label">Separator</span>
                        <div className="sg-separator-group">
                            {(["-", "_", "."] as Separator[]).map((sep) => (
                                <button
                                    key={sep}
                                    className={`sg-sep-btn${options.separator === sep ? " --on" : ""}`}
                                    onClick={() => setOptions((prev) => ({ ...prev, separator: sep }))}
                                >
                                    {sep === "-" && "Hyphen (-)"}
                                    {sep === "_" && "Underscore (_)"}
                                    {sep === "." && "Dot (.)"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sg-options-row">
                        <span className="sg-options-label">Options</span>
                        <div className="sg-toggles">
                            <label className="sg-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.lowercase}
                                    onChange={(e) => setOptions((prev) => ({ ...prev, lowercase: e.target.checked }))}
                                />
                                <span className="sg-toggle-label">Lowercase</span>
                            </label>
                            <label className="sg-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.removeSpecial}
                                    onChange={(e) => setOptions((prev) => ({ ...prev, removeSpecial: e.target.checked }))}
                                />
                                <span className="sg-toggle-label">Remove special characters</span>
                            </label>
                            <label className="sg-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.removeDiacritics}
                                    onChange={(e) => setOptions((prev) => ({ ...prev, removeDiacritics: e.target.checked }))}
                                />
                                <span className="sg-toggle-label">Remove diacritics (é → e)</span>
                            </label>
                        </div>
                    </div>

                    <div className="sg-options-row">
                        <span className="sg-options-label">Max Length</span>
                        <input
                            type="number"
                            className="sg-number-input"
                            value={maxLengthInput}
                            onChange={(e) => updateMaxLength(e.target.value)}
                            placeholder="No limit"
                            min="1"
                        />
                    </div>
                </div>

                <div className="sg-body">
                    {/* Input */}
                    <div className="sg-section">
                        <div className="sg-section-header">
                            <div className="sg-section-title">
                                <i className="ti ti-pencil" />
                                Input Text
                            </div>
                            {input && (
                                <div className="sg-section-actions">
                                    <span className="sg-len">{input.length} chars</span>
                                    <button className="sg-icon-btn" onClick={() => setInput("")} title="Clear">
                                        <i className="ti ti-x" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <textarea
                            className="sg-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to convert to URL-friendly slug..."
                            rows={4}
                        />
                    </div>

                    {/* Empty State */}
                    {!input && (
                        <div className="sg-empty">
                            <div className="sg-empty-icon">
                                <i className="ti ti-link" />
                            </div>
                            <p className="sg-empty-title">Generate URL-Friendly Slugs</p>
                            <p className="sg-empty-desc">
                                Convert any text into clean, SEO-friendly URL slugs
                            </p>
                        </div>
                    )}

                    {/* Result */}
                    {slug && (
                        <div className="sg-section">
                            <div className="sg-section-header">
                                <div className="sg-section-title">
                                    <i className="ti ti-sparkles" />
                                    Generated Slug
                                </div>
                                <button
                                    className={`sg-copy-btn${copiedKey === "slug" ? " --done" : ""}`}
                                    onClick={() => copy(slug, "slug")}
                                >
                                    <i className={`ti ${copiedKey === "slug" ? "ti-check" : "ti-copy"}`} />
                                    {copiedKey === "slug" ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <div className="sg-result">
                                <div className="sg-result-preview">
                                    <span className="sg-result-domain">example.com/</span>
                                    <span className="sg-result-slug">{slug}</span>
                                </div>
                                <div className="sg-result-value">{slug}</div>
                            </div>

                            {/* Stats */}
                            <div className="sg-result-stats">
                                <div className="sg-stat">
                                    <span className="sg-stat-label">Length</span>
                                    <span className="sg-stat-value">{slug.length}</span>
                                </div>
                                <div className="sg-stat">
                                    <span className="sg-stat-label">Reduction</span>
                                    <span className="sg-stat-value">
                                        {Math.round(((input.length - slug.length) / input.length) * 100)}%
                                    </span>
                                </div>
                                <div className="sg-stat">
                                    <span className="sg-stat-label">Separator</span>
                                    <span className="sg-stat-value sg-stat-value--mono">{options.separator}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sg-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .sg-root {
                    --sg-radius-sm: 6px;
                    --sg-radius-md: 8px;
                    --sg-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .sg-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .sg-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .sg-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .sg-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .sg-preset-btn i {
                    font-size: 13px;
                }

                .sg-stats {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand);
                    border: 0.5px solid var(--brand-border);
                    font-size: 11px;
                    font-weight: 600;
                }

                .sg-stats i {
                    font-size: 13px;
                }

                .sg-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .sg-options-row {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 12px;
                    align-items: center;
                }

                .sg-options-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .sg-separator-group {
                    display: flex;
                    gap: 4px;
                }

                .sg-sep-btn {
                    flex: 1;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-sep-btn:hover {
                    background: var(--bg-surface);
                }

                .sg-sep-btn.--on {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .sg-toggles {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sg-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .sg-toggle input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: var(--brand);
                }

                .sg-toggle-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .sg-number-input {
                    width: 120px;
                    height: 32px;
                    padding: 0 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-md);
                    font-size: 12px;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .sg-number-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .sg-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .sg-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sg-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .sg-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .sg-section-title i {
                    font-size: 14px;
                }

                .sg-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .sg-len {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .sg-icon-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.1s;
                }

                .sg-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .sg-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--text);
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .sg-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .sg-input::placeholder {
                    color: var(--text-disabled);
                }

                .sg-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .sg-empty-icon {
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

                .sg-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .sg-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                }

                .sg-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: var(--sg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sg-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .sg-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .sg-copy-btn i {
                    font-size: 12px;
                }

                .sg-result {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 14px 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-md);
                }

                .sg-result-preview {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border-radius: var(--sg-radius-sm);
                    font-family: var(--font-mono);
                    font-size: 12px;
                    overflow-x: auto;
                }

                .sg-result-domain {
                    color: var(--text-disabled);
                }

                .sg-result-slug {
                    color: var(--brand);
                    font-weight: 600;
                }

                .sg-result-value {
                    font-family: var(--font-mono);
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    word-break: break-all;
                }

                .sg-result-stats {
                    display: flex;
                    gap: 12px;
                    padding-top: 10px;
                    border-top: 0.5px solid var(--border);
                }

                .sg-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .sg-stat-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-disabled);
                }

                .sg-stat-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--brand);
                }

                .sg-stat-value--mono {
                    font-family: var(--font-mono);
                }

                .sg-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .sg-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .sg-cmd {
                        padding: 10px 12px;
                    }

                    .sg-cmd-label {
                        display: none;
                    }

                    .sg-preset-label {
                        display: none;
                    }

                    .sg-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .sg-options {
                        padding: 12px;
                    }

                    .sg-options-row {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .sg-body {
                        padding: 12px;
                    }

                    .sg-empty {
                        padding: 40px 20px;
                    }
                }
            `}</style>
        </>
    );
}