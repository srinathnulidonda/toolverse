// features/dev/diff-checker/DiffStats.tsx
"use client";

import { useMemo } from "react";
import type { DiffResult } from "./ts/diffEngine";
import { formatBytes } from "./ts/diffEngine";
import styles from "./style/DiffStats.module.css";

interface DiffStatsProps {
  originalText: string;
  modifiedText: string;
  result: DiffResult | null;
}

type StatType = "neutral" | "add" | "remove" | "success" | "warning";

export default function DiffStats({
  originalText,
  modifiedText,
  result,
}: DiffStatsProps) {
  const detailedStats = useMemo(() => {
    if (!result) return null;

    const originalBytes = new Blob([originalText]).size;
    const modifiedBytes = new Blob([modifiedText]).size;
    const sizeDiff = modifiedBytes - originalBytes;
    const sizeChangePercent =
      originalBytes > 0 ? Math.round((sizeDiff / originalBytes) * 100) : 0;

    const originalLines = originalText.split("\n").length;
    const modifiedLines = modifiedText.split("\n").length;
    const lineDiff = modifiedLines - originalLines;

    const originalWords = originalText.split(/\s+/).filter(Boolean).length;
    const modifiedWords = modifiedText.split(/\s+/).filter(Boolean).length;
    const wordDiff = modifiedWords - originalWords;

    return {
      files: {
        original: {
          size: originalBytes,
          lines: originalLines,
          words: originalWords,
        },
        modified: {
          size: modifiedBytes,
          lines: modifiedLines,
          words: modifiedWords,
        },
        diff: { size: sizeDiff, lines: lineDiff, words: wordDiff, sizeChangePercent },
      },
      changes: result.stats,
      efficiency: {
        diffRatio:
          result.stats.totalLines > 0
            ? Math.round(
                ((result.stats.added + result.stats.removed) /
                  result.stats.totalLines) *
                  100
              )
            : 0,
        similarity: result.stats.similarity,
      },
    };
  }, [originalText, modifiedText, result]);

  if (!detailedStats) {
    return (
      <div className={styles.dsRoot}>
        <div className={styles.dsEmpty}>
          <div className={styles.dsEmptyIcon}>
            <i className="ti ti-chart-bar" />
          </div>
          <p className={styles.dsEmptyText}>
            Compare files to see detailed statistics
          </p>
        </div>
      </div>
    );
  }

  const getStatClassName = (type: StatType): string => {
    return `${styles.dsStat} ${styles[`dsStat${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
  };

  const statGroups = [
    {
      title: "File Comparison",
      icon: "ti-files",
      stats: [
        {
          label: "Original",
          value: `${formatBytes(detailedStats.files.original.size)}`,
          subtitle: `${detailedStats.files.original.lines.toLocaleString()} lines, ${detailedStats.files.original.words.toLocaleString()} words`,
          type: "neutral" as StatType,
        },
        {
          label: "Modified",
          value: `${formatBytes(detailedStats.files.modified.size)}`,
          subtitle: `${detailedStats.files.modified.lines.toLocaleString()} lines, ${detailedStats.files.modified.words.toLocaleString()} words`,
          type: "neutral" as StatType,
        },
        {
          label: "Size Change",
          value: `${detailedStats.files.diff.sizeChangePercent >= 0 ? "+" : ""}${detailedStats.files.diff.sizeChangePercent}%`,
          subtitle: `${detailedStats.files.diff.size >= 0 ? "+" : ""}${formatBytes(Math.abs(detailedStats.files.diff.size))}`,
          type:
            (detailedStats.files.diff.sizeChangePercent > 10
              ? "warning"
              : detailedStats.files.diff.sizeChangePercent < -10
              ? "success"
              : "neutral") as StatType,
        },
      ],
    },
    {
      title: "Line Changes",
      icon: "ti-git-diff",
      stats: [
        {
          label: "Added",
          value: detailedStats.changes.added.toLocaleString(),
          subtitle: "New lines",
          type: "add" as StatType,
        },
        {
          label: "Removed",
          value: detailedStats.changes.removed.toLocaleString(),
          subtitle: "Deleted lines",
          type: "remove" as StatType,
        },
        {
          label: "Unchanged",
          value: detailedStats.changes.unchanged.toLocaleString(),
          subtitle: "Identical lines",
          type: "neutral" as StatType,
        },
      ],
    },
    {
      title: "Analysis",
      icon: "ti-chart-pie",
      stats: [
        {
          label: "Similarity",
          value: `${detailedStats.efficiency.similarity}%`,
          subtitle: "Content similarity",
          type:
            (detailedStats.efficiency.similarity > 70
              ? "success"
              : detailedStats.efficiency.similarity > 30
              ? "neutral"
              : "warning") as StatType,
        },
        {
          label: "Change Ratio",
          value: `${detailedStats.efficiency.diffRatio}%`,
          subtitle: "Lines affected",
          type:
            (detailedStats.efficiency.diffRatio < 10
              ? "success"
              : detailedStats.efficiency.diffRatio < 30
              ? "neutral"
              : "warning") as StatType,
        },
        {
          label: "Total Lines",
          value: detailedStats.changes.totalLines.toLocaleString(),
          subtitle: "After changes",
          type: "neutral" as StatType,
        },
      ],
    },
  ];

  return (
    <div className={styles.dsRoot}>
      {statGroups.map((group, groupIdx) => (
        <div key={groupIdx} className={styles.dsGroup}>
          <div className={styles.dsGroupHeader}>
            <i className={`ti ${group.icon}`} />
            <span className={styles.dsGroupTitle}>{group.title}</span>
          </div>
          <div className={styles.dsGroupGrid}>
            {group.stats.map((stat, statIdx) => (
              <div key={statIdx} className={getStatClassName(stat.type)}>
                <div className={styles.dsStatValue}>{stat.value}</div>
                <div className={styles.dsStatLabel}>{stat.label}</div>
                {stat.subtitle && (
                  <div className={styles.dsStatSubtitle}>{stat.subtitle}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.dsSummary}>
        <div className={styles.dsSummaryIcon}>
          <i className="ti ti-info-circle" />
        </div>
        <div className={styles.dsSummaryText}>
          {result?.summary || "No changes detected"}
        </div>
      </div>
    </div>
  );
}