// features/dev/regex-tester/RegexLibrary.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { RegexPattern, PatternCategory } from "./ts/utils";
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
  const [importError, setImportError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const handleSetView = useCallback((v: "grid" | "list") => {
    setView(v);
  }, []);

  // Focus trap for import dialog
  useEffect(() => {
    if (!showImportDialog) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first element when dialog opens
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else { // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showImportDialog]);

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

  const favoriteCount = useMemo(() => patterns.filter((p) => p.favorite).length, [patterns]);
  const customCount = useMemo(() => patterns.filter((p) => !p.isBuiltIn).length, [patterns]);

  const filteredPatterns = useMemo(() => {
    let result = patterns;

    if (selectedCategory === "favorites") {
      result = result.filter((p) => p.favorite);
    } else if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

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
  }, [patterns, selectedCategory, searchQuery]);

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
    setImportError("");
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        setImportError("Expected a JSON array of patterns");
        return;
      }
      onImport(parsed as RegexPattern[]);
      setImportText("");
      setShowImportDialog(false);
    } catch (error) {
      logger.error("Invalid JSON format:", error);
      setImportError("Invalid JSON — please check the format and try again");
    }
  };

  const closeImportDialog = () => {
    setShowImportDialog(false);
    setImportText("");
    setImportError("");
  };

  const isCustomPattern = (pattern: RegexPattern) => !pattern.isBuiltIn;

  return (
    <>
      <div className={styles.rxlRoot}>
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
              disabled={customCount === 0}
            >
              <i className="ti ti-download" />
              Export
            </button>
          </div>
        </div>

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
              {cat.id === "all" && <span className={styles.rxlCategoryCount}>{patterns.length}</span>}
              {cat.id === "favorites" && favoriteCount > 0 && (
                <span className={styles.rxlCategoryCount}>{favoriteCount}</span>
              )}
            </button>
          ))}
        </div>

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

        {showImportDialog && (
          <div className={styles.rxlDialogOverlay} onClick={closeImportDialog}>
            <div className={styles.rxlDialog} onClick={(e) => e.stopPropagation()}>
              <div className={styles.rxlDialogHeader}>
                <h3 className={styles.rxlDialogTitle}>
                  <i className="ti ti-upload" />
                  Import Patterns
                </h3>
                <button type="button" className={styles.rxlDialogClose} onClick={closeImportDialog}>
                  <i className="ti ti-x" />
                </button>
              </div>

              <div className={styles.rxlDialogBody}>
                <p className={styles.rxlDialogDesc}>Paste your exported JSON patterns below:</p>
                <textarea
                  className={styles.rxlImportTextarea}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    if (importError) setImportError("");
                  }}
                  placeholder='[{"name":"My Pattern","pattern":"..."}]'
                  rows={10}
                />
                {importError && (
                  <div className={styles.rxlImportError}>
                    <i className="ti ti-alert-circle" />
                    {importError}
                  </div>
                )}
              </div>

              <div className={styles.rxlDialogFooter}>
                <button
                  type="button"
                  className={`${styles.rxlDialogBtn} ${styles.rxlCancelBtn}`}
                  onClick={closeImportDialog}
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