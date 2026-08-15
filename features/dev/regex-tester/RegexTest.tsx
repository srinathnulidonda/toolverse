// features/dev/regex-tester/RegexTest.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { executePattern, analyzePattern, type RegexFlags } from "./ts/utils";
import styles from "./style/RegexTest.module.css";

interface RegexTestProps {
  pattern: string;
  flags: RegexFlags;
  onPatternChange: (pattern: string) => void;
  onSave?: () => void;
  initialTestString?: string | null;
  onTestStringConsumed?: () => void;
  onRecordHistory?: (testString: string, matchCount: number) => void;
}

type ResultView = "highlight" | "table";
type MobilePanel = "input" | "results";

export default function RegexTest({
  pattern,
  flags,
  onPatternChange,
  onSave,
  initialTestString,
  onTestStringConsumed,
  onRecordHistory,
}: RegexTestProps) {
  const [testString, setTestString] = useState("");
  const [highlightMode, setHighlightMode] = useState<"inline" | "lines">("inline");
  const [resultView, setResultView] = useState<ResultView>("highlight");
  const [showGroups, setShowGroups] = useState(true);
  const [copiedId, setCopiedId] = useState("");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("input");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTestString !== null && initialTestString !== undefined) {
      setTestString(initialTestString);
      setMobilePanel("results");
      onTestStringConsumed?.();
    }
  }, [initialTestString, onTestStringConsumed]);

  const result = useMemo(
    () => executePattern(pattern, flags, testString),
    [pattern, flags, testString]
  );

  const analysis = useMemo(() => analyzePattern(pattern), [pattern]);

  useEffect(() => {
    if (!pattern.trim() || !testString.trim() || result.error) return;
    const timeout = setTimeout(() => {
      onRecordHistory?.(testString, result.matches.length);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [pattern, testString, result, onRecordHistory]);

  const highlightedText = useMemo(() => {
    if (!testString || result.matches.length === 0) return null;

    const parts: Array<{ text: string; match: boolean; matchIndex?: number }> = [];
    let lastIndex = 0;

    result.matches.forEach((m, idx) => {
      if (m.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, m.index), match: false });
      }
      parts.push({ text: m.match, match: true, matchIndex: idx });
      lastIndex = m.index + m.length;
    });

    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), match: false });
    }

    return parts;
  }, [testString, result.matches]);

  const lineMatchMap = useMemo(() => {
    const map = new Map<number, number>();
    result.matches.forEach((m) => {
      const idx = m.lineNumber - 1;
      map.set(idx, (map.get(idx) ?? 0) + 1);
    });
    return map;
  }, [result.matches]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
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
      avgLength: result.matches.length > 0 ? (totalChars / result.matches.length).toFixed(1) : "0",
      performance: result.performance.toFixed(2),
    };
  }, [result]);

  const goToResults = useCallback(() => {
    setMobilePanel("results");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const goToInput = useCallback(() => {
    setMobilePanel("input");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  return (
    <div className={styles.rxtRoot} ref={rootRef}>
      <div className={styles.rxtTopBar}>
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
            rows={1}
          />
          <span className={styles.rxtSlash}>
            /
            {Object.entries(flags)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join("")}
          </span>
        </div>

        {pattern && result.error && (
          <div className={styles.rxtErrorBar}>
            <i className="ti ti-alert-circle" />
            <div>
              <strong>Pattern Error</strong>
              <span>{result.error}</span>
            </div>
          </div>
        )}

        {pattern && !result.error && analysis.performanceWarnings.length > 0 && (
          <div className={styles.rxtWarningBar}>
            <i className="ti ti-alert-triangle" />
            <div>
              <strong>Performance Warning</strong>
              <span>{analysis.performanceWarnings[0]}</span>
            </div>
          </div>
        )}

        {pattern && !result.error && analysis.suggestions.length > 0 && (
          <div className={styles.rxtInfoBar}>
            <i className="ti ti-bulb" />
            <div>
              <strong>Suggestion</strong>
              <span>{analysis.suggestions[0]}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.rxtMobileSwitcher}>
        <button
          type="button"
          className={`${styles.rxtSwTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
          onClick={goToInput}
        >
          <i className="ti ti-file-text" />
          Test String
        </button>
        <div className={styles.rxtSwDivider} />
        <button
          type="button"
          className={`${styles.rxtSwTab}${mobilePanel === "results" ? ` ${styles.active}` : ""}`}
          onClick={goToResults}
        >
          <i className="ti ti-list-search" />
          Results
          {result.matches.length > 0 && (
            <span className={styles.rxtSwBadge}>{result.matches.length}</span>
          )}
        </button>
      </div>

      <div className={styles.rxtBody}>
        <div
          className={`${styles.rxtPanel} ${mobilePanel === "input" ? styles.mobVisible : styles.mobHidden}`}
        >
          <div className={styles.rxtPanelBar}>
            <div className={styles.rxtPanelLabel}>
              <i className="ti ti-file-text" />
              Test String
            </div>
            <div className={styles.rxtPanelActions}>
              {testString && (
                <>
                  <span className={styles.rxtCharCount}>
                    {testString.length} ch · {testString.split("\n").length} ln
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
            className={styles.rxtTestTextarea}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter or paste text to test against your pattern..."
            spellCheck={false}
          />
          {testString && pattern && (
            <div className={styles.rxtMobCta}>
              <button type="button" className={styles.rxtCtaBtn} onClick={goToResults}>
                <i className="ti ti-list-search" />
                View Results
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          )}
        </div>

        <div className={styles.rxtGutter}>
          <div className={styles.rxtGutterLine} />
          <div className={styles.rxtGutterNode}>
            <i className="ti ti-arrow-right" />
          </div>
          <div className={styles.rxtGutterLine} />
        </div>

        <div
          className={`${styles.rxtPanel} ${mobilePanel === "results" ? styles.mobVisible : styles.mobHidden}`}
        >
          <div className={styles.rxtPanelBar}>
            <div className={styles.rxtPanelLabel}>
              <i className="ti ti-list-search" />
              Results
              {result.matches.length > 0 && (
                <span className={styles.rxtMatchCountBadge}>{result.matches.length}</span>
              )}
            </div>
            <div className={styles.rxtPanelActions}>
              <div className={styles.rxtHighlightModeGroup}>
                <button
                  type="button"
                  className={`${styles.rxtModeBtn}${resultView === "highlight" ? ` ${styles.active}` : ""}`}
                  onClick={() => setResultView("highlight")}
                >
                  <i className="ti ti-highlight" />
                  Highlight
                </button>
                <button
                  type="button"
                  className={`${styles.rxtModeBtn}${resultView === "table" ? ` ${styles.active}` : ""}`}
                  onClick={() => setResultView("table")}
                >
                  <i className="ti ti-table" />
                  Table
                </button>
              </div>
            </div>
          </div>

          {!pattern && (
            <div className={styles.rxtEmptyState}>
              <i className="ti ti-code" />
              <p>Enter a regex pattern to start testing</p>
            </div>
          )}

          {pattern && result.error && (
            <div className={styles.rxtEmptyState}>
              <i className="ti ti-alert-circle" />
              <p>Fix the pattern error to see results</p>
            </div>
          )}

          {pattern && !result.error && !testString && (
            <div className={styles.rxtEmptyState}>
              <i className="ti ti-file-text" />
              <p>Enter a test string to see matches</p>
            </div>
          )}

          {pattern && !result.error && testString && (
            <div className={styles.rxtResultsContent}>
              <div className={styles.rxtStatsStrip}>
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
                    <span className={styles.rxtStatLabel}>Avg Len</span>
                  </div>
                  <div className={styles.rxtStat}>
                    <span className={styles.rxtStatValue}>{stats.performance}ms</span>
                    <span className={styles.rxtStatLabel}>Time</span>
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

              {result.matches.length === 0 ? (
                <div className={styles.rxtNoMatches}>
                  <i className="ti ti-search-off" />
                  <p>No matches found</p>
                </div>
              ) : resultView === "highlight" ? (
                <>
                  <div className={styles.rxtStatsStrip}>
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
                  {highlightMode === "inline" ? (
                    <div className={styles.rxtHighlightInline}>
                      {highlightedText?.map((part, i) =>
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
                    <div>
                      {testString.split("\n").map((line, lineIdx) => {
                        const count = lineMatchMap.get(lineIdx) ?? 0;
                        return (
                          <div
                            key={lineIdx}
                            className={`${styles.rxtLine}${count > 0 ? ` ${styles.hasMatch}` : ""}`}
                          >
                            <span className={styles.rxtLineNum}>{lineIdx + 1}</span>
                            <span className={styles.rxtLineText}>{line || " "}</span>
                            {count > 0 && <span className={styles.rxtLineBadge}>{count}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.rxtStatsStrip}>
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
                          <th>Pos</th>
                          <th>Len</th>
                          <th>Ln:Col</th>
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
                </>
              )}
            </div>
          )}

          <div className={styles.rxtMobActions}>
            <button type="button" className={styles.rxtMobBtn} onClick={goToInput}>
              <i className="ti ti-arrow-left" />
              Edit Test String
            </button>
            {result.matches.length > 0 && (
              <button
                type="button"
                className={`${styles.rxtMobBtn}${copiedId === "mob-all" ? ` ${styles.copied}` : ""}`}
                onClick={async () => {
                  const text = result.matches.map((m) => m.match).join("\n");
                  await handleCopy(text, "mob-all");
                }}
              >
                <i className={`ti ${copiedId === "mob-all" ? "ti-check" : "ti-copy"}`} />
                Copy All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}