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

const CATEGORY_ICONS: Record<string, string> = {
  temporal: "ti-clock",
  identity: "ti-user",
  authorization: "ti-shield",
  metadata: "ti-info-circle",
  custom: "ti-puzzle",
};

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
    const categories: Record<string, Array<[string, unknown]>> = {
      temporal: [],
      identity: [],
      authorization: [],
      metadata: [],
      custom: [],
    };
    Object.entries(payload).forEach(([key, value]) => {
      const meta = getClaimMetadata(key);
      const category = meta.category || "custom";
      if (categories[category]) {
        categories[category].push([key, value]);
      } else {
        categories.custom.push([key, value]);
      }
    });
    return categories;
  }, [payload]);

  const filteredPayloadClaims = useMemo(() => {
    let entries = Object.entries(payload);
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter(([key, value]) => {
        const meta = getClaimMetadata(key);
        return (
          key.toLowerCase().includes(q) ||
          meta.name.toLowerCase().includes(q) ||
          meta.description.toLowerCase().includes(q) ||
          JSON.stringify(value).toLowerCase().includes(q)
        );
      });
    }
    return entries;
  }, [payload, filterMode, searchQuery]);

  const filteredCategorized = useMemo(() => {
    if (!searchQuery.trim() && filterMode === "all") return categorizedClaims;
    const filteredKeys = new Set(filteredPayloadClaims.map(([k]) => k));
    const result: Record<string, Array<[string, unknown]>> = {};
    Object.entries(categorizedClaims).forEach(([cat, claims]) => {
      const filtered = claims.filter(([k]) => filteredKeys.has(k));
      if (filtered.length > 0) result[cat] = filtered;
    });
    return result;
  }, [categorizedClaims, filteredPayloadClaims, searchQuery, filterMode]);

  const renderValue = useCallback(
    (value: unknown, isExpanded: boolean = false): React.ReactNode => {
      if (value === null) return <span className={styles.ceValueNull}>null</span>;
      if (value === undefined) return <span className={styles.ceValueUndefined}>undefined</span>;
      if (typeof value === "boolean")
        return <span className={styles.ceValueBool}>{value.toString()}</span>;
      if (typeof value === "number") return <span className={styles.ceValueNum}>{value}</span>;
      if (typeof value === "string") {
        if (value.length > 120 && !isExpanded)
          return <span className={styles.ceValueStr}>"{value.slice(0, 120)}…"</span>;
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
    },
    []
  );

  const getTypeClass = (type: string) => {
    if (type === "registered") return styles.ceClaimTypeRegistered;
    if (type === "public") return styles.ceClaimTypePublic;
    return styles.ceClaimTypePrivate;
  };

  const renderClaim = useCallback(
    (key: string, value: unknown) => {
      const meta = getClaimMetadata(key);
      const isExpanded = expandedClaims.has(key);
      const isComplex = typeof value === "object" && value !== null;
      const isTimestamp = meta.valueType === "timestamp" && typeof value === "number";
      const copyKey = `claim-${key}`;

      return (
        <div key={key} className={styles.ceClaim}>
          <div className={styles.ceClaimHeader}>
            <div className={styles.ceClaimMain}>
              {isComplex && (
                <button
                  className={styles.ceExpandBtn}
                  onClick={() => toggleClaim(key)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  aria-expanded={isExpanded}
                >
                  <i className={`ti ti-chevron-${isExpanded ? "down" : "right"}`} />
                </button>
              )}
              {!isComplex && <div style={{ width: 18, flexShrink: 0 }} />}
              <div className={styles.ceClaimInfo}>
                <div className={styles.ceClaimKeyRow}>
                  <code className={styles.ceClaimKey}>{key}</code>
                  <span className={`${styles.ceClaimType} ${getTypeClass(meta.type)}`}>
                    {meta.type}
                  </span>
                </div>
                <div className={styles.ceClaimMetaRow}>
                  <span className={styles.ceClaimName}>{meta.name}</span>
                  <span className={styles.ceClaimSeparator}>·</span>
                  <span className={styles.ceClaimDesc}>{meta.description}</span>
                </div>
              </div>
            </div>
            <button
              className={`${styles.ceCopyBtn}${copiedKey === copyKey ? ` ${styles.copied}` : ""}`}
              onClick={() => onCopy?.(JSON.stringify({ [key]: value }, null, 2), copyKey)}
              title="Copy claim"
              aria-label={`Copy ${key} claim`}
            >
              <i className={`ti ${copiedKey === copyKey ? "ti-check" : "ti-copy"}`} />
            </button>
          </div>
          <div className={styles.ceClaimValue}>
            {renderValue(value, isExpanded)}
            {isTimestamp && (
              <div className={styles.ceTimestampInfo}>
                <div className={styles.ceTimestampRow}>
                  <i className="ti ti-calendar" />
                  <span>{formatTimestamp(value as number)}</span>
                </div>
                <div className={`${styles.ceTimestampRow} ${styles.ceTimestampRelative}`}>
                  <i className="ti ti-clock" />
                  <span>{getRelativeTime(value as number)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    },
    [expandedClaims, copiedKey, onCopy, renderValue, toggleClaim]
  );

  return (
    <div className={styles.ceRoot}>
      <div className={styles.ceControls}>
        <div className={styles.ceSearch}>
          <i className="ti ti-search" />
          <input
            type="text"
            className={styles.ceSearchInput}
            placeholder="Search claims…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search claims"
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
              aria-pressed={viewMode === "categorized"}
            >
              <i className="ti ti-category" />
            </button>
            <button
              className={`${styles.ceFilterBtn}${viewMode === "alphabetical" ? ` ${styles.active}` : ""}`}
              onClick={() => setViewMode("alphabetical")}
              title="Sort alphabetically"
              aria-pressed={viewMode === "alphabetical"}
            >
              <i className="ti ti-sort-ascending-letters" />
            </button>
            <button
              className={`${styles.ceFilterBtn}${viewMode === "tree" ? ` ${styles.active}` : ""}`}
              onClick={() => setViewMode("tree")}
              title="Flat list"
              aria-pressed={viewMode === "tree"}
            >
              <i className="ti ti-list" />
            </button>
          </div>

          <div className={styles.ceDivider} />

          <div className={styles.ceFilterGroup}>
            <button
              className={`${styles.ceFilterBtn}${filterMode === "all" ? ` ${styles.active}` : ""}`}
              onClick={() => setFilterMode("all")}
              aria-pressed={filterMode === "all"}
            >
              All
            </button>
            <button
              className={`${styles.ceFilterBtn}${filterMode === "registered" ? ` ${styles.active}` : ""}`}
              onClick={() => setFilterMode("registered")}
              aria-pressed={filterMode === "registered"}
            >
              Standard
            </button>
            <button
              className={`${styles.ceFilterBtn}${filterMode === "custom" ? ` ${styles.active}` : ""}`}
              onClick={() => setFilterMode("custom")}
              aria-pressed={filterMode === "custom"}
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      <div className={styles.ceSection}>
        <div className={styles.ceSectionHeader}>
          <div className={styles.ceSectionTitle}>
            <i className="ti ti-file-description" />
            <span>Header ({Object.keys(header).length})</span>
          </div>
          <button
            className={`${styles.ceCopyBtnLabel}${copiedKey === "header-all" ? ` ${styles.copied}` : ""}`}
            onClick={() => onCopy?.(JSON.stringify(header, null, 2), "header-all")}
            aria-label="Copy all header claims"
          >
            <i className={`ti ${copiedKey === "header-all" ? "ti-check" : "ti-copy"}`} />
            Copy all
          </button>
        </div>
        <div className={styles.ceClaimsList}>
          {Object.entries(header).map(([key, value]) => renderClaim(key, value))}
        </div>
      </div>

      <div className={styles.ceSection}>
        <div className={styles.ceSectionHeader}>
          <div className={styles.ceSectionTitle}>
            <i className="ti ti-package" />
            <span>Payload ({filteredPayloadClaims.length})</span>
          </div>
          <button
            className={`${styles.ceCopyBtnLabel}${copiedKey === "payload-all" ? ` ${styles.copied}` : ""}`}
            onClick={() => onCopy?.(JSON.stringify(payload, null, 2), "payload-all")}
            aria-label="Copy all payload claims"
          >
            <i className={`ti ${copiedKey === "payload-all" ? "ti-check" : "ti-copy"}`} />
            Copy all
          </button>
        </div>

        {viewMode === "categorized" && (
          <div className={styles.ceCategorized}>
            {Object.entries(filteredCategorized).length === 0 ? (
              <div className={styles.ceEmpty}>
                <i className="ti ti-search-off" />
                <p>No claims match your filter</p>
              </div>
            ) : (
              Object.entries(filteredCategorized).map(([category, claims]) => (
                <div key={category} className={styles.ceCategory}>
                  <div className={styles.ceCategoryHeader}>
                    <i className={`ti ${CATEGORY_ICONS[category] || "ti-puzzle"}`} />
                    <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span className={styles.ceCategoryCount}>{claims.length}</span>
                  </div>
                  <div className={styles.ceClaimsList}>
                    {claims.map(([key, value]) => renderClaim(key, value))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {viewMode === "alphabetical" && (
          <div className={styles.ceClaimsList}>
            {filteredPayloadClaims.length === 0 ? (
              <div className={styles.ceEmpty}>
                <i className="ti ti-search-off" />
                <p>No claims match your filter</p>
              </div>
            ) : (
              [...filteredPayloadClaims]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => renderClaim(key, value))
            )}
          </div>
        )}

        {viewMode === "tree" && (
          <div className={styles.ceClaimsList}>
            {filteredPayloadClaims.length === 0 ? (
              <div className={styles.ceEmpty}>
                <i className="ti ti-search-off" />
                <p>No claims match your filter</p>
              </div>
            ) : (
              filteredPayloadClaims.map(([key, value]) => renderClaim(key, value))
            )}
          </div>
        )}
      </div>
    </div>
  );
}