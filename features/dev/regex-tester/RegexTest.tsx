// features/dev/regex-tester/RegexTest.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { executePattern, analyzePattern, type RegexFlags, type Match } from "./ts/utils";
import styles from "./style/RegexTest.module.css";

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
      <div className={styles.rxtRoot}>
        {/* Pattern Input */}
        <div className={styles.rxtSection}>
          <div className={styles.rxtSectionHeader}>
            <div className={styles.rxtSectionTitle}>
              <i className="ti ti-code" />
              Regular Expression
            </div>
            <div className={styles.rxtSectionActions}>
              {analysis.valid && pattern && (
                <span className={`${styles.rxtComplexityBadge} ${styles[analysis.complexity]}`}>
                  <i className="ti ti-gauge" />
                  {analysis.complexity}
                </span>
              )}
              {pattern && (
                <>
                  <span className={styles.rxtMetaText}>{pattern.length} chars</span>
                  {onSave && (
                    <button
                      type="button"
                      className={styles.rxtIconBtn}
                      onClick={onSave}
                      title="Save to library"
                    >
                      <i className="ti ti-bookmark-plus" />
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.rxtIconBtn}
                    onClick={() => onPatternChange("")}
                    title="Clear"
                  >
                    <i className="ti ti-x" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={styles.rxtPatternWrap}>
            <span className={styles.rxtSlash}>/</span>
            <textarea
              className={styles.rxtPatternInput}
              value={pattern}
              onChange={(e) => onPatternChange(e.target.value)}
              placeholder="Enter your regex pattern..."
              spellCheck={false}
              rows={2}
            />
            <span className={styles.rxtSlash}>
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
                <div className={styles.rxtErrorBar}>
                  <i className="ti ti-alert-circle" />
                  <div>
                    <strong>Pattern Error</strong>
                    <span>{result.error}</span>
                  </div>
                </div>
              )}

              {!result.error && analysis.performanceWarnings.length > 0 && (
                <div className={styles.rxtWarningBar}>
                  <i className="ti ti-alert-triangle" />
                  <div>
                    <strong>Performance Warning</strong>
                    <span>{analysis.performanceWarnings[0]}</span>
                  </div>
                </div>
              )}

              {!result.error && analysis.suggestions.length > 0 && (
                <div className={styles.rxtInfoBar}>
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
        <div className={styles.rxtSection}>
          <div className={styles.rxtSectionHeader}>
            <div className={styles.rxtSectionTitle}>
              <i className="ti ti-file-text" />
              Test String
            </div>
            <div className={styles.rxtSectionActions}>
              {testString && (
                <>
                  <span className={styles.rxtMetaText}>
                    {testString.length} chars · {testString.split("\n").length} lines
                  </span>
                  <button
                    type="button"
                    className={styles.rxtIconBtn}
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
            className={styles.rxtTextarea}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter or paste text to test against your pattern..."
            spellCheck={false}
            rows={8}
          />
        </div>

        {/* Match Statistics */}
        {testString && pattern && !result.error && (
          <div className={styles.rxtStatsBar}>
            <div className={styles.rxtStatsGrid}>
              <div className={styles.rxtStat}>
                <span className={styles.rxtStatValue}>{stats.totalMatches}</span>
                <span className={styles.rxtStatLabel}>Matches</span>
              </div>
              <div className={styles.rxtStat}>
                <span className={styles.rxtStatValue}>{stats.uniqueMatches}</span>
                <span className={styles.rxtStatLabel}>Unique</span>
              </div>
              <div className={styles.rxtStat}>
                <span className={styles.rxtStatValue}>{stats.avgLength}</span>
                <span className={styles.rxtStatLabel}>Avg Length</span>
              </div>
              <div className={styles.rxtStat}>
                <span className={styles.rxtStatValue}>{stats.performance}ms</span>
                <span className={styles.rxtStatLabel}>Execution</span>
              </div>
            </div>

            {result.matches.length > 0 && (
              <button
                type="button"
                className={`${styles.rxtCopyAllBtn}${copiedId === "all-matches" ? ` ${styles.copied}` : ""}`}
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
          <div className={styles.rxtSection}>
            <div className={styles.rxtSectionHeader}>
              <div className={styles.rxtSectionTitle}>
                <i className="ti ti-highlight" />
                Match Highlighting
                {result.matches.length > 0 && (
                  <span className={styles.rxtMatchCountBadge}>{result.matches.length}</span>
                )}
              </div>
              <div className={styles.rxtSectionActions}>
                <div className={styles.rxtHighlightModeGroup}>
                  <button
                    type="button"
                    className={`${styles.rxtModeBtn}${highlightMode === "inline" ? ` ${styles.active}` : ""}`}
                    onClick={() => setHighlightMode("inline")}
                  >
                    <i className="ti ti-text-wrap" />
                    Inline
                  </button>
                  <button
                    type="button"
                    className={`${styles.rxtModeBtn}${highlightMode === "lines" ? ` ${styles.active}` : ""}`}
                    onClick={() => setHighlightMode("lines")}
                  >
                    <i className="ti ti-list" />
                    Lines
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.rxtHighlightResult}>
              {result.matches.length === 0 ? (
                <div className={styles.rxtNoMatches}>
                  <i className="ti ti-search-off" />
                  <p>No matches found</p>
                </div>
              ) : highlightMode === "inline" ? (
                <div className={styles.rxtHighlightInline}>
                  {highlightedText.map((part, i) =>
                    part.match ? (
                      <mark
                        key={i}
                        className={styles.rxtMatchHighlight}
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
                <div className={styles.rxtHighlightLines}>
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
                        className={`${styles.rxtLine}${lineMatches.length > 0 ? ` ${styles.hasMatch}` : ""}`}
                      >
                        <span className={styles.rxtLineNum}>{lineIdx + 1}</span>
                        <span className={styles.rxtLineText}>{line || " "}</span>
                        {lineMatches.length > 0 && (
                          <span className={styles.rxtLineBadge}>{lineMatches.length}</span>
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
          <div className={styles.rxtSection}>
            <div className={styles.rxtSectionHeader}>
              <div className={styles.rxtSectionTitle}>
                <i className="ti ti-table" />
                Match Details
              </div>
              <label className={styles.rxtToggleLabel}>
                <input
                  type="checkbox"
                  checked={showGroups}
                  onChange={(e) => setShowGroups(e.target.checked)}
                />
                <span className={styles.rxtToggleText}>Show groups</span>
              </label>
            </div>

            <div className={styles.rxtTableWrap}>
              <table className={styles.rxtTable}>
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
                      <td className={styles.rxtTdNum}>{idx + 1}</td>
                      <td className={styles.rxtTdMatch}>
                        <code>{match.match}</code>
                      </td>
                      <td className={styles.rxtTdPos}>{match.index}</td>
                      <td className={styles.rxtTdLen}>{match.length}</td>
                      <td className={styles.rxtTdLoc}>
                        {match.lineNumber}:{match.columnNumber}
                      </td>
                      {showGroups && (
                        <td className={styles.rxtTdGroups}>
                          {match.groups.length > 0 ? (
                            <div className={styles.rxtGroupsList}>
                              {match.groups.map((g, gIdx) => (
                                <span key={gIdx} className={styles.rxtGroupChip}>
                                  {g.name ?? gIdx + 1}: {g.value || "(empty)"}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <em className={styles.rxtEmpty}>—</em>
                          )}
                        </td>
                      )}
                      <td className={styles.rxtTdActions}>
                        <button
                          type="button"
                          className={`${styles.rxtCopyBtnMini}${copiedId === `match-${idx}` ? ` ${styles.copied}` : ""}`}
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