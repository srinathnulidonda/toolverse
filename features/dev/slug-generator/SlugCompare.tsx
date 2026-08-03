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
    </>
  );
}
