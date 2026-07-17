// features/dev/jwt-decoder/ClaimsExplorer.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { JwtHeader, JwtPayload } from "./jwtParser";
import { getClaimMetadata, formatTimestamp, getRelativeTime } from "./jwtParser";

interface ClaimsExplorerProps {
  header: JwtHeader;
  payload: JwtPayload;
  onCopy?: (text: string, key: string) => void;
  copiedKey?: string;
}

type ViewMode = "categorized" | "alphabetical" | "tree";
type FilterMode = "all" | "registered" | "custom";

export default function ClaimsExplorer({
  header,
  payload,
  onCopy,
  copiedKey,
}: ClaimsExplorerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("categorized");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [expandedClaims, setExpandedClaims] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleClaim = useCallback((key: string) => {
    setExpandedClaims((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const categorizedClaims = useMemo(() => {
    const categories = {
      temporal: [] as Array<[string, unknown]>,
      identity: [] as Array<[string, unknown]>,
      authorization: [] as Array<[string, unknown]>,
      metadata: [] as Array<[string, unknown]>,
      custom: [] as Array<[string, unknown]>,
    };

    Object.entries(payload).forEach(([key, value]) => {
      const metadata = getClaimMetadata(key);
      const category = metadata.category || "custom";
      categories[category].push([key, value]);
    });

    return categories;
  }, [payload]);

  const filteredClaims = useMemo(() => {
    let entries = Object.entries(payload);

    // Apply filter
    if (filterMode === "registered") {
      entries = entries.filter(([key]) => {
        const meta = getClaimMetadata(key);
        return meta.type === "registered" || meta.type === "public";
      });
    } else if (filterMode === "custom") {
      entries = entries.filter(([key]) => {
        const meta = getClaimMetadata(key);
        return meta.type === "private";
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter(([key, value]) => {
        const meta = getClaimMetadata(key);
        return (
          key.toLowerCase().includes(query) ||
          meta.name.toLowerCase().includes(query) ||
          meta.description.toLowerCase().includes(query) ||
          JSON.stringify(value).toLowerCase().includes(query)
        );
      });
    }

    return entries;
  }, [payload, filterMode, searchQuery]);

  const renderValue = (value: unknown, isExpanded: boolean = false): React.ReactNode => {
    if (value === null) return <span className="ce-value-null">null</span>;
    if (value === undefined) return <span className="ce-value-undefined">undefined</span>;
    if (typeof value === "boolean")
      return <span className="ce-value-bool">{value.toString()}</span>;
    if (typeof value === "number") return <span className="ce-value-num">{value}</span>;
    if (typeof value === "string") {
      if (value.length > 100 && !isExpanded) {
        return <span className="ce-value-str">"{value.slice(0, 100)}…"</span>;
      }
      return <span className="ce-value-str">"{value}"</span>;
    }
    if (Array.isArray(value)) {
      if (isExpanded) {
        return (
          <div className="ce-value-array">
            <span className="ce-bracket">[</span>
            <div className="ce-array-items">
              {value.map((item, idx) => (
                <div key={idx} className="ce-array-item">
                  <span className="ce-array-index">{idx}:</span>
                  {renderValue(item, true)}
                </div>
              ))}
            </div>
            <span className="ce-bracket">]</span>
          </div>
        );
      }
      return <span className="ce-value-arr">[{value.length} items]</span>;
    }
    if (typeof value === "object") {
      if (isExpanded) {
        return (
          <div className="ce-value-object">
            <span className="ce-bracket">{"{"}</span>
            <div className="ce-object-props">
              {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="ce-object-prop">
                  <span className="ce-object-key">"{k}":</span>
                  {renderValue(v, true)}
                </div>
              ))}
            </div>
            <span className="ce-bracket">{"}"}</span>
          </div>
        );
      }
      return <span className="ce-value-obj">{"{…}"}</span>;
    }
    return <span>{String(value)}</span>;
  };

  const renderClaim = (key: string, value: unknown) => {
    const meta = getClaimMetadata(key);
    const isExpanded = expandedClaims.has(key);
    const isComplex = typeof value === "object" && value !== null;
    const isTimestamp = meta.valueType === "timestamp" && typeof value === "number";

    return (
      <div key={key} className="ce-claim">
        <div className="ce-claim-header">
          <div className="ce-claim-main">
            {isComplex && (
              <button
                className="ce-expand-btn"
                onClick={() => toggleClaim(key)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                <i className={`ti ti-chevron-${isExpanded ? "down" : "right"}`} />
              </button>
            )}
            <div className="ce-claim-info">
              <div className="ce-claim-key-row">
                <code className="ce-claim-key">{key}</code>
                <span className={`ce-claim-type ce-claim-type--${meta.type}`}>{meta.type}</span>
              </div>
              <div className="ce-claim-meta-row">
                <span className="ce-claim-name">{meta.name}</span>
                <span className="ce-claim-separator">·</span>
                <span className="ce-claim-desc">{meta.description}</span>
              </div>
            </div>
          </div>
          <button
            className={`ce-copy-btn${copiedKey === `claim-${key}` ? " copied" : ""}`}
            onClick={() => onCopy?.(JSON.stringify({ [key]: value }, null, 2), `claim-${key}`)}
            title="Copy claim"
          >
            <i className={`ti ${copiedKey === `claim-${key}` ? "ti-check" : "ti-copy"}`} />
          </button>
        </div>

        <div className="ce-claim-value">
          {renderValue(value, isExpanded)}
          {isTimestamp && (
            <div className="ce-timestamp-info">
              <div className="ce-timestamp-row">
                <i className="ti ti-calendar" />
                <span>{formatTimestamp(value)}</span>
              </div>
              <div className="ce-timestamp-row ce-timestamp-relative">
                <i className="ti ti-clock" />
                <span>{getRelativeTime(value)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="ce-root">
        {/* Controls */}
        <div className="ce-controls">
          <div className="ce-search">
            <i className="ti ti-search" />
            <input
              type="text"
              className="ce-search-input"
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="ce-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className="ce-filters">
            <div className="ce-filter-group">
              <button
                className={`ce-filter-btn${viewMode === "categorized" ? " active" : ""}`}
                onClick={() => setViewMode("categorized")}
                title="Group by category"
              >
                <i className="ti ti-category" />
              </button>
              <button
                className={`ce-filter-btn${viewMode === "alphabetical" ? " active" : ""}`}
                onClick={() => setViewMode("alphabetical")}
                title="Sort alphabetically"
              >
                <i className="ti ti-sort-ascending-letters" />
              </button>
              <button
                className={`ce-filter-btn${viewMode === "tree" ? " active" : ""}`}
                onClick={() => setViewMode("tree")}
                title="Tree view"
              >
                <i className="ti ti-hierarchy-2" />
              </button>
            </div>

            <div className="ce-divider" />

            <div className="ce-filter-group">
              <button
                className={`ce-filter-btn${filterMode === "all" ? " active" : ""}`}
                onClick={() => setFilterMode("all")}
              >
                All
              </button>
              <button
                className={`ce-filter-btn${filterMode === "registered" ? " active" : ""}`}
                onClick={() => setFilterMode("registered")}
              >
                Standard
              </button>
              <button
                className={`ce-filter-btn${filterMode === "custom" ? " active" : ""}`}
                onClick={() => setFilterMode("custom")}
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="ce-section">
          <div className="ce-section-header">
            <div className="ce-section-title">
              <i className="ti ti-file-description" />
              <span>Header ({Object.keys(header).length} claims)</span>
            </div>
            <button
              className={`ce-copy-btn${copiedKey === "header-all" ? " copied" : ""}`}
              onClick={() => onCopy?.(JSON.stringify(header, null, 2), "header-all")}
            >
              <i className={`ti ${copiedKey === "header-all" ? "ti-check" : "ti-copy"}`} />
              Copy all
            </button>
          </div>
          <div className="ce-claims-list">
            {Object.entries(header).map(([key, value]) => renderClaim(key, value))}
          </div>
        </div>

        {/* Payload Section */}
        <div className="ce-section">
          <div className="ce-section-header">
            <div className="ce-section-title">
              <i className="ti ti-package" />
              <span>Payload ({filteredClaims.length} claims)</span>
            </div>
            <button
              className={`ce-copy-btn${copiedKey === "payload-all" ? " copied" : ""}`}
              onClick={() => onCopy?.(JSON.stringify(payload, null, 2), "payload-all")}
            >
              <i className={`ti ${copiedKey === "payload-all" ? "ti-check" : "ti-copy"}`} />
              Copy all
            </button>
          </div>

          {viewMode === "categorized" && (
            <div className="ce-categorized">
              {Object.entries(categorizedClaims)
                .filter(([_, claims]) => claims.length > 0)
                .map(([category, claims]) => (
                  <div key={category} className="ce-category">
                    <div className="ce-category-header">
                      <i
                        className={`ti ti-${
                          category === "temporal"
                            ? "clock"
                            : category === "identity"
                              ? "user"
                              : category === "authorization"
                                ? "shield"
                                : category === "metadata"
                                  ? "info-circle"
                                  : "puzzle"
                        }`}
                      />
                      <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      <span className="ce-category-count">{claims.length}</span>
                    </div>
                    <div className="ce-claims-list">
                      {claims.map(([key, value]) => renderClaim(key, value))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {viewMode === "alphabetical" && (
            <div className="ce-claims-list">
              {filteredClaims
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => renderClaim(key, value))}
            </div>
          )}

          {viewMode === "tree" && (
            <div className="ce-claims-list">
              {filteredClaims.map(([key, value]) => renderClaim(key, value))}
            </div>
          )}

          {filteredClaims.length === 0 && (
            <div className="ce-empty">
              <i className="ti ti-search-off" />
              <p>No claims match your filter</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .ce-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: auto;
          padding: 16px;
          flex: 1;
        }

        .ce-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ce-search {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .ce-search i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-disabled);
          pointer-events: none;
        }

        .ce-search-input {
          width: 100%;
          height: 36px;
          padding: 0 36px 0 36px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
          transition: border-color 0.12s;
        }

        .ce-search-input:focus {
          outline: none;
          border-color: var(--brand);
        }

        .ce-search-input::placeholder {
          color: var(--text-disabled);
        }

        .ce-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          color: var(--text-disabled);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }

        .ce-search-clear:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ce-filters {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .ce-filter-group {
          display: flex;
          gap: 0;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .ce-filter-btn {
          height: 36px;
          padding: 0 12px;
          border: none;
          border-right: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.12s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ce-filter-btn:last-child {
          border-right: none;
        }

        .ce-filter-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ce-filter-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .ce-filter-btn i {
          font-size: 14px;
        }

        .ce-divider {
          width: 0.5px;
          height: 20px;
          background: var(--border);
        }

        .ce-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ce-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ce-section-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
        }

        .ce-section-title i {
          font-size: 14px;
        }

        .ce-claims-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ce-claim {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          transition: border-color 0.12s;
        }

        .ce-claim:hover {
          border-color: var(--brand-border);
        }

        .ce-claim-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .ce-claim-main {
          flex: 1;
          display: flex;
          gap: 8px;
          min-width: 0;
        }

        .ce-expand-btn {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          border: none;
          background: transparent;
          color: var(--text-disabled);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
          margin-top: 2px;
        }

        .ce-expand-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ce-expand-btn i {
          font-size: 12px;
        }

        .ce-claim-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .ce-claim-key-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ce-claim-key {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .ce-claim-type {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .ce-claim-type--registered {
          background: #3b82f6;
          color: white;
        }

        .ce-claim-type--public {
          background: #10b981;
          color: white;
        }

        .ce-claim-type--private {
          background: var(--text-disabled);
          color: var(--bg-card);
        }

        .ce-claim-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 11px;
        }

        .ce-claim-name {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .ce-claim-separator {
          color: var(--text-disabled);
        }

        .ce-claim-desc {
          color: var(--text-tertiary);
          flex: 1;
        }

        .ce-copy-btn {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }

        .ce-copy-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ce-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand);
          border-color: var(--brand-border);
        }

        .ce-copy-btn i {
          font-size: 13px;
        }

        .ce-claim-value {
          padding-left: 28px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text);
          line-height: 1.6;
          word-break: break-all;
        }

        .ce-value-null,
        .ce-value-undefined {
          color: var(--text-disabled);
          font-style: italic;
        }

        .ce-value-bool {
          color: #d97706;
        }

        .ce-value-num {
          color: #059669;
        }

        .ce-value-str {
          color: var(--brand);
        }

        .ce-value-arr,
        .ce-value-obj {
          color: var(--text-tertiary);
        }

        @media (prefers-color-scheme: dark) {
          .ce-value-bool {
            color: #fbbf24;
          }
          .ce-value-num {
            color: #34d399;
          }
        }

        .ce-value-array,
        .ce-value-object {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ce-bracket {
          color: var(--text-tertiary);
          font-weight: 600;
        }

        .ce-array-items,
        .ce-object-props {
          padding-left: 16px;
          border-left: 1.5px solid var(--border-faint);
          margin: 4px 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ce-array-item,
        .ce-object-prop {
          display: flex;
          gap: 8px;
          align-items: baseline;
        }

        .ce-array-index,
        .ce-object-key {
          color: var(--text-secondary);
          font-size: 11px;
          flex-shrink: 0;
        }

        .ce-timestamp-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
          padding: 8px 10px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
        }

        .ce-timestamp-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .ce-timestamp-row i {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .ce-timestamp-relative {
          color: var(--text-tertiary);
        }

        .ce-categorized {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ce-category {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ce-category-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
        }

        .ce-category-header i {
          font-size: 13px;
        }

        .ce-category-count {
          margin-left: auto;
          font-size: 10px;
          color: var(--text-disabled);
          background: var(--bg-card);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .ce-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 40px 20px;
          color: var(--text-disabled);
        }

        .ce-empty i {
          font-size: 32px;
        }

        .ce-empty p {
          font-size: 13px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .ce-controls {
            flex-direction: column;
          }

          .ce-search {
            min-width: 100%;
          }

          .ce-filters {
            overflow-x: auto;
          }

          .ce-claim-value {
            padding-left: 0;
          }
        }
      `}</style>
    </>
  );
}
