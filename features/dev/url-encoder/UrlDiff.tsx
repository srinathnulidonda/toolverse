// features/dev/url-encoder/UrlDiff.tsx
"use client";

import { useMemo } from "react";
import { diffChars, type DiffChar } from "./ts/utils";
import styles from "./style/UrlDiff.module.css";

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
      <div className={styles.udEmpty}>
        <div className={styles.udEmptyIcon}>
          <i className="ti ti-git-compare" />
        </div>
        <p className={styles.udEmptyTitle}>Character diff</p>
        <p className={styles.udEmptyDesc}>Enter a URL to see input vs output side-by-side</p>
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
      <div className={styles.udRoot}>
        {/* Stats Header */}
        <div className={styles.udStats}>
          <div className={styles.udStatCard}>
            <span className={styles.udStatLabel}>Total chars</span>
            <span className={styles.udStatValue}>{stats.total.toLocaleString()}</span>
          </div>
          <div className={styles.udStatCard}>
            <span className={styles.udStatLabel}>Changed</span>
            <span className={`${styles.udStatValue} ${styles.changed}`}>{stats.changed.toLocaleString()}</span>
          </div>
          <div className={styles.udStatCard}>
            <span className={styles.udStatLabel}>Unchanged</span>
            <span className={`${styles.udStatValue} ${styles.unchanged}`}>{stats.unchanged.toLocaleString()}</span>
          </div>
          <div className={styles.udStatCard}>
            <span className={styles.udStatLabel}>% Changed</span>
            <span className={styles.udStatValue}>{stats.percentChanged}%</span>
          </div>
        </div>

        {/* Diff Tracks */}
        <div className={styles.udDiffInner}>
          <div className={styles.udDiffTrack}>
            <span className={`${styles.udDiffRail} ${styles.input}`}>INPUT</span>
            <div className={styles.udDiffChars}>
              {diff.input.map((c, i) => (
                <span key={i} className={`${styles.udChar}${c.changed ? ` ${styles.removed}` : ""}`}>
                  {c.char === " " ? "·" : c.char}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.udDiffTrack}>
            <span className={`${styles.udDiffRail} ${styles.output}`}>OUTPUT</span>
            <div className={styles.udDiffChars}>
              {diff.output.map((c, i) => (
                <span key={i} className={`${styles.udChar}${c.changed ? ` ${styles.added}` : ""}`}>
                  {c.char === " " ? "·" : c.char}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.udDiffLegend}>
            <span className={`${styles.udLegendItem} ${styles.removed}`}>
              <span className={styles.udLegendSwatch} />
              Original chars changed
            </span>
            <span className={`${styles.udLegendItem} ${styles.added}`}>
              <span className={styles.udLegendSwatch} />
              New or modified chars
            </span>
          </div>
        </div>
      </div>
    </>
  );
}