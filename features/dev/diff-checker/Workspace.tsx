// features/dev/diff-checker/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import styles from "./style/Workspace.module.css";

import {
  computeDiff,
  type DiffOptions,
  type DiffViewMode,
  type DiffAlgorithm,
  type FileType,
  type DiffResult,
  SAMPLE_DIFFS,
  detectFileType,
} from "./ts/diffEngine";
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
      <div className={styles.dcRoot}>
        {/* Command Bar */}
        <div className={styles.dcCommandBar}>
          <div className={styles.dcCommandLeft}>
            {/* Sample buttons */}
            <div className={styles.dcSamples}>
              {Object.keys(SAMPLE_DIFFS).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={styles.dcSampleBtn}
                  onClick={() => loadSample(type as keyof typeof SAMPLE_DIFFS)}
                >
                  <i className="ti ti-file-code" />
                  <span className={styles.dcSampleLabel}>{type.toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className={styles.dcActions}>
              <button
                type="button"
                className={styles.dcActionBtn}
                onClick={swapTexts}
                disabled={!originalText && !modifiedText}
                title="Swap original and modified"
              >
                <i className="ti ti-arrows-exchange" />
                <span className={styles.dcActionLabel}>Swap</span>
              </button>

              <button
                type="button"
                className={styles.dcActionBtn}
                onClick={() => setShowSearch(!showSearch)}
                title="Search in diff"
              >
                <i className="ti ti-search" />
                <span className={styles.dcActionLabel}>Search</span>
              </button>

              <button
                type="button"
                className={styles.dcActionBtn}
                onClick={clearAll}
                disabled={!originalText && !modifiedText}
                title="Clear all content"
              >
                <i className="ti ti-trash" />
                <span className={styles.dcActionLabel}>Clear</span>
              </button>
            </div>
          </div>

          <div className={styles.dcCommandRight}>
            {/* Options */}
            <div className={styles.dcOptions}>
              <label className={styles.dcToggle}>
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
                <span className={styles.dcToggleTrack}>
                  <span className={styles.dcToggleThumb} />
                </span>
                <span className={styles.dcToggleLabel}>Ignore whitespace</span>
              </label>

              <label className={styles.dcToggle}>
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
                <span className={styles.dcToggleTrack}>
                  <span className={styles.dcToggleThumb} />
                </span>
                <span className={styles.dcToggleLabel}>Ignore case</span>
              </label>
            </div>

            {/* Algorithm selector */}
            <select
              className={styles.dcSelect}
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
            <div className={styles.dcViewToggle}>
              {(["split", "unified"] as DiffViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.dcViewBtn}${viewMode === mode ? ` ${styles.active}` : ""}`}
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
              <div className={styles.dcExportGroup}>
                <button
                  type="button"
                  className={`${styles.dcActionBtn} ${styles.dcActionBtnPrimary}`}
                  onClick={saveDiff}
                >
                  <i className="ti ti-device-floppy" />
                  <span className={styles.dcActionLabel}>Save</span>
                </button>

                <div className={styles.dcExportMenu}>
                  <button type="button" className={styles.dcActionBtn} title="Export options">
                    <i className="ti ti-download" />
                    <i className="ti ti-chevron-down" />
                  </button>
                  <div className={styles.dcExportDropdown}>
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
          <div className={styles.dcSearchBar}>
            <div className={styles.dcSearchInputWrap}>
              <i className="ti ti-search" />
              <input
                type="text"
                className={styles.dcSearchInput}
                placeholder="Search in diff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.dcSearchClear}
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
          <div className={styles.dcStatsSummary}>
            <div className={styles.dcSummaryStats}>
              {diffResult.stats.added > 0 && (
                <div className={`${styles.dcSummaryStat} ${styles.dcSummaryStatAdd}`}>
                  <i className="ti ti-plus" />
                  {diffResult.stats.added} added
                </div>
              )}
              {diffResult.stats.removed > 0 && (
                <div className={`${styles.dcSummaryStat} ${styles.dcSummaryStatRemove}`}>
                  <i className="ti ti-minus" />
                  {diffResult.stats.removed} removed
                </div>
              )}
              <div className={styles.dcSummaryStat}>
                <i className="ti ti-equal" />
                {diffResult.stats.unchanged} unchanged
              </div>
              <div className={styles.dcSummaryStat}>
                <i className="ti ti-percentage" />
                {diffResult.stats.similarity}% similar
              </div>
            </div>
            <div className={styles.dcSummaryText}>{diffResult.summary}</div>
          </div>
        )}

        {/* Mobile Panel Switcher */}
        <div className={styles.dcMobileTabs}>
          <button
            type="button"
            className={`${styles.dcMobileTab}${mobilePanel === "original" ? ` ${styles.active}` : ""}`}
            onClick={() => setMobilePanel("original")}
          >
            <i className="ti ti-file" />
            Original
            {originalText && <span className={styles.dcMobileIndicator} />}
          </button>
          <button
            type="button"
            className={`${styles.dcMobileTab}${mobilePanel === "modified" ? ` ${styles.active}` : ""}`}
            onClick={() => setMobilePanel("modified")}
          >
            <i className="ti ti-file-diff" />
            Modified
            {modifiedText && <span className={styles.dcMobileIndicator} />}
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.dcContent}>
          {/* Input Panels (Desktop) or Mobile Input */}
          <div className={styles.dcInputSection}>
            <div
              className={`${styles.dcInputPanel}${mobilePanel === "original" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
            >
              <div className={styles.dcPanelHeader}>
                <div className={styles.dcPanelTitle}>
                  <i className="ti ti-file" />
                  <span>Original</span>
                  {originalFilename && <span className={styles.dcFilename}>{originalFilename}</span>}
                </div>
                <div className={styles.dcPanelActions}>
                  <input
                    type="file"
                    id="original-file"
                    className={styles.dcFileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "original");
                    }}
                    accept=".txt,.js,.ts,.jsx,.tsx,.css,.scss,.html,.htm,.json,.md,.xml,.svg"
                  />
                  <label htmlFor="original-file" className={styles.dcFileBtn} title="Upload file">
                    <i className="ti ti-upload" />
                  </label>
                  {originalText && (
                    <button
                      type="button"
                      className={styles.dcPanelBtn}
                      onClick={() => handleCopy(originalText, "original")}
                      title="Copy content"
                    >
                      <i className={`ti ${copiedKey === "original" ? "ti-check" : "ti-copy"}`} />
                    </button>
                  )}
                  {originalText && (
                    <button
                      type="button"
                      className={styles.dcPanelBtn}
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
                className={styles.dcTextarea}
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste original text here or upload a file..."
                spellCheck={false}
              />
            </div>

            <div
              className={`${styles.dcInputPanel}${mobilePanel === "modified" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
            >
              <div className={styles.dcPanelHeader}>
                <div className={styles.dcPanelTitle}>
                  <i className="ti ti-file-diff" />
                  <span>Modified</span>
                  {modifiedFilename && <span className={styles.dcFilename}>{modifiedFilename}</span>}
                </div>
                <div className={styles.dcPanelActions}>
                  <input
                    type="file"
                    id="modified-file"
                    className={styles.dcFileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "modified");
                    }}
                    accept=".txt,.js,.ts,.jsx,.tsx,.css,.scss,.html,.htm,.json,.md,.xml,.svg"
                  />
                  <label htmlFor="modified-file" className={styles.dcFileBtn} title="Upload file">
                    <i className="ti ti-upload" />
                  </label>
                  {modifiedText && (
                    <button
                      type="button"
                      className={styles.dcPanelBtn}
                      onClick={() => handleCopy(modifiedText, "modified")}
                      title="Copy content"
                    >
                      <i className={`ti ${copiedKey === "modified" ? "ti-check" : "ti-copy"}`} />
                    </button>
                  )}
                  {modifiedText && (
                    <button
                      type="button"
                      className={styles.dcPanelBtn}
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
                className={styles.dcTextarea}
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                placeholder="Paste modified text here or upload a file..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className={styles.dcResultsSection}>
            {/* Tab Navigation */}
            <div className={styles.dcTabsBar}>
              <nav className={styles.dcTabs}>
                {TAB_VIEWS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.dcTab}${tabView === tab.id ? ` ${styles.active}` : ""}`}
                    onClick={() => setTabView(tab.id)}
                    aria-selected={tabView === tab.id}
                  >
                    <i className={`ti ${tab.icon}`} />
                    <span>{tab.label}</span>
                    {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                      <span className={styles.dcTabBadge}>{history.length}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className={styles.dcTabContent}>
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
                  <div className={styles.dcEmptyState}>
                    <div className={styles.dcEmptyIcon}>
                      <i className="ti ti-git-compare" />
                    </div>
                    <h3 className={styles.dcEmptyTitle}>Compare Text Differences</h3>
                    <p className={styles.dcEmptyDesc}>
                      Add content to both panels or load a sample to see the differences
                    </p>
                    <div className={styles.dcEmptyActions}>
                      {Object.keys(SAMPLE_DIFFS).map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={styles.dcEmptySampleBtn}
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
                <div className={styles.dcHistory}>
                  {history.length === 0 ? (
                    <div className={styles.dcEmptyState}>
                      <div className={styles.dcEmptyIcon}>
                        <i className="ti ti-history" />
                      </div>
                      <h3 className={styles.dcEmptyTitle}>No History Yet</h3>
                      <p className={styles.dcEmptyDesc}>
                        Your comparison history will appear here after you save diffs
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.dcHistoryHeader}>
                        <div className={styles.dcHistoryTitle}>
                          <i className="ti ti-history" />
                          Diff History
                          <span className={styles.dcHistoryCount}>{history.length}</span>
                        </div>
                        <button type="button" className={styles.dcActionBtn} onClick={clearHistory}>
                          <i className="ti ti-trash" />
                          Clear All
                        </button>
                      </div>

                      <div className={styles.dcHistoryList}>
                        {history.slice(0, 20).map((entry) => (
                          <div key={entry.id} className={styles.dcHistoryItem}>
                            <div className={styles.dcHistoryItemHeader}>
                              <span className={styles.dcHistoryItemTitle}>{entry.title}</span>
                              <span className={styles.dcHistoryItemTime}>
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className={styles.dcHistoryItemStats}>
                              {entry.result.stats.added > 0 && (
                                <span className={`${styles.dcHistoryStat} ${styles.dcHistoryStatAdd}`}>
                                  +{entry.result.stats.added}
                                </span>
                              )}
                              {entry.result.stats.removed > 0 && (
                                <span className={`${styles.dcHistoryStat} ${styles.dcHistoryStatRemove}`}>
                                  -{entry.result.stats.removed}
                                </span>
                              )}
                              <span className={styles.dcHistoryStat}>
                                {entry.result.stats.similarity}% similar
                              </span>
                            </div>
                            <button
                              type="button"
                              className={styles.dcHistoryRestore}
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
        <div className={styles.dcFooter}>
          <div className={styles.dcFooterInfo}>
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {diffResult && (
            <div className={styles.dcFooterStats}>
              <span>{diffResult.stats.totalLines.toLocaleString()} total lines</span>
              <span>•</span>
              <span>{fileType} file</span>
            </div>
          )}
        </div>
      </div>
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