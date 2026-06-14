// components/ui/Button.tsx
import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
}

export default function Button({
    variant = "primary",
    size = "md",
    icon,
    children,
    className = "",
    ...props
}: ButtonProps) {
    return (
        <>
            <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
                {icon && <span className="btn-icon">{icon}</span>}
                {children}
            </button>

            <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          text-decoration: none;
        }

        /* Sizes */
        .btn-sm { height: 28px; padding: 0 10px; font-size: 11px; }
        .btn-md { height: 36px; padding: 0 14px; font-size: 13px; }
        .btn-lg { height: 44px; padding: 0 18px; font-size: 14px; }

        /* Variants */
        .btn-primary {
          background: var(--brand);
          color: #fff;
        }
        .btn-primary:hover {
          background: var(--brand-hover);
        }

        .btn-secondary {
          background: var(--bg-surface);
          color: var(--text);
          border: 0.5px solid var(--border);
        }
        .btn-secondary:hover {
          background: var(--border);
        }

        .btn-ghost {
          background: transparent;
          color: var(--text-secondary);
          border: 0.5px solid var(--border);
        }
        .btn-ghost:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .btn-icon { font-size: 0.9em; }
      `}</style>
        </>
    );
}