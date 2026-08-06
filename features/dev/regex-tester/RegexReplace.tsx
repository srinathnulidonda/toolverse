// features/dev/regex-tester/RegexReplace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { performReplace, type RegexFlags } from "./ts/utils";
import styles from "./style/RegexReplace.module.css";

interface RegexReplaceProps {
  pattern: string;
  flags: RegexFlags;
}

export default function RegexReplace({ pattern, flags }: RegexReplaceProps) {
  const [testString, setTestString] = useState("");
  const [replacement, setReplacement] = useState("");
  const [replaceMode, setReplaceMode] = useState<"standard" | "function">("standard");
  const [showDiff, setShowDiff] = useState(true);
  const [copiedKey, setCopiedKey] = useState("");

  const result = useMemo(() => {
    if (!pattern || !testString) {
      return null;
    }
    return performReplace(pattern, flags, testString, replacement);
  }, [pattern, flags, testString, replacement]);

  const diff = useMemo(() => {
    if (!result || result.original === result.replaced) return null;

    const originalLines = result.original.split("\n");
    const replacedLines = result.replaced.split("\n");
    const maxLines = Math.max(originalLines.length, replacedLines.length);

    const diffLines: Array<{
      original: string;
      replaced: string;
      changed: boolean;
      lineNum: number;
    }> = [];

    for (let i = 0; i < maxLines; i++) {
      const orig = originalLines[i] ?? "";
      const repl = replacedLines[i] ?? "";
      diffLines.push({
        original: orig,
        replaced: repl,
        changed: orig !== repl,
        lineNum: i + 1,
      });
    }

    return diffLines;
  }, [result]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      // Silent fail
    }
  }, []);

  const substitutionVars = [
    { var: "$&", desc: "The matched substring" },
    { var: "$`", desc: "String before the match" },
    { var: "$'", desc: "String after the match" },
    { var: "$n", desc: "nth capture group (e.g., $1, $2)" },
    { var: "$<name>", desc: "Named capture group" },
    { var: "$$", desc: "Literal $ character" },
  ];

  return (
    <>
      <div className={styles.rxrRoot}>
        {/* Input Section */}
        <div className={styles.rxrSection}>
          <div className={styles.rxrSectionHeader}>
            <div className={styles.rxrSectionTitle}>
              <i className="ti ti-file-text" />
              Input Text
            </div>
            <div className={styles.rxrSectionActions}>
              {testString && (
                <>
                  <span className={styles.rxrMetaText}>
                    {testString.length} chars · {testString.split("\n").length} lines
                  </span>
                  <button
                    type="button"
                    className={styles.rxrIconBtn}
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
            className={styles.rxrTextarea}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to perform find and replace..."
            spellCheck={false}
            rows={8}
          />
        </div>

        {/* Replacement Section */}
        <div className={styles.rxrSection}>
          <div className={styles.rxrSectionHeader}>
            <div className={styles.rxrSectionTitle}>
              <i className="ti ti-replace" />
              Replacement
            </div>
            <div className={styles.rxrSectionActions}>
              <div className={styles.rxrModeGroup}>
                <button
                  type="button"
                  className={`${styles.rxrModeBtn}${replaceMode === "standard" ? ` ${styles.active}` : ""}`}
                  onClick={() => setReplaceMode("standard")}
                >
                  Text
                </button>
                <button
                  type="button"
                  className={`${styles.rxrModeBtn}${replaceMode === "function" ? ` ${styles.active}` : ""}`}
                  onClick={() => setReplaceMode("function")}
                  title="Advanced: Use function"
                >
                  Function
                </button>
              </div>
            </div>
          </div>

          <div className={styles.rxrReplaceInputWrap}>
            <textarea
              className={`${styles.rxrTextarea} ${styles.rxrReplaceInput}`}
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder={
                replaceMode === "standard"
                  ? "Enter replacement text (use $1, $2 for groups)..."
                  : "Enter replacement function (advanced)..."
              }
              spellCheck={false}
              rows={3}
            />

            {replaceMode === "standard" && (
              <div className={styles.rxrSubstitutionHelp}>
                <div className={styles.rxrHelpTitle}>
                  <i className="ti ti-help-circle" />
                  Substitution Variables
                </div>
                <div className={styles.rxrVarsGrid}>
                  {substitutionVars.map((v) => (
                    <button
                      key={v.var}
                      type="button"
                      className={styles.rxrVarChip}
                      onClick={() => setReplacement((prev) => prev + v.var)}
                      title={v.desc}
                    >
                      <code>{v.var}</code>
                      <span>{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Stats */}
        {result && (
          <div className={styles.rxrStatsBar}>
            <div className={styles.rxrStatsItems}>
              <div className={styles.rxrStat}>
                <i className="ti ti-replace" />
                <span>
                  <strong>{result.replacementCount}</strong> replacement
                  {result.replacementCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className={styles.rxrStat}>
                <i className="ti ti-text-size" />
                <span>
                  {result.original.length} → {result.replaced.length} chars
                </span>
              </div>
              {result.original !== result.replaced && (
                <div className={`${styles.rxrStat} ${styles.rxrStatChange}`}>
                  <i
                    className={`ti ${result.replaced.length > result.original.length ? "ti-arrow-up" : "ti-arrow-down"}`}
                  />
                  <span>{Math.abs(result.replaced.length - result.original.length)} chars</span>
                </div>
              )}
            </div>

            <label className={styles.rxrToggleLabel}>
              <input
                type="checkbox"
                checked={showDiff}
                onChange={(e) => setShowDiff(e.target.checked)}
              />
              <span>Show diff</span>
            </label>
          </div>
        )}

        {/* Result Output */}
        {result && (
          <div className={styles.rxrSection}>
            <div className={styles.rxrSectionHeader}>
              <div className={styles.rxrSectionTitle}>
                <i className="ti ti-check" />
                Result
                {result.replacementCount > 0 && (
                  <span className={styles.rxrCountBadge}>{result.replacementCount}</span>
                )}
              </div>
              <div className={styles.rxrSectionActions}>
                <button
                  type="button"
                  className={`${styles.rxrCopyBtn}${copiedKey === "result" ? ` ${styles.copied}` : ""}`}
                  onClick={() => handleCopy(result.replaced, "result")}
                  disabled={!result.replaced}
                >
                  <i className={`ti ${copiedKey === "result" ? "ti-check" : "ti-copy"}`} />
                  {copiedKey === "result" ? "Copied" : "Copy Result"}
                </button>
              </div>
            </div>

            {showDiff && diff ? (
              <div className={styles.rxrDiffView}>
                <div className={styles.rxrDiffHeader}>
                  <div className={styles.rxrDiffCol}>
                    <span className={`${styles.rxrDiffLabel} ${styles.removed}`}>Original</span>
                  </div>
                  <div className={styles.rxrDiffCol}>
                    <span className={`${styles.rxrDiffLabel} ${styles.added}`}>Replaced</span>
                  </div>
                </div>
                <div className={styles.rxrDiffLines}>
                  {diff.map((line, idx) => (
                    <div key={idx} className={`${styles.rxrDiffRow}${line.changed ? ` ${styles.changed}` : ""}`}>
                      <div className={styles.rxrDiffCol}>
                        <span className={styles.rxrLineNum}>{line.lineNum}</span>
                        <span className={styles.rxrLineText}>
                          {line.original || <span className={styles.rxrEmptyLine}>(empty)</span>}
                        </span>
                      </div>
                      <div className={styles.rxrDiffCol}>
                        <span className={styles.rxrLineNum}>{line.lineNum}</span>
                        <span className={styles.rxrLineText}>
                          {line.replaced || <span className={styles.rxrEmptyLine}>(empty)</span>}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.rxrResultOutput}>
                <pre className={styles.rxrOutputText}>{result.replaced}</pre>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!pattern && (
          <div className={styles.rxrEmpty}>
            <div className={styles.rxrEmptyIcon}>
              <i className="ti ti-replace" />
            </div>
            <p className={styles.rxrEmptyTitle}>Find and Replace with Regex</p>
            <p className={styles.rxrEmptyDesc}>
              Enter a regex pattern above to start finding and replacing text
            </p>
          </div>
        )}
      </div>
    </>
  );
}