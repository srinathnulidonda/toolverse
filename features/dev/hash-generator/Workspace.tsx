// features/dev/hash-generator/Workspace.tsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { Tool } from "@/lib/tools";
import { 
    generateMultipleHashes, 
    type HashAlgorithm, 
    type HashFormat, 
    type HashOptions,
    type HashResult,
    HASH_ALGORITHMS,
    SAMPLE_DATA,
    detectInputType,
    formatBytes
} from "./hashEngine";
import HashAnalysis from "./HashAnalysis";
import HashBatch from "./HashBatch";
import { useHashStore } from "./hashStore";

type TabView = "single" | "batch" | "verify" | "history";

export default function HashGeneratorWorkspace({ tool }: { tool: Tool }) {
    const [input, setInput] = useState("");
    const [inputType, setInputType] = useState<"text" | "file">("text");
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState(0);
    const [tabView, setTabView] = useState<TabView>("single");
    const [selectedAlgorithms, setSelectedAlgorithms] = useState<Set<HashAlgorithm>>(new Set(["SHA256"]));
    const [format, setFormat] = useState<HashFormat>("hex");
    const [results, setResults] = useState<HashResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copiedKey, setCopiedKey] = useState("");
    const [salt, setSalt] = useState("");
    const [pepper, setPepper] = useState("");
    const [hmacKey, setHmacKey] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    // Verification state
    const [verifyInput, setVerifyInput] = useState("");
    const [verifyHash, setVerifyHash] = useState("");
    const [verifyAlgorithm, setVerifyAlgorithm] = useState<HashAlgorithm>("SHA256");
    const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { history, settings, addToHistory, clearHistory, searchHistory, getStatistics } = useHashStore();

    const options: Omit<HashOptions, 'algorithm'> = useMemo(() => ({
        format,
        salt: salt || undefined,
        pepper: pepper || undefined,
        hmacKey: hmacKey || undefined,
    }), [format, salt, pepper, hmacKey]);

    const filteredAlgorithms = useMemo(() => {
        return Object.entries(HASH_ALGORITHMS).filter(([, info]) => 
            settings.showDeprecatedAlgorithms || !info.isDeprecated
        );
    }, [settings.showDeprecatedAlgorithms]);

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsProcessing(true);
            const arrayBuffer = await file.arrayBuffer();
            const results = await generateMultipleHashes(arrayBuffer, Array.from(selectedAlgorithms), options);
            
            setResults(results);
            setInputType("file");
            setFileName(file.name);
            setFileSize(file.size);
            setInput(""); // Clear text input

            if (settings.autoSave) {
                addToHistory({
                    input: file.name,
                    inputType: "file",
                    fileName: file.name,
                    fileSize: file.size,
                    results,
                    tags: [],
                    isFavorite: false,
                });
            }
        } catch (error) {
            console.error("Failed to process file:", error);
        } finally {
            setIsProcessing(false);
        }
    }, [selectedAlgorithms, options, settings.autoSave, addToHistory]);

    const handleTextHash = useCallback(async () => {
        if (!input.trim() || selectedAlgorithms.size === 0) return;

        try {
            setIsProcessing(true);
            const results = await generateMultipleHashes(input, Array.from(selectedAlgorithms), options);
            
            setResults(results);
            setInputType("text");
            setFileName("");
            setFileSize(new Blob([input]).size);

            if (settings.autoSave) {
                addToHistory({
                    input: input.substring(0, 1000), // Limit stored input length
                    inputType: "text",
                    results,
                    tags: [],
                    isFavorite: false,
                });
            }
        } catch (error) {
            console.error("Failed to generate hashes:", error);
        } finally {
            setIsProcessing(false);
        }
    }, [input, selectedAlgorithms, options, settings.autoSave, addToHistory]);

    const handleVerify = useCallback(async () => {
        if (!verifyInput.trim() || !verifyHash.trim()) return;

        try {
            setIsProcessing(true);
            const results = await generateMultipleHashes(verifyInput, [verifyAlgorithm], options);
            const result = results[0];
            
            if (result) {
                const matches = result.hash.toLowerCase() === verifyHash.toLowerCase();
                setVerifyResult(matches);
            }
        } catch (error) {
            console.error("Failed to verify hash:", error);
            setVerifyResult(false);
        } finally {
            setIsProcessing(false);
        }
    }, [verifyInput, verifyHash, verifyAlgorithm, options]);

    const toggleAlgorithm = useCallback((algorithm: HashAlgorithm) => {
        setSelectedAlgorithms(prev => {
            const next = new Set(prev);
            if (next.has(algorithm)) {
                if (next.size > 1) next.delete(algorithm);
            } else {
                next.add(algorithm);
            }
            return next;
        });
    }, []);

    const selectAllAlgorithms = useCallback(() => {
        const allAlgorithms = filteredAlgorithms.map(([algorithm]) => algorithm as HashAlgorithm);
        setSelectedAlgorithms(new Set(allAlgorithms));
    }, [filteredAlgorithms]);

    const selectRecommendedAlgorithms = useCallback(() => {
        const recommended = filteredAlgorithms
            .filter(([, info]) => info.isSecure && !info.isDeprecated && info.bitLength >= 256)
            .map(([algorithm]) => algorithm as HashAlgorithm);
        setSelectedAlgorithms(new Set(recommended));
    }, [filteredAlgorithms]);

    const loadSample = useCallback((sampleKey: keyof typeof SAMPLE_DATA) => {
        const sample = SAMPLE_DATA[sampleKey];
        setInput(sample.text);
        setInputType("text");
        setFileName("");
        setFileSize(new Blob([sample.text]).size);
        setResults([]);
    }, []);

    const handleCopy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1500);
    }, []);

    const handleExport = useCallback((format: "json" | "csv" | "txt") => {
        if (results.length === 0) return;

        let content = "";
        const timestamp = new Date().toISOString();

        switch (format) {
            case "json":
                content = JSON.stringify({
                    timestamp,
                    input: inputType === "file" ? `[File: ${fileName}]` : input.substring(0, 100),
                    inputType,
                    fileName,
                    fileSize,
                    algorithms: Array.from(selectedAlgorithms),
                    options,
                    results
                }, null, 2);
                break;
            case "csv":
                content = [
                    ["Algorithm", "Hash", "Format", "Execution Time (ms)", "Bit Length", "Security Strength"],
                    ...results.map(result => [
                        result.algorithm,
                        result.hash,
                        result.format,
                        result.executionTime.toFixed(2),
                        HASH_ALGORITHMS[result.algorithm].bitLength,
                        result.strength
                    ])
                ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
                break;
            case "txt":
                content = [
                    `Hash Report - ${timestamp}`,
                    `Input: ${inputType === "file" ? `File: ${fileName} (${formatBytes(fileSize)})` : input.substring(0, 100)}`,
                    `Format: ${format}`,
                    "",
                    "Hashes:",
                    ...results.map(result => `${result.algorithm}: ${result.hash}`)
                ].join("\n");
                break;
        }

        const blob = new Blob([content], { 
            type: format === "json" ? "application/json" : format === "csv" ? "text/csv" : "text/plain"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hashes_${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }, [results, input, inputType, fileName, fileSize, selectedAlgorithms, options, format]);

    const clearAll = useCallback(() => {
        setInput("");
        setResults([]);
        setFileName("");
        setFileSize(0);
        setVerifyInput("");
        setVerifyHash("");
        setVerifyResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const TAB_VIEWS = [
        { id: "single" as const, label: "Single", icon: "ti-hash", description: "Generate hashes for single input" },
        { id: "batch" as const, label: "Batch", icon: "ti-files", description: "Process multiple files at once" },
        { id: "verify" as const, label: "Verify", icon: "ti-shield-check", description: "Verify hash integrity" },
        { id: "history" as const, label: "History", icon: "ti-history", description: "View generation history" },
    ];

    const statistics = getStatistics();

    return (
        <>
            <div className="hg-root">
                {/* Top Chrome */}
                <div className="hg-chrome">
                    <div className="hg-chrome-left">
                        <div className="hg-title">
                            <i className="ti ti-hash" />
                            Hash Generator
                        </div>
                    </div>
                    <div className="hg-chrome-right">
                        <button
                            type="button"
                            className="hg-chrome-btn"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            <i className="ti ti-settings" />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showAdvanced && (
                    <div className="hg-settings">
                        <div className="hg-settings-row">
                            <div className="hg-setting-group">
                                <label className="hg-setting-label">Output Format</label>
                                <select
                                    className="hg-select"
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value as HashFormat)}
                                >
                                    <option value="hex">Hexadecimal</option>
                                    <option value="base64">Base64</option>
                                    <option value="base32">Base32</option>
                                </select>
                            </div>
                            
                            <div className="hg-setting-group">
                                <label className="hg-setting-label">Salt (optional)</label>
                                <input
                                    type="text"
                                    className="hg-input"
                                    value={salt}
                                    onChange={(e) => setSalt(e.target.value)}
                                    placeholder="Enter salt for additional security"
                                />
                            </div>
                            
                            <div className="hg-setting-group">
                                <label className="hg-setting-label">HMAC Key (optional)</label>
                                <input
                                    type="text"
                                    className="hg-input"
                                    value={hmacKey}
                                    onChange={(e) => setHmacKey(e.target.value)}
                                    placeholder="Enter key for HMAC"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="hg-tabs-bar">
                    <nav className="hg-tabs">
                        {TAB_VIEWS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`hg-tab${tabView === tab.id ? " active" : ""}`}
                                onClick={() => setTabView(tab.id)}
                                title={tab.description}
                            >
                                <i className={`ti ${tab.icon}`} />
                                <span>{tab.label}</span>
                                {tab.id === "history" && history.length > 0 && (
                                    <span className="hg-tab-badge">{history.length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="hg-tab-content">
                    {/* Single Hash Tab */}
                    {tabView === "single" && (
                        <div className="hg-single-view">
                            {/* Algorithm Selection */}
                            <div className="hg-algorithms-section">
                                <div className="hg-algorithms-header">
                                    <div className="hg-algorithms-title">
                                        <i className="ti ti-shield-check" />
                                        Select Hash Algorithms
                                    </div>
                                    <div className="hg-algorithms-actions">
                                        <button
                                            type="button"
                                            className="hg-algo-preset-btn"
                                            onClick={selectRecommendedAlgorithms}
                                        >
                                            Recommended
                                        </button>
                                        <button
                                            type="button"
                                            className="hg-algo-preset-btn"
                                            onClick={selectAllAlgorithms}
                                        >
                                            Select All
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="hg-algorithms-grid">
                                    {filteredAlgorithms.map(([algorithm, info]) => (
                                        <button
                                            key={algorithm}
                                            type="button"
                                            className={`hg-algorithm${selectedAlgorithms.has(algorithm as HashAlgorithm) ? " active" : ""}${info.isDeprecated ? " deprecated" : ""}`}
                                            onClick={() => toggleAlgorithm(algorithm as HashAlgorithm)}
                                            title={info.description}
                                        >
                                            <i className={`ti ${info.icon}`} style={{ color: info.color }} />
                                            <div className="hg-algorithm-info">
                                                <span className="hg-algorithm-name">{info.label}</span>
                                                <span className="hg-algorithm-bits">{info.bitLength} bits</span>
                                                {info.isDeprecated && (
                                                    <span className="hg-deprecated-tag">Deprecated</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Section */}
                            <div className="hg-input-section">
                                <div className="hg-input-header">
                                    <div className="hg-input-title">
                                        <i className="ti ti-file-text" />
                                        Input Data
                                    </div>
                                    <div className="hg-input-actions">
                                        <div className="hg-samples">
                                            {Object.entries(SAMPLE_DATA).slice(0, 3).map(([key, sample]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    className="hg-sample-btn"
                                                    onClick={() => loadSample(key as keyof typeof SAMPLE_DATA)}
                                                    title={sample.description}
                                                >
                                                    {sample.label}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="file-input"
                                            className="hg-file-input"
                                            onChange={handleFileUpload}
                                            disabled={isProcessing}
                                        />
                                        <label htmlFor="file-input" className="hg-file-btn">
                                            <i className="ti ti-upload" />
                                            Upload File
                                        </label>
                                    </div>
                                </div>

                                <div className="hg-input-area">
                                    <textarea
                                        className="hg-textarea"
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            setInputType("text");
                                            setFileName("");
                                        }}
                                        placeholder="Enter text to hash or upload a file..."
                                        spellCheck={false}
                                        disabled={isProcessing}
                                    />
                                    
                                    {inputType === "file" && fileName && (
                                        <div className="hg-file-info">
                                            <i className="ti ti-file-check" />
                                            <span className="hg-file-name">{fileName}</span>
                                            <span className="hg-file-size">({formatBytes(fileSize)})</span>
                                        </div>
                                    )}
                                    
                                    {input.trim() && inputType === "text" && (
                                        <div className="hg-input-meta">
                                            <span className="hg-input-size">
                                                {input.length} characters, {formatBytes(new Blob([input]).size)}
                                            </span>
                                            <span className="hg-input-type">
                                                Type: {detectInputType(input)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="hg-input-footer">
                                    <div className="hg-input-stats">
                                        {selectedAlgorithms.size > 0 && (
                                            <span className="hg-selected-count">
                                                {selectedAlgorithms.size} algorithm{selectedAlgorithms.size !== 1 ? 's' : ''} selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="hg-input-actions-footer">
                                        <button
                                            type="button"
                                            className="hg-action-btn hg-action-btn--secondary"
                                            onClick={clearAll}
                                            disabled={!input && !fileName}
                                        >
                                            <i className="ti ti-trash" />
                                            Clear
                                        </button>
                                        <button
                                            type="button"
                                            className="hg-action-btn hg-action-btn--primary"
                                            onClick={handleTextHash}
                                            disabled={isProcessing || (!input.trim() && !fileName) || selectedAlgorithms.size === 0}
                                        >
                                            <i className={`ti ${isProcessing ? "ti-loader hg-spin" : "ti-hash"}`} />
                                            {isProcessing ? "Processing..." : "Generate Hashes"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results Section */}
                            {results.length > 0 && (
                                <div className="hg-results-section">
                                    <div className="hg-results-header">
                                        <div className="hg-results-title">
                                            <i className="ti ti-sparkles" />
                                            Generated Hashes
                                            <span className="hg-results-count">{results.length}</span>
                                        </div>
                                        <div className="hg-results-actions">
                                            <button
                                                type="button"
                                                className="hg-export-btn"
                                                onClick={() => handleExport("txt")}
                                                title="Export as text"
                                            >
                                                <i className="ti ti-file-text" />
                                                TXT
                                            </button>
                                            <button
                                                type="button"
                                                className="hg-export-btn"
                                                onClick={() => handleExport("csv")}
                                                title="Export as CSV"
                                            >
                                                <i className="ti ti-file-spreadsheet" />
                                                CSV
                                            </button>
                                            <button
                                                type="button"
                                                className="hg-export-btn"
                                                onClick={() => handleExport("json")}
                                                title="Export as JSON"
                                            >
                                                <i className="ti ti-file-code" />
                                                JSON
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hg-results-grid">
                                        {results.map((result) => {
                                            const algorithmInfo = HASH_ALGORITHMS[result.algorithm];
                                            return (
                                                <div key={result.algorithm} className="hg-result-card">
                                                    <div className="hg-result-header">
                                                        <div className="hg-result-info">
                                                            <i className={`ti ${algorithmInfo.icon}`} style={{ color: algorithmInfo.color }} />
                                                            <span className="hg-result-algorithm">{result.algorithm}</span>
                                                            <span className="hg-result-format">{result.format}</span>
                                                        </div>
                                                        <div className="hg-result-meta">
                                                            <span className="hg-result-time">
                                                                {result.executionTime.toFixed(2)}ms
                                                            </span>
                                                            <div className={`hg-strength-badge hg-strength-${result.strength}`}>
                                                                {result.strength.replace('-', ' ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="hg-result-hash">
                                                        {result.hash}
                                                    </div>
                                                    <div className="hg-result-footer">
                                                        <span className="hg-result-length">
                                                            {result.hash.length} characters
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className={`hg-copy-btn${copiedKey === result.algorithm ? " copied" : ""}`}
                                                            onClick={() => handleCopy(result.hash, result.algorithm)}
                                                        >
                                                            <i className={`ti ${copiedKey === result.algorithm ? "ti-check" : "ti-copy"}`} />
                                                            {copiedKey === result.algorithm ? "Copied" : "Copy"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Analysis */}
                                    <div className="hg-analysis-section">
                                        <HashAnalysis 
                                            results={results} 
                                            inputSize={inputType === "file" ? fileSize : new Blob([input]).size} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {results.length === 0 && !isProcessing && (
                                <div className="hg-empty-state">
                                    <div className="hg-empty-icon">
                                        <i className="ti ti-hash" />
                                    </div>
                                    <h3 className="hg-empty-title">Generate Cryptographic Hashes</h3>
                                    <p className="hg-empty-description">
                                        Enter text, upload a file, or try a sample to generate secure hash values using industry-standard algorithms.
                                    </p>
                                    <div className="hg-empty-samples">
                                        {Object.entries(SAMPLE_DATA).slice(0, 3).map(([key, sample]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                className="hg-empty-sample-btn"
                                                onClick={() => loadSample(key as keyof typeof SAMPLE_DATA)}
                                            >
                                                Try {sample.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Batch Processing Tab */}
                    {tabView === "batch" && (
                        <HashBatch 
                            algorithms={Array.from(selectedAlgorithms)} 
                            options={options}
                        />
                    )}

                    {/* Verification Tab */}
                    {tabView === "verify" && (
                        <div className="hg-verify-view">
                            <div className="hg-verify-section">
                                <div className="hg-verify-header">
                                    <div className="hg-verify-title">
                                        <i className="ti ti-shield-check" />
                                        Hash Verification
                                    </div>
                                </div>

                                <div className="hg-verify-form">
                                    <div className="hg-verify-group">
                                        <label className="hg-verify-label">Original Text/Data</label>
                                        <textarea
                                            className="hg-textarea"
                                            value={verifyInput}
                                            onChange={(e) => setVerifyInput(e.target.value)}
                                            placeholder="Enter the original text or data..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className="hg-verify-group">
                                        <label className="hg-verify-label">Expected Hash</label>
                                        <input
                                            type="text"
                                            className="hg-input"
                                            value={verifyHash}
                                            onChange={(e) => setVerifyHash(e.target.value)}
                                            placeholder="Enter the hash to verify against..."
                                        />
                                    </div>

                                    <div className="hg-verify-options">
                                        <div className="hg-verify-group">
                                            <label className="hg-verify-label">Algorithm</label>
                                            <select
                                                className="hg-select"
                                                value={verifyAlgorithm}
                                                onChange={(e) => setVerifyAlgorithm(e.target.value as HashAlgorithm)}
                                            >
                                                {filteredAlgorithms.map(([algorithm, info]) => (
                                                    <option key={algorithm} value={algorithm}>
                                                        {info.label} ({info.bitLength} bits)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            className="hg-action-btn hg-action-btn--primary"
                                            onClick={handleVerify}
                                            disabled={!verifyInput.trim() || !verifyHash.trim() || isProcessing}
                                        >
                                            <i className={`ti ${isProcessing ? "ti-loader hg-spin" : "ti-shield-check"}`} />
                                            Verify Hash
                                        </button>
                                    </div>

                                    {verifyResult !== null && (
                                        <div className={`hg-verify-result hg-verify-result--${verifyResult ? "success" : "failure"}`}>
                                            <i className={`ti ${verifyResult ? "ti-shield-check-filled" : "ti-shield-x-filled"}`} />
                                            <div className="hg-verify-result-content">
                                                <strong>
                                                    {verifyResult ? "Hash Verified ✓" : "Hash Mismatch ✗"}
                                                </strong>
                                                <p>
                                                    {verifyResult 
                                                        ? "The provided hash matches the generated hash. Data integrity confirmed."
                                                        : "The provided hash does not match the generated hash. Data may have been modified."
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {tabView === "history" && (
                        <div className="hg-history-view">
                            {history.length === 0 ? (
                                <div className="hg-empty-state">
                                    <div className="hg-empty-icon">
                                        <i className="ti ti-history" />
                                    </div>
                                    <h3 className="hg-empty-title">No History Yet</h3>
                                    <p className="hg-empty-description">
                                        Your hash generation history will appear here. History is automatically saved when auto-save is enabled in settings.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="hg-history-header">
                                        <div className="hg-history-title">
                                            <i className="ti ti-history" />
                                            Hash Generation History
                                            <span className="hg-history-count">{history.length}</span>
                                        </div>
                                        <div className="hg-history-actions">
                                            <button
                                                type="button"
                                                className="hg-action-btn hg-action-btn--secondary"
                                                onClick={clearHistory}
                                            >
                                                <i className="ti ti-trash" />
                                                Clear History
                                            </button>
                                        </div>
                                    </div>

                                    {statistics.totalEntries > 0 && (
                                        <div className="hg-statistics">
                                            <div className="hg-stat">
                                                <span className="hg-stat-value">{statistics.totalEntries}</span>
                                                <span className="hg-stat-label">Total Hashes</span>
                                            </div>
                                            <div className="hg-stat">
                                                <span className="hg-stat-value">{statistics.mostUsedAlgorithm || "N/A"}</span>
                                                <span className="hg-stat-label">Most Used</span>
                                            </div>
                                            <div className="hg-stat">
                                                <span className="hg-stat-value">{statistics.averageProcessingTime.toFixed(1)}ms</span>
                                                <span className="hg-stat-label">Avg. Time</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="hg-history-list">
                                        {history.slice(0, 50).map((entry) => (
                                            <div key={entry.id} className="hg-history-item">
                                                <div className="hg-history-item-header">
                                                    <div className="hg-history-item-info">
                                                        <span className="hg-history-item-input">
                                                            {entry.inputType === "file" ? `📁 ${entry.fileName}` : entry.input}
                                                        </span>
                                                        <span className="hg-history-item-time">
                                                            {new Date(entry.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="hg-history-item-algorithms">
                                                        {entry.results.slice(0, 3).map((result) => (
                                                            <span key={result.algorithm} className="hg-algorithm-tag">
                                                                {result.algorithm}
                                                            </span>
                                                        ))}
                                                        {entry.results.length > 3 && (
                                                            <span className="hg-algorithm-tag hg-algorithm-tag--more">
                                                                +{entry.results.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="hg-footer">
                    <div className="hg-footer-info">
                        <i className="ti ti-shield-lock" />
                        <span>Everything runs in your browser — no data ever leaves this page.</span>
                    </div>
                    {results.length > 0 && (
                        <div className="hg-footer-stats">
                            <span>{results.length} hash{results.length !== 1 ? 'es' : ''} generated</span>
                            <span>•</span>
                            <span>{format.toUpperCase()} format</span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .hg-root {
                    --hg-radius-sm: 6px;
                    --hg-radius-md: 8px;
                    --hg-radius-lg: 12px;
                    --hg-radius-xl: 16px;
                    
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-xl);
                    display: flex;
                    flex-direction: column;
                    min-height: 700px;
                    overflow: hidden;
                }

                /* Chrome */
                .hg-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hg-chrome-left,
                .hg-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .hg-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .hg-title i {
                    font-size: 16px;
                    color: var(--brand);
                }

                .hg-chrome-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--hg-radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-chrome-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hg-chrome-btn i {
                    font-size: 13px;
                }

                /* Settings */
                .hg-settings {
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hg-settings-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .hg-setting-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .hg-setting-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hg-select,
                .hg-input {
                    height: 32px;
                    padding: 0 10px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 12px;
                    transition: border-color 0.12s;
                }

                .hg-select:focus,
                .hg-input:focus {
                    outline: none;
                    border-color: var(--brand);
                }

                /* Tabs */
                .hg-tabs-bar {
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hg-tabs {
                    display: flex;
                    padding: 0 16px;
                }

                .hg-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 40px;
                    padding: 0 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.12s;
                }

                .hg-tab:hover {
                    color: var(--text);
                }

                .hg-tab.active {
                    color: var(--text);
                }

                .hg-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 12px;
                    right: 12px;
                    height: 2px;
                    background: var(--brand);
                    border-radius: 2px 2px 0 0;
                }

                .hg-tab i {
                    font-size: 14px;
                }

                .hg-tab-badge {
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
                    font-weight: 600;
                }

                .hg-tab-content {
                    flex: 1;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                }

                .hg-single-view {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 16px;
                }

                /* Algorithm Selection */
                .hg-algorithms-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-lg);
                    overflow: hidden;
                }

                .hg-algorithms-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hg-algorithms-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hg-algorithms-title i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .hg-algorithms-actions {
                    display: flex;
                    gap: 6px;
                }

                .hg-algo-preset-btn {
                    height: 26px;
                    padding: 0 8px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-algo-preset-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .hg-algorithms-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 8px;
                    padding: 16px;
                }

                .hg-algorithm {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-surface);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-algorithm:hover {
                    background: var(--bg-card);
                    border-color: var(--brand-border);
                }

                .hg-algorithm.active {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                    color: var(--brand-text);
                }

                .hg-algorithm.deprecated {
                    opacity: 0.6;
                }

                .hg-algorithm i {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .hg-algorithm-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    min-width: 0;
                    flex: 1;
                }

                .hg-algorithm-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .hg-algorithm.active .hg-algorithm-name {
                    color: var(--brand-text);
                }

                .hg-algorithm-bits {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .hg-deprecated-tag {
                    font-size: 8px;
                    font-weight: 600;
                    padding: 1px 4px;
                    border-radius: 3px;
                    background: #fef2f2;
                    color: #dc2626;
                    border: 0.5px solid #fecaca;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    align-self: flex-start;
                }

                @media (prefers-color-scheme: dark) {
                    .hg-deprecated-tag {
                        background: #1f1517;
                        color: #f87171;
                        border-color: #3c1518;
                    }
                }

                /* Input Section */
                .hg-input-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-lg);
                    overflow: hidden;
                }

                .hg-input-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .hg-input-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hg-input-title i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .hg-input-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .hg-samples {
                    display: flex;
                    gap: 4px;
                }

                .hg-sample-btn {
                    height: 26px;
                    padding: 0 8px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .hg-sample-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .hg-file-input {
                    display: none;
                }

                .hg-file-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 28px;
                    padding: 0 12px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-file-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hg-file-btn i {
                    font-size: 12px;
                }

                .hg-input-area {
                    padding: 16px;
                    position: relative;
                }

                .hg-textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 12px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-surface);
                    color: var(--text);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                    resize: vertical;
                    transition: border-color 0.12s;
                }

                .hg-textarea:focus {
                    outline: none;
                    border-color: var(--brand);
                }

                .hg-textarea::placeholder {
                    color: var(--text-disabled);
                }

                .hg-file-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 12px;
                    padding: 10px 12px;
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    border-radius: var(--hg-radius-md);
                    color: var(--brand-text);
                    font-size: 12px;
                }

                .hg-file-info i {
                    font-size: 14px;
                    color: var(--brand);
                }

                .hg-file-name {
                    font-weight: 600;
                    font-family: var(--font-mono);
                }

                .hg-file-size {
                    color: var(--brand-text);
                    opacity: 0.8;
                }

                .hg-input-meta {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .hg-input-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .hg-input-stats {
                    display: flex;
                    gap: 12px;
                }

                .hg-selected-count {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .hg-input-actions-footer {
                    display: flex;
                    gap: 8px;
                }

                .hg-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--hg-radius-md);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    border: 0.5px solid var(--border);
                }

                .hg-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .hg-action-btn i {
                    font-size: 13px;
                }

                .hg-action-btn--primary {
                    background: var(--brand);
                    color: white;
                    border-color: var(--brand);
                }

                .hg-action-btn--primary:hover:not(:disabled) {
                    background: var(--brand-hover);
                    border-color: var(--brand-hover);
                }

                .hg-action-btn--secondary {
                    background: var(--bg-card);
                    color: var(--text-secondary);
                }

                .hg-action-btn--secondary:hover:not(:disabled) {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                /* Results */
                .hg-results-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-lg);
                    overflow: hidden;
                }

                .hg-results-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .hg-results-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hg-results-title i {
                    font-size: 14px;
                    color: var(--brand);
                }

                .hg-results-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 600;
                }

                .hg-results-actions {
                    display: flex;
                    gap: 4px;
                }

                .hg-export-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 8px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .hg-export-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .hg-export-btn i {
                    font-size: 11px;
                }

                .hg-results-grid {
                    padding: 16px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 12px;
                }

                .hg-result-card {
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-lg);
                    overflow: hidden;
                    transition: border-color 0.12s;
                }

                .hg-result-card:hover {
                    border-color: var(--brand-border);
                }

                .hg-result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                }

                .hg-result-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hg-result-info i {
                    font-size: 16px;
                }

                .hg-result-algorithm {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .hg-result-format {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    font-family: var(--font-mono);
                }

                .hg-result-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hg-result-time {
                    font-size: 10px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                }

                .hg-strength-badge {
                    font-size: 8px;
                    font-weight: 600;
                    padding: 2px 5px;
                    border-radius: 3px;
                    text-transform: capitalize;
                    letter-spacing: 0.05em;
                }

                .hg-strength-very-weak {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 0.5px solid #fecaca;
                }

                .hg-strength-weak {
                    background: #fef3c7;
                    color: #d97706;
                    border: 0.5px solid #fde68a;
                }

                .hg-strength-moderate {
                    background: #eff6ff;
                    color: #2563eb;
                    border: 0.5px solid #bfdbfe;
                }

                .hg-strength-strong {
                    background: #f0fdf4;
                    color: #16a34a;
                    border: 0.5px solid #bbf7d0;
                }

                .hg-strength-very-strong {
                    background: #ecfdf5;
                    color: #059669;
                    border: 0.5px solid #a7f3d0;
                }

                @media (prefers-color-scheme: dark) {
                    .hg-strength-very-weak {
                        background: #1f1517;
                        color: #f87171;
                        border-color: #3c1518;
                    }
                    .hg-strength-weak {
                        background: #451a03;
                        color: #fbbf24;
                        border-color: #78350f;
                    }
                    .hg-strength-moderate {
                        background: #0a1628;
                        color: #93c5fd;
                        border-color: #1e3a5f;
                    }
                    .hg-strength-strong {
                        background: #022c22;
                        color: #4ade80;
                        border-color: #14532d;
                    }
                    .hg-strength-very-strong {
                        background: #022c22;
                        color: #10b981;
                        border-color: #065f46;
                    }
                }

                .hg-result-hash {
                    padding: 12px 14px;
                    font-family: var(--font-mono);
                    font-size: 11px;
                    color: var(--text);
                    word-break: break-all;
                    line-height: 1.6;
                    background: var(--bg-surface);
                }

                .hg-result-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 14px;
                    background: var(--bg-card);
                    border-top: 0.5px solid var(--border);
                }

                .hg-result-length {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .hg-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 24px;
                    padding: 0 8px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-copy-btn:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                .hg-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .hg-copy-btn i {
                    font-size: 11px;
                }

                .hg-analysis-section {
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                }

                /* Verification */
                .hg-verify-view {
                    padding: 16px;
                }

                .hg-verify-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-lg);
                    overflow: hidden;
                }

                .hg-verify-header {
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .hg-verify-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hg-verify-title i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .hg-verify-form {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .hg-verify-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .hg-verify-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hg-verify-options {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 12px;
                    align-items: end;
                }

                .hg-verify-result {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    border-radius: var(--hg-radius-lg);
                    margin-top: 8px;
                }

                .hg-verify-result i {
                    font-size: 20px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .hg-verify-result--success {
                    background: #f0fdf4;
                    color: #166534;
                    border: 0.5px solid #bbf7d0;
                }

                .hg-verify-result--success i {
                    color: #16a34a;
                }

                .hg-verify-result--failure {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 0.5px solid #fecaca;
                }

                .hg-verify-result--failure i {
                    color: #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .hg-verify-result--success {
                        background: #022c22;
                        color: #4ade80;
                        border-color: #14532d;
                    }
                    .hg-verify-result--success i {
                        color: #10b981;
                    }
                    .hg-verify-result--failure {
                        background: #1f1517;
                        color: #f87171;
                        border-color: #3c1518;
                    }
                    .hg-verify-result--failure i {
                        color: #ef4444;
                    }
                }

                .hg-verify-result-content p {
                    margin: 4px 0 0;
                    font-size: 12px;
                    line-height: 1.5;
                }

                /* History */
                .hg-history-view {
                    padding: 16px;
                }

                .hg-history-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .hg-history-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .hg-history-title i {
                    font-size: 16px;
                    color: var(--text-secondary);
                }

                .hg-history-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    border-radius: 99px;
                    background: var(--brand-light);
                    color: var(--brand-text);
                    font-size: 10px;
                    font-weight: 600;
                }

                .hg-history-actions {
                    display: flex;
                    gap: 8px;
                }

                .hg-statistics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 12px;
                    margin-bottom: 20px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-lg);
                    padding: 16px;
                }

                .hg-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 4px;
                }

                .hg-stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                    line-height: 1;
                }

                .hg-stat-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .hg-history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .hg-history-item {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-lg);
                    padding: 16px;
                    transition: border-color 0.12s;
                }

                .hg-history-item:hover {
                    border-color: var(--brand-border);
                }

                .hg-history-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }

                .hg-history-item-info {
                    flex: 1;
                    min-width: 0;
                }

                .hg-history-item-input {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-mono);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    display: block;
                    margin-bottom: 4px;
                }

                .hg-history-item-time {
                    font-size: 10px;
                    color: var(--text-tertiary);
                }

                .hg-history-item-algorithms {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .hg-algorithm-tag {
                    font-size: 9px;
                    font-weight: 600;
                    padding: 2px 5px;
                    border-radius: 3px;
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    border: 0.5px solid var(--border);
                    text-transform: uppercase;
                    font-family: var(--font-mono);
                    letter-spacing: 0.05em;
                }

                .hg-algorithm-tag--more {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* Empty State */
                .hg-empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .hg-empty-icon {
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

                .hg-empty-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .hg-empty-description {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.6;
                }

                .hg-empty-samples {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .hg-empty-sample-btn {
                    height: 32px;
                    padding: 0 12px;
                    border: 0.5px solid var(--border);
                    border-radius: var(--hg-radius-md);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .hg-empty-sample-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* Footer */
                .hg-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 8px 16px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 10px;
                    color: var(--text-disabled);
                    flex-wrap: wrap;
                }

                .hg-footer-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hg-footer-info i {
                    font-size: 12px;
                }

                .hg-footer-stats {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .hg-spin {
                    animation: spin 1s linear infinite;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hg-chrome {
                        padding: 10px 12px;
                    }

                    .hg-single-view {
                        padding: 12px;
                        gap: 16px;
                    }

                    .hg-algorithms-grid {
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    }

                    .hg-results-grid {
                        grid-template-columns: 1fr;
                    }

                    .hg-verify-options {
                        grid-template-columns: 1fr;
                    }

                    .hg-statistics {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .hg-history-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .hg-footer {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .hg-chrome-btn,
                    .hg-algo-preset-btn,
                    .hg-algorithm,
                    .hg-sample-btn,
                    .hg-file-btn,
                    .hg-textarea,
                    .hg-action-btn,
                    .hg-result-card,
                    .hg-copy-btn,
                    .hg-export-btn,
                    .hg-empty-sample-btn,
                    .hg-history-item {
                        transition: none;
                    }

                    .hg-spin {
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}