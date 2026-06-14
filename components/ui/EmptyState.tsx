// components/ui/EmptyState.tsx
import React from "react";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <>
            <div className="empty-state">
                {icon && <div className="empty-state-icon">{icon}</div>}
                <h3 className="empty-state-title">{title}</h3>
                {description && <p className="empty-state-desc">{description}</p>}
                {action && <div className="empty-state-action">{action}</div>}
            </div>

            <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          gap: 12px;
        }

        .empty-state-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .empty-state-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
          letter-spacing: -0.3px;
        }

        .empty-state-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          max-width: 320px;
          font-family: var(--font-sans);
          line-height: 1.6;
        }

        .empty-state-action {
          margin-top: 8px;
        }
      `}</style>
        </>
    );
}