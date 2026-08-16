// components/categories/CategoriesHeader.tsx
import { CATEGORIES } from "@/lib/tools";
import Breadcrumb from "@/components/shared/Breadcrumb";

export default function CategoriesHeader() {
  return (
    <>
      <div className="cth-root">
        <div className="cth-inner">
          <div className="cth-header-row">
            <div className="cth-crumb-col">
              <Breadcrumb items={[{ label: "Categories" }]} inline />
            </div>

            <div className="cth-title-row">
              <i className="ti ti-category cth-icon" aria-hidden="true" />
              <h1 className="cth-title">All Categories</h1>
            </div>

            <div className="cth-spacer" aria-hidden="true" />
          </div>

          <p className="cth-subtitle">
            Browse {CATEGORIES.length} categories of free, browser-based tools.
          </p>
        </div>
      </div>

      <style>{`
        .cth-root {
          background: var(--bg);
          padding: 20px 40px 32px;
        }
        
        .cth-inner {
          max-width: 1600px;
          margin: 0 auto;
        }

        .cth-header-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          column-gap: 20px;
          margin-bottom: 12px;
        }

        .cth-crumb-col {
          justify-self: start;
          min-width: 0;
        }

        .cth-spacer {
          justify-self: end;
        }

        .cth-title-row {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cth-icon {
          font-size: 24px;
          color: var(--text-secondary);
        }

        .cth-title {
          font-size: clamp(20px, 2.6vw, 28px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-sans);
          white-space: nowrap;
        }

        .cth-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 auto;
          max-width: 560px;
          text-align: center;
          font-family: var(--font-sans);
        }

        @media (max-width: 1024px) {
          .cth-root {
            padding: 18px 24px 24px;
          }
        }

        @media (max-width: 860px) {
          .cth-header-row {
            grid-template-columns: 1fr;
            justify-items: center;
            row-gap: 14px;
          }

          .cth-crumb-col,
          .cth-spacer {
            justify-self: center;
          }

          .cth-title {
            white-space: normal;
          }
        }
        
        @media (max-width: 768px) {
          .cth-root {
            padding: 14px 20px 20px;
          }
        }
      `}</style>
    </>
  );
}
