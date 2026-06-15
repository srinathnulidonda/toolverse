// features/dev/hash-generator/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import crypto from "crypto-js";

type Algorithm = "MD5" | "SHA1" | "SHA256" | "SHA512" | "SHA3";

interface HashResult {
    algorithm: Algorithm;
    hash: string;
    length: number;
}

const ALGORITHMS: { id: Algorithm; label: string; desc: string; icon: string }[] = [
    { id: "MD5", label: "MD5", desc: "128-bit hash (weak, legacy)", icon: "ti-shield-x" },
    { id: "SHA1", label: "SHA-1", desc: "160-bit hash (deprecated)", icon: "ti-shield-half" },
    { id: "SHA256", label: "SHA-256", desc: "256-bit hash (recommended)", icon: "ti-shield-check" },
    { id: "SHA512", label: "SHA-512", desc: "512-bit hash (most secure)", icon: "ti-shield-lock" },
    { id: "SHA3", label: "SHA-3", desc: "Latest standard (Keccak)", icon: "ti-shield-star" },
];

const PRESETS = [
    { id: "password", label: "Password", text: "MySecurePassword123!" },
    { id: "file", label: "File Content", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    { id: "api", label: "API Key", text: "sk_live_abc123def456ghi789jkl" },
];

function generateHash(text: string, algorithm: Algorithm): string {
    if (!text) return "";

    switch (algorithm) {
        case "MD5":
            return crypto.MD5(text).toString();
        case "SHA1":
            return crypto.SHA1(text).toString();
        case "SHA256":
            return crypto.SHA256(text).toString();
        case "SHA512":
            return crypto.SHA512(text).toString();
        case "SHA3":
            return crypto.SHA3(text).toString();
        default:
            return "";
    }
}

export default function HashGeneratorWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [selectedAlgorithms, setSelectedAlgorithms] = useState<Set<Algorithm>>(new Set(["SHA256"]));
    const [copiedKey, setCopiedKey] = useState("");

    const results = useMemo(() => {
        if (!input.trim()) return [];

        return Array.from(selectedAlgorithms).map((algorithm) => ({
            algorithm,
            hash: generateHash(input, algorithm),
            length: generateHash(input, algorithm).length,
        }));
    }, [input, selectedAlgorithms]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const toggleAlgorithm = (algorithm: Algorithm) => {
        setSelectedAlgorithms((prev) => {
            const next = new Set(prev);
            if (next.has(algorithm)) {
                if (next.size > 1) next.delete(algorithm);
            } else {
                next.add(algorithm);
            }
            return next;
        });
    };

    const loadPreset = (preset: typeof PRESETS[0]) => {
        setInput(preset.text);
    };

    return (
        <>
            <div className="hg-root">
                {/* Command Bar */}
                <div className="hg-cmd">
                    <div className="hg-cmd-left">
                        <span className="hg-cmd-label">Examples</span>
                        {PRESETS.map((p) => (
                            <button key={p.id} className="hg-preset-btn" onClick={() => loadPreset(p)}>
                                <i className="ti ti-hash" />
                                <span className="hg-preset-label">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    {results.length > 0 && (
                        <div className="hg-cmd-right">
                            <span className="hg-count">
                                <i className="ti ti-check" />
                                {results.length} hash{results.length !== 1 ? "es" : ""}
                            </span>
                        </div>
                    )}
                </div>

                {/* Algorithm Selection */}
                <div className="hg-algos">
                    <span className="hg-algos-label">Algorithms</span>
                    <div className="hg-algos-grid">
                        {ALGORITHMS.map((algo) => (
                            <button
                                key={algo.id}
                                className={`hg-algo${selectedAlgorithms.has(algo.id) ? " --on" : ""}`}
                                onClick={() => toggleAlgorithm(algo.id)}
                                title={algo.desc}
                            >
                                <i className={`ti ${algo.icon}`} />
                                <div className="hg-algo-info">
                                    <span className="hg-algo-name">{algo.label}</span>
                                    <span className="hg-algo-desc">{algo.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hg-body">
                    {/* Input */}
                    <div className="hg-section">
                        <div className="hg-section-header">
                            <div className="hg-section-title">
                                <i className="ti ti-text" />
                                Input Text
                            </div>
                            <div className="hg-section-actions">
                                {input && (
                                    <>
                                        <span className="hg-len">{input.length} chars</span>
                                        <button className="hg-icon-btn" onClick={() => setInput("")} title="Clear">
                                            <i className="ti ti-x" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <textarea
                            className="hg-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to generate hash..."
                            spellCheck={false}
                            rows={6}
                        />
                    </div>

                    {/* Empty State */}
                    {!input && (
                        <div className="hg-empty">
                            <div className="hg-empty-icon">
                                <i className="ti ti-hash" />
                            </div>
                            <p className="hg-empty-title">Generate Cryptographic Hashes</p>
                            <p className="hg-empty-desc">
                                Enter text above or try an example to generate MD5, SHA-1, SHA-256, SHA-512, and SHA-3 hashes
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="hg-section">
                            <div className="hg-section-header">
                                <div className="hg-section-title">
                                    <i className="ti ti-sparkles" />
                                    Generated Hashes
                                </div>
                            </div>
                            <div className="hg-results">
                                {results.map((result) => (
                                    <div key={result.algorithm} className="hg-result">
                                        <div className="hg-result-header">
                                            <div className="hg-result-info">
                                                <i className={`ti ${ALGORITHMS.find((a) => a.id === result.algorithm)?.icon}`} />
                                                <span className="hg-result-algo">{result.algorithm}</span>
                                                <span className="hg-result-length">{result.length} chars</span>
                                            </div>
                                            <button
                                                className={`hg-copy-btn${copiedKey === result.algorithm ? " --done" : ""}`}
                                                onClick={() => copy(result.hash, result.algorithm)}
                                            >
                                                <i className={`ti ${copiedKey === result.algorithm ? "ti-check" : "ti-copy"}`} />
                                                {copiedKey === result.algorithm ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="hg-result-hash">{result.hash}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="hg-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .hg-root {
                    --hg-radius-sm: 6px;
                    --hg-radius-md: 8px;
                    --hg-radius-lg: 12px;
                    --hg-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .hg-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .hg-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .hg-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hg-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .hg-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--hg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .hg-preset-btn i {
                    font-size: 13px;
                }

                .hg-count {
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

                .hg-count i {
                    font-size: 13px;
                }

                .hg-algos {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hg-algos-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-tertiary);
                }

                .hg-algos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 6px;
                }

                .hg-algo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    border-radius: var(--hg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.12s;
                    text-align: left;
                }

                .hg-algo:hover {
                    background: var(--bg-surface);
                    border-color: var(--brand-border);
                }

                .hg-algo.--on {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .hg-algo i {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .hg-algo-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .hg-algo-name {
                    font-size: 12px;
                    font-weight: 600;
                }

                .hg-algo-desc {
                    font-size: 10px;
                    color: var(--text-disabled);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .hg-algo.--on .hg-algo-desc {
                    color: var(--brand-text);
                    opacity: 0.7;
                }

                .hg-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .hg-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .hg-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .hg-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .hg-section-title i {
                    font-size: 14px;
                }

                .hg-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hg-len {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .hg-icon-btn {
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

                .hg-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hg-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--text);
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .hg-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .hg-input::placeholder {
                    color: var(--text-disabled);
                }

                .hg-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .hg-empty-icon {
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

                .hg-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .hg-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 380px;
                    line-height: 1.6;
                }

                .hg-results {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .hg-result {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                }

                .hg-result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .hg-result-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hg-result-info i {
                    font-size: 16px;
                    color: var(--brand);
                }

                .hg-result-algo {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .hg-result-length {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .hg-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 24px;
                    padding: 0 9px;
                    border-radius: var(--hg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-copy-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .hg-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .hg-copy-btn i {
                    font-size: 12px;
                }

                .hg-result-hash {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.6;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border-radius: var(--hg-radius-sm);
                }

                .hg-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .hg-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .hg-cmd {
                        padding: 10px 12px;
                    }

                    .hg-cmd-label {
                        display: none;
                    }

                    .hg-preset-label {
                        display: none;
                    }

                    .hg-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .hg-algos {
                        padding: 12px;
                    }

                    .hg-algos-grid {
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    }

                    .hg-algo-desc {
                        font-size: 9px;
                    }

                    .hg-body {
                        padding: 12px;
                    }

                    .hg-empty {
                        padding: 40px 20px;
                    }
                }
            `}</style>
        </>
    );
}