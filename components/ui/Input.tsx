// components/ui/Section.tsx
import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default function Section({
  title,
  description,
  children,
  className = "",
  ...props
}: SectionProps) {
  return (
    <>
      <section className={`section ${className}`} {...props}>
        {(title || description) && (
          <div className="section-header">
            {title && <h2 className="section-title">{title}</h2>}
            {description && <p className="section-desc">{description}</p>}
          </div>
        )}
        <div className="section-body">{children}</div>
      </section>

      <style>{`
        .section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
          letter-spacing: -0.5px;
        }

        .section-desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          font-family: var(--font-sans);
          line-height: 1.6;
        }

        .section-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>
    </>
  );
}
