// features/dev/url-encoder/UrlCompare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { decodeUrl, normalizeUrl, parseUrl, type EncodingOptions } from "./utils";
import { formatBytes } from "@/utils";

interface UrlCompareProps {
    options: EncodingOptions;
}

export default function UrlCompare({ options }: UrlCompareProps) {
    const [leftInput, setLeftInput] = useState("");
    const [rightInput, setRightInput] = useState("");

    const leftDecoded = useMemo(() => {
        if (!leftInput.trim()) return null;
        return decodeUrl(leftInput, options);
    }, [leftInput, options]);

    const rightDecoded = useMemo(() => {
        if (!rightInput.trim()) return null;
        return decodeUrl(rightInput, options);
    }, [rightInput, options]);

    const comparison = useMemo(() => {
        if (!leftInput.trim() || !rightInput.trim()) return null;

        try {
            const leftNorm = normalizeUrl(leftInput);
            const rightNorm = normalizeUrl(rightInput);

            const identical = leftNorm === rightNorm;
            const leftBytes = new Blob([leftInput]).size;
            const rightBytes = new Blob([rightInput]).size;

            // Calculate similarity
            const maxLen = Math.max(leftInput.length, rightInput.length);
            let matches = 0;
            for (let i = 0; i < maxLen; i++) {
                if (leftInput[i] === rightInput[i]) matches++;
            }
            const similarity = maxLen > 0 ? (matches / maxLen) * 100 : 0;

            // Parse both URLs
            const leftParsed = parseUrl(leftInput);
            const rightParsed = parseUrl(rightInput);

            const sameHost = leftParsed?.hostname === rightParsed?.hostname;
            const samePath = leftParsed?.pathname === rightParsed?.pathname;
            const sameProtocol = leftParsed?.protocol === rightParsed?.protocol;

            return {
                identical,
                similarity: Math.round(similarity),
                leftBytes,
                rightBytes,
                sizeDiff: rightBytes - leftBytes,
                sameHost,
                samePath,
                sameProtocol,
                leftParsed,
                rightParsed
            };
        } catch {
            return null;
        }
    }, [leftInput, rightInput, options]);

    const handleSwap = useCallback(() => {
        const temp = leftInput;
        setLeftInput(rightInput);
        setRightInput(temp);
    }, [leftInput, rightInput]);

    const handleClear = useCallback(() => {
        setLeftInput("");
        setRightInput("");
    }, []);

    return (
        <>
            <div className="uc-root">
                {/*  Controls  */}
                <div className="uc-controls">
                    <div className="uc-controls-label">
                        <i className="ti ti-git-compare" />
                        Compare URLs
                    </div>
                    <div className="uc-actions">
                        <button
                            type="button"
                            className="uc-btn"
                            onClick={handleSwap}
                            disabled={!leftInput || !rightInput}
                        >
                            <i className="ti ti-arrows-left-right" />
                            Swap
                        </button>
                        <button
                            type="button"
                            className="uc-btn"
                            onClick={handleClear}
                            disabled={!leftInput && !rightInput}
                        >
                            <i className="ti ti-trash" />
                            Clear
                        </button>
                    </div>
                </div>

                {/*  Comparison Result  */}
                {comparison && (
                    <div className="uc-result">
                        <div className={`uc-result-card ${comparison.identical ? "identical" : "different"}`}>
                            <div className="uc-result-icon">
                                <i className={`ti ${comparison.identical ? "ti-checks" : "ti-git-compare"}`} />
                            </div>
                            <div className="uc-result-content">
                                <h3 className="uc-result-title">
                                    {comparison.identical ? "Identical Match" : "Different URLs"}
                                </h3>
                                <p className="uc-result-desc">
                                    {comparison.identical
                                        ? "Both URLs are exactly the same"
                                        : `${comparison.similarity}% similar`}
                                </p>
                            </div>
                        </div>

                        {/* Detailed comparison */}
                        <div className="uc-details">
                            <div className="uc-detail-grid">
                                <div className="uc-detail-card">
                                    <div className="uc-detail-header">
                                        <i className="ti ti-chart-bar" />
                                        <span>Similarity</span>
                                    </div>
                                    <div className="uc-detail-value">{comparison.similarity}%</div>
                                    <div className="uc-detail-bar">
                                        <div
                                            className="uc-detail-bar-fill"
                                            style={{ width: `${comparison.similarity}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="uc-detail-card">
                                    <div className="uc-detail-header">
                                        <i className="ti ti-file-diff" />
                                        <span>Size Difference</span>
                                    </div>
                                    <div className="uc-detail-value">
                                        {comparison.sizeDiff > 0 ? "+" : ""}
                                        {formatBytes(Math.abs(comparison.sizeDiff))}
                                    </div>
                                    <div className="uc-detail-label">
                                        {comparison.sizeDiff > 0
                                            ? "Right is larger"
                                            : comparison.sizeDiff < 0
                                            ? "Left is larger"
                                            : "Same size"}
                                    </div>
                                </div>

                                <div className="uc-detail-card">
                                    <div className="uc-detail-header">
                                        <i className="ti ti-world" />
                                        <span>Host</span>
                                    </div>
                                    <div className="uc-detail-value">
                                        {comparison.sameHost ? (
                                            <span className="uc-match">✓ Same</span>
                                        ) : (
                                            <span className="uc-diff">✗ Different</span>
                                        )}
                                    </div>
                                    <div className="uc-detail-label">
                                        {comparison.leftParsed?.hostname || "N/A"}
                                    </div>
                                </div>

                                <div className="uc-detail-card">
                                    <div className="uc-detail-header">
                                        <i className="ti ti-route" />
                                        <span>Path</span>
                                    </div>
                                    <div className="uc-detail-value">
                                        {comparison.samePath ? (
                                            <span className="uc-match">✓ Same</span>
                                        ) : (
                                            <span className="uc-diff">✗ Different</span>
                                        )}
                                    </div>
                                    <div className="uc-detail-label">
                                        {comparison.leftParsed?.pathname || "/"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/*  Side-by-Side Inputs  */}
                <div className="uc-inputs">
                    <div className="uc-input-panel">
                        <div className="uc-input-header">
                            <div className="uc-input-label">
                                <i className="ti ti-arrow-left" />
                                Left Side
                            </div>
                            {leftInput && (
                                <div className="uc-input-meta">
                                    <span className="uc-meta-size">{formatBytes(new Blob([leftInput]).size)}</span>
                                    {leftDecoded?.error && (
                                        <span className="uc-meta-error">
                                            <i className="ti ti-alert-circle" />
                                            Invalid
                                        </span>
                                    )}
                                    {!leftDecoded?.error && leftDecoded && (
                                        <span className="uc-meta-valid">
                                            <i className="ti ti-check" />
                                            Valid
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <textarea
                            className="uc-textarea"
                            value={leftInput}
                            onChange={(e) => setLeftInput(e.target.value)}
                            placeholder="Paste first URL..."
                            spellCheck={false}
                        />
                        {leftDecoded?.error && (
                            <div className="uc-input-error">
                                <i className="ti ti-alert-triangle" />
                                {leftDecoded.error}
                            </div>
                        )}
                    </div>

                    <div className="uc-vs">
                        <div className="uc-vs-icon">
                            <span>VS</span>
                        </div>
                    </div>

                    <div className="uc-input-panel">
                        <div className="uc-input-header">
                            <div className="uc-input-label">
                                <i className="ti ti-arrow-right" />
                                Right Side
                            </div>
                            {rightInput && (
                                <div className="uc-input-meta">
                                    <span className="uc-meta-size">{formatBytes(new Blob([rightInput]).size)}</span>
                                    {rightDecoded?.error && (
                                        <span className="uc-meta-error">
                                            <i className="ti ti-alert-circle" />
                                            Invalid
                                        </span>
                                    )}
                                    {!rightDecoded?.error && rightDecoded && (
                                        <span className="uc-meta-valid">
                                            <i className="ti ti-check" />
                                            Valid
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <textarea
                            className="uc-textarea"
                            value={rightInput}
                            onChange={(e) => setRightInput(e.target.value)}
                            placeholder="Paste second URL..."
                            spellCheck={false}
                        />
                        {rightDecoded?.error && (
                            <div className="uc-input-error">
                                <i className="ti ti-alert-triangle" />
                                {rightDecoded.error}
                            </div>
                        )}
                    </div>
                </div>

                {/*  Empty State  */}
                {!leftInput && !rightInput && (
                    <div className="uc-empty">
                        <div className="uc-empty-icon">
                            <i className="ti ti-git-compare" />
                        </div>
                        <p className="uc-empty-title">Compare URLs</p>
                        <p className="uc-empty-desc">
                            Paste two URLs above to compare their content, structure, and encoding
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .uc-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /*  Controls  */
                .uc-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    flex-wrap: wrap;
                }

                .uc-controls-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .uc-controls-label i {
                    font-size: 12px;
                }

                .uc-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .uc-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .uc-btn i {
                    font-size: 12px;
                }

                .uc-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .uc-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /*  Result  */
                .uc-result {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .uc-result-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px 18px;
                    border-radius: var(--radius-lg);
                    border: 0.5px solid;
                }

                .uc-result-card.identical {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .uc-result-card.different {
                    background: #EFF6FF;
                    border-color: #BFDBFE;
                }

                @media (prefers-color-scheme: dark) {
                    .uc-result-card.different {
                        background: #0A1628;
                        border-color: #1E3A5F;
                    }
                }

                .uc-result-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .uc-result-card.identical .uc-result-icon {
                    background: var(--brand);
                    color: white;
                }

                .uc-result-card.different .uc-result-icon {
                    background: #DBEAFE;
                    color: #1D4ED8;
                }

                @media (prefers-color-scheme: dark) {
                    .uc-result-card.different .uc-result-icon {
                        background: #1E3A8A;
                        color: #93C5FD;
                    }
                }

                .uc-result-content {
                    flex: 1;
                }

                .uc-result-title {
                    font-size: 14px;
                    font-weight: 700;
                    margin: 0 0 4px;
                }

                .uc-result-card.identical .uc-result-title {
                    color: var(--brand-text);
                }

                .uc-result-card.different .uc-result-title {
                    color: #1D4ED8;
                }

                @media (prefers-color-scheme: dark) {
                    .uc-result-card.different .uc-result-title {
                        color: #93C5FD;
                    }
                }

                .uc-result-desc {
                    font-size: 12px;
                    margin: 0;
                }

                .uc-result-card.identical .uc-result-desc {
                    color: var(--brand-text);
                    opacity: 0.8;
                }

                .uc-result-card.different .uc-result-desc {
                    color: #1D4ED8;
                    opacity: 0.8;
                }

                @media (prefers-color-scheme: dark) {
                    .uc-result-card.different .uc-result-desc {
                        color: #93C5FD;
                    }
                }

                /*  Details  */
                .uc-details {
                    padding: 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                }

                .uc-detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px;
                }

                .uc-detail-card {
                    padding: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .uc-detail-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10.5px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .uc-detail-header i {
                    font-size: 11px;
                }

                .uc-detail-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text);
                    line-height: 1;
                }

                .uc-detail-label {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .uc-detail-bar {
                    height: 6px;
                    background: var(--border);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .uc-detail-bar-fill {
                    height: 100%;
                    background: var(--brand);
                    border-radius: 99px;
                    transition: width 0.3s ease;
                }

                .uc-match {
                    color: var(--brand);
                }

                .uc-diff {
                    color: #B91C1C;
                }

                @media (prefers-color-scheme: dark) {
                    .uc-diff {
                        color: #F87171;
                    }
                }

                /*  Inputs  */
                .uc-inputs {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 12px;
                    flex: 1;
                    min-height: 0;
                }

                .uc-input-panel {
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    min-height: 0;
                }

                .uc-input-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 10px;
                }

                .uc-input-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .uc-input-label i {
                    font-size: 11px;
                }

                .uc-input-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .uc-meta-size {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .uc-meta-error,
                .uc-meta-valid {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 99px;
                }

                .uc-meta-error {
                    background: var(--error-bg);
                    color: #B91C1C;
                }

                @media (prefers-color-scheme: dark) {
                    .uc-meta-error {
                        color: #F87171;
                    }
                }

                .uc-meta-valid {
                    background: var(--brand-light);
                    color: var(--brand-text);
                }

                .uc-textarea {
                    flex: 1;
                    margin: 0;
                    padding: 12px 14px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    line-height: 1.7;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: none;
                    overflow: auto;
                    min-height: 200px;
                }

                .uc-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .uc-input-error {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: var(--error-bg);
                    border-top: 0.5px solid var(--border-faint);
                    color: #B91C1C;
                    font-size: 11px;
                }

                @media (prefers-color-scheme: dark) {
                    .uc-input-error {
                        color: #F87171;
                    }
                }

                .uc-input-error i {
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .uc-vs {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .uc-vs-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                }

                /*  Empty State  */
                .uc-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .uc-empty-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 13px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: var(--text-disabled);
                    margin-bottom: 6px;
                }

                .uc-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .uc-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 340px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 900px) {
                    .uc-inputs {
                    grid-template-columns: 1fr;
                    gap: 16px;
                    }
                    .uc-vs {
                    display: none;
                    }
                    .uc-detail-grid {
                    grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .uc-root {
                    padding: 12px;
                    }
                    .uc-controls {
                    padding: 8px 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .uc-btn,
                    .uc-detail-bar-fill {
                    transition: none;
                    }
                }
            `}</style>
        </>
    );
}