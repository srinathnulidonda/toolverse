// features/dev/regex-tester/RegexReplace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { performReplace, type RegexFlags } from "./utils";

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
      <div className="rxr-root">
        {/* Input Section */}
        <div className="rxr-section">
          <div className="rxr-section-header">
            <div className="rxr-section-title">
              <i className="ti ti-file-text" />
              Input Text
            </div>
            <div className="rxr-section-actions">
              {testString && (
                <>
                  <span className="rxr-meta-text">
                    {testString.length} chars · {testString.split("\n").length} lines
                  </span>
                  <button
                    type="button"
                    className="rxr-icon-btn"
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
            className="rxr-textarea"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to perform find and replace..."
            spellCheck={false}
            rows={8}
          />
        </div>

        {/* Replacement Section */}
        <div className="rxr-section">
          <div className="rxr-section-header">
            <div className="rxr-section-title">
              <i className="ti ti-replace" />
              Replacement
            </div>
            <div className="rxr-section-actions">
              <div className="rxr-mode-group">
                <button
                  type="button"
                  className={`rxr-mode-btn${replaceMode === "standard" ? " active" : ""}`}
                  onClick={() => setReplaceMode("standard")}
                >
                  Text
                </button>
                <button
                  type="button"
                  className={`rxr-mode-btn${replaceMode === "function" ? " active" : ""}`}
                  onClick={() => setReplaceMode("function")}
                  title="Advanced: Use function"
                >
                  Function
                </button>
              </div>
            </div>
          </div>

          <div className="rxr-replace-input-wrap">
            <textarea
              className="rxr-textarea rxr-replace-input"
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
              <div className="rxr-substitution-help">
                <div className="rxr-help-title">
                  <i className="ti ti-help-circle" />
                  Substitution Variables
                </div>
                <div className="rxr-vars-grid">
                  {substitutionVars.map((v) => (
                    <button
                      key={v.var}
                      type="button"
                      className="rxr-var-chip"
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
          <div className="rxr-stats-bar">
            <div className="rxr-stats-items">
              <div className="rxr-stat">
                <i className="ti ti-replace" />
                <span>
                  <strong>{result.replacementCount}</strong> replacement
                  {result.replacementCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="rxr-stat">
                <i className="ti ti-text-size" />
                <span>
                  {result.original.length} → {result.replaced.length} chars
                </span>
              </div>
              {result.original !== result.replaced && (
                <div className="rxr-stat rxr-stat-change">
                  <i
                    className={`ti ${result.replaced.length > result.original.length ? "ti-arrow-up" : "ti-arrow-down"}`}
                  />
                  <span>{Math.abs(result.replaced.length - result.original.length)} chars</span>
                </div>
              )}
            </div>

            <label className="rxr-toggle-label">
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
          <div className="rxr-section">
            <div className="rxr-section-header">
              <div className="rxr-section-title">
                <i className="ti ti-check" />
                Result
                {result.replacementCount > 0 && (
                  <span className="rxr-count-badge">{result.replacementCount}</span>
                )}
              </div>
              <div className="rxr-section-actions">
                <button
                  type="button"
                  className={`rxr-copy-btn${copiedKey === "result" ? " copied" : ""}`}
                  onClick={() => handleCopy(result.replaced, "result")}
                  disabled={!result.replaced}
                >
                  <i className={`ti ${copiedKey === "result" ? "ti-check" : "ti-copy"}`} />
                  {copiedKey === "result" ? "Copied" : "Copy Result"}
                </button>
              </div>
            </div>

            {showDiff && diff ? (
              <div className="rxr-diff-view">
                <div className="rxr-diff-header">
                  <div className="rxr-diff-col">
                    <span className="rxr-diff-label removed">Original</span>
                  </div>
                  <div className="rxr-diff-col">
                    <span className="rxr-diff-label added">Replaced</span>
                  </div>
                </div>
                <div className="rxr-diff-lines">
                  {diff.map((line, idx) => (
                    <div key={idx} className={`rxr-diff-row${line.changed ? " changed" : ""}`}>
                      <div className="rxr-diff-col">
                        <span className="rxr-line-num">{line.lineNum}</span>
                        <span className="rxr-line-text">
                          {line.original || <span className="rxr-empty-line">(empty)</span>}
                        </span>
                      </div>
                      <div className="rxr-diff-col">
                        <span className="rxr-line-num">{line.lineNum}</span>
                        <span className="rxr-line-text">
                          {line.replaced || <span className="rxr-empty-line">(empty)</span>}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rxr-result-output">
                <pre className="rxr-output-text">{result.replaced}</pre>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!pattern && (
          <div className="rxr-empty">
            <div className="rxr-empty-icon">
              <i className="ti ti-replace" />
            </div>
            <p className="rxr-empty-title">Find and Replace with Regex</p>
            <p className="rxr-empty-desc">
              Enter a regex pattern above to start finding and replacing text
            </p>
          </div>
        )}
      </div>
    </>
  );
}
