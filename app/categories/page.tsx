// app/categories/page.tsx
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/tools";
import CategoriesHeader from "@/components/categories/CategoriesHeader";
import CategoriesGrid from "@/components/categories/CategoriesGrid";
import CategoriesCTA from "@/components/categories/CategoriesCTA";

export const metadata: Metadata = {
  title: "All Categories",
  description:
    "Browse 51 free browser-based tools organized by category — PDF, Image, Developer, Finance, Resume, and Social tools.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <>
      <div className="cat-page">
        <CategoriesHeader />
        <div className="cat-page-body">
          <CategoriesGrid categories={CATEGORIES} />
          <CategoriesCTA />
        </div>
      </div>

      <style>{`
        .cat-page {
          min-height: 100vh;
          background: var(--bg);
        }
        .cat-page-body {
          max-width: 1600px;
          margin: 0 auto;
          padding: 40px 40px 80px;
        }
        @media (max-width: 1280px) {
          .cat-page-body {
            max-width: 1200px;
          }
        }
        @media (max-width: 1024px) {
          .cat-page-body {
            padding-left: 24px;
            padding-right: 24px;
          }
        }
        @media (max-width: 640px) {
          .cat-page-body {
            padding: 24px 20px 60px;
          }
        }
      `}</style>
    </>
  );
}