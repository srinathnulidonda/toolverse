// features/dev/diff-checker/DiffViewer.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { DiffResult, DiffLine, DiffViewMode, FileType } from "./ts/diffEngine";
import styles from "./style/DiffViewer.module.css";

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

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  const processedLines = useMemo(() => {
    return result.lines.map((line, index) => ({
      ...line,
      index,
      highlighted: searchQuery
        ? line.content.toLowerCase().includes(searchQuery.toLowerCase())
        : false,
    }));
  }, [result.lines, searchQuery]);

  const handleLineClick = useCallback(
    (line: DiffLine, index: number, event: React.MouseEvent) => {
      if (event.shiftKey) {
        const newSelected = new Set(selectedLines);
        const lastSelected = Math.max(...Array.from(selectedLines), -1);
        const start = Math.min(lastSelected + 1, index);
        const end = Math.max(lastSelected + 1, index);

        for (let i = start; i <= end; i++) {
          newSelected.add(i);
        }
        setSelectedLines(newSelected);
      } else if (event.ctrlKey || event.metaKey) {
        const newSelected = new Set(selectedLines);
        if (newSelected.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
        setSelectedLines(newSelected);
      } else {
        setSelectedLines(new Set([index]));
      }

      onLineClick?.(line, index);
    },
    [selectedLines, onLineClick]
  );

  const copyLine = useCallback(async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedLine(index);
      setTimeout(() => setCopiedLine(null), 1500);
    } catch {}
  }, []);

  const renderLineContent = useCallback(
    (line: DiffLine & { highlighted: boolean }) => {
      let content = line.content;

      if (showInvisibles) {
        content = content
          .replace(/\t/g, "→   ")
          .replace(/ /g, "·")
          .replace(/\n/g, "↵\n");
      }

      if (line.highlighted && searchQuery) {
        const regex = new RegExp(`(${escapeRegex(searchQuery)})`, "gi");
        const parts = content.split(regex);
        return (
          <>
            {parts.map((part, i) =>
              part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark key={i} className={styles.dvHighlight}>
                  {part}
                </mark>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </>
        );
      }

      if (line.isWordDiff && line.wordDiffs) {
        return (
          <>
            {line.wordDiffs.map((wordDiff, i) => {
              const wordClassName =
                wordDiff.type === "add"
                  ? styles.dvWordDiffAdd
                  : wordDiff.type === "remove"
                  ? styles.dvWordDiffRemove
                  : styles.dvWordDiffUnchanged;
              return (
                <span key={i} className={wordClassName}>
                  {wordDiff.content}
                </span>
              );
            })}
          </>
        );
      }

      return content;
    },
    [searchQuery, showInvisibles]
  );

  const getLineClassName = useCallback(
    (line: DiffLine & { highlighted: boolean; index: number }) => {
      const typeClass =
        line.type === "add"
          ? styles.dvLineAdd
          : line.type === "remove"
          ? styles.dvLineRemove
          : line.type === "modified"
          ? styles.dvLineModified
          : styles.dvLineUnchanged;

      const selectedClass = selectedLines.has(line.index)
        ? styles.dvLineSelected
        : "";

      return `${styles.dvLine} ${typeClass} ${selectedClass}`.trim();
    },
    [selectedLines]
  );

  if (viewMode === "split") {
    const originalLines = processedLines.filter(
      (line) => line.type === "remove" || line.type === "unchanged"
    );
    const modifiedLines = processedLines.filter(
      (line) =>
        line.type === "add" ||
        line.type === "unchanged" ||
        line.type === "modified"
    );

    return (
      <div className={styles.dvSplit}>
        <div className={styles.dvSplitPanel}>
          <div className={styles.dvSplitHeader}>
            <i className="ti ti-file" />
            <span>Original</span>
            <div className={styles.dvSplitStats}>
              {result.stats.removed > 0 && (
                <span className={`${styles.dvStat} ${styles.dvStatRemove}`}>
                  -{result.stats.removed}
                </span>
              )}
            </div>
          </div>
          <div className={styles.dvSplitContent}>
            {originalLines.map((line) => (
              <div
                key={`orig-${line.index}`}
                className={getLineClassName(line)}
                onClick={(e) => handleLineClick(line, line.index, e)}
              >
                <span className={styles.dvLineNum}>
                  {line.originalLineNum || ""}
                </span>
                <span className={styles.dvLineContent}>
                  {renderLineContent(line)}
                </span>
                <button
                  className={styles.dvLineActions}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyLine(line.content, line.index);
                  }}
                  title="Copy line"
                  aria-label="Copy line"
                >
                  <i
                    className={`ti ${
                      copiedLine === line.index ? "ti-check" : "ti-copy"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dvSplitDivider} aria-hidden="true" />

        <div className={styles.dvSplitPanel}>
          <div className={styles.dvSplitHeader}>
            <i className="ti ti-file-diff" />
            <span>Modified</span>
            <div className={styles.dvSplitStats}>
              {result.stats.added > 0 && (
                <span className={`${styles.dvStat} ${styles.dvStatAdd}`}>
                  +{result.stats.added}
                </span>
              )}
            </div>
          </div>
          <div className={styles.dvSplitContent}>
            {modifiedLines.map((line) => (
              <div
                key={`mod-${line.index}`}
                className={getLineClassName(line)}
                onClick={(e) => handleLineClick(line, line.index, e)}
              >
                <span className={styles.dvLineNum}>
                  {line.modifiedLineNum || ""}
                </span>
                <span className={styles.dvLineContent}>
                  {renderLineContent(line)}
                </span>
                <button
                  className={styles.dvLineActions}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyLine(line.content, line.index);
                  }}
                  title="Copy line"
                  aria-label="Copy line"
                >
                  <i
                    className={`ti ${
                      copiedLine === line.index ? "ti-check" : "ti-copy"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dvUnified}>
      <div className={styles.dvUnifiedHeader}>
        <div className={styles.dvUnifiedTitle}>
          <i className="ti ti-git-diff" />
          <span>Unified Diff</span>
        </div>
        <div className={styles.dvUnifiedStats}>
          {result.stats.added > 0 && (
            <span className={`${styles.dvStat} ${styles.dvStatAdd}`}>
              +{result.stats.added}
            </span>
          )}
          {result.stats.removed > 0 && (
            <span className={`${styles.dvStat} ${styles.dvStatRemove}`}>
              -{result.stats.removed}
            </span>
          )}
        </div>
      </div>

      <div className={styles.dvUnifiedContent}>
        {processedLines.map((line) => (
          <div
            key={line.index}
            className={getLineClassName(line)}
            onClick={(e) => handleLineClick(line, line.index, e)}
          >
            <span className={styles.dvLineIndicator}>
              {line.type === "add" && "+"}
              {line.type === "remove" && "−"}
              {line.type === "unchanged" && " "}
              {line.type === "modified" && "~"}
            </span>
            <div className={styles.dvLineNums}>
              <span className={styles.dvLineNum}>
                {line.originalLineNum || ""}
              </span>
              <span className={styles.dvLineNum}>
                {line.modifiedLineNum || ""}
              </span>
            </div>
            <span className={styles.dvLineContent}>
              {renderLineContent(line)}
            </span>
            <button
              className={styles.dvLineActions}
              onClick={(e) => {
                e.stopPropagation();
                copyLine(line.content, line.index);
              }}
              title="Copy line"
              aria-label="Copy line"
            >
              <i
                className={`ti ${
                  copiedLine === line.index ? "ti-check" : "ti-copy"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}