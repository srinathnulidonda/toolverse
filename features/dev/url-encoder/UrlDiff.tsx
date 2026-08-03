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
    </>
  );
}
