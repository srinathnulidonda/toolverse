// components/categories/CategoriesHeader.tsx
export default function CategoriesHeader() {
  return (
    <>
      <header className="ch-root">
        <div className="ch-inner">
          <div className="ch-icon-wrap">
            <i className="ti ti-category" aria-hidden="true" />
          </div>
          <div className="ch-title-group">
            <h1 className="ch-title">Categories</h1>
            <p className="ch-subtitle">
              Browse all tools grouped by what you need to do.
            </p>
          </div>
        </div>
      </header>

      <style>{`
        .ch-root {
          background: var(--bg);
          padding: 40px 40px 32px;
        }

        .ch-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .ch-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ch-icon-wrap i {
          font-size: 18px;
          color: var(--text-secondary);
        }

        .ch-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .ch-title {
          font-size: clamp(20px, 2.5vw, 26px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.6px;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-sans);
        }

        .ch-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
          font-family: var(--font-sans);
        }

        @media (max-width: 1024px) {
          .ch-root {
            padding: 32px 24px;
          }
        }

        @media (max-width: 640px) {
          .ch-root {
            padding: 24px 20px 20px;
          }
          .ch-inner {
            gap: 10px;
          }
          .ch-icon-wrap {
            width: 36px;
            height: 36px;
          }
          .ch-icon-wrap i {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}