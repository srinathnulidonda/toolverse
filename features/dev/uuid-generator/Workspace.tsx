/* features/dev/uuid-generator/Workspace.tsx */
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import { useHistoryStore } from "@/lib/useHistoryStore";
import UuidGenerator from "./UuidGenerator";
import UuidBatch from "./UuidBatch";
import UuidAnalyzer from "./UuidAnalyzer";
import type { UuidVersion, UuidFormat, UuidCase } from "./ts/utils";
import { VERSION_INFO, formatTimestamp } from "./ts/utils";
import styles from "./style/Workspace.module.css";
import historyStyles from "./style/UuidHistoryEntry.module.css";

interface UuidHistoryEntry {
  id: string;
  uuids: string[];
  version: UuidVersion;
  format: UuidFormat;
  case: UuidCase;
  count: number;
  timestamp: number;
}

type ViewTab = "single" | "batch" | "analyze" | "history";

const VIEW_TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "single", label: "Single", icon: "ti-fingerprint" },
  { id: "batch", label: "Batch", icon: "ti-stack" },
  { id: "analyze", label: "Analyze", icon: "ti-scan" },
  { id: "history", label: "History", icon: "ti-history" },
];

const VERSIONS: UuidVersion[] = ["v4", "v7", "v1", "v6", "v3", "v5", "nil"];

export default function UuidGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [format, setFormat] = useState<UuidFormat>("standard");
  const [uuidCase, setUuidCase] = useState<UuidCase>("lowercase");

  const showGenerationControls = viewTab === "single" || viewTab === "batch";

  const { history, addToHistory, clearHistory, removeFromHistory } = useHistoryStore<UuidHistoryEntry>({
    key: "uuid-generator-history",
    maxItems: 50,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).version === "string" &&
        typeof (raw as any).format === "string" &&
        typeof (raw as any).case === "string" &&
        typeof (raw as any).count === "number" &&
        typeof (raw as any).timestamp === "number" &&
        Array.isArray((raw as any).uuids) &&
        (raw as any).uuids.every((u: string) => typeof u === "string")
      ) {
        return raw as UuidHistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: UuidHistoryEntry, recentItems: UuidHistoryEntry[]) => {
      return recentItems.some(
        (h) =>
          h.uuids.length === newItem.uuids.length &&
          h.uuids.every((uuid, index) => uuid === newItem.uuids[index]) &&
          h.version === newItem.version &&
          h.format === newItem.format &&
          h.case === newItem.case
      );
    },
    recentItemsCount: 5,
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const handleSingleGenerated = useCallback(
    (uuid: string) => {
      addToHistory({
        id: crypto.randomUUID(),
        uuids: [uuid],
        version,
        format,
        case: uuidCase,
        count: 1,
        timestamp: Date.now(),
      });
    },
    [version, format, uuidCase, addToHistory]
  );

  const handleBatchComplete = useCallback(
    (uuids: string[]) => {
      addToHistory({
        id: crypto.randomUUID(),
        uuids,
        version,
        format,
        case: uuidCase,
        count: uuids.length,
        timestamp: Date.now(),
      });
    },
    [version, format, uuidCase, addToHistory]
  );

  const handleRestoreFromHistory = useCallback((entry: UuidHistoryEntry) => {
    setVersion(entry.version);
    setFormat(entry.format);
    setUuidCase(entry.case);
    setViewTab("single");
  }, []);

  const handleCopyHistoryEntry = useCallback(async (entry: UuidHistoryEntry) => {
    try {
      await navigator.clipboard.writeText(entry.uuids.join("\n"));
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  return (
    <div className={styles.ugWorkspaceRoot}>
      <div className={styles.ugChrome}>
        <div className={styles.ugChromeLeft}>
          {showGenerationControls && (
            <>
              <div className={styles.ugPillGroup} role="group" aria-label="UUID version">
                {VERSIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.ugPill}${version === v ? ` ${styles.active}` : ""}`}
                    onClick={() => setVersion(v)}
                    aria-pressed={version === v}
                  >
                    {v === "nil" ? "Nil" : v.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className={styles.ugFormatGroup}>
                <label className={styles.ugFormatLabel} htmlFor="uuid-format">
                  Format:
                </label>
                <select
                  id="uuid-format"
                  className={styles.ugSelect}
                  value={format}
                  onChange={(e) => setFormat(e.target.value as UuidFormat)}
                >
                  <option value="standard">Standard</option>
                  <option value="no-hyphens">No Hyphens</option>
                  <option value="braces">Braces</option>
                  <option value="urn">URN</option>
                  <option value="base64">Base64</option>
                  <option value="hex">Hex</option>
                </select>
              </div>

              <div className={styles.ugCaseGroup}>
                <button
                  type="button"
                  className={`${styles.ugCaseBtn}${uuidCase === "lowercase" ? ` ${styles.active}` : ""}`}
                  onClick={() => setUuidCase("lowercase")}
                  title="Lowercase"
                >
                  <i className="ti ti-letter-case-lower" />
                  <span className={styles.ugCaseLabel}>aa</span>
                </button>
                <button
                  type="button"
                  className={`${styles.ugCaseBtn}${uuidCase === "uppercase" ? ` ${styles.active}` : ""}`}
                  onClick={() => setUuidCase("uppercase")}
                  title="Uppercase"
                >
                  <i className="ti ti-letter-case-upper" />
                  <span className={styles.ugCaseLabel}>AA</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles.ugChromeRight}>
          <div className={styles.ugInfoBadge}>
            <i className="ti ti-shield-lock" />
            <span>Client-side only</span>
          </div>
        </div>
      </div>

      <div className={styles.ugTabsBar}>
        <nav className={styles.ugTabs} role="tablist" aria-label="UUID tool views">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`${styles.ugTab}${viewTab === tab.id ? ` ${styles.active}` : ""}`}
              onClick={() => setViewTab(tab.id)}
              aria-selected={viewTab === tab.id}
              aria-controls={`ug-panel-${tab.id}`}
            >
              <i className={`ti ${tab.icon}`} />
              <span>{tab.label}</span>
              {tab.id === "history" && history.length > 0 && (
                <span className={styles.ugTabBadge}>{history.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.ugTabContent}>
        {viewTab === "single" && (
          <div role="tabpanel" id="ug-panel-single">
            <UuidGenerator
              version={version}
              format={format}
              uuidCase={uuidCase}
              onGenerated={handleSingleGenerated}
            />
          </div>
        )}

        {viewTab === "batch" && (
          <div role="tabpanel" id="ug-panel-batch">
            <UuidBatch
              version={version}
              format={format}
              uuidCase={uuidCase}
              onComplete={handleBatchComplete}
            />
          </div>
        )}

        {viewTab === "analyze" && (
          <div role="tabpanel" id="ug-panel-analyze">
            <UuidAnalyzer />
          </div>
        )}

        {viewTab === "history" && (
          <div role="tabpanel" id="ug-panel-history" className={historyStyles.uhRoot}>
            <div className={historyStyles.uhHeader}>
              <div className={historyStyles.uhTitle}>
                <i className="ti ti-history" />
                History
                {history.length > 0 && <span className={historyStyles.uhCount}>{history.length}</span>}
              </div>
              {history.length > 0 && (
                <button type="button" className={historyStyles.uhClearBtn} onClick={clearHistory}>
                  <i className="ti ti-trash" />
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className={historyStyles.uhEmpty}>
                <div className={historyStyles.uhEmptyIcon}>
                  <i className="ti ti-history" />
                </div>
                <h3 className={historyStyles.uhEmptyTitle}>No History Yet</h3>
                <p className={historyStyles.uhEmptyDesc}>
                  Generated UUIDs will appear here after you click the generate button.
                </p>
              </div>
            ) : (
              <div className={historyStyles.uhList}>
                {history.map((entry) => (
                  <div key={entry.id} className={historyStyles.uhItem}>
                    <div className={historyStyles.uhItemTop}>
                      <div className={historyStyles.uhItemMeta}>
                        <span className={historyStyles.uhVersionBadge}>
                          {VERSION_INFO[entry.version].label}
                        </span>
                        <span className={historyStyles.uhFormatTag}>{entry.format}</span>
                        <span className={historyStyles.uhCountTag}>
                          <i className="ti ti-hash" />
                          {entry.count}
                        </span>
                      </div>
                      <span className={historyStyles.uhTimestamp}>
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>

                    <div className={historyStyles.uhUuids}>
                      {entry.uuids.slice(0, 3).map((uuid, i) => (
                        <code key={i} className={historyStyles.uhUuid}>
                          {uuid}
                        </code>
                      ))}
                    </div>
                    {entry.count > 3 && (
                      <span className={historyStyles.uhMore}>+{entry.count - 3} more</span>
                    )}

                    <div className={historyStyles.uhItemActions}>
                      <button
                        type="button"
                        className={historyStyles.uhUseBtn}
                        onClick={() => handleRestoreFromHistory(entry)}
                      >
                        <i className="ti ti-restore" />
                        Use
                      </button>
                      <button
                        type="button"
                        className={historyStyles.uhCopyBtn}
                        onClick={() => handleCopyHistoryEntry(entry)}
                      >
                        <i className="ti ti-copy" />
                        Copy All
                      </button>
                      <button
                        type="button"
                        className={historyStyles.uhDeleteBtn}
                        onClick={() => removeFromHistory(entry.id)}
                        aria-label="Delete entry"
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.ugFooter}>
        <div className={styles.ugFooterInfo}>
          <i className="ti ti-info-circle" />
          <span>
            UUIDs are generated using cryptographically secure random numbers. All processing
            happens locally in your browser.
          </span>
        </div>
      </div>
    </div>
  );
}