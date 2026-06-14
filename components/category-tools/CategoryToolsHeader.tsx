// components/category-tools/CategoryToolsHeader.tsx
import type { CategoryWithCount } from "@/lib/tools";

type Props = { category: CategoryWithCount };

export default function CategoryToolsHeader({ category }: Props) {
  return (
    <>
      <div className="cth-root">
        <div className="cth-inner">
          {/* Title row */}
          <div className="cth-title-row">
            <i className={`ti ${category.icon} cth-icon`} aria-hidden="true" />
            <h1 className="cth-title">{category.label}</h1>
          </div>
          <p className="cth-subtitle">{category.description}</p>
        </div>
      </div>

      <style>{`
        .cth-root {
          background: var(--bg);
          padding: 40px 40px 32px;
        }
        .cth-inner {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .cth-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cth-icon {
          font-size: 26px;
          color: var(--text-secondary);
        }

        .cth-title {
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-sans);
        }

        .cth-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          max-width: 560px;
          font-family: var(--font-sans);
        }

        @media (max-width: 1024px) {
          .cth-root {
            padding: 32px 24px;
          }
        }
        @media (max-width: 768px) {
          .cth-root {
            padding: 24px 20px 20px;
          }
        }
      `}</style>
    </>
  );
}