// features/dev/case-converter/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import { type CaseType, CASE_FORMATS, type HistoryEntry } from "./ts/utils";
import CasePreview from "./CasePreview";
import CaseBatch from "./CaseBatch";
import CaseHistory from "./CaseHistory";
import CaseAnalyzer from "./CaseAnalyzer";
import { useHistoryStore } from "@/lib/useHistoryStore";
import styles from "./style/Workspace.module.css";

type ViewTab = "single" | "batch" | "analyze" | "history";

export default function CaseConverterWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [input, setInput] = useState("");
  const [selectedCases, setSelectedCases] = useState<CaseType[]>([
    "camel",
    "pascal",
    "snake",
    "kebab",
  ]);
  const [autoDetect, setAutoDetect] = useState(true);
  const [preserveNumbers, setPreserveNumbers] = useState(true);
  const [preserveAcronyms, setPreserveAcronyms] = useState(false);
  const [customDelimiter, setCustomDelimiter] = useState("");

  const { history, addToHistory, clearHistory } = useHistoryStore<HistoryEntry>({
    key: "case-converter-history",
    maxItems: 100, // unified limit
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
    isDuplicate: (newItem: HistoryEntry, recentItems: HistoryEntry[]) => {
      return recentItems.some((h) => h.input === newItem.input && h.output === newItem.output);
    },
    recentItemsCount: 5,
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const handleConvert = useCallback(
    (text: string, caseType: CaseType, result: string) => {
      addToHistory({
        id: Date.now().toString(),
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

  const VIEW_TABS = [
    { id: "single" as const, label: "Single", icon: "ti-letter-case" },
    { id: "batch" as const, label: "Batch", icon: "ti-files" },
    { id: "analyze" as const, label: "Analyze", icon: "ti-chart-dots" },
    { id: "history" as const, label: "History", icon: "ti-history" },
  ];

  return (
    <>
      <div className={styles.ccRoot}>
        {/* Top Chrome */}
        <div className={styles.ccChrome}>
          <div className={styles.ccChromeLeft}>
            <div className={styles.ccTitle}>
              <i className="ti ti-letter-case" />
              Case Converter
            </div>
            {input && viewTab === "single" && (
              <span className={styles.ccInputBadge}>{input.length} chars</span>
            )}
          </div>
          <div className={styles.ccChromeRight}>
            <button type="button" className={styles.ccBtn} onClick={handleClear} disabled={!input}>
              <i className="ti ti-trash" />
              <span className={styles.ccLabel}>Clear</span>
            </button>
          </div>
        </div>

        {/*  View Tabs  */}
        <div className={styles.ccTabsBar}>
          <nav className={styles.ccTabs} role="tablist">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`${styles.ccTab}${viewTab === tab.id ? ` ${styles.active}` : ``}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                {tab.label}
                {typeof window !== 'undefined' && tab.id === "history" && history.length > 0 && (
                  <span className={styles.ccBadge}>{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Options Bar (Single view only)  */}
        {viewTab === "single" && (
          <div className={styles.ccOptionsBar}>
            <div className={styles.ccOptionsGroup}>
              <span className={styles.ccOptionsLabel}>Quick Formats:</span>
              {CASE_FORMATS.slice(0, 6).map((format) => (
                <label key={format.id} className={styles.ccCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedCases.includes(format.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCases([...selectedCases, format.id]);
                      } else {
                        setSelectedCases(selectedCases.filter((c) => c !== format.id));
                      }
                    }}
                  />
                  <span className={styles.ccCheckboxLabel}>{format.label}</span>
                </label>
              ))}
            </div>

            <div className={styles.ccOptionsDivider} />

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
        )}

        {/*  Tab Content  */}
        <div className={styles.ccTabContent}>
          {viewTab === "single" && (
            <CasePreview
              input={input}
              onInputChange={setInput}
              selectedCases={selectedCases}
              preserveNumbers={preserveNumbers}
              preserveAcronyms={preserveAcronyms}
              onConvert={handleConvert}
            />
          )}

          {viewTab === "batch" && (
            <CaseBatch
              preserveNumbers={preserveNumbers}
              preserveAcronyms={preserveAcronyms}
              onComplete={(count) => {
                // Could show a toast notification
              }}
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

        {/*  Footer  */}
        <div className={styles.ccFooter}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}