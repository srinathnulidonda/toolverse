// components/category-tools/CategoryToolCard.tsx
import Link from "next/link";
import type { Tool } from "@/lib/tools";

export default function CategoryToolCard({ tool }: { tool: Tool }) {
  return (
    <>
      <Link href={tool.href} className="ctc-root">
        <div className="ctc-ico">
          <i className={`ti ${tool.icon}`} aria-hidden="true" />
        </div>
        <div className="ctc-body">
          <span className="ctc-name">{tool.label}</span>
          <p className="ctc-desc">{tool.description}</p>
        </div>
        <i className="ti ti-arrow-right ctc-arr" aria-hidden="true" />
      </Link>
      <style>{`
        .ctc-root {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 16px; background: var(--bg-card);
          border: 0.5px solid var(--border); border-radius: 12px;
          text-decoration: none; transition: background 0.12s, border-color 0.12s;
        }
        .ctc-root:hover { background: var(--bg-surface); text-decoration: none; }
        .ctc-root:hover .ctc-arr { opacity: 1; transform: translateX(0); }
        .ctc-root:hover .ctc-ico { background: var(--brand-light); border-color: var(--brand-border); }
        .ctc-root:hover .ctc-ico i { color: var(--brand); }
        .ctc-ico {
          width: 36px; height: 36px; border-radius: 9px;
          background: var(--bg-surface); border: 0.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.12s, border-color 0.12s;
        }
        .ctc-ico i { font-size: 16px; color: var(--text-secondary); transition: color 0.12s; }
        .ctc-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .ctc-name {
          font-size: 13px; font-weight: 600; color: var(--text);
          letter-spacing: -0.15px; line-height: 1.3; font-family: var(--font-sans);
        }
        .ctc-desc {
          font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          font-family: var(--font-sans);
        }
        .ctc-arr {
          font-size: 13px; color: var(--text-disabled); flex-shrink: 0;
          margin-top: 2px; opacity: 0; transform: translateX(-4px);
          transition: opacity 0.15s, transform 0.15s;
        }
      `}</style>
    </>
  );
}
