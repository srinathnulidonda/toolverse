// features/dev/url-encoder/UrlBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { encodeUrl, decodeUrl, type Mode, type EncodingOptions } from "./utils";
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

interface UrlBatchProps {
    mode: Mode;
    options: EncodingOptions;
}

export default function UrlBatch({ mode, options }: UrlBatchProps) {
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

            await new Promise((resolve) => setTimeout(resolve, 100));

            try {
                let output: string;
                if (mode === "encode") {
                    output = encodeUrl(newItems[i].input, options);
                } else {
                    const result = decodeUrl(newItems[i].input, options);
                    if (result.error) throw new Error(result.error);
                    output = result.result;
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
    }, [batchInput, separator, mode, options]);

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

    const inputCount = batchInput
        .split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";")
        .filter((s) => s.trim()).length;

    return (
        <>
            <div className="ubt-root">
                {/*  Input Section  */}
                <div className="ubt-section">
                    <div className="ubt-section-header">
                        <div className="ubt-section-label">
                            <i className="ti ti-files" />
                            Batch Input
                        </div>
                        <div className="ubt-section-actions">
                            <div className="ubt-separator-group">
                                <span className="ubt-separator-label">Split by:</span>
                                <select
                                    className="ubt-select"
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
                                className="ubt-btn"
                                onClick={handleClear}
                                disabled={!batchInput && items.length === 0}
                            >
                                <i className="ti ti-trash" />
                                Clear
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="ubt-textarea"
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        placeholder={`Enter multiple ${mode === "encode" ? "URLs" : "encoded strings"} (one per line)...`}
                        rows={8}
                        disabled={processing}
                        spellCheck={false}
                    />
                    <div className="ubt-input-footer">
                        <span className="ubt-input-count">
                            {inputCount} {inputCount === 1 ? "item" : "items"}
                        </span>
                        <button
                            type="button"
                            className="ubt-btn ubt-btn-primary"
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
                    <div className="ubt-section">
                        <div className="ubt-section-header">
                            <div className="ubt-section-label">
                                <i className="ti ti-list-check" />
                                Results
                                <span className="ubt-results-badge">
                                    {doneCount}/{items.length}
                                </span>
                                {errorCount > 0 && (
                                    <span className="ubt-error-badge">{errorCount} errors</span>
                                )}
                            </div>
                            <div className="ubt-section-actions">
                                <button
                                    type="button"
                                    className="ubt-btn"
                                    onClick={handleCopyAll}
                                    disabled={doneCount === 0}
                                >
                                    <i className="ti ti-copy" />
                                    Copy All
                                </button>
                                <button
                                    type="button"
                                    className="ubt-btn"
                                    onClick={handleDownloadAll}
                                    disabled={doneCount === 0}
                                >
                                    <i className="ti ti-download" />
                                    Download
                                </button>
                            </div>
                        </div>

                        <div className="ubt-results">
                            {items.map((item, idx) => (
                                <div key={item.id} className={`ubt-result-item status-${item.status}`}>
                                    <div className="ubt-result-header">
                                        <div className="ubt-result-index">#{idx + 1}</div>
                                        <div className="ubt-result-status">
                                            {item.status === "pending" && (
                                                <span className="ubt-status-badge pending">
                                                    <i className="ti ti-clock" />
                                                    Pending
                                                </span>
                                            )}
                                            {item.status === "processing" && (
                                                <span className="ubt-status-badge processing">
                                                    <i className="ti ti-loader" />
                                                    Processing
                                                </span>
                                            )}
                                            {item.status === "done" && (
                                                <span className="ubt-status-badge done">
                                                    <i className="ti ti-check" />
                                                    Done
                                                </span>
                                            )}
                                            {item.status === "error" && (
                                                <span className="ubt-status-badge error">
                                                    <i className="ti ti-alert-circle" />
                                                    Error
                                                </span>
                                            )}
                                        </div>
                                        <div className="ubt-result-sizes">
                                            {formatBytes(item.inputSize)} → {formatBytes(item.outputSize)}
                                        </div>
                                        {item.status === "done" && (
                                            <button
                                                type="button"
                                                className="ubt-icon-btn"
                                                onClick={() => navigator.clipboard.writeText(item.output)}
                                                title="Copy result"
                                            >
                                                <i className="ti ti-copy" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="ubt-result-content">
                                        <div className="ubt-result-input">
                                            <span className="ubt-result-label">Input:</span>
                                            <code className="ubt-result-code">
                                                {item.input.substring(0, 80)}
                                                {item.input.length > 80 ? "..." : ""}
                                            </code>
                                        </div>
                                        {item.status === "done" && (
                                            <div className="ubt-result-output">
                                                <span className="ubt-result-label">Output:</span>
                                                <code className="ubt-result-code">
                                                    {item.output.substring(0, 80)}
                                                    {item.output.length > 80 ? "..." : ""}
                                                </code>
                                            </div>
                                        )}
                                        {item.status === "error" && item.error && (
                                            <div className="ubt-result-error">
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
                    <div className="ubt-empty">
                        <div className="ubt-empty-icon">
                            <i className="ti ti-files" />
                        </div>
                        <p className="ubt-empty-title">Batch {mode === "encode" ? "Encode" : "Decode"}</p>
                        <p className="ubt-empty-desc">
                            Process multiple {mode === "encode" ? "URLs" : "encoded strings"} at once. Enter one per line above.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .ubt-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /*  Section  */
                .ubt-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .ubt-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .ubt-section-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ubt-section-label i {
                    font-size: 12px;
                }

                .ubt-results-badge {
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

                .ubt-error-badge {
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
                    .ubt-error-badge {
                        color: #F87171;
                    }
                }

                .ubt-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .ubt-separator-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ubt-separator-label {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .ubt-select {
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .ubt-select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .ubt-btn {
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

                .ubt-btn i {
                    font-size: 12px;
                }

                .ubt-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .ubt-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .ubt-btn-primary {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .ubt-btn-primary:hover:not(:disabled) {
                    background: var(--brand);
                    color: white;
                }

                /*  Textarea  */
                .ubt-textarea {
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

                .ubt-textarea:disabled {
                    opacity: 0.6;
                }

                .ubt-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .ubt-input-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    gap: 12px;
                }

                .ubt-input-count {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                /*  Results  */
                .ubt-results {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border-faint);
                }

                .ubt-result-item {
                    background: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .ubt-result-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                }

                .ubt-result-index {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                    min-width: 32px;
                }

                .ubt-result-status {
                    flex: 1;
                }

                .ubt-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 99px;
                }

                .ubt-status-badge i {
                    font-size: 11px;
                }

                .ubt-status-badge.pending {
                    background: var(--bg-card);
                    color: var(--text-disabled);
                    border: 0.5px solid var(--border);
                }

                .ubt-status-badge.processing {
                    background: #EFF6FF;
                    color: #1D4ED8;
                    border: 0.5px solid #BFDBFE;
                }

                @media (prefers-color-scheme: dark) {
                    .ubt-status-badge.processing {
                        background: #0A1628;
                        color: #93C5FD;
                        border-color: #1E3A5F;
                    }
                }

                .ubt-status-badge.done {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border: 0.5px solid var(--brand-border);
                }

                .ubt-status-badge.error {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border: 0.5px solid #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .ubt-status-badge.error {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                .ubt-result-sizes {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .ubt-icon-btn {
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

                .ubt-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .ubt-result-content {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px 14px;
                }

                .ubt-result-input,
                .ubt-result-output {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .ubt-result-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .ubt-result-code {
                    font-family: var(--font-mono);
                    font-size: 11.5px;
                    color: var(--text);
                    background: var(--bg-surface);
                    padding: 6px 10px;
                    border-radius: 5px;
                    border: 0.5px solid var(--border-faint);
                    word-break: break-all;
                }

                .ubt-result-error {
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
                    .ubt-result-error {
                        color: #F87171;
                    }
                }

                .ubt-result-error i {
                    font-size: 12px;
                    flex-shrink: 0;
                }

                /*  Empty State  */
                .ubt-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .ubt-empty-icon {
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

                .ubt-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .ubt-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .ubt-root {
                        padding: 12px;
                    }

                    .ubt-section-header {
                        padding: 8px 12px;
                    }

                    .ubt-textarea {
                        padding: 10px 12px;
                    }

                    .ubt-result-header {
                        padding: 8px 12px;
                    }

                    .ubt-result-content {
                        padding: 10px 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ubt-btn,
                    .ubt-icon-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}