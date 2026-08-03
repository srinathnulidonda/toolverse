// features/dev/regex-tester/RegexLibrary.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useMemo } from "react";
import { SAMPLE_PATTERNS, type RegexPattern, type PatternCategory } from "./utils";

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
      <div className="rxl-root">
        {/* Header */}
        <div className="rxl-header">
          <div className="rxl-search-wrap">
            <i className="ti ti-search" />
            <input
              type="text"
              className="rxl-search-input"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="rxl-clear-search" onClick={() => setSearchQuery("")}>
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className="rxl-header-actions">
            <div className="rxl-view-toggle">
              <button
                type="button"
                className={`rxl-view-btn${view === "grid" ? " active" : ""}`}
                onClick={() => setView("grid")}
                title="Grid view"
              >
                <i className="ti ti-layout-grid" />
              </button>
              <button
                type="button"
                className={`rxl-view-btn${view === "list" ? " active" : ""}`}
                onClick={() => setView("list")}
                title="List view"
              >
                <i className="ti ti-list" />
              </button>
            </div>

            <button
              type="button"
              className="rxl-action-btn"
              onClick={() => setShowImportDialog(true)}
            >
              <i className="ti ti-upload" />
              Import
            </button>

            <button
              type="button"
              className="rxl-action-btn"
              onClick={handleExport}
              disabled={patterns.length === 0}
            >
              <i className="ti ti-download" />
              Export
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="rxl-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`rxl-category-btn${selectedCategory === cat.id ? " active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <i className={`ti ${cat.icon}`} />
              <span>{cat.label}</span>
              {cat.id === "all" && <span className="rxl-category-count">{allPatterns.length}</span>}
              {cat.id === "favorites" && allPatterns.filter((p) => p.favorite).length > 0 && (
                <span className="rxl-category-count">
                  {allPatterns.filter((p) => p.favorite).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Patterns Grid/List */}
        {filteredPatterns.length === 0 ? (
          <div className="rxl-empty">
            <div className="rxl-empty-icon">
              <i className="ti ti-inbox" />
            </div>
            <p className="rxl-empty-title">No patterns found</p>
            <p className="rxl-empty-desc">
              {searchQuery
                ? "Try adjusting your search query"
                : "Save your first pattern to get started"}
            </p>
          </div>
        ) : (
          <div className={`rxl-patterns${view === "list" ? " list-view" : " grid-view"}`}>
            {filteredPatterns.map((pattern) => (
              <div key={pattern.id} className="rxl-pattern-card">
                <div className="rxl-card-header">
                  <div className="rxl-card-title-row">
                    <h3 className="rxl-card-title">{pattern.name}</h3>
                    <div className="rxl-card-actions">
                      <button
                        type="button"
                        className={`rxl-icon-btn rxl-favorite-btn${pattern.favorite ? " active" : ""}`}
                        onClick={() => onToggleFavorite(pattern.id)}
                        title={pattern.favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <i className={`ti ${pattern.favorite ? "ti-star-filled" : "ti-star"}`} />
                      </button>
                      {isCustomPattern(pattern) && (
                        <button
                          type="button"
                          className="rxl-icon-btn rxl-delete-btn"
                          onClick={() => onDeletePattern(pattern.id)}
                          title="Delete pattern"
                        >
                          <i className="ti ti-trash" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="rxl-card-desc">{pattern.description}</p>
                </div>

                <div className="rxl-card-body">
                  <div className="rxl-pattern-display">
                    <code className="rxl-pattern-code">
                      /{pattern.pattern}/
                      {Object.entries(pattern.flags)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join("")}
                    </code>
                  </div>

                  {pattern.tags.length > 0 && (
                    <div className="rxl-tags">
                      {pattern.tags.map((tag) => (
                        <span key={tag} className="rxl-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rxl-card-footer">
                  <span className="rxl-category-label">
                    {categories.find((c) => c.id === pattern.category)?.label}
                  </span>
                  <button
                    type="button"
                    className="rxl-load-btn"
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
          <div className="rxl-dialog-overlay" onClick={() => setShowImportDialog(false)}>
            <div className="rxl-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="rxl-dialog-header">
                <h3 className="rxl-dialog-title">
                  <i className="ti ti-upload" />
                  Import Patterns
                </h3>
                <button
                  type="button"
                  className="rxl-dialog-close"
                  onClick={() => setShowImportDialog(false)}
                >
                  <i className="ti ti-x" />
                </button>
              </div>

              <div className="rxl-dialog-body">
                <p className="rxl-dialog-desc">Paste your exported JSON patterns below:</p>
                <textarea
                  className="rxl-import-textarea"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"name":"My Pattern","pattern":"..."}]'
                  rows={10}
                />
              </div>

              <div className="rxl-dialog-footer">
                <button
                  type="button"
                  className="rxl-dialog-btn rxl-cancel-btn"
                  onClick={() => setShowImportDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rxl-dialog-btn rxl-import-btn"
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
