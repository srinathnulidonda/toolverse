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
                        className={`ti ti-${category === "temporal"
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
    </>
  );
}
