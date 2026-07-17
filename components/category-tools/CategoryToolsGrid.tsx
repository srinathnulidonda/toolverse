// components/category-tools/CategoryToolsGrid.tsx
import type { Tool } from "@/lib/tools";
import CategoryToolCard from "./CategoryToolCard";

export default function CategoryToolsGrid({ tools }: { tools: Tool[] }) {
  return (
    <>
      <div className="ctg-grid">
        {tools.map((tool) => (
          <CategoryToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
      <style>{`
        .ctg-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 1024px) {
          .ctg-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .ctg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 480px) {
          .ctg-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
