// features/dev/diff-checker/DiffStats.tsx
"use client";

import { useMemo } from "react";
import type { DiffResult } from "./diffEngine";
import { formatBytes } from "./diffEngine";

interface DiffStatsProps {
  originalText: string;
  modifiedText: string;
  result: DiffResult | null;
}

export default function DiffStats({ originalText, modifiedText, result }: DiffStatsProps) {
  const detailedStats = useMemo(() => {
    if (!result) return null;

    const originalBytes = new Blob([originalText]).size;
    const modifiedBytes = new Blob([modifiedText]).size;
    const sizeDiff = modifiedBytes - originalBytes;
    const sizeChangePercent = originalBytes > 0 ? Math.round((sizeDiff / originalBytes) * 100) : 0;

    const originalLines = originalText.split("\n").length;
    const modifiedLines = modifiedText.split("\n").length;
    const lineDiff = modifiedLines - originalLines;

    // Calculate complexity metrics
    const originalWords = originalText.split(/\s+/).filter(Boolean).length;
    const modifiedWords = modifiedText.split(/\s+/).filter(Boolean).length;
    const wordDiff = modifiedWords - originalWords;

    return {
      files: {
        original: { size: originalBytes, lines: originalLines, words: originalWords },
        modified: { size: modifiedBytes, lines: modifiedLines, words: modifiedWords },
        diff: { size: sizeDiff, lines: lineDiff, words: wordDiff, sizeChangePercent },
      },
      changes: result.stats,
      efficiency: {
        diffRatio:
          result.stats.totalLines > 0
            ? Math.round(
              ((result.stats.added + result.stats.removed) / result.stats.totalLines) * 100
            )
            : 0,
        similarity: result.stats.similarity,
      },
    };
  }, [originalText, modifiedText, result]);

  if (!detailedStats) {
    return (
      <div className="ds-empty">
        <div className="ds-empty-icon">
          <i className="ti ti-chart-bar" />
        </div>
        <p className="ds-empty-text">Compare files to see detailed statistics</p>
      </div>
    );
  }

  const statGroups = [
    {
      title: "File Comparison",
      icon: "ti-files",
      stats: [
        {
          label: "Original",
          value: `${formatBytes(detailedStats.files.original.size)}`,
          subtitle: `${detailedStats.files.original.lines.toLocaleString()} lines, ${detailedStats.files.original.words.toLocaleString()} words`,
          type: "neutral",
        },
        {
          label: "Modified",
          value: `${formatBytes(detailedStats.files.modified.size)}`,
          subtitle: `${detailedStats.files.modified.lines.toLocaleString()} lines, ${detailedStats.files.modified.words.toLocaleString()} words`,
          type: "neutral",
        },
        {
          label: "Size Change",
          value: `${detailedStats.files.diff.sizeChangePercent >= 0 ? "+" : ""}${detailedStats.files.diff.sizeChangePercent}%`,
          subtitle: `${detailedStats.files.diff.size >= 0 ? "+" : ""}${formatBytes(Math.abs(detailedStats.files.diff.size))}`,
          type:
            detailedStats.files.diff.sizeChangePercent > 10
              ? "warning"
              : detailedStats.files.diff.sizeChangePercent < -10
                ? "success"
                : "neutral",
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
          type: "add",
        },
        {
          label: "Removed",
          value: detailedStats.changes.removed.toLocaleString(),
          subtitle: "Deleted lines",
          type: "remove",
        },
        {
          label: "Unchanged",
          value: detailedStats.changes.unchanged.toLocaleString(),
          subtitle: "Identical lines",
          type: "neutral",
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
            detailedStats.efficiency.similarity > 70
              ? "success"
              : detailedStats.efficiency.similarity > 30
                ? "neutral"
                : "warning",
        },
        {
          label: "Change Ratio",
          value: `${detailedStats.efficiency.diffRatio}%`,
          subtitle: "Lines affected",
          type:
            detailedStats.efficiency.diffRatio < 10
              ? "success"
              : detailedStats.efficiency.diffRatio < 30
                ? "neutral"
                : "warning",
        },
        {
          label: "Total Lines",
          value: detailedStats.changes.totalLines.toLocaleString(),
          subtitle: "After changes",
          type: "neutral",
        },
      ],
    },
  ];

  return (
    <>
      <div className="ds-root">
        {statGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="ds-group">
            <div className="ds-group-header">
              <i className={`ti ${group.icon}`} />
              <span className="ds-group-title">{group.title}</span>
            </div>
            <div className="ds-group-grid">
              {group.stats.map((stat, statIdx) => (
                <div key={statIdx} className={`ds-stat ds-stat--${stat.type}`}>
                  <div className="ds-stat-value">{stat.value}</div>
                  <div className="ds-stat-label">{stat.label}</div>
                  {stat.subtitle && <div className="ds-stat-subtitle">{stat.subtitle}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Summary */}
        <div className="ds-summary">
          <div className="ds-summary-icon">
            <i className="ti ti-info-circle" />
          </div>
          <div className="ds-summary-text">{result?.summary || "No changes detected"}</div>
        </div>
      </div>
    </>
  );
}
