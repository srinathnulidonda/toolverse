// features/dev/random-string-generator/PatternGenerator.tsx
"use client";

import { useState, useCallback } from "react";
import { generateFromPattern, generateUUID, PATTERN_TEMPLATES, type Pattern } from "./ts/utils";
import styles from "./style/PatternGenerator.module.css";

interface PatternGeneratorProps {
  onGenerate?: (value: string) => void;
}

export default function PatternGenerator({ onGenerate }: PatternGeneratorProps) {
  const [pattern, setPattern] = useState("XXXX-NNNN-XXXX");
  const [count, setCount] = useState(5);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = useCallback(() => {
    const newResults = Array.from({ length: count }, () => {
      // Special handling for UUID
      if (pattern.toLowerCase() === "uuid") {
        return generateUUID();
      }
      return generateFromPattern(pattern);
    });
    setResults(newResults);

    if (onGenerate && newResults.length > 0) {
      onGenerate(newResults[0]);
    }
  }, [pattern, count, onGenerate]);

  const handleCopy = useCallback(async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Silent fail
    }
  }, []);

  const loadTemplate = useCallback((template: Pattern) => {
    setPattern(template.pattern);
    setResults([]);
  }, []);

  return (
    <>
      <div className={styles.pgRoot}>
        {/*  Pattern Input  */}
        <div className={styles.pgConfig}>
          <div className={styles.pgConfigSection}>
            <label className={styles.pgLabel}>
              Pattern Template
              <span className={styles.pgLabelHint}>Use placeholders to define structure</span>
            </label>
            <input
              type="text"
              className={styles.pgPatternInput}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g., XXXX-NNNN-XXXX"
            />
          </div>

          <div className={styles.pgConfigSection}>
            <label className={styles.pgLabel}>Pattern Syntax</label>
            <div className={styles.pgSyntaxGrid}>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>X</code>
                <span className={styles.pgSyntaxDesc}>Uppercase letter (A-Z)</span>
              </div>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>x</code>
                <span className={styles.pgSyntaxDesc}>Lowercase letter (a-z)</span>
              </div>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>N</code>
                <span className={styles.pgSyntaxDesc}>Number (0-9)</span>
              </div>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>A</code>
                <span className={styles.pgSyntaxDesc}>Alphanumeric (A-Z, 0-9)</span>
              </div>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>a</code>
                <span className={styles.pgSyntaxDesc}>Alphanumeric (a-z, 0-9)</span>
              </div>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>H</code>
                <span className={styles.pgSyntaxDesc}>Hexadecimal (0-F)</span>
              </div>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>*</code>
                <span className={styles.pgSyntaxDesc}>Any (A-Z, a-z, 0-9)</span>
              </div>
              <div className={styles.pgSyntaxItem}>
                <code className={styles.pgSyntaxCode}>-</code>
                <span className={styles.pgSyntaxDesc}>Literal character</span>
              </div>
            </div>
          </div>

          <div className={styles.pgConfigSection}>
            <label className={styles.pgLabel}>Template Presets</label>
            <div className={styles.pgTemplates}>
              {PATTERN_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.pgTemplateBtn}
                  onClick={() => loadTemplate(template)}
                >
                  <code className={styles.pgTemplatePattern}>{template.pattern}</code>
                  <span className={styles.pgTemplateDesc}>{template.description}</span>
                </button>
              ))}
              <button
                type="button"
                className={styles.pgTemplateBtn}
                onClick={() => {
                  setPattern("uuid");
                  setResults([]);
                }}
              >
                <code className={styles.pgTemplatePattern}>UUID</code>
                <span className={styles.pgTemplateDesc}>RFC 4122 UUID v4</span>
              </button>
            </div>
          </div>

          <div className={styles.pgControls}>
            <div className={styles.pgCountControl}>
              <label className={styles.pgCountLabel}>Generate</label>
              <input
                type="number"
                className={styles.pgCountInput}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                min="1"
                max="50"
              />
              <span className={styles.pgCountUnit}>strings</span>
            </div>
            <button type="button" className={styles.pgGenerateBtn} onClick={handleGenerate}>
              <i className="ti ti-wand" />
              Generate
            </button>
          </div>
        </div>

        {/*  Results  */}
        <div className={styles.pgResultsPanel}>
          {results.length === 0 ? (
            <div className={styles.pgEmpty}>
              <div className={styles.pgEmptyIcon}>
                <i className="ti ti-template" />
              </div>
              <p className={styles.pgEmptyTitle}>Pattern-Based Generation</p>
              <p className={styles.pgEmptyDesc}>
                Define a custom pattern using placeholders to generate structured strings like
                license keys, product codes, or identifiers.
              </p>
              <div className={styles.pgEmptyExample}>
                <span className={styles.pgEmptyExampleLabel}>Example:</span>
                <code>XXXX-NNNN-XXXX</code>
                <span>→</span>
                <code>ABCD-1234-EFGH</code>
              </div>
            </div>
          ) : (
            <div className={styles.pgResults}>
              <div className={styles.pgResultsHeader}>
                <div className={styles.pgResultsTitle}>
                  <i className="ti ti-check" />
                  Generated from pattern: <code>{pattern}</code>
                </div>
              </div>
              <div className={styles.pgResultsList}>
                {results.map((result, idx) => (
                  <div key={idx} className={styles.pgResultCard}>
                    <span className={styles.pgResultIndex}>#{idx + 1}</span>
                    <div className={styles.pgResultValue}>{result}</div>
                    <button
                      type="button"
                      className={`${styles.pgCopyBtn}${copiedIndex === idx ? ` ${styles.copied}` : ""}`}
                      onClick={() => handleCopy(result, idx)}
                    >
                      <i className={`ti ${copiedIndex === idx ? "ti-check" : "ti-copy"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}