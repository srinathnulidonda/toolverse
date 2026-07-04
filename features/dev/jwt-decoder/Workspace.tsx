// features/dev/jwt-decoder/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type React from "react";
import type { Tool } from "@/lib/tools";

interface JwtHeader {
    [key: string]: unknown;
    alg?: string;
    typ?: string;
}

interface JwtPayload {
    [key: string]: unknown;
    sub?: string;
    name?: string;
    iat?: number;
    exp?: number;
    nbf?: number;
}

interface DecodedJWT {
    header: JwtHeader | null;
    payload: JwtPayload | null;
    signature: string;
    valid: boolean;
    error?: string;
}

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzQ1Njc4OTB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const PRESETS = [
    { id: "standard", label: "Standard JWT", token: SAMPLE_JWT },
    { id: "auth", label: "Auth Token", token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNDUiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJ1c2VyIiwiYWRtaW4iXSwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE2OTAwMDM2MDB9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ" },
];

function base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    return decodeURIComponent(escape(atob(base64)));
}

function decodeJWT(token: string): DecodedJWT {
    try {
        const parts = token.trim().split(".");
        if (parts.length !== 3) {
            return { header: null, payload: null, signature: "", valid: false, error: "Invalid JWT format. Expected 3 parts separated by dots." };
        }

        const header = JSON.parse(base64UrlDecode(parts[0])) as JwtHeader;
        const payload = JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
        const signature = parts[2];

        return { header, payload, signature, valid: true };
    } catch (e: any) {
        return { header: null, payload: null, signature: "", valid: false, error: e.message };
    }
}

function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

export default function JWTDecoderWorkspace({ tool }: { tool: Tool }) {
    const [token, setToken] = useState("");
    const [copiedKey, setCopiedKey] = useState("");

    const decoded = useMemo(() => {
        if (!token.trim()) return null;
        return decodeJWT(token);
    }, [token]);

    const isExpired = useMemo(() => {
        if (!decoded?.valid || !decoded.payload?.exp) return null;
        return Date.now() / 1000 > decoded.payload.exp;
    }, [decoded]);

    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const loadPreset = (preset: typeof PRESETS[0]) => {
        setToken(preset.token);
    };

    const renderValue = (value: unknown): React.ReactElement => {
        if (value === null) return <em className="jwt-null">null</em>;
        if (value === undefined) return <em className="jwt-undefined">undefined</em>;
        if (typeof value === "boolean") return <span className="jwt-bool">{value.toString()}</span>;
        if (typeof value === "number") return <span className="jwt-num">{value}</span>;
        if (typeof value === "string") return <span className="jwt-str">"{value}"</span>;
        if (Array.isArray(value)) return <span className="jwt-arr">[{value.length} items]</span>;
        if (typeof value === "object") return <span className="jwt-obj">{"{…}"}</span>;
        return <span>{String(value)}</span>;
    };

    return (
        <>
            <div className="jwt-root">
                {/* Command Bar */}
                <div className="jwt-cmd">
                    <div className="jwt-cmd-left">
                        <span className="jwt-cmd-label">Examples</span>
                        {PRESETS.map((p) => (
                            <button key={p.id} className="jwt-preset-btn" onClick={() => loadPreset(p)}>
                                <i className="ti ti-key" />
                                <span className="jwt-preset-label">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    {decoded?.valid && (
                        <div className="jwt-cmd-right">
                            {isExpired !== null && (
                                <span className={`jwt-badge ${isExpired ? "jwt-badge--error" : "jwt-badge--success"}`}>
                                    <i className={`ti ${isExpired ? "ti-alert-circle" : "ti-circle-check"}`} />
                                    {isExpired ? "Expired" : "Valid"}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="jwt-body">
                    {/* Token Input */}
                    <div className="jwt-section">
                        <div className="jwt-section-header">
                            <div className="jwt-section-title">
                                <i className="ti ti-lock" />
                                JWT Token
                            </div>
                            <div className="jwt-section-actions">
                                {token && (
                                    <>
                                        <span className="jwt-len">{token.length} chars</span>
                                        <button className="jwt-icon-btn" onClick={() => setToken("")} title="Clear">
                                            <i className="ti ti-x" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <textarea
                            className="jwt-input"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your JWT token here..."
                            spellCheck={false}
                            rows={4}
                        />
                        {decoded?.error && (
                            <div className="jwt-error">
                                <i className="ti ti-alert-triangle" />
                                {decoded.error}
                            </div>
                        )}
                    </div>

                    {/* Empty State */}
                    {!token && (
                        <div className="jwt-empty">
                            <div className="jwt-empty-icon">
                                <i className="ti ti-key" />
                            </div>
                            <p className="jwt-empty-title">Decode JSON Web Tokens</p>
                            <p className="jwt-empty-desc">
                                Paste a JWT above or try an example to see its header, payload, and signature
                            </p>
                        </div>
                    )}

                    {/* Decoded Sections */}
                    {decoded?.valid && (
                        <>
                            {/* Header */}
                            <div className="jwt-section">
                                <div className="jwt-section-header">
                                    <div className="jwt-section-title">
                                        <i className="ti ti-file-description" />
                                        Header
                                    </div>
                                    <button
                                        className={`jwt-copy-btn${copiedKey === "header" ? " --done" : ""}`}
                                        onClick={() => copy(JSON.stringify(decoded.header, null, 2), "header")}
                                    >
                                        <i className={`ti ${copiedKey === "header" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "header" ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <div className="jwt-card">
                                    <div className="jwt-grid">
                                        {Object.entries(decoded.header!).map(([key, value]) => (
                                            <div key={key} className="jwt-row">
                                                <span className="jwt-key">{key}</span>
                                                <span className="jwt-value">{renderValue(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Payload */}
                            <div className="jwt-section">
                                <div className="jwt-section-header">
                                    <div className="jwt-section-title">
                                        <i className="ti ti-package" />
                                        Payload
                                    </div>
                                    <button
                                        className={`jwt-copy-btn${copiedKey === "payload" ? " --done" : ""}`}
                                        onClick={() => copy(JSON.stringify(decoded.payload, null, 2), "payload")}
                                    >
                                        <i className={`ti ${copiedKey === "payload" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "payload" ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <div className="jwt-card">
                                    <div className="jwt-grid">
                                        {Object.entries(decoded.payload!).map(([key, value]) => (
                                            <div key={key} className="jwt-row">
                                                <span className="jwt-key">
                                                    {key}
                                                    {(key === "iat" || key === "exp" || key === "nbf") && (
                                                        <span className="jwt-hint">
                                                            {key === "iat" && "Issued At"}
                                                            {key === "exp" && "Expires"}
                                                            {key === "nbf" && "Not Before"}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="jwt-value">
                                                    {renderValue(value)}
                                                    {(key === "iat" || key === "exp" || key === "nbf") && typeof value === "number" && (
                                                        <span className="jwt-timestamp">{formatTimestamp(value)}</span>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Signature */}
                            <div className="jwt-section">
                                <div className="jwt-section-header">
                                    <div className="jwt-section-title">
                                        <i className="ti ti-shield-check" />
                                        Signature
                                    </div>
                                    <button
                                        className={`jwt-copy-btn${copiedKey === "signature" ? " --done" : ""}`}
                                        onClick={() => copy(decoded.signature, "signature")}
                                    >
                                        <i className={`ti ${copiedKey === "signature" ? "ti-check" : "ti-copy"}`} />
                                        {copiedKey === "signature" ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <div className="jwt-signature">
                                    {decoded.signature}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="jwt-footer">
                    <i className="ti ti-shield-lock" />
                    <span>Everything runs in your browser — your tokens never leave this page.</span>
                </div>
            </div>

            <style jsx>{`
                .jwt-root {
                    --jwt-radius-sm: 6px;
                    --jwt-radius-md: 8px;
                    --jwt-radius-lg: 12px;
                    --jwt-radius-xl: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jwt-radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .jwt-cmd {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .jwt-cmd-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .jwt-cmd-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .jwt-cmd-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    color: var(--text-disabled);
                    margin-right: 4px;
                }

                .jwt-preset-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--jwt-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jwt-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jwt-preset-btn i {
                    font-size: 13px;
                }

                .jwt-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: 99px;
                    border: 0.5px solid;
                    font-size: 11px;
                    font-weight: 600;
                }

                .jwt-badge--success {
                    background: #f0fdf4;
                    color: #166534;
                    border-color: #bbf7d0;
                }

                .jwt-badge--error {
                    background: #fef2f2;
                    color: #991b1b;
                    border-color: #fecaca;
                }

                @media (prefers-color-scheme: dark) {
                    .jwt-badge--success {
                        background: #052e16;
                        color: #4ade80;
                        border-color: #166534;
                    }
                    .jwt-badge--error {
                        background: #1c0a0a;
                        color: #f87171;
                        border-color: #7f1d1d;
                    }
                }

                .jwt-badge i {
                    font-size: 13px;
                }

                .jwt-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .jwt-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .jwt-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .jwt-section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .jwt-section-title i {
                    font-size: 14px;
                }

                .jwt-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .jwt-len {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .jwt-icon-btn {
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

                .jwt-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jwt-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jwt-radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--text);
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .jwt-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .jwt-input::placeholder {
                    color: var(--text-disabled);
                }

                .jwt-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 7px;
                    padding: 10px 12px;
                    background: #fef2f2;
                    border: 0.5px solid #fecaca;
                    border-radius: var(--jwt-radius-md);
                    color: #991b1b;
                    font-size: 12px;
                    line-height: 1.5;
                }

                @media (prefers-color-scheme: dark) {
                    .jwt-error {
                        background: #1c0a0a;
                        border-color: #7f1d1d;
                        color: #f87171;
                    }
                }

                .jwt-error i {
                    font-size: 14px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .jwt-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .jwt-empty-icon {
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

                .jwt-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .jwt-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                .jwt-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: var(--jwt-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jwt-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jwt-copy-btn.--done {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jwt-copy-btn i {
                    font-size: 12px;
                }

                .jwt-card {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jwt-radius-md);
                    overflow: hidden;
                }

                .jwt-grid {
                    display: flex;
                    flex-direction: column;
                }

                .jwt-row {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 16px;
                    padding: 12px 14px;
                    border-bottom: 0.5px solid var(--border);
                    transition: background 0.1s;
                }

                .jwt-row:last-child {
                    border-bottom: none;
                }

                .jwt-row:hover {
                    background: var(--bg-surface);
                }

                .jwt-key {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .jwt-hint {
                    font-family: var(--font-sans);
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .jwt-value {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    word-break: break-all;
                }

                .jwt-timestamp {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .jwt-null,
                .jwt-undefined {
                    color: var(--text-disabled);
                    font-style: normal;
                }

                .jwt-bool {
                    color: #d97706;
                }

                .jwt-num {
                    color: #059669;
                }

                .jwt-str {
                    color: var(--brand);
                }

                .jwt-arr,
                .jwt-obj {
                    color: var(--text-tertiary);
                }

                @media (prefers-color-scheme: dark) {
                    .jwt-bool {
                        color: #fbbf24;
                    }
                    .jwt-num {
                        color: #34d399;
                    }
                }

                .jwt-signature {
                    padding: 14px 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--jwt-radius-md);
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.6;
                }

                .jwt-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                }

                .jwt-footer i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .jwt-cmd {
                        padding: 10px 12px;
                    }

                    .jwt-cmd-label {
                        display: none;
                    }

                    .jwt-preset-label {
                        display: none;
                    }

                    .jwt-preset-btn {
                        padding: 0 8px;
                        min-width: 32px;
                        justify-content: center;
                    }

                    .jwt-body {
                        padding: 12px;
                    }

                    .jwt-row {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .jwt-empty {
                        padding: 40px 20px;
                    }
                }
            `}</style>
        </>
    );
}