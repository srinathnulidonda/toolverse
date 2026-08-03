// features/dev/random-string-generator/PatternGenerator.tsx
"use client";

import { useState, useCallback } from "react";
import { generateFromPattern, generateUUID, PATTERN_TEMPLATES, type Pattern } from "./utils";

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
      <div className="pg-root">
        {/*  Pattern Input  */}
        <div className="pg-config">
          <div className="pg-config-section">
            <label className="pg-label">
              Pattern Template
              <span className="pg-label-hint">Use placeholders to define structure</span>
            </label>
            <input
              type="text"
              className="pg-pattern-input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g., XXXX-NNNN-XXXX"
            />
          </div>

          <div className="pg-config-section">
            <label className="pg-label">Pattern Syntax</label>
            <div className="pg-syntax-grid">
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">X</code>
                <span className="pg-syntax-desc">Uppercase letter (A-Z)</span>
              </div>
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">x</code>
                <span className="pg-syntax-desc">Lowercase letter (a-z)</span>
              </div>
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">N</code>
                <span className="pg-syntax-desc">Number (0-9)</span>
              </div>
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">A</code>
                <span className="pg-syntax-desc">Alphanumeric (A-Z, 0-9)</span>
              </div>
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">a</code>
                <span className="pg-syntax-desc">Alphanumeric (a-z, 0-9)</span>
              </div>
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">H</code>
                <span className="pg-syntax-desc">Hexadecimal (0-F)</span>
              </div>
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">*</code>
                <span className="pg-syntax-desc">Any (A-Z, a-z, 0-9)</span>
              </div>
              <div className="pg-syntax-item">
                <code className="pg-syntax-code">-</code>
                <span className="pg-syntax-desc">Literal character</span>
              </div>
            </div>
          </div>

          <div className="pg-config-section">
            <label className="pg-label">Template Presets</label>
            <div className="pg-templates">
              {PATTERN_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="pg-template-btn"
                  onClick={() => loadTemplate(template)}
                >
                  <code className="pg-template-pattern">{template.pattern}</code>
                  <span className="pg-template-desc">{template.description}</span>
                </button>
              ))}
              <button
                type="button"
                className="pg-template-btn"
                onClick={() => {
                  setPattern("uuid");
                  setResults([]);
                }}
              >
                <code className="pg-template-pattern">UUID</code>
                <span className="pg-template-desc">RFC 4122 UUID v4</span>
              </button>
            </div>
          </div>

          <div className="pg-controls">
            <div className="pg-count-control">
              <label className="pg-count-label">Generate</label>
              <input
                type="number"
                className="pg-count-input"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                min="1"
                max="50"
              />
              <span className="pg-count-unit">strings</span>
            </div>
            <button type="button" className="pg-generate-btn" onClick={handleGenerate}>
              <i className="ti ti-wand" />
              Generate
            </button>
          </div>
        </div>

        {/*  Results  */}
        <div className="pg-results-panel">
          {results.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon">
                <i className="ti ti-template" />
              </div>
              <p className="pg-empty-title">Pattern-Based Generation</p>
              <p className="pg-empty-desc">
                Define a custom pattern using placeholders to generate structured strings like
                license keys, product codes, or identifiers.
              </p>
              <div className="pg-empty-example">
                <span className="pg-empty-example-label">Example:</span>
                <code>XXXX-NNNN-XXXX</code>
                <span>→</span>
                <code>ABCD-1234-EFGH</code>
              </div>
            </div>
          ) : (
            <div className="pg-results">
              <div className="pg-results-header">
                <div className="pg-results-title">
                  <i className="ti ti-check" />
                  Generated from pattern: <code>{pattern}</code>
                </div>
              </div>
              <div className="pg-results-list">
                {results.map((result, idx) => (
                  <div key={idx} className="pg-result-card">
                    <span className="pg-result-index">#{idx + 1}</span>
                    <div className="pg-result-value">{result}</div>
                    <button
                      type="button"
                      className={`pg-copy-btn${copiedIndex === idx ? " copied" : ""}`}
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
