// features/dev/json-validator/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";

interface ValidationResult {
    valid: boolean;
    error?: {
        message: string;
        line?: number;
        column?: number;
    };
    stats?: {
        size: number;
        lines: number;
        depth: number;
        keys: number;
    };
}

const SAMPLE_VALID = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "roles": ["user", "admin"],
  "metadata": {
    "createdAt": "2024-01-15",
    "lastLogin": "2024-01-20"
  }
}`;

const SAMPLE_INVALID = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "roles": ["user", "admin"],
  "metadata": {
    "createdAt": "2024-01-15",
    "lastLogin": "2024-01-20"
  }
}`;

function getMaxDepth(obj: any, depth = 1): number {
    if (typeof obj !== 'object' || obj === null) return depth;
    const depths = Object.values(obj).map(val => getMaxDepth(val, depth + 1));
    return Math.max(depth, ...depths);
}

function countKeys(obj: any): number {
    if (typeof obj !== 'object' || obj === null) return 0;
    let count = Object.keys(obj).length;
    Object.values(obj).forEach(val => {
        count += countKeys(val);
    });
    return count;
}

function validateJSON(input: string): ValidationResult {
    if (!input.trim()) {
        return { valid: false, error: { message: "Input is empty" } };
    }

    try {
        const parsed = JSON.parse(input);
        const lines = input.split('\n').length;
        const size = new Blob([input]).size;

        return {
            valid: true,
            stats: {
                size,
                lines,
                depth: getMaxDepth(parsed),
                keys: countKeys(parsed),
            },
        };
    } catch (e: any) {
        const message = e.message;
        const match = message.match(/position (\d+)/);
        let line: number | undefined;
        let column: number | undefined;

        if (match) {
            const position = parseInt(match[1]);
            const upToError = input.substring(0, position);
            line = upToError.split('\n').length;
            column = upToError.split('\n').pop()?.length || 0;
        }

        return {
            valid: false,
            error: {
                message: message.replace(/JSON\.parse: /, '').replace(/in JSON at position \d+/, '').trim(),
                line,
                column,
            },
        };
    }
}

export default function JSONValidatorWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [copiedKey, setCopiedKey] = useState("");

    const result = useMemo(() => validateJSON(input), [input]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadSample = (valid: boolean) => {
        setInput(valid ? SAMPLE_VALID : SAMPLE_INVALID);
    };

    const formatJSON = () => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 2));
        } catch (e) {
            // Do nothing if invalid
        }
    };

    return (
        <>
            <div className="jv-root">
                {/* Command Bar */}
                <div className="jv-cmd">
                    <div className="jv-cmd-left">
                        <span className="jv-cmd-label">Examples</span>
                        <button className="jv-preset-btn" onClick={() => loadSample(true)}>
                            <i className="ti ti-check" />
                            <span className="jv-preset-label">Valid JSON</span>
                        </button>
                        <button className="jv-preset-btn" onClick={() => loadSample(false)}>
                            <i className="ti ti-x" />
                            <span className="jv-preset-label">Invalid JSON</span>
                        </button>
                    </div>
                    <div className="jv-cmd-right">
                        {result.valid && (
                            <>
                                <button className="jv-action-btn" onClick={formatJSON}>
                                    <i className="ti ti-text-wrap" />
                                    Format
                                </button>
                                <button
                                    className={`jv-copy-btn${copiedKey === "json" ? " --done" : ""}`}
                                    onClick={() => copy(input, "json")}
                                >
                                    <i className={`ti ${copiedKey === "json" ? "ti-check" : "ti-copy"}`} />
                                    {copiedKey === "json" ? "Copied" : "Copy"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                {input && (
                    <div className={`jv-status jv-status--${result.valid ? "valid" : "invalid"}`}>
                        <div className="jv-status-left">
                            <i className={`ti ${result.valid ? "ti-circle-check" : "ti-alert-circle"}`} />
                            <span className="jv-status-label">
                                {result.valid ? "Valid JSON" : "Invalid JSON"}
                            </span>
                        </div>
                        {result.valid && result.stats && (
                            <div className="jv-status-right">
                                <span className="jv-status-stat">{result.stats.size} bytes</span>
                                <span className="jv-status-stat">{result.stats.lines} lines</span>
                                <span className="jv-status-stat">{result.stats.keys} keys</span>
                                <span className="jv-status-stat">Depth: {result.stats.depth}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="jv-body">
                    {/* Input */}
                    <div className="jv-section">
                        <div className="jv-section-header">
                            <div className="jv-section-title">
                                <i className="ti ti-braces" />
                                JSON Input
                            </div>
                            {input && (
                                <button className="jv-icon-btn" onClick={() => setInput("")} title="Clear">
                                    <i className="ti ti-x" />
                                </button>
                            )}
                        </div>
                        <textarea
                            className={`jv-input${input && !result.valid ? " jv-input--error" : ""}`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your JSON here..."
                            spellCheck={false}
                            rows={16}
                        />
                    </div>

                    {/* Error Display */}
                    {!result.valid && result.error && (
                        <div className="jv-error-section">
                            <div className="jv-error-header">
                                <i className="ti ti-alert-triangle" />
                                Validation Error
                            </div>
                            <div className="jv-error-body">
                                <div className="jv-error-message">{result.error.message}</div>
                                {result.error.line && (
                                    <div className="jv-error-location">
                                        Line {result.error.line}
                                        {result.error.column && `, Column ${result.error.column}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {result.valid && result.stats && (
                        <div className="jv-success-section">
                            <div className="jv-success-icon">
                                <i className="ti ti-circle-check" />
                            </div>
                            <p className="jv-success-title">Valid JSON Structure</p>
                            <div className="jv-stats-grid">
                                <div className="jv-stat-card">
                                    <div className="jv-stat-value">{result.stats.size}</div>
                                    <div className="jv-stat-label">Bytes</div>
                                </div>
                                <div className="jv-stat-card">
                                    <div className="jv-stat-value">{result.stats.lines}</div>
                                    <div className="jv-stat-label">Lines</div>
                                </div>
                                <div className="jv-stat-card">
                                    <div className="jv-stat-value">{result.stats.keys}</div>
                                    <div className="jv-stat-label">Keys</div>
                                </div>
                                <div className="jv-stat-card">
                                    <div className="jv-stat-value">{result.stats.depth}</div>
                                    <div className="jv-stat-label">Max Depth</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!input && (
                        <div className="jv-empty">
                            <div className="jv-empty-icon">
                                <i className="ti ti-braces" />
                            </div>
                            <p className="jv-empty-title">Validate JSON Syntax</p>
                            <p className="jv-empty-desc">
                                Paste your JSON to check for syntax errors and view structure statistics
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="jv-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .jv-root {
                    --jv-radius-sm: 6px;
                    --jv-radius-md: 8px;
                    --jv-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jv-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .jv-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .jv-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .jv-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .jv-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .jv-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--jv-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jv-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jv-preset-btn i {
                    font-size: 13px;
                }

                .jv-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--jv-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jv-action-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jv-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--jv-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jv-copy-btn:hover {
                    background: var(--bg-surface);
                }

                .jv-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jv-copy-btn i {
                    font-size: 13px;
                }

                .jv-status {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                }

                .jv-status--valid {
                    background: #f0fdf4;
                    color: #166534;
                }

                .jv-status--invalid {
                    background: #fef2f2;
                    color: #991b1b;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-status--valid {
                        background: #052e16;
                        color: #4ade80;
                    }
                    .jv-status--invalid {
                        background: #1c0a0a;
                        color: #f87171;
                    }
                }

                .jv-status-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .jv-status-left i {
                    font-size: 16px;
                }

                .jv-status-label {
                    font-size: 13px;
                    font-weight: 600;
                }

                .jv-status-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .jv-status-stat {
                    font-size: 11px;
                    font-weight: 500;
                    font-family: var(--font-mono);
                }

                .jv-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .jv-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .jv-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .jv-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .jv-section-title i {
                    font-size: 14px;
                }

                .jv-icon-btn {
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

                .jv-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jv-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jv-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--text);
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .jv-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .jv-input--error {
                    border-color: #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-input--error {
                        border-color: #f87171;
                    }
                }

                .jv-input::placeholder {
                    color: var(--text-disabled);
                }

                .jv-error-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 14px 16px;
                    background: #fef2f2;
                    border: 0.5px solid #fecaca;
                    border-radius: var(--jv-radius-md);
                }

                @media (prefers-color-scheme: dark) {
                    .jv-error-section {
                        background: #1c0a0a;
                        border-color: #7f1d1d;
                    }
                }

                .jv-error-header {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #991b1b;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-error-header {
                        color: #f87171;
                    }
                }

                .jv-error-header i {
                    font-size: 16px;
                }

                .jv-error-body {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .jv-error-message {
                    font-size: 13px;
                    color: #991b1b;
                    font-family: var(--font-mono);
                    line-height: 1.5;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-error-message {
                        color: #f87171;
                    }
                }

                .jv-error-location {
                    font-size: 11px;
                    color: #7f1d1d;
                    font-family: var(--font-mono);
                    font-weight: 600;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-error-location {
                        color: #fca5a5;
                    }
                }

                .jv-success-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px 24px;
                    gap: 12px;
                    background: #f0fdf4;
                    border: 0.5px solid #bbf7d0;
                    border-radius: var(--jv-radius-md);
                }

                @media (prefers-color-scheme: dark) {
                    .jv-success-section {
                        background: #052e16;
                        border-color: #166534;
                    }
                }

                .jv-success-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #166534;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-success-icon {
                        background: #4ade80;
                        color: #052e16;
                    }
                }

                .jv-success-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #166534;
                    margin: 0;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-success-title {
                        color: #4ade80;
                    }
                }

                .jv-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 12px;
                    width: 100%;
                    max-width: 500px;
                    margin-top: 8px;
                }

                .jv-stat-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 12px;
                    background: white;
                    border: 0.5px solid #bbf7d0;
                    border-radius: var(--jv-radius-md);
                }

                @media (prefers-color-scheme: dark) {
                    .jv-stat-card {
                        background: #0a3d1f;
                        border-color: #166534;
                    }
                }

                .jv-stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #166534;
                    font-family: var(--font-mono);
                }

                @media (prefers-color-scheme: dark) {
                    .jv-stat-value {
                        color: #4ade80;
                    }
                }

                .jv-stat-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #15803d;
                }

                @media (prefers-color-scheme: dark) {
                    .jv-stat-label {
                        color: #86efac;
                    }
                }

                .jv-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .jv-empty-icon {
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

                .jv-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .jv-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                    line-height: 1.6;
                }

                .jv-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .jv-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .jv-cmd {
                        padding: 10px 12px;
                    }

                    .jv-cmd-label {
                        display: none;
                    }

                    .jv-preset-label {
                        display: none;
                    }

                    .jv-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .jv-status {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .jv-status-right {
                        gap: 8px;
                    }

                    .jv-body {
                        padding: 12px;
                    }

                    .jv-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </>
    );
}