// components/shared/Breadcrumb.tsx
import Link from "next/link";
import { Fragment } from "react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  inline?: boolean;
};

export default function Breadcrumb({ items, inline = false }: BreadcrumbProps) {
  if (inline) {
    return (
      <>
        <nav className="breadcrumb-inline" aria-label="Breadcrumb">
          <ol className="breadcrumb-inline-list">
            <li className="breadcrumb-inline-item">
              <Link href="/" className="breadcrumb-inline-link">
                Home
              </Link>
            </li>
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <Fragment key={i}>
                  <li className="breadcrumb-inline-separator" aria-hidden="true">
                    /
                  </li>
                  <li className="breadcrumb-inline-item">
                    {isLast || !item.href ? (
                      <span className="breadcrumb-inline-current">{item.label}</span>
                    ) : (
                      <Link href={item.href} className="breadcrumb-inline-link">
                        {item.label}
                      </Link>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </nav>

        <style>{`
          .breadcrumb-inline {
            display: flex;
            min-width: 0;
          }

          .breadcrumb-inline-list {
            display: flex;
            align-items: center;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 6px;
            flex-wrap: wrap;
            min-width: 0;
          }

          .breadcrumb-inline-item {
            display: flex;
            align-items: center;
            min-width: 0;
          }

          .breadcrumb-inline-link {
            position: relative;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-tertiary);
            text-decoration: none;
            font-family: var(--font-sans);
            letter-spacing: -0.1px;
            padding-bottom: 1px;
            white-space: nowrap;
            transition: color 0.18s ease;
          }

          .breadcrumb-inline-link::after {
            content: "";
            position: absolute;
            left: 0;
            right: 100%;
            bottom: -2px;
            height: 1px;
            background: currentColor;
            transition: right 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .breadcrumb-inline-link:hover {
            color: var(--text);
          }

          .breadcrumb-inline-link:hover::after {
            right: 0;
          }

          .breadcrumb-inline-separator {
            font-size: 13px;
            color: var(--text-disabled);
            font-weight: 300;
            user-select: none;
          }

          .breadcrumb-inline-current {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-secondary);
            font-family: var(--font-sans);
            letter-spacing: -0.1px;
            white-space: nowrap;
          }

          @media (max-width: 768px) {
            .breadcrumb-inline-list {
              gap: 5px;
            }

            .breadcrumb-inline-link,
            .breadcrumb-inline-separator,
            .breadcrumb-inline-current {
              font-size: 12px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .breadcrumb-inline-link::after {
              transition: none;
            }
          }
        `}</style>
      </>
    );
  }

  // Original standalone breadcrumb (keep for backward compatibility)
  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <div className="breadcrumb-inner">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/" className="breadcrumb-link breadcrumb-home">
                <i className="ti ti-home" aria-hidden="true" />
              </Link>
            </li>
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <Fragment key={i}>
                  <li className="breadcrumb-separator" aria-hidden="true">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                      <path
                        d="M1 1L5 5L1 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </li>
                  <li className="breadcrumb-item">
                    <Link
                      href={item.href ?? "#"}
                      className={`breadcrumb-link${isLast ? " breadcrumb-current" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </div>
      </nav>

      <style>{`
        .breadcrumb {
          position: relative;
        }

        .breadcrumb-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 12px 0;
          gap: 2px;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
        }

        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-decoration: none;
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          padding: 5px 9px;
          border-radius: 6px;
          position: relative;
          transition: color 0.18s cubic-bezier(0.4, 0, 0.2, 1),
                      background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .breadcrumb-link:hover {
          color: var(--text);
          background: var(--bg-surface);
          text-decoration: none;
        }

        .breadcrumb-link:active {
          transform: scale(0.98);
        }

        .breadcrumb-home {
          padding: 6px;
          border-radius: 6px;
        }

        .breadcrumb-home i {
          font-size: 15px;
          line-height: 1;
        }

        .breadcrumb-separator {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-disabled);
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .breadcrumb-current {
          color: var(--text);
          font-weight: 600;
          position: relative;
        }

        .breadcrumb-current::after {
          content: "";
          position: absolute;
          bottom: 2px;
          left: 9px;
          right: 9px;
          height: 1.5px;
          background: var(--brand);
          border-radius: 1px;
          opacity: 0;
          transform: scaleX(0.7);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .breadcrumb-current:hover {
          color: var(--brand-text);
          background: var(--brand-light);
        }

        .breadcrumb-current:hover::after {
          opacity: 1;
          transform: scaleX(1);
        }

        @media (max-width: 1024px) {
          .breadcrumb-inner {
            padding: 0 24px;
          }
        }

        @media (max-width: 768px) {
          .breadcrumb-inner {
            padding: 0 20px;
          }

          .breadcrumb-list {
            padding: 10px 0;
          }

          .breadcrumb-link {
            font-size: 12.5px;
            padding: 4px 8px;
          }

          .breadcrumb-home {
            padding: 5px;
          }

          .breadcrumb-home i {
            font-size: 14px;
          }

          .breadcrumb-current::after {
            left: 8px;
            right: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .breadcrumb-link,
          .breadcrumb-current::after {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
