// app/tools/client-page.tsx
"use client";

import { useState, useMemo } from "react";
import { TOOLS } from "@/lib/tools";
import { getCategoriesWithCount } from "@/lib/tools";
import ToolsHeader from "@/components/tools-directory/ToolsHeader";
import ToolsSearch from "@/components/tools-directory/ToolsSearch";
import ToolsFilters from "@/components/tools-directory/ToolsFilters";
import ToolsGrid from "@/components/tools-directory/ToolsGrid";

const ALL_FILTER = "all";

export default function ToolsPage() {
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [query, setQuery] = useState("");

  const CATEGORIES = useMemo(() => getCategoriesWithCount(), []);

  const filtered = useMemo(() => {
    let list =
      activeFilter === ALL_FILTER ? TOOLS : TOOLS.filter((t) => t.category === activeFilter);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeFilter, query]);

  const toolCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TOOLS.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.slug] = cat.count;
    });
    return counts;
  }, [CATEGORIES]);

  return (
    <>
      <div className="tdp-page">
        <ToolsHeader />

        <div className="tdp-body">
          <ToolsSearch query={query} onChange={setQuery} />

          <ToolsFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            toolCounts={toolCounts}
          />

          <p className="tdp-results-count">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            {query && <>matching "{query}"</>}
            {activeFilter !== ALL_FILTER && !query && (
              <> in {CATEGORIES.find((c) => c.slug === activeFilter)?.label}</>
            )}
          </p>

          <ToolsGrid tools={filtered} />
        </div>
      </div>

      <style>{`
        .tdp-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .tdp-body {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }

        .tdp-results-count {
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          margin: 0 0 16px;
          text-align: center;
        }

        @media (max-width: 1280px) {
          .tdp-body {
            max-width: 1200px;
          }
        }

        @media (max-width: 1024px) {
          .tdp-body {
            padding-left: 24px;
            padding-right: 24px;
          }
        }

        @media (max-width: 640px) {
          .tdp-body {
            padding: 0 20px 60px;
          }
        }
      `}</style>
    </>
  );
}
