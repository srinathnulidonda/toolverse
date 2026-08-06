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
} from "./ts/hashEngine";
import HashAnalysis from "./HashAnalysis";
import HashBatch from "./HashBatch";
import { useHashStore } from "./ts/hashStore";
import styles from "./style/Workspace.module.css";

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
      <div className={styles.hgRoot}>
        {/* Top Chrome */}
        <div className={styles.hgChrome}>
          <div className={styles.hgChromeLeft}>
            <div className={styles.hgTitle}>
              <i className="ti ti-hash" />
              Hash Generator
            </div>
          </div>
          <div className={styles.hgChromeRight}>
            <button
              type="button"
              className={styles.hgChromeBtn}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className="ti ti-settings" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showAdvanced && (
          <div className={styles.hgSettings}>
            <div className={styles.hgSettingsRow}>
              <div className={styles.hgSettingGroup}>
                <label className={styles.hgSettingLabel}>Output Format</label>
                <select
                  className={styles.hgSelect}
                  value={format}
                  onChange={(e) => setFormat(e.target.value as HashFormat)}
                >
                  <option value="hex">Hexadecimal</option>
                  <option value="base64">Base64</option>
                  <option value="base32">Base32</option>
                </select>
              </div>

              <div className={styles.hgSettingGroup}>
                <label className={styles.hgSettingLabel}>Salt (optional)</label>
                <input
                  type="text"
                  className={styles.hgInput}
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  placeholder="Enter salt for additional security"
                />
              </div>

              <div className={styles.hgSettingGroup}>
                <label className={styles.hgSettingLabel}>HMAC Key (optional)</label>
                <input
                  type="text"
                  className={styles.hgInput}
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  placeholder="Enter key for HMAC"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={styles.hgTabsBar}>
          <nav className={styles.hgTabs}>
            {TAB_VIEWS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.hgTab}${tabView === tab.id ? ` ${styles.active}` : ""}`}
                onClick={() => setTabView(tab.id)}
                title={tab.description}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className={styles.hgTabBadge}>{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className={styles.hgTabContent}>
          {/* Single Hash Tab */}
          {tabView === "single" && (
            <div className={styles.hgSingleView}>
              {/* Algorithm Selection */}
              <div className={styles.hgAlgorithmsSection}>
                <div className={styles.hgAlgorithmsHeader}>
                  <div className={styles.hgAlgorithmsTitle}>
                    <i className="ti ti-shield-check" />
                    Select Hash Algorithms
                  </div>
                  <div className={styles.hgAlgorithmsActions}>
                    <button
                      type="button"
                      className={styles.hgAlgoPresetBtn}
                      onClick={selectRecommendedAlgorithms}
                    >
                      Recommended
                    </button>
                    <button
                      type="button"
                      className={styles.hgAlgoPresetBtn}
                      onClick={selectAllAlgorithms}
                    >
                      Select All
                    </button>
                  </div>
                </div>

                <div className={styles.hgAlgorithmsGrid}>
                  {filteredAlgorithms.map(([algorithm, info]) => (
                    <button
                      key={algorithm}
                      type="button"
                      className={`${styles.hgAlgorithm}${selectedAlgorithms.has(algorithm as HashAlgorithm) ? ` ${styles.active}` : ""}${info.isDeprecated ? ` ${styles.deprecated}` : ""}`}
                      onClick={() => toggleAlgorithm(algorithm as HashAlgorithm)}
                      title={info.description}
                    >
                      <i className={`ti ${info.icon}`} style={{ color: info.color }} />
                      <div className={styles.hgAlgorithmInfo}>
                        <span className={styles.hgAlgorithmName}>{info.label}</span>
                        <span className={styles.hgAlgorithmBits}>{info.bitLength} bits</span>
                        {info.isDeprecated && <span className={styles.hgDeprecatedTag}>Deprecated</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Section */}
              <div className={styles.hgInputSection}>
                <div className={styles.hgInputHeader}>
                  <div className={styles.hgInputTitle}>
                    <i className="ti ti-file-text" />
                    Input Data
                  </div>
                  <div className={styles.hgInputActions}>
                    <div className={styles.hgSamples}>
                      {Object.entries(SAMPLE_DATA)
                        .slice(0, 3)
                        .map(([key, sample]) => (
                          <button
                            key={key}
                            type="button"
                            className={styles.hgSampleBtn}
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
                      className={styles.hgFileInput}
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                    />
                    <label htmlFor="file-input" className={styles.hgFileBtn}>
                      <i className="ti ti-upload" />
                      Upload File
                    </label>
                  </div>
                </div>

                <div className={styles.hgInputArea}>
                  <textarea
                    className={styles.hgTextarea}
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
                    <div className={styles.hgFileInfo}>
                      <i className="ti ti-file-check" />
                      <span className={styles.hgFileName}>{fileName}</span>
                      <span className={styles.hgFileSize}>({formatBytes(fileSize)})</span>
                    </div>
                  )}

                  {input.trim() && inputType === "text" && (
                    <div className={styles.hgInputMeta}>
                      <span className={styles.hgInputSize}>
                        {input.length} characters, {formatBytes(new Blob([input]).size)}
                      </span>
                      <span className={styles.hgInputType}>Type: {detectInputType(input)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.hgInputFooter}>
                  <div className={styles.hgInputStats}>
                    {selectedAlgorithms.size > 0 && (
                      <span className={styles.hgSelectedCount}>
                        {selectedAlgorithms.size} algorithm
                        {selectedAlgorithms.size !== 1 ? "s" : ""} selected
                      </span>
                    )}
                  </div>
                  <div className={styles.hgInputActionsFooter}>
                    <button
                      type="button"
                      className={`${styles.hgActionBtn} ${styles.hgActionBtnSecondary}`}
                      onClick={clearAll}
                      disabled={!input && !fileName}
                    >
                      <i className="ti ti-trash" />
                      Clear
                    </button>
                    <button
                      type="button"
                      className={`${styles.hgActionBtn} ${styles.hgActionBtnPrimary}`}
                      onClick={handleTextHash}
                      disabled={
                        isProcessing ||
                        (!input.trim() && !fileName) ||
                        selectedAlgorithms.size === 0
                      }
                    >
                      <i className={`ti ${isProcessing ? `ti-loader ${styles.hgSpin}` : "ti-hash"}`} />
                      {isProcessing ? "Processing..." : "Generate Hashes"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {results.length > 0 && (
                <div className={styles.hgResultsSection}>
                  <div className={styles.hgResultsHeader}>
                    <div className={styles.hgResultsTitle}>
                      <i className="ti ti-sparkles" />
                      Generated Hashes
                      <span className={styles.hgResultsCount}>{results.length}</span>
                    </div>
                    <div className={styles.hgResultsActions}>
                      <button
                        type="button"
                        className={styles.hgExportBtn}
                        onClick={() => handleExport("txt")}
                        title="Export as text"
                      >
                        <i className="ti ti-file-text" />
                        TXT
                      </button>
                      <button
                        type="button"
                        className={styles.hgExportBtn}
                        onClick={() => handleExport("csv")}
                        title="Export as CSV"
                      >
                        <i className="ti ti-file-spreadsheet" />
                        CSV
                      </button>
                      <button
                        type="button"
                        className={styles.hgExportBtn}
                        onClick={() => handleExport("json")}
                        title="Export as JSON"
                      >
                        <i className="ti ti-file-code" />
                        JSON
                      </button>
                    </div>
                  </div>

                  <div className={styles.hgResultsGrid}>
                    {results.map((result) => {
                      const algorithmInfo = HASH_ALGORITHMS[result.algorithm];
                      return (
                        <div key={result.algorithm} className={styles.hgResultCard}>
                          <div className={styles.hgResultHeader}>
                            <div className={styles.hgResultInfo}>
                              <i
                                className={`ti ${algorithmInfo.icon}`}
                                style={{ color: algorithmInfo.color }}
                              />
                              <span className={styles.hgResultAlgorithm}>{result.algorithm}</span>
                              <span className={styles.hgResultFormat}>{result.format}</span>
                            </div>
                            <div className={styles.hgResultMeta}>
                              <span className={styles.hgResultTime}>
                                {result.executionTime.toFixed(2)}ms
                              </span>
                              <div className={`${styles.hgStrengthBadge} ${styles[`hgStrength${result.strength.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}`]}`}>
                                {result.strength.replace("-", " ")}
                              </div>
                            </div>
                          </div>
                          <div className={styles.hgResultHash}>{result.hash}</div>
                          <div className={styles.hgResultFooter}>
                            <span className={styles.hgResultLength}>
                              {result.hash.length} characters
                            </span>
                            <button
                              type="button"
                              className={`${styles.hgCopyBtn}${copiedKey === result.algorithm ? ` ${styles.copied}` : ""}`}
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
                  <div className={styles.hgAnalysisSection}>
                    <HashAnalysis
                      results={results}
                      inputSize={inputType === "file" ? fileSize : new Blob([input]).size}
                    />
                  </div>
                </div>
              )}

              {/* Empty State */}
              {results.length === 0 && !isProcessing && (
                <div className={styles.hgEmptyState}>
                  <div className={styles.hgEmptyIcon}>
                    <i className="ti ti-hash" />
                  </div>
                  <h3 className={styles.hgEmptyTitle}>Generate Cryptographic Hashes</h3>
                  <p className={styles.hgEmptyDescription}>
                    Enter text, upload a file, or try a sample to generate secure hash values using
                    industry-standard algorithms.
                  </p>
                  <div className={styles.hgEmptySamples}>
                    {Object.entries(SAMPLE_DATA)
                      .slice(0, 3)
                      .map(([key, sample]) => (
                        <button
                          key={key}
                          type="button"
                          className={styles.hgEmptySampleBtn}
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
            <div className={styles.hgVerifyView}>
              <div className={styles.hgVerifySection}>
                <div className={styles.hgVerifyHeader}>
                  <div className={styles.hgVerifyTitle}>
                    <i className="ti ti-shield-check" />
                    Hash Verification
                  </div>
                </div>

                <div className={styles.hgVerifyForm}>
                  <div className={styles.hgVerifyGroup}>
                    <label className={styles.hgVerifyLabel}>Original Text/Data</label>
                    <textarea
                      className={styles.hgTextarea}
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      placeholder="Enter the original text or data..."
                      rows={4}
                    />
                  </div>

                  <div className={styles.hgVerifyGroup}>
                    <label className={styles.hgVerifyLabel}>Expected Hash</label>
                    <input
                      type="text"
                      className={styles.hgInput}
                      value={verifyHash}
                      onChange={(e) => setVerifyHash(e.target.value)}
                      placeholder="Enter the hash to verify against..."
                    />
                  </div>

                  <div className={styles.hgVerifyOptions}>
                    <div className={styles.hgVerifyGroup}>
                      <label className={styles.hgVerifyLabel}>Algorithm</label>
                      <select
                        className={styles.hgSelect}
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
                      className={`${styles.hgActionBtn} ${styles.hgActionBtnPrimary}`}
                      onClick={handleVerify}
                      disabled={!verifyInput.trim() || !verifyHash.trim() || isProcessing}
                    >
                      <i
                        className={`ti ${isProcessing ? `ti-loader ${styles.hgSpin}` : "ti-shield-check"}`}
                      />
                      Verify Hash
                    </button>
                  </div>

                  {verifyResult !== null && (
                    <div
                      className={`${styles.hgVerifyResult} ${styles[`hgVerifyResult${verifyResult ? "Success" : "Failure"}`]}`}
                    >
                      <i
                        className={`ti ${verifyResult ? "ti-shield-check-filled" : "ti-shield-x-filled"}`}
                      />
                      <div className={styles.hgVerifyResultContent}>
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
            <div className={styles.hgHistoryView}>
              {history.length === 0 ? (
                <div className={styles.hgEmptyState}>
                  <div className={styles.hgEmptyIcon}>
                    <i className="ti ti-history" />
                  </div>
                  <h3 className={styles.hgEmptyTitle}>No History Yet</h3>
                  <p className={styles.hgEmptyDescription}>
                    Your hash generation history will appear here. History is automatically saved
                    when auto-save is enabled in settings.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.hgHistoryHeader}>
                    <div className={styles.hgHistoryTitle}>
                      <i className="ti ti-history" />
                      Hash Generation History
                      <span className={styles.hgHistoryCount}>{history.length}</span>
                    </div>
                    <div className={styles.hgHistoryActions}>
                      <button
                        type="button"
                        className={`${styles.hgActionBtn} ${styles.hgActionBtnSecondary}`}
                        onClick={clearHistory}
                      >
                        <i className="ti ti-trash" />
                        Clear History
                      </button>
                    </div>
                  </div>

                  {statistics.totalEntries > 0 && (
                    <div className={styles.hgStatistics}>
                      <div className={styles.hgStat}>
                        <span className={styles.hgStatValue}>{statistics.totalEntries}</span>
                        <span className={styles.hgStatLabel}>Total Hashes</span>
                      </div>
                      <div className={styles.hgStat}>
                        <span className={styles.hgStatValue}>
                          {statistics.mostUsedAlgorithm || "N/A"}
                        </span>
                        <span className={styles.hgStatLabel}>Most Used</span>
                      </div>
                      <div className={styles.hgStat}>
                        <span className={styles.hgStatValue}>
                          {statistics.averageProcessingTime.toFixed(1)}ms
                        </span>
                        <span className={styles.hgStatLabel}>Avg. Time</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.hgHistoryList}>
                    {history.slice(0, 50).map((entry) => (
                      <div key={entry.id} className={styles.hgHistoryItem}>
                        <div className={styles.hgHistoryItemHeader}>
                          <div className={styles.hgHistoryItemInfo}>
                            <span className={styles.hgHistoryItemInput}>
                              {entry.inputType === "file" ? `📁 ${entry.fileName}` : entry.input}
                            </span>
                            <span className={styles.hgHistoryItemTime}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className={styles.hgHistoryItemAlgorithms}>
                            {entry.results.slice(0, 3).map((result) => (
                              <span key={result.algorithm} className={styles.hgAlgorithmTag}>
                                {result.algorithm}
                              </span>
                            ))}
                            {entry.results.length > 3 && (
                              <span className={`${styles.hgAlgorithmTag} ${styles.hgAlgorithmTagMore}`}>
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
        <div className={styles.hgFooter}>
          <div className={styles.hgFooterInfo}>
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {results.length > 0 && (
            <div className={styles.hgFooterStats}>
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