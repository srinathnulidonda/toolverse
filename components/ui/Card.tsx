// components/ui/Card.tsx
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
    return (
        <>
            <div className={`card ${className}`} {...props}>
                {children}
            </div>

            <style>{`
        .card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          transition: box-shadow 0.15s, transform 0.12s;
        }
        .card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }
      `}</style>
        </>
    );
}