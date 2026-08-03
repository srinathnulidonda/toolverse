// components/categories/CategoriesGrid.tsx
import { TOOLS } from "@/lib/tools";
import type { CategoryWithCount } from "@/lib/tools";
import CategoryCard from "./CategoryCard";

type CategoriesGridProps = {
  categories: CategoryWithCount[];
};

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <>
      <div className="cat-grid">
        {categories.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat.slug);
          return <CategoryCard key={cat.slug} category={cat} tools={tools} />;
        })}
      </div>

      <style>{`
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 56px;
          align-items: start;
        }

        @media (max-width: 1280px) {
          .cat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .cat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .cat-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}
