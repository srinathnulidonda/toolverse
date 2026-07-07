// features/dev/url-encoder/UrlBreakdown.tsx
"use client";

import { useState, useCallback } from "react";
import type { UrlParts } from "./utils";
import { exportAsJson, exportAsCsv, copyToClipboard } from "./utils";

interface UrlBreakdownProps {
    urlParts: UrlParts | null;
}

export default function UrlBreakdown({ urlParts }: UrlBreakdownProps) {
    const [copiedKey, setCopiedKey] = useState("");

    const handleCopy = useCallback(async (text: string, key: string) => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(""), 1500);
        }
    }, []);

    if (!urlParts) {
        return (
            <div className="ub-empty">
                <div className="ub-empty-icon">
                    <i className="ti ti-layout-list" />
                </div>
                <p className="ub-empty-title">No URL to parse</p>
                <p className="ub-empty-desc">Enter a valid URL to see its components</p>
            </div>
        );
    }

    const components = [
        urlParts.protocol && { key: "Protocol", value: urlParts.protocol, icon: "ti-shield-check", color: "proto" },
        urlParts.hostname && { key: "Host", value: urlParts.hostname, icon: "ti-world", color: "host" },
        urlParts.port && { key: "Port", value: urlParts.port, icon: "ti-plug", color: "" },
        urlParts.pathname !== "/" && { key: "Path", value: urlParts.pathname, icon: "ti-route", color: "path" },
        urlParts.hash && { key: "Fragment", value: urlParts.hash, icon: "ti-hash", color: "" },
        urlParts.username && { key: "Username", value: urlParts.username, icon: "ti-user", color: "" },
    ].filter(Boolean) as Array<{ key: string; value: string; icon: string; color: string }>;

    return (
        <>
            <div className="ub-root">
                {/* Components Section */}
                <section className="ub-section">
                    <header className="ub-section-header">Components</header>
                    <ul className="ub-list">
                        {components.map((comp, idx) => (
                            <li key={idx} className="ub-row">
                                <span className={`ub-icon ${comp.color || "default"}`}>
                                    <i className={`ti ${comp.icon}`} />
                                </span>
                                <span className="ub-key">{comp.key}</span>
                                <span className="ub-value">{comp.value}</span>
                                <button
                                    type="button"
                                    className={`ub-copy-btn${copiedKey === `comp-${idx}` ? " copied" : ""}`}
                                    onClick={() => handleCopy(comp.value, `comp-${idx}`)}
                                    aria-label={`Copy ${comp.key}`}
                                >
                                    <i className={`ti ${copiedKey === `comp-${idx}` ? "ti-check" : "ti-copy"}`} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Query Parameters */}
                {urlParts.searchParams.length > 0 && (
                    <section className="ub-section">
                        <header className="ub-section-header">
                            Query parameters
                            <span className="ub-count-badge">{urlParts.searchParams.length}</span>
                        </header>

                        <div className="ub-table-wrap">
                            <table className="ub-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Key</th>
                                        <th>Value</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {urlParts.searchParams.map(([key, value], idx) => (
                                        <tr key={idx}>
                                            <td className="ub-table-num">{idx + 1}</td>
                                            <td className="ub-table-key">{key}</td>
                                            <td className="ub-table-value">
                                                {value || <em className="ub-table-empty">empty</em>}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={`ub-copy-btn${copiedKey === `param-${idx}` ? " copied" : ""}`}
                                                    onClick={() => handleCopy(`${key}=${value}`, `param-${idx}`)}
                                                    aria-label={`Copy ${key}`}
                                                >
                                                    <i className={`ti ${copiedKey === `param-${idx}` ? "ti-check" : "ti-copy"}`} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="ub-export-row">
                            <button
                                type="button"
                                className="ub-export-btn"
                                onClick={() => handleCopy(exportAsJson(urlParts), "json")}
                            >
                                <i className="ti ti-braces" />
                                {copiedKey === "json" ? "Copied!" : "Copy as JSON"}
                            </button>
                            <button
                                type="button"
                                className="ub-export-btn"
                                onClick={() => handleCopy(exportAsCsv(urlParts.searchParams), "csv")}
                            >
                                <i className="ti ti-table" />
                                {copiedKey === "csv" ? "Copied!" : "Copy as CSV"}
                            </button>
                        </div>
                    </section>
                )}
            </div>

            <style jsx>{`
                .ub-root {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /*  Empty State  */
                .ub-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .ub-empty-icon {
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

                .ub-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .ub-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                /*  Section  */
                .ub-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .ub-section-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-tertiary);
                }

                .ub-count-badge {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 0 5px;
                    border-radius: 99px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    color: var(--text-tertiary);
                }

                /*  List  */
                .ub-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .ub-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    border-radius: var(--radius-md);
                    transition: background 0.1s;
                }

                .ub-row:hover {
                    background: var(--bg-surface);
                }

                .ub-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 7px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    color: var(--text-tertiary);
                }

                .ub-icon.proto {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                    color: var(--brand);
                }

                .ub-icon.host {
                    background: #EFF6FF;
                    border-color: #BFDBFE;
                    color: #1D4ED8;
                }

                @media (prefers-color-scheme: dark) {
                    .ub-icon.host {
                        background: #0A1628;
                        border-color: #1E3A5F;
                        color: #93C5FD;
                    }
                }

                .ub-icon.path {
                    background: var(--bg-surface);
                    border-color: var(--border);
                    color: var(--text-secondary);
                }

                .ub-key {
                    width: 70px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-tertiary);
                    flex-shrink: 0;
                }

                .ub-value {
                    flex: 1;
                    font-size: 12.5px;
                    color: var(--brand);
                    font-family: var(--font-mono);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .ub-copy-btn {
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
                    transition: opacity 0.1s, color 0.1s;
                    flex-shrink: 0;
                }

                .ub-row:hover .ub-copy-btn,
                .ub-table tbody tr:hover .ub-copy-btn {
                    opacity: 1;
                }

                .ub-copy-btn:hover {
                    color: var(--brand);
                }

                .ub-copy-btn.copied {
                    opacity: 1;
                    color: var(--brand);
                }

                /*  Table  */
                .ub-table-wrap {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .ub-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12.5px;
                }

                .ub-table thead th {
                    text-align: left;
                    padding: 8px 10px;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .ub-table thead th:first-child {
                    width: 40px;
                    text-align: center;
                }

                .ub-table thead th:last-child {
                    width: 40px;
                }

                .ub-table tbody tr {
                    transition: background 0.1s;
                }

                .ub-table tbody tr:hover {
                    background: var(--bg-surface);
                }

                .ub-table td {
                    padding: 10px;
                    border-bottom: 0.5px solid var(--border);
                    vertical-align: middle;
                }

                .ub-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .ub-table-num {
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                    font-size: 11px;
                    text-align: center;
                }

                .ub-table-key {
                    color: var(--brand);
                    font-weight: 600;
                    font-family: var(--font-mono);
                }

                .ub-table-value {
                    color: var(--text-secondary);
                    font-family: var(--font-mono);
                    word-break: break-all;
                }

                .ub-table-empty {
                    color: var(--text-disabled);
                    font-style: normal;
                    font-size: 11px;
                }

                /*  Export  */
                .ub-export-row {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                    padding-top: 6px;
                }

                .ub-export-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: 99px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .ub-export-btn i {
                    font-size: 12px;
                }

                .ub-export-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .ub-root {
                        padding: 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ub-row,
                    .ub-table tbody tr,
                    .ub-copy-btn,
                    .ub-export-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}