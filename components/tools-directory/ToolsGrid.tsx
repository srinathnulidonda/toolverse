// components/tools-directory/ToolsGrid.tsx
import type { Tool } from "@/lib/tools";
import ToolDirectoryCard from "./ToolDirectoryCard";

type ToolsGridProps = {
  tools: Tool[];
};

export default function ToolsGrid({ tools }: ToolsGridProps) {
  return (
    <>
      {tools.length > 0 ? (
        <div className="tdg-grid">
          {tools.map((tool) => (
            <ToolDirectoryCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="tdg-empty">
          <div className="tdg-empty-icon">
            <i className="ti ti-mood-empty" aria-hidden="true" />
          </div>
          <p className="tdg-empty-title">No tools found</p>
          <p className="tdg-empty-desc">
            Try a different search term or category.
          </p>
        </div>
      )}

      <style>{`
        .tdg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 10px;
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

        @media (max-width: 640px) {
          .tdg-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}