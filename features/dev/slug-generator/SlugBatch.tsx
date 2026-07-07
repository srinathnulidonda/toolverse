// features/dev/slug-generator/SlugBatch.tsx
"use client";

import { useState, useCallback } from "react";
import { generateSlug, formatBytes, type SlugOptions } from "./utils";

interface BatchItem {
    id: string;
    input: string;
    output: string;
    status: "pending" | "processing" | "done";
}

interface SlugBatchProps {
    options: SlugOptions;
    onComplete?: () => void;
}

export default function SlugBatch({ options, onComplete }: SlugBatchProps) {
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
        }));

        setItems(newItems);

        // Process each item
        for (let i = 0; i < newItems.length; i++) {
            setItems((prev) =>
                prev.map((item, idx) =>
                    idx === i ? { ...item, status: "processing" as const } : item
                )
            );

            await new Promise((resolve) => setTimeout(resolve, 50));

            const output = generateSlug(newItems[i].input, options);

            setItems((prev) =>
                prev.map((item, idx) =>
                    idx === i
                        ? {
                            ...item,
                            output,
                            status: "done" as const,
                        }
                        : item
                )
            );
        }

        setProcessing(false);
        if (onComplete) onComplete();
    }, [batchInput, separator, options, onComplete]);

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
        a.download = "batch-slugs.txt";
        a.click();
        URL.revokeObjectURL(url);
    }, [items]);

    const handleClear = useCallback(() => {
        setBatchInput("");
        setItems([]);
    }, []);

    const doneCount = items.filter((i) => i.status === "done").length;

    return (
        <>
            <div className="sb-root">
                {/*  Input Section  */}
                <div className="sb-section">
                    <div className="sb-section-header">
                        <div className="sb-section-label">
                            <i className="ti ti-files" />
                            Batch Input
                        </div>
                        <div className="sb-section-actions">
                            <div className="sb-separator-group">
                                <span className="sb-separator-label">Split by:</span>
                                <select
                                    className="sb-select"
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
                                className="sb-btn"
                                onClick={handleClear}
                                disabled={!batchInput && items.length === 0}
                            >
                                <i className="ti ti-trash" />
                                Clear
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="sb-textarea"
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        placeholder="Enter multiple texts (one per line)...&#10;&#10;Example:&#10;How to Build Web Apps&#10;Product Launch 2024&#10;SEO Best Practices"
                        rows={10}
                        disabled={processing}
                    />
                    <div className="sb-input-footer">
                        <span className="sb-input-count">
                            {batchInput.split(separator === "newline" ? "\n" : separator === "comma" ? "," : ";").filter(s => s.trim()).length} items
                        </span>
                        <button
                            type="button"
                            className="sb-btn sb-btn-primary"
                            onClick={handleProcess}
                            disabled={!batchInput.trim() || processing}
                        >
                            <i className={`ti ${processing ? "ti-loader" : "ti-player-play"}`} />
                            {processing ? "Processing..." : "Generate All Slugs"}
                        </button>
                    </div>
                </div>

                {/*  Results Section  */}
                {items.length > 0 && (
                    <div className="sb-section">
                        <div className="sb-section-header">
                            <div className="sb-section-label">
                                <i className="ti ti-list-check" />
                                Results
                                <span className="sb-results-badge">
                                    {doneCount}/{items.length}
                                </span>
                            </div>
                            <div className="sb-section-actions">
                                <button
                                    type="button"
                                    className="sb-btn"
                                    onClick={handleCopyAll}
                                    disabled={doneCount === 0}
                                >
                                    <i className="ti ti-copy" />
                                    Copy All
                                </button>
                                <button
                                    type="button"
                                    className="sb-btn"
                                    onClick={handleDownloadAll}
                                    disabled={doneCount === 0}
                                >
                                    <i className="ti ti-download" />
                                    Download
                                </button>
                            </div>
                        </div>

                        <div className="sb-results">
                            {items.map((item, idx) => (
                                <div key={item.id} className={`sb-result-item status-${item.status}`}>
                                    <div className="sb-result-header">
                                        <div className="sb-result-index">#{idx + 1}</div>
                                        <div className="sb-result-status">
                                            {item.status === "pending" && (
                                                <span className="sb-status-badge pending">
                                                    <i className="ti ti-clock" />
                                                    Pending
                                                </span>
                                            )}
                                            {item.status === "processing" && (
                                                <span className="sb-status-badge processing">
                                                    <i className="ti ti-loader" />
                                                    Processing
                                                </span>
                                            )}
                                            {item.status === "done" && (
                                                <span className="sb-status-badge done">
                                                    <i className="ti ti-check" />
                                                    Done
                                                </span>
                                            )}
                                        </div>
                                        {item.status === "done" && (
                                            <button
                                                type="button"
                                                className="sb-icon-btn"
                                                onClick={() => navigator.clipboard.writeText(item.output)}
                                                title="Copy result"
                                            >
                                                <i className="ti ti-copy" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="sb-result-content">
                                        <div className="sb-result-input">
                                            <span className="sb-result-label">Input:</span>
                                            <div className="sb-result-text">{item.input}</div>
                                        </div>
                                        {item.status === "done" && (
                                            <div className="sb-result-output">
                                                <span className="sb-result-label">Slug:</span>
                                                <code className="sb-result-code">{item.output}</code>
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
                    <div className="sb-empty">
                        <div className="sb-empty-icon">
                            <i className="ti ti-files" />
                        </div>
                        <p className="sb-empty-title">Batch Slug Generation</p>
                        <p className="sb-empty-desc">
                            Process multiple texts at once. Enter one per line above.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .sb-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                /*  Section  */
                .sb-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--sg-radius-lg, 12px);
                    overflow: hidden;
                }

                .sb-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .sb-section-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .sb-section-label i {
                    font-size: 12px;
                }

                .sb-results-badge {
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

                .sb-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .sb-separator-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .sb-separator-label {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .sb-select {
                    height: 28px;
                    padding: 0 10px;
                    border-radius: var(--sg-radius-md, 8px);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .sb-select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .sb-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 11px;
                    border-radius: var(--sg-radius-md, 8px);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .sb-btn i {
                    font-size: 12px;
                }

                .sb-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .sb-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .sb-btn-primary {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .sb-btn-primary:hover:not(:disabled) {
                    background: var(--brand);
                    color: white;
                }

                /*  Textarea  */
                .sb-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    font-family: var(--font-sans);
                    font-size: 13px;
                    line-height: 1.7;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    resize: vertical;
                    min-height: 200px;
                }

                .sb-textarea:disabled {
                    opacity: 0.6;
                }

                .sb-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .sb-input-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    gap: 12px;
                }

                .sb-input-count {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                /*  Results  */
                .sb-results {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border-faint);
                }

                .sb-result-item {
                    background: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .sb-result-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border-faint);
                }

                .sb-result-index {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                    min-width: 32px;
                }

                .sb-result-status {
                    flex: 1;
                }

                .sb-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 99px;
                }

                .sb-status-badge i {
                    font-size: 11px;
                }

                .sb-status-badge.pending {
                    background: var(--bg-card);
                    color: var(--text-disabled);
                    border: 0.5px solid var(--border);
                }

                .sb-status-badge.processing {
                    background: #EFF6FF;
                    color: #1D4ED8;
                    border: 0.5px solid #BFDBFE;
                }

                @media (prefers-color-scheme: dark) {
                    .sb-status-badge.processing {
                        background: #0A1628;
                        color: #93C5FD;
                        border-color: #1E3A5F;
                    }
                }

                .sb-status-badge.done {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border: 0.5px solid var(--brand-border);
                }

                .sb-icon-btn {
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

                .sb-icon-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .sb-result-content {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 12px 14px;
                }

                .sb-result-input,
                .sb-result-output {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .sb-result-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .sb-result-text {
                    font-size: 12px;
                    color: var(--text);
                    line-height: 1.6;
                }

                .sb-result-code {
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    color: var(--brand);
                    background: var(--bg-surface);
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border-faint);
                    word-break: break-all;
                    font-weight: 500;
                }

                /*  Empty State  */
                .sb-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .sb-empty-icon {
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

                .sb-empty-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .sb-empty-desc {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 320px;
                    line-height: 1.6;
                }

                /*  Responsive  */
                @media (max-width: 768px) {
                    .sb-root {
                        padding: 12px;
                    }

                    .sb-section-header {
                        padding: 8px 12px;
                    }

                    .sb-textarea {
                        padding: 10px 12px;
                    }

                    .sb-result-header {
                        padding: 8px 12px;
                    }

                    .sb-result-content {
                        padding: 10px 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sb-btn,
                    .sb-icon-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}