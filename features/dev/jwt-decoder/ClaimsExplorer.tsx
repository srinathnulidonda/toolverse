// features/dev/jwt-decoder/ClaimsExplorer.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { JwtHeader, JwtPayload } from "./ts/jwtParser";
import { getClaimMetadata, formatTimestamp, getRelativeTime } from "./ts/jwtParser";
import styles from "./style/ClaimsExplorer.module.css";

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
    if (value === null) return <span className={styles.ceValueNull}>null</span>;
    if (value === undefined) return <span className={styles.ceValueUndefined}>undefined</span>;
    if (typeof value === "boolean")
      return <span className={styles.ceValueBool}>{value.toString()}</span>;
    if (typeof value === "number") return <span className={styles.ceValueNum}>{value}</span>;
    if (typeof value === "string") {
      if (value.length > 100 && !isExpanded) {
        return <span className={styles.ceValueStr}>"{value.slice(0, 100)}…"</span>;
      }
      return <span className={styles.ceValueStr}>"{value}"</span>;
    }
    if (Array.isArray(value)) {
      if (isExpanded) {
        return (
          <div className={styles.ceValueArray}>
            <span className={styles.ceBracket}>[</span>
            <div className={styles.ceArrayItems}>
              {value.map((item, idx) => (
                <div key={idx} className={styles.ceArrayItem}>
                  <span className={styles.ceArrayIndex}>{idx}:</span>
                  {renderValue(item, true)}
                </div>
              ))}
            </div>
            <span className={styles.ceBracket}>]</span>
          </div>
        );
      }
      return <span className={styles.ceValueArr}>[{value.length} items]</span>;
    }
    if (typeof value === "object") {
      if (isExpanded) {
        return (
          <div className={styles.ceValueObject}>
            <span className={styles.ceBracket}>{"{"}</span>
            <div className={styles.ceObjectProps}>
              {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className={styles.ceObjectProp}>
                  <span className={styles.ceObjectKey}>"{k}":</span>
                  {renderValue(v, true)}
                </div>
              ))}
            </div>
            <span className={styles.ceBracket}>{"}"}</span>
          </div>
        );
      }
      return <span className={styles.ceValueObj}>{"{…}"}</span>;
    }
    return <span>{String(value)}</span>;
  };

  const renderClaim = (key: string, value: unknown) => {
    const meta = getClaimMetadata(key);
    const isExpanded = expandedClaims.has(key);
    const isComplex = typeof value === "object" && value !== null;
    const isTimestamp = meta.valueType === "timestamp" && typeof value === "number";

    return (
      <div key={key} className={styles.ceClaim}>
        <div className={styles.ceClaimHeader}>
          <div className={styles.ceClaimMain}>
            {isComplex && (
              <button
                className={styles.ceExpandBtn}
                onClick={() => toggleClaim(key)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                <i className={`ti ti-chevron-${isExpanded ? "down" : "right"}`} />
              </button>
            )}
            <div className={styles.ceClaimInfo}>
              <div className={styles.ceClaimKeyRow}>
                <code className={styles.ceClaimKey}>{key}</code>
                <span className={`${styles.ceClaimType} ${styles[`ceClaimType--${meta.type}`]}`}>{meta.type}</span>
              </div>
              <div className={styles.ceClaimMetaRow}>
                <span className={styles.ceClaimName}>{meta.name}</span>
                <span className={styles.ceClaimSeparator}>·</span>
                <span className={styles.ceClaimDesc}>{meta.description}</span>
              </div>
            </div>
          </div>
          <button
            className={`${styles.ceCopyBtn}${copiedKey === `claim-${key}` ? ` ${styles.copied}` : ""}`}
            onClick={() => onCopy?.(JSON.stringify({ [key]: value }, null, 2), `claim-${key}`)}
            title="Copy claim"
          >
            <i className={`ti ${copiedKey === `claim-${key}` ? "ti-check" : "ti-copy"}`} />
          </button>
        </div>

        <div className={styles.ceClaimValue}>
          {renderValue(value, isExpanded)}
          {isTimestamp && (
            <div className={styles.ceTimestampInfo}>
              <div className={styles.ceTimestampRow}>
                <i className="ti ti-calendar" />
                <span>{formatTimestamp(value)}</span>
              </div>
              <div className={`${styles.ceTimestampRow} ${styles.ceTimestampRelative}`}>
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
      <div className={styles.ceRoot}>
        {/* Controls */}
        <div className={styles.ceControls}>
          <div className={styles.ceSearch}>
            <i className="ti ti-search" />
            <input
              type="text"
              className={styles.ceSearchInput}
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.ceSearchClear}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className={styles.ceFilters}>
            <div className={styles.ceFilterGroup}>
              <button
                className={`${styles.ceFilterBtn}${viewMode === "categorized" ? ` ${styles.active}` : ""}`}
                onClick={() => setViewMode("categorized")}
                title="Group by category"
              >
                <i className="ti ti-category" />
              </button>
              <button
                className={`${styles.ceFilterBtn}${viewMode === "alphabetical" ? ` ${styles.active}` : ""}`}
                onClick={() => setViewMode("alphabetical")}
                title="Sort alphabetically"
              >
                <i className="ti ti-sort-ascending-letters" />
              </button>
              <button
                className={`${styles.ceFilterBtn}${viewMode === "tree" ? ` ${styles.active}` : ""}`}
                onClick={() => setViewMode("tree")}
                title="Tree view"
              >
                <i className="ti ti-hierarchy-2" />
              </button>
            </div>

            <div className={styles.ceDivider} />

            <div className={styles.ceFilterGroup}>
              <button
                className={`${styles.ceFilterBtn}${filterMode === "all" ? ` ${styles.active}` : ""}`}
                onClick={() => setFilterMode("all")}
              >
                All
              </button>
              <button
                className={`${styles.ceFilterBtn}${filterMode === "registered" ? ` ${styles.active}` : ""}`}
                onClick={() => setFilterMode("registered")}
              >
                Standard
              </button>
              <button
                className={`${styles.ceFilterBtn}${filterMode === "custom" ? ` ${styles.active}` : ""}`}
                onClick={() => setFilterMode("custom")}
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className={styles.ceSection}>
          <div className={styles.ceSectionHeader}>
            <div className={styles.ceSectionTitle}>
              <i className="ti ti-file-description" />
              <span>Header ({Object.keys(header).length} claims)</span>
            </div>
            <button
              className={`${styles.ceCopyBtn}${copiedKey === "header-all" ? ` ${styles.copied}` : ""}`}
              onClick={() => onCopy?.(JSON.stringify(header, null, 2), "header-all")}
            >
              <i className={`ti ${copiedKey === "header-all" ? "ti-check" : "ti-copy"}`} />
              Copy all
            </button>
          </div>
          <div className={styles.ceClaimsList}>
            {Object.entries(header).map(([key, value]) => renderClaim(key, value))}
          </div>
        </div>

        {/* Payload Section */}
        <div className={styles.ceSection}>
          <div className={styles.ceSectionHeader}>
            <div className={styles.ceSectionTitle}>
              <i className="ti ti-package" />
              <span>Payload ({filteredClaims.length} claims)</span>
            </div>
            <button
              className={`${styles.ceCopyBtn}${copiedKey === "payload-all" ? ` ${styles.copied}` : ""}`}
              onClick={() => onCopy?.(JSON.stringify(payload, null, 2), "payload-all")}
            >
              <i className={`ti ${copiedKey === "payload-all" ? "ti-check" : "ti-copy"}`} />
              Copy all
            </button>
          </div>

          {viewMode === "categorized" && (
            <div className={styles.ceCategorized}>
              {Object.entries(categorizedClaims)
                .filter(([_, claims]) => claims.length > 0)
                .map(([category, claims]) => (
                  <div key={category} className={styles.ceCategory}>
                    <div className={styles.ceCategoryHeader}>
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
                      <span className={styles.ceCategoryCount}>{claims.length}</span>
                    </div>
                    <div className={styles.ceClaimsList}>
                      {claims.map(([key, value]) => renderClaim(key, value))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {viewMode === "alphabetical" && (
            <div className={styles.ceClaimsList}>
              {filteredClaims
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => renderClaim(key, value))}
            </div>
          )}

          {viewMode === "tree" && (
            <div className={styles.ceClaimsList}>
              {filteredClaims.map(([key, value]) => renderClaim(key, value))}
            </div>
          )}

          {filteredClaims.length === 0 && (
            <div className={styles.ceEmpty}>
              <i className="ti ti-search-off" />
              <p>No claims match your filter</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}