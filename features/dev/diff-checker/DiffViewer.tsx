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
      highlighted: searchQuery
        ? line.content.toLowerCase().includes(searchQuery.toLowerCase())
        : false,
    })) as (DiffLine & { highlighted: boolean; index: number })[];
  }, [result.lines, searchQuery]);

  const handleLineClick = useCallback(
    (line: DiffLine, index: number, event: React.MouseEvent) => {
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
    },
    [selectedLines, onLineClick]
  );

  const copyLine = useCallback(async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedLine(index);
    setTimeout(() => setCopiedLine(null), 1500);
  }, []);

  const renderLineContent = (line: DiffLine & { highlighted: boolean }) => {
    let content = line.content;

    if (showInvisibles) {
      content = content.replace(/\t/g, "→   ").replace(/ /g, "·").replace(/\n/g, "↵\n");
    }

    if (line.highlighted && searchQuery) {
      const regex = new RegExp(`(${escapeRegex(searchQuery)})`, "gi");
      const parts = content.split(regex);
      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
              <mark key={i} className="dv-highlight">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    }

    if (line.isWordDiff && line.wordDiffs) {
      return (
        <>
          {line.wordDiffs.map((wordDiff, i) => (
            <span key={i} className={`dv-word-diff dv-word-diff--${wordDiff.type}`}>
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
                  <span className="dv-stat dv-stat--remove">-{result.stats.removed}</span>
                )}
              </div>
            </div>
            <div className="dv-split-content">
              {processedLines
                .filter((line) => line.type === "remove" || line.type === "unchanged")
                .map((line, idx) => (
                  <div
                    key={`orig-${idx}`}
                    className={`dv-line dv-line--${line.type} ${selectedLines.has(line.index) ? "dv-line--selected" : ""
                      }`}
                    onClick={(e) => handleLineClick(line, line.index, e)}
                  >
                    <span className="dv-line-num">{line.originalLineNum || ""}</span>
                    <span className="dv-line-content">{renderLineContent(line)}</span>
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
                  <span className="dv-stat dv-stat--add">+{result.stats.added}</span>
                )}
              </div>
            </div>
            <div className="dv-split-content">
              {processedLines
                .filter(
                  (line) =>
                    line.type === "add" || line.type === "unchanged" || line.type === "modified"
                )
                .map((line, idx) => (
                  <div
                    key={`mod-${idx}`}
                    className={`dv-line dv-line--${line.type} ${selectedLines.has(line.index) ? "dv-line--selected" : ""
                      }`}
                    onClick={(e) => handleLineClick(line, line.index, e)}
                  >
                    <span className="dv-line-num">{line.modifiedLineNum || ""}</span>
                    <span className="dv-line-content">{renderLineContent(line)}</span>
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
              className={`dv-line dv-line--${line.type} ${selectedLines.has(line.index) ? "dv-line--selected" : ""
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
                <span className="dv-line-num">{line.originalLineNum || ""}</span>
                <span className="dv-line-num">{line.modifiedLineNum || ""}</span>
              </span>
              <span className="dv-line-content">{renderLineContent(line)}</span>
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
    </>
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}