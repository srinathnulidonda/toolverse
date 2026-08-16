// features/dev/regex-tester/RegexReplace.tsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { performReplace, type RegexFlags } from "./ts/utils";
import styles from "./style/RegexReplace.module.css";

interface RegexReplaceProps {
  pattern: string;
  flags: RegexFlags;
}

type MobilePanel = "input" | "results";

const SUBSTITUTION_VARS = [
  { var: "$&", desc: "The matched substring" },
  { var: "$`", desc: "String before the match" },
  { var: "$'", desc: "String after the match" },
  { var: "$1", desc: "1st capture group" },
  { var: "$<name>", desc: "Named capture group" },
  { var: "$$", desc: "Literal $ character" },
];

export default function RegexReplace({ pattern, flags }: RegexReplaceProps) {
  const [testString, setTestString] = useState("");
  const [replacement, setReplacement] = useState("");
  const [showDiff, setShowDiff] = useState(true);
  const [copiedKey, setCopiedKey] = useState("");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("input");
  const rootRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    return performReplace(pattern, flags, testString, replacement);
  }, [pattern, flags, testString, replacement]);

  const diff = useMemo(() => {
    if (!result || result.error || result.original === result.replaced) return null;

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
      setCopiedKey("");
    }
  }, []);

  const goToResults = useCallback(() => {
    setMobilePanel("results");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const goToInput = useCallback(() => {
    setMobilePanel("input");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  return (
    <div className={styles.rxrRoot} ref={rootRef}>
      <div className={styles.rxrMobileSwitcher}>
        <button
          type="button"
          className={`${styles.rxrSwTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
          onClick={goToInput}
        >
          <i className="ti ti-file-text" />
          Input
        </button>
        <div className={styles.rxrSwDivider} />
        <button
          type="button"
          className={`${styles.rxrSwTab}${mobilePanel === "results" ? ` ${styles.active}` : ""}`}
          onClick={goToResults}
        >
          <i className="ti ti-replace" />
          Result
          {result && !result.error && result.replacementCount > 0 && (
            <span className={styles.rxrSwBadge}>{result.replacementCount}</span>
          )}
        </button>
      </div>

      <div className={styles.rxrBody}>
        <div
          className={`${styles.rxrPanel} ${mobilePanel === "input" ? styles.mobVisible : styles.mobHidden}`}
        >
          <div className={styles.rxrPanelBar}>
            <div className={styles.rxrPanelLabel}>
              <i className="ti ti-file-text" />
              Input &amp; Replacement
            </div>
            {pattern && (
              <span className={styles.rxrCharCount}>Using pattern from Test tab</span>
            )}
          </div>

          <div className={styles.rxrPanelScroll}>
            <div className={styles.rxrFieldGroup}>
              <div className={styles.rxrFieldHeader}>
                <span className={styles.rxrFieldLabel}>
                  <i className="ti ti-file-text" />
                  Input Text
                </span>
                {testString && (
                  <button
                    type="button"
                    className={styles.rxrIconBtn}
                    onClick={() => setTestString("")}
                    title="Clear"
                  >
                    <i className="ti ti-x" />
                  </button>
                )}
              </div>
              <textarea
                className={styles.rxrFieldTextarea}
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to perform find and replace..."
                spellCheck={false}
                rows={7}
              />
            </div>

            <div className={styles.rxrFieldGroup}>
              <div className={styles.rxrFieldHeader}>
                <span className={styles.rxrFieldLabel}>
                  <i className="ti ti-replace" />
                  Replacement
                </span>
              </div>
              <textarea
                className={styles.rxrFieldTextarea}
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="Enter replacement text (use $1, $2 for groups)..."
                spellCheck={false}
                rows={3}
              />

              <div className={styles.rxrSubstitutionHelp}>
                <div className={styles.rxrHelpTitle}>
                  <i className="ti ti-help-circle" />
                  Substitution Variables
                </div>
                <div className={styles.rxrVarsGrid}>
                  {SUBSTITUTION_VARS.map((v) => (
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
            </div>
          </div>

          {testString && pattern && (
            <div className={styles.rxrMobCta}>
              <button type="button" className={styles.rxrCtaBtn} onClick={goToResults}>
                <i className="ti ti-replace" />
                View Result
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          )}
        </div>

        <div className={styles.rxrGutter}>
          <div className={styles.rxrGutterLine} />
          <div className={styles.rxrGutterNode}>
            <i className="ti ti-arrow-right" />
          </div>
          <div className={styles.rxrGutterLine} />
        </div>

        <div
          className={`${styles.rxrPanel} ${mobilePanel === "results" ? styles.mobVisible : styles.mobHidden}`}
        >
          <div className={styles.rxrPanelBar}>
            <div className={styles.rxrPanelLabel}>
              <i className="ti ti-check" />
              Result
              {result && !result.error && result.replacementCount > 0 && (
                <span className={styles.rxrCountBadge}>{result.replacementCount}</span>
              )}
            </div>
            {result && !result.error && (
              <label className={styles.rxrToggleLabel}>
                <input
                  type="checkbox"
                  checked={showDiff}
                  onChange={(e) => setShowDiff(e.target.checked)}
                />
                <span>Show diff</span>
              </label>
            )}
          </div>

          {!pattern && (
            <div className={styles.rxrEmptyState}>
              <i className="ti ti-replace" />
              <p>Enter a regex pattern in the Test tab to enable find and replace</p>
            </div>
          )}

          {pattern && !testString && (
            <div className={styles.rxrEmptyState}>
              <i className="ti ti-file-text" />
              <p>Enter input text on the left to see the replacement result</p>
            </div>
          )}

          {pattern && testString && result?.error && (
            <div className={`${styles.rxrEmptyState} ${styles.rxrErrorState}`}>
              <i className="ti ti-alert-circle" />
              <p>{result.error}</p>
            </div>
          )}

          {pattern && testString && result && !result.error && (
            <div className={styles.rxrResultsContent}>
              <div className={styles.rxrStatsStrip}>
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

                <button
                  type="button"
                  className={`${styles.rxrCopyBtn}${copiedKey === "result" ? ` ${styles.copied}` : ""}`}
                  onClick={() => handleCopy(result.replaced, "result")}
                  disabled={!result.replaced}
                >
                  <i className={`ti ${copiedKey === "result" ? "ti-check" : "ti-copy"}`} />
                  {copiedKey === "result" ? "Copied" : "Copy"}
                </button>
              </div>

              {showDiff && diff ? (
                <>
                  <div className={styles.rxrDiffHeader}>
                    <div className={styles.rxrDiffCol}>
                      <span className={`${styles.rxrDiffLabel} ${styles.removed}`}>Original</span>
                    </div>
                    <div className={styles.rxrDiffCol}>
                      <span className={`${styles.rxrDiffLabel} ${styles.added}`}>Replaced</span>
                    </div>
                  </div>
                  {diff.map((line, idx) => (
                    <div
                      key={idx}
                      className={`${styles.rxrDiffRow}${line.changed ? ` ${styles.changed}` : ""}`}
                    >
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
                </>
              ) : (
                <pre className={styles.rxrOutputText}>{result.replaced}</pre>
              )}
            </div>
          )}

          <div className={styles.rxrMobActions}>
            <button type="button" className={styles.rxrMobBtn} onClick={goToInput}>
              <i className="ti ti-arrow-left" />
              Edit Input
            </button>
            {result && !result.error && result.replaced && (
              <button
                type="button"
                className={`${styles.rxrMobBtn}${copiedKey === "mob-result" ? ` ${styles.copied}` : ""}`}
                onClick={() => handleCopy(result.replaced, "mob-result")}
              >
                <i className={`ti ${copiedKey === "mob-result" ? "ti-check" : "ti-copy"}`} />
                Copy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}