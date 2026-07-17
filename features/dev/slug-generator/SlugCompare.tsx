// features/dev/slug-generator/SlugCompare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { generateSlug, analyzeSlug, type SlugOptions } from "./utils";

interface SlugCompareProps {
  options: SlugOptions;
}

export default function SlugCompare({ options }: SlugCompareProps) {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [compareMode, setCompareMode] = useState<"side-by-side" | "detailed">("side-by-side");

  const leftSlug = useMemo(() => {
    if (!leftInput.trim()) return "";
    return generateSlug(leftInput, options);
  }, [leftInput, options]);

  const rightSlug = useMemo(() => {
    if (!rightInput.trim()) return "";
    return generateSlug(rightInput, options);
  }, [rightInput, options]);

  const leftAnalysis = useMemo(() => {
    if (!leftSlug) return null;
    return analyzeSlug(leftSlug, leftInput);
  }, [leftSlug, leftInput]);

  const rightAnalysis = useMemo(() => {
    if (!rightSlug) return null;
    return analyzeSlug(rightSlug, rightInput);
  }, [rightSlug, rightInput]);

  const comparison = useMemo(() => {
    if (!leftSlug || !rightSlug) return null;

    const identical = leftSlug === rightSlug;
    const lengthDiff = rightSlug.length - leftSlug.length;
    const scoreDiff = (rightAnalysis?.score || 0) - (leftAnalysis?.score || 0);

    let winner: "left" | "right" | "tie" = "tie";
    if (scoreDiff > 0) winner = "right";
    else if (scoreDiff < 0) winner = "left";

    return {
      identical,
      lengthDiff,
      scoreDiff,
      winner,
      leftScore: leftAnalysis?.score || 0,
      rightScore: rightAnalysis?.score || 0,
    };
  }, [leftSlug, rightSlug, leftAnalysis, rightAnalysis]);

  const handleSwap = useCallback(() => {
    const tempInput = leftInput;
    setLeftInput(rightInput);
    setRightInput(tempInput);
  }, [leftInput, rightInput]);

  const handleClear = useCallback(() => {
    setLeftInput("");
    setRightInput("");
  }, []);

  return (
    <>
      <div className="sc-root">
        {/*  Comparison Controls  */}
        <div className="sc-controls">
          <div className="sc-mode-group">
            <button
              type="button"
              className={`sc-mode-btn${compareMode === "side-by-side" ? " active" : ""}`}
              onClick={() => setCompareMode("side-by-side")}
            >
              <i className="ti ti-columns" />
              Side by Side
            </button>
            <button
              type="button"
              className={`sc-mode-btn${compareMode === "detailed" ? " active" : ""}`}
              onClick={() => setCompareMode("detailed")}
            >
              <i className="ti ti-chart-bar" />
              Detailed
            </button>
          </div>

          <div className="sc-actions">
            <button
              type="button"
              className="sc-btn"
              onClick={handleSwap}
              disabled={!leftInput || !rightInput}
            >
              <i className="ti ti-arrows-left-right" />
              Swap
            </button>
            <button
              type="button"
              className="sc-btn"
              onClick={handleClear}
              disabled={!leftInput && !rightInput}
            >
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        </div>

        {/*  Comparison Result  */}
        {comparison && (
          <div className="sc-result">
            {comparison.identical ? (
              <div className="sc-result-card identical">
                <div className="sc-result-icon">
                  <i className="ti ti-checks" />
                </div>
                <div className="sc-result-content">
                  <h3 className="sc-result-title">Identical Slugs</h3>
                  <p className="sc-result-desc">Both inputs generate the same slug</p>
                </div>
              </div>
            ) : (
              <div className="sc-result-card different">
                <div className="sc-result-icon">
                  <i className="ti ti-git-compare" />
                </div>
                <div className="sc-result-content">
                  <h3 className="sc-result-title">Different Slugs</h3>
                  <p className="sc-result-desc">
                    {comparison.winner === "tie"
                      ? "Both slugs have equal SEO scores"
                      : comparison.winner === "left"
                        ? "Left slug has better SEO score"
                        : "Right slug has better SEO score"}
                  </p>
                </div>
              </div>
            )}

            {compareMode === "detailed" && !comparison.identical && (
              <div className="sc-details">
                <div className="sc-detail-grid">
                  <div className="sc-detail-card">
                    <div className="sc-detail-header">
                      <i className="ti ti-trophy" />
                      <span>Winner</span>
                    </div>
                    <div className="sc-detail-value">
                      {comparison.winner === "tie" ? (
                        <span className="sc-tie">Tie</span>
                      ) : (
                        <span className={`sc-winner ${comparison.winner}`}>
                          {comparison.winner === "left" ? "Left" : "Right"}
                        </span>
                      )}
                    </div>
                    <div className="sc-detail-label">Based on SEO score</div>
                  </div>

                  <div className="sc-detail-card">
                    <div className="sc-detail-header">
                      <i className="ti ti-ruler-2" />
                      <span>Length Difference</span>
                    </div>
                    <div className="sc-detail-value">
                      {comparison.lengthDiff > 0 ? "+" : ""}
                      {comparison.lengthDiff}
                    </div>
                    <div className="sc-detail-label">
                      {comparison.lengthDiff > 0
                        ? "Right is longer"
                        : comparison.lengthDiff < 0
                          ? "Left is longer"
                          : "Same length"}
                    </div>
                  </div>

                  <div className="sc-detail-card">
                    <div className="sc-detail-header">
                      <i className="ti ti-chart-line" />
                      <span>Score Difference</span>
                    </div>
                    <div className="sc-detail-value">
                      {comparison.scoreDiff > 0 ? "+" : ""}
                      {comparison.scoreDiff}
                    </div>
                    <div className="sc-detail-label">
                      {leftAnalysis?.score || 0} vs {rightAnalysis?.score || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/*  Side-by-Side Inputs  */}
        <div className="sc-inputs">
          <div className="sc-input-panel">
            <div className="sc-input-header">
              <div className="sc-input-label">
                <i className="ti ti-arrow-left" />
                Left Side
              </div>
              {leftAnalysis && (
                <div className={`sc-score-badge ${leftAnalysis.readability}`}>
                  {leftAnalysis.score}
                </div>
              )}
            </div>
            <textarea
              className="sc-textarea"
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Enter first text..."
              spellCheck={false}
            />
            {leftSlug && (
              <div className="sc-slug-preview">
                <span className="sc-slug-label">Slug:</span>
                <code className="sc-slug-value">{leftSlug}</code>
              </div>
            )}
          </div>

          <div className="sc-vs">
            <div className="sc-vs-icon">
              <span>VS</span>
            </div>
          </div>

          <div className="sc-input-panel">
            <div className="sc-input-header">
              <div className="sc-input-label">
                <i className="ti ti-arrow-right" />
                Right Side
              </div>
              {rightAnalysis && (
                <div className={`sc-score-badge ${rightAnalysis.readability}`}>
                  {rightAnalysis.score}
                </div>
              )}
            </div>
            <textarea
              className="sc-textarea"
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Enter second text..."
              spellCheck={false}
            />
            {rightSlug && (
              <div className="sc-slug-preview">
                <span className="sc-slug-label">Slug:</span>
                <code className="sc-slug-value">{rightSlug}</code>
              </div>
            )}
          </div>
        </div>

        {/*  Empty State  */}
        {!leftInput && !rightInput && (
          <div className="sc-empty">
            <div className="sc-empty-icon">
              <i className="ti ti-git-compare" />
            </div>
            <p className="sc-empty-title">Compare Two Slugs</p>
            <p className="sc-empty-desc">
              Enter two different texts above to compare their generated slugs and SEO quality
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .sc-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        /*  Controls  */
        .sc-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--sg-radius-lg, 12px);
          flex-wrap: wrap;
        }

        .sc-mode-group {
          display: flex;
          gap: 4px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--sg-radius-md, 8px);
          padding: 2px;
        }

        .sc-mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 12px;
          border: none;
          border-radius: calc(var(--sg-radius-md, 8px) - 2px);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .sc-mode-btn i {
          font-size: 12px;
        }

        .sc-mode-btn:hover {
          color: var(--text);
        }

        .sc-mode-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .sc-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sc-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--sg-radius-md, 8px);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .sc-btn i {
          font-size: 12px;
        }

        .sc-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .sc-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /*  Result  */
        .sc-result {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sc-result-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border-radius: var(--sg-radius-lg, 12px);
          border: 0.5px solid;
        }

        .sc-result-card.identical {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .sc-result-card.different {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        @media (prefers-color-scheme: dark) {
          .sc-result-card.different {
            background: #0a1628;
            border-color: #1e3a5f;
          }
        }

        .sc-result-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .sc-result-card.identical .sc-result-icon {
          background: var(--brand);
          color: white;
        }

        .sc-result-card.different .sc-result-icon {
          background: #dbeafe;
          color: #1d4ed8;
        }

        @media (prefers-color-scheme: dark) {
          .sc-result-card.different .sc-result-icon {
            background: #1e3a8a;
            color: #93c5fd;
          }
        }

        .sc-result-content {
          flex: 1;
        }

        .sc-result-title {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .sc-result-card.identical .sc-result-title {
          color: var(--brand-text);
        }

        .sc-result-card.different .sc-result-title {
          color: #1d4ed8;
        }

        @media (prefers-color-scheme: dark) {
          .sc-result-card.different .sc-result-title {
            color: #93c5fd;
          }
        }

        .sc-result-desc {
          font-size: 12px;
          margin: 0;
        }

        .sc-result-card.identical .sc-result-desc {
          color: var(--brand-text);
          opacity: 0.8;
        }

        .sc-result-card.different .sc-result-desc {
          color: #1d4ed8;
          opacity: 0.8;
        }

        @media (prefers-color-scheme: dark) {
          .sc-result-card.different .sc-result-desc {
            color: #93c5fd;
          }
        }

        /*  Details  */
        .sc-details {
          padding: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--sg-radius-lg, 12px);
        }

        .sc-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .sc-detail-card {
          padding: 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--sg-radius-md, 8px);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sc-detail-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .sc-detail-header i {
          font-size: 11px;
        }

        .sc-detail-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }

        .sc-detail-label {
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .sc-winner {
          color: var(--brand);
        }

        .sc-tie {
          color: var(--text-secondary);
        }

        /*  Inputs  */
        .sc-inputs {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          flex: 1;
          min-height: 0;
        }

        .sc-input-panel {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--sg-radius-lg, 12px);
          overflow: hidden;
          min-height: 0;
        }

        .sc-input-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 10px;
        }

        .sc-input-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sc-input-label i {
          font-size: 11px;
        }

        .sc-score-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 22px;
          padding: 0 8px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
        }

        .sc-score-badge.excellent {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .sc-score-badge.good {
          background: #dbeafe;
          color: #1d4ed8;
        }

        @media (prefers-color-scheme: dark) {
          .sc-score-badge.good {
            background: #1e3a8a;
            color: #93c5fd;
          }
        }

        .sc-score-badge.fair {
          background: #fef3c7;
          color: #b45309;
        }

        @media (prefers-color-scheme: dark) {
          .sc-score-badge.fair {
            background: #451a03;
            color: #fcd34d;
          }
        }

        .sc-score-badge.poor {
          background: var(--error-bg);
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .sc-score-badge.poor {
            color: #f87171;
          }
        }

        .sc-textarea {
          flex: 1;
          margin: 0;
          padding: 12px 14px;
          font-family: var(--font-sans);
          font-size: 13px;
          line-height: 1.7;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          resize: none;
          overflow: auto;
          min-height: 150px;
        }

        .sc-textarea::placeholder {
          color: var(--text-disabled);
        }

        .sc-slug-preview {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
        }

        .sc-slug-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .sc-slug-value {
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--brand);
          background: var(--bg-card);
          padding: 6px 10px;
          border-radius: 5px;
          border: 0.5px solid var(--border);
          word-break: break-all;
          font-weight: 500;
        }

        .sc-vs {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sc-vs-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-tertiary);
        }

        /*  Empty State  */
        .sc-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .sc-empty-icon {
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

        .sc-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .sc-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 340px;
          line-height: 1.6;
        }

        /*  Responsive  */
        @media (max-width: 900px) {
          .sc-inputs {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .sc-vs {
            display: none;
          }

          .sc-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .sc-root {
            padding: 12px;
          }

          .sc-controls {
            padding: 8px 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-mode-btn,
          .sc-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
