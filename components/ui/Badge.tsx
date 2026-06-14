// components/ui/Badge.tsx
import React from "react";

type BadgeVariant = "popular" | "new" | "beta" | "default";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <>
      <span className={`badge badge-${variant} ${className}`} {...props}>
        {children}
      </span>

      <style>{`
        .badge {
          display: inline-flex;
          align-items: center;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: var(--font-sans);
        }

        .badge-popular {
          background: #fdf3e7;
          color: #b45309;
        }
        @media (prefers-color-scheme: dark) {
          .badge-popular { background: #2a1500; color: #fbbf24; }
        }

        .badge-new {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .badge-beta {
          background: var(--bg-surface);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
        }

        .badge-default {
          background: var(--bg-surface);
          color: var(--text-secondary);
        }
      `}</style>
    </>
  );
}