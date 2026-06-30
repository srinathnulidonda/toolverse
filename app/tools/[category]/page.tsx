// app/tools/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getToolsByCategory } from "@/lib/tools";
import { getCategoriesWithCount } from "@/lib/tools";
import CategoryToolsHeader from "@/components/category-tools/CategoryToolsHeader";
import CategoryToolsGrid from "@/components/category-tools/CategoryToolsGrid";
import CategoryToolsSidebar from "@/components/category-tools/CategoryToolsSidebar";

export function generateStaticParams() {
  const CATEGORIES = getCategoriesWithCount();
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  return {
    title: cat.label,
    description: cat.description,
    alternates: { canonical: `/tools/${cat.slug}` },
  };
}

export default async function CategoryToolsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const baseCat = getCategoryBySlug(category);
  if (!baseCat) notFound();

  // Get category with count
  const CATEGORIES = getCategoriesWithCount();
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const tools = getToolsByCategory(cat.slug);

  return (
    <>
      <div
        className="ctp-page"
        style={{
          "--cat-color": cat.color,
          "--cat-color-dark": cat.colorDark,
          "--cat-bg": cat.bgLight,
          "--cat-bg-dark": cat.bgDark,
        } as React.CSSProperties}
      >
        <CategoryToolsHeader category={cat} />

        <div className="ctp-body">
          <div className="ctp-body-inner">
            <CategoryToolsGrid tools={tools} />
            <CategoryToolsSidebar currentCategory={cat} />
          </div>
        </div>
      </div>

      <style>{`
        .ctp-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .ctp-body {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }

        .ctp-body-inner {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 32px;
          align-items: flex-start;
        }

        @media (max-width: 1280px) {
          .ctp-body {
            max-width: 1200px;
          }
        }

        @media (max-width: 1024px) {
          .ctp-body {
            padding-left: 24px;
            padding-right: 24px;
          }
          .ctp-body-inner {
            grid-template-columns: 1fr 220px;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .ctp-body {
            padding: 0 20px 60px;
          }
          .ctp-body-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}