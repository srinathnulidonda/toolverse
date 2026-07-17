// features/dev/uuid-generator/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import { useHistoryStore } from "@/lib/useHistoryStore";
import HistoryList from "@/components/shared/HistoryList";
import UuidGenerator from "./UuidGenerator";
import UuidBatch from "./UuidBatch";
import UuidAnalyzer from "./UuidAnalyzer";
import type { UuidVersion, UuidFormat, UuidCase } from "./utils";
import { VERSION_INFO, formatTimestamp } from "./utils";

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
                {tab.id === "history" && history.length > 0 && (
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

      <style jsx>{`
        .ug-workspace-root {
          --ug-radius-sm: 6px;
          --ug-radius-md: 8px;
          --ug-radius-lg: 12px;
          --ug-radius-xl: 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--ug-radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 600px;
        }

        /*  Chrome  */
        .ug-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .ug-chrome-left,
        .ug-chrome-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /*  Pill Group (Version Selector)  */
        .ug-pill-group {
          display: flex;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--ug-radius-md);
          overflow: hidden;
        }

        .ug-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 30px;
          padding: 0 11px;
          border: none;
          border-right: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          font-family: var(--font-mono);
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .ug-pill:last-child {
          border-right: none;
        }

        .ug-pill:hover {
          background: var(--border);
          color: var(--text);
        }

        .ug-pill.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        /*  Format Group  */
        .ug-format-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ug-format-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .ug-select {
          height: 30px;
          padding: 0 10px;
          border-radius: var(--ug-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: border-color 0.12s;
        }

        .ug-select:focus {
          border-color: var(--brand-border);
        }

        /*  Case Group  */
        .ug-case-group {
          display: flex;
          gap: 2px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--ug-radius-md);
          overflow: hidden;
          padding: 2px;
        }

        .ug-case-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 9px;
          border: none;
          border-radius: calc(var(--ug-radius-md) - 2px);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ug-case-btn i {
          font-size: 12px;
        }

        .ug-case-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.02em;
        }

        .ug-case-btn:hover {
          color: var(--text);
        }

        .ug-case-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        /*  Info Badge  */
        .ug-info-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 26px;
          padding: 0 10px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
          font-size: 10.5px;
          font-weight: 600;
        }

        .ug-info-badge i {
          font-size: 11px;
        }

        /*  Tabs Bar  */
        .ug-tabs-bar {
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .ug-tabs {
          display: flex;
          padding: 0 14px;
          gap: 4px;
        }

        .ug-tab {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 40px;
          padding: 0 14px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
          white-space: nowrap;
        }

        .ug-tab i {
          font-size: 14px;
        }

        .ug-tab:hover {
          color: var(--text);
        }

        .ug-tab.active {
          color: var(--text);
        }

        .ug-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 12px;
          right: 12px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .ug-tab-badge {
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
        }

        /*  Tab Content  */
        .ug-tab-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .ug-tab-content > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Footer  */
        .ug-footer {
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          padding: 10px 14px;
        }

        .ug-footer-info {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          font-size: 11px;
          color: var(--text-tertiary);
          line-height: 1.5;
        }

        .ug-footer-info i {
          font-size: 13px;
          margin-top: 1px;
          flex-shrink: 0;
        }

        /*  Responsive  */
        @media (max-width: 900px) {
          .ug-chrome {
            padding: 8px 12px;
          }

          .ug-chrome-left {
            width: 100%;
          }

          .ug-pill-group {
            width: 100%;
            justify-content: space-between;
          }

          .ug-pill {
            flex: 1;
            justify-content: center;
            padding: 0 8px;
            font-size: 10px;
          }

          .ug-format-group {
            flex: 1;
          }

          .ug-select {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .ug-workspace-root {
            min-height: auto;
            border-radius: var(--ug-radius-lg);
          }

          .ug-tab span:not(.ug-tab-badge) {
            display: none;
          }

          .ug-tab {
            padding: 0 12px;
          }

          .ug-info-badge span {
            display: none;
          }

          .ug-format-label {
            display: none;
          }

          .ug-case-label {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .ug-pill {
            font-size: 9px;
            padding: 0 6px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ug-pill,
          .ug-select,
          .ug-case-btn,
          .ug-tab {
            transition: none;
          }
        }

        /*  Focus visible states  */
        .ug-pill:focus-visible,
        .ug-select:focus-visible,
        .ug-case-btn:focus-visible,
        .ug-tab:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
          border-radius: var(--ug-radius-sm);
        }
      `}</style>
    </>
  );
}
