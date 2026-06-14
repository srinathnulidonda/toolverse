// components/categories/CategoriesCTA.tsx
import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function CategoriesCTA() {
  return (
    <>
      <div className="cat-cta">
        <p className="cat-cta-text">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <Link href="/tools" className="cat-cta-link">
          <i className="ti ti-layout-grid" aria-hidden="true" />
          View all {TOOLS.length} tools
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>

      <style>{`
        .cat-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          max-width: 720px;
          margin: 0 auto;
          padding: 20px 28px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
        }

        .cat-cta-text {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          font-family: var(--font-sans);
        }

        .cat-cta-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 500;
          color: var(--brand);
          text-decoration: none;
          font-family: var(--font-sans);
          padding: 8px 14px;
          border-radius: var(--radius-md);
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .cat-cta-link:hover {
          opacity: 0.85;
          text-decoration: none;
        }
        .cat-cta-link i {
          font-size: 13px;
        }

        @media (max-width: 640px) {
          .cat-cta {
            flex-direction: column;
            gap: 14px;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}