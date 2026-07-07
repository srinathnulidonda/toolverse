// features/dev/diff-checker/DiffViewer.tsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { DiffResult, DiffLine, DiffViewMode, FileType } from "./diffEngine";

interface DiffLineWithHighlighted extends DiffLine {
    highlighted?: boolean;
}

interface DiffViewerProps {
    result: DiffResult;
    viewMode: DiffViewMode;
    fileType?: FileType;
    originalText: string;
    modifiedText: string;
    onLineClick?: (line: DiffLine, index: number) => void;
    searchQuery?: string;
    showInvisibles?: boolean;
    wrapLines?: boolean;
}

export default function DiffViewer({
    result,
    viewMode,
    fileType = "text",
    originalText,
    modifiedText,
    onLineClick,
    searchQuery = "",
    showInvisibles = false,
    wrapLines = true,
}: DiffViewerProps) {
    const [copiedLine, setCopiedLine] = useState<number | null>(null);
    const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);

    const processedLines = useMemo(() => {
        return result.lines.map((line, index) => ({
            ...line,
            index,
            highlighted: searchQuery ?
                line.content.toLowerCase().includes(searchQuery.toLowerCase()) : false,
        })) as (DiffLine & { highlighted: boolean; index: number })[];
    }, [result.lines, searchQuery]);

    const handleLineClick = useCallback((line: DiffLine, index: number, event: React.MouseEvent) => {
        if (event.shiftKey) {
            // Multi-select with shift
            const newSelected = new Set(selectedLines);
            const lastSelected = Math.max(...Array.from(selectedLines), -1);
            const start = Math.min(lastSelected + 1, index);
            const end = Math.max(lastSelected + 1, index);
            
            for (let i = start; i <= end; i++) {
                newSelected.add(i);
            }
            setSelectedLines(newSelected);
        } else if (event.ctrlKey || event.metaKey) {
            // Multi-select with ctrl/cmd
            const newSelected = new Set(selectedLines);
            if (newSelected.has(index)) {
                newSelected.delete(index);
            } else {
                newSelected.add(index);
            }
            setSelectedLines(newSelected);
        } else {
            // Single select
            setSelectedLines(new Set([index]));
        }

        onLineClick?.(line, index);
    }, [selectedLines, onLineClick]);

    const copyLine = useCallback(async (content: string, index: number) => {
        await navigator.clipboard.writeText(content);
        setCopiedLine(index);
        setTimeout(() => setCopiedLine(null), 1500);
    }, []);

    const renderLineContent = (line: DiffLine & { highlighted: boolean }) => {
        let content = line.content;
        
        if (showInvisibles) {
            content = content
                .replace(/\t/g, "→   ")
                .replace(/ /g, "·")
                .replace(/\n/g, "↵\n");
        }

        if (line.highlighted && searchQuery) {
            const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi');
            const parts = content.split(regex);
            return (
                <>
                    {parts.map((part, i) => 
                        part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark key={i} className="dv-highlight">{part}</mark>
                        ) : part
                    )}
                </>
            );
        }

        if (line.isWordDiff && line.wordDiffs) {
            return (
                <>
                    {line.wordDiffs.map((wordDiff, i) => (
                        <span 
                            key={i} 
                            className={`dv-word-diff dv-word-diff--${wordDiff.type}`}
                        >
                            {wordDiff.content}
                        </span>
                    ))}
                </>
            );
        }

        return content;
    };

    if (viewMode === "split") {
        return (
            <>
                <div className="dv-split" ref={containerRef}>
                    <div className="dv-split-panel">
                        <div className="dv-split-header">
                            <i className="ti ti-file" />
                            <span>Original</span>
                            <div className="dv-split-stats">
                                {result.stats.removed > 0 && (
                                    <span className="dv-stat dv-stat--remove">
                                        -{result.stats.removed}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="dv-split-content">
                            {processedLines.filter(line => 
                                line.type === "remove" || line.type === "unchanged"
                            ).map((line, idx) => (
                                <div
                                    key={`orig-${idx}`}
                                    className={`dv-line dv-line--${line.type} ${
                                        selectedLines.has(line.index) ? "dv-line--selected" : ""
                                    }`}
                                    onClick={(e) => handleLineClick(line, line.index, e)}
                                >
                                    <span className="dv-line-num">
                                        {line.originalLineNum || ""}
                                    </span>
                                    <span className="dv-line-content">
                                        {renderLineContent(line)}
                                    </span>
                                    <button
                                        className="dv-line-actions"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyLine(line.content, line.index);
                                        }}
                                        title="Copy line"
                                    >
                                        <i className={`ti ${copiedLine === line.index ? "ti-check" : "ti-copy"}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dv-split-divider">
                        <div className="dv-split-divider-line" />
                    </div>

                    <div className="dv-split-panel">
                        <div className="dv-split-header">
                            <i className="ti ti-file-diff" />
                            <span>Modified</span>
                            <div className="dv-split-stats">
                                {result.stats.added > 0 && (
                                    <span className="dv-stat dv-stat--add">
                                        +{result.stats.added}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="dv-split-content">
                            {processedLines.filter(line => 
                                line.type === "add" || line.type === "unchanged" || line.type === "modified"
                            ).map((line, idx) => (
                                <div
                                    key={`mod-${idx}`}
                                    className={`dv-line dv-line--${line.type} ${
                                        selectedLines.has(line.index) ? "dv-line--selected" : ""
                                    }`}
                                    onClick={(e) => handleLineClick(line, line.index, e)}
                                >
                                    <span className="dv-line-num">
                                        {line.modifiedLineNum || ""}
                                    </span>
                                    <span className="dv-line-content">
                                        {renderLineContent(line)}
                                    </span>
                                    <button
                                        className="dv-line-actions"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyLine(line.content, line.index);
                                        }}
                                        title="Copy line"
                                    >
                                        <i className={`ti ${copiedLine === line.index ? "ti-check" : "ti-copy"}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .dv-split {
                        display: grid;
                        grid-template-columns: 1fr 1px 1fr;
                        flex: 1;
                        overflow: hidden;
                        background: var(--bg-card);
                    }

                    .dv-split-panel {
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }

                    .dv-split-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 10px 14px;
                        background: var(--bg-surface);
                        border-bottom: 0.5px solid var(--border);
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--text-secondary);
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                    }

                    .dv-split-header i {
                        font-size: 13px;
                    }

                    .dv-split-stats {
                        margin-left: auto;
                        display: flex;
                        gap: 6px;
                    }

                    .dv-stat {
                        font-size: 10px;
                        font-weight: 600;
                        padding: 2px 6px;
                        border-radius: 99px;
                        font-family: var(--font-mono);
                    }

                    .dv-stat--add {
                        background: rgba(5, 150, 105, 0.1);
                        color: #059669;
                        border: 0.5px solid rgba(5, 150, 105, 0.2);
                    }

                    .dv-stat--remove {
                        background: rgba(220, 38, 38, 0.1);
                        color: #dc2626;
                        border: 0.5px solid rgba(220, 38, 38, 0.2);
                    }

                    @media (prefers-color-scheme: dark) {
                        .dv-stat--add {
                            background: rgba(52, 211, 153, 0.1);
                            color: #34d399;
                            border-color: rgba(52, 211, 153, 0.2);
                        }
                        .dv-stat--remove {
                            background: rgba(248, 113, 113, 0.1);
                            color: #f87171;
                            border-color: rgba(248, 113, 113, 0.2);
                        }
                    }

                    .dv-split-content {
                        flex: 1;
                        overflow: auto;
                        font-family: var(--font-mono);
                        font-size: 13px;
                        line-height: 1.6;
                    }

                    .dv-split-divider {
                        background: var(--border);
                        position: relative;
                    }

                    .dv-split-divider-line {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 50%;
                        width: 1px;
                        background: var(--border);
                    }

                    .dv-line {
                        display: flex;
                        align-items: flex-start;
                        gap: 8px;
                        padding: 2px 0;
                        cursor: pointer;
                        position: relative;
                        transition: background 0.1s;
                    }

                    .dv-line:hover {
                        background: var(--bg-surface);
                    }

                    .dv-line:hover .dv-line-actions {
                        opacity: 1;
                    }

                    .dv-line--selected {
                        background: var(--brand-light) !important;
                    }

                    .dv-line--add {
                        background: rgba(5, 150, 105, 0.05);
                        border-left: 2px solid #059669;
                    }

                    .dv-line--remove {
                        background: rgba(220, 38, 38, 0.05);
                        border-left: 2px solid #dc2626;
                    }

                    .dv-line--modified {
                        background: rgba(217, 119, 6, 0.05);
                        border-left: 2px solid #d97706;
                    }

                    @media (prefers-color-scheme: dark) {
                        .dv-line--add {
                            background: rgba(52, 211, 153, 0.08);
                            border-left-color: #34d399;
                        }
                        .dv-line--remove {
                            background: rgba(248, 113, 113, 0.08);
                            border-left-color: #f87171;
                        }
                        .dv-line--modified {
                            background: rgba(251, 191, 36, 0.08);
                            border-left-color: #fbbf24;
                        }
                    }

                    .dv-line-num {
                        width: 40px;
                        flex-shrink: 0;
                        color: var(--text-disabled);
                        font-size: 11px;
                        text-align: right;
                        user-select: none;
                        padding: 0 8px;
                    }

                    .dv-line-content {
                        flex: 1;
                        color: var(--text);
                        white-space: ${wrapLines ? "pre-wrap" : "pre"};
                        word-break: break-word;
                        padding-right: 40px;
                    }

                    .dv-line-actions {
                        position: absolute;
                        right: 8px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 24px;
                        height: 24px;
                        border: none;
                        background: var(--bg-surface);
                        border: 0.5px solid var(--border);
                        border-radius: 4px;
                        color: var(--text-secondary);
                        font-size: 11px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        opacity: 0;
                        transition: opacity 0.1s, background 0.1s;
                    }

                    .dv-line-actions:hover {
                        background: var(--bg-card);
                        color: var(--text);
                    }

                    .dv-highlight {
                        background: #fef3c7;
                        color: #92400e;
                        padding: 1px 2px;
                        border-radius: 2px;
                    }

                    @media (prefers-color-scheme: dark) {
                        .dv-highlight {
                            background: #451a03;
                            color: #fbbf24;
                        }
                    }

                    .dv-word-diff--add {
                        background: rgba(5, 150, 105, 0.2);
                        color: #059669;
                    }

                    .dv-word-diff--remove {
                        background: rgba(220, 38, 38, 0.2);
                        color: #dc2626;
                        text-decoration: line-through;
                    }

                    @media (prefers-color-scheme: dark) {
                        .dv-word-diff--add {
                            background: rgba(52, 211, 153, 0.2);
                            color: #34d399;
                        }
                        .dv-word-diff--remove {
                            background: rgba(248, 113, 113, 0.2);
                            color: #f87171;
                        }
                    }

                    @media (max-width: 768px) {
                        .dv-split {
                            grid-template-columns: 1fr;
                            grid-template-rows: 1fr 1fr;
                        }

                        .dv-split-divider {
                            display: none;
                        }

                        .dv-line-num {
                            width: 30px;
                            padding: 0 6px;
                        }

                        .dv-line-content {
                            font-size: 12px;
                        }
                    }
                `}</style>
            </>
        );
    }

    // Unified view (default for now, can extend for inline view)
    return (
        <>
            <div className="dv-unified" ref={containerRef}>
                <div className="dv-unified-header">
                    <div className="dv-unified-title">
                        <i className="ti ti-git-diff" />
                        <span>Unified Diff</span>
                    </div>
                    <div className="dv-unified-stats">
                        {result.stats.added > 0 && (
                            <span className="dv-stat dv-stat--add">+{result.stats.added}</span>
                        )}
                        {result.stats.removed > 0 && (
                            <span className="dv-stat dv-stat--remove">-{result.stats.removed}</span>
                        )}
                    </div>
                </div>
                
                <div className="dv-unified-content">
                    {processedLines.map((line, idx) => (
                        <div
                            key={idx}
                            className={`dv-line dv-line--${line.type} ${
                                selectedLines.has(line.index) ? "dv-line--selected" : ""
                            }`}
                            onClick={(e) => handleLineClick(line, line.index, e)}
                        >
                            <span className="dv-line-indicator">
                                {line.type === "add" && "+"}
                                {line.type === "remove" && "−"}
                                {line.type === "unchanged" && " "}
                                {line.type === "modified" && "~"}
                            </span>
                            <span className="dv-line-nums">
                                <span className="dv-line-num">
                                    {line.originalLineNum || ""}
                                </span>
                                <span className="dv-line-num">
                                    {line.modifiedLineNum || ""}
                                </span>
                            </span>
                            <span className="dv-line-content">
                                {renderLineContent(line)}
                            </span>
                            <button
                                className="dv-line-actions"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyLine(line.content, line.index);
                                }}
                                title="Copy line"
                            >
                                <i className={`ti ${copiedLine === line.index ? "ti-check" : "ti-copy"}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .dv-unified {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    overflow: hidden;
                    background: var(--bg-card);
                }

                .dv-unified-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .dv-unified-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .dv-unified-title i {
                    font-size: 13px;
                }

                .dv-unified-stats {
                    display: flex;
                    gap: 6px;
                }

                .dv-unified-content {
                    flex: 1;
                    overflow: auto;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                }

                .dv-line {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 2px 0;
                    cursor: pointer;
                    position: relative;
                    transition: background 0.1s;
                }

                .dv-line:hover {
                    background: var(--bg-surface);
                }

                .dv-line:hover .dv-line-actions {
                    opacity: 1;
                }

                .dv-line--selected {
                    background: var(--brand-light) !important;
                }

                .dv-line--add {
                    background: rgba(5, 150, 105, 0.05);
                    border-left: 2px solid #059669;
                }

                .dv-line--remove {
                    background: rgba(220, 38, 38, 0.05);
                    border-left: 2px solid #dc2626;
                }

                .dv-line--modified {
                    background: rgba(217, 119, 6, 0.05);
                    border-left: 2px solid #d97706;
                }

                @media (prefers-color-scheme: dark) {
                    .dv-line--add {
                        background: rgba(52, 211, 153, 0.08);
                        border-left-color: #34d399;
                    }
                    .dv-line--remove {
                        background: rgba(248, 113, 113, 0.08);
                        border-left-color: #f87171;
                    }
                    .dv-line--modified {
                        background: rgba(251, 191, 36, 0.08);
                        border-left-color: #fbbf24;
                    }
                }

                .dv-line-indicator {
                    width: 20px;
                    flex-shrink: 0;
                    font-weight: 700;
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 0 4px;
                }

                .dv-line--add .dv-line-indicator {
                    color: #059669;
                }

                .dv-line--remove .dv-line-indicator {
                    color: #dc2626;
                }

                .dv-line--modified .dv-line-indicator {
                    color: #d97706;
                }

                @media (prefers-color-scheme: dark) {
                    .dv-line--add .dv-line-indicator {
                        color: #34d399;
                    }
                    .dv-line--remove .dv-line-indicator {
                        color: #f87171;
                    }
                    .dv-line--modified .dv-line-indicator {
                        color: #fbbf24;
                    }
                }

                .dv-line-nums {
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .dv-line-num {
                    width: 35px;
                    color: var(--text-disabled);
                    font-size: 11px;
                    text-align: right;
                    user-select: none;
                }

                .dv-line-content {
                    flex: 1;
                    color: var(--text);
                    white-space: ${wrapLines ? "pre-wrap" : "pre"};
                    word-break: break-word;
                    padding-right: 40px;
                }

                .dv-line-actions {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 4px;
                    color: var(--text-secondary);
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.1s, background 0.1s;
                }

                .dv-line-actions:hover {
                    background: var(--bg-card);
                    color: var(--text);
                }

                /* Shared styles */
                .dv-stat {
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 99px;
                    font-family: var(--font-mono);
                }

                .dv-stat--add {
                    background: rgba(5, 150, 105, 0.1);
                    color: #059669;
                    border: 0.5px solid rgba(5, 150, 105, 0.2);
                }

                .dv-stat--remove {
                    background: rgba(220, 38, 38, 0.1);
                    color: #dc2626;
                    border: 0.5px solid rgba(220, 38, 38, 0.2);
                }

                @media (prefers-color-scheme: dark) {
                    .dv-stat--add {
                        background: rgba(52, 211, 153, 0.1);
                        color: #34d399;
                        border-color: rgba(52, 211, 153, 0.2);
                    }
                    .dv-stat--remove {
                        background: rgba(248, 113, 113, 0.1);
                        color: #f87171;
                        border-color: rgba(248, 113, 113, 0.2);
                    }
                }

                .dv-highlight {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 1px 2px;
                    border-radius: 2px;
                }

                @media (prefers-color-scheme: dark) {
                    .dv-highlight {
                        background: #451a03;
                        color: #fbbf24;
                    }
                }

                .dv-word-diff--add {
                    background: rgba(5, 150, 105, 0.2);
                    color: #059669;
                }

                .dv-word-diff--remove {
                    background: rgba(220, 38, 38, 0.2);
                    color: #dc2626;
                    text-decoration: line-through;
                }

                @media (prefers-color-scheme: dark) {
                    .dv-word-diff--add {
                        background: rgba(52, 211, 153, 0.2);
                        color: #34d399;
                    }
                    .dv-word-diff--remove {
                        background: rgba(248, 113, 113, 0.2);
                        color: #f87171;
                    }
                }

                @media (max-width: 768px) {
                    .dv-line-nums {
                        gap: 4px;
                    }

                    .dv-line-num {
                        width: 25px;
                    }

                    .dv-line-content {
                        font-size: 12px;
                    }
                }
            `}</style>
        </>
    );
}

function escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}