// app/tools/[category]/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  TOOLS,
  getCategoriesWithCount,
  getToolBySlug,
  getToolsByCategory,
} from "@/lib/tools";
import ToolHeader from "@/components/tool/ToolHeader";
import ToolWorkspace from "@/components/tool/ToolWorkspace";
import ToolSidebar from "@/components/tool/ToolSidebar";
import RecentToolTracker from "@/components/tool/RecentToolTracker";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    category: tool.category,
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const tool = getToolBySlug(category, slug);
  if (!tool) return {};
  return {
    title: tool.label,
    description: tool.description,
    alternates: { canonical: `/tools/${category}/${slug}` },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const tool = getToolBySlug(category, slug);
  if (!tool) notFound();

  const CATEGORIES = getCategoriesWithCount();
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const related = getToolsByCategory(category)
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