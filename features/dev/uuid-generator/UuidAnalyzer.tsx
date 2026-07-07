// features/dev/uuid-generator/UuidAnalyzer.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { analyzeUuid, validateUuid, formatUuid, formatTimestamp, type UuidAnalysis } from "./utils";

export default function UuidAnalyzer() {
    const [input, setInput] = useState("");
    const [analysis, setAnalysis] = useState<UuidAnalysis | null>(null);

    const handleAnalyze = useCallback(() => {
        if (!input.trim()) {
            setAnalysis(null);
            return;
        }
        const result = analyzeUuid(input.trim());
        setAnalysis(result);
    }, [input]);

    const validation = useMemo(() => {
        if (!input.trim()) return null;
        return validateUuid(input.trim());
    }, [input]);

    const handleClear = useCallback(() => {
        setInput("");
        setAnalysis(null);
    }, []);

    const loadSample = useCallback(() => {
        setInput("550e8400-e29b-41d4-a716-446655440000");
        setTimeout(() => {
            const result = analyzeUuid("550e8400-e29b-41d4-a716-446655440000");
            setAnalysis(result);
        }, 100);
    }, []);

    const getVersionBadgeColor = (version: number | null) => {
        if (!version) return "neutral";
        if (version === 4) return "brand";
        if (version === 7) return "success";
        if (version === 1 || version === 6) return "warning";
        return "info";
    };

    return (
        <>
            <div className="ua-root">
                {/*  Input Section  */}
                <div className="ua-input-section">
                    <div className="ua-input-header">
                        <div className="ua-input-label">
                            <i className="ti ti-search" />
                            UUID Input
                        </div>
                        <div className="ua-input-actions">
                            <button
                                type="button"
                                className="ua-sample-btn"
                                onClick={loadSample}
                            >
                                <i className="ti ti-wand" />
                                Sample
                            </button>
                            <button
                                type="button"
                                className="ua-clear-btn"
                                onClick={handleClear}
                                disabled={!input}
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                    </div>

                    <textarea
                        className="ua-textarea"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onBlur={handleAnalyze}
                        placeholder="Paste a UUID to analyze...
Example: 550e8400-e29b-41d4-a716-446655440000"
                        spellCheck={false}
                        rows={3}
                    />

                    {validation && !validation.valid && (
                        <div className="ua-error-bar">
                            <i className="ti ti-alert-circle" />
                            <span>{validation.error}</span>
                        </div>
                    )}
                </div>

                {/*  Analysis Results  */}
                {analysis && (
                    <div className="ua-results">
                        {/*  Validation Status  */}
                        <div className={`ua-status-card ${analysis.isValid ? "valid" : "invalid"}`}>
                            <div className="ua-status-icon">
                                <i className={`ti ${analysis.isValid ? "ti-circle-check" : "ti-alert-triangle"}`} />
                            </div>
                            <div className="ua-status-content">
                                <h3 className="ua-status-title">
                                    {analysis.isValid ? "Valid UUID" : "Invalid UUID"}
                                </h3>
                                <p className="ua-status-desc">
                                    {analysis.isValid 
                                        ? "This UUID conforms to RFC 4122 standard" 
                                        : analysis.errors.join(", ")}
                                </p>
                            </div>
                        </div>

                        {/*  Details Grid  */}
                        {analysis.isValid && (
                            <div className="ua-details">
                                <div className="ua-details-header">
                                    <i className="ti ti-info-circle" />
                                    <span>UUID Details</span>
                                </div>

                                <div className="ua-details-grid">
                                    <div className="ua-detail-card">
                                        <div className="ua-detail-label">Version</div>
                                        <div className="ua-detail-value">
                                            <span className={`ua-version-badge ${getVersionBadgeColor(analysis.version)}`}>
                                                {analysis.version ? `v${analysis.version}` : "Unknown"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="ua-detail-card">
                                        <div className="ua-detail-label">Variant</div>
                                        <div className="ua-detail-value">{analysis.variant}</div>
                                    </div>

                                    <div className="ua-detail-card">
                                        <div className="ua-detail-label">Format</div>
                                        <div className="ua-detail-value ua-detail-mono">{analysis.format}</div>
                                    </div>

                                    {analysis.timestamp && (
                                        <>
                                            <div className="ua-detail-card ua-detail-wide">
                                                <div className="ua-detail-label">
                                                    <i className="ti ti-clock" />
                                                    Timestamp
                                                </div>
                                                <div className="ua-detail-value ua-detail-mono">
                                                    {analysis.timestampDate}
                                                </div>
                                                <div className="ua-detail-sub">
                                                    {formatTimestamp(analysis.timestamp)}
                                                </div>
                                            </div>

                                            <div className="ua-detail-card">
                                                <div className="ua-detail-label">Unix Epoch</div>
                                                <div className="ua-detail-value ua-detail-mono">
                                                    {Math.floor(analysis.timestamp)}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {analysis.clockSequence !== undefined && (
                                        <div className="ua-detail-card">
                                            <div className="ua-detail-label">Clock Sequence</div>
                                            <div className="ua-detail-value ua-detail-mono">
                                                {analysis.clockSequence}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.node && (
                                        <div className="ua-detail-card ua-detail-wide">
                                            <div className="ua-detail-label">Node (MAC Address)</div>
                                            <div className="ua-detail-value ua-detail-mono">
                                                {analysis.node}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/*  Format Conversions  */}
                        {analysis.isValid && input.trim() && (
                            <div className="ua-conversions">
                                <div className="ua-conversions-header">
                                    <i className="ti ti-transform" />
                                    <span>Format Conversions</span>
                                </div>

                                <div className="ua-conversion-list">
                                    {[
                                        { label: "Standard", format: "standard" as const },
                                        { label: "No Hyphens", format: "no-hyphens" as const },
                                        { label: "Braces", format: "braces" as const },
                                        { label: "URN", format: "urn" as const },
                                        { label: "Base64", format: "base64" as const },
                                        { label: "Hex", format: "hex" as const },
                                    ].map(({ label, format }) => {
                                        const converted = formatUuid(input.trim(), format, "lowercase");
                                        return (
                                            <div key={format} className="ua-conversion-item">
                                                <div className="ua-conversion-label">{label}</div>
                                                <div className="ua-conversion-value-row">
                                                    <code className="ua-conversion-value">{converted}</code>
                                                    <button
                                                        type="button"
                                                        className="ua-copy-icon"
                                                        onClick={async () => {
                                                            await navigator.clipboard.writeText(converted);
                                                        }}
                                                        title="Copy"
                                                    >
                                                        <i className="ti ti-copy" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/*  Empty State  */}
                {!input.trim() && !analysis && (
                    <div className="ua-empty">
                        <div className="ua-empty-icon">
                            <i className="ti ti-scan" />
                        </div>
                        <p className="ua-empty-title">Analyze UUID</p>
                        <p className="ua-empty-desc">
                            Paste any UUID above to validate it, extract metadata, and convert between formats.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .ua-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /*  Input Section  */
                .ua-input-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .ua-input-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                }

                .ua-input-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ua-input-label i {
                    font-size: 13px;
                }

                .ua-input-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ua-sample-btn,
                .ua-clear-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 10px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .ua-sample-btn:hover,
                .ua-clear-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .ua-clear-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .ua-sample-btn i,
                .ua-clear-btn i {
                    font-size: 12px;
                }

                .ua-textarea {
                    width: 100%;
                    min-height: 80px;
                    padding: 12px 14px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.7;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: vertical;
                }

                .ua-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .ua-error-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: var(--error-bg);
                    border-top: 0.5px solid var(--border-faint);
                    color: #B91C1C;
                    font-size: 12px;
                }

                @media (prefers-color-scheme: dark) {
                    .ua-error-bar {
                        color: #F87171;
                    }
                }

                .ua-error-bar i {
                    font-size: 14px;
                    flex-shrink: 0;
                }

                /*  Results  */
                .ua-results {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .ua-status-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px 18px;
                    border-radius: var(--radius-lg);
                    border: 0.5px solid;
                }

                .ua-status-card.valid {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .ua-status-card.invalid {
                    background: var(--error-bg);
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .ua-status-card.invalid {
                        border-color: #5A2A2A;
                    }
                }

                .ua-status-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .ua-status-card.valid .ua-status-icon {
                    background: var(--brand);
                    color: white;
                }

                .ua-status-card.invalid .ua-status-icon {
                    background: #DC2626;
                    color: white;
                }

                @media (prefers-color-scheme: dark) {
                    .ua-status-card.invalid .ua-status-icon {
                        background: #991B1B;
                    }
                }

                .ua-status-content {
                    flex: 1;
                }

                .ua-status-title {
                    font-size: 14px;
                    font-weight: 700;
                    margin: 0 0 4px;
                }

                .ua-status-card.valid .ua-status-title {
                    color: var(--brand-text);
                }

                .ua-status-card.invalid .ua-status-title {
                    color: #B91C1C;
                }

                @media (prefers-color-scheme: dark) {
                    .ua-status-card.invalid .ua-status-title {
                        color: #F87171;
                    }
                }

                .ua-status-desc {
                    font-size: 12px;
                    margin: 0;
                    line-height: 1.5;
                }

                .ua-status-card.valid .ua-status-desc {
                    color: var(--brand-text);
                    opacity: 0.85;
                }

                .ua-status-card.invalid .ua-status-desc {
                    color: #B91C1C;
                    opacity: 0.85;
                }

                @media (prefers-color-scheme: dark) {
                    .ua-status-card.invalid .ua-status-desc {
                        color: #F87171;
                    }
                }

                /*  Details  */
                .ua-details {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .ua-details-header,
                .ua-conversions-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ua-details-header i,
                .ua-conversions-header i {
                    font-size: 13px;
                }

                .ua-details-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }

                .ua-detail-card {
                    padding: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .ua-detail-wide {
                    grid-column: 1 / -1;
                }

                .ua-detail-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .ua-detail-label i {
                    font-size: 11px;
                }

                .ua-detail-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .ua-detail-mono {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    word-break: break-all;
                }

                .ua-detail-sub {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    margin-top: -2px;
                }

                .ua-version-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 24px;
                    padding: 0 10px;
                    border-radius: 99px;
                    font-size: 11px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                }

                .ua-version-badge.brand {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border: 0.5px solid var(--brand-border);
                }

                .ua-version-badge.success {
                    background: rgba(21, 128, 61, 0.1);
                    color: #15803D;
                    border: 0.5px solid rgba(21, 128, 61, 0.2);
                }

                @media (prefers-color-scheme: dark) {
                    .ua-version-badge.success {
                        background: rgba(74, 222, 128, 0.1);
                        color: #4ADE80;
                        border-color: rgba(74, 222, 128, 0.2);
                    }
                }

                .ua-version-badge.warning {
                    background: rgba(234, 179, 8, 0.1);
                    color: #A16207;
                    border: 0.5px solid rgba(234, 179, 8, 0.2);
                }

                @media (prefers-color-scheme: dark) {
                    .ua-version-badge.warning {
                        background: rgba(253, 224, 71, 0.1);
                        color: #FDE047;
                        border-color: rgba(253, 224, 71, 0.2);
                    }
                }

                .ua-version-badge.info {
                    background: rgba(59, 130, 246, 0.1);
                    color: #1D4ED8;
                    border: 0.5px solid rgba(59, 130, 246, 0.2);
                }

                @media (prefers-color-scheme: dark) {
                    .ua-version-badge.info {
                        background: rgba(96, 165, 250, 0.1);
                        color: #60A5FA;
                        border-color: rgba(96, 165, 250, 0.2);
                    }
                }

                .ua-version-badge.neutral {
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    border: 0.5px solid var(--border);
                }

                /*  Conversions  */
                .ua-conversions {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .ua-conversion-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .ua-conversion-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                }

                .ua-conversion-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .ua-conversion-value-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .ua-conversion-value {
                    flex: 1;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.6;
                }

                .ua-copy-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: var(--radius-sm);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .ua-copy-icon:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .ua-copy-icon i {
                    font-size: 12px;
                }

                /*  Empty State  */
                .ua-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .ua-empty-icon {
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
                    margin-bottom: 6px;
                }

                .ua-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .ua-empty-desc {
                    font-size: 12.5px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 360px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .ua-root {
                        padding: 12px;
                    }

                    .ua-details-grid {
                        grid-template-columns: 1fr;
                    }

                    .ua-status-card {
                        padding: 14px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ua-sample-btn,
                    .ua-clear-btn,
                    .ua-copy-icon {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}