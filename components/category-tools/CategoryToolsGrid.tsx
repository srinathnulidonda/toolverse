// components/category-tools/CategoryToolsGrid.tsx
import type { Tool } from "@/lib/tools";
import CategoryToolCard from "./CategoryToolCard";

type CategoryToolsGridProps = {
    tools: Tool[];
};

export default function CategoryToolsGrid({ tools }: CategoryToolsGridProps) {
    const popular = tools.filter((t) => t.badge === "popular");
    const newTools = tools.filter((t) => t.badge === "new");
    const rest = tools.filter((t) => !t.badge);

    return (
        <>
            <div className="ctg-root">
                {/* Popular section */}
                {popular.length > 0 && (
                    <section className="ctg-section">
                        <div className="ctg-section-header">
                            <div className="ctg-badge ctg-badge-popular">
                                <i className="ti ti-flame" aria-hidden="true" />
                                Popular
                            </div>
                            <div className="ctg-line" />
                        </div>
                        <div className="ctg-grid">
                            {popular.map((tool) => (
                                <CategoryToolCard key={tool.slug} tool={tool} />
                            ))}
                        </div>
                    </section>
                )}

                {/* New section */}
                {newTools.length > 0 && (
                    <section className="ctg-section">
                        <div className="ctg-section-header">
                            <div className="ctg-badge ctg-badge-new">
                                <i className="ti ti-sparkles" aria-hidden="true" />
                                New
                            </div>
                            <div className="ctg-line" />
                        </div>
                        <div className="ctg-grid">
                            {newTools.map((tool) => (
                                <CategoryToolCard key={tool.slug} tool={tool} />
                            ))}
                        </div>
                    </section>
                )}

                {/* All tools section */}
                {rest.length > 0 && (
                    <section className="ctg-section">
                        <div className="ctg-section-header">
                            <div className="ctg-badge ctg-badge-all">
                                <i className="ti ti-grid-4x4" aria-hidden="true" />
                                All tools
                            </div>
                            <div className="ctg-line" />
                        </div>
                        <div className="ctg-grid">
                            {rest.map((tool) => (
                                <CategoryToolCard key={tool.slug} tool={tool} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Fallback if no badges */}
                {popular.length === 0 && newTools.length === 0 && (
                    <div className="ctg-grid">
                        {tools.map((tool) => (
                            <CategoryToolCard key={tool.slug} tool={tool} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        .ctg-root {
          display: flex;
          flex-direction: column;
          gap: 36px;
          min-width: 0;
        }

        .ctg-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ctg-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ctg-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 99px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: var(--font-sans);
        }
        .ctg-badge i {
          font-size: 11px;
        }

        .ctg-badge-popular {
          background: #fdf3e7;
          color: #b45309;
          border: 0.5px solid #f5d08a;
        }
        @media (prefers-color-scheme: dark) {
          .ctg-badge-popular {
            background: #2a1500;
            color: #fbbf24;
            border-color: #78350f;
          }
        }

        .ctg-badge-new {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .ctg-badge-all {
          background: var(--bg-surface);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
        }

        .ctg-line {
          flex: 1;
          height: 0.5px;
          background: var(--border);
        }

        .ctg-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        @media (max-width: 768px) {
          .ctg-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </>
    );
}