// features/dev/uuid-generator/Workspace.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { useHistoryStore } from "@/lib/useHistoryStore";
import HistoryList from "@/components/shared/HistoryList";
import UuidGenerator from "./UuidGenerator";
import UuidBatch from "./UuidBatch";
import UuidAnalyzer from "./UuidAnalyzer";
import type { UuidVersion, UuidFormat, UuidCase } from "./utils";
import { VERSION_INFO, formatTimestamp } from "./utils";
import "./style/UuidAnalyzer.css";
import "./style/UuidBatch.css";
import "./style/UuidGenerator.css";
import "./style/Workspace.css";

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

const VIEW_TABS = [
  { id: "single" as const, label: "Single", icon: "ti-fingerprint" },
  { id: "batch" as const, label: "Batch", icon: "ti-stack" },
  { id: "analyze" as const, label: "Analyze", icon: "ti-scan" },
  { id: "history" as const, label: "History", icon: "ti-history" },
];

export default function UuidGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [format, setFormat] = useState<UuidFormat>("standard");
  const [uuidCase, setUuidCase] = useState<UuidCase>("lowercase");

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

  return (
    <>
      <div className="ug-workspace-root">
        {/*  Top Chrome  */}
        <div className="ug-chrome">
          <div className="ug-chrome-left">
            {/*  Version Selector  */}
            <div className="ug-pill-group" role="group" aria-label="UUID version">
              {(["v4", "v7", "v1", "v6", "v3", "v5", "nil"] as UuidVersion[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`ug-pill${version === v ? " active" : ""}`}
                  onClick={() => setVersion(v)}
                  aria-pressed={version === v}
                >
                  {v === "nil" ? "Nil" : v.toUpperCase()}
                </button>
              ))}
            </div>

            {/*  Format Selector  */}
            {viewTab !== "analyze" && (
              <div className="ug-format-group">
                <label className="ug-format-label" htmlFor="uuid-format">
                  Format:
                </label>
                <select
                  id="uuid-format"
                  className="ug-select"
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
            )}

            {/*  Case Toggle  */}
            {viewTab !== "analyze" && (
              <div className="ug-case-group">
                <button
                  type="button"
                  className={`ug-case-btn${uuidCase === "lowercase" ? " active" : ""}`}
                  onClick={() => setUuidCase("lowercase")}
                  title="Lowercase"
                >
                  <i className="ti ti-letter-case-lower" />
                  <span className="ug-case-label">aa</span>
                </button>
                <button
                  type="button"
                  className={`ug-case-btn${uuidCase === "uppercase" ? " active" : ""}`}
                  onClick={() => setUuidCase("uppercase")}
                  title="Uppercase"
                >
                  <i className="ti ti-letter-case-upper" />
                  <span className="ug-case-label">AA</span>
                </button>
              </div>
            )}
          </div>

          <div className="ug-chrome-right">
            <div className="ug-info-badge">
              <i className="ti ti-shield-lock" />
              <span>Client-side only</span>
            </div>
          </div>
        </div>

        {/*  View Tabs  */}
        <div className="ug-tabs-bar">
          <nav className="ug-tabs" role="tablist" aria-label="UUID tool views">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`ug-tab${viewTab === tab.id ? " active" : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
                aria-controls={`ug-panel-${tab.id}`}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {typeof window !== 'undefined' && tab.id === "history" && history.length > 0 && (
                  <span className="ug-tab-badge">{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Tab Content  */}
        <div className="ug-tab-content">
          {viewTab === "single" && (
            <div role="tabpanel" id="ug-panel-single" aria-labelledby="tab-single">
              <UuidGenerator
                version={version}
                format={format}
                uuidCase={uuidCase}
                onGenerated={handleSingleGenerated}
              />
            </div>
          )}

          {viewTab === "batch" && (
            <div role="tabpanel" id="ug-panel-batch" aria-labelledby="tab-batch">
              <UuidBatch
                version={version}
                format={format}
                uuidCase={uuidCase}
                onComplete={handleBatchComplete}
              />
            </div>
          )}

          {viewTab === "analyze" && (
            <div role="tabpanel" id="ug-panel-analyze" aria-labelledby="tab-analyze">
              <UuidAnalyzer />
            </div>
          )}

          {viewTab === "history" && (
            <div role="tabpanel" id="ug-panel-history" aria-labelledby="tab-history">
              <HistoryList
                history={history}
                onClear={clearHistory}
                onUse={(entry) => {
                  handleRestoreFromHistory(entry);
                }}
                onDelete={removeFromHistory}
                renderItemContent={(entry) => (
                  <div className="uh-entry">
                    <div className="uh-entry-header">
                      <div className="uh-entry-meta">
                        <span className="uh-version-badge">
                          {VERSION_INFO[entry.version].label}
                        </span>
                        <span className="uh-format-tag">{entry.format}</span>
                        <span className="uh-count-tag">
                          <i className="ti ti-hash" />
                          {entry.count}
                        </span>
                      </div>
                      <div className="uh-entry-actions">
                        <span className="uh-timestamp">{formatTimestamp(entry.timestamp)}</span>
                        <button
                          type="button"
                          className="uh-copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(entry.uuids.join("\n"));
                          }}
                        >
                          <i className="ti ti-copy" />
                          Copy All
                        </button>
                      </div>
                    </div>

                    <div className="uh-entry-content">
                      <div className="uh-uuids">
                        {entry.uuids.slice(0, 3).map((uuid: string, i: number) => (
                          <code key={i} className="uh-uuid">
                            {uuid}
                          </code>
                        ))}
                        {entry.count > 3 && (
                          <span className="uh-more">+{entry.count - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </div>

        {/*  Footer  */}
        <div className="ug-footer">
          <div className="ug-footer-info">
            <i className="ti ti-info-circle" />
            <span>
              UUIDs are generated using cryptographically secure random numbers. All processing
              happens locally in your browser.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
