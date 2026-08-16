// app/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, Suspense } from "react";
import { TOOLS } from "@/data/tools";
import { getCategoriesWithCount } from "@/data/categories";
import SearchInput from "@/components/search/SearchInput";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import SearchEmpty from "@/components/search/SearchEmpty";

function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("s") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(() => {
    let list = activeFilter === "all" ? TOOLS : TOOLS.filter((t) => t.category === activeFilter);

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
  }, [query, activeFilter]);

  const toolCounts = useMemo(() => {
    const CATEGORIES = getCategoriesWithCount();
    const counts: Record<string, number> = { all: TOOLS.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.slug] = cat.count;
    });
    return counts;
  }, []);

  const CATEGORIES = useMemo(() => getCategoriesWithCount(), []);

  return (
    <>
      <div className="sp-page">
        {/* Header */}
        <div className="sp-header">
          <div className="sp-header-inner">
            <p className="sp-eyebrow">Search</p>
            <h1 className="sp-title">
              {query ? (
                <>
                  Results for <span className="sp-title-query">&quot;{query}&quot;</span>
                </>
              ) : (
                "Find the right tool"
              )}
            </h1>
            <p className="sp-desc">Search across {TOOLS.length} free browser-based tools</p>

            {/* Search input */}
            <SearchInput query={query} onChange={setQuery} />

            {/* Filters */}
            <SearchFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              toolCounts={toolCounts}
            />
          </div>
        </div>

        {/* Results */}
        <div className="sp-body">
          <div className="sp-body-inner">
            {/* Results count */}
            {query.trim() && (
              <p className="sp-count">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
                <span className="sp-count-query">&quot;{query}&quot;</span>
                {activeFilter !== "all" && (
                  <> in {CATEGORIES.find((c) => c.slug === activeFilter)?.label}</>
                )}
              </p>
            )}

            {/* Results or empty */}
            {filtered.length > 0 ? (
              <SearchResults tools={filtered} query={query} />
            ) : (
              <SearchEmpty
                query={query}
                onClear={() => {
                  setQuery("");
                  setActiveFilter("all");
                }}
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sp-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .sp-header {
          background: var(--bg);
          padding: 48px 40px 36px;
          border-bottom: 0.5px solid var(--border);
        }
        .sp-header-inner {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .sp-eyebrow {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: var(--font-sans);
          margin: 0 0 12px;
        }

        .sp-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -1px;
          line-height: 1.2;
          margin: 0 0 10px;
          font-family: var(--font-sans);
        }
        .sp-title-query {
          color: var(--brand);
        }

        .sp-desc {
          font-size: 14px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          line-height: 1.6;
          margin: 0 0 28px;
        }

        .sp-body {
          max-width: 1600px;
          margin: 0 auto;
          padding: 32px 40px 80px;
        }
        .sp-body-inner {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sp-count {
          font-size: 13px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          margin: 0;
          text-align: center;
        }
        .sp-count-query {
          color: var(--text-secondary);
          font-weight: 500;
        }

        @media (max-width: 1280px) {
          .sp-body {
            max-width: 1200px;
          }
        }

        @media (max-width: 1024px) {
          .sp-header {
            padding: 40px 24px 32px;
          }
          .sp-body {
            padding-left: 24px;
            padding-right: 24px;
          }
        }
        @media (max-width: 640px) {
          .sp-header {
            padding: 32px 20px 24px;
          }
          .sp-body {
            padding: 24px 20px 60px;
          }
        }
      `}</style>
    </>
  );
}

export default function SearchPageWrapper() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
