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

      <style jsx>{`
        .rxl-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        .rxl-header {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rxl-search-wrap {
          flex: 1;
          min-width: 280px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          height: 40px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          transition: border-color 0.12s;
        }

        .rxl-search-wrap:focus-within {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .rxl-search-wrap i {
          font-size: 16px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .rxl-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text);
          outline: none;
        }

        .rxl-search-input::placeholder {
          color: var(--text-disabled);
        }

        .rxl-clear-search {
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.12s;
        }

        .rxl-clear-search:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .rxl-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rxl-view-toggle {
          display: flex;
          gap: 2px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 2px;
        }

        .rxl-view-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: calc(var(--radius-md) - 2px);
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxl-view-btn i {
          font-size: 16px;
        }

        .rxl-view-btn:hover {
          color: var(--text);
        }

        .rxl-view-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .rxl-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxl-action-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .rxl-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .rxl-action-btn i {
          font-size: 15px;
        }

        .rxl-categories {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .rxl-category-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 34px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .rxl-category-btn i {
          font-size: 14px;
        }

        .rxl-category-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .rxl-category-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .rxl-category-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 99px;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          font-size: 10px;
          font-weight: 700;
          border: 0.5px solid var(--border);
        }

        .rxl-category-btn.active .rxl-category-count {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        .rxl-patterns {
          display: grid;
          gap: 14px;
        }

        .rxl-patterns.grid-view {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }

        .rxl-patterns.list-view {
          grid-template-columns: 1fr;
        }

        .rxl-pattern-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          transition: all 0.12s;
        }

        .rxl-pattern-card:hover {
          border-color: var(--brand-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .rxl-card-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rxl-card-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .rxl-card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.3;
        }

        .rxl-card-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .rxl-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxl-icon-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .rxl-favorite-btn.active {
          color: #f59e0b;
          background: #fef3c7;
          border-color: #fde68a;
        }

        @media (prefers-color-scheme: dark) {
          .rxl-favorite-btn.active {
            background: #1f1a08;
            border-color: #78350f;
          }
        }

        .rxl-delete-btn:hover {
          color: #dc2626;
          background: var(--error-bg);
          border-color: #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .rxl-delete-btn:hover {
            color: #f87171;
            border-color: #7f1d1d;
          }
        }

        .rxl-card-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .rxl-card-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rxl-pattern-display {
          padding: 10px 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow-x: auto;
        }

        .rxl-pattern-code {
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--brand);
          font-weight: 600;
          word-break: break-all;
        }

        .rxl-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .rxl-tag {
          display: inline-flex;
          align-items: center;
          height: 22px;
          padding: 0 8px;
          border-radius: 4px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 500;
        }

        .rxl-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding-top: 8px;
          border-top: 0.5px solid var(--border-faint);
        }

        .rxl-category-label {
          font-size: 11px;
          color: var(--text-disabled);
          font-weight: 500;
        }

        .rxl-load-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--brand-border);
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxl-load-btn:hover {
          background: var(--brand);
          color: white;
        }

        .rxl-load-btn i {
          font-size: 13px;
        }

        .rxl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 80px 24px;
          text-align: center;
        }

        .rxl-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          color: var(--text-disabled);
          margin-bottom: 8px;
        }

        .rxl-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .rxl-empty-desc {
          font-size: 14px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 380px;
          line-height: 1.6;
        }

        /* Dialog */
        .rxl-dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .rxl-dialog {
          width: 100%;
          max-width: 560px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .rxl-dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
          border-bottom: 0.5px solid var(--border);
        }

        .rxl-dialog-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .rxl-dialog-title i {
          font-size: 20px;
        }

        .rxl-dialog-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxl-dialog-close:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .rxl-dialog-close i {
          font-size: 18px;
        }

        .rxl-dialog-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rxl-dialog-desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .rxl-import-textarea {
          width: 100%;
          padding: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--text);
          resize: vertical;
          outline: none;
          transition: border-color 0.12s;
        }

        .rxl-import-textarea:focus {
          border-color: var(--brand);
        }

        .rxl-import-textarea::placeholder {
          color: var(--text-disabled);
        }

        .rxl-dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 0.5px solid var(--border);
        }

        .rxl-dialog-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 18px;
          border-radius: var(--radius-md);
          border: 0.5px solid;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxl-cancel-btn {
          border-color: var(--border);
          background: transparent;
          color: var(--text-secondary);
        }

        .rxl-cancel-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .rxl-import-btn {
          border-color: var(--brand-border);
          background: var(--brand);
          color: white;
        }

        .rxl-import-btn:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .rxl-import-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .rxl-root {
            padding: 12px;
          }

          .rxl-patterns.grid-view {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rxl-search-wrap,
          .rxl-view-btn,
          .rxl-action-btn,
          .rxl-category-btn,
          .rxl-pattern-card,
          .rxl-icon-btn,
          .rxl-load-btn,
          .rxl-dialog-close,
          .rxl-dialog-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
