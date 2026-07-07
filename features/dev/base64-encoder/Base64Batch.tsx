// features/dev/base64-encoder/Base64Batch.tsx
"use client";

import { useState, useCallback } from "react";
import { encodeBase64, decodeBase64, type Mode, type EncodingOptions } from "./utils";
import { formatBytes } from "@/utils";

interface BatchItem {
    id: string;
    input: string;
    output: string;
    status: "pending" | "processing" | "done" | "error";
    error?: string;
    inputSize: number;
    outputSize: number;
}

interface Base64BatchProps {
    mode: Mode;
    options: EncodingOptions;
    onComplete?: () => void;
}

export default function Base64Batch({ mode, options, onComplete }: Base64BatchProps) {
    const [items, setItems] = useState<BatchItem[]>([]);
    const [batchInput, setBatchInput] = useState("");
    const [separator, setSeparator] = useState<"newline" | "comma" | "semicolon">("newline");
    const [processing, setProcessing] = useState(false);

    const handleProcess = useCallback(async () => {
        if (!batchInput.trim()) return;

        setProcessing(true);

        const separatorMap = {
            newline: "\n",
            comma: ",",
            semicolon: ";",
        };

        const inputs = batchInput
            .split(separatorMap[separator])
            .map((s) => s.trim())
            .filter(Boolean);

        const newItems: BatchItem[] = inputs.map((input, i) => ({
            id: `${Date.now()}-${i}`,
            input,
            output: "",
            status: "pending" as const,
            inputSize: new Blob([input]).size,
            outputSize: 0,
        }));

        setItems(newItems);

        // Process each item
        for (let i = 0; i < newItems.length; i++) {
            setItems((prev) =>
                prev.map((item, idx) =>
                    idx === i ? { ...item, status: "processing" as const } : item
                )
            );

            await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing

            try {
                let output: string;
                if (mode === "encode") {
                    output = encodeBase64(newItems[i].input, options);
                } else {
                    const result = decodeBase64(newItems[i].input, options);
                    if (result.error) throw new Error(result.error);
                    output = result.text;
                }

                setItems((prev) =>
                    prev.map((item, idx) =>
                        idx === i
                            ? {
                                ...item,
                                output,
                                outputSize: new Blob([output]).size,
                                status: "done" as const,
                            }
                            : item
                    )
                );
            } catch (err) {
                setItems((prev) =>
                    prev.map((item, idx) =>
                        idx === i
                            ? {
                                ...item,
                                status: "error" as const,
                                error: err instanceof Error ? err.message : "Failed",
                            }
                            : item
                    )
                );
            }
        }

        setProcessing(false);
        if (onComplete) onComplete();
    }, [batchInput, separator, mode, options, onComplete]);

    const handleCopyAll = useCallback(async () => {
        const outputs = items.filter((i) => i.status === "done").map((i) => i.output);
        await navigator.clipboard.writeText(outputs.join("\n"));
    }, [items]);

    const handleDownloadAll = useCallback(() => {
        const outputs = items.filter((i) => i.status === "done").map((i) => i.output);
        const blob = new Blob([outputs.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch-${mode}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, [items, mode]);

    const handleClear = useCallback(() => {
        setBatchInput("");
        setItems([]);
    }, []);

    const doneCount = items.filter((i) => i.status === "done").length;
    const errorCount = items.filter((i) => i.status === "error").length;

    return (
        <>
            <div className="bb-root">
                {/*  Input Section  */}
                <div className="bb-section">
                    <div className="bb-section-header">
                        <div className="bb-section-label">
                            <i className="ti ti-files" />
                            Batch Input
                        </div>
                        <div className="bb-section-actions">
                            <div className="bb-separator-group">
                                <span className="bb-separator-label">Split by:</span>
                                <select
                                    className="bb-select"
                                    value={separator}
                                    onChange={(e) => setSeparator(e.target.value as any)}
                                    disabled={processing}
                                >
                                    <option value="newline">New line</option>
                                    <option value="comma">Comma (,)</option>
                                    <option value="semicolon">Semicolon (;)</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                className="bb-btn"
                                onClick={handleClear}
                                disabled={!batchInput && items.length === 0}
                            >
                                <i className="ti ti-trash" />
                                Clear
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="bb-textarea"
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        placeholder={`Enter multiple ${mode === "encode" ? "strings" : "Base64 strings"} (one per line)...`}
                        rows={8}
                        disabled={processing}
                    />
                    <div className="bb-input-footer">
                        <span className="bb-input-count">
                            {batchInput.split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";").filter(s => s.trim()).length} items
                        </span>
                        <button
                            type="button"
                            className="bb-btn bb-btn-primary"
                            onClick={handleProcess}
                            disabled={!batchInput.trim() || processing}
                        >
                            <i className={`ti ${processing ? "ti-loader" : "ti-player-play"}`} />
                            {processing ? "Processing..." : `${mode === "encode" ? "Encode" : "Decode"} All`}
                        </button>
                    </div>
                </div>

                {/*  Results Section  */}
                {items.length > 0 && (
                    <div className="bb-section">
                        <div className="bb-section-header">
                            <div className="bb-section-label">
                                <i className="ti ti-list-check" />
                                Results
                                <span className="bb-results-badge">
                                    {doneCount}/{items.length}
                                </span>
                                {errorCount > 0 && (
                                    <span className="bb-error-badge">{errorCount} errors</span>
                                )}
                            </div>
                            <div className="bb-section-actions">
                                <button
                                    type="button"
                                    className="bb-btn"
                                    onClick={handleCopyAll}
                                    disabled={doneCount === 0}
                                >
                                    <i className="ti ti-copy" />
                                    Copy All
                                </button>
                                <button
                                    type="button"
                                    className="bb-btn"
                                    onClick={handleDownloadAll}
                                    disabled={doneCount === 0}
                                >
                                    <i className="ti ti-download" />
                                    Download
                                </button>
                            </div>
                        </div>

                        <div className="bb-results">
                            {items.map((item, idx) => (
                                <div key={item.id} className={`bb-result-item status-${item.status}`}>
                                    <div className="bb-result-header">
                                        <div className="bb-result-index">#{idx + 1}</div>
                                        <div className="bb-result-status">
                                            {item.status === "pending" && (
                                                <span className="bb-status-badge pending">
                                                    <i className="ti ti-clock" />
                                                    Pending
                                                </span>
                                            )}
                                            {item.status === "processing" && (
                                                <span className="bb-status-badge processing">
                                                    <i className="ti ti-loader" />
                                                    Processing
                                                </span>
                                            )}
                                            {item.status === "done" && (
                                                <span className="bb-status-badge done">
                                                    <i className="ti ti-check" />
                                                    Done
                                                </span>
                                            )}
                                            {item.status === "error" && (
                                                <span className="bb-status-badge error">
                                                    <i className="ti ti-alert-circle" />
                                                    Error
                                                </span>
                                            )}
                                        </div>
                                        <div className="bb-result-sizes">
                                            {formatBytes(item.inputSize)} → {formatBytes(item.outputSize)}
                                        </div>
                                        {item.status === "done" && (
                                            <button
                                                type="button"
                                                className="bb-icon-btn"
                                                onClick={() => navigator.clipboard.writeText(item.output)}
                                                title="Copy result"
                                            >
                                                <i className="ti ti-copy" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="bb-result-content">
                                        <div className="bb-result-input">
                                            <span className="bb-result-label">Input:</span>
                                            <code className="bb-result-code">{item.input.substring(0, 60)}{item.input.length > 60 ? "..." : ""}</code>
                                        </div>
                                        {item.status === "done" && (
                                            <div className="bb-result-output">
                                                <span className="bb-result-label">Output:</span>
                                                <code className="bb-result-code">{item.output.substring(0, 60)}{item.output.length > 60 ? "..." : ""}</code>
                                            </div>
                                        )}
                                        {item.status === "error" && item.error && (
                                            <div className="bb-result-error">
                                                <i className="ti ti-alert-triangle" />
                                                {item.error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/*  Empty State  */}
                {items.length === 0 && !batchInput && (
                    <div className="bb-empty">
                        <div className="bb-empty-icon">
                            <i className="ti ti-files" />
                        </div>
                        <p className="bb-empty-title">Batch {mode === "encode" ? "Encode" : "Decode"}</p>
                        <p className="bb-empty-desc">
                            Process multiple {mode === "encode" ? "strings" : "Base64 strings"} at once. Enter one per line above.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .bb-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /*  Section  */
                .bb-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--b64-radius-lg);
                    overflow: hidden;
                }

                .bb-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .bb-section-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .bb-section-label i {
                    font-size: 12px;
                }

                .bb-results-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 20px;
                    padding: 0 7px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 600;
                }

                .bb-error-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 20px;
                    padding: 0 7px;
                    border-radius: 99px;
                    background: var(--error-bg);
                    color: #B91C1C;
                    font-size: 10px;
                    font-weight: 600;
                }

                @media (prefers-color-scheme: dark) {
                    .bb-error-badge {
                        color: #F87171;
                    }
                }

                .bb-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .bb-separator-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bb-separator-label {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .bb-select {
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--b64-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .bb-select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bb-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--b64-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bb-btn i {
                    font-size: 12px;
                }

                .bb-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .bb-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .bb-btn-primary {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .bb-btn-primary:hover:not(:disabled) {
                    background: var(--brand);
                    color: white;
                }

                /*  Textarea  */
                .bb-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    line-height: 1.7;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: vertical;
                    min-height: 120px;
                }

                .bb-textarea:disabled {
                    opacity: 0.6;
                }

                .bb-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .bb-input-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    gap: 12px;
                }

                .bb-input-count {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                /*  Results  */
                .bb-results {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border-faint);
                }

                .bb-result-item {
                    background: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .bb-result-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                }

                .bb-result-index {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                    min-width: 32px;
                }

                .bb-result-status {
                    flex: 1;
                }

                .bb-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 99px;
                }

                .bb-status-badge i {
                    font-size: 11px;
                }

                .bb-status-badge.pending {
                    background: var(--bg-card);
                    color: var(--text-disabled);
                    border: 0.5px solid var(--border);
                }

                .bb-status-badge.processing {
                    background: #EFF6FF;
                    color: #1D4ED8;
                    border: 0.5px solid #BFDBFE;
                }

                @media (prefers-color-scheme: dark) {
                    .bb-status-badge.processing {
                        background: #0A1628;
                        color: #93C5FD;
                        border-color: #1E3A5F;
                    }
                }

                .bb-status-badge.done {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border: 0.5px solid var(--brand-border);
                }

                .bb-status-badge.error {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border: 0.5px solid #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .bb-status-badge.error {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                .bb-result-sizes {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .bb-icon-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 5px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bb-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .bb-result-content {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px 14px;
                }

                .bb-result-input,
                .bb-result-output {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bb-result-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .bb-result-code {
                    font-family: var(--font-mono);
                    font-size: 11.5px;
                    color: var(--text);
                    background: var(--bg-surface);
                    padding: 6px 10px;
                    border-radius: 5px;
                    border: 0.5px solid var(--border-faint);
                    word-break: break-all;
                }

                .bb-result-error {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 10px;
                    background: var(--error-bg);
                    border-radius: 5px;
                    color: #B91C1C;
                    font-size: 11px;
                }

                @media (prefers-color-scheme: dark) {
                    .bb-result-error {
                        color: #F87171;
                    }
                }

                .bb-result-error i {
                    font-size: 12px;
                    flex-shrink: 0;
                }

                /*  Empty State  */
                .bb-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .bb-empty-icon {
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

                .bb-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .bb-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .bb-root {
                        padding: 12px;
                    }

                    .bb-section-header {
                        padding: 8px 12px;
                    }

                    .bb-textarea {
                        padding: 10px 12px;
                    }

                    .bb-result-header {
                        padding: 8px 12px;
                    }

                    .bb-result-content {
                        padding: 10px 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .bb-btn,
                    .bb-icon-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}