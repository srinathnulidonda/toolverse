// features/dev/json-formatter/JsonDiff.tsx
"use client";

import { useMemo } from "react";

type DiffProps = {
    leftText: string;
    rightText: string;
};

type DiffLine =
    | { type: "same"; text: string; lineNum: number }
    | { type: "removed"; text: string; lineNum: number }
    | { type: "added"; text: string; lineNum: number }
    | { type: "separator" };

function diffLines(a: string, b: string): DiffLine[] {
    const aLines = a.split("\n");
    const bLines = b.split("\n");
    const m = aLines.length, n = bLines.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (aLines[i] === bLines[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
            else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }

    const result: DiffLine[] = [];
    let i = 0, j = 0, lineA = 1, lineB = 1;
    while (i < m || j < n) {
        if (i < m && j < n && aLines[i] === bLines[j]) {
            result.push({ type: "same", text: aLines[i], lineNum: lineA });
            i++; j++; lineA++; lineB++;
        } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
            result.push({ type: "added", text: bLines[j], lineNum: lineB });
            j++; lineB++;
        } else {
            result.push({ type: "removed", text: aLines[i], lineNum: lineA });
            i++; lineA++;
        }
    }
    return result;
}

export default function JsonDiff({ leftText, rightText }: DiffProps) {
    const { diff, stats, parseError } = useMemo(() => {
        let leftFormatted = leftText;
        let rightFormatted = rightText;
        let parseError = "";

        try {
            if (leftText.trim()) leftFormatted = JSON.stringify(JSON.parse(leftText), null, 2);
        } catch { parseError = "Left side has invalid JSON"; }
        try {
            if (rightText.trim()) rightFormatted = JSON.stringify(JSON.parse(rightText), null, 2);
        } catch { parseError = parseError ? "Both sides have invalid JSON" : "Right side has invalid JSON"; }

        if (!leftText.trim() || !rightText.trim()) return { diff: [], stats: null, parseError: "" };

        const diff = diffLines(leftFormatted, rightFormatted);
        const added = diff.filter((d) => d.type === "added").length;
        const removed = diff.filter((d) => d.type === "removed").length;
        return { diff, stats: { added, removed }, parseError };
    }, [leftText, rightText]);

    if (!leftText.trim() && !rightText.trim()) {
        return (
            <div className="jdiff-empty">
                <i className="ti ti-git-diff" aria-hidden="true" />
                <p>Paste JSON in both panels above to see a diff</p>
            </div>
        );
    }

    return (
        <>
            <div className="jdiff-root" role="region" aria-label="JSON diff output">
                {/* Header bar */}
                <div className="jdiff-header">
                    {parseError ? (
                        <span className="jdiff-error-msg">
                            <i className="ti ti-alert-circle" aria-hidden="true" />
                            {parseError}
                        </span>
                    ) : stats ? (
                        <div className="jdiff-stats">
                            {stats.added > 0 && (
                                <span className="jdiff-stat added">
                                    <i className="ti ti-plus" aria-hidden="true" />
                                    {stats.added} added
                                </span>
                            )}
                            {stats.removed > 0 && (
                                <span className="jdiff-stat removed">
                                    <i className="ti ti-minus" aria-hidden="true" />
                                    {stats.removed} removed
                                </span>
                            )}
                            {stats.added === 0 && stats.removed === 0 && (
                                <span className="jdiff-stat same">
                                    <i className="ti ti-check" aria-hidden="true" />
                                    Identical
                                </span>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Diff lines */}
                <div className="jdiff-lines" role="list" aria-label="Diff lines">
                    {diff.map((line, i) => {
                        if (line.type === "separator") {
                            return (
                                <div key={i} className="jdiff-sep" role="separator" aria-hidden="true">···</div>
                            );
                        }
                        return (
                            <div
                                key={i}
                                className={`jdiff-line jdiff-${line.type}`}
                                role="listitem"
                                aria-label={`${line.type === "added" ? "Added" : line.type === "removed" ? "Removed" : "Unchanged"} line ${line.lineNum}: ${line.text}`}
                            >
                                <span className="jdiff-gutter" aria-hidden="true">
                                    {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                                </span>
                                <span className="jdiff-linenum" aria-hidden="true">{line.lineNum}</span>
                                <span className="jdiff-text">{line.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        .jdiff-root {
          flex: 1;
          overflow: auto;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.65;
          display: flex;
          flex-direction: column;
        }

        .jdiff-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-disabled);
          padding: 32px;
          font-family: var(--font-sans);
        }
        .jdiff-empty i { font-size: 20px; }
        .jdiff-empty p { font-size: 12.5px; margin: 0; text-align: center; }

        .jdiff-header {
          padding: 7px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          min-height: 34px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .jdiff-error-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #B91C1C;
          font-family: var(--font-sans);
        }
        @media (prefers-color-scheme: dark) {
          .jdiff-error-msg { color: #F87171; }
        }
        .jdiff-error-msg i { font-size: 13px; flex-shrink: 0; }

        .jdiff-stats {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .jdiff-stat {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          font-family: var(--font-sans);
          padding: 2px 8px;
          border-radius: 99px;
        }
        .jdiff-stat i { font-size: 10px; }
        .jdiff-stat.added {
          background: rgba(21,128,61,0.1);
          color: #15803D;
        }
        .jdiff-stat.removed {
          background: rgba(185,28,28,0.08);
          color: #B91C1C;
        }
        .jdiff-stat.same {
          background: var(--brand-light);
          color: var(--brand-text);
        }
        @media (prefers-color-scheme: dark) {
          .jdiff-stat.added { background: rgba(74,222,128,0.1); color: #4ADE80; }
          .jdiff-stat.removed { background: rgba(248,113,113,0.08); color: #F87171; }
        }

        .jdiff-lines {
          flex: 1;
          overflow: auto;
        }

        .jdiff-line {
          display: flex;
          align-items: baseline;
          gap: 0;
          padding: 0;
        }
        .jdiff-same { color: var(--text-secondary); }
        .jdiff-added {
          background: rgba(21,128,61,0.07);
          color: #166534;
        }
        .jdiff-removed {
          background: rgba(185,28,28,0.06);
          color: #9A1616;
          text-decoration: line-through;
          text-decoration-color: rgba(185,28,28,0.4);
          opacity: 0.85;
        }
        @media (prefers-color-scheme: dark) {
          .jdiff-added { background: rgba(74,222,128,0.08); color: #4ADE80; }
          .jdiff-removed {
            background: rgba(248,113,113,0.07);
            color: #F87171;
            text-decoration-color: rgba(248,113,113,0.4);
          }
        }

        .jdiff-gutter {
          width: 20px;
          flex-shrink: 0;
          font-weight: 700;
          user-select: none;
          text-align: center;
          padding: 0 4px;
          font-size: 11px;
          color: inherit;
          opacity: 0.7;
        }
        .jdiff-linenum {
          width: 32px;
          flex-shrink: 0;
          text-align: right;
          padding-right: 12px;
          font-size: 10.5px;
          color: var(--text-disabled);
          user-select: none;
        }
        .jdiff-text {
          white-space: pre;
          padding: 0 14px 0 0;
          flex: 1;
          min-width: 0;
        }

        .jdiff-sep {
          padding: 3px 20px;
          color: var(--text-disabled);
          font-size: 10.5px;
          font-family: var(--font-sans);
          text-align: center;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border-faint);
          border-bottom: 0.5px solid var(--border-faint);
          letter-spacing: 0.1em;
        }
      `}</style>
        </>
    );
}