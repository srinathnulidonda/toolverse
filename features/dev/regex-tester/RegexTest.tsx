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

      <style jsx>{`
        .rxt-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        .rxt-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rxt-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rxt-section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
        }

        .rxt-section-title i {
          font-size: 14px;
        }

        .rxt-section-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .rxt-complexity-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 22px;
          padding: 0 8px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 600;
          border: 0.5px solid;
        }

        .rxt-complexity-badge.simple {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .rxt-complexity-badge.moderate {
          background: #fef3c7;
          color: #92400e;
          border-color: #fde68a;
        }

        .rxt-complexity-badge.complex {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .rxt-complexity-badge.moderate {
            background: #1f1a08;
            color: #fcd34d;
            border-color: #78350f;
          }
          .rxt-complexity-badge.complex {
            background: #1c0a0a;
            color: #f87171;
            border-color: #7f1d1d;
          }
        }

        .rxt-meta-text {
          font-size: 10px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
        }

        .rxt-icon-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxt-icon-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
          border-color: var(--brand-border);
        }

        .rxt-pattern-wrap {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          transition: border-color 0.12s;
        }

        .rxt-pattern-wrap:focus-within {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .rxt-slash {
          font-family: var(--font-mono);
          font-size: 20px;
          font-weight: 600;
          color: var(--text-tertiary);
          line-height: 1.5;
          flex-shrink: 0;
          user-select: none;
        }

        .rxt-pattern-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: var(--font-mono);
          font-size: 14px;
          line-height: 1.6;
          color: var(--text);
          resize: vertical;
          outline: none;
          min-height: 32px;
        }

        .rxt-pattern-input::placeholder {
          color: var(--text-disabled);
        }

        .rxt-textarea {
          width: 100%;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.7;
          color: var(--text);
          resize: vertical;
          transition: border-color 0.12s;
        }

        .rxt-textarea:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .rxt-textarea::placeholder {
          color: var(--text-disabled);
        }

        .rxt-error-bar,
        .rxt-warning-bar,
        .rxt-info-bar {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 0.5px solid;
        }

        .rxt-error-bar {
          background: var(--error-bg);
          border-color: #fecaca;
        }

        .rxt-error-bar i {
          font-size: 16px;
          color: #dc2626;
          flex-shrink: 0;
          margin-top: 1px;
        }

        @media (prefers-color-scheme: dark) {
          .rxt-error-bar {
            border-color: #7f1d1d;
          }
          .rxt-error-bar i {
            color: #f87171;
          }
        }

        .rxt-error-bar strong {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #991b1b;
          margin-bottom: 2px;
        }

        @media (prefers-color-scheme: dark) {
          .rxt-error-bar strong {
            color: #f87171;
          }
        }

        .rxt-error-bar span {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          line-height: 1.5;
        }

        .rxt-warning-bar {
          background: #fef3c7;
          border-color: #fde68a;
        }

        .rxt-warning-bar i {
          font-size: 16px;
          color: #d97706;
          flex-shrink: 0;
          margin-top: 1px;
        }

        @media (prefers-color-scheme: dark) {
          .rxt-warning-bar {
            background: #1f1a08;
            border-color: #78350f;
          }
          .rxt-warning-bar i {
            color: #fcd34d;
          }
        }

        .rxt-warning-bar strong {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 2px;
        }

        @media (prefers-color-scheme: dark) {
          .rxt-warning-bar strong {
            color: #fcd34d;
          }
        }

        .rxt-warning-bar span {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .rxt-info-bar {
          background: #dbeafe;
          border-color: #bfdbfe;
        }

        .rxt-info-bar i {
          font-size: 16px;
          color: #2563eb;
          flex-shrink: 0;
          margin-top: 1px;
        }

        @media (prefers-color-scheme: dark) {
          .rxt-info-bar {
            background: #0a1628;
            border-color: #1e3a8a;
          }
          .rxt-info-bar i {
            color: #93c5fd;
          }
        }

        .rxt-info-bar strong {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 2px;
        }

        @media (prefers-color-scheme: dark) {
          .rxt-info-bar strong {
            color: #93c5fd;
          }
        }

        .rxt-info-bar span {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .rxt-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          flex-wrap: wrap;
        }

        .rxt-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          flex: 1;
        }

        .rxt-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rxt-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
          line-height: 1;
        }

        .rxt-stat-label {
          font-size: 10px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .rxt-copy-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxt-copy-all-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .rxt-copy-all-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .rxt-match-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 700;
          border: 0.5px solid var(--brand-border);
        }

        .rxt-highlight-mode-group {
          display: flex;
          gap: 2px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 2px;
        }

        .rxt-mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 10px;
          border: none;
          border-radius: calc(var(--radius-md) - 2px);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .rxt-mode-btn i {
          font-size: 12px;
        }

        .rxt-mode-btn:hover {
          color: var(--text);
        }

        .rxt-mode-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .rxt-highlight-result {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .rxt-no-matches {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 48px 24px;
          color: var(--text-disabled);
        }

        .rxt-no-matches i {
          font-size: 32px;
        }

        .rxt-no-matches p {
          font-size: 13px;
          margin: 0;
        }

        .rxt-highlight-inline {
          padding: 16px 18px;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.8;
          color: var(--text);
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 400px;
          overflow-y: auto;
        }

        .rxt-match-highlight {
          background: var(--brand-light);
          color: var(--brand-text);
          border-radius: 3px;
          padding: 2px 4px;
          font-weight: 600;
          border: 1px solid var(--brand-border);
          cursor: help;
        }

        .rxt-highlight-lines {
          max-height: 400px;
          overflow-y: auto;
        }

        .rxt-line {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 18px 6px 12px;
          border-bottom: 0.5px solid var(--border-faint);
          transition: background 0.1s;
        }

        .rxt-line:hover {
          background: var(--bg-surface);
        }

        .rxt-line.has-match {
          background: var(--brand-light);
        }

        .rxt-line-num {
          width: 40px;
          flex-shrink: 0;
          font-size: 11px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          text-align: right;
          user-select: none;
        }

        .rxt-line-text {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text);
          white-space: pre;
        }

        .rxt-line-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          background: var(--brand);
          color: white;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .rxt-toggle-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
        }

        .rxt-toggle-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--brand);
        }

        .rxt-toggle-text {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .rxt-table-wrap {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .rxt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .rxt-table thead th {
          text-align: left;
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-disabled);
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .rxt-table tbody tr {
          transition: background 0.1s;
        }

        .rxt-table tbody tr:hover {
          background: var(--bg-surface);
        }

        .rxt-table td {
          padding: 12px 14px;
          border-bottom: 0.5px solid var(--border-faint);
        }

        .rxt-table tbody tr:last-child td {
          border-bottom: none;
        }

        .rxt-td-num {
          width: 50px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .rxt-td-match code {
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--brand);
          font-weight: 600;
          background: var(--brand-light);
          padding: 3px 6px;
          border-radius: 4px;
          border: 0.5px solid var(--brand-border);
        }

        .rxt-td-pos,
        .rxt-td-len,
        .rxt-td-loc {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text-tertiary);
        }

        .rxt-td-groups {
          max-width: 300px;
        }

        .rxt-groups-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .rxt-group-chip {
          display: inline-flex;
          align-items: center;
          height: 20px;
          padding: 0 7px;
          border-radius: 4px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
          font-size: 10.5px;
          font-family: var(--font-mono);
          white-space: nowrap;
        }

        .rxt-empty {
          color: var(--text-disabled);
          font-size: 11px;
        }

        .rxt-td-actions {
          width: 50px;
          text-align: center;
        }

        .rxt-copy-btn-mini {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-disabled);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition:
            opacity 0.12s,
            color 0.12s;
        }

        .rxt-table tbody tr:hover .rxt-copy-btn-mini {
          opacity: 1;
        }

        .rxt-copy-btn-mini:hover {
          color: var(--brand);
        }

        .rxt-copy-btn-mini.copied {
          opacity: 1;
          color: var(--brand);
        }

        @media (max-width: 768px) {
          .rxt-root {
            padding: 12px;
          }

          .rxt-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .rxt-table-wrap {
            overflow-x: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rxt-icon-btn,
          .rxt-mode-btn,
          .rxt-copy-all-btn,
          .rxt-copy-btn-mini,
          .rxt-line {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
