// features/dev/regex-tester/RegexLibrary.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useMemo } from "react";
import { SAMPLE_PATTERNS, type RegexPattern, type PatternCategory } from "./ts/utils";
import styles from "./style/RegexLibrary.module.css";

interface RegexLibraryProps {
  patterns: RegexPattern[];
  onLoadPattern: (pattern: RegexPattern) => void;
  onDeletePattern: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onImport: (patterns: RegexPattern[]) => void;
  onExport: () => string;
}

export default function RegexLibrary({
  patterns,
  onLoadPattern,
  onDeletePattern,
  onToggleFavorite,
  onImport,
  onExport,
}: RegexLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PatternCategory | "all" | "favorites">(
    "all"
  );
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState("");

  const categories: Array<{
    id: PatternCategory | "all" | "favorites";
    label: string;
    icon: string;
  }> = [
      { id: "all", label: "All Patterns", icon: "ti-layout-grid" },
      { id: "favorites", label: "Favorites", icon: "ti-star" },
      { id: "validation", label: "Validation", icon: "ti-shield-check" },
      { id: "extraction", label: "Extraction", icon: "ti-filter" },
      { id: "web", label: "Web", icon: "ti-world" },
      { id: "datetime", label: "Date & Time", icon: "ti-calendar" },
      { id: "formatting", label: "Formatting", icon: "ti-text-resize" },
      { id: "security", label: "Security", icon: "ti-lock" },
      { id: "custom", label: "Custom", icon: "ti-edit" },
    ];

  const allPatterns = useMemo(() => {
    return [...SAMPLE_PATTERNS, ...patterns];
  }, [patterns]);

  const filteredPatterns = useMemo(() => {
    let result = allPatterns;

    // Category filter
    if (selectedCategory === "favorites") {
      result = result.filter((p) => p.favorite);
    } else if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.pattern.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allPatterns, selectedCategory, searchQuery]);

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `regex-patterns-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const imported = JSON.parse(importText) as RegexPattern[];
      onImport(imported);
      setImportText("");
      setShowImportDialog(false);
    } catch (error) {
      logger.error("Invalid JSON format:", error);
      // In a real app, we would set error state to show in UI
    }
  };

  const isCustomPattern = (pattern: RegexPattern) => {
    return !SAMPLE_PATTERNS.some((p) => p.id === pattern.id);
  };

  return (
    <>
      <div className={styles.rxlRoot}>
        {/* Header */}
        <div className={styles.rxlHeader}>
          <div className={styles.rxlSearchWrap}>
            <i className="ti ti-search" />
            <input
              type="text"
              className={styles.rxlSearchInput}
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className={styles.rxlClearSearch} onClick={() => setSearchQuery("")}>
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className={styles.rxlHeaderActions}>
            <div className={styles.rxlViewToggle}>
              <button
                type="button"
                className={`${styles.rxlViewBtn}${view === "grid" ? ` ${styles.active}` : ""}`}
                onClick={() => setView("grid")}
                title="Grid view"
              >
                <i className="ti ti-layout-grid" />
              </button>
              <button
                type="button"
                className={`${styles.rxlViewBtn}${view === "list" ? ` ${styles.active}` : ""}`}
                onClick={() => setView("list")}
                title="List view"
              >
                <i className="ti ti-list" />
              </button>
            </div>

            <button
              type="button"
              className={styles.rxlActionBtn}
              onClick={() => setShowImportDialog(true)}
            >
              <i className="ti ti-upload" />
              Import
            </button>

            <button
              type="button"
              className={styles.rxlActionBtn}
              onClick={handleExport}
              disabled={patterns.length === 0}
            >
              <i className="ti ti-download" />
              Export
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className={styles.rxlCategories}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.rxlCategoryBtn}${selectedCategory === cat.id ? ` ${styles.active}` : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <i className={`ti ${cat.icon}`} />
              <span>{cat.label}</span>
              {cat.id === "all" && <span className={styles.rxlCategoryCount}>{allPatterns.length}</span>}
              {cat.id === "favorites" && allPatterns.filter((p) => p.favorite).length > 0 && (
                <span className={styles.rxlCategoryCount}>
                  {allPatterns.filter((p) => p.favorite).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Patterns Grid/List */}
        {filteredPatterns.length === 0 ? (
          <div className={styles.rxlEmpty}>
            <div className={styles.rxlEmptyIcon}>
              <i className="ti ti-inbox" />
            </div>
            <p className={styles.rxlEmptyTitle}>No patterns found</p>
            <p className={styles.rxlEmptyDesc}>
              {searchQuery
                ? "Try adjusting your search query"
                : "Save your first pattern to get started"}
            </p>
          </div>
        ) : (
          <div className={`${styles.rxlPatterns}${view === "list" ? ` ${styles.listView}` : ` ${styles.gridView}`}`}>
            {filteredPatterns.map((pattern) => (
              <div key={pattern.id} className={styles.rxlPatternCard}>
                <div className={styles.rxlCardHeader}>
                  <div className={styles.rxlCardTitleRow}>
                    <h3 className={styles.rxlCardTitle}>{pattern.name}</h3>
                    <div className={styles.rxlCardActions}>
                      <button
                        type="button"
                        className={`${styles.rxlIconBtn} ${styles.rxlFavoriteBtn}${pattern.favorite ? ` ${styles.active}` : ""}`}
                        onClick={() => onToggleFavorite(pattern.id)}
                        title={pattern.favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <i className={`ti ${pattern.favorite ? "ti-star-filled" : "ti-star"}`} />
                      </button>
                      {isCustomPattern(pattern) && (
                        <button
                          type="button"
                          className={`${styles.rxlIconBtn} ${styles.rxlDeleteBtn}`}
                          onClick={() => onDeletePattern(pattern.id)}
                          title="Delete pattern"
                        >
                          <i className="ti ti-trash" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={styles.rxlCardDesc}>{pattern.description}</p>
                </div>

                <div className={styles.rxlCardBody}>
                  <div className={styles.rxlPatternDisplay}>
                    <code className={styles.rxlPatternCode}>
                      /{pattern.pattern}/
                      {Object.entries(pattern.flags)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join("")}
                    </code>
                  </div>

                  {pattern.tags.length > 0 && (
                    <div className={styles.rxlTags}>
                      {pattern.tags.map((tag) => (
                        <span key={tag} className={styles.rxlTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.rxlCardFooter}>
                  <span className={styles.rxlCategoryLabel}>
                    {categories.find((c) => c.id === pattern.category)?.label}
                  </span>
                  <button
                    type="button"
                    className={styles.rxlLoadBtn}
                    onClick={() => onLoadPattern(pattern)}
                  >
                    <i className="ti ti-player-play" />
                    Use Pattern
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Import Dialog */}
        {showImportDialog && (
          <div className={styles.rxlDialogOverlay} onClick={() => setShowImportDialog(false)}>
            <div className={styles.rxlDialog} onClick={(e) => e.stopPropagation()}>
              <div className={styles.rxlDialogHeader}>
                <h3 className={styles.rxlDialogTitle}>
                  <i className="ti ti-upload" />
                  Import Patterns
                </h3>
                <button
                  type="button"
                  className={styles.rxlDialogClose}
                  onClick={() => setShowImportDialog(false)}
                >
                  <i className="ti ti-x" />
                </button>
              </div>

              <div className={styles.rxlDialogBody}>
                <p className={styles.rxlDialogDesc}>Paste your exported JSON patterns below:</p>
                <textarea
                  className={styles.rxlImportTextarea}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"name":"My Pattern","pattern":"..."}]'
                  rows={10}
                />
              </div>

              <div className={styles.rxlDialogFooter}>
                <button
                  type="button"
                  className={`${styles.rxlDialogBtn} ${styles.rxlCancelBtn}`}
                  onClick={() => setShowImportDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.rxlDialogBtn} ${styles.rxlImportBtn}`}
                  onClick={handleImport}
                  disabled={!importText.trim()}
                >
                  <i className="ti ti-check" />
                  Import
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}