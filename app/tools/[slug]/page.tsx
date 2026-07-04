// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  TOOLS,
  getCategoriesWithCount,
  getCategoryBySlug,
  getToolsByCategory,
} from "@/lib/tools";
import ToolHeader from "@/components/tool/ToolHeader";
import ToolWorkspace from "@/components/tool/ToolWorkspace";
import ToolSidebar from "@/components/tool/ToolSidebar";
import RecentToolTracker from "@/components/tool/RecentToolTracker";
import CategoryToolsHeader from "@/components/category-tools/CategoryToolsHeader";
import CategoryToolsGrid from "@/components/category-tools/CategoryToolsGrid";
import CategoryToolsSidebar from "@/components/category-tools/CategoryToolsSidebar";

export function generateStaticParams(): { slug: string }[] {
  const CATEGORIES = getCategoriesWithCount();
  return [
    ...CATEGORIES.map((cat) => ({ slug: cat.slug })),
    ...TOOLS.map((tool) => ({ slug: tool.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const CATEGORIES = getCategoriesWithCount();

  // Check if it's a category
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (category) {
    return {
      title: category.label,
      description: category.description,
      alternates: { canonical: `/tools/${category.slug}` },
    };
  }

  // Otherwise, check if it's a tool
  const tool = TOOLS.find((t) => t.slug === slug);
  if (tool) {
    return {
      title: tool.label,
      description: tool.description,
      alternates: { canonical: tool.href },
    };
  }

  // If neither, return empty metadata (will cause 404 in component)
  return {};
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const CATEGORIES = getCategoriesWithCount();

  // Check if it's a category
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (category) {
    // Render category page
    const baseCat = getCategoryBySlug(slug);
    if (!baseCat) notFound();

    const tools = getToolsByCategory(slug);

    return (
      <>
        <div
          className="ctp-page"
          style={{
            "--cat-color": category.color,
            "--cat-color-dark": category.colorDark,
            "--cat-bg": category.bgLight,
            "--cat-bg-dark": category.bgDark,
          } as React.CSSProperties}
        >
          <CategoryToolsHeader category={category} />

          <div className="ctp-body">
            <div className="ctp-body-inner">
              <CategoryToolsGrid tools={tools} />
              <CategoryToolsSidebar currentCategory={category} />
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

  // Otherwise, treat as a tool
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();

  const cat = CATEGORIES.find((c) => c.slug === tool.category);
  if (!cat) notFound();

  const related = getToolsByCategory(tool.category)
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 4);

  return (
    <>
      <RecentToolTracker slug={tool.slug} />

      <div
        className="tp-page"
        style={{
          "--cat-color": cat.color,
          "--cat-color-dark": cat.colorDark,
          "--cat-bg": cat.bgLight,
          "--cat-bg-dark": cat.bgDark,
        } as React.CSSProperties}
      >
        <ToolHeader tool={tool} category={cat} />

        <div className="tp-body">
          <div className="tp-body-inner">
            <ToolWorkspace tool={tool} />
            <ToolSidebar tool={tool} category={cat} relatedTools={related} />
          </div>
        </div>
      </div>

      <style>{`
        .tp-page {
          min-height: 100vh;
          background: var(--bg);
        }

        .tp-body {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }

        .tp-body-inner {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 32px;
          align-items: flex-start;
        }

        @media (max-width: 1280px) {
          .tp-body {
            max-width: 1200px;
          }
        }

        @media (max-width: 1024px) {
          .tp-body {
            padding-left: 24px;
            padding-right: 24px;
          }
          .tp-body-inner {
            grid-template-columns: 1fr 240px;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .tp-body {
            padding: 0 20px 60px;
          }
          .tp-body-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}