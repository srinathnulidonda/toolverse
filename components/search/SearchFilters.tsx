// components/search/SearchFilters.tsx
"use client";

import { CATEGORIES } from "@/lib/tools";

type SearchFiltersProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  toolCounts: Record<string, number>;
};

export default function SearchFilters({
  activeFilter,
  onFilterChange,
  toolCounts,
}: SearchFiltersProps) {
  return (
    <>
      <div className="sf-root" role="tablist" aria-label="Filter by category">
        <button
          role="tab"
          aria-selected={activeFilter === "all"}
          className={`sf-btn${activeFilter === "all" ? " active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          All
          <span className="sf-count">{toolCounts.all}</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            role="tab"
            aria-selected={activeFilter === cat.slug}
            className={`sf-btn${activeFilter === cat.slug ? " active" : ""}`}
            onClick={() => onFilterChange(cat.slug)}
          >
            <i className={`ti ${cat.icon}`} aria-hidden="true" />
            <span className="sf-label">{cat.label.replace(" Tools", "")}</span>
            <span className="sf-count">{cat.count}</span>
          </button>
        ))}
      </div>

      <style>{`
        .sf-root {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .sf-btn {
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
        .sf-btn i {
          font-size: 13px;
        }
        .sf-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }
        .sf-btn.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .sf-count {
          font-size: 10px;
          color: var(--text-disabled);
          font-weight: 400;
        }
        .sf-btn.active .sf-count {
          color: var(--brand-text);
          opacity: 0.7;
        }

        @media (max-width: 640px) {
          .sf-root {
            gap: 5px;
          }
          .sf-btn {
            height: 26px;
            padding: 0 8px;
            font-size: 11px;
            gap: 4px;
          }
          .sf-btn i {
            font-size: 11px;
          }
          .sf-label {
            display: none;
          }
          .sf-count {
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
}