// features/dev/regex-tester/RegexTest.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { executePattern, analyzePattern, type RegexFlags, type Match } from "./utils";

interface RegexTestProps {
  pattern: string;
  flags: RegexFlags;
  onPatternChange: (pattern: string) => void;
  onFlagsChange: (flags: RegexFlags) => void;
  onSave?: () => void;
  initialTestString?: string | null;
  onTestStringConsumed?: () => void;
}

export default function RegexTest({
  pattern,
  flags,
  onPatternChange,
  onFlagsChange,
  onSave,
  initialTestString,
  onTestStringConsumed,
}: RegexTestProps) {
  const [testString, setTestString] = useState("");
  const [highlightMode, setHighlightMode] = useState<"inline" | "lines">("inline");
  const [showGroups, setShowGroups] = useState(true);
  const [copiedId, setCopiedId] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add useEffect to handle initial test string
  useEffect(() => {
    if (initialTestString !== null && initialTestString !== undefined) {
      setTestString(initialTestString);
      onTestStringConsumed?.();
    }
  }, [initialTestString, onTestStringConsumed]);

  const result = useMemo(
    () => executePattern(pattern, flags, testString),
    [pattern, flags, testString]
  );

  const analysis = useMemo(() => analyzePattern(pattern), [pattern]);

  const highlightedText = useMemo(() => {
    if (!testString || result.matches.length === 0) return null;

    const parts: Array<{ text: string; match: boolean; matchIndex?: number }> = [];
    let lastIndex = 0;

    result.matches.forEach((m, idx) => {
      if (m.index > lastIndex) {
        parts.push({
          text: testString.slice(lastIndex, m.index),
          match: false,
        });
      }
      parts.push({
        text: m.match,
        match: true,
        matchIndex: idx,
      });
      lastIndex = m.index + m.length;
    });

    if (lastIndex < testString.length) {
      parts.push({
        text: testString.slice(lastIndex),
        match: false,
      });
    }

    return parts;
  }, [testString, result.matches]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      // Silent fail
    }
  }, []);

  const handleCopyAllMatches = useCallback(async () => {
    const text = result.matches.map((m) => m.match).join("\n");
    await handleCopy(text, "all-matches");
  }, [result.matches, handleCopy]);

  const stats = useMemo(() => {
    const totalChars = result.matches.reduce((sum, m) => sum + m.length, 0);
    const uniqueMatches = new Set(result.matches.map((m) => m.match)).size;

    return {
      totalMatches: result.matches.length,
      uniqueMatches,
      totalChars,
      avgLength: result.matches.length > 0 ? (totalChars / result.matches.length).toFixed(1) : 0,
      performance: result.performance.toFixed(2),
    };
  }, [result]);

  return (
    <>
      <div className="rxt-root">
        {/* Pattern Input */}
        <div className="rxt-section">
          <div className="rxt-section-header">
            <div className="rxt-section-title">
              <i className="ti ti-code" />
              Regular Expression
            </div>
            <div className="rxt-section-actions">
              {analysis.valid && pattern && (
                <span className={`rxt-complexity-badge ${analysis.complexity}`}>
                  <i className="ti ti-gauge" />
                  {analysis.complexity}
                </span>
              )}
              {pattern && (
                <>
                  <span className="rxt-meta-text">{pattern.length} chars</span>
                  {onSave && (
                    <button
                      type="button"
                      className="rxt-icon-btn"
                      onClick={onSave}
                      title="Save to library"
                    >
                      <i className="ti ti-bookmark-plus" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="rxt-icon-btn"
                    onClick={() => onPatternChange("")}
                    title="Clear"
                  >
                    <i className="ti ti-x" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rxt-pattern-wrap">
            <span className="rxt-slash">/</span>
            <textarea
              className="rxt-pattern-input"
              value={pattern}
              onChange={(e) => onPatternChange(e.target.value)}
              placeholder="Enter your regex pattern..."
              spellCheck={false}
              rows={2}
            />
            <span className="rxt-slash">
              /
              {Object.entries(flags)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join("")}
            </span>
          </div>

          {/* Analysis Feedback */}
          {pattern && (
            <>
              {result.error && (
                <div className="rxt-error-bar">
                  <i className="ti ti-alert-circle" />
                  <div>
                    <strong>Pattern Error</strong>
                    <span>{result.error}</span>
                  </div>
                </div>
              )}

              {!result.error && analysis.performanceWarnings.length > 0 && (
                <div className="rxt-warning-bar">
                  <i className="ti ti-alert-triangle" />
                  <div>
                    <strong>Performance Warning</strong>
                    <span>{analysis.performanceWarnings[0]}</span>
                  </div>
                </div>
              )}

              {!result.error && analysis.suggestions.length > 0 && (
                <div className="rxt-info-bar">
                  <i className="ti ti-bulb" />
                  <div>
                    <strong>Suggestion</strong>
                    <span>{analysis.suggestions[0]}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Test String Input */}
        <div className="rxt-section">
          <div className="rxt-section-header">
            <div className="rxt-section-title">
              <i className="ti ti-file-text" />
              Test String
            </div>
            <div className="rxt-section-actions">
              {testString && (
                <>
                  <span className="rxt-meta-text">
                    {testString.length} chars · {testString.split("\n").length} lines
                  </span>
                  <button
                    type="button"
                    className="rxt-icon-btn"
                    onClick={() => setTestString("")}
                    title="Clear"
                  >
                    <i className="ti ti-x" />
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className="rxt-textarea"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter or paste text to test against your pattern..."
            spellCheck={false}
            rows={8}
          />
        </div>

        {/* Match Statistics */}
        {testString && pattern && !result.error && (
          <div className="rxt-stats-bar">
            <div className="rxt-stats-grid">
              <div className="rxt-stat">
                <span className="rxt-stat-value">{stats.totalMatches}</span>
                <span className="rxt-stat-label">Matches</span>
              </div>
              <div className="rxt-stat">
                <span className="rxt-stat-value">{stats.uniqueMatches}</span>
                <span className="rxt-stat-label">Unique</span>
              </div>
              <div className="rxt-stat">
                <span className="rxt-stat-value">{stats.avgLength}</span>
                <span className="rxt-stat-label">Avg Length</span>
              </div>
              <div className="rxt-stat">
                <span className="rxt-stat-value">{stats.performance}ms</span>
                <span className="rxt-stat-label">Execution</span>
              </div>
            </div>

            {result.matches.length > 0 && (
              <button
                type="button"
                className={`rxt-copy-all-btn${copiedId === "all-matches" ? " copied" : ""}`}
                onClick={handleCopyAllMatches}
              >
                <i className={`ti ${copiedId === "all-matches" ? "ti-check" : "ti-copy"}`} />
                {copiedId === "all-matches" ? "Copied" : "Copy All"}
              </button>
            )}
          </div>
        )}

        {/* Highlighted Result */}
        {testString && pattern && !result.error && highlightedText && (
          <div className="rxt-section">
            <div className="rxt-section-header">
              <div className="rxt-section-title">
                <i className="ti ti-highlight" />
                Match Highlighting
                {result.matches.length > 0 && (
                  <span className="rxt-match-count-badge">{result.matches.length}</span>
                )}
              </div>
              <div className="rxt-section-actions">
                <div className="rxt-highlight-mode-group">
                  <button
                    type="button"
                    className={`rxt-mode-btn${highlightMode === "inline" ? " active" : ""}`}
                    onClick={() => setHighlightMode("inline")}
                  >
                    <i className="ti ti-text-wrap" />
                    Inline
                  </button>
                  <button
                    type="button"
                    className={`rxt-mode-btn${highlightMode === "lines" ? " active" : ""}`}
                    onClick={() => setHighlightMode("lines")}
                  >
                    <i className="ti ti-list" />
                    Lines
                  </button>
                </div>
              </div>
            </div>

            <div className="rxt-highlight-result">
              {result.matches.length === 0 ? (
                <div className="rxt-no-matches">
                  <i className="ti ti-search-off" />
                  <p>No matches found</p>
                </div>
              ) : highlightMode === "inline" ? (
                <div className="rxt-highlight-inline">
                  {highlightedText.map((part, i) =>
                    part.match ? (
                      <mark
                        key={i}
                        className="rxt-match-highlight"
                        title={`Match ${(part.matchIndex ?? 0) + 1}`}
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    )
                  )}
                </div>
              ) : (
                <div className="rxt-highlight-lines">
                  {testString.split("\n").map((line, lineIdx) => {
                    const lineMatches = result.matches.filter((m) => {
                      const beforeLine = testString.split("\n").slice(0, lineIdx).join("\n");
                      const lineStart = beforeLine.length + (lineIdx > 0 ? 1 : 0);
                      const lineEnd = lineStart + line.length;
                      return m.index >= lineStart && m.index < lineEnd;
                    });

                    return (
                      <div
                        key={lineIdx}
                        className={`rxt-line${lineMatches.length > 0 ? " has-match" : ""}`}
                      >
                        <span className="rxt-line-num">{lineIdx + 1}</span>
                        <span className="rxt-line-text">{line || " "}</span>
                        {lineMatches.length > 0 && (
                          <span className="rxt-line-badge">{lineMatches.length}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matches Table */}
        {result.matches.length > 0 && (
          <div className="rxt-section">
            <div className="rxt-section-header">
              <div className="rxt-section-title">
                <i className="ti ti-table" />
                Match Details
              </div>
              <label className="rxt-toggle-label">
                <input
                  type="checkbox"
                  checked={showGroups}
                  onChange={(e) => setShowGroups(e.target.checked)}
                />
                <span className="rxt-toggle-text">Show groups</span>
              </label>
            </div>

            <div className="rxt-table-wrap">
              <table className="rxt-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Match</th>
                    <th>Position</th>
                    <th>Length</th>
                    <th>Line:Col</th>
                    {showGroups && <th>Groups</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {result.matches.map((match, idx) => (
                    <tr key={idx}>
                      <td className="rxt-td-num">{idx + 1}</td>
                      <td className="rxt-td-match">
                        <code>{match.match}</code>
                      </td>
                      <td className="rxt-td-pos">{match.index}</td>
                      <td className="rxt-td-len">{match.length}</td>
                      <td className="rxt-td-loc">
                        {match.lineNumber}:{match.columnNumber}
                      </td>
                      {showGroups && (
                        <td className="rxt-td-groups">
                          {match.groups.length > 0 ? (
                            <div className="rxt-groups-list">
                              {match.groups.map((g, gIdx) => (
                                <span key={gIdx} className="rxt-group-chip">
                                  {g.name ?? gIdx + 1}: {g.value || "(empty)"}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <em className="rxt-empty">—</em>
                          )}
                        </td>
                      )}
                      <td className="rxt-td-actions">
                        <button
                          type="button"
                          className={`rxt-copy-btn-mini${copiedId === `match-${idx}` ? " copied" : ""}`}
                          onClick={() => handleCopy(match.match, `match-${idx}`)}
                          title="Copy match"
                        >
                          <i
                            className={`ti ${copiedId === `match-${idx}` ? "ti-check" : "ti-copy"}`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
