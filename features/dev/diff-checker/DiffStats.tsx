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
                diff: { size: sizeDiff, lines: lineDiff, words: wordDiff, sizeChangePercent }
            },
            changes: result.stats,
            efficiency: {
                diffRatio: result.stats.totalLines > 0 ? 
                    Math.round(((result.stats.added + result.stats.removed) / result.stats.totalLines) * 100) : 0,
                similarity: result.stats.similarity,
            }
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
                    type: "neutral"
                },
                {
                    label: "Modified",
                    value: `${formatBytes(detailedStats.files.modified.size)}`,
                    subtitle: `${detailedStats.files.modified.lines.toLocaleString()} lines, ${detailedStats.files.modified.words.toLocaleString()} words`,
                    type: "neutral"
                },
                {
                    label: "Size Change",
                    value: `${detailedStats.files.diff.sizeChangePercent >= 0 ? '+' : ''}${detailedStats.files.diff.sizeChangePercent}%`,
                    subtitle: `${detailedStats.files.diff.size >= 0 ? '+' : ''}${formatBytes(Math.abs(detailedStats.files.diff.size))}`,
                    type: detailedStats.files.diff.sizeChangePercent > 10 ? "warning" : 
                          detailedStats.files.diff.sizeChangePercent < -10 ? "success" : "neutral"
                }
            ]
        },
        {
            title: "Line Changes",
            icon: "ti-git-diff",
            stats: [
                {
                    label: "Added",
                    value: detailedStats.changes.added.toLocaleString(),
                    subtitle: "New lines",
                    type: "add"
                },
                {
                    label: "Removed",
                    value: detailedStats.changes.removed.toLocaleString(),
                    subtitle: "Deleted lines",
                    type: "remove"
                },
                {
                    label: "Unchanged",
                    value: detailedStats.changes.unchanged.toLocaleString(),
                    subtitle: "Identical lines",
                    type: "neutral"
                }
            ]
        },
        {
            title: "Analysis",
            icon: "ti-chart-pie",
            stats: [
                {
                    label: "Similarity",
                    value: `${detailedStats.efficiency.similarity}%`,
                    subtitle: "Content similarity",
                    type: detailedStats.efficiency.similarity > 70 ? "success" : 
                          detailedStats.efficiency.similarity > 30 ? "neutral" : "warning"
                },
                {
                    label: "Change Ratio",
                    value: `${detailedStats.efficiency.diffRatio}%`,
                    subtitle: "Lines affected",
                    type: detailedStats.efficiency.diffRatio < 10 ? "success" :
                          detailedStats.efficiency.diffRatio < 30 ? "neutral" : "warning"
                },
                {
                    label: "Total Lines",
                    value: detailedStats.changes.totalLines.toLocaleString(),
                    subtitle: "After changes",
                    type: "neutral"
                }
            ]
        }
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
                                    {stat.subtitle && (
                                        <div className="ds-stat-subtitle">{stat.subtitle}</div>
                                    )}
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
                    <div className="ds-summary-text">
                        {result?.summary || "No changes detected"}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .ds-root {
                    flex: 1;
                    padding: 16px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    background: var(--bg-surface);
                }

                .ds-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 60px 24px;
                }

                .ds-empty-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 13px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: var(--text-disabled);
                }

                .ds-empty-text {
                    font-size: 14px;
                    color: var(--text-tertiary);
                    margin: 0;
                    text-align: center;
                }

                .ds-group {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .ds-group-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .ds-group-header i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .ds-group-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ds-group-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 1px;
                    background: var(--border);
                }

                .ds-stat {
                    background: var(--bg-card);
                    padding: 16px 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 4px;
                    transition: background 0.12s;
                    position: relative;
                }

                .ds-stat:hover {
                    background: var(--bg-surface);
                }

                .ds-stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                    letter-spacing: -0.5px;
                    line-height: 1;
                    color: var(--text);
                }

                .ds-stat-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ds-stat-subtitle {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .ds-stat--add .ds-stat-value { color: #059669; }
                .ds-stat--remove .ds-stat-value { color: #dc2626; }
                .ds-stat--success .ds-stat-value { color: #059669; }
                .ds-stat--warning .ds-stat-value { color: #d97706; }
                .ds-stat--neutral .ds-stat-value { color: var(--text); }

                @media (prefers-color-scheme: dark) {
                    .ds-stat--add .ds-stat-value { color: #34d399; }
                    .ds-stat--remove .ds-stat-value { color: #f87171; }
                    .ds-stat--success .ds-stat-value { color: #34d399; }
                    .ds-stat--warning .ds-stat-value { color: #fbbf24; }
                }

                .ds-summary {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    border-radius: var(--radius-lg);
                    color: var(--brand-text);
                }

                .ds-summary-icon {
                    font-size: 16px;
                    color: var(--brand);
                }

                .ds-summary-text {
                    font-size: 13px;
                    font-weight: 500;
                    flex: 1;
                }

                @media (max-width: 768px) {
                    .ds-root {
                        padding: 12px;
                        gap: 16px;
                    }

                    .ds-group-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}