// features/dev/slug-generator/SlugCompare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { generateSlug, analyzeSlug, type SlugOptions } from "./ts/utils";
import styles from "./style/SlugCompare.module.css";

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
      <div className={styles.scRoot}>
        {/*  Comparison Controls  */}
        <div className={styles.scControls}>
          <div className={styles.scModeGroup}>
            <button
              type="button"
              className={`${styles.scModeBtn}${compareMode === "side-by-side" ? ` ${styles.active}` : ""}`}
              onClick={() => setCompareMode("side-by-side")}
            >
              <i className="ti ti-columns" />
              Side by Side
            </button>
            <button
              type="button"
              className={`${styles.scModeBtn}${compareMode === "detailed" ? ` ${styles.active}` : ""}`}
              onClick={() => setCompareMode("detailed")}
            >
              <i className="ti ti-chart-bar" />
              Detailed
            </button>
          </div>

          <div className={styles.scActions}>
            <button
              type="button"
              className={styles.scBtn}
              onClick={handleSwap}
              disabled={!leftInput || !rightInput}
            >
              <i className="ti ti-arrows-left-right" />
              Swap
            </button>
            <button
              type="button"
              className={styles.scBtn}
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
          <div className={styles.scResult}>
            {comparison.identical ? (
              <div className={`${styles.scResultCard} ${styles.identical}`}>
                <div className={styles.scResultIcon}>
                  <i className="ti ti-checks" />
                </div>
                <div className={styles.scResultContent}>
                  <h3 className={styles.scResultTitle}>Identical Slugs</h3>
                  <p className={styles.scResultDesc}>Both inputs generate the same slug</p>
                </div>
              </div>
            ) : (
              <div className={`${styles.scResultCard} ${styles.different}`}>
                <div className={styles.scResultIcon}>
                  <i className="ti ti-git-compare" />
                </div>
                <div className={styles.scResultContent}>
                  <h3 className={styles.scResultTitle}>Different Slugs</h3>
                  <p className={styles.scResultDesc}>
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
              <div className={styles.scDetails}>
                <div className={styles.scDetailGrid}>
                  <div className={styles.scDetailCard}>
                    <div className={styles.scDetailHeader}>
                      <i className="ti ti-trophy" />
                      <span>Winner</span>
                    </div>
                    <div className={styles.scDetailValue}>
                      {comparison.winner === "tie" ? (
                        <span className={styles.scTie}>Tie</span>
                      ) : (
                        <span className={`${styles.scWinner} ${styles[comparison.winner]}`}>
                          {comparison.winner === "left" ? "Left" : "Right"}
                        </span>
                      )}
                    </div>
                    <div className={styles.scDetailLabel}>Based on SEO score</div>
                  </div>

                  <div className={styles.scDetailCard}>
                    <div className={styles.scDetailHeader}>
                      <i className="ti ti-ruler-2" />
                      <span>Length Difference</span>
                    </div>
                    <div className={styles.scDetailValue}>
                      {comparison.lengthDiff > 0 ? "+" : ""}
                      {comparison.lengthDiff}
                    </div>
                    <div className={styles.scDetailLabel}>
                      {comparison.lengthDiff > 0
                        ? "Right is longer"
                        : comparison.lengthDiff < 0
                          ? "Left is longer"
                          : "Same length"}
                    </div>
                  </div>

                  <div className={styles.scDetailCard}>
                    <div className={styles.scDetailHeader}>
                      <i className="ti ti-chart-line" />
                      <span>Score Difference</span>
                    </div>
                    <div className={styles.scDetailValue}>
                      {comparison.scoreDiff > 0 ? "+" : ""}
                      {comparison.scoreDiff}
                    </div>
                    <div className={styles.scDetailLabel}>
                      {leftAnalysis?.score || 0} vs {rightAnalysis?.score || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/*  Side-by-Side Inputs  */}
        <div className={styles.scInputs}>
          <div className={styles.scInputPanel}>
            <div className={styles.scInputHeader}>
              <div className={styles.scInputLabel}>
                <i className="ti ti-arrow-left" />
                Left Side
              </div>
              {leftAnalysis && (
                <div className={`${styles.scScoreBadge} ${styles[leftAnalysis.readability]}`}>
                  {leftAnalysis.score}
                </div>
              )}
            </div>
            <textarea
              className={styles.scTextarea}
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Enter first text..."
              spellCheck={false}
            />
            {leftSlug && (
              <div className={styles.scSlugPreview}>
                <span className={styles.scSlugLabel}>Slug:</span>
                <code className={styles.scSlugValue}>{leftSlug}</code>
              </div>
            )}
          </div>

          <div className={styles.scVs}>
            <div className={styles.scVsIcon}>
              <span>VS</span>
            </div>
          </div>

          <div className={styles.scInputPanel}>
            <div className={styles.scInputHeader}>
              <div className={styles.scInputLabel}>
                <i className="ti ti-arrow-right" />
                Right Side
              </div>
              {rightAnalysis && (
                <div className={`${styles.scScoreBadge} ${styles[rightAnalysis.readability]}`}>
                  {rightAnalysis.score}
                </div>
              )}
            </div>
            <textarea
              className={styles.scTextarea}
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Enter second text..."
              spellCheck={false}
            />
            {rightSlug && (
              <div className={styles.scSlugPreview}>
                <span className={styles.scSlugLabel}>Slug:</span>
                <code className={styles.scSlugValue}>{rightSlug}</code>
              </div>
            )}
          </div>
        </div>

        {/*  Empty State  */}
        {!leftInput && !rightInput && (
          <div className={styles.scEmpty}>
            <div className={styles.scEmptyIcon}>
              <i className="ti ti-git-compare" />
            </div>
            <p className={styles.scEmptyTitle}>Compare Two Slugs</p>
            <p className={styles.scEmptyDesc}>
              Enter two different texts above to compare their generated slugs and SEO quality
            </p>
          </div>
        )}
      </div>
    </>
  );
}