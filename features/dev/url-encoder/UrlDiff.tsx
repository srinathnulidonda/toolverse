// features/dev/url-encoder/UrlDiff.tsx
"use client";

import { useMemo } from "react";
import { diffChars, type DiffChar } from "./utils";

interface UrlDiffProps {
  input: string;
  output: string;
}

export default function UrlDiff({ input, output }: UrlDiffProps) {
  const diff = useMemo(() => {
    if (!input || !output) return null;
    return diffChars(input, output);
  }, [input, output]);

  if (!diff) {
    return (
      <div className="ud-empty">
        <div className="ud-empty-icon">
          <i className="ti ti-git-compare" />
        </div>
        <p className="ud-empty-title">Character diff</p>
        <p className="ud-empty-desc">Enter a URL to see input vs output side-by-side</p>
      </div>
    );
  }

  const stats = {
    total: diff.input.length,
    changed: diff.input.filter((c) => c.changed).length,
    unchanged: diff.input.filter((c) => !c.changed).length,
    percentChanged:
      diff.input.length > 0
        ? Math.round((diff.input.filter((c) => c.changed).length / diff.input.length) * 100)
        : 0,
  };

  return (
    <>
      <div className="ud-root">
        {/* Stats Header */}
        <div className="ud-stats">
          <div className="ud-stat-card">
            <span className="ud-stat-label">Total chars</span>
            <span className="ud-stat-value">{stats.total.toLocaleString()}</span>
          </div>
          <div className="ud-stat-card">
            <span className="ud-stat-label">Changed</span>
            <span className="ud-stat-value changed">{stats.changed.toLocaleString()}</span>
          </div>
          <div className="ud-stat-card">
            <span className="ud-stat-label">Unchanged</span>
            <span className="ud-stat-value unchanged">{stats.unchanged.toLocaleString()}</span>
          </div>
          <div className="ud-stat-card">
            <span className="ud-stat-label">% Changed</span>
            <span className="ud-stat-value">{stats.percentChanged}%</span>
          </div>
        </div>

        {/* Diff Tracks */}
        <div className="ud-diff-inner">
          <div className="ud-diff-track">
            <span className="ud-diff-rail input">INPUT</span>
            <div className="ud-diff-chars">
              {diff.input.map((c, i) => (
                <span key={i} className={`ud-char${c.changed ? " removed" : ""}`}>
                  {c.char === " " ? "·" : c.char}
                </span>
              ))}
            </div>
          </div>
          <div className="ud-diff-track">
            <span className="ud-diff-rail output">OUTPUT</span>
            <div className="ud-diff-chars">
              {diff.output.map((c, i) => (
                <span key={i} className={`ud-char${c.changed ? " added" : ""}`}>
                  {c.char === " " ? "·" : c.char}
                </span>
              ))}
            </div>
          </div>
          <div className="ud-diff-legend">
            <span className="ud-legend-item removed">
              <span className="ud-legend-swatch" />
              Original chars changed
            </span>
            <span className="ud-legend-item added">
              <span className="ud-legend-swatch" />
              New or modified chars
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ud-root {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        /*  Empty State  */
        .ud-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .ud-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-disabled);
          margin-bottom: 6px;
        }

        .ud-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .ud-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 320px;
          line-height: 1.6;
        }

        /*  Stats  */
        .ud-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 16px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .ud-stat-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
        }

        .ud-stat-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
        }

        .ud-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .ud-stat-value.changed {
          color: #f59e0b;
        }

        .ud-stat-value.unchanged {
          color: var(--brand);
        }

        /*  Diff  */
        .ud-diff-inner {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ud-diff-track {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .ud-diff-rail {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          font-family: var(--font-mono);
          padding: 4px 7px;
          border-radius: 5px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .ud-diff-rail.input {
          background: var(--bg-surface);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
        }

        .ud-diff-rail.output {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .ud-diff-chars {
          display: flex;
          flex-wrap: wrap;
          gap: 1px;
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.8;
        }

        .ud-char {
          color: var(--text-secondary);
        }

        .ud-char.removed {
          background: #fffbeb;
          color: #92400e;
          border-radius: 2px;
          padding: 0 2px;
        }

        @media (prefers-color-scheme: dark) {
          .ud-char.removed {
            background: #1c1400;
            color: #fcd34d;
          }
        }

        .ud-char.added {
          background: #f0fdf4;
          color: #166534;
          border-radius: 2px;
          padding: 0 2px;
        }

        @media (prefers-color-scheme: dark) {
          .ud-char.added {
            background: #052e16;
            color: #4ade80;
          }
        }

        /*  Legend  */
        .ud-diff-legend {
          display: flex;
          gap: 16px;
          padding-top: 8px;
          border-top: 0.5px solid var(--border);
          flex-wrap: wrap;
        }

        .ud-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .ud-legend-swatch {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .ud-legend-item.removed .ud-legend-swatch {
          background: #fffbeb;
          border: 0.5px solid #fde68a;
        }

        @media (prefers-color-scheme: dark) {
          .ud-legend-item.removed .ud-legend-swatch {
            background: #1c1400;
            border-color: #78350f;
          }
        }

        .ud-legend-item.added .ud-legend-swatch {
          background: #f0fdf4;
          border: 0.5px solid #bbf7d0;
        }

        @media (prefers-color-scheme: dark) {
          .ud-legend-item.added .ud-legend-swatch {
            background: #052e16;
            border-color: #166534;
          }
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .ud-stats {
            grid-template-columns: repeat(2, 1fr);
            padding: 12px;
          }

          .ud-diff-inner {
            padding: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
