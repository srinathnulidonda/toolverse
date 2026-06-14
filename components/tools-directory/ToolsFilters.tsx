// components/tools-directory/ToolsFilters.tsx
"use client";

import { getCategoriesWithCount } from "@/lib/tools";

type ToolsFiltersProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  toolCounts: Record<string, number>;
};

export default function ToolsFilters({
  activeFilter,
  onFilterChange,
  toolCounts,
}: ToolsFiltersProps) {
  const CATEGORIES = getCategoriesWithCount();

  return (
    <>
      <div className="tdf-container">
        <div
          className="tdf-root"
          role="tablist"
          aria-label="Filter by category"
        >
          <button
            role="tab"
            aria-selected={activeFilter === "all"}
            className={`tdf-btn${activeFilter === "all" ? " active" : ""}`}
            onClick={() => onFilterChange("all")}
          >
            All
            <span className="tdf-count">{toolCounts.all}</span>
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              role="tab"
              aria-selected={activeFilter === cat.slug}
              className={`tdf-btn${activeFilter === cat.slug ? " active" : ""
                }`}
              onClick={() => onFilterChange(cat.slug)}
            >
              <i className={`ti ${cat.icon}`} aria-hidden="true" />
              <span className="tdf-label">
                {cat.label.replace(" Tools", "")}
              </span>
              <span className="tdf-count">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .tdf-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .tdf-root {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 99px;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s, color 0.12s;
          white-space: nowrap;
        }
        .tdf-btn i {
          font-size: 13px;
        }
        .tdf-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }
        .tdf-btn.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .tdf-count {
          font-size: 10px;
          color: var(--text-disabled);
          font-weight: 400;
        }
        .tdf-btn.active .tdf-count {
          color: var(--brand-text);
          opacity: 0.7;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .tdf-root {
            gap: 5px;
          }

          .tdf-btn {
            height: 26px;
            padding: 0 8px;
            font-size: 11px;
            gap: 4px;
          }

          .tdf-btn i {
            font-size: 11px;
          }

          .tdf-label {
            display: none;
          }

          .tdf-count {
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
}