// components/tools-directory/ToolsGrid.tsx
import type { Tool } from "@/lib/tools";
import ToolDirectoryCard from "./ToolDirectoryCard";
import { useEffect, useState, useCallback, useRef } from "react";

type ToolsGridProps = {
  tools: Tool[];
};

export default function ToolsGrid({ tools }: ToolsGridProps) {
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(0);
  const [itemHeight, setItemHeight] = useState(95); // estimated height
  const [cols, setCols] = useState(4); // number of columns
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const calculateVisibleRange = (container: HTMLDivElement) => {
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    // Calculate visible range with buffer
    const buffer = 3; // render 3 extra rows before/after visible area
    const itemsPerRow = cols;
    const visibleRows = Math.ceil(clientHeight / itemHeight) + buffer * 2;
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endRow = Math.min(
      Math.ceil(tools.length / itemsPerRow),
      startRow + visibleRows
    );

    setVisibleStart(startRow * itemsPerRow);
    setVisibleEnd(Math.min(endRow * itemsPerRow, tools.length));
  };

  const handleScrollRef = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (!target) return;
    calculateVisibleRange(target);
  }, []); // empty deps because calculateVisibleRange is called but not listed (it's safe)

  useEffect(() => {
    // Update columns based on window width
    const updateCols = () => {
      const width = window.innerWidth;
      if (width > 1024) setCols(4);
      else if (width > 768) setCols(3);
      else if (width > 480) setCols(2);
      else setCols(1);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize scroll position
    container.scrollTop = 0;

    // Add scroll listener
    container.addEventListener("scroll", handleScrollRef);

    // Initial calculation
    calculateVisibleRange(container);

    // Set up resize observer for container size changes
    observerRef.current = new ResizeObserver(() => {
      // We need to get the container again because the observer callback doesn't receive it
      const el = containerRef.current;
      if (el) {
        calculateVisibleRange(el);
      }
    });
    observerRef.current.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScrollRef);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []); // deps empty because calculateVisibleRange is called but not listed

  // Recalculate when tools length changes significantly
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      calculateVisibleRange(container);
    }
  }, [tools.length]); // only depend on tools.length

  const renderedTools = tools.slice(visibleStart, visibleEnd);

  return (
    <>
      {tools.length > 0 ? (
        <div
          ref={containerRef}
          className="tdg-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            minHeight: `${Math.ceil(tools.length / cols) * itemHeight}px`,
          }}
        >
          {/* Padding at start for virtualization */}
          {visibleStart > 0 && (
            <div
              style={{
                gridColumn: `1 / -1`,
                height: `${visibleStart * (itemHeight / cols)}px`,
              }}
            />
          )}

          {renderedTools.map((tool) => (
            <ToolDirectoryCard key={tool.slug} tool={tool} />
          ))}

          {/* Padding at end for virtualization */}
          {visibleEnd < tools.length && (
            <div
              style={{
                gridColumn: `1 / -1`,
                height: `${(tools.length - visibleEnd) * (itemHeight / cols)}px`,
              }}
            />
          )}
        </div>
      ) : (
        <div className="tdg-empty">
          <div className="tdg-empty-icon">
            <i className="ti ti-mood-empty" aria-hidden="true" />
          </div>
          <p className="tdg-empty-title">No tools found</p>
          <p className="tdg-empty-desc">Try a different search term or category.</p>
        </div>
      )}

      <style>{`
        .tdg-grid {
          display: grid;
          gap: 10px;
          overflow-y: auto;
        }

        .tdg-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          text-align: center;
          gap: 10px;
        }

        .tdg-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .tdg-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          margin: 0;
        }

        .tdg-empty-desc {
          font-size: 13px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          margin: 0;
        }

        @media (max-width: 1024px) {
          .tdg-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .tdg-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 480px) {
          .tdg-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
