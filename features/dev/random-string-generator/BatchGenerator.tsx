// features/dev/random-string-generator/BatchGenerator.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { GeneratorOptions, GeneratedString } from "./utils";
import { generateString, calculateEntropy, getStrengthLevel, exportToCSV, exportToJSON, exportToText } from "./utils";

interface BatchGeneratorProps {
    options: GeneratorOptions;
    onGenerate?: (results: GeneratedString[]) => void;
}

type ExportFormat = "csv" | "json" | "txt";
type MobileView = "config" | "results";

export default function BatchGenerator({ options, onGenerate }: BatchGeneratorProps) {
    const [count, setCount] = useState(10);
    const [uniqueOnly, setUniqueOnly] = useState(true);
    const [addIndex, setAddIndex] = useState(false);
    const [results, setResults] = useState<GeneratedString[]>([]);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<MobileView>("config");

    const entropy = useMemo(() => calculateEntropy(options), [options]);
    const strength = useMemo(() => getStrengthLevel(entropy), [entropy]);

    const handleGenerate = useCallback(async () => {
        setGenerating(true);
        setProgress(0);
        const generated = new Set<string>();
        const newResults: GeneratedString[] = [];
        const batchSize = 50;

        for (let i = 0; i < count; i += batchSize) {
            const chunk = Math.min(batchSize, count - i);
            
            for (let j = 0; j < chunk; j++) {
                let value = generateString(options);
                
                if (addIndex) {
                    value = `${i + j + 1}_${value}`;
                }

                if (uniqueOnly) {
                    let attempts = 0;
                    while (generated.has(value) && attempts < 100) {
                        value = generateString(options);
                        if (addIndex) {
                            value = `${i + j + 1}_${value}`;
                        }
                        attempts++;
                    }
                }

                generated.add(value);
                newResults.push({
                    id: `${Date.now()}-${i + j}`,
                    value,
                    timestamp: Date.now(),
                    options: { ...options },
                    entropy,
                    strength,
                });
            }

            setProgress(((i + chunk) / count) * 100);
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        setResults(newResults);
        setGenerating(false);
        setProgress(100);
        
        // Auto-switch to results on mobile
        setMobileView("results");

        if (onGenerate) {
            onGenerate(newResults);
        }
    }, [count, uniqueOnly, addIndex, options, entropy, strength, onGenerate]);

    const handleCopy = useCallback(async (value: string, id: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            // Silent fail
        }
    }, []);

    const handleCopyAll = useCallback(async () => {
        const text = results.map(r => r.value).join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId("all");
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            // Silent fail
        }
    }, [results]);

    const handleExport = useCallback((format: ExportFormat) => {
        let content = "";
        let filename = "";

        switch (format) {
            case "csv":
                content = exportToCSV(results);
                filename = "random-strings.csv";
                break;
            case "json":
                content = exportToJSON(results);
                filename = "random-strings.json";
                break;
            case "txt":
                content = exportToText(results);
                filename = "random-strings.txt";
                break;
        }

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, [results]);

    const handleClear = useCallback(() => {
        setResults([]);
        setProgress(0);
        setMobileView("config");
    }, []);

    const uniqueCount = useMemo(() => new Set(results.map(r => r.value)).size, [results]);
    const duplicateCount = results.length - uniqueCount;

    return (
        <>
            <div className="bg-root">
                {/*  Mobile Tab Switcher  */}
                <div className="bg-mobile-tabs">
                    <button
                        type="button"
                        className={`bg-mobile-tab${mobileView === "config" ? " active" : ""}`}
                        onClick={() => setMobileView("config")}
                    >
                        <i className="ti ti-settings" />
                        Configure
                    </button>
                    <button
                        type="button"
                        className={`bg-mobile-tab${mobileView === "results" ? " active" : ""}`}
                        onClick={() => setMobileView("results")}
                    >
                        <i className="ti ti-list-check" />
                        Results
                        {results.length > 0 && (
                            <span className="bg-mobile-badge">{results.length}</span>
                        )}
                    </button>
                </div>

                <div className={`bg-config${mobileView === "config" ? " mobile-visible" : " mobile-hidden"}`}>
                    <div className="bg-config-section">
                        <label className="bg-label">Quantity</label>
                        <div className="bg-quantity-control">
                            <button
                                type="button"
                                className="bg-quantity-btn"
                                onClick={() => setCount(Math.max(1, count - 10))}
                                disabled={generating}
                            >
                                <i className="ti ti-minus" />
                            </button>
                            <input
                                type="number"
                                className="bg-quantity-input"
                                value={count}
                                onChange={(e) => setCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
                                min="1"
                                max="10000"
                                disabled={generating}
                            />
                            <button
                                type="button"
                                className="bg-quantity-btn"
                                onClick={() => setCount(Math.min(10000, count + 10))}
                                disabled={generating}
                            >
                                <i className="ti ti-plus" />
                            </button>
                        </div>
                        <div className="bg-quick-amounts">
                            {[10, 50, 100, 500, 1000].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`bg-quick-btn${count === n ? " active" : ""}`}
                                    onClick={() => setCount(n)}
                                    disabled={generating}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-config-section">
                        <label className="bg-label">Options</label>
                        <div className="bg-options">
                            <label className="bg-checkbox">
                                <input
                                    type="checkbox"
                                    checked={uniqueOnly}
                                    onChange={(e) => setUniqueOnly(e.target.checked)}
                                    disabled={generating}
                                />
                                <span className="bg-checkbox-label">
                                    Generate unique strings only
                                    <span className="bg-checkbox-hint">Skip duplicates</span>
                                </span>
                            </label>
                            <label className="bg-checkbox">
                                <input
                                    type="checkbox"
                                    checked={addIndex}
                                    onChange={(e) => setAddIndex(e.target.checked)}
                                    disabled={generating}
                                />
                                <span className="bg-checkbox-label">
                                    Add numeric index prefix
                                    <span className="bg-checkbox-hint">e.g., 1_abc123</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="bg-generate-btn"
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        <i className={`ti ${generating ? "ti-loader" : "ti-rocket"}`} />
                        {generating ? `Generating... ${Math.round(progress)}%` : `Generate ${count} Strings`}
                    </button>
                </div>

                {generating && (
                    <div className="bg-progress-bar">
                        <div className="bg-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                )}

                <div className={`bg-results-container${mobileView === "results" ? " mobile-visible" : " mobile-hidden"}`}>
                    {results.length > 0 && (
                        <div className="bg-results-header">
                            <div className="bg-results-info">
                                <i className="ti ti-list-check" />
                                <span className="bg-results-count">{results.length} strings generated</span>
                                {duplicateCount > 0 && (
                                    <span className="bg-duplicate-badge">
                                        <i className="ti ti-copy" />
                                        {duplicateCount} duplicate{duplicateCount > 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                            <div className="bg-results-actions">
                                <button
                                    type="button"
                                    className={`bg-action-btn${copiedId === "all" ? " copied" : ""}`}
                                    onClick={handleCopyAll}
                                >
                                    <i className={`ti ${copiedId === "all" ? "ti-check" : "ti-copy"}`} />
                                    {copiedId === "all" ? "Copied" : "Copy All"}
                                </button>
                                <div className="bg-export-dropdown">
                                    <button type="button" className="bg-action-btn">
                                        <i className="ti ti-download" />
                                        Export
                                        <i className="ti ti-chevron-down" style={{ fontSize: "10px" }} />
                                    </button>
                                    <div className="bg-export-menu">
                                        <button
                                            type="button"
                                            className="bg-export-item"
                                            onClick={() => handleExport("txt")}
                                        >
                                            <i className="ti ti-file-text" />
                                            Plain Text (.txt)
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-export-item"
                                            onClick={() => handleExport("csv")}
                                        >
                                            <i className="ti ti-file-spreadsheet" />
                                            CSV (.csv)
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-export-item"
                                            onClick={() => handleExport("json")}
                                        >
                                            <i className="ti ti-file-code" />
                                            JSON (.json)
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="bg-action-btn bg-clear-btn"
                                    onClick={handleClear}
                                >
                                    <i className="ti ti-trash" />
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    {results.length === 0 ? (
                        <div className="bg-empty">
                            <div className="bg-empty-icon">
                                <i className="ti ti-layers-linked" />
                            </div>
                            <p className="bg-empty-title">Batch Generation</p>
                            <p className="bg-empty-desc">
                                Generate hundreds or thousands of random strings at once. Perfect for testing, data seeding, or bulk password generation.
                            </p>
                            <button className="bg-empty-cta" onClick={() => setMobileView("config")}>
                                <i className="ti ti-settings" />
                                Configure Batch
                            </button>
                        </div>
                    ) : (
                        <div className="bg-results-grid">
                            {results.map((result) => (
                                <div key={result.id} className="bg-result-item">
                                    <div className="bg-result-value">{result.value}</div>
                                    <button
                                        type="button"
                                        className={`bg-copy-icon${copiedId === result.id ? " copied" : ""}`}
                                        onClick={() => handleCopy(result.value, result.id)}
                                        title="Copy to clipboard"
                                    >
                                        <i className={`ti ${copiedId === result.id ? "ti-check" : "ti-copy"}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .bg-root {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Mobile Tab Switcher  */
                .bg-mobile-tabs {
                    display: none;
                    border-bottom: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    flex-shrink: 0;
                }

                .bg-mobile-tab {
                    flex: 1;
                    height: 44px;
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

                .bg-mobile-tab i {
                    font-size: 15px;
                }

                .bg-mobile-tab.active {
                    color: var(--text);
                }

                .bg-mobile-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .bg-mobile-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                }

                /*  Configuration  */
                .bg-config {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .bg-config-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .bg-label {
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .bg-quantity-control {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bg-quantity-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bg-quantity-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                    border-color: var(--brand-border);
                }

                .bg-quantity-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .bg-quantity-input {
                    flex: 1;
                    height: 36px;
                    padding: 0 12px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    text-align: center;
                    font-family: var(--font-mono);
                }

                .bg-quantity-input:focus {
                    outline: none;
                    border-color: var(--brand-border);
                }

                .bg-quick-amounts {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .bg-quick-btn {
                    height: 26px;
                    padding: 0 12px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bg-quick-btn:hover:not(:disabled) {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .bg-quick-btn.active {
                    background: var(--brand);
                    color: white;
                    border-color: var(--brand);
                }

                .bg-quick-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .bg-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bg-checkbox {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                }

                .bg-checkbox:has(input:checked) {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .bg-checkbox input {
                    width: 18px;
                    height: 18px;
                    margin-top: 2px;
                    cursor: pointer;
                    accent-color: var(--brand);
                    flex-shrink: 0;
                }

                .bg-checkbox-label {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text);
                }

                .bg-checkbox-hint {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-weight: 400;
                    font-family: var(--font-mono);
                }

                .bg-generate-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    height: 42px;
                    border-radius: 10px;
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand);
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bg-generate-btn:hover:not(:disabled) {
                    background: var(--brand-hover);
                }

                .bg-generate-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .bg-generate-btn i {
                    font-size: 16px;
                }

                /*  Progress Bar  */
                .bg-progress-bar {
                    height: 3px;
                    background: var(--border);
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .bg-progress-fill {
                    height: 100%;
                    background: var(--brand);
                    transition: width 0.2s;
                }

                /*  Results Container  */
                .bg-results-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                /*  Results Header  */
                .bg-results-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-wrap: wrap;
                    flex-shrink: 0;
                }

                .bg-results-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bg-results-info > i {
                    font-size: 16px;
                    color: var(--brand);
                }

                .bg-results-count {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                }

                .bg-duplicate-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 99px;
                    background: #FEF3E7;
                    color: #A0501A;
                    border: 0.5px solid #FDBA74;
                }

                @media (prefers-color-scheme: dark) {
                    .bg-duplicate-badge {
                        background: #2A1F08;
                        color: #FDBA74;
                        border-color: #3A2F18;
                    }
                }

                .bg-duplicate-badge i {
                    font-size: 11px;
                }

                .bg-results-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .bg-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 30px;
                    padding: 0 12px;
                    border-radius: 7px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .bg-action-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .bg-action-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .bg-action-btn i {
                    font-size: 13px;
                }

                .bg-clear-btn:hover {
                    background: var(--error-bg);
                    color: #B91C1C;
                    border-color: #F3D2D2;
                }

                @media (prefers-color-scheme: dark) {
                    .bg-clear-btn:hover {
                        color: #F87171;
                        border-color: #5A2A2A;
                    }
                }

                .bg-export-dropdown {
                    position: relative;
                }

                .bg-export-dropdown:hover .bg-export-menu {
                    display: flex;
                }

                .bg-export-menu {
                    display: none;
                    position: absolute;
                    top: calc(100% + 6px);
                    right: 0;
                    min-width: 180px;
                    flex-direction: column;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    padding: 4px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                    z-index: 10;
                }

                .bg-export-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 32px;
                    padding: 0 10px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    text-align: left;
                }

                .bg-export-item:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .bg-export-item i {
                    font-size: 14px;
                    color: var(--text-tertiary);
                }

                /*  Empty State  */
                .bg-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    gap: 10px;
                    text-align: center;
                }

                .bg-empty-icon {
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
                    margin-bottom: 8px;
                }

                .bg-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .bg-empty-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.6;
                }

                .bg-empty-cta {
                    display: none;
                    align-items: center;
                    gap: 6px;
                    height: 38px;
                    padding: 0 18px;
                    border-radius: 8px;
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: all 0.12s;
                }

                .bg-empty-cta:hover {
                    background: var(--brand);
                    color: white;
                }

                /*  Results Grid  */
                .bg-results-grid {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 8px;
                    align-content: start;
                }

                .bg-result-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    transition: all 0.12s;
                }

                .bg-result-item:hover {
                    background: var(--bg-surface);
                    border-color: var(--brand-border);
                }

                .bg-result-value {
                    flex: 1;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.5;
                }

                .bg-copy-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s;
                    flex-shrink: 0;
                }

                .bg-copy-icon:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .bg-copy-icon.copied {
                    background: var(--brand-light);
                    color: var(--brand);
                    border-color: var(--brand-border);
                }

                /*  Responsive - Mobile Breakpoint  */
                @media (max-width: 768px) {
                    .bg-mobile-tabs {
                        display: flex;
                    }

                    .bg-config.mobile-hidden,
                    .bg-results-container.mobile-hidden {
                        display: none;
                    }

                    .bg-config.mobile-visible {
                        display: flex;
                    }

                    .bg-results-container.mobile-visible {
                        display: flex;
                    }

                    .bg-empty-cta {
                        display: inline-flex;
                    }

                    .bg-results-grid {
                        grid-template-columns: 1fr;
                    }

                    .bg-results-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .bg-results-actions {
                        justify-content: space-between;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .bg-quantity-btn,
                    .bg-quick-btn,
                    .bg-generate-btn,
                    .bg-action-btn,
                    .bg-export-item,
                    .bg-result-item,
                    .bg-copy-icon,
                    .bg-progress-fill,
                    .bg-mobile-tab,
                    .bg-empty-cta {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}