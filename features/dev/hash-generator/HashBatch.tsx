// features/dev/hash-generator/HashBatch.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { generateMultipleHashes, type HashAlgorithm, type HashOptions, type HashResult, formatBytes } from "./hashEngine";

interface BatchItem {
    id: string;
    name: string;
    content: string | ArrayBuffer;
    size: number;
    type: "text" | "file";
    status: "pending" | "processing" | "completed" | "error";
    results: HashResult[];
    error?: string;
    processingTime: number;
}

interface HashBatchProps {
    algorithms: HashAlgorithm[];
    options: Omit<HashOptions, 'algorithm'>;
    onComplete?: (results: BatchItem[]) => void;
}

export default function HashBatch({ algorithms, options, onComplete }: HashBatchProps) {
    const [items, setItems] = useState<BatchItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copiedId, setCopiedId] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newItems: BatchItem[] = [];

        for (const file of files) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                newItems.push({
                    id: `${Date.now()}-${Math.random()}`,
                    name: file.name,
                    content: arrayBuffer,
                    size: file.size,
                    type: "file",
                    status: "pending",
                    results: [],
                    processingTime: 0,
                });
            } catch (error) {
                console.error(`Failed to read file ${file.name}:`, error);
            }
        }

        setItems(prev => [...prev, ...newItems]);
        
        // Clear the input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const addTextItem = useCallback((text: string, name: string) => {
        const newItem: BatchItem = {
            id: `${Date.now()}-${Math.random()}`,
            name: name || `Text ${Date.now()}`,
            content: text,
            size: new Blob([text]).size,
            type: "text",
            status: "pending",
            results: [],
            processingTime: 0,
        };

        setItems(prev => [...prev, newItem]);
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const processAll = useCallback(async () => {
        if (items.length === 0 || isProcessing) return;

        setIsProcessing(true);
        setProgress(0);

        const totalItems = items.length;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            setItems(prev => prev.map(prevItem => 
                prevItem.id === item.id 
                    ? { ...prevItem, status: "processing" as const }
                    : prevItem
            ));

            const startTime = performance.now();

            try {
                const results = await generateMultipleHashes(item.content, algorithms, options);
                const processingTime = performance.now() - startTime;

                setItems(prev => prev.map(prevItem => 
                    prevItem.id === item.id 
                        ? { 
                            ...prevItem, 
                            status: "completed" as const, 
                            results,
                            processingTime
                        }
                        : prevItem
                ));
            } catch (error) {
                setItems(prev => prev.map(prevItem => 
                    prevItem.id === item.id 
                        ? { 
                            ...prevItem, 
                            status: "error" as const, 
                            error: error instanceof Error ? error.message : "Unknown error"
                        }
                        : prevItem
                ));
            }

            setProgress(Math.round(((i + 1) / totalItems) * 100));
        }

        setIsProcessing(false);
        
        if (onComplete) {
            onComplete(items.filter(item => item.status === "completed"));
        }
    }, [items, algorithms, options, isProcessing, onComplete]);

    const copyResults = useCallback(async (item: BatchItem, format: "single" | "all") => {
        let textToCopy = "";
        
        if (format === "single") {
            const hashesText = item.results.map(result => 
                `${result.algorithm}: ${result.hash}`
            ).join("\n");
            textToCopy = `File: ${item.name}\n${hashesText}`;
        } else {
            textToCopy = item.results.map(result => result.hash).join("\n");
        }

        await navigator.clipboard.writeText(textToCopy);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(""), 1500);
    }, []);

    const downloadResults = useCallback(() => {
        const completedItems = items.filter(item => item.status === "completed");
        if (completedItems.length === 0) return;

        const csvContent = [
            ["File Name", "Size", "Algorithm", "Hash", "Processing Time (ms)"],
            ...completedItems.flatMap(item => 
                item.results.map(result => [
                    item.name,
                    formatBytes(item.size),
                    result.algorithm,
                    result.hash,
                    result.executionTime.toFixed(2)
                ])
            )
        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hash_batch_results_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [items]);

    const clearAll = useCallback(() => {
        setItems([]);
        setProgress(0);
    }, []);

    const completedCount = items.filter(item => item.status === "completed").length;
    const errorCount = items.filter(item => item.status === "error").length;
    const totalProcessingTime = items.reduce((sum, item) => sum + item.processingTime, 0);

    return (
        <>
            <div className="hb-root">
                {/* Upload Section */}
                <div className="hb-section">
                    <div className="hb-section-header">
                        <div className="hb-section-title">
                            <i className="ti ti-upload" />
                            Add Files or Text
                        </div>
                        <div className="hb-section-actions">
                            {items.length > 0 && (
                                <button
                                    type="button"
                                    className="hb-action-btn hb-action-btn--secondary"
                                    onClick={clearAll}
                                    disabled={isProcessing}
                                >
                                    <i className="ti ti-trash" />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="hb-upload-area">
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="batch-files"
                            className="hb-file-input"
                            multiple
                            onChange={handleFilesChange}
                            disabled={isProcessing}
                        />
                        <label htmlFor="batch-files" className="hb-upload-zone">
                            <div className="hb-upload-icon">
                                <i className="ti ti-cloud-upload" />
                            </div>
                            <div className="hb-upload-content">
                                <p className="hb-upload-title">Drop files here or click to browse</p>
                                <p className="hb-upload-subtitle">
                                    Support for any file type • Multiple files allowed
                                </p>
                            </div>
                        </label>

                        <div className="hb-text-input">
                            <textarea
                                className="hb-textarea"
                                placeholder="Or paste text content here..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.ctrlKey) {
                                        const target = e.target as HTMLTextAreaElement;
                                        if (target.value.trim()) {
                                            addTextItem(target.value, `Text ${items.length + 1}`);
                                            target.value = "";
                                        }
                                    }
                                }}
                                disabled={isProcessing}
                            />
                            <div className="hb-textarea-hint">
                                <i className="ti ti-info-circle" />
                                Press Ctrl+Enter to add text as batch item
                            </div>
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="hb-batch-summary">
                            <div className="hb-summary-stats">
                                <span className="hb-summary-stat">
                                    <i className="ti ti-files" />
                                    {items.length} item{items.length !== 1 ? 's' : ''}
                                </span>
                                <span className="hb-summary-stat">
                                    <i className="ti ti-database" />
                                    {formatBytes(items.reduce((sum, item) => sum + item.size, 0))}
                                </span>
                                <span className="hb-summary-stat">
                                    <i className="ti ti-shield-check" />
                                    {algorithms.length} algorithm{algorithms.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="hb-action-btn hb-action-btn--primary"
                                onClick={processAll}
                                disabled={isProcessing || items.length === 0}
                            >
                                <i className={`ti ${isProcessing ? "ti-loader" : "ti-play"}`} />
                                {isProcessing ? `Processing... ${progress}%` : "Process All"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress */}
                {isProcessing && (
                    <div className="hb-progress-section">
                        <div className="hb-progress-header">
                            <span className="hb-progress-label">Processing {progress}%</span>
                            <span className="hb-progress-detail">
                                {completedCount} of {items.length} completed
                            </span>
                        </div>
                        <div className="hb-progress-bar">
                            <div 
                                className="hb-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Results */}
                {items.length > 0 && (
                    <div className="hb-section">
                        <div className="hb-section-header">
                            <div className="hb-section-title">
                                <i className="ti ti-list-check" />
                                Results
                                {completedCount > 0 && (
                                    <span className="hb-result-badge hb-result-badge--success">
                                        {completedCount} completed
                                    </span>
                                )}
                                {errorCount > 0 && (
                                    <span className="hb-result-badge hb-result-badge--error">
                                        {errorCount} error{errorCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <div className="hb-section-actions">
                                {completedCount > 0 && (
                                    <>
                                        {totalProcessingTime > 0 && (
                                            <span className="hb-processing-time">
                                                Total: {totalProcessingTime.toFixed(2)}ms
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="hb-action-btn hb-action-btn--secondary"
                                            onClick={downloadResults}
                                        >
                                            <i className="ti ti-download" />
                                            Download CSV
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hb-results">
                            {items.map((item) => (
                                <div key={item.id} className="hb-result-item">
                                    <div className="hb-result-header">
                                        <div className="hb-result-info">
                                            <div className="hb-result-name">
                                                <i className={`ti ${item.type === "file" ? "ti-file" : "ti-file-text"}`} />
                                                <span className="hb-result-title">{item.name}</span>
                                                <span className="hb-result-size">{formatBytes(item.size)}</span>
                                            </div>
                                            <div className="hb-result-meta">
                                                {item.status === "completed" && item.processingTime > 0 && (
                                                    <span className="hb-result-time">
                                                        {item.processingTime.toFixed(2)}ms
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="hb-result-actions">
                                            <div className={`hb-result-status hb-result-status--${item.status}`}>
                                                {item.status === "pending" && <i className="ti ti-clock" />}
                                                {item.status === "processing" && <i className="ti ti-loader hb-spin" />}
                                                {item.status === "completed" && <i className="ti ti-check" />}
                                                {item.status === "error" && <i className="ti ti-alert-circle" />}
                                                <span>{item.status}</span>
                                            </div>

                                            {item.status === "completed" && (
                                                <button
                                                    type="button"
                                                    className={`hb-copy-btn ${copiedId === item.id ? 'copied' : ''}`}
                                                    onClick={() => copyResults(item, "single")}
                                                    title="Copy all hashes"
                                                >
                                                    <i className={`ti ${copiedId === item.id ? "ti-check" : "ti-copy"}`} />
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="hb-remove-btn"
                                                onClick={() => removeItem(item.id)}
                                                disabled={isProcessing}
                                                title="Remove item"
                                            >
                                                <i className="ti ti-x" />
                                            </button>
                                        </div>
                                    </div>

                                    {item.status === "error" && item.error && (
                                        <div className="hb-result-error">
                                            <i className="ti ti-alert-triangle" />
                                            {item.error}
                                        </div>
                                    )}

                                    {item.status === "completed" && item.results.length > 0 && (
                                        <div className="hb-result-hashes">
                                            {item.results.map((result) => (
                                                <div key={result.algorithm} className="hb-hash-item">
                                                    <div className="hb-hash-header">
                                                        <span className="hb-hash-algorithm">
                                                            {result.algorithm}
                                                        </span>
                                                        <span className="hb-hash-time">
                                                            {result.executionTime.toFixed(2)}ms
                                                        </span>
                                                    </div>
                                                    <div className="hb-hash-value">
                                                        {result.hash}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {items.length === 0 && (
                    <div className="hb-empty">
                        <div className="hb-empty-icon">
                            <i className="ti ti-files" />
                        </div>
                        <h3 className="hb-empty-title">Batch Hash Processing</h3>
                        <p className="hb-empty-description">
                            Upload multiple files or add text items to generate hashes in bulk. 
                            All selected algorithms will be applied to each item.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .hb-root {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow: auto;
                }

                .hb-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .hb-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .hb-section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hb-section-title i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .hb-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .hb-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    border: 0.5px solid var(--border);
                }

                .hb-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .hb-action-btn i {
                    font-size: 13px;
                }

                .hb-action-btn--primary {
                    background: var(--brand);
                    color: white;
                    border-color: var(--brand);
                }

                .hb-action-btn--primary:hover:not(:disabled) {
                    background: var(--brand-hover);
                    border-color: var(--brand-hover);
                }

                .hb-action-btn--secondary {
                    background: var(--bg-card);
                    color: var(--text-secondary);
                }

                .hb-action-btn--secondary:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hb-upload-area {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .hb-file-input {
                    display: none;
                }

                .hb-upload-zone {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px;
                    border: 2px dashed var(--border);
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    transition: all 0.15s;
                    background: var(--bg-surface);
                }

                .hb-upload-zone:hover {
                    border-color: var(--brand);
                    background: var(--brand-light);
                }

                .hb-upload-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: var(--text-tertiary);
                    flex-shrink: 0;
                }

                .hb-upload-content {
                    flex: 1;
                }

                .hb-upload-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0 0 4px;
                }

                .hb-upload-subtitle {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 0;
                }

                .hb-text-input {
                    position: relative;
                }

                .hb-textarea {
                    width: 100%;
                    min-height: 80px;
                    padding: 12px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    background: var(--bg-card);
                    color: var(--text);
                    font-family: var(--font-mono);
                    font-size: 12px;
                    line-height: 1.5;
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .hb-textarea:focus {
                    outline: none;
                    border-color: var(--brand);
                }

                .hb-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .hb-textarea-hint {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 6px;
                    font-size: 10px;
                    color: var(--text-disabled);
                }

                .hb-textarea-hint i {
                    font-size: 11px;
                }

                .hb-batch-summary {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .hb-summary-stats {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .hb-summary-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .hb-summary-stat i {
                    font-size: 12px;
                }

                .hb-progress-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 16px;
                }

                .hb-progress-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    gap: 8px;
                }

                .hb-progress-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .hb-progress-detail {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .hb-progress-bar {
                    width: 100%;
                    height: 8px;
                    background: var(--bg-surface);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .hb-progress-fill {
                    height: 100%;
                    background: var(--brand);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .hb-result-badge {
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .hb-result-badge--success {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border: 0.5px solid var(--brand-border);
                }

                .hb-result-badge--error {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 0.5px solid #fecaca;
                }

                @media (prefers-color-scheme: dark) {
                    .hb-result-badge--error {
                        background: #1f1517;
                        color: #f87171;
                        border-color: #3c1518;
                    }
                }

                .hb-processing-time {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .hb-results {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border);
                }

                .hb-result-item {
                    background: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                }

                .hb-result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    gap: 12px;
                }

                .hb-result-info {
                    flex: 1;
                    min-width: 0;
                }

                .hb-result-name {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }

                .hb-result-name i {
                    font-size: 14px;
                    color: var(--text-secondary);
                    flex-shrink: 0;
                }

                .hb-result-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    flex: 1;
                    min-width: 0;
                }

                .hb-result-size {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                    flex-shrink: 0;
                }

                .hb-result-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hb-result-time {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .hb-result-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .hb-result-status {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .hb-result-status i {
                    font-size: 11px;
                }

                .hb-result-status--pending {
                    background: var(--bg-surface);
                    color: var(--text-disabled);
                    border: 0.5px solid var(--border);
                }

                .hb-result-status--processing {
                    background: #eff6ff;
                    color: #1d4ed8;
                    border: 0.5px solid #bfdbfe;
                }

                .hb-result-status--completed {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border: 0.5px solid var(--brand-border);
                }

                .hb-result-status--error {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 0.5px solid #fecaca;
                }

                @media (prefers-color-scheme: dark) {
                    .hb-result-status--processing {
                        background: #0a1628;
                        color: #93c5fd;
                        border-color: #1e3a5f;
                    }
                    
                    .hb-result-status--error {
                        background: #1f1517;
                        color: #f87171;
                        border-color: #3c1518;
                    }
                }

                .hb-copy-btn,
                .hb-remove-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hb-copy-btn:hover,
                .hb-remove-btn:hover:not(:disabled) {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .hb-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .hb-remove-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .hb-result-error {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: #fef2f2;
                    color: #dc2626;
                    font-size: 12px;
                    border-top: 0.5px solid var(--border);
                }

                @media (prefers-color-scheme: dark) {
                    .hb-result-error {
                        background: #1f1517;
                        color: #f87171;
                    }
                }

                .hb-result-error i {
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .hb-result-hashes {
                    padding: 0 16px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .hb-hash-item {
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }

                .hb-hash-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                }

                .hb-hash-algorithm {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .hb-hash-time {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .hb-hash-value {
                    padding: 8px 12px;
                    font-family: var(--font-mono);
                    font-size: 11px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.4;
                    background: var(--bg-surface);
                }

                .hb-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .hb-empty-icon {
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
                }

                .hb-empty-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .hb-empty-description {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.6;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .hb-spin {
                    animation: spin 1s linear infinite;
                }

                @media (max-width: 768px) {
                    .hb-root {
                        padding: 12px;
                    }

                    .hb-upload-zone {
                        flex-direction: column;
                        text-align: center;
                        gap: 12px;
                    }

                    .hb-batch-summary {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .hb-summary-stats {
                        justify-content: space-around;
                    }

                    .hb-result-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 8px;
                    }

                    .hb-result-actions {
                        justify-content: flex-end;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .hb-action-btn,
                    .hb-upload-zone,
                    .hb-textarea,
                    .hb-progress-fill,
                    .hb-copy-btn,
                    .hb-remove-btn {
                        transition: none;
                    }

                    .hb-spin {
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}