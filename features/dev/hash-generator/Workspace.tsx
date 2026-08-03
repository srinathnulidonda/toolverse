// features/dev/hash-generator/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

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
  formatBytes,
} from "./hashEngine";
import HashAnalysis from "./HashAnalysis";
import HashBatch from "./HashBatch";
import { useHashStore } from "./hashStore";
import "./style/HashAnalysis.css";
import "./style/Workspace.css";
import "./style/HashBatch.css";

type TabView = "single" | "batch" | "verify" | "history";

export default function HashGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [tabView, setTabView] = useState<TabView>("single");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<Set<HashAlgorithm>>(
    new Set(["SHA256"])
  );
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
  const { history, settings, addToHistory, clearHistory, searchHistory, getStatistics } =
    useHashStore();

  const options: Omit<HashOptions, "algorithm"> = useMemo(
    () => ({
      format,
      salt: salt || undefined,
      pepper: pepper || undefined,
      hmacKey: hmacKey || undefined,
    }),
    [format, salt, pepper, hmacKey]
  );

  const filteredAlgorithms = useMemo(() => {
    return Object.entries(HASH_ALGORITHMS).filter(
      ([, info]) => settings.showDeprecatedAlgorithms || !info.isDeprecated
    );
  }, [settings.showDeprecatedAlgorithms]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsProcessing(true);
        const arrayBuffer = await file.arrayBuffer();
        const results = await generateMultipleHashes(
          arrayBuffer,
          Array.from(selectedAlgorithms),
          options
        );

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
        logger.error("Failed to process file:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedAlgorithms, options, settings.autoSave, addToHistory]
  );

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
      logger.error("Failed to generate hashes:", error);
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
      logger.error("Failed to verify hash:", error);
      setVerifyResult(false);
    } finally {
      setIsProcessing(false);
    }
  }, [verifyInput, verifyHash, verifyAlgorithm, options]);

  const toggleAlgorithm = useCallback((algorithm: HashAlgorithm) => {
    setSelectedAlgorithms((prev) => {
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

  const handleExport = useCallback(
    (format: "json" | "csv" | "txt") => {
      if (results.length === 0) return;

      let content = "";
      const timestamp = new Date().toISOString();

      switch (format) {
        case "json":
          content = JSON.stringify(
            {
              timestamp,
              input: inputType === "file" ? `[File: ${fileName}]` : input.substring(0, 100),
              inputType,
              fileName,
              fileSize,
              algorithms: Array.from(selectedAlgorithms),
              options,
              results,
            },
            null,
            2
          );
          break;
        case "csv":
          content = [
            [
              "Algorithm",
              "Hash",
              "Format",
              "Execution Time (ms)",
              "Bit Length",
              "Security Strength",
            ],
            ...results.map((result) => [
              result.algorithm,
              result.hash,
              result.format,
              result.executionTime.toFixed(2),
              HASH_ALGORITHMS[result.algorithm].bitLength,
              result.strength,
            ]),
          ]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");
          break;
        case "txt":
          content = [
            `Hash Report - ${timestamp}`,
            `Input: ${inputType === "file" ? `File: ${fileName} (${formatBytes(fileSize)})` : input.substring(0, 100)}`,
            `Format: ${format}`,
            "",
            "Hashes:",
            ...results.map((result) => `${result.algorithm}: ${result.hash}`),
          ].join("\n");
          break;
      }

      const blob = new Blob([content], {
        type: format === "json" ? "application/json" : format === "csv" ? "text/csv" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hashes_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [results, input, inputType, fileName, fileSize, selectedAlgorithms, options, format]
  );

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
    {
      id: "single" as const,
      label: "Single",
      icon: "ti-hash",
      description: "Generate hashes for single input",
    },
    {
      id: "batch" as const,
      label: "Batch",
      icon: "ti-files",
      description: "Process multiple files at once",
    },
    {
      id: "verify" as const,
      label: "Verify",
      icon: "ti-shield-check",
      description: "Verify hash integrity",
    },
    {
      id: "history" as const,
      label: "History",
      icon: "ti-history",
      description: "View generation history",
    },
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
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
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
                        {info.isDeprecated && <span className="hg-deprecated-tag">Deprecated</span>}
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
                      {Object.entries(SAMPLE_DATA)
                        .slice(0, 3)
                        .map(([key, sample]) => (
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
                      <span className="hg-input-type">Type: {detectInputType(input)}</span>
                    </div>
                  )}
                </div>

                <div className="hg-input-footer">
                  <div className="hg-input-stats">
                    {selectedAlgorithms.size > 0 && (
                      <span className="hg-selected-count">
                        {selectedAlgorithms.size} algorithm
                        {selectedAlgorithms.size !== 1 ? "s" : ""} selected
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
                      disabled={
                        isProcessing ||
                        (!input.trim() && !fileName) ||
                        selectedAlgorithms.size === 0
                      }
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
                              <i
                                className={`ti ${algorithmInfo.icon}`}
                                style={{ color: algorithmInfo.color }}
                              />
                              <span className="hg-result-algorithm">{result.algorithm}</span>
                              <span className="hg-result-format">{result.format}</span>
                            </div>
                            <div className="hg-result-meta">
                              <span className="hg-result-time">
                                {result.executionTime.toFixed(2)}ms
                              </span>
                              <div className={`hg-strength-badge hg-strength-${result.strength}`}>
                                {result.strength.replace("-", " ")}
                              </div>
                            </div>
                          </div>
                          <div className="hg-result-hash">{result.hash}</div>
                          <div className="hg-result-footer">
                            <span className="hg-result-length">
                              {result.hash.length} characters
                            </span>
                            <button
                              type="button"
                              className={`hg-copy-btn${copiedKey === result.algorithm ? " copied" : ""}`}
                              onClick={() => handleCopy(result.hash, result.algorithm)}
                            >
                              <i
                                className={`ti ${copiedKey === result.algorithm ? "ti-check" : "ti-copy"}`}
                              />
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
                    Enter text, upload a file, or try a sample to generate secure hash values using
                    industry-standard algorithms.
                  </p>
                  <div className="hg-empty-samples">
                    {Object.entries(SAMPLE_DATA)
                      .slice(0, 3)
                      .map(([key, sample]) => (
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
            <HashBatch algorithms={Array.from(selectedAlgorithms)} options={options} />
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
                      <i
                        className={`ti ${isProcessing ? "ti-loader hg-spin" : "ti-shield-check"}`}
                      />
                      Verify Hash
                    </button>
                  </div>

                  {verifyResult !== null && (
                    <div
                      className={`hg-verify-result hg-verify-result--${verifyResult ? "success" : "failure"}`}
                    >
                      <i
                        className={`ti ${verifyResult ? "ti-shield-check-filled" : "ti-shield-x-filled"}`}
                      />
                      <div className="hg-verify-result-content">
                        <strong>{verifyResult ? "Hash Verified ✓" : "Hash Mismatch ✗"}</strong>
                        <p>
                          {verifyResult
                            ? "The provided hash matches the generated hash. Data integrity confirmed."
                            : "The provided hash does not match the generated hash. Data may have been modified."}
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
                    Your hash generation history will appear here. History is automatically saved
                    when auto-save is enabled in settings.
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
                        <span className="hg-stat-value">
                          {statistics.mostUsedAlgorithm || "N/A"}
                        </span>
                        <span className="hg-stat-label">Most Used</span>
                      </div>
                      <div className="hg-stat">
                        <span className="hg-stat-value">
                          {statistics.averageProcessingTime.toFixed(1)}ms
                        </span>
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
              <span>
                {results.length} hash{results.length !== 1 ? "es" : ""} generated
              </span>
              <span>•</span>
              <span>{format.toUpperCase()} format</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
