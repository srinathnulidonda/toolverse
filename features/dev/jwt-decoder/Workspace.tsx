// features/dev/jwt-decoder/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { parseJWT, formatDuration, formatTimestamp } from "./jwtParser";
import type { DecodedToken, ParseError } from "./jwtParser";
import TokenVisualizer from "./TokenVisualizer";
import SecurityAnalyzer from "./SecurityAnalyzer";
import ClaimsExplorer from "./ClaimsExplorer";

type ViewTab = 'decoded' | 'visualizer' | 'security' | 'raw';

const SAMPLE_TOKENS = [
    {
        id: 'standard',
        label: 'Standard JWT',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzQ1Njc4OTB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
    {
        id: 'auth',
        label: 'Auth Token',
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1In0.eyJpc3MiOiJodHRwczovL2F1dGgudG9vbHZlcnNlLmFwcCIsInN1YiI6InVzZXJfMTIzNDUiLCJhdWQiOiJ0b29sdmVyc2UtYXBpIiwiZXhwIjoxNzM0NTY3ODkwLCJuYmYiOjE3MzQ1NjQyOTAsImlhdCI6MTczNDU2NDI5MCwianRpIjoiYWJjZGVmMTIzNDU2IiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSJdfQ.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
    },
    {
        id: 'openid',
        label: 'OpenID Connect',
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMDk2OTQxMzE1MDk3MTY5Njg2NzQiLCJhenAiOiJ5b3VyLWNsaWVudC1pZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6InlvdXItY2xpZW50LWlkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJqb2huZG9lQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSm9obiBEb2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9hdmF0YXIuanBnIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbmFtZSI6IkRvZSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNzM0NTY0MjkwLCJleHAiOjE3MzQ1Njc4OTB9.signature',
    },
];

export default function JWTDecoderWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState('');
    const [viewTab, setViewTab] = useState<ViewTab>('decoded');
    const [copiedKey, setCopiedKey] = useState('');
    const [showPresets, setShowPresets] = useState(false);
    const presetsRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Parse JWT
    const parseResult = useMemo(() => {
        if (!input.trim()) return null;
        return parseJWT(input);
    }, [input]);

    const decodedToken = parseResult?.success ? parseResult.token : null;
    const parseError = parseResult?.success === false ? parseResult.error : null;

    // Copy handler
    const handleCopy = useCallback(async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(''), 1800);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    // Load preset
    const loadPreset = useCallback((token: string) => {
        setInput(token);
        setShowPresets(false);
        setViewTab('decoded');
    }, []);

    // Clear all
    const handleClear = useCallback(() => {
        setInput('');
        setCopiedKey('');
        setViewTab('decoded');
        textareaRef.current?.focus();
    }, []);

    // Click outside handler for presets
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
                setShowPresets(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <div className="jwtw-root" role="main" aria-label="JWT Decoder">
                {/* Top Bar */}
                <div className="jwtw-chrome">
                    <div className="jwtw-chrome-left">
                        <div className="jwtw-presets" ref={presetsRef}>
                            <button
                                className="jwtw-presets-trigger"
                                onClick={() => setShowPresets(!showPresets)}
                                aria-haspopup="menu"
                                aria-expanded={showPresets}
                            >
                                <i className="ti ti-wand" />
                                <span>Examples</span>
                                <i className={`ti ti-chevron-down jwtw-chevron${showPresets ? ' open' : ''}`} />
                            </button>
                            {showPresets && (
                                <div className="jwtw-presets-menu" role="menu">
                                    {SAMPLE_TOKENS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            className="jwtw-preset-item"
                                            onClick={() => loadPreset(preset.token)}
                                            role="menuitem"
                                        >
                                            <i className="ti ti-key" />
                                            <span>{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {input && (
                            <button
                                className="jwtw-icon-btn"
                                onClick={handleClear}
                                title="Clear all"
                            >
                                <i className="ti ti-trash" />
                                <span className="jwtw-btn-label">Clear</span>
                            </button>
                        )}
                    </div>

                    <div className="jwtw-chrome-right">
                        {decodedToken && (
                            <>
                                {/* Status Badge */}
                                {decodedToken.metadata.isExpired && (
                                    <div className="jwtw-badge jwtw-badge--error">
                                        <i className="ti ti-alert-circle" />
                                        Expired
                                    </div>
                                )}
                                {!decodedToken.metadata.isExpired && decodedToken.metadata.isNotYetValid && (
                                    <div className="jwtw-badge jwtw-badge--warning">
                                        <i className="ti ti-clock" />
                                        Not Yet Valid
                                    </div>
                                )}
                                {!decodedToken.metadata.isExpired && !decodedToken.metadata.isNotYetValid && decodedToken.decoded.payload.exp && (
                                    <div className="jwtw-badge jwtw-badge--success">
                                        <i className="ti ti-circle-check" />
                                        Valid
                                    </div>
                                )}

                                {/* Copy & Download */}
                                <button
                                    className={`jwtw-action-btn${copiedKey === 'full-token' ? ' copied' : ''}`}
                                    onClick={() => handleCopy(decodedToken.raw, 'full-token')}
                                >
                                    <i className={`ti ${copiedKey === 'full-token' ? 'ti-check' : 'ti-copy'}`} />
                                    <span>{copiedKey === 'full-token' ? 'Copied' : 'Copy Token'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Input Section */}
                <div className="jwtw-input-section">
                    <div className="jwtw-input-header">
                        <div className="jwtw-input-label">
                            <i className="ti ti-lock" />
                            JWT Token
                        </div>
                        {input && (
                            <div className="jwtw-input-meta">
                                <span className="jwtw-input-length">{input.length} characters</span>
                            </div>
                        )}
                    </div>
                    <textarea
                        ref={textareaRef}
                        className="jwtw-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JWT token here... (with or without Bearer prefix)"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        rows={5}
                        aria-label="JWT token input"
                        aria-invalid={!!parseError}
                    />
                    {parseError && (
                        <div className="jwtw-error" role="alert">
                            <i className="ti ti-alert-triangle" />
                            <div>
                                <strong>{parseError.message}</strong>
                                {parseError.details && <p>{parseError.details}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {!input && (
                    <div className="jwtw-empty">
                        <div className="jwtw-empty-icon">
                            <i className="ti ti-key" />
                        </div>
                        <h3 className="jwtw-empty-title">Decode & Analyze JWT Tokens</h3>
                        <p className="jwtw-empty-desc">
                            Paste a JWT token above to decode its header, payload, and signature.
                            View security analysis, visualizations, and detailed claim information.
                        </p>
                        <button
                            className="jwtw-empty-btn"
                            onClick={() => loadPreset(SAMPLE_TOKENS[0].token)}
                        >
                            <i className="ti ti-wand" />
                            Try an example
                        </button>
                    </div>
                )}

                {/* Content Tabs */}
                {decodedToken && (
                    <>
                        <nav className="jwtw-tabs" role="tablist" aria-label="Token views">
                            {[
                                { id: 'decoded' as const, label: 'Claims', icon: 'ti-list-details' },
                                { id: 'visualizer' as const, label: 'Visualizer', icon: 'ti-chart-pie' },
                                { id: 'security' as const, label: 'Security', icon: 'ti-shield-check' },
                                { id: 'raw' as const, label: 'Raw JSON', icon: 'ti-code' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={viewTab === tab.id}
                                    aria-controls={`jwtw-panel-${tab.id}`}
                                    className={`jwtw-tab${viewTab === tab.id ? ' active' : ''}`}
                                    onClick={() => setViewTab(tab.id)}
                                >
                                    <i className={`ti ${tab.icon}`} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="jwtw-content">
                            {/* Claims Explorer */}
                            {viewTab === 'decoded' && (
                                <div role="tabpanel" id="jwtw-panel-decoded">
                                    <ClaimsExplorer
                                        header={decodedToken.decoded.header}
                                        payload={decodedToken.decoded.payload}
                                        onCopy={handleCopy}
                                        copiedKey={copiedKey}
                                    />
                                </div>
                            )}

                            {/* Visualizer */}
                            {viewTab === 'visualizer' && (
                                <div role="tabpanel" id="jwtw-panel-visualizer" className="jwtw-panel">
                                    <TokenVisualizer token={decodedToken} />
                                </div>
                            )}

                            {/* Security Analyzer */}
                            {viewTab === 'security' && (
                                <div role="tabpanel" id="jwtw-panel-security" className="jwtw-panel">
                                    <SecurityAnalyzer token={decodedToken} />
                                </div>
                            )}

                            {/* Raw JSON */}
                            {viewTab === 'raw' && (
                                <div role="tabpanel" id="jwtw-panel-raw" className="jwtw-panel jwtw-raw">
                                    <div className="jwtw-raw-section">
                                        <div className="jwtw-raw-header">
                                            <span>Header</span>
                                            <button
                                                className={`jwtw-copy-btn-sm${copiedKey === 'raw-header' ? ' copied' : ''}`}
                                                onClick={() => handleCopy(JSON.stringify(decodedToken.decoded.header, null, 2), 'raw-header')}
                                            >
                                                <i className={`ti ${copiedKey === 'raw-header' ? 'ti-check' : 'ti-copy'}`} />
                                            </button>
                                        </div>
                                        <pre className="jwtw-raw-code">
                                            {JSON.stringify(decodedToken.decoded.header, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="jwtw-raw-section">
                                        <div className="jwtw-raw-header">
                                            <span>Payload</span>
                                            <button
                                                className={`jwtw-copy-btn-sm${copiedKey === 'raw-payload' ? ' copied' : ''}`}
                                                onClick={() => handleCopy(JSON.stringify(decodedToken.decoded.payload, null, 2), 'raw-payload')}
                                            >
                                                <i className={`ti ${copiedKey === 'raw-payload' ? 'ti-check' : 'ti-copy'}`} />
                                            </button>
                                        </div>
                                        <pre className="jwtw-raw-code">
                                            {JSON.stringify(decodedToken.decoded.payload, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="jwtw-raw-section">
                                        <div className="jwtw-raw-header">
                                            <span>Signature</span>
                                            <button
                                                className={`jwtw-copy-btn-sm${copiedKey === 'raw-sig' ? ' copied' : ''}`}
                                                onClick={() => handleCopy(decodedToken.parts.signature, 'raw-sig')}
                                            >
                                                <i className={`ti ${copiedKey === 'raw-sig' ? 'ti-check' : 'ti-copy'}`} />
                                            </button>
                                        </div>
                                        <pre className="jwtw-raw-code jwtw-raw-sig">
                                            {decodedToken.parts.signature}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="jwtw-footer">
                    <i className="ti ti-shield-lock" />
                    <span>All processing happens in your browser — tokens are never sent to any server</span>
                </div>
            </div>

            <style jsx>{`
                .jwtw-root {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 600px;
                }

                /* Chrome/Top Bar */
                .jwtw-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .jwtw-chrome-left,
                .jwtw-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                /* Presets Dropdown */
                .jwtw-presets {
                    position: relative;
                }

                .jwtw-presets-trigger {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    font-family: var(--font-sans);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jwtw-presets-trigger:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                    border-color: var(--brand-border);
                }

                .jwtw-presets-trigger i {
                    font-size: 14px;
                }

                .jwtw-chevron {
                    transition: transform 0.2s;
                    font-size: 12px !important;
                }

                .jwtw-chevron.open {
                    transform: rotate(180deg);
                }

                .jwtw-presets-menu {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    min-width: 200px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    z-index: 100;
                }

                .jwtw-preset-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px 14px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-family: var(--font-sans);
                    cursor: pointer;
                    transition: background 0.12s;
                    text-align: left;
                }

                .jwtw-preset-item:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jwtw-preset-item i {
                    font-size: 14px;
                    color: var(--text-tertiary);
                }

                /* Icon Button */
                .jwtw-icon-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    font-family: var(--font-sans);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jwtw-icon-btn:hover {
                    background: var(--error-bg);
                    color: #DC2626;
                    border-color: #FCA5A5;
                }

                .jwtw-icon-btn i {
                    font-size: 14px;
                }

                /* Badges */
                .jwtw-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: 99px;
                    border: 0.5px solid;
                    font-size: 11px;
                    font-weight: 600;
                    font-family: var(--font-sans);
                }

                .jwtw-badge i {
                    font-size: 12px;
                }

                .jwtw-badge--success {
                    background: #F0FDF4;
                    color: #166534;
                    border-color: #BBF7D0;
                }

                .jwtw-badge--error {
                    background: #FEF2F2;
                    color: #991B1B;
                    border-color: #FECACA;
                }

                .jwtw-badge--warning {
                    background: #FFFBEB;
                    color: #92400E;
                    border-color: #FDE68A;
                }

                @media (prefers-color-scheme: dark) {
                    .jwtw-badge--success {
                        background: #052E16;
                        color: #4ADE80;
                        border-color: #166534;
                    }
                    .jwtw-badge--error {
                        background: #1C0A0A;
                        color: #F87171;
                        border-color: #7F1D1D;
                    }
                    .jwtw-badge--warning {
                        background: #1E1A08;
                        color: #FCD34D;
                        border-color: #78350F;
                    }
                }

                /* Action Button */
                .jwtw-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 14px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    font-family: var(--font-sans);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jwtw-action-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jwtw-action-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jwtw-action-btn i {
                    font-size: 13px;
                }

                /* Input Section */
                .jwtw-input-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 16px;
                    border-bottom: 0.5px solid var(--border-faint);
                }

                .jwtw-input-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }

                .jwtw-input-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .jwtw-input-label i {
                    font-size: 13px;
                }

                .jwtw-input-meta {
                    font-size: 11px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .jwtw-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    line-height: 1.65;
                    color: var(--text);
                    resize: vertical;
                    min-height: 100px;
                    transition: border-color 0.12s;
                }

                .jwtw-input:focus {
                    outline: none;
                    border-color: var(--brand);
                }

                .jwtw-input::placeholder {
                    color: var(--text-disabled);
                }

                /* Error */
                .jwtw-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 12px 14px;
                    background: var(--error-bg);
                    border: 0.5px solid #FECACA;
                    border-radius: var(--radius-md);
                    color: #991B1B;
                    font-size: 12px;
                }

                @media (prefers-color-scheme: dark) {
                    .jwtw-error {
                        border-color: #7F1D1D;
                        color: #F87171;
                    }
                }

                .jwtw-error i {
                    font-size: 15px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .jwtw-error strong {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .jwtw-error p {
                    margin: 0;
                    font-size: 11px;
                    font-family: var(--font-mono);
                }

                /* Empty State */
                .jwtw-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 24px;
                    gap: 12px;
                    text-align: center;
                    flex: 1;
                }

                .jwtw-empty-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: var(--text-disabled);
                    margin-bottom: 8px;
                }

                .jwtw-empty-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .jwtw-empty-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    max-width: 420px;
                    line-height: 1.6;
                    margin: 0;
                }

                .jwtw-empty-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 36px;
                    padding: 0 18px;
                    margin-top: 8px;
                    border-radius: var(--radius-md);
                    border: none;
                    background: var(--brand);
                    color: white;
                    font-size: 13px;
                    font-weight: 500;
                    font-family: var(--font-sans);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .jwtw-empty-btn:hover {
                    background: var(--brand-hover);
                    transform: translateY(-1px);
                }

                .jwtw-empty-btn i {
                    font-size: 15px;
                }

                /* Tabs */
                .jwtw-tabs {
                    display: flex;
                    gap: 0;
                    padding: 0 16px;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .jwtw-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    height: 44px;
                    padding: 0 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    font-size: 12px;
                    font-weight: 500;
                    font-family: var(--font-sans);
                    cursor: pointer;
                    position: relative;
                    transition: color 0.12s;
                    white-space: nowrap;
                }

                .jwtw-tab:hover {
                    color: var(--text);
                }

                .jwtw-tab.active {
                    color: var(--text);
                }

                .jwtw-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 12px;
                    right: 12px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .jwtw-tab i {
                    font-size: 14px;
                }

                /* Content */
                .jwtw-content {
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .jwtw-panel {
                    flex: 1;
                    overflow: auto;
                }

                /* Raw JSON Panel */
                .jwtw-raw {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .jwtw-raw-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .jwtw-raw-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .jwtw-copy-btn-sm {
                    width: 24px;
                    height: 24px;
                    border: 0.5px solid var(--border);
                    background: transparent;
                    color: var(--text-disabled);
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.12s;
                }

                .jwtw-copy-btn-sm:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .jwtw-copy-btn-sm.copied {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                .jwtw-copy-btn-sm i {
                    font-size: 12px;
                }

                .jwtw-raw-code {
                    margin: 0;
                    padding: 14px 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    font-family: var(--font-mono);
                    font-size: 12px;
                    line-height: 1.7;
                    color: var(--text);
                    overflow-x: auto;
                    white-space: pre;
                }

                .jwtw-raw-sig {
                    word-break: break-all;
                    white-space: pre-wrap;
                }

                /* Footer */
                .jwtw-footer {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 10px 16px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    color: var(--text-disabled);
                    font-family: var(--font-sans);
                }

                .jwtw-footer i {
                    font-size: 13px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .jwtw-btn-label {
                        display: none;
                    }

                    .jwtw-tabs {
                        overflow-x: auto;
                        scrollbar-width: none;
                    }

                    .jwtw-tabs::-webkit-scrollbar {
                        display: none;
                    }

                    .jwtw-tab {
                        padding: 0 12px;
                    }

                    .jwtw-empty {
                        padding: 60px 20px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        transition: none !important;
                    }
                }
            `}</style>
        </>
    );
}