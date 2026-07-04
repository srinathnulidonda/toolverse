// features/dev/base64-encoder/Base64Preview.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { detectMime, extensionForMime, formatBytes, looksBinary, readFileAsBase64 } from "./utils";
import type { Mode, InputSource } from "./utils";

interface Base64PreviewProps {
    mode: Mode;
    source: InputSource;
    input: string;
    output: string;
    file: File | null;
    decodeResult: { text: string; error?: string; bytes?: Uint8Array };
    dragOver: boolean;
    mobileView: "input" | "output";
    fileRef: React.RefObject<HTMLInputElement>;
    onInputChange: (value: string) => void;
    onFileChange: (file: File | null) => void;
    onDragOver: (over: boolean) => void;
    onDrop: (e: React.DragEvent) => void;
    onMobileViewChange: (view: "input" | "output") => void;
}

export default function Base64Preview({
    mode,
    source,
    input,
    output,
    file,
    decodeResult,
    dragOver,
    mobileView,
    fileRef,
    onInputChange,
    onFileChange,
    onDragOver,
    onDrop,
    onMobileViewChange,
}: Base64PreviewProps) {
    const [fileBase64, setFileBase64] = useState("");

    useEffect(() => {
        if (file && mode === "encode") {
            readFileAsBase64(file).then(setFileBase64);
        }
    }, [file, mode]);

    const decodeImageInfo = useMemo(() => {
        if (mode !== "decode" || !input.trim() || decodeResult.error) return null;
        return detectMime(input);
    }, [mode, input, decodeResult.error]);

    const isBinaryOutput = useMemo(() => {
        if (mode !== "decode" || decodeResult.error || decodeImageInfo) return false;
        return looksBinary(output);
    }, [mode, decodeResult.error, decodeImageInfo, output]);

    const inputBytes = useMemo(() => {
        if (mode === "encode" && source === "file") return file?.size ?? 0;
        return new Blob([input]).size;
    }, [mode, source, file, input]);

    const outputBytes = useMemo(() => new Blob([output]).size, [output]);

    const ratio = inputBytes > 0 && outputBytes > 0
        ? Math.round((outputBytes / inputBytes) * 100)
        : null;

    const hasContent = mode === "encode" ? (source === "file" ? !!file : !!input) : !!input;

    return (
        <>
            <div className="bp-root">
                {/* ── Mobile Switcher ── */}
                <div className="bp-mobile-tabs">
                    <button
                        type="button"
                        className={`bp-mobile-tab${mobileView === "input" ? " active" : ""}`}
                        onClick={() => onMobileViewChange("input")}
                    >
                        <i className="ti ti-pencil" />
                        Input
                    </button>
                    <button
                        type="button"
                        className={`bp-mobile-tab${mobileView === "output" ? " active" : ""}`}
                        onClick={() => onMobileViewChange("output")}
                    >
                        <i className="ti ti-eye" />
                        Output
                        {output && <span className="bp-mobile-dot" />}
                    </button>
                </div>

                {/* ── Panels ── */}
                <div className="bp-panels">
                    {/* Input Panel */}
                    <div className={`bp-panel${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}>
                        <div className="bp-panel-header">
                            <div className="bp-panel-label">
                                <i className="ti ti-pencil" />
                                Input
                            </div>
                            <div className="bp-panel-meta">
                                {inputBytes > 0 && (
                                    <span className="bp-meta-text">{formatBytes(inputBytes)}</span>
                                )}
                            </div>
                        </div>

                        <div className="bp-panel-body">
                            {mode === "encode" && source === "file" ? (
                                <div
                                    className={`bp-dropzone${dragOver ? " drag-over" : ""}${file ? " has-file" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); onDragOver(true); }}
                                    onDragLeave={() => onDragOver(false)}
                                    onDrop={onDrop}
                                    onClick={() => fileRef.current?.click()}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        className="bp-file-input"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            onFileChange(f || null);
                                        }}
                                    />
                                    {file ? (
                                        <div className="bp-file-card">
                                            {file.type.startsWith("image/") && fileBase64 ? (
                                                <img
                                                    src={`data:${file.type};base64,${fileBase64}`}
                                                    alt=""
                                                    className="bp-file-thumb"
                                                />
                                            ) : (
                                                <div className="bp-file-icon">
                                                    <i className="ti ti-file-check" />
                                                </div>
                                            )}
                                            <div className="bp-file-meta">
                                                <span className="bp-file-name">{file.name}</span>
                                                <span className="bp-file-sub">
                                                    {formatBytes(file.size)} · {file.type || "unknown"}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="bp-icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onFileChange(null);
                                                }}
                                            >
                                                <i className="ti ti-x" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bp-drop-empty">
                                            <div className="bp-drop-icon">
                                                <i className="ti ti-cloud-upload" />
                                            </div>
                                            <p className="bp-drop-title">Drop a file here</p>
                                            <p className="bp-drop-sub">or click to browse — any file type, any size</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    className="bp-textarea"
                                    value={input}
                                    onChange={(e) => onInputChange(e.target.value)}
                                    placeholder={
                                        mode === "encode"
                                            ? "Type or paste text to encode..."
                                            : "Paste a Base64 string to decode..."
                                    }
                                    spellCheck={false}
                                />
                            )}
                        </div>

                        {decodeResult.error && (
                            <div className="bp-error-bar">
                                <i className="ti ti-alert-circle" />
                                <div>
                                    <strong>Decode error</strong>
                                    <span>{decodeResult.error}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="bp-divider">
                        <div className="bp-divider-icon">
                            <i className="ti ti-arrow-right" />
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className={`bp-panel${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}>
                        <div className="bp-panel-header">
                            <div className="bp-panel-label">
                                <i className="ti ti-eye" />
                                Output
                            </div>
                            <div className="bp-panel-meta">
                                {outputBytes > 0 && (
                                    <span className="bp-meta-text">{formatBytes(outputBytes)}</span>
                                )}
                                {ratio !== null && (
                                    <span className="bp-ratio-pill">{ratio}%</span>
                                )}
                            </div>
                        </div>

                        <div className="bp-panel-body">
                            {!output ? (
                                <div className="bp-empty">
                                    <div className="bp-empty-icon">
                                        <i className="ti ti-arrow-big-right-lines" />
                                    </div>
                                    <p className="bp-empty-title">Output appears here</p>
                                    <p className="bp-empty-desc">
                                        {mode === "encode"
                                            ? source === "file"
                                                ? "Drop a file on the left to encode"
                                                : "Start typing on the left"
                                            : "Paste a Base64 string on the left"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Image Preview for Decode */}
                                    {mode === "decode" && decodeImageInfo && (
                                        <div className="bp-preview">
                                            <img
                                                src={`data:${decodeImageInfo.mime};base64,${input.replace(/\s/g, "")}`}
                                                alt="Decoded preview"
                                                className="bp-preview-img"
                                            />
                                            <span className="bp-preview-label">
                                                Image preview · {decodeImageInfo.mime} · .{extensionForMime(decodeImageInfo.mime)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Image Preview for Encode */}
                                    {mode === "encode" && source === "file" && file?.type.startsWith("image/") && fileBase64 && (
                                        <div className="bp-preview">
                                            <img
                                                src={`data:${file.type};base64,${fileBase64}`}
                                                alt="Source preview"
                                                className="bp-preview-img"
                                            />
                                            <span className="bp-preview-label">Source preview · {file.type}</span>
                                        </div>
                                    )}

                                    {/* Binary Data Message */}
                                    {mode === "decode" && isBinaryOutput && !decodeImageInfo ? (
                                        <div className="bp-binary-msg">
                                            <div className="bp-binary-icon">
                                                <i className="ti ti-binary" />
                                            </div>
                                            <p className="bp-binary-title">Binary data decoded</p>
                                            <p className="bp-binary-desc">
                                                This doesn't look like readable text — download it as a raw file.
                                            </p>
                                        </div>
                                    ) : (
                                        !decodeImageInfo && (
                                            <pre className="bp-output">{output}</pre>
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Status Bar ── */}
                {hasContent && (
                    <div className="bp-status">
                        <div className="bp-status-badges">
                            {decodeResult.error ? (
                                <span className="bp-badge error">
                                    <i className="ti ti-alert-triangle" />
                                    {decodeResult.error}
                                </span>
                            ) : decodeImageInfo ? (
                                <span className="bp-badge brand">
                                    <i className="ti ti-photo" />
                                    {decodeImageInfo.mime}
                                </span>
                            ) : isBinaryOutput ? (
                                <span className="bp-badge neutral">
                                    <i className="ti ti-binary" />
                                    Binary data
                                </span>
                            ) : hasContent ? (
                                <span className="bp-badge valid">
                                    <i className="ti ti-check" />
                                    Ready
                                </span>
                            ) : null}
                        </div>

                        <div className="bp-stats">
                            <span className="bp-stat">
                                <span className="bp-stat-value">{formatBytes(inputBytes)}</span>
                                <span className="bp-stat-label">in</span>
                            </span>
                            <i className="ti ti-arrow-right bp-stat-arrow" />
                            <span className="bp-stat">
                                <span className="bp-stat-value">{formatBytes(outputBytes)}</span>
                                <span className="bp-stat-label">out</span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .bp-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /* ── Mobile Tabs ── */
                .bp-mobile-tabs {
                    display: none;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .bp-mobile-tab {
                    flex: 1;
                    height: 42px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.12s;
                }

                .bp-mobile-tab.active {
                    color: var(--text);
                }

                .bp-mobile-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .bp-mobile-dot {
                    position: absolute;
                    top: 10px;
                    right: calc(50% - 35px);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--brand);
                }

                /* ── Panels ── */
                .bp-panels {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    min-height: 0;
                    overflow: hidden;
                }

                .bp-panel {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                .bp-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 14px;
                    height: 38px;
                    border-bottom: 0.5px solid var(--border-faint);
                    background: var(--bg-surface);
                    flex-shrink: 0;
                }

                .bp-panel-label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 10.5px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                }

                .bp-panel-label i {
                    font-size: 11px;
                }

                .bp-panel-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bp-meta-text {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .bp-ratio-pill {
                    font-size: 10px;
                    font-weight: 600;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    padding: 2px 7px;
                    border-radius: 99px;
                }

                .bp-panel-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /* ── Divider ── */
                .bp-divider {
                    width: 1px;
                    background: var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .bp-divider-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                /* ── Textarea ── */
                .bp-textarea {
                    flex: 1;
                    margin: 0;
                    padding: 14px 16px;
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    line-height: 1.7;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: none;
                    overflow: auto;
                }

                .bp-textarea::placeholder {
                    color: var(--text-disabled);
                }

                /* ── Output ── */
                .bp-output {
                    flex: 1;
                    margin: 0;
                    padding: 14px 16px;
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    line-height: 1.7;
                    color: var(--text);
                    background: transparent;
                    border: none;
                    overflow: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                /* ── Dropzone ── */
                .bp-dropzone {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 14px;
                    border: 1.5px dashed var(--border);
                    border-radius: var(--b64-radius-lg);
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bp-dropzone:hover,
                .bp-dropzone.drag-over {
                    border-color: var(--brand);
                    background: var(--brand-light);
                }

                .bp-dropzone.has-file {
                    border-style: solid;
                    border-color: var(--brand-border);
                }

                .bp-file-input {
                    display: none;
                }

                .bp-drop-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 32px;
                    text-align: center;
                }

                .bp-drop-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: var(--text-tertiary);
                    margin-bottom: 4px;
                }

                .bp-drop-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .bp-drop-sub {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                }

                /* ── File Card ── */
                .bp-file-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    width: 100%;
                }

                .bp-file-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--b64-radius-md);
                    object-fit: cover;
                    border: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .bp-file-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--b64-radius-md);
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: var(--brand);
                    flex-shrink: 0;
                }

                .bp-file-meta {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                }

                .bp-file-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bp-file-sub {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .bp-icon-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bp-icon-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                /* ── Preview ── */
                .bp-preview {
                    padding: 14px;
                    border-bottom: 0.5px solid var(--border-faint);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    background: var(--bg-surface);
                    flex-shrink: 0;
                }

                .bp-preview-img {
                    max-height: 160px;
                    max-width: 100%;
                    border-radius: var(--b64-radius-md);
                    object-fit: contain;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                }

                .bp-preview-label {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                /* ── Empty State ── */
                .bp-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 32px;
                    text-align: center;
                }

                .bp-empty-icon {
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
                    margin-bottom: 4px;
                }

                .bp-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .bp-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 300px;
                }

                /* ── Binary Message ── */
                .bp-binary-msg {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 32px;
                    text-align: center;
                }

                .bp-binary-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: var(--text-tertiary);
                    margin-bottom: 4px;
                }

                .bp-binary-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .bp-binary-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 300px;
                }

                /* ── Error Bar ── */
                .bp-error-bar {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    padding: 12px 16px;
                    background: var(--error-bg);
                    border-top: 0.5px solid var(--border-faint);
                    flex-shrink: 0;
                }

                .bp-error-bar i {
                    font-size: 15px;
                    color: #B91C1C;
                    flex-shrink: 0;
                }

                @media (prefers-color-scheme: dark) {
                    .bp-error-bar i {
                        color: #F87171;
                    }
                }

                .bp-error-bar strong {
                    font-size: 12px;
                    font-weight: 600;
                    color: #B91C1C;
                    display: block;
                    margin-bottom: 2px;
                }

                @media (prefers-color-scheme: dark) {
                    .bp-error-bar strong {
                        color: #F87171;
                    }
                }

                .bp-error-bar span {
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                /* ── Status Bar ── */
                .bp-status {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    min-height: 42px;
                    padding: 8px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    flex-wrap: wrap;
                }

                .bp-status-badges {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .bp-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11px;
                    font-weight: 500;
                    padding: 4px 10px;
                    border-radius: 99px;
                }

                .bp-badge i {
                    font-size: 12px;
                }

                .bp-badge.error {
                    color: #B91C1C;
                    background: var(--error-bg);
                    border: 0.5px solid #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .bp-badge.error {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                .bp-badge.brand {
                    color: var(--brand-text);
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                }

                .bp-badge.neutral {
                    color: var(--text-tertiary);
                    background: transparent;
                    border: 0.5px solid var(--border-faint);
                }

                .bp-badge.valid {
                    color: var(--brand-text);
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                }

                .bp-stats {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .bp-stat {
                    display: inline-flex;
                    align-items: baseline;
                    gap: 4px;
                }

                .bp-stat-value {
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .bp-stat-label {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .bp-stat-arrow {
                    font-size: 10px;
                    color: var(--text-disabled);
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .bp-mobile-tabs {
                        display: flex;
                    }

                    .bp-panels {
                        display: block;
                    }

                    .bp-divider {
                        display: none;
                    }

                    .bp-panel {
                        min-height: 360px;
                    }

                    .bp-panel.mobile-hidden {
                        display: none;
                    }

                    .bp-panel.mobile-visible {
                        display: flex;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .bp-mobile-tab,
                    .bp-dropzone,
                    .bp-icon-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}