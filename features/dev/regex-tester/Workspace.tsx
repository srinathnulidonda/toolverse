// features/dev/regex-tester/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";

type Flag = "g" | "i" | "m" | "s" | "u" | "y";

interface Match {
    match: string;
    index: number;
    groups: string[];
}

const PRESETS = [
    { id: "email", label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", test: "john.doe@example.com, jane@test.co.uk" },
    { id: "url", label: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", test: "Visit https://example.com or http://test.org" },
    { id: "phone", label: "Phone", pattern: "\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}", test: "+1 (555) 123-4567, 555-1234" },
    { id: "hex", label: "Hex Color", pattern: "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b", test: "#ff5733, #fff, #00FF00" },
];

const FLAGS: { id: Flag; label: string; desc: string }[] = [
    { id: "g", label: "Global", desc: "Find all matches" },
    { id: "i", label: "Case Insensitive", desc: "Ignore case" },
    { id: "m", label: "Multiline", desc: "^ and $ match line breaks" },
    { id: "s", label: "Dot All", desc: ". matches newlines" },
    { id: "u", label: "Unicode", desc: "Treat as Unicode" },
    { id: "y", label: "Sticky", desc: "Match from lastIndex" },
];

export default function RegexTesterWorkspace({ tool }: { tool: Tool }) {
    const [pattern, setPattern] = useState("");
    const [testString, setTestString] = useState("");
    const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
    const [copiedKey, setCopiedKey] = useState("");

    const patternRef = useRef<HTMLTextAreaElement>(null);
    const testRef = useRef<HTMLTextAreaElement>(null);

    const result = useMemo(() => {
        if (!pattern || !testString) return { matches: [], error: null, valid: true };

        try {
            const flagStr = Array.from(flags).join("");
            const regex = new RegExp(pattern, flagStr);
            const matches: Match[] = [];

            if (flags.has("g")) {
                let match;
                while ((match = regex.exec(testString)) !== null) {
                    matches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                    if (!flags.has("g")) break;
                }
            } else {
                const match = regex.exec(testString);
                if (match) {
                    matches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                }
            }

            return { matches, error: null, valid: true };
        } catch (e: any) {
            return { matches: [], error: e.message, valid: false };
        }
    }, [pattern, testString, flags]);

    const highlightedText = useMemo(() => {
        if (!testString || result.matches.length === 0) return testString;

        const parts: { text: string; match: boolean }[] = [];
        let lastIndex = 0;

        result.matches.forEach((m) => {
            if (m.index > lastIndex) {
                parts.push({ text: testString.slice(lastIndex, m.index), match: false });
            }
            parts.push({ text: m.match, match: true });
            lastIndex = m.index + m.match.length;
        });

        if (lastIndex < testString.length) {
            parts.push({ text: testString.slice(lastIndex), match: false });
        }

        return parts;
    }, [testString, result.matches]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const toggleFlag = (flag: Flag) => {
        setFlags((prev) => {
            const next = new Set(prev);
            if (next.has(flag)) next.delete(flag);
            else next.add(flag);
            return next;
        });
    };

    const loadPreset = (preset: typeof PRESETS[0]) => {
        setPattern(preset.pattern);
        setTestString(preset.test);
        setFlags(new Set(["g", "i"] as Flag[]));
    };

    return (
        <>
            <div className="rt-root">
                {/* Command Bar */}
                <div className="rt-cmd">
                    <div className="rt-cmd-left">
                        <span className="rt-cmd-label">Examples</span>
                        {PRESETS.map((p) => (
                            <button key={p.id} className="rt-preset-btn" onClick={() => loadPreset(p)}>
                                <i className={`ti ti-${p.id === "email" ? "mail" : p.id === "url" ? "link" : p.id === "phone" ? "phone" : "palette"}`} />
                                <span className="rt-preset-label">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="rt-cmd-right">
                        {result.matches.length > 0 && (
                            <span className="rt-match-count">
                                <i className="ti ti-check" />
                                {result.matches.length} match{result.matches.length !== 1 ? "es" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* Flags */}
                <div className="rt-flags">
                    <span className="rt-flags-label">Flags</span>
                    <div className="rt-flags-list">
                        {FLAGS.map((f) => (
                            <button
                                key={f.id}
                                className={`rt-flag${flags.has(f.id) ? " --on" : ""}`}
                                onClick={() => toggleFlag(f.id)}
                                title={f.desc}
                            >
                                <span className="rt-flag-id">{f.id}</span>
                                <span className="rt-flag-name">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rt-body">
                    {/* Pattern Input */}
                    <div className="rt-section">
                        <div className="rt-section-header">
                            <div className="rt-section-title">
                                <i className="ti ti-code" />
                                Regular Expression
                            </div>
                            <div className="rt-section-actions">
                                {pattern && (
                                    <>
                                        <span className="rt-len">{pattern.length} chars</span>
                                        <button className="rt-icon-btn" onClick={() => setPattern("")} title="Clear">
                                            <i className="ti ti-x" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="rt-input-wrap">
                            <span className="rt-regex-slash">/</span>
                            <textarea
                                ref={patternRef}
                                className="rt-input rt-pattern"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                placeholder="Enter your regex pattern..."
                                spellCheck={false}
                                rows={3}
                            />
                            <span className="rt-regex-slash">/{Array.from(flags).join("")}</span>
                        </div>
                        {result.error && (
                            <div className="rt-error">
                                <i className="ti ti-alert-circle" />
                                {result.error}
                            </div>
                        )}
                    </div>

                    {/* Test String */}
                    <div className="rt-section">
                        <div className="rt-section-header">
                            <div className="rt-section-title">
                                <i className="ti ti-text" />
                                Test String
                            </div>
                            <div className="rt-section-actions">
                                {testString && (
                                    <>
                                        <span className="rt-len">{testString.length} chars</span>
                                        <button className="rt-icon-btn" onClick={() => setTestString("")} title="Clear">
                                            <i className="ti ti-x" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <textarea
                            ref={testRef}
                            className="rt-input"
                            value={testString}
                            onChange={(e) => setTestString(e.target.value)}
                            placeholder="Enter text to test against your pattern..."
                            spellCheck={false}
                            rows={6}
                        />
                    </div>

                    {/* Highlighted Result */}
                    {testString && result.valid && (
                        <div className="rt-section">
                            <div className="rt-section-header">
                                <div className="rt-section-title">
                                    <i className="ti ti-highlight" />
                                    Match Highlighting
                                </div>
                                {result.matches.length > 0 && (
                                    <button
                                        className={`rt-copy-btn${copiedKey === "matches" ? " --done" : ""}`}
                                        onClick={() => copy(result.matches.map((m) => m.match).join("\n"), "matches")}
                                    >
                                        <i className={`ti ${copiedKey === "matches" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "matches" ? "Copied" : "Copy Matches"}
                                    </button>
                                )}
                            </div>
                            <div className="rt-highlight">
                                {highlightedText ? (
                                    Array.isArray(highlightedText) ? (
                                        highlightedText.map((part, i) => (
                                            <span key={i} className={part.match ? "rt-hl-match" : ""}>
                                                {part.text}
                                            </span>
                                        ))
                                    ) : (
                                        highlightedText
                                    )
                                ) : (
                                    <span className="rt-hl-empty">No matches found</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Matches Table */}
                    {result.matches.length > 0 && (
                        <div className="rt-section">
                            <div className="rt-section-header">
                                <div className="rt-section-title">
                                    <i className="ti ti-list" />
                                    Matches ({result.matches.length})
                                </div>
                            </div>
                            <div className="rt-table-wrap">
                                <table className="rt-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Match</th>
                                            <th>Index</th>
                                            <th>Groups</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.matches.map((m, i) => (
                                            <tr key={i}>
                                                <td className="rt-t-num">{i + 1}</td>
                                                <td className="rt-t-match">{m.match}</td>
                                                <td className="rt-t-index">{m.index}</td>
                                                <td className="rt-t-groups">
                                                    {m.groups.length > 0 ? m.groups.join(", ") : <em>—</em>}
                                                </td>
                                                <td>
                                                    <button
                                                        className={`rt-mini-copy${copiedKey === `m${i}` ? " --ok" : ""}`}
                                                        onClick={() => copy(m.match, `m${i}`)}
                                                    >
                                                        <i className={`ti ${copiedKey === `m${i}` ? "ti-check" : "ti-copy"}`} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="rt-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>
            </div>

            <style jsx>{`
                .rt-root {
                    --rt-radius-sm: 6px;
                    --rt-radius-md: 8px;
                    --rt-radius-lg: 12px;
                    --rt-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rt-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .rt-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .rt-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .rt-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .rt-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--rt-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rt-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .rt-preset-btn i {
                    font-size: 13px;
                }

                .rt-match-count {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand);
                    border: 0.5px solid var(--brand-border);
                    font-size: 11px;
                    font-weight: 600;
                }

                .rt-match-count i {
                    font-size: 13px;
                }

                .rt-flags {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .rt-flags-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-tertiary);
                }

                .rt-flags-list {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .rt-flag {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 9px;
                    border-radius: var(--rt-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rt-flag:hover {
                    background: var(--bg-surface);
                }

                .rt-flag.--on {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .rt-flag-id {
                    font-family: var(--font-mono);
                    font-weight: 700;
                    font-size: 10px;
                }

                .rt-flag-name {
                    font-weight: 500;
                }

                .rt-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .rt-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .rt-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .rt-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .rt-section-title i {
                    font-size: 14px;
                }

                .rt-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .rt-len {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .rt-icon-btn {
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

                .rt-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rt-input-wrap {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rt-radius-md);
                    transition: border-color 0.12s;
                }

                .rt-input-wrap:focus-within {
                    border-color: var(--brand-border);
                }

                .rt-regex-slash {
                    font-family: var(--font-mono);
                    font-size: 18px;
                    color: var(--text-tertiary);
                    line-height: 1.5;
                    flex-shrink: 0;
                }

                .rt-input {
                    flex: 1;
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rt-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--text);
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .rt-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .rt-input::placeholder {
                    color: var(--text-disabled);
                }

                .rt-pattern {
                    border: none;
                    padding: 0;
                    background: transparent;
                }

                .rt-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 7px;
                    padding: 10px 12px;
                    background: #fef2f2;
                    border: 0.5px solid #fecaca;
                    border-radius: var(--rt-radius-md);
                    color: #991b1b;
                    font-size: 12px;
                    line-height: 1.5;
                }

                @media (prefers-color-scheme: dark) {
                    .rt-error {
                        background: #1c0a0a;
                        border-color: #7f1d1d;
                        color: #f87171;
                    }
                }

                .rt-error i {
                    font-size: 14px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .rt-highlight {
                    padding: 14px 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rt-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.8;
                    color: var(--text);
                    white-space: pre-wrap;
                    word-break: break-all;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .rt-hl-match {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-radius: 3px;
                    padding: 1px 3px;
                    font-weight: 600;
                }

                .rt-hl-empty {
                    color: var(--text-disabled);
                    font-style: italic;
                }

                .rt-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: var(--rt-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rt-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rt-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .rt-copy-btn i {
                    font-size: 12px;
                }

                .rt-table-wrap {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--rt-radius-md);
                    overflow: hidden;
                }

                .rt-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                .rt-table thead th {
                    text-align: left;
                    padding: 9px 12px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-disabled);
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .rt-table thead th:first-child {
                    width: 40px;
                }

                .rt-table thead th:last-child {
                    width: 40px;
                }

                .rt-table tbody tr {
                    transition: background 0.1s;
                }

                .rt-table tbody tr:hover {
                    background: var(--bg-surface);
                }

                .rt-table td {
                    padding: 10px 12px;
                    border-bottom: 0.5px solid var(--border);
                }

                .rt-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .rt-t-num {
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                    font-size: 11px;
                }

                .rt-t-match {
                    font-family: var(--font-mono);
                    color: var(--brand);
                    font-weight: 600;
                }

                .rt-t-index {
                    font-family: var(--font-mono);
                    color: var(--text-tertiary);
                    font-size: 11px;
                }

                .rt-t-groups {
                    color: var(--text-secondary);
                    font-size: 11px;
                }

                .rt-mini-copy {
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
                    opacity: 0;
                    transition: opacity 0.1s;
                }

                .rt-table tbody tr:hover .rt-mini-copy {
                    opacity: 1;
                }

                .rt-mini-copy:hover {
                    color: var(--brand);
                }

                .rt-mini-copy.--ok {
                    opacity: 1;
                    color: var(--brand);
                }

                .rt-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .rt-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .rt-cmd {
                        padding: 10px 12px;
                    }

                    .rt-cmd-label {
                        display: none;
                    }

                    .rt-preset-label {
                        display: none;
                    }

                    .rt-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .rt-flags {
                        flex-wrap: wrap;
                    }

                    .rt-flag-name {
                        display: none;
                    }

                    .rt-body {
                        padding: 12px;
                    }

                    .rt-table-wrap {
                        overflow-x: auto;
                    }
                }
            `}</style>
        </>
    );
}