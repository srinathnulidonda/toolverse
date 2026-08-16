// features/dev/case-converter/Workspace.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { Tool } from "@/lib/tools";
import { type CaseType, CASE_FORMATS, type HistoryEntry, analyzeText } from "./ts/utils";
import CasePreview from "./CasePreview";
import CaseBatch from "./CaseBatch";
import CaseHistory from "./CaseHistory";
import CaseAnalyzer from "./CaseAnalyzer";
import { useHistoryStore } from "@/lib/useHistoryStore";
import styles from "./style/Workspace.module.css";

type ViewTab = "single" | "batch" | "analyze" | "history";

const VIEW_TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "single", label: "Single", icon: "ti-letter-case" },
  { id: "batch", label: "Batch", icon: "ti-files" },
  { id: "analyze", label: "Analyze", icon: "ti-chart-dots" },
  { id: "history", label: "History", icon: "ti-history" },
];

export default function CaseConverterWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [input, setInput] = useState("");
  const [selectedCases, setSelectedCases] = useState<CaseType[]>([
    "camel",
    "pascal",
    "snake",
    "kebab",
    "upper",
    "lower",
  ]);
  const [autoDetect, setAutoDetect] = useState(true);
  const [preserveNumbers, setPreserveNumbers] = useState(true);
  const [preserveAcronyms, setPreserveAcronyms] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  const { history, addToHistory, clearHistory } = useHistoryStore<HistoryEntry>({
    key: "case-converter-history",
    maxItems: 100,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).input === "string" &&
        typeof (raw as any).fromCase === "string" &&
        typeof (raw as any).toCase === "string" &&
        typeof (raw as any).output === "string" &&
        typeof (raw as any).timestamp === "number"
      ) {
        return raw as HistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem, recentItems) =>
      recentItems.some((h) => h.input === newItem.input && h.output === newItem.output),
    recentItemsCount: 5,
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const analysisPreview = useMemo(() => {
    if (!input.trim()) return null;
    return analyzeText(input);
  }, [input]);

  const handleConvert = useCallback(
    (text: string, caseType: CaseType, result: string) => {
      addToHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        input: text,
        fromCase: "auto",
        toCase: caseType,
        output: result,
        timestamp: Date.now(),
      });
    },
    [addToHistory]
  );

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const toggleFormat = useCallback((id: CaseType) => {
    setSelectedCases((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }, []);

  const showClear = viewTab === "single" || viewTab === "analyze";
  const wordCount = useMemo(
    () => (input.trim() ? input.trim().split(/\s+/).filter(Boolean).length : 0),
    [input]
  );

  return (
    <div className={styles.ccRoot}>
      <div className={styles.ccChrome}>
        <div className={styles.ccChromeLeft}>
          <div className={styles.ccTitle}>
            <div className={styles.ccTitleIcon}>
              <i className="ti ti-letter-case" />
            </div>
            Case Converter
            {viewTab === "single" && (
              <span className={styles.ccTitleBadge}>{selectedCases.length} formats</span>
            )}
          </div>
        </div>
        <div className={styles.ccChromeRight}>
          <button
            type="button"
            className={`${styles.ccSettingsBtn} ${showSettings ? styles.active : ""}`}
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            aria-label="Toggle options"
          >
            <i className="ti ti-adjustments" />
            <span className={styles.ccLabel}>Options</span>
          </button>
          {showClear && (
            <button type="button" className={styles.ccBtn} onClick={handleClear} disabled={!input}>
              <i className="ti ti-trash" />
              <span className={styles.ccLabel}>Clear</span>
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className={styles.ccSettings}>
          <div className={styles.ccSettingsGrid}>
            <div className={styles.ccSettingGroup}>
              <span className={styles.ccSettingLabel}>Output Formats</span>
              <div className={styles.ccFormatChips}>
                {CASE_FORMATS.map((format) => {
                  const active = selectedCases.includes(format.id);
                  return (
                    <label
                      key={format.id}
                      className={`${styles.ccFormatChip} ${active ? styles.active : ""}`}
                    >
                      <input type="checkbox" checked={active} onChange={() => toggleFormat(format.id)} />
                      <span className={styles.ccFormatChipLabel}>{format.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.ccSettingGroup}>
              <span className={styles.ccSettingLabel}>Conversion Options</span>
              <div className={styles.ccToggleRow}>
                <label className={styles.ccToggle}>
                  <input
                    type="checkbox"
                    checked={autoDetect}
                    onChange={(e) => setAutoDetect(e.target.checked)}
                  />
                  <span className={styles.ccToggleTrack}>
                    <span className={styles.ccToggleThumb} />
                  </span>
                  <span className={styles.ccToggleLabel}>Hide current format</span>
                </label>
                <label className={styles.ccToggle}>
                  <input
                    type="checkbox"
                    checked={preserveNumbers}
                    onChange={(e) => setPreserveNumbers(e.target.checked)}
                  />
                  <span className={styles.ccToggleTrack}>
                    <span className={styles.ccToggleThumb} />
                  </span>
                  <span className={styles.ccToggleLabel}>Preserve numbers</span>
                </label>
                <label className={styles.ccToggle}>
                  <input
                    type="checkbox"
                    checked={preserveAcronyms}
                    onChange={(e) => setPreserveAcronyms(e.target.checked)}
                  />
                  <span className={styles.ccToggleTrack}>
                    <span className={styles.ccToggleThumb} />
                  </span>
                  <span className={styles.ccToggleLabel}>Preserve acronyms</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.ccTabsBar}>
        <nav className={styles.ccTabs} role="tablist">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`${styles.ccTab} ${viewTab === tab.id ? styles.active : ""}`}
              onClick={() => setViewTab(tab.id)}
              aria-selected={viewTab === tab.id}
            >
              <i className={`ti ${tab.icon}`} />
              <span>{tab.label}</span>
              {tab.id === "history" && history.length > 0 && (
                <span className={styles.ccTabBadge}>{history.length}</span>
              )}
              {tab.id === "batch" && batchCount > 0 && (
                <span className={styles.ccTabBadge}>{batchCount}</span>
              )}
              {tab.id === "analyze" && analysisPreview && analysisPreview.suggestions.length > 0 && (
                <span className={styles.ccTabDot} />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.ccTabContent}>
        {viewTab === "single" && (
          <CasePreview
            input={input}
            onInputChange={setInput}
            selectedCases={selectedCases}
            autoDetect={autoDetect}
            preserveNumbers={preserveNumbers}
            preserveAcronyms={preserveAcronyms}
            onConvert={handleConvert}
          />
        )}

        {viewTab === "batch" && (
          <CaseBatch
            preserveNumbers={preserveNumbers}
            preserveAcronyms={preserveAcronyms}
            onItemsChange={setBatchCount}
          />
        )}

        {viewTab === "analyze" && <CaseAnalyzer input={input} onInputChange={setInput} />}

        {viewTab === "history" && (
          <CaseHistory
            history={history}
            onClear={clearHistory}
            onRestore={(entry) => {
              setInput(entry.input);
              setViewTab("single");
            }}
          />
        )}
      </div>

      <div className={styles.ccFooter}>
        <div className={styles.ccFooterLeft}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
        {input && (viewTab === "single" || viewTab === "analyze") && (
          <div className={styles.ccFooterRight}>
            <span>{input.length.toLocaleString()} chars</span>
            <span>·</span>
            <span>{wordCount} words</span>
          </div>
        )}
      </div>
    </div>
  );
}