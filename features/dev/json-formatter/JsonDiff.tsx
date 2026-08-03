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
  const m = aLines.length,
    n = bLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (aLines[i] === bLines[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0,
    j = 0,
    lineA = 1,
    lineB = 1;
  while (i < m || j < n) {
    if (i < m && j < n && aLines[i] === bLines[j]) {
      result.push({ type: "same", text: aLines[i], lineNum: lineA });
      i++;
      j++;
      lineA++;
      lineB++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: "added", text: bLines[j], lineNum: lineB });
      j++;
      lineB++;
    } else {
      result.push({ type: "removed", text: aLines[i], lineNum: lineA });
      i++;
      lineA++;
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
    } catch {
      parseError = "Left side has invalid JSON";
    }
    try {
      if (rightText.trim()) rightFormatted = JSON.stringify(JSON.parse(rightText), null, 2);
    } catch {
      parseError = parseError ? "Both sides have invalid JSON" : "Right side has invalid JSON";
    }

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
                <div key={i} className="jdiff-sep" role="separator" aria-hidden="true">
                  ···
                </div>
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
                <span className="jdiff-linenum" aria-hidden="true">
                  {line.lineNum}
                </span>
                <span className="jdiff-text">{line.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
