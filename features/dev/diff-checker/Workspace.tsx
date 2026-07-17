// features/dev/diff-checker/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import {
  computeDiff,
  type DiffOptions,
  type DiffViewMode,
  type DiffAlgorithm,
  type FileType,
  type DiffResult,
  SAMPLE_DIFFS,
  detectFileType,
} from "./diffEngine";
import DiffViewer from "./DiffViewer";
import DiffStats from "./DiffStats";
import { useHistoryStore } from "@/lib/useHistoryStore";

type TabView = "diff" | "stats" | "history";

interface HistoryEntry {
  id: string;
  timestamp: number;
  title: string;
  originalText: string;
  modifiedText: string;
  result: DiffResult;
  options: DiffOptions;
  fileType?: string;
  originalFilename?: string;
  modifiedFilename?: string;
}

export default function DiffCheckerWorkspace({ tool }: { tool: Tool }) {
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [originalFilename, setOriginalFilename] = useState("");
  const [modifiedFilename, setModifiedFilename] = useState("");
  const [tabView, setTabView] = useState<TabView>("diff");
  const [viewMode, setViewMode] = useState<DiffViewMode>("split");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"original" | "modified">("original");

  const [options, setOptions] = useState<DiffOptions>({
    algorithm: "myers",
    ignoreWhitespace: false,
    ignoreCase: false,
    contextLines: 3,
    showInvisibles: false,
    wrapLines: true,
  });

  const historyStore = useHistoryStore<HistoryEntry>({
    key: "diff-checker-history",
    maxItems: 100,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).timestamp === "number" &&
        typeof (raw as any).title === "string" &&
        typeof (raw as any).originalText === "string" &&
        typeof (raw as any).modifiedText === "string" &&
        (raw as any).result &&
        typeof (raw as any).result === "object" &&
        (raw as any).options &&
        typeof (raw as any).options === "object"
      ) {
        return raw as HistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HistoryEntry, recentItems: HistoryEntry[]) => {
      return recentItems.some(
        (h) => h.originalText === newItem.originalText && h.modifiedText === newItem.modifiedText
      );
    },
    recentItemsCount: 5,
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const { history, addToHistory, clearHistory } = historyStore;

  const diffResult = useMemo(() => {
    if (!originalText && !modifiedText) return null;
    return computeDiff(originalText, modifiedText, options);
  }, [originalText, modifiedText, options]);

  const fileType = useMemo(() => {
    const filename = originalFilename || modifiedFilename || "file.txt";
    return detectFileType(filename, originalText || modifiedText);
  }, [originalFilename, modifiedFilename, originalText, modifiedText]);

  const handleFileUpload = useCallback(async (file: File, target: "original" | "modified") => {
    try {
      const text = await file.text();
      if (target === "original") {
        setOriginalText(text);
        setOriginalFilename(file.name);
      } else {
        setModifiedText(text);
        setModifiedFilename(file.name);
      }
    } catch (error) {
      logger.error("Failed to read file:", error);
    }
  }, []);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const handleExport = useCallback(
    (format: "patch" | "html" | "json") => {
      if (!diffResult) return;

      let content = "";
      const timestamp = new Date().toISOString();

      switch (format) {
        case "patch":
          content = generatePatch(originalText, modifiedText, diffResult, {
            originalFile: originalFilename || "original.txt",
            modifiedFile: modifiedFilename || "modified.txt",
          });
          break;
        case "html":
          content = generateHTMLDiff(diffResult);
          break;
        case "json":
          content = JSON.stringify(
            {
              timestamp,
              original: originalText,
              modified: modifiedText,
              result: diffResult,
              options,
            },
            null,
            2
          );
          break;
      }

      const blob = new Blob([content], {
        type: format === "html" ? "text/html" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diff_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [diffResult, originalText, modifiedText, originalFilename, modifiedFilename, options]
  );

  const saveDiff = useCallback(() => {
    if (!diffResult) return;

    const title =
      originalFilename && modifiedFilename
        ? `${originalFilename} ↔ ${modifiedFilename}`
        : `Diff ${new Date().toLocaleDateString()}`;

    addToHistory({
      id: Date.now().toString(),
      timestamp: Date.now(),
      title,
      originalText,
      modifiedText,
      result: diffResult,
      options,
      fileType,
      originalFilename,
      modifiedFilename,
    });
  }, [
    diffResult,
    originalText,
    modifiedText,
    originalFilename,
    modifiedFilename,
    options,
    fileType,
    addToHistory,
  ]);

  const loadSample = useCallback((type: keyof typeof SAMPLE_DIFFS) => {
    const sample = SAMPLE_DIFFS[type];
    setOriginalText(sample.original);
    setModifiedText(sample.modified);
    setOriginalFilename(`sample.${type}`);
    setModifiedFilename(`sample_modified.${type}`);
    setMobilePanel("original");
  }, []);

  const swapTexts = useCallback(() => {
    setOriginalText(modifiedText);
    setModifiedText(originalText);
    setOriginalFilename(modifiedFilename);
    setModifiedFilename(originalFilename);
  }, [originalText, modifiedText, originalFilename, modifiedFilename]);

  const clearAll = useCallback(() => {
    setOriginalText("");
    setModifiedText("");
    setOriginalFilename("");
    setModifiedFilename("");
    setSearchQuery("");
  }, []);

  const TAB_VIEWS = [
    { id: "diff" as const, label: "Diff", icon: "ti-git-diff" },
    { id: "stats" as const, label: "Stats", icon: "ti-chart-bar" },
    { id: "history" as const, label: "History", icon: "ti-history" },
  ];

  return (
    <>
      <div className="dc-root">
        {/* Command Bar */}
        <div className="dc-command-bar">
          <div className="dc-command-left">
            {/* Sample buttons */}
            <div className="dc-samples">
              {Object.keys(SAMPLE_DIFFS).map((type) => (
                <button
                  key={type}
                  type="button"
                  className="dc-sample-btn"
                  onClick={() => loadSample(type as keyof typeof SAMPLE_DIFFS)}
                >
                  <i className="ti ti-file-code" />
                  <span className="dc-sample-label">{type.toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="dc-actions">
              <button
                type="button"
                className="dc-action-btn"
                onClick={swapTexts}
                disabled={!originalText && !modifiedText}
                title="Swap original and modified"
              >
                <i className="ti ti-arrows-exchange" />
                <span className="dc-action-label">Swap</span>
              </button>

              <button
                type="button"
                className="dc-action-btn"
                onClick={() => setShowSearch(!showSearch)}
                title="Search in diff"
              >
                <i className="ti ti-search" />
                <span className="dc-action-label">Search</span>
              </button>

              <button
                type="button"
                className="dc-action-btn"
                onClick={clearAll}
                disabled={!originalText && !modifiedText}
                title="Clear all content"
              >
                <i className="ti ti-trash" />
                <span className="dc-action-label">Clear</span>
              </button>
            </div>
          </div>

          <div className="dc-command-right">
            {/* Options */}
            <div className="dc-options">
              <label className="dc-toggle">
                <input
                  type="checkbox"
                  checked={options.ignoreWhitespace}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      ignoreWhitespace: e.target.checked,
                    }))
                  }
                />
                <span className="dc-toggle-track">
                  <span className="dc-toggle-thumb" />
                </span>
                <span className="dc-toggle-label">Ignore whitespace</span>
              </label>

              <label className="dc-toggle">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      ignoreCase: e.target.checked,
                    }))
                  }
                />
                <span className="dc-toggle-track">
                  <span className="dc-toggle-thumb" />
                </span>
                <span className="dc-toggle-label">Ignore case</span>
              </label>
            </div>

            {/* Algorithm selector */}
            <select
              className="dc-select"
              value={options.algorithm}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  algorithm: e.target.value as DiffAlgorithm,
                }))
              }
            >
              <option value="myers">Line-based</option>
              <option value="word">Word-based</option>
              <option value="character">Character-based</option>
            </select>

            {/* View mode toggle */}
            <div className="dc-view-toggle">
              {(["split", "unified"] as DiffViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`dc-view-btn${viewMode === mode ? " active" : ""}`}
                  onClick={() => setViewMode(mode)}
                >
                  <i
                    className={`ti ${mode === "split" ? "ti-layout-columns" : "ti-layout-list"}`}
                  />
                  <span>{mode === "split" ? "Split" : "Unified"}</span>
                </button>
              ))}
            </div>

            {/* Save/Export */}
            {diffResult && (
              <div className="dc-export-group">
                <button
                  type="button"
                  className="dc-action-btn dc-action-btn--primary"
                  onClick={saveDiff}
                >
                  <i className="ti ti-device-floppy" />
                  <span className="dc-action-label">Save</span>
                </button>

                <div className="dc-export-menu">
                  <button type="button" className="dc-action-btn" title="Export options">
                    <i className="ti ti-download" />
                    <i className="ti ti-chevron-down" />
                  </button>
                  <div className="dc-export-dropdown">
                    <button onClick={() => handleExport("patch")}>
                      <i className="ti ti-file-diff" />
                      Patch file
                    </button>
                    <button onClick={() => handleExport("html")}>
                      <i className="ti ti-file-code" />
                      HTML diff
                    </button>
                    <button onClick={() => handleExport("json")}>
                      <i className="ti ti-file-type-json" />
                      JSON data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="dc-search-bar">
            <div className="dc-search-input-wrap">
              <i className="ti ti-search" />
              <input
                type="text"
                className="dc-search-input"
                placeholder="Search in diff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="dc-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="ti ti-x" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {diffResult && (
          <div className="dc-stats-summary">
            <div className="dc-summary-stats">
              {diffResult.stats.added > 0 && (
                <div className="dc-summary-stat dc-summary-stat--add">
                  <i className="ti ti-plus" />
                  {diffResult.stats.added} added
                </div>
              )}
              {diffResult.stats.removed > 0 && (
                <div className="dc-summary-stat dc-summary-stat--remove">
                  <i className="ti ti-minus" />
                  {diffResult.stats.removed} removed
                </div>
              )}
              <div className="dc-summary-stat">
                <i className="ti ti-equal" />
                {diffResult.stats.unchanged} unchanged
              </div>
              <div className="dc-summary-stat">
                <i className="ti ti-percentage" />
                {diffResult.stats.similarity}% similar
              </div>
            </div>
            <div className="dc-summary-text">{diffResult.summary}</div>
          </div>
        )}

        {/* Mobile Panel Switcher */}
        <div className="dc-mobile-tabs">
          <button
            type="button"
            className={`dc-mobile-tab${mobilePanel === "original" ? " active" : ""}`}
            onClick={() => setMobilePanel("original")}
          >
            <i className="ti ti-file" />
            Original
            {originalText && <span className="dc-mobile-indicator" />}
          </button>
          <button
            type="button"
            className={`dc-mobile-tab${mobilePanel === "modified" ? " active" : ""}`}
            onClick={() => setMobilePanel("modified")}
          >
            <i className="ti ti-file-diff" />
            Modified
            {modifiedText && <span className="dc-mobile-indicator" />}
          </button>
        </div>

        {/* Main Content */}
        <div className="dc-content">
          {/* Input Panels (Desktop) or Mobile Input */}
          <div className="dc-input-section">
            <div
              className={`dc-input-panel${mobilePanel === "original" ? " mobile-visible" : " mobile-hidden"}`}
            >
              <div className="dc-panel-header">
                <div className="dc-panel-title">
                  <i className="ti ti-file" />
                  <span>Original</span>
                  {originalFilename && <span className="dc-filename">{originalFilename}</span>}
                </div>
                <div className="dc-panel-actions">
                  <input
                    type="file"
                    id="original-file"
                    className="dc-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "original");
                    }}
                    accept=".txt,.js,.ts,.jsx,.tsx,.css,.scss,.html,.htm,.json,.md,.xml,.svg"
                  />
                  <label htmlFor="original-file" className="dc-file-btn" title="Upload file">
                    <i className="ti ti-upload" />
                  </label>
                  {originalText && (
                    <button
                      type="button"
                      className="dc-panel-btn"
                      onClick={() => handleCopy(originalText, "original")}
                      title="Copy content"
                    >
                      <i className={`ti ${copiedKey === "original" ? "ti-check" : "ti-copy"}`} />
                    </button>
                  )}
                  {originalText && (
                    <button
                      type="button"
                      className="dc-panel-btn"
                      onClick={() => {
                        setOriginalText("");
                        setOriginalFilename("");
                      }}
                      title="Clear"
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="dc-textarea"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste original text here or upload a file..."
                spellCheck={false}
              />
            </div>

            <div
              className={`dc-input-panel${mobilePanel === "modified" ? " mobile-visible" : " mobile-hidden"}`}
            >
              <div className="dc-panel-header">
                <div className="dc-panel-title">
                  <i className="ti ti-file-diff" />
                  <span>Modified</span>
                  {modifiedFilename && <span className="dc-filename">{modifiedFilename}</span>}
                </div>
                <div className="dc-panel-actions">
                  <input
                    type="file"
                    id="modified-file"
                    className="dc-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "modified");
                    }}
                    accept=".txt,.js,.ts,.jsx,.tsx,.css,.scss,.html,.htm,.json,.md,.xml,.svg"
                  />
                  <label htmlFor="modified-file" className="dc-file-btn" title="Upload file">
                    <i className="ti ti-upload" />
                  </label>
                  {modifiedText && (
                    <button
                      type="button"
                      className="dc-panel-btn"
                      onClick={() => handleCopy(modifiedText, "modified")}
                      title="Copy content"
                    >
                      <i className={`ti ${copiedKey === "modified" ? "ti-check" : "ti-copy"}`} />
                    </button>
                  )}
                  {modifiedText && (
                    <button
                      type="button"
                      className="dc-panel-btn"
                      onClick={() => {
                        setModifiedText("");
                        setModifiedFilename("");
                      }}
                      title="Clear"
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="dc-textarea"
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                placeholder="Paste modified text here or upload a file..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="dc-results-section">
            {/* Tab Navigation */}
            <div className="dc-tabs-bar">
              <nav className="dc-tabs">
                {TAB_VIEWS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`dc-tab${tabView === tab.id ? " active" : ""}`}
                    onClick={() => setTabView(tab.id)}
                    aria-selected={tabView === tab.id}
                  >
                    <i className={`ti ${tab.icon}`} />
                    <span>{tab.label}</span>
                    {tab.id === "history" && history.length > 0 && (
                      <span className="dc-tab-badge">{history.length}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="dc-tab-content">
              {tabView === "diff" &&
                (diffResult ? (
                  <DiffViewer
                    result={diffResult}
                    viewMode={viewMode}
                    fileType={fileType}
                    originalText={originalText}
                    modifiedText={modifiedText}
                    searchQuery={searchQuery}
                    showInvisibles={options.showInvisibles}
                    wrapLines={options.wrapLines}
                  />
                ) : (
                  <div className="dc-empty-state">
                    <div className="dc-empty-icon">
                      <i className="ti ti-git-compare" />
                    </div>
                    <h3 className="dc-empty-title">Compare Text Differences</h3>
                    <p className="dc-empty-desc">
                      Add content to both panels or load a sample to see the differences
                    </p>
                    <div className="dc-empty-actions">
                      {Object.keys(SAMPLE_DIFFS).map((type) => (
                        <button
                          key={type}
                          type="button"
                          className="dc-empty-sample-btn"
                          onClick={() => loadSample(type as keyof typeof SAMPLE_DIFFS)}
                        >
                          Load {type.toUpperCase()} sample
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              {tabView === "stats" && (
                <DiffStats
                  originalText={originalText}
                  modifiedText={modifiedText}
                  result={diffResult}
                />
              )}

              {tabView === "history" && (
                <div className="dc-history">
                  {history.length === 0 ? (
                    <div className="dc-empty-state">
                      <div className="dc-empty-icon">
                        <i className="ti ti-history" />
                      </div>
                      <h3 className="dc-empty-title">No History Yet</h3>
                      <p className="dc-empty-desc">
                        Your comparison history will appear here after you save diffs
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="dc-history-header">
                        <div className="dc-history-title">
                          <i className="ti ti-history" />
                          Diff History
                          <span className="dc-history-count">{history.length}</span>
                        </div>
                        <button type="button" className="dc-action-btn" onClick={clearHistory}>
                          <i className="ti ti-trash" />
                          Clear All
                        </button>
                      </div>

                      <div className="dc-history-list">
                        {history.slice(0, 20).map((entry) => (
                          <div key={entry.id} className="dc-history-item">
                            <div className="dc-history-item-header">
                              <span className="dc-history-item-title">{entry.title}</span>
                              <span className="dc-history-item-time">
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="dc-history-item-stats">
                              {entry.result.stats.added > 0 && (
                                <span className="dc-history-stat dc-history-stat--add">
                                  +{entry.result.stats.added}
                                </span>
                              )}
                              {entry.result.stats.removed > 0 && (
                                <span className="dc-history-stat dc-history-stat--remove">
                                  -{entry.result.stats.removed}
                                </span>
                              )}
                              <span className="dc-history-stat">
                                {entry.result.stats.similarity}% similar
                              </span>
                            </div>
                            <button
                              type="button"
                              className="dc-history-restore"
                              onClick={() => {
                                setOriginalText(entry.originalText);
                                setModifiedText(entry.modifiedText);
                                setOriginalFilename(entry.originalFilename || "");
                                setModifiedFilename(entry.modifiedFilename || "");
                                setOptions(entry.options);
                                setTabView("diff");
                              }}
                            >
                              <i className="ti ti-restore" />
                              Restore
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dc-footer">
          <div className="dc-footer-info">
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {diffResult && (
            <div className="dc-footer-stats">
              <span>{diffResult.stats.totalLines.toLocaleString()} total lines</span>
              <span>•</span>
              <span>{fileType} file</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dc-root {
          --dc-radius-sm: 6px;
          --dc-radius-md: 8px;
          --dc-radius-lg: 12px;
          --dc-radius-xl: 16px;

          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--dc-radius-xl);
          display: flex;
          flex-direction: column;
          min-height: 700px;
          overflow: hidden;
        }

        /* Command Bar */
        .dc-command-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-wrap: wrap;
        }

        .dc-command-left,
        .dc-command-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .dc-samples {
          display: flex;
          gap: 4px;
        }

        .dc-sample-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 28px;
          padding: 0 9px;
          border-radius: var(--dc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .dc-sample-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .dc-sample-btn i {
          font-size: 12px;
        }

        .dc-actions {
          display: flex;
          gap: 4px;
        }

        .dc-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 28px;
          padding: 0 9px;
          border-radius: var(--dc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .dc-action-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .dc-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .dc-action-btn--primary {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .dc-action-btn--primary:hover:not(:disabled) {
          background: var(--brand);
          color: white;
        }

        .dc-action-btn i {
          font-size: 12px;
        }

        .dc-options {
          display: flex;
          gap: 12px;
        }

        .dc-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
        }

        .dc-toggle input {
          position: absolute;
          opacity: 0;
        }

        .dc-toggle-track {
          width: 28px;
          height: 16px;
          background: var(--border);
          border-radius: 99px;
          position: relative;
          transition: background 0.15s;
        }

        .dc-toggle input:checked + .dc-toggle-track {
          background: var(--brand);
        }

        .dc-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transition: transform 0.15s;
        }

        .dc-toggle input:checked + .dc-toggle-track .dc-toggle-thumb {
          transform: translateX(12px);
        }

        .dc-toggle-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .dc-select {
          height: 28px;
          padding: 0 8px;
          border: 0.5px solid var(--border);
          border-radius: var(--dc-radius-md);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
        }

        .dc-view-toggle {
          display: inline-flex;
          gap: 2px;
          padding: 2px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--dc-radius-md);
        }

        .dc-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 8px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .dc-view-btn:hover {
          background: var(--bg-surface);
        }

        .dc-view-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .dc-view-btn i {
          font-size: 12px;
        }

        .dc-export-group {
          display: flex;
          gap: 2px;
        }

        .dc-export-menu {
          position: relative;
          display: inline-block;
        }

        .dc-export-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--dc-radius-lg);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          z-index: 100;
          min-width: 140px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
        }

        .dc-export-menu:hover .dc-export-dropdown {
          opacity: 1;
          pointer-events: all;
        }

        .dc-export-dropdown button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: background 0.1s;
        }

        .dc-export-dropdown button:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        /* Search Bar */
        .dc-search-bar {
          padding: 8px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .dc-search-input-wrap {
          position: relative;
          max-width: 300px;
        }

        .dc-search-input-wrap i {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: var(--text-disabled);
        }

        .dc-search-input {
          width: 100%;
          height: 32px;
          padding: 0 32px 0 28px;
          border: 0.5px solid var(--border);
          border-radius: var(--dc-radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 12px;
          outline: none;
        }

        .dc-search-input:focus {
          border-color: var(--brand);
        }

        .dc-search-clear {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          color: var(--text-disabled);
          font-size: 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.1s;
        }

        .dc-search-clear:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        /* Stats Summary */
        .dc-stats-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 14px;
          background: var(--brand-light);
          border-bottom: 0.5px solid var(--brand-border);
          color: var(--brand-text);
        }

        .dc-summary-stats {
          display: flex;
          gap: 12px;
        }

        .dc-summary-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--brand-text);
        }

        .dc-summary-stat i {
          font-size: 12px;
        }

        .dc-summary-stat--add {
          color: #059669;
        }

        .dc-summary-stat--remove {
          color: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .dc-summary-stat--add {
            color: #34d399;
          }
          .dc-summary-stat--remove {
            color: #f87171;
          }
        }

        .dc-summary-text {
          font-size: 11px;
          font-weight: 500;
          color: var(--brand-text);
        }

        /* Mobile Tabs */
        .dc-mobile-tabs {
          display: none;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .dc-mobile-tab {
          flex: 1;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
        }

        .dc-mobile-tab.active {
          color: var(--text);
        }

        .dc-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
        }

        .dc-mobile-indicator {
          position: absolute;
          top: 8px;
          right: 15px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        /* Main Content */
        .dc-content {
          display: grid;
          grid-template-rows: 200px 1fr;
          flex: 1;
          overflow: hidden;
        }

        .dc-input-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          overflow: hidden;
        }

        .dc-input-panel {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          overflow: hidden;
        }

        .dc-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 8px;
        }

        .dc-panel-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          flex: 1;
          min-width: 0;
        }

        .dc-panel-title i {
          font-size: 13px;
        }

        .dc-filename {
          font-size: 10px;
          color: var(--text-tertiary);
          font-weight: 500;
          font-family: var(--font-mono);
          text-transform: none;
          letter-spacing: 0;
          background: var(--bg-card);
          padding: 2px 6px;
          border-radius: 4px;
          border: 0.5px solid var(--border);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dc-panel-actions {
          display: flex;
          gap: 4px;
        }

        .dc-file-input {
          display: none;
        }

        .dc-file-btn,
        .dc-panel-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.1s;
        }

        .dc-file-btn:hover,
        .dc-panel-btn:hover {
          background: var(--bg-card);
          color: var(--text);
        }

        .dc-textarea {
          flex: 1;
          width: 100%;
          padding: 12px;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.6;
          color: var(--text);
          resize: none;
          overflow: auto;
        }

        .dc-textarea::placeholder {
          color: var(--text-disabled);
        }

        .dc-results-section {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-card);
        }

        /* Tabs */
        .dc-tabs-bar {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .dc-tabs {
          display: flex;
          padding: 0 14px;
        }

        .dc-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
        }

        .dc-tab:hover {
          color: var(--text);
        }

        .dc-tab.active {
          color: var(--text);
        }

        .dc-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 10px;
          right: 10px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .dc-tab i {
          font-size: 13px;
        }

        .dc-tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
        }

        .dc-tab-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Empty State */
        .dc-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px 24px;
          text-align: center;
        }

        .dc-empty-icon {
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
          margin-bottom: 8px;
        }

        .dc-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .dc-empty-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 400px;
          line-height: 1.6;
        }

        .dc-empty-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .dc-empty-sample-btn {
          height: 32px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--dc-radius-md);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .dc-empty-sample-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /* History */
        .dc-history {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .dc-history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .dc-history-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dc-history-title i {
          font-size: 14px;
        }

        .dc-history-count {
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

        .dc-history-list {
          flex: 1;
          overflow: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dc-history-item {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--dc-radius-lg);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.12s;
          position: relative;
        }

        .dc-history-item:hover {
          border-color: var(--brand-border);
        }

        .dc-history-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .dc-history-item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dc-history-item-time {
          font-size: 10px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .dc-history-item-stats {
          display: flex;
          gap: 6px;
        }

        .dc-history-stat {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 99px;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
          font-family: var(--font-mono);
        }

        .dc-history-stat--add {
          background: rgba(5, 150, 105, 0.1);
          color: #059669;
          border-color: rgba(5, 150, 105, 0.2);
        }

        .dc-history-stat--remove {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          border-color: rgba(220, 38, 38, 0.2);
        }

        @media (prefers-color-scheme: dark) {
          .dc-history-stat--add {
            background: rgba(52, 211, 153, 0.1);
            color: #34d399;
            border-color: rgba(52, 211, 153, 0.2);
          }
          .dc-history-stat--remove {
            background: rgba(248, 113, 113, 0.1);
            color: #f87171;
            border-color: rgba(248, 113, 113, 0.2);
          }
        }

        .dc-history-restore {
          position: absolute;
          top: 8px;
          right: 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 6px;
          border-radius: var(--dc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          opacity: 0;
        }

        .dc-history-item:hover .dc-history-restore {
          opacity: 1;
        }

        .dc-history-restore:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .dc-history-restore i {
          font-size: 11px;
        }

        /* Footer */
        .dc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          font-size: 10px;
          color: var(--text-disabled);
          flex-wrap: wrap;
        }

        .dc-footer-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dc-footer-info i {
          font-size: 12px;
        }

        .dc-footer-stats {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .dc-command-bar {
            padding: 8px 12px;
          }

          .dc-sample-label,
          .dc-action-label {
            display: none;
          }

          .dc-options {
            gap: 8px;
          }

          .dc-toggle-label {
            display: none;
          }

          .dc-export-group {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .dc-mobile-tabs {
            display: flex;
          }

          .dc-content {
            grid-template-rows: 240px 1fr;
          }

          .dc-input-section {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }

          .dc-input-panel.mobile-hidden {
            display: none;
          }

          .dc-input-panel.mobile-visible {
            display: flex;
          }

          .dc-command-left {
            gap: 6px;
          }

          .dc-samples {
            gap: 2px;
          }

          .dc-actions {
            gap: 2px;
          }

          .dc-command-right {
            gap: 6px;
          }

          .dc-view-btn span {
            display: none;
          }

          .dc-stats-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .dc-summary-stats {
            gap: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dc-sample-btn,
          .dc-action-btn,
          .dc-view-btn,
          .dc-tab,
          .dc-mobile-tab,
          .dc-history-item,
          .dc-history-restore {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}

// Helper functions for export
function generatePatch(original: string, modified: string, result: any, options: any): string {
  const lines = [
    `--- ${options.originalFile}`,
    `+++ ${options.modifiedFile}`,
    `@@ -1,${original.split("\n").length} +1,${modified.split("\n").length} @@`,
  ];

  result.lines.forEach((line: any) => {
    if (line.type === "remove") {
      lines.push(`-${line.content}`);
    } else if (line.type === "add") {
      lines.push(`+${line.content}`);
    } else if (line.type === "unchanged") {
      lines.push(` ${line.content}`);
    }
  });

  return lines.join("\n");
}

function generateHTMLDiff(result: any): string {
  const lines = result.lines
    .map((line: any) => {
      const className = `diff-line diff-line--${line.type}`;
      const indicator = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
      const content = escapeHtml(line.content);
      return `<div class="${className}"><span class="diff-indicator">${indicator}</span><span class="diff-content">${content}</span></div>`;
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diff Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: monospace; line-height: 1.6; margin: 20px; }
        .diff-line { display: flex; padding: 2px 0; }
        .diff-line--add { background: #e6ffed; }
        .diff-line--remove { background: #ffeef0; }
        .diff-indicator { width: 20px; font-weight: bold; }
        .diff-content { flex: 1; }
    </style>
</head>
<body>
    <h1>Diff Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
    <div class="diff-container">
        ${lines}
    </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
