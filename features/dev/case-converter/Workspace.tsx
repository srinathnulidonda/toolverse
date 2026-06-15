// features/dev/case-converter/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";

type CaseType = "camel" | "pascal" | "snake" | "kebab" | "constant" | "title" | "sentence" | "lower" | "upper";

const CASES: { id: CaseType; label: string; icon: string; example: string }[] = [
    { id: "camel", label: "camelCase", icon: "ti-letter-case", example: "helloWorldExample" },
    { id: "pascal", label: "PascalCase", icon: "ti-letter-case-upper", example: "HelloWorldExample" },
    { id: "snake", label: "snake_case", icon: "ti-underline", example: "hello_world_example" },
    { id: "kebab", label: "kebab-case", icon: "ti-minus", example: "hello-world-example" },
    { id: "constant", label: "CONSTANT_CASE", icon: "ti-text-size", example: "HELLO_WORLD_EXAMPLE" },
    { id: "title", label: "Title Case", icon: "ti-alphabet-latin", example: "Hello World Example" },
    { id: "sentence", label: "Sentence case", icon: "ti-dots", example: "Hello world example" },
    { id: "lower", label: "lowercase", icon: "ti-letter-a", example: "hello world example" },
    { id: "upper", label: "UPPERCASE", icon: "ti-letter-b", example: "HELLO WORLD EXAMPLE" },
];

function convertCase(text: string, caseType: CaseType): string {
    if (!text) return "";

    // Normalize: split by spaces, underscores, hyphens, or camelCase boundaries
    const words = text
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    switch (caseType) {
        case "camel":
            return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join("");
        case "pascal":
            return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
        case "snake":
            return words.join("_");
        case "kebab":
            return words.join("-");
        case "constant":
            return words.join("_").toUpperCase();
        case "title":
            return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        case "sentence":
            const sentence = words.join(" ");
            return sentence.charAt(0).toUpperCase() + sentence.slice(1);
        case "lower":
            return words.join(" ");
        case "upper":
            return words.join(" ").toUpperCase();
        default:
            return text;
    }
}

export default function CaseConverterWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [copiedKey, setCopiedKey] = useState("");

    const results = useMemo(() => {
        if (!input.trim()) return [];
        return CASES.map((c) => ({
            ...c,
            converted: convertCase(input, c.id),
        }));
    }, [input]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    return (
        <>
            <div className="cc-root">
                <div className="cc-cmd">
                    <div className="cc-cmd-title">
                        <i className="ti ti-letter-case" />
                        Case Converter
                    </div>
                    {results.length > 0 && (
                        <span className="cc-count">
                            <i className="ti ti-check" />
                            {results.length} formats
                        </span>
                    )}
                </div>

                <div className="cc-body">
                    <div className="cc-section">
                        <div className="cc-section-header">
                            <div className="cc-section-title">
                                <i className="ti ti-pencil" />
                                Input Text
                            </div>
                            {input && (
                                <button className="cc-icon-btn" onClick={() => setInput("")} title="Clear">
                                    <i className="ti ti-x" />
                                </button>
                            )}
                        </div>
                        <textarea
                            className="cc-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to convert case..."
                            rows={4}
                        />
                    </div>

                    {!input && (
                        <div className="cc-empty">
                            <div className="cc-empty-icon">
                                <i className="ti ti-letter-case" />
                            </div>
                            <p className="cc-empty-title">Convert Text Case</p>
                            <p className="cc-empty-desc">
                                Convert text between camelCase, snake_case, kebab-case, and more
                            </p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="cc-section">
                            <div className="cc-section-header">
                                <div className="cc-section-title">
                                    <i className="ti ti-sparkles" />
                                    Converted Cases
                                </div>
                            </div>
                            <div className="cc-results">
                                {results.map((r) => (
                                    <div key={r.id} className="cc-result">
                                        <div className="cc-result-header">
                                            <div className="cc-result-info">
                                                <i className={`ti ${r.icon}`} />
                                                <span className="cc-result-label">{r.label}</span>
                                                <span className="cc-result-example">{r.example}</span>
                                            </div>
                                            <button
                                                className={`cc-copy-btn${copiedKey === r.id ? " --done" : ""}`}
                                                onClick={() => copy(r.converted, r.id)}
                                            >
                                                <i className={`ti ${copiedKey === r.id ? "ti-check" : "ti-copy"}`} />
                                                {copiedKey === r.id ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="cc-result-value">{r.converted}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="cc-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                /* Same structure as previous tools - apply design tokens */
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
                    justify-content: space-between;
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .cc-cmd-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .cc-count {
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

                .cc-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .cc-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .cc-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .cc-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .cc-icon-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: none;
                    background: transparent;
                    color: var(--text-disabled);
                    cursor: pointer;
                    transition: all 0.1s;
                }

                .cc-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .cc-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    resize: vertical;
                }

                .cc-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .cc-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .cc-empty-icon {
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

                .cc-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .cc-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                }

                .cc-results {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .cc-result {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--cc-radius-md);
                }

                .cc-result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .cc-result-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .cc-result-info i {
                    font-size: 16px;
                    color: var(--brand);
                }

                .cc-result-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                }

                .cc-result-example {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .cc-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 24px;
                    padding: 0 9px;
                    border-radius: var(--cc-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .cc-copy-btn:hover {
                    background: var(--bg-card);
                }

                .cc-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .cc-result-value {
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text);
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border-radius: var(--cc-radius-sm);
                }

                .cc-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                @media (max-width: 768px) {
                    .cc-body {
                        padding: 12px;
                    }
                    .cc-empty {
                        padding: 40px 20px;
                    }
                }
            `}</style>
        </>
    );
}